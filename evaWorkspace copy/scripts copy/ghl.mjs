/**
 * GHL API client for Eva — sub-account operations only
 *
 * All calls use the client's own sub-account token (never main Evolute token).
 * API version: 2023-02-21
 * Base: https://services.leadconnectorhq.com
 *
 * @example
 * import * as ghl from './scripts/ghl.mjs';
 *
 * const locationId = '8ofgyJDpWHwVRepQtaSN';
 * const ghlApiKey = 'pit-...';
 *
 * const contact = await ghl.getContact('contactId', ghlApiKey);
 * console.log(contact.firstName, contact.email);
 */

const GHL_BASE = "https://services.leadconnectorhq.com";
const DEFAULT_VERSION = "2023-02-21";

async function ghlRequest(method, endpoint, ghlApiKey, { body = null, version = DEFAULT_VERSION } = {}) {
  const url = `${GHL_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      "Authorization": `Bearer ${ghlApiKey}`,
      "Version": version,
      "Content-Type": "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL ${method} ${endpoint} → ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Contacts ──────────────────────────────────────────────────────────────────

/**
 * Get full contact details by ID
 * @param {string} contactId - Contact ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @returns {Promise<Object>} Contact object with all fields including customFields
 * @throws {Error} If contact not found (404)
 */
export async function getContact(contactId, ghlApiKey) {
  const res = await ghlRequest("GET", `/contacts/${contactId}`, ghlApiKey);
  return res.contact;
}

/**
 * Update contact information
 * @param {string} contactId - Contact ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {Object} updates - Fields to update (see allowed list below)
 * @param {string} [updates.firstName] - First name
 * @param {string} [updates.lastName] - Last name
 * @param {string} [updates.name] - Full name
 * @param {string} [updates.email] - Email address
 * @param {string} [updates.phone] - Phone number
 * @param {string} [updates.address1] - Street address
 * @param {string} [updates.city] - City
 * @param {string} [updates.state] - State/Province
 * @param {string} [updates.postalCode] - Postal code
 * @param {string} [updates.country] - Country (ISO 3166-1 alpha-2)
 * @param {string} [updates.website] - Website URL
 * @param {string} [updates.timezone] - Timezone (e.g., "America/New_York")
 * @param {boolean} [updates.dnd] - Do Not Disturb flag
 * @param {string} [updates.dateOfBirth] - DOB (YYYY-MM-DD)
 * @param {string} [updates.assignedTo] - User ID to assign contact
 * @param {Array} [updates.customFields] - Array of {id, value} custom field objects
 * @param {Array} [updates.tags] - Array of tag strings (replaces all existing tags)
 * @param {string} [updates.source] - Source of contact
 * @param {Object} [updates.dndSettings] - DND settings object
 * @param {Object} [updates.inboundDndSettings] - Inbound DND settings
 * @param {string} [updates.companyName] - Company name
 * @returns {Promise<Object>} Updated contact object
 * @throws {Error} If no valid fields provided or contact not found
 */
export async function updateContact(contactId, ghlApiKey, updates) {
  const allowed = [
    "firstName", "lastName", "name",
    "email", "phone",
    "address1", "city", "state", "postalCode", "country",
    "timezone", "dnd", "dateOfBirth",
    "assignedTo", "customFields", "source", "tags", "website",
    "dndSettings", "inboundDndSettings", "companyName"
  ];

  const body = Object.fromEntries(
    Object.entries(updates).filter(([k, v]) => allowed.includes(k) && v !== undefined)
  );

  if (Object.keys(body).length === 0) throw new Error("No valid update fields provided");

  const res = await ghlRequest("PUT", `/contacts/${contactId}`, ghlApiKey, { body });
  return res.contact;
}

/**
 * Search for contacts by name, email, or phone
 * @param {string} locationId - Location ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {string} query - Search query (name, email, or phone number)
 * @param {number} [limit=50] - Maximum results (default 50)
 * @returns {Promise<Array>} Array of matching contacts
 */
export async function searchContacts(locationId, ghlApiKey, query, limit = 50) {
  const endpoint = `/contacts/?locationId=${encodeURIComponent(locationId)}&query=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await ghlRequest("GET", endpoint, ghlApiKey);
  return res.contacts || [];
}

// ── Pipelines & Opportunities ────────────────────────────────────────────────

