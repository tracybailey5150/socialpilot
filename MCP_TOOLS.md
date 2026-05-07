# SocialPilot — MCP Tools & Service Access

## Current Tools

| Tool | Purpose | Access Level | Allowed | Forbidden | Approval |
|------|---------|-------------|---------|-----------|----------|
| **GitHub** | Code, PRs, issues | Read/Write | Clone, branch, PR, review | Force push main, delete repo | Auto for branches, human for main merge |
| **Supabase** | DB, Auth | Read + scoped write | Query, insert, update | DROP/TRUNCATE, disable RLS, token access | Human for schema changes |
| **Vercel** | Deploy, env, logs | Read + deploy | Preview deploy, read logs | Production deploy, env deletion | Human for production |
| **Facebook** | Graph API | Via user tokens | Post to pages, read insights | Modify app config, delete pages | Human for app changes |
| **Google/YouTube** | YouTube API | Via user tokens | Post videos, read analytics | Modify OAuth app, delete channels | Human for app changes |
| **OpenAI** | Content AI | API calls | Generate content | Change model, increase limits | Auto |
| **Resend** | Email | Send (scoped) | Send notifications | Bulk sends | Human for bulk |

## Environment Scoping

| Tool | Local Dev | Preview | Production |
|------|-----------|---------|------------|
| GitHub | Full access | Full access | PR-only |
| Supabase | Dev project OK | Dev project | Prod read-only for agents |
| Vercel | Dev server | Auto-deploy | Human approval |
| Facebook | Test app | Test app | Production app |
| Google | Test project | Test project | Production project |
| OpenAI | Optional | Optional | Production key |

## Future MCP Categories
- **Scheduling:** Background job runner for scheduled posts (Trigger.dev or similar).
- **Analytics:** Platform analytics aggregation service.
- **Billing:** Stripe for subscription management.
- **More Platforms:** Twitter/X, LinkedIn, TikTok, Instagram.
