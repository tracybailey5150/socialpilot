import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getTodaysTopics } from '@/lib/content-calendar';

export const maxDuration = 300;

const SYSTEM_PROMPT = `You are an elite social media strategist. Create a single high-performing social media post. Return ONLY valid JSON: {"text": "post content with hashtags included at the end"}`;

async function generatePost(topic: string, tone: string, platform: string): Promise<string | null> {
  const prompt = `Write one ${tone} social media post about: "${topic}"\n\nPlatform: ${platform}\nInclude 3-5 relevant hashtags at the end.\nKeep it authentic, not salesy.`;

  // Try OpenAI first
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-5.4',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          max_completion_tokens: 500,
          temperature: 0.85,
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content || '';
        const parsed = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
        return parsed.text;
      }
    } catch { /* fall through */ }
  }

  // Fallback: Anthropic
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.85,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const raw = data.content?.[0]?.text || '';
        const parsed = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
        return parsed.text;
      }
    } catch { /* fall through */ }
  }

  return null;
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the owner's user ID (first profile in the system)
  const ownerId = process.env.OWNER_USER_ID;
  if (!ownerId) {
    return Response.json({ error: 'OWNER_USER_ID not configured' }, { status: 500 });
  }

  // Get today's topics from the content calendar rotation
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const topics = getTodaysTopics(dayOfYear, 4);

  // Schedule times: 9am, 12pm, 3pm, 6pm CT (UTC-5 in summer = UTC-6 in winter)
  const ctOffset = -5; // CDT
  const scheduleTimes = [9, 12, 15, 18];
  const today = now.toISOString().split('T')[0];

  const results: string[] = [];

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const hour = scheduleTimes[i] || 12;
    const scheduledAt = new Date(`${today}T${String(hour - ctOffset).padStart(2, '0')}:00:00Z`);

    // Skip if scheduled time is already past
    if (scheduledAt <= now) continue;

    // Generate the post content via AI
    const platform = topic.platforms[0] || 'facebook';
    const text = await generatePost(topic.topic, topic.tone, platform);
    if (!text) {
      results.push(`SKIP: Failed to generate for "${topic.topic.slice(0, 40)}..."`);
      continue;
    }

    // Save as scheduled post
    const { error } = await supabaseAdmin.from('posts').insert({
      user_id: ownerId,
      content: text,
      platforms: topic.platforms,
      status: 'scheduled',
      scheduled_at: scheduledAt.toISOString(),
    });

    if (error) {
      results.push(`ERROR: ${error.message}`);
    } else {
      results.push(`SCHEDULED: [${topic.brand}] ${platform} at ${hour}:00 CT`);
    }
  }

  return Response.json({
    ok: true,
    timestamp: now.toISOString(),
    generated: results.length,
    details: results,
  });
}
