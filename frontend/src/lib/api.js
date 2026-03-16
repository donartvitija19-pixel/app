const rawBackendUrl = (process.env.REACT_APP_BACKEND_URL || '').trim();

const normalizedBackendUrl = rawBackendUrl
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

export const API = `${normalizedBackendUrl}/api`;
