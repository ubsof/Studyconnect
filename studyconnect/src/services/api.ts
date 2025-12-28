const BASE = import.meta.env.DEV ? 'http://localhost:4000' : '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function register(data: any) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function me() {
  const res = await fetch(`${BASE}/auth/me`, { headers: { ...authHeaders() } });
  return res.json();
}

export async function createGroup(payload: any) {
  const res = await fetch(`${BASE}/groups/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function getAllGroups() {
  const res = await fetch(`${BASE}/groups/all`);
  return res.json();
}

export async function searchGroups(q: string) {
  const res = await fetch(`${BASE}/groups/search?q=${encodeURIComponent(q)}`);
  return res.json();
}

export async function joinGroup(groupId: number) {
  const res = await fetch(`${BASE}/groups/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ groupId })
  });
  return res.json();
}

export async function getMyGroups() {
  const res = await fetch(`${BASE}/groups/mine`, { headers: { ...authHeaders() } });
  return res.json();
}

export async function getCreatedGroups() {
  const res = await fetch(`${BASE}/groups/created`, { headers: { ...authHeaders() } });
  return res.json();
}

export async function getGroupRequests(groupId: number) {
  const res = await fetch(`${BASE}/groups/requests/${groupId}`, { headers: { ...authHeaders() } });
  return res.json();
}

export async function updateRequest(requestId: number, status: string) {
  const res = await fetch(`${BASE}/groups/request/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ requestId, status })
  });
  return res.json();
}

export async function suggested() {
  const res = await fetch(`${BASE}/groups/suggested`, { headers: { ...authHeaders() } });
  return res.json();
}

export async function upcomingEvents() {
  const res = await fetch(`${BASE}/events/upcoming`);
  return res.json();
}

export default { login, register, me, createGroup, getAllGroups, searchGroups, joinGroup, getMyGroups, getCreatedGroups, getGroupRequests, updateRequest, suggested, upcomingEvents };
