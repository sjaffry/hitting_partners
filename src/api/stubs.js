/**
 * API Stubs — replace these with real API calls once the backend is ready.
 */

const STORAGE_KEY_REQUESTS = 'hp_requests';
const STORAGE_KEY_USERS = 'hp_users';
const STORAGE_KEY_SMS_LOG = 'hp_sms_log';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRequests() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_REQUESTS) || '[]');
  } catch {
    return [];
  }
}

function saveRequests(requests) {
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function delay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Stub SMS sender — logs to console and appends to localStorage SMS log.
 * Replace with a real POST to /api/sms or a Twilio call in production.
 * @param {string} to   - recipient phone number
 * @param {string} body - message text
 */
function sendSms(to, body) {
  const entry = { to, body, sentAt: new Date().toISOString() };
  console.info('[STUB SMS]', entry);
  try {
    const log = JSON.parse(localStorage.getItem(STORAGE_KEY_SMS_LOG) || '[]');
    log.push(entry);
    localStorage.setItem(STORAGE_KEY_SMS_LOG, JSON.stringify(log));
  } catch {
    // non-fatal
  }
}

// ─── User Registration ───────────────────────────────────────────────────────

/**
 * Register a new player.
 * @param {{ name: string, phone: string, email: string, ustaRating: string, gender: string }} data
 * @returns {Promise<{ success: boolean, userId: string }>}
 */
export async function registerUser(data) {
  await delay();
  const users = getUsers();
  const existing = users.find((u) => u.phone === data.phone);
  if (existing) {
    return { success: false, error: 'A user with this phone number is already registered.' };
  }
  const newUser = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return { success: true, userId: newUser.id };
}

/**
 * Log in a user (stub — no real auth).
 * @param {{ phone: string }} data
 * @returns {Promise<{ success: boolean, user?: object }>}
 */
export async function loginUser(data) {
  await delay();
  const users = getUsers();
  const user = users.find((u) => u.phone === data.phone);
  if (!user) {
    return { success: false, error: 'No registered user found with that phone number.' };
  }
  return { success: true, user };
}

// ─── Hitting Requests ────────────────────────────────────────────────────────

/**
 * Create a new hitting request and (stub) send SMS to all registered players.
 * @param {{ requesterId: string, requesterName: string, date: string, time: string,
 *           court: string, ustaRatingPref: string, genderPref: string, notes: string }} data
 * @returns {Promise<{ success: boolean, requestId: string }>}
 */
export async function createHittingRequest(data) {
  await delay();
  const requests = getRequests();
  const newRequest = {
    id: crypto.randomUUID(),
    ...data,
    status: 'open',           // open | accepted | cancelled
    acceptedBy: null,
    acceptedAt: null,
    createdAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  saveRequests(requests);

  // Stub: in production, POST to /api/requests which triggers Twilio/SNS SMS blast
  console.info('[STUB] SMS sent to all registered players for request', newRequest.id);

  return { success: true, requestId: newRequest.id };
}

/**
 * Get a single hitting request by ID.
 * @param {string} requestId
 * @returns {Promise<{ success: boolean, request?: object }>}
 */
export async function getHittingRequest(requestId) {
  await delay(300);
  const requests = getRequests();
  const request = requests.find((r) => r.id === requestId);
  if (!request) {
    return { success: false, error: 'Request not found.' };
  }
  return { success: true, request };
}

/**
 * Get all hitting requests created by a specific user.
 * @param {string} userId
 * @returns {Promise<{ success: boolean, requests: object[] }>}
 */
export async function getUserRequests(userId) {
  await delay(300);
  const requests = getRequests();
  return {
    success: true,
    requests: requests.filter((r) => r.requesterId === userId),
  };
}

/**
 * Accept a hitting request (via deep link).
 * @param {{ requestId: string, responderId: string, responderName: string }} data
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function acceptHittingRequest(data) {
  await delay();
  const requests = getRequests();
  const index = requests.findIndex((r) => r.id === data.requestId);
  if (index === -1) {
    return { success: false, error: 'Request not found.' };
  }
  const request = requests[index];
  if (request.status !== 'open') {
    return { success: false, error: 'This slot has already been taken.' };
  }
  const updatedRequest = {
    ...request,
    status: 'accepted',
    acceptedBy: data.responderId,
    acceptedByName: data.responderName,
    acceptedAt: new Date().toISOString(),
  };
  requests[index] = updatedRequest;
  saveRequests(requests);

  // Look up both players to get their phone numbers
  const users = getUsers();
  const requester = users.find((u) => u.id === request.requesterId);
  const responder = users.find((u) => u.id === data.responderId);

  // Format a human-readable date/time for the SMS
  const dt = new Date(`${request.date}T${request.time || '00:00'}`);
  const formattedDateTime = dt.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (requester?.phone) {
    sendSms(
      requester.phone,
      `Your hitting request has been accepted by ${data.responderName}!\n` +
      `Date & Time: ${formattedDateTime}\n` +
      `Court: ${request.court || 'TBD'}`,
    );
  }

  if (responder?.phone) {
    sendSms(
      responder.phone,
      `You've accepted a hitting session with ${request.requesterName}!\n` +
      `Date & Time: ${formattedDateTime}\n` +
      `Court: ${request.court || 'TBD'}`,
    );
  }

  return { success: true, message: 'You have successfully accepted the hitting request!' };
}

/**
 * Cancel a hitting request.
 * @param {string} requestId
 * @returns {Promise<{ success: boolean }>}
 */
export async function cancelHittingRequest(requestId) {
  await delay();
  const requests = getRequests();
  const index = requests.findIndex((r) => r.id === requestId);
  if (index === -1) {
    return { success: false, error: 'Request not found.' };
  }
  requests[index] = { ...requests[index], status: 'cancelled' };
  saveRequests(requests);
  return { success: true };
}
