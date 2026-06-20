export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// POST /api/comments/ai-reply — generate an AI reply suggestion for a comment
export async function POST(req: NextRequest) {
  try {
    const { commentText, authorName, platform } = await req.json();

    if (!commentText?.trim()) {
      return NextResponse.json({ error: 'commentText is required' }, { status: 400 });
    }

    const prompt = `You are a friendly, professional social media manager. Generate a thoughtful reply to this ${platform || 'social media'} comment.

Comment from ${authorName || 'a user'}: "${commentText}"

Requirements:
- Be warm, genuine, and on-brand
- Address their specific question or feedback
- If it's positive feedback, show genuine appreciation
- If it's a question, provide a helpful answer
- If it's negative, be empathetic and offer to help
- Keep it concise (1-3 sentences)
- Match the platform's tone (casual for Instagram, professional for LinkedIn, etc.)

Return ONLY the reply text, nothing else.`;

    // Try OpenAI first, fallback to Anthropic
    let reply = '';

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-5.4',
            input: prompt,
            temperature: 0.7,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          for (const item of data.output || []) {
            if (item.type === 'message') {
              for (const content of item.content || []) {
                if (content.type === 'output_text') reply += content.text;
              }
            }
          }
        }
      } catch { /* fall through to Anthropic */ }
    }

    if (!reply) {
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 });
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_completion_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
      }

      const data = await res.json();
      reply = data.content?.[0]?.text || '';
    }

    return NextResponse.json({ reply: reply.trim() });
  } catch (err) {
    console.error('AI reply error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
