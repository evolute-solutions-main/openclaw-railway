# Documentation & Reference Audit

**Date:** 2026-05-13
**Status:** Comprehensive sweep of workspace structure, references, and documentation

---

## File Structure Overview

```
/workspace/
├── Core Documentation (top level)
│   ├── IDENTITY.md          ✅ Who Eva is, client detection, scope
│   ├── SOUL.md              ✅ Tone, vibe, communication style
│   ├── TOOLS.md             ⚠️  Technical capabilities (contains credentials)
│   ├── AGENTS.md            ✅ Operational guidelines, memory, heartbeat
│   ├── USER.md              ✅ Context about your human
│   ├── HEARTBEAT.md         ✅ Periodic tasks checklist
│   └── MEMORY.md            ✅ Auto-memory (persists across sessions)
│
├── Configuration
│   ├── config/clients.mjs               ✅ Client credentials & channel mapping
│   └── config/pipelineStages.md         ✅ Pipeline stage definitions
│
├── Scripts / Implementation
│   ├── scripts/ghl.mjs                  ✅ GHL API library (18 functions, full JSDoc)
│   └── scripts/requestFeedback.md       ✅ Daily feedback collection flow
│
├── External API Reference (GHL)
│   └── docs/ghl/
│       ├── Create Appointment.md        ✅ GHL API reference
│       ├── Get Contact.md               ✅ GHL API reference
│       ├── Get Contacts by Business ID.md
│       ├── Get Opportunity.md
│       ├── Get Pipelines.md
│       ├── Update Appointment.md
│       └── Update Contact.md
│
└── Memory
    ├── MEMORY.md                        ✅ Long-term memories
    ├── memory/2026-05-12.md             📅 Daily session notes
    └── memory/client-feedback           ⚠️  Path referenced but no template
```

---

## Issues & Gaps Found

### 1. **Path Reference Inconsistencies** ⚠️

| File | Issue | Fix |
|------|-------|-----|
| `requestFeedback.md` | References `/scripts/ghl.mjs` | Use consistent `scripts/ghl.mjs` (no leading slash) |
| `AGENTS.md` | References `memory/YYYY-MM-DD.md` | Correct, but consider adding template/example |
| `scripts/requestFeedback.md` | References `/memory/client-feedback` | Should be `memory/client-feedback` (or clarify as file vs folder) |
| Various | Mixed use of `./` and no prefix | Standardize: use relative paths without `./` prefix |

### 2. **Credentials in TOOLS.md** 🔴 SECURITY CONCERN

**Lines 74-98 in TOOLS.md contain live API keys and tokens:**
- Eva Bot Token
- GHL Main Token (Evolute's master token)
- Per-client GHL API keys
- Discord Channel IDs

**Risk:** This is a sensitive file that should NOT be in version control or shared documentation.

**Recommendation:**
- Move credentials to environment variables or a separate `.env.local` (gitignored)
- Keep only references in TOOLS.md, not actual values
- Document which env vars are needed instead

### 3. **Missing Function Documentation** ⚠️

**In `scripts/ghl.mjs`:** 18 fully exported, JSDoc-documented functions
**In `docs/ghl/`:** Only 7 API reference docs

**Mismatch:** Functions have good JSDoc, but external reference docs are incomplete.

**Recommendation:** Either:
- Generate GHL API docs for all 18 functions (low priority, since JSDoc is good)
- Or document in TOOLS.md which functions aren't in docs/ghl/

### 4. **Memory Structure Under-Documented** ⚠️

**Referenced but missing templates/guidance:**
- `memory/YYYY-MM-DD.md` — what format? what to include?
- `memory/client-feedback` — file or folder? what format?
- `memory/heartbeat-state.json` — template structure provided but not created

**Recommendation:** Create templates or clearer guidance in AGENTS.md

### 5. **Reference Completeness**

**Missing from TOOLS.md but should be documented:**
- `scripts/requestFeedback.md` is not mentioned (critical flow file)
- How to run requestFeedback (is it automatic? manual? scheduled?)

**Missing from IDENTITY.md but should be:**
- Where the daily routine (`requestFeedback.md`) fits into the bigger picture

### 6. **Conflicting/Overlapping Documentation**

| Topic | Documented In |
|-------|---|
| Pipeline stages | AGENTS.md + config/pipelineStages.md + requestFeedback.md |
| Memory management | AGENTS.md + USER.md |
| Client isolation | IDENTITY.md + AGENTS.md |
| GHL capabilities | TOOLS.md + scripts/ghl.mjs (JSDoc) + requestFeedback.md |

**Recommendation:** Create a single index or navigation guide to reduce confusion about which file to read for what.

---

## What's Working Well ✅

1. **GHL Library:** Excellent JSDoc comments, well-organized, all 18 functions clearly exported
2. **Client config:** Clean mapping via `resolveClient()`, secure channel isolation
3. **Pipeline stages:** Clear definitions with guidance on handling each stage
4. **Core persona:** IDENTITY.md + SOUL.md paint clear picture of who Eva is
5. **Memory system:** AGENTS.md provides good guidance on memory discipline
6. **Feedback flow:** requestFeedback.md is well-structured daily routine

---

## Priority Fixes

### HIGH (Do First)
- [ ] Remove credentials from TOOLS.md, move to environment variables
- [ ] Standardize all path references (remove leading slashes, use relative paths)
- [ ] Add `scripts/requestFeedback.md` to TOOLS.md documentation

### MEDIUM (Do Soon)
- [ ] Create memory templates/examples (YYYY-MM-DD.md format, client-feedback format)
- [ ] Add navigation/index section at top of IDENTITY.md pointing to other docs
- [ ] Clarify in TOOLS.md how/when requestFeedback is invoked

### LOW (Nice to Have)
- [ ] Generate external docs for remaining 11 GHL functions
- [ ] Add README.md with quick navigation guide
- [ ] Document the complete flow: client message → detection → requestFeedback → pipeline update

---

## Testing This Structure

To verify everything is consistent:
1. Every cross-file reference should use `path/to/file.md` format (no leading slash)
2. Every mentioned file should exist and be accessible
3. All client-facing docs (IDENTITY.md, SOUL.md) should work standalone
4. All backend docs (TOOLS.md, AGENTS.md) should reference each other properly
