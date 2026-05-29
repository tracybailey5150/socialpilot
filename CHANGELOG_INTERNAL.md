# SocialPilot — Internal Changelog

## Format
Each entry follows this structure:
- **Date:** YYYY-MM-DD
- **Agent/Tool:** Who or what made the change
- **Summary:** What changed
- **Files Changed:** List of affected files
- **Risk Level:** Low / Medium / High / Critical
- **Migration Impact:** None / Schema change / Data migration
- **Deployment Status:** Not deployed / Preview / Production
- **Follow-up Needed:** None / Description of follow-up

---

## 2026-05-28 — Full RLS Security Hardening
- Fixed: `post_results` had `{public} ALL with_check=true` — any user could manipulate results. Now user-scoped via posts table
- 15 total policies. 0 public, 0 anon, 15 authenticated. All user-scoped.

---

## 2026-04-27 — Claude Agent
**Summary:** Initial operational documentation added.
**Files Changed:** AGENTS.md, PROJECT_CONTEXT.md, ARCHITECTURE.md, RUNBOOK.md, SECURITY_GUARDRAILS.md, MCP_TOOLS.md, DEPLOYMENT_CHECKLIST.md, ENVIRONMENT.md, BACKUP_AND_RECOVERY.md, CHANGELOG_INTERNAL.md, .env.example
**Risk Level:** Low
**Migration Impact:** None
**Deployment Status:** Not deployed
**Follow-up Needed:** None
