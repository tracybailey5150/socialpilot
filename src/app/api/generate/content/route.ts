export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an elite social media strategist and copywriter. You craft viral, platform-optimized content that drives engagement. You understand algorithms, audience psychology, and what makes people stop scrolling. Always return valid JSON only.`;

function buildUserPrompt(topic: string, tone: string, platform: string, contentType: string): string {
  return `Create 5 high-performing social media post variations about "${topic}".

Requirements:
- Tone: ${tone}
- Platform: ${platform} (optimize length, style, and formatting for this platform's algorithm)
- Content Type: ${contentType}
- Each variation must be genuinely different in angle, hook, and structure
- Include 3-5 highly relevant, trending hashtags per post
- Use proven engagement patterns: hooks, questions, CTAs, storytelling, lists
- For Twitter: keep under 280 chars. For LinkedIn: professional long-form. For Instagram: visual-first with emoji. For Facebook: conversational with engagement bait.

Return ONLY this exact JSON structure, no other text:
{"posts": [{"text": "post content", "hashtags": ["#tag1", "#tag2", "#tag3"]}]}`;
}

function cleanJsonResponse(raw: string): string {
  return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

async function generateWithOpenAI(prompt: string): Promise<{ posts: Array<{ text: string; hashtags: string[] }>; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5.5',
      instructions: SYSTEM_PROMPT,
      input: prompt,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${err}`);
  }

  const data = await response.json();

  // Responses API returns output array with message items
  let raw = '';
  for (const item of data.output || []) {
    if (item.type === 'message') {
      for (const content of item.content || []) {
        if (content.type === 'output_text') {
          raw += content.text;
        }
      }
    }
  }

  if (!raw) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(cleanJsonResponse(raw));
  return { ...parsed, model: 'GPT-4.1' };
}

async function generateWithAnthropic(prompt: string): Promise<{ posts: Array<{ text: string; hashtags: string[] }>; model: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text || '';

  if (!raw) throw new Error('Empty response from Anthropic');

  const parsed = JSON.parse(cleanJsonResponse(raw));
  return { ...parsed, model: 'Claude Sonnet 4.6' };
}

export async function POST(req: NextRequest) {
  try {
    const { topic, tone, platform, contentType } = await req.json();
    const prompt = buildUserPrompt(topic, tone, platform, contentType);

    // Primary: OpenAI GPT-4.1 — Fallback: Anthropic Claude Sonnet 4.6
    let result;
    try {
      result = await generateWithOpenAI(prompt);
    } catch (openaiErr) {
      console.error('OpenAI failed, falling back to Anthropic:', openaiErr);
      try {
        result = await generateWithAnthropic(prompt);
      } catch (anthropicErr) {
        console.error('Anthropic fallback also failed:', anthropicErr);
        return NextResponse.json({ error: 'All AI providers failed. Check API keys.' }, { status: 500 });
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Generate content error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
