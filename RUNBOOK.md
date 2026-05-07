# SocialPilot — Runbook

## Local Development
1. Clone repo: `git clone https://github.com/tracybailey5150/socialpilot.git`
2. Install: `npm install`
3. Copy env: `cp .env.example .env.local` and fill in values
4. Run: `npm run dev` (starts at http://localhost:3000)

## Required Env Vars for Local
See `ENVIRONMENT.md` for full list. Minimum: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`.

## Build
```bash
npm run build    # must pass before any deploy
```

## Deploy
- **Auto:** Push to `main` triggers Vercel production deploy.
- **Manual:** `vercel --prod` from linked project directory.
- **Preview:** Push to any non-main branch for preview URL.

## Rollback
1. Go to Vercel Dashboard > Deployments.
2. Find last known good deployment.
3. Click "..." > "Promote to Production".

## Check Logs
- **Vercel:** Dashboard > Functions tab, or `vercel logs <url>`.
- **Supabase:** Dashboard > Logs (API, Auth).

## Verify Services

| Service | How to Check |
|---------|--------------|
| **App** | Visit https://socialpilot.org, confirm page loads |
| **Auth** | Try login/signup flow, check Supabase Auth > Users |
| **Facebook** | Go to Accounts page, click Connect Facebook, verify OAuth redirect |
| **YouTube** | Go to Accounts page, click Connect YouTube, verify OAuth redirect |
| **AI Gen** | Go to Generate page, submit a prompt, verify 5 variations returned |
| **Email** | Check Resend dashboard for notification delivery |

## Common Failures

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| 500 on all pages | Missing env vars | Check Vercel env config |
| Auth redirect loop | Supabase URL/key wrong | Verify SUPABASE env vars |
| Facebook OAuth fails | FACEBOOK_APP_ID/SECRET wrong or redirect URI mismatch | Verify Facebook app config + NEXT_PUBLIC_APP_URL |
| YouTube OAuth fails | GOOGLE_CLIENT_ID/SECRET wrong or redirect URI mismatch | Verify Google Cloud Console + NEXT_PUBLIC_APP_URL |
| AI gen fails | OPENAI_API_KEY missing | Set key in Vercel env |
| OAuth state mismatch | Cookie not set or expired | Check cookie settings, try again |
| Build fails | TypeScript errors | Run `npm run build` locally first |