/**
 * Get all pipelines for a location with their stages
 * @param {string} locationId - Location ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @returns {Promise<Array>} Array of pipelines, each with: {id, name, stages: [{name, id}, ...]}
 */
export async function getPipelines(locationId, ghlApiKey) {
  const endpoint = `/opportunities/pipelines?locationId=${locationId}`;
  const res = await ghlRequest("GET", endpoint, ghlApiKey);
  return res.pipelines || [];
}

/**
 * Get all opportunities for a location with optional stage filtering
 * Automatically handles pagination—returns all matching opportunities
 * @param {string} locationId - Location ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {Object} [options] - Optional filters
 * @param {string} [options.stageId] - Filter by pipeline stage ID
 * @param {number} [options.limit=100] - Results per request (doesn't limit total returned)
 * @returns {Promise<Array>} All matching opportunities: {id, name, monetaryValue, pipelineStageId, contactId, ...}
 * @example
 * const opps = await getOpportunities(locationId, apiKey, { stageId: 'stage123' });
 * for (const opp of opps) {
 *   console.log(opp.name, '$' + opp.monetaryValue);
 * }
 */
export async function getOpportunities(locationId, ghlApiKey, { stageId = null, limit = 100 } = {}) {
  let endpoint = `/opportunities/search?location_id=${locationId}&limit=${limit}`;
  if (stageId) endpoint += `&pipeline_stage_id=${stageId}`;

  const all = [];
  let startAfterId = null;
  let startAfter = null;

  while (true) {
    let url = endpoint;
    if (startAfterId) url += `&startAfterId=${startAfterId}&startAfter=${startAfter}`;
    const res = await ghlRequest("GET", url, ghlApiKey);
    const batch = res.opportunities || [];
    all.push(...batch);
    if (batch.length < limit || !res.meta?.nextPageUrl) break;
    startAfterId = res.meta.startAfterId;
    startAfter = res.meta.startAfter;
  }
  return all;
}

/**
 * Get detailed info for a single opportunity
 * @param {string} opportunityId - Opportunity ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @returns {Promise<Object>} Opportunity with all fields: {id, name, monetaryValue, pipelineStageId, contactId, status, customFields, ...}
 */
export async function getOpportunity(opportunityId, ghlApiKey) {
  const endpoint = `/opportunities/${opportunityId}`;
  const res = await ghlRequest("GET", endpoint, ghlApiKey);
  return res.opportunity;
}

/**
 * Get all opportunities for a specific contact
 * @param {string} locationId - Location ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {string} contactId - Contact ID
 * @returns {Promise<Array>} Array of opportunities for this contact
 */
export async function getOpportunitiesForContact(locationId, ghlApiKey, contactId) {
  const endpoint = `/opportunities/search?location_id=${locationId}&contact_id=${contactId}`;
  const res = await ghlRequest("GET", endpoint, ghlApiKey);
  return res.opportunities || [];
}

/**
 * Move opportunity to a different pipeline stage
 * @param {string} opportunityId - Opportunity ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {string} stageId - Target stage ID (get from getPipelines())
 * @returns {Promise<Object>} Updated opportunity
 */
export async function updateOpportunityStage(opportunityId, ghlApiKey, stageId) {
  const endpoint = `/opportunities/${opportunityId}`;
  const body = { pipelineStageId: stageId };
  const res = await ghlRequest("PUT", endpoint, ghlApiKey, { body });
  return res.opportunity;
}

/**
 * Update opportunity monetary value
 * @param {string} opportunityId - Opportunity ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {number} value - New monetary value (in dollars, e.g., 5000 for $5,000)
 * @returns {Promise<Object>} Updated opportunity
 */
export async function updateOpportunityValue(opportunityId, ghlApiKey, value) {
  const endpoint = `/opportunities/${opportunityId}`;
  const body = { monetaryValue: value };
  const res = await ghlRequest("PUT", endpoint, ghlApiKey, { body });
  return res.opportunity;
}

// ── Appointments ──────────────────────────────────────────────────────────────

