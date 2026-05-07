# SocialPilot — Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project
- **Name:** SocialPilot
- **URL:** https://socialpilot.org
- **Repo:** tracybailey5150/socialpilot
- **Owner:** Tracy Bailey (tracybailey5150@icloud.com)

## Stack
Next.js 16 (App Router), React 19, Supabase (Auth + DB), Resend (email), OpenAI (content generation), Facebook Graph API, Google/YouTube OAuth, Tailwind CSS (via PostCSS), Lucide icons.

## Commands
| Action | Command |
|--------|---------|
| Install | `npm install` |
| Dev | `npm run dev` |
| Build | `npm run build` |
| Start | `npm start` |

## Key Directories
| Path | Purpose |
|------|---------|
| `src/app/(app)/` | Authenticated pages (dashboard, accounts, posts, schedule, generate, analytics, comments, settings) |
| `src/app/(auth)/` | Auth pages (login, signup) |
| `src/app/api/auth/facebook/` | Facebook OAuth flow (init + callback) |
| `src/app/api/auth/youtube/` | YouTube/Google OAuth flow (init + callback) |
| `src/app/api/facebook/post/` | Post to Facebook Pages |
| `src/app/api/youtube/post/` | Post to YouTube |
| `src/app/api/generate/content/` | AI content generation (OpenAI) |
| `src/lib/supabase/` | Supabase clients (client.ts, server.ts) |
| `src/lib/email.ts` | Email notifications (Resend) |

## Coding Rules
- TypeScript strict. No `any` unless unavoidable.
- Server Components by default. `'use client'` only when needed.
- API routes return `NextResponse.json()`.
- Use `@/` path alias for all imports.
- `cookies()` is async in Next.js 16 — always `await cookies()`.
- No console.log in production code.

## Database Rules
- Supabase project: `jzpjrihpumppetlwwccr`.
- `social_accounts` table stores per-user OAuth tokens (Facebook Pages, YouTube channels).
- Use `supabaseAdmin` (service role) only in OAuth callback handlers.
- Never expose service role key to client.

## OAuth Rules
- Facebook: state parameter via httpOnly cookie (`fb_oauth_state`) for CSRF.
- YouTube: state parameter via httpOnly cookie (`yt_oauth_state`) for CSRF.
- All OAuth tokens stored in `social_accounts` table per user.
- Facebook page tokens are long-lived (derived from long-lived user token).
- YouTube uses offline access with refresh tokens.

## Deployment Rules
- Push to `main` triggers Vercel auto-deploy.
- All env vars must be set in Vercel dashboard before deploy.
- OAuth redirect URIs must match deployed URL exactly.

## Forbidden Actions
- Never commit `.env.local` or any secret values.
- Never expose OAuth client secrets to client-side code.
- Never store raw user passwords (Supabase Auth handles this).
- Never delete social_accounts data without human approval.
- Never push directly to `main` without a passing build.

## Human Approval Required
Production deploys, DB migrations, OAuth app configuration changes, DNS changes, auth flow changes, bulk operations on social accounts.

## Branching
- `main` = production. Always deployable.
- Feature branches: `feat/<name>`, bug fixes: `fix/<name>`.

## Work Summary Format
After completing work, provide: what changed, files modified, migration needed (y/n), env vars added (y/n), risk level (low/med/high), testing notes.
