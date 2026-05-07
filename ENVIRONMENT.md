# SocialPilot — Environment Variables

## Required Variables

| Variable | Purpose | Local | Vercel | Where to Get |
|----------|---------|-------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API endpoint | Yes | Yes | Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public/anon key | Yes | Yes | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (server-only) | Yes | Yes | Supabase > Settings > API |
| `NEXT_PUBLIC_APP_URL` | App base URL | Yes (`http://localhost:3000`) | Yes (`https://socialpilot.org`) | Manual |
| `FACEBOOK_APP_ID` | Facebook OAuth app ID | Yes | Yes | Facebook Developers > App Settings |
| `FACEBOOK_APP_SECRET` | Facebook OAuth app secret | Yes | Yes | Facebook Developers > App Settings |
| `GOOGLE_CLIENT_ID` | Google/YouTube OAuth client ID | Yes | Yes | Google Cloud Console > Credentials |
| `GOOGLE_CLIENT_SECRET` | Google/YouTube OAuth client secret | Yes | Yes | Google Cloud Console > Credentials |
| `OPENAI_API_KEY` | OpenAI content generation | Optional | Yes | OpenAI Dashboard |
| `RESEND_API_KEY` | Resend email notifications | Optional | Yes | Resend Dashboard > API Keys |

## Safety Notes
- `NEXT_PUBLIC_*` vars are exposed to the browser. Never put secrets in them.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. Server-only, never expose to client.
- `FACEBOOK_APP_SECRET` and `GOOGLE_CLIENT_SECRET` are server-only. Never expose to client.
- OAuth redirect URIs must match `NEXT_PUBLIC_APP_URL` exactly:
  - Facebook: `{APP_URL}/api/auth/facebook/callback`
  - YouTube: `{APP_URL}/api/auth/youtube/callback`
- When changing `NEXT_PUBLIC_APP_URL`, update redirect URIs in both Facebook and Google dashboards.
