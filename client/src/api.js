const API_URL = `http://${window.location.hostname || 'localhost'}:3001/api`;

async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (!response.ok) {
    const error = new Error(payload.error ?? 'Request failed.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export function getInstructions() {
  return apiRequest('/instructions');
}

export function login(username, password) {
  return apiRequest('/sessions', {
    method: 'POST',
    body: { username, password },
  });
}

export function getCurrentUser() {
  return apiRequest('/sessions/current');
}

export function logout() {
  return apiRequest('/sessions/current', { method: 'DELETE' });
}

export function getFullNetwork() {
  return apiRequest('/network/full');
}

export function createGame() {
  return apiRequest('/games', { method: 'POST' });
}

export function getGame(gameId) {
  return apiRequest(`/games/${gameId}`);
}

export function submitGame(gameId, segmentIds) {
  return apiRequest(`/games/${gameId}/submit`, {
    method: 'POST',
    body: { segmentIds },
  });
}

export function getRanking() {
  return apiRequest('/ranking');
}
