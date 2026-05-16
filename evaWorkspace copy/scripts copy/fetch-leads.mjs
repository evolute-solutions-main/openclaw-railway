import * as ghl from './ghl.mjs';

const locationId = 'RCq1KbPbbCqoPolTIh0J';
const ghlApiKey = 'pit-06626f09-a815-4fa7-8a4b-0defc4f11eb0';

// Fetch recent appointments (last 60 days)
const from = new Date();
from.setDate(from.getDate() - 60);
const fromIso = from.toISOString().slice(0, 10);

const to = new Date();
const toIso = to.toISOString().slice(0, 10);

console.log(`Fetching appointments from ${fromIso} to ${toIso}...`);

const allAppts = await ghl.fetchSubAccountAppointments(locationId, ghlApiKey, fromIso, toIso);

// Get the 10 most recent (by start time)
const recent10 = allAppts
  .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  .slice(0, 10);

console.log(`Found ${recent10.length} recent appointments. Fetching contact details...\n`);

// Fetch contact info for each
for (const appt of recent10) {
  if (!appt.contactId) {
    console.log(`Skipping appointment with no contact ID`);
    continue;
  }

  const contact = await ghl.getContact(appt.contactId, ghlApiKey);

  const address = [
    contact.address1,
    contact.city,
    contact.state,
    contact.postalCode,
    contact.country
  ].filter(Boolean).join(', ');

  console.log(`Name: ${contact.firstName} ${contact.lastName}`);
  console.log(`Email: ${contact.email || 'N/A'}`);
  console.log(`Phone: ${contact.phone || 'N/A'}`);
  console.log(`Address: ${address || 'N/A'}`);
  console.log(`Appointment: ${new Date(appt.startTime).toLocaleString()}`);
  console.log('---');
}