/**
 * Book (create) an appointment
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {Object} options - Appointment details
 * @param {string} options.calendarId - Calendar ID (get from getCalendars())
 * @param {string} options.locationId - Location ID
 * @param {string} options.contactId - Contact ID
 * @param {string} options.startTime - ISO 8601 datetime (e.g., "2026-05-20T14:00:00-05:00")
 * @param {string} [options.endTime] - ISO 8601 datetime (optional, defaults to 1 hour after start)
 * @param {string} [options.title="Appointment"] - Appointment title
 * @param {string} [options.description] - Appointment description
 * @param {string} [options.assignedUserId] - Assign to user ID
 * @param {string} [options.appointmentStatus="confirmed"] - Status (new|confirmed|cancelled|showed|noshow|completed)
 * @param {string} [options.meetingLocationType="custom"] - Location type (custom|zoom|gmeet|phone|address|ms_teams|google)
 * @param {string} [options.address] - Address/location description
 * @param {boolean} [options.ignoreDateRange=false] - Ignore scheduling notice/date range validation
 * @param {boolean} [options.ignoreFreeSlotValidation=false] - Skip slot availability check
 * @param {boolean} [options.toNotify=true] - Send notifications and trigger automations
 * @returns {Promise<Object>} Created appointment {id, contactId, startTime, endTime, ...}
 * @throws {Error} If slot unavailable or required fields missing
 * @example
 * const appt = await bookAppointment(apiKey, {
 *   calendarId: 'cal123',
 *   locationId: loc,
 *   contactId: 'contact123',
 *   startTime: '2026-05-20T14:00:00-05:00',
 *   title: 'Consultation Call'
 * });
 */
export async function bookAppointment(ghlApiKey, {
  calendarId,
  locationId,
  contactId,
  startTime,
  endTime = null,
  title = "Appointment",
  description = null,
  assignedUserId = null,
  appointmentStatus = "confirmed",
  meetingLocationType = "custom",
  address = null,
  ignoreDateRange = false,
  ignoreFreeSlotValidation = false,
  toNotify = true,
}) {
  if (!calendarId || !locationId || !contactId || !startTime) {
    throw new Error("Missing required fields: calendarId, locationId, contactId, startTime");
  }

  const body = {
    calendarId,
    locationId,
    contactId,
    startTime,
    title,
    appointmentStatus,
    toNotify,
    ignoreDateRange,
    ignoreFreeSlotValidation,
  };

  if (endTime) body.endTime = endTime;
  if (description) body.description = description;
  if (assignedUserId) body.assignedUserId = assignedUserId;
  if (meetingLocationType !== "custom") body.meetingLocationType = meetingLocationType;
  if (address) body.address = address;

  const res = await ghlRequest("POST", `/calendars/events/appointments`, ghlApiKey, { body });
  return res;
}

/**
 * Update appointment details (title, time, description, status, etc.)
 * Use this for rescheduling or changing appointment properties
 * For recurring appointments, use masterEventId to modify entire series
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {string} eventId - Event/appointment ID (or masterEventId for recurring series)
 * @param {Object} updates - Fields to update
 * @param {string} [updates.startTime] - New ISO 8601 start time
 * @param {string} [updates.endTime] - New ISO 8601 end time
 * @param {string} [updates.title] - New title
 * @param {string} [updates.description] - New description
 * @param {string} [updates.appointmentStatus] - New status (new|confirmed|cancelled|showed|noshow|completed|active)
 * @param {string} [updates.assignedUserId] - Reassign to user
 * @param {string} [updates.meetingLocationType] - New location type
 * @param {string} [updates.address] - New address/location
 * @param {boolean} [updates.ignoreDateRange] - Ignore date range validation
 * @param {boolean} [updates.ignoreFreeSlotValidation] - Skip slot validation
 * @param {boolean} [updates.toNotify] - Send notifications
 * @param {string} [updates.rrule] - Recurring rule (iCalendar RFC 5545 format)
 * @returns {Promise<Object>} Updated appointment
 */
export async function updateAppointment(ghlApiKey, eventId, updates = {}) {
  if (!eventId) throw new Error("eventId is required");

  const allowed = [
    "startTime", "endTime", "title", "description", "appointmentStatus",
    "assignedUserId", "meetingLocationType", "address", "ignoreDateRange",
    "ignoreFreeSlotValidation", "toNotify", "calendarId", "rrule"
  ];

  const body = Object.fromEntries(
    Object.entries(updates).filter(([k, v]) => allowed.includes(k) && v !== undefined)
  );

  if (Object.keys(body).length === 0) throw new Error("No valid update fields provided");

  const endpoint = `/calendars/events/appointments/${eventId}`;
  const res = await ghlRequest("PUT", endpoint, ghlApiKey, { body });
  return res;
}

