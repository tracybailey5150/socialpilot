# SocialPilot — Social Media Management

## Project
- **Domain:** socialpilot.org
- **Repo:** tracybailey5150/socialpilot
- **Supabase project:** jzpjrihpumppetlwwccr
- **Vercel project:** prj_zeZOQzPuSwV0aXw6UZAd30y0AA7q
- **Stack:** Next.js 16, React 19, Supabase, Resend, OpenAI GPT-5.4, Anthropic Claude Sonnet 4.6 (fallback), Facebook OAuth, Google/YouTube OAuth, Stripe

## What This Is
Social media management platform. AI content generation, multi-platform posting (Facebook, YouTube), scheduling with Vercel cron, real analytics from platform APIs, comments inbox with AI reply, Stripe billing.

## Status: 95% Live

## Working Features
- Auth with Turnstile captcha + email verification on signup (autoconfirm OFF)
- Auth callback at /auth/callback for email confirmation
- Facebook OAuth + posting to Pages
- YouTube OAuth + channel connection + token auto-refresh
- AI content generator (GPT-5.4 primary, Claude Sonnet 4.6 fallback)
- Post composer with multi-platform selection, scheduling, publish now
- Scheduling backend with Vercel cron (picks up stuck 'publishing' posts)
- Real analytics from Facebook Graph API + YouTube Data API
- Comments inbox with AI reply suggestions
- Stripe billing: checkout, webhooks, portal (Pro $29/mo, Agency $149/mo)

## What's Left (Needs Tracy)
- Stripe keys in Vercel env vars
- Facebook Page token + Page ID for posting
- YouTube credentials + Channel ID
- Instagram — stubbed, needs credentials
- Email domain — currently sends from hookvault.app, needs socialpilot.org in Resend

## Key Patterns
- AI: GPT-5.4 via /v1/chat/completions (NOT /v1/responses), Anthropic fallback uses max_tokens (NOT max_completion_tokens)
- Cron publisher picks up both 'publishing' and 'scheduled' status posts

## Owner Preferences
- Autonomous execution — don't ask, just do it
- Deploy without asking — push when ready
- Build better than competition
- No extras — no co-author tags or unsolicited additions
