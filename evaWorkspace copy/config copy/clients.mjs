/**
 * scripts/clients.mjs — Credential map for all Eva clients.
 * Keyed by short name. Each entry has locationId, ghlApiKey, discordChannelId.
 *
 * Lookup: by name (cesar) or by Discord channel ID.
 */

const CLIENTS = {
  cesar:       { name: 'Cesar Grullon',   company: 'Tillup Co',                  locationId: 'TeL2ifZ4ZdqFnMThR8HG', ghlApiKey: 'pit-64d36d10-39bb-47c7-8817-38abb7b65138', channelId: '1503757612771049502' },
  mike:        { name: 'Mike Baruh',      company: 'MIBH Construction',           locationId: '8ofgyJDpWHwVRepQtaSN', ghlApiKey: 'pit-2965c27b-5363-4170-a009-f783dc8034ee', channelId: '1503776706086043658' },
  lonestar:    { name: 'Hector Alfaro',   company: 'Lone Star Garage Repair',     locationId: 'RCq1KbPbbCqoPolTIh0J', ghlApiKey: 'pit-06626f09-a815-4fa7-8a4b-0defc4f11eb0', channelId: '1503794513930485850' },
  susquehanna: { name: 'Ernie Karmasek', company: 'Susquehanna',                 locationId: 'k2DgYBMxuw2oMGTzhWBV', ghlApiKey: 'pit-9f115fdf-109f-412f-a0ab-769ed79269c2', channelId: '1503794586819236021' },
  rtd:         { name: 'Tiago Alvim',    company: 'RTD Remodeling',              locationId: 'pZc04JsGuzvkhlRyaquJ', ghlApiKey: 'pit-3f366511-608e-4b10-ab0e-a31879c82185', channelId: '1503794678435283034' },
  innavik:     { name: 'Nicholas Turk',  company: 'Innavik',                     locationId: '04HqqnxN0bv41DCStgvw', ghlApiKey: 'pit-fc1ea8b3-89c8-4b7e-b04d-872bda93d84f', channelId: '1503794642355884043' },
  fourseasons: { name: 'Kenneth Hewitt', company: 'Four Seasons Design Build',   locationId: 'OoJ02eYI8w857RFXgXPd', ghlApiKey: 'pit-285f6d1a-5bdf-4646-9fcd-79cc71cf0424', channelId: '1503794743845326969' },
  flh:         { name: 'Glenn Mullineaux', company: 'FLH Services 4 U',          locationId: 'ssJihQPta7Djw0AdYiE9', ghlApiKey: 'pit-e96707cc-cb51-44db-98bf-71e96e4f8120', channelId: '1503794804109348914' },
  kfir:        { name: 'Kfir Segev',     company: 'AZ Remodeling',               locationId: 'hwR58H8K1dZDBmXSY565', ghlApiKey: 'pit-5ac7d55b-e527-408c-8a0f-efef7a84a50c', channelId: null },
  aiello:      { name: 'Mike Aiello',    company: 'Prestige Home Remodeling',    locationId: 'a5mh9x9zOw1tjVXqg6jB', ghlApiKey: 'pit-b8f4510c-1ba9-4e06-8906-341d517d8551', channelId: '1504207421147713657' },
  test:        { name: 'Test Client',     company: 'Innavik (Test)',               locationId: '04HqqnxN0bv41DCStgvw', ghlApiKey: 'pit-fc1ea8b3-89c8-4b7e-b04d-872bda93d84f', channelId: '1504376358023860265' },
}

/** Resolve a client by short name or Discord channel ID. Throws if not found. */
export function resolveClient(nameOrChannelId) {
  if (!nameOrChannelId) throw new Error('No client specified. Pass --client=<name> or --channel=<id>')
  // Try direct key match first
  if (CLIENTS[nameOrChannelId]) return CLIENTS[nameOrChannelId]
  // Try channel ID match
  const byChannel = Object.values(CLIENTS).find(c => c.channelId === nameOrChannelId)
  if (byChannel) return byChannel
  throw new Error(`Unknown client: "${nameOrChannelId}". Valid names: ${Object.keys(CLIENTS).join(', ')}`)
}

export default CLIENTS
