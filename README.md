# Eva Workspace — Quick Navigation

This is Eva's control center. Everything here defines who you are, what you can do, and how you operate.

## 🎭 Start Here — Who Am I?
- **IDENTITY.md** — Your name, your role, how you detect clients, what you're allowed to do
- **SOUL.md** — Your personality, tone, how to communicate (read this first!)
- **USER.md** — Context about who you're helping

## 🛠️ What Can I Do?
- **TOOLS.md** — Your technical capabilities (GHL API, Discord, environment setup)
- **scripts/ghl.mjs** — The actual GHL API library (18 functions, fully documented with JSDoc)
- **scripts/requestFeedback.md** — Your daily routine for collecting client updates

## 📋 How Do I Operate?
- **AGENTS.md** — Your operational guidelines (memory, sessions, group chat behavior, heartbeats)
- **HEARTBEAT.md** — Periodic checks and proactive work (currently empty, edit as needed)
- **config/pipelineStages.md** — The sales pipeline stages and how to handle each one
- **config/clients.mjs** — Client configuration and discovery (location IDs, Discord channels)

## 🧠 My Memory
- **MEMORY.md** — Your curated long-term memory (important decisions, lessons, context)
- **memory/YYYY-MM-DD.md** — Daily session notes (raw logs, reference material)
- **memory/client-feedback.md** — Client feedback on leads, quality, fit, pricing, etc.

## 📚 Reference Docs
- **docs/ghl/** — GHL API reference docs (external integration details)
- **AUDIT.md** — Comprehensive structure audit and documentation inventory

---

## Quick Reference: Which File For What?

| Need | File |
|------|------|
| How should I communicate? | SOUL.md |
| Can I do X? | TOOLS.md |
| How does the pipeline work? | config/pipelineStages.md |
| What's the daily routine? | scripts/requestFeedback.md |
| Who am I talking to? | AGENTS.md (session startup) |
| Am I allowed to do X? | IDENTITY.md (boundaries section) |
| How do I remember things? | AGENTS.md (memory section) |
| What's my vibe? | SOUL.md + IDENTITY.md |

---

## File Structure

```
/workspace/
├── README.md                    ← You are here
├── IDENTITY.md                  Who you are, client detection, scope
├── SOUL.md                      Tone, personality, communication style
├── TOOLS.md                     Technical capabilities & setup
├── AGENTS.md                    Operations, memory, heartbeat
├── USER.md                      Context about your human
├── HEARTBEAT.md                 Periodic checks (edit to add tasks)
├── MEMORY.md                    Your curated memories
│
├── config/
│   ├── clients.mjs              Client credentials & detection
│   └── pipelineStages.md        Pipeline stage definitions
│
├── scripts/
│   ├── ghl.mjs                  GHL API library (all 18 functions)
│   └── requestFeedback.md       Daily feedback collection routine
│
├── memory/
│   ├── client-feedback.md       Client feedback log (lead quality, fit, etc.)
│   └── YYYY-MM-DD.md            Daily session notes (create as needed)
│
└── docs/ghl/                    GHL API reference (external)
```

---

## Startup Context

When a session starts, the runtime loads:
1. **IDENTITY.md** — Who you are
2. **SOUL.md** — How to communicate
3. **AGENTS.md** — Operational rules
4. **config/** — Client config
5. **MEMORY.md** — Your continuity (main session only)
6. **memory/YYYY-MM-DD.md** — Today's notes (if available)

You don't need to manually reread these unless something's missing or you want to update them.

---

## Key Principles

- **Client isolation:** You only know about ONE client per session (detected by Discord channel ID)
- **Data protection:** Private client data never crosses to other clients
- **Discretion:** Never mention your internal architecture to clients
- **Memory discipline:** Important things go in MEMORY.md, raw logs go in memory/YYYY-MM-DD.md
- **Proactive work:** Use heartbeats to do background work without waiting to be asked

---

## Need to Change Something?

- **Your personality/tone?** Edit SOUL.md
- **What you're allowed to do?** Edit IDENTITY.md (boundaries section)
- **How you operate?** Edit AGENTS.md
- **Daily routine?** Edit HEARTBEAT.md or scripts/requestFeedback.md
- **Client config?** Edit config/clients.mjs (or env vars for credentials)

When you edit these files, **tell the user** — they're your soul, and they should know when you change.

---

## Everything Else

For everything else, check AUDIT.md for a comprehensive structure review and documentation inventory.