/**
 * Cancel an appointment
 * Sets appointment status to 'cancelled'
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {string} eventId - Event/appointment ID
 * @returns {Promise<Object>} Updated appointment with status='cancelled'
 */
export async function cancelAppointment(ghlApiKey, eventId) {
  if (!eventId) throw new Error("eventId is required");

  const endpoint = `/calendars/events/appointments/${eventId}`;
  const body = { appointmentStatus: "cancelled" };
  const res = await ghlRequest("PUT", endpoint, ghlApiKey, { body });
  return res;
}

/**
 * Reschedule an appointment to a new time
 * Convenience method for updateAppointment
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {string} eventId - Event/appointment ID
 * @param {string} startTime - New ISO 8601 start time
 * @param {string} [endTime] - New ISO 8601 end time (optional)
 * @returns {Promise<Object>} Updated appointment
 * @example
 * await rescheduleAppointment(apiKey, eventId, '2026-05-21T15:00:00-05:00', '2026-05-21T16:00:00-05:00');
 */
export async function rescheduleAppointment(ghlApiKey, eventId, startTime, endTime = null) {
  if (!eventId || !startTime) throw new Error("eventId and startTime are required");

  const updates = { startTime };
  if (endTime) updates.endTime = endTime;

  return updateAppointment(ghlApiKey, eventId, updates);
}

/**
 * Find all appointments for a specific contact
 * @param {string} locationId - Location ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {string} contactId - Contact ID
 * @param {string} [fromIso] - Start date ISO (YYYY-MM-DD), defaults to 30 days ago
 * @param {string} [toIso] - End date ISO (YYYY-MM-DD), defaults to 60 days from now
 * @returns {Promise<Array>} Appointments for this contact within date range
 * @example
 * const appts = await findContactAppointments(locationId, apiKey, contactId);
 * for (const appt of appts) {
 *   console.log(appt.title, new Date(appt.startTime).toLocaleString());
 * }
 */
