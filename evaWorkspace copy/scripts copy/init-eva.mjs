#!/usr/bin/env node

/**
 * scripts/init-eva.mjs
 *
 * Initializes Eva's session lock on first message.
 * Reads Discord channel ID, resolves client from config, locks for session.
 *
 * Usage: node scripts/init-eva.mjs <channelId>
 * Or: Called by Eva on first message with metadata.id
 *
 * Returns: { locked: true, client: {...}, message: "Locked to..." }
 */

import { resolveClient } from '../config/clients.mjs';
import fs from 'fs';
import path from 'path';

// Get channel ID from argument or environment
let channelId = process.argv[2] || process.env.CHAT_ID;

if (!channelId) {
  console.error('Usage: node scripts/init-eva.mjs <channelId>');
  process.exit(1);
}

try {
  // Resolve the client from channel ID
  const client = resolveClient(channelId);

  // Verify per-client memory file exists
  const clientMemoryPath = path.join(process.cwd(), `memory/client-${client.locationId}.md`);
  if (!fs.existsSync(clientMemoryPath)) {
    throw new Error(`Per-client memory file not found: memory/client-${client.locationId}.md`);
  }

  // Load the per-client memory file (for verification)
  const clientMemory = fs.readFileSync(clientMemoryPath, 'utf-8');

  // Return success with client info and memory file path
  console.log(JSON.stringify({
    locked: true,
    client,
    memoryFile: `memory/client-${client.locationId}.md`,
    message: `✓ Eva locked to ${client.name} (${client.company}) — loaded memory/client-${client.locationId}.md`
  }, null, 2));

} catch (error) {
  console.error(JSON.stringify({
    locked: false,
    error: error.message
  }, null, 2));
  process.exit(1);
}
