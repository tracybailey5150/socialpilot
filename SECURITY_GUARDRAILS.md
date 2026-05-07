# SocialPilot — Security Guardrails

## Core Principles
- OAuth tokens are sensitive credentials — treat like passwords.
- Per-user token isolation: users must never see each other's connected accounts.
- All OAuth state validation via httpOnly cookies (CSRF protection).
- No unrestricted production access for agents.

## Human Approval Required

| Action | Risk | Why |
|--------|------|-----|
| Production deploy | High | Could break live app |
| DB migration (schema change) | High | Irreversible data impact |
| Table or column deletion | Critical | Data loss |
| OAuth app config changes | High | Breaks all user connections |
| DNS/domain changes | High | Breaks OAuth redirect URIs |
| Auth flow changes | High | Lockout risk |
| Bulk social_accounts deletion | Critical | Users lose all connections |
| API key rotation | High | Service disruption |

## Agent Rules
1. Never store secrets in code, commits, logs, or chat.
2. Never expose `FACEBOOK_APP_SECRET`, `GOOGLE_CLIENT_SECRET`, or `SUPABASE_SERVICE_ROLE_KEY` to client-side code.
3. Never access another user's social_accounts rows.
4. Never store OAuth tokens in cookies, localStorage, or client state — only in Supabase.
5. Never skip CSRF state validation in OAuth callbacks.
6. Never run `DROP TABLE`, `TRUNCATE`, or `DELETE FROM` without `WHERE` on production.
7. Always use httpOnly, secure, sameSite cookies for OAuth state.
8. Always validate the `state` parameter matches the cookie before exchanging tokens.

## Branch Protection
- `main` is protected. All changes via PR.
- No force pushes to `main`.
- Build must pass before merge.

## Audit Trail
- All changes must be committed with descriptive messages.
- OAuth flow changes must be documented in PR description.
- DB schema changes must be documented in PR description.
- Env var additions must be documented in `ENVIRONMENT.md`.
