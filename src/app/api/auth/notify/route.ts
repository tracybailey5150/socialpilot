import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, platform } = await req.json()
    const RESEND_KEY = process.env.RESEND_API_KEY
    if (!RESEND_KEY || !email) return NextResponse.json({ ok: true })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Tracy Bailey <tracy@hookvault.app>',
        to: 'tracybailey5150@icloud.com',
        reply_to: 'tracybailey5150@icloud.com',
        subject: `[${platform || 'SocialPilot'}] New Account — ${email}`,
        html: `<div style="font-family:sans-serif;padding:20px;"><h2 style="color:#10B981;">New Account Created</h2><p><strong>Platform:</strong> ${platform || 'SocialPilot'}</p><p><strong>Email:</strong> ${email}</p><p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p></div>`,
      }),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
