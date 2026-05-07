# SocialPilot — Project Context

## What It Is
Social media management platform with AI content generation, post scheduling, and per-user account connections for Facebook and YouTube.

## Who It Serves
Small businesses, creators, and social media managers who need to generate content, schedule posts, and manage multiple social accounts from one dashboard.

## Problem It Solves
Managing multiple social media accounts is fragmented — different dashboards, no AI assistance, manual posting. SocialPilot centralizes account management, uses AI to generate content variations, and provides scheduling and analytics in one place.

## Current Stage
- Core platform built at socialpilot.org.
- Supabase Auth (email/password) for user accounts.
- Facebook OAuth with Page token management working.
- YouTube/Google OAuth with offline access working.
- AI content generation via OpenAI (GPT-4.1-mini).
- Dashboard, accounts, posts, schedule, generate, analytics, comments, and settings pages built.

## Main Features
| Feature | Status |
|---------|--------|
| User Auth | Live — Supabase email/password |
| Facebook OAuth | Live — per-user Page connections with long-lived tokens |
| YouTube OAuth | Live — per-user channel connections with refresh tokens |
| AI Content Gen | Live — 5 variations per prompt, tone/platform/type options |
| Post to Facebook | Live — publish to connected Pages |
| Post to YouTube | Live — publish to connected channels |
| Dashboard | Live — overview |
| Post Management | Live — create, view posts |
| Scheduling | Built — scheduling UI |
| Analytics | Built — analytics page |
| Comments | Built — comment management page |
| Settings | Built — user settings |

## Revenue Model
- Future: subscription tiers for number of connected accounts and AI generation limits.

## Locked / Do Not Change
- Brand: SocialPilot
- Domain: socialpilot.org
- Supabase as primary database and auth
- Per-user OAuth model (each user connects their own accounts)

## Related Projects
Part of Tracy Bailey's portfolio: BAD Platform, HookVault, DSD, AV Orchestrator, LessonPilot, DFO, expNWA, Umbra/AgentPilot, Control Center.

## Current Priority
Expand platform connections, build post scheduling backend, analytics integration, subscription billing.
