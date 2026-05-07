# SocialPilot — Deployment Checklist

## Pre-Deploy

- [ ] `npm install` — no errors
- [ ] `npm run build` — passes clean
- [ ] No secrets in committed files (check `.env*` in `.gitignore`)
- [ ] New env vars added to Vercel dashboard (see `ENVIRONMENT.md`)
- [ ] New env vars added to `.env.example`
- [ ] OAuth redirect URIs match production URL in Facebook/Google dashboards
- [ ] Supabase migrations reviewed and tested locally
- [ ] Auth callback URLs verified in Supabase dashboard

## Deploy

- [ ] Push to `main` (auto-deploys) OR run `vercel --prod`
- [ ] Verify deployment URL loads in browser

## Post-Deploy Smoke Test

- [ ] Landing page loads (https://socialpilot.org)
- [ ] Login/signup flow works
- [ ] Dashboard renders for authenticated user
- [ ] Facebook OAuth redirect initiates correctly
- [ ] YouTube OAuth redirect initiates correctly
- [ ] AI content generation returns 5 variations
- [ ] Post to Facebook Page works (test account)
- [ ] Check Vercel function logs for errors

## Rollback Plan

1. Vercel Dashboard > Deployments
2. Find previous working deployment
3. Promote to Production
4. If DB migration was applied, coordinate manual rollback with Tracy
5. If OAuth redirect URIs changed, revert in Facebook/Google dashboards

## If Something Breaks

1. Check Vercel function logs first
2. Check Supabase logs (API + Auth)
3. Verify OAuth redirect URIs match deployed URL
4. Check browser console for client errors
5. Verify env vars are set in Vercel
6. If critical: rollback immediately, investigate after
