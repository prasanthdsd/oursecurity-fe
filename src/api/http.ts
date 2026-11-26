import { config } from '../config';
import type { Api } from './types';

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${config.apiUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 0);
  }
  const text = await res.text();
  const data = text ? safeJson(text) : undefined;
  if (!res.ok) {
    const msg = (data as { message?: string } | undefined)?.message;
    throw new ApiError(msg || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

const q = (status?: string) => (status ? `?status=${encodeURIComponent(status)}` : '');

export const httpApi: Api = {
  login: (phone, password) => request('POST', '/auth/login', { phone, password }),
  me: () => request('GET', '/auth/me'),

  listVisits: (status) => request('GET', `/visits${q(status)}`),
  preApprove: (req) => request('POST', '/visits/preapprove', req),
  walkIn: (req) => request('POST', '/visits/walk-in', req),
  verifyPass: (passCode) => request('POST', '/visits/verify', { passCode }),
  approveVisit: (id) => request('POST', `/visits/${id}/approve`),
  denyVisit: (id) => request('POST', `/visits/${id}/deny`),
  cancelVisit: (id) => request('POST', `/visits/${id}/cancel`),
  checkIn: (id) => request('POST', `/visits/${id}/check-in`),
  checkOut: (id) => request('POST', `/visits/${id}/check-out`),

  listDeliveries: (status) => request('GET', `/deliveries${q(status)}`),
  logDelivery: (req) => request('POST', '/deliveries', req),
  setDeliveryInstruction: (id, instruction) =>
    request('POST', `/deliveries/${id}/instruction`, { instruction }),
  collectDelivery: (id) => request('POST', `/deliveries/${id}/collect`),
  returnDelivery: (id) => request('POST', `/deliveries/${id}/return`),

  listAlerts: (status) => request('GET', `/alerts${q(status)}`),
  raiseAlert: (type, message) => request('POST', '/alerts', { type, message }),
  acknowledgeAlert: (id) => request('POST', `/alerts/${id}/acknowledge`),
  resolveAlert: (id) => request('POST', `/alerts/${id}/resolve`),

  listUsers: (role) => request('GET', `/users${role ? `?role=${role}` : ''}`),
  createUser: (req) => request('POST', '/users', req),
  deleteUser: (id) => request('DELETE', `/users/${id}`),
  summary: () => request('GET', '/reports/summary'),

  listNotices: () => request('GET', '/notices'),
  postNotice: (title, body) => request('POST', '/notices', { title, body }),
};
