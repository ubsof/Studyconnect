const BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');

function authHeaders(): Record<string, string> {
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

export async function getAllPendingRequests() {
  const res = await fetch(`${BASE}/groups/all-pending-requests`, { headers: { ...authHeaders() } });
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

export async function getGroup(groupId: number) {
  const res = await fetch(`${BASE}/groups/${groupId}`, { headers: { ...authHeaders() } });
  return res.json();
}

export async function getGroupMembers(groupId: number) {
  const res = await fetch(`${BASE}/groups/${groupId}/members`, { headers: { ...authHeaders() } });
  return res.json();
}

export async function kickMember(groupId: number, memberId: number) {
  const res = await fetch(`${BASE}/groups/${groupId}/kick/${memberId}`, {
    method: 'POST',
    headers: { ...authHeaders() }
  });
  return res.json();
}

export async function updateGroup(groupId: number, data: any) {
  const res = await fetch(`${BASE}/groups/update/${groupId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getNotifications() {
  const res = await fetch(`${BASE}/groups/notifications/mine`, { headers: { ...authHeaders() } });
  return res.json();
}

export async function markNotificationRead(notificationId: number) {
  const res = await fetch(`${BASE}/groups/notifications/read/${notificationId}`, {
    method: 'POST',
    headers: { ...authHeaders() }
  });
  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${BASE}/groups/notifications/read-all`, {
    method: 'POST',
    headers: { ...authHeaders() }
  });
  return res.json();
}

// Questions API
export async function getAllQuestions() {
  const res = await fetch(`${BASE}/questions`, { headers: { ...authHeaders() } });
  return res.json();
}

export async function getQuestion(questionId: number) {
  const res = await fetch(`${BASE}/questions/${questionId}`, { headers: { ...authHeaders() } });
  return res.json();
}

export async function createQuestion(formData: FormData) {
  const res = await fetch(`${BASE}/questions`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData
  });
  return res.json();
}

export async function deleteQuestion(questionId: number) {
  const res = await fetch(`${BASE}/questions/${questionId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return res.json();
}

export async function addAnswer(questionId: number, content: string) {
  const res = await fetch(`${BASE}/questions/${questionId}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content })
  });
  return res.json();
}

export async function deleteAnswer(answerId: number) {
  const res = await fetch(`${BASE}/questions/answers/${answerId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return res.json();
}

export async function searchQuestions(query: string) {
  const res = await fetch(`${BASE}/questions/search/${encodeURIComponent(query)}`, { headers: { ...authHeaders() } });
  return res.json();
}

export function getImageUrl(imageUrl: string) {
  return `${BASE}${imageUrl}`;
}

export default { login, register, me, createGroup, getAllGroups, searchGroups, joinGroup, getMyGroups, getCreatedGroups, getGroupRequests, getAllPendingRequests, updateRequest, suggested, upcomingEvents, getGroup, getGroupMembers, kickMember, updateGroup, getNotifications, markNotificationRead, markAllNotificationsRead, getAllQuestions, getQuestion, createQuestion, deleteQuestion, addAnswer, deleteAnswer, searchQuestions, getImageUrl };
