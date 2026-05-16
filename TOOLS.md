# TOOLS.md



## GoHighLevel (GHL)

You are assigned to one specific client. You will have access to the client's subaccount to fetch and update information on their leads. 

config/clients.mjs has all info for each client, but only get data on the one you're assigned to.

**Pipeline Stages**
- config/pipelineStages.md has a description of the sales pipeline stages. make sure to always reference this when information is given about a client to see if their stage should be updated.

**Documentation** 
- GHL API references available in docs/ghl

**API Calls / Functions**
- `scripts/ghl.mjs` has all 18 GHL functions (well-documented with JSDoc comments)
- `scripts/requestFeedback.md` defines the daily feedback collection workflow (run this to gather client updates)

**Per-client credentials**:
- `ghlSubaccountId` — identifies the sub-account
- `ghlApiKey` — token used for all GHL calls for that client

**What you can do in GHL:**
- Read full contact information (including custom fields).
- Update full contact information (including custom fields)
- Read a whole pipeline and see who is in each stage
- Read/Update opportunity's pipeline stage
- Read/Update opportunity's monetary value
- Read all appointments in each of the subaccount's calendars
- Find/Book/Cancel/Reschedule appointments

**Contact Address Fields:**
When retrieving or displaying contact addresses, use these separate fields:
- `address1` — Street address
- `city` — City
- `state` — State/Province
- `postalCode` — Postal code
- `country` — Country (ISO 3166-1 alpha-2)

Do NOT use a single `address` field.

**What Eva cannot do:**
- Delete anything
- Mention client tags

**Note:** The main `GHL_PRIVATE_INTEGRATION_TOKEN` is used by the dashboard only (appointment sync, Stripe matching, Fathom links). Eva never touches it.

---

## Discord

Single bot token (`EVAN_BOT_TOKEN`) shared across all Eva instances. Isolation is enforced by `DISCORD_CHANNEL_ID` — each instance only listens and replies in its assigned channel.

**What Eva can do:**
- Listen for messages in its assigned channel
- Reply to messages (`message.reply`)
- Send proactive messages (`channel.send`) — daily at 8:45am Bogota

**What Eva cannot do:**
- Create or read other channels
- Send DMs

## Environment Variables

| Variable | Purpose |
|---|---|
| `GHL_PRIVATE_INTEGRATION_TOKEN` | Dashboard only — Evolute main account |
| `EVAN_BOT_TOKEN` | Discord bot (shared across all Eva instances) |
| `DISCORD_CHANNEL_ID` | Per-instance — determines which client this Eva serves |

---

## Credentials

**All credentials are stored securely in environment variables or config files, not in this document.**

Refer to `config/clients.mjs` for the client mapping (location ID, channel ID) — the actual API keys are loaded from secure storage at runtime.

**Environment variables needed:**
- `EVAN_BOT_TOKEN` — Discord bot token for Eva
- `GHL_PRIVATE_INTEGRATION_TOKEN` — Evolute's main GHL token (dashboard only)
- Per-client GHL API keys (loaded from `config/clients.mjs`)
