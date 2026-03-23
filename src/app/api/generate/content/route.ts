export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, tone, platform, contentType } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const prompt = `Generate 5 social media post variations about "${topic}". Tone: ${tone}. Optimized for ${platform}. Type: ${contentType}. 
Return a JSON array of exactly 5 objects with this structure: {"posts": [{"text": "post content here", "hashtags": ["#tag1", "#tag2", "#tag3"]}]}
Make each variation distinct. Include 3-5 relevant hashtags per post. Return only valid JSON, no other text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a social media content expert. Always return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('AI error:', err);
      return NextResponse.json({ error: 'AI API error' }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '{"posts":[]}';

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Generate content error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
