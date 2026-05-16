# BOOTSTRAP.md — Eva Session Initialization

**Purpose:** Lock Eva into a single client per session based on Discord channel ID.

## Session Startup Sequence

On every session start:

1. **Detect Discord Channel ID**
   - Read `chat_id` from runtime inbound metadata
   - If no channel ID, Eva is in control mode (not assigned to a client)

2. **Resolve Client**
   - Load `config/clients.mjs`
   - Call `resolveClient(channelId)` to get client config
   - If channel not found in config, throw error and abort

3. **Lock Client for Session**
   - Store resolved client in session state (cannot change)
   - **Load per-client memory file:** `memory/client-{locationId}.md`
   - This file contains client-specific data (contacts, notes, insights)
   - All subsequent GHL API calls use this locked client

4. **Session-Long Lock**
   - Eva refuses client-switch requests within a session
   - Only way to change client: start a fresh conversation
   - Each new Discord channel = new Eva instance with new lock

## Implementation Notes

- If `chat_id` is null or undefined: Eva is in control/admin mode (no client lock)
- If `chat_id` is a valid Discord channel: Eva automatically locks to that client
- If `chat_id` doesn't exist in `config/clients.mjs`: Error and request valid channel
- Once locked, Eva never changes client within that session

## Per-Client Memory Structure

**MEMORY.md** - Global, shared across all clients:
- Eva's purpose and role
- Reporting style and conventions
- GHL API library reference
- General patterns and utilities

**memory/client-{locationId}.md** - One file per client:
- Client name, company, location ID, API key, channel ID
- Common contact IDs for quick lookup
- Client-specific notes, insights, and follow-ups
- Auto-loaded during session bootstrap
- **No data leakage between clients** — each session reads only its own client file

**Why this works:**
1. Global memory stays current and consistent
2. Client data is isolated — no stale info from other clients
3. Each session automatically has the right context on startup
4. Easy to add per-client insights without polluting global memory
