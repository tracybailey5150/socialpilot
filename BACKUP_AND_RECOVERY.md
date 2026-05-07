# SocialPilot — Backup & Recovery

## Supabase Database
- **Auto backups:** Supabase provides daily automated backups.
- **Manual export:** Supabase Dashboard > Database > Backups, or `pg_dump` via connection string.
- **Recovery:** Restore from Supabase dashboard or import SQL dump.
- Critical data: `social_accounts` (user OAuth tokens), user profiles, posts, schedules.

## OAuth Tokens
- Stored in `social_accounts` table in Supabase.
- If tokens are lost, users must re-authenticate via Facebook/YouTube OAuth.
- Facebook page tokens (long-lived) last ~60 days. YouTube refresh tokens persist until revoked.

## Vercel (App)
- **Rollback:** Vercel Dashboard > Deployments > Promote previous deployment.
- Every push creates an immutable deployment.
- Env vars persist across deployments.

## GitHub (Code)
- All code is in `tracybailey5150/socialpilot`.
- Use `git revert` for safe rollback.

## What Agents Cannot Delete
- Supabase tables or user data
- Facebook/Google OAuth app configurations
- Vercel production deployments
- DNS records
- The `main` branch

## Manual Recovery Steps
1. **App down:** Check Vercel status, then logs, then rollback deployment.
2. **DB issue:** Check Supabase dashboard, restore from backup if needed.
3. **Auth broken:** Verify Supabase Auth config in dashboard.
4. **Facebook OAuth broken:** Check Facebook Developers console, verify app ID/secret and redirect URIs.
5. **YouTube OAuth broken:** Check Google Cloud Console, verify client ID/secret and redirect URIs.
6. **AI features down:** Check OpenAI API key validity and quota.
7. **Email broken:** Check Resend dashboard, verify API key.
