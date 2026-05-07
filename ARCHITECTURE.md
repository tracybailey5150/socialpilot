# SocialPilot — Architecture

## Framework
Next.js 16 App Router with React 19. TypeScript. Tailwind CSS via PostCSS.

## Route Structure
```
src/app/
  page.tsx           — Landing page
  (auth)/            — login, signup
  (app)/             — dashboard, accounts, posts, schedule, generate, analytics, comments, settings
  api/
    auth/facebook/          — Facebook OAuth init (GET)
    auth/facebook/callback/ — Facebook OAuth callback (GET)
    auth/youtube/           — YouTube OAuth init (GET)
    auth/youtube/callback/  — YouTube OAuth callback (GET)
    facebook/post/          — Post to Facebook Page (POST)
    youtube/post/           — Post to YouTube channel (POST)
    generate/content/       — AI content generation (POST)
```

## Auth Model
- **Supabase Auth** (email/password) for platform login.
- OAuth flows for social platform connections (Facebook, YouTube) are per-user — NOT for platform auth.
- Facebook OAuth: state cookie `fb_oauth_state`, CSRF-protected, Pages scope.
- YouTube OAuth: state cookie `yt_oauth_state`, CSRF-protected, offline access.
- Connected accounts stored in `social_accounts` table keyed by `user_id`.

## Database
- **Supabase PostgreSQL** (project: `jzpjrihpumppetlwwccr`)
- Key tables: `social_accounts` (platform connections with tokens per user).
- `social_accounts` columns: user_id, platform, platform_user_id, platform_username, display_name, access_token, scopes, metadata.
- Unique constraint: `(user_id, platform, platform_user_id)`.

## Supabase Clients
| Client | File | Use |
|--------|------|-----|
| Browser | `src/lib/supabase/client.ts` | Client components (anon key) |
| Admin | `src/lib/supabase/server.ts` | OAuth callbacks, API routes (service role) |

## AI
- OpenAI GPT-4.1-mini via raw fetch (`src/app/api/generate/content/route.ts`).
- Generates 5 post variations per request with tone, platform, and content type options.
- Returns JSON array of posts with hashtags.

## Email
- Resend SDK (`src/lib/email.ts`). From: `noreply@hookvault.app` (shared domain).
- Sends admin notifications on: new signups, new subscriptions, contact form, new leads.

## Third-Party Services
| Service | Purpose |
|---------|---------|
| Supabase | DB, Auth |
| Facebook Graph API | Page posting, OAuth |
| Google/YouTube API | Video posting, OAuth |
| OpenAI | AI content generation |
| Resend | Email notifications |
| Vercel | Hosting, CDN, serverless |

## Deployment
Vercel auto-deploy on push to `main`.

## Known Tech Debt
- No test suite.
- Email sends from `hookvault.app` domain — needs own domain setup in Resend.
- Scheduling backend not yet implemented (UI exists).
- Analytics integration pending (page exists).
- No subscription/billing system yet.
- Facebook/YouTube token refresh not automated.