export async function findContactAppointments(locationId, ghlApiKey, contactId, fromIso = null, toIso = null) {
  if (!fromIso) {
    const d = new Date();
    fromIso = new Date(d.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }
  if (!toIso) {
    const d = new Date();
    toIso = new Date(d.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }

  try {
    const allAppts = await fetchSubAccountAppointments(locationId, ghlApiKey, fromIso, toIso);
    return allAppts.filter(appt => appt.contactId === contactId);
  } catch (err) {
    console.warn(`Could not fetch appointments for contact ${contactId}:`, err.message);
    return [];
  }
}

/**
 * Get all calendars for a location
 * Use returned calendar IDs for booking appointments
 * @param {string} locationId - Location ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @returns {Promise<Array>} Calendars {id, name, ...}
 * @example
 * const cals = await getCalendars(locationId, apiKey);
 * const calId = cals[0].id; // Use for booking
 */
export async function getCalendars(locationId, ghlApiKey) {
  const endpoint = `/calendars/?locationId=${locationId}`;
  const res = await ghlRequest("GET", endpoint, ghlApiKey);
  return res.calendars || [];
}

/**
 * Internal: Fetch events from a single calendar for a date range
 * Called by fetchSubAccountAppointments — handles month chunking
 */
async function fetchCalendarAppts(calendarId, locationId, ghlApiKey, fromIso, toIso) {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

  const events = [];
  let cursor = from;

  while (cursor < to) {
    const chunkEnd = Math.min(cursor + MONTH_MS, to);
    const endpoint = `/calendars/events?locationId=${locationId}&calendarId=${calendarId}&startTime=${cursor}&endTime=${chunkEnd}`;
    const res = await ghlRequest("GET", endpoint, ghlApiKey);
    events.push(...(res.events || []));
    cursor = chunkEnd;
  }
  return events;
}

/**
 * Fetch all appointments across all calendars for a location
 * Filters by appointment scheduled time (startTime)
 * Automatically handles all calendars and month chunking (API limit)
 * @param {string} locationId - Location ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {string} fromIso - Start date (ISO, e.g., "2026-05-01")
 * @param {string} toIso - End date (ISO, e.g., "2026-05-31")
 * @returns {Promise<Array>} All appointments {id, title, contactId, startTime, endTime, status, ...}
 * @example
 * const appts = await fetchSubAccountAppointments(locationId, apiKey, '2026-05-01', '2026-05-31');
 * const confirmed = appts.filter(a => a.appointmentStatus === 'confirmed');
 */
export async function fetchSubAccountAppointments(locationId, ghlApiKey, fromIso, toIso) {
  const calendars = await getCalendars(locationId, ghlApiKey);
  const results = await Promise.all(
    calendars.map(cal => fetchCalendarAppts(cal.id, locationId, ghlApiKey, fromIso, toIso))
  );

  const seen = new Set();
  const all = [];
  for (const batch of results) {
    for (const evt of batch) {
      if (!seen.has(evt.id)) {
        seen.add(evt.id);
        all.push(evt);
      }
    }
  }
  return all.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

/**
 * Fetch appointments filtered by any date field (scheduled time, creation time, or update time)
 * @param {string} locationId - Location ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {string} fromIso - Date range start (ISO, e.g., "2026-05-01")
 * @param {string} toIso - Date range end (ISO, e.g., "2026-05-31")
 * @param {string} [filterBy='startTime'] - Which date field to filter by: 'startTime' (scheduled), 'dateAdded' (created), or 'dateUpdated' (modified)
 * @returns {Promise<Array>} Matching appointments
 * @example
 * // Get appointments scheduled in May
 * await getAppointmentsInRange(locationId, apiKey, '2026-05-01', '2026-05-31', 'startTime');
 *
 * // Get appointments created (booked) in May
 * await getAppointmentsInRange(locationId, apiKey, '2026-05-01', '2026-05-31', 'dateAdded');
 *
 * // Get appointments modified in May
 * await getAppointmentsInRange(locationId, apiKey, '2026-05-01', '2026-05-31', 'dateUpdated');
 */
export async function getAppointmentsInRange(locationId, ghlApiKey, fromIso, toIso, filterBy = 'startTime') {
  // For scheduled-time filtering, fetch directly by startTime
  if (filterBy === 'startTime') {
    return fetchSubAccountAppointments(locationId, ghlApiKey, fromIso, toIso);
  }

  // For creation/update filtering, fetch wide range then filter client-side
  const past = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const future = new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const all = await fetchSubAccountAppointments(locationId, ghlApiKey, past, future);

  return all.filter(evt => {
    let dateStr = null;
    if (filterBy === 'dateAdded') {
      dateStr = evt.dateAdded ? evt.dateAdded.slice(0, 10) : null;
    } else if (filterBy === 'dateUpdated') {
      dateStr = evt.dateUpdated ? evt.dateUpdated.slice(0, 10) : null;
    }
    return dateStr && dateStr >= fromIso && dateStr <= toIso;
  });
}

/**
 * Fetch appointments by creation date (when they were booked), not scheduled time
 * Convenience wrapper for getAppointmentsInRange with filterBy='dateAdded'
 * @param {string} locationId - Location ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @param {string} fromIso - Creation date start (ISO, e.g., "2026-05-01")
 * @param {string} toIso - Creation date end (ISO, e.g., "2026-05-31")
 * @returns {Promise<Array>} Appointments created in the date range
 */
export async function fetchSubAccountAppointmentsByCreation(locationId, ghlApiKey, fromIso, toIso) {
  return getAppointmentsInRange(locationId, ghlApiKey, fromIso, toIso, 'dateAdded');
}

// ── Custom Fields ─────────────────────────────────────────────────────────────

/**
 * Get custom field schema/definitions for a location
 * Custom field values are already included in contact/opportunity responses.
 * Use this to understand field IDs, types, and valid values.
 * @param {string} locationId - Location ID
 * @param {string} ghlApiKey - GHL API key (sub-account token)
 * @returns {Promise<Array>} Custom field definitions {id, name, type, ...}
 * @example
 * const schema = await getCustomFieldSchema(locationId, apiKey);
 * const budgetField = schema.find(f => f.name === 'Budget');
 * console.log('Field ID:', budgetField.id);
 */
export async function getCustomFieldSchema(locationId, ghlApiKey) {
  const endpoint = `/locations/${locationId}/customFields`;
  const res = await ghlRequest("GET", endpoint, ghlApiKey);
  return res.customFields || [];
}
