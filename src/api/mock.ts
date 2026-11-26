// In-memory stand-in for the backend, used when EXPO_PUBLIC_API_URL is not set.
// Seed users match the backend's dev seed data, so the same logins work in both modes.
import { ApiError } from './http';
import type { Alert, Api, Delivery, Notice, Role, User, Visit } from './types';

interface MockUser extends User {
  password: string;
}

let currentUserId: number | null = null;
export function setMockToken(token: string | null) {
  currentUserId = token?.startsWith('mock-') ? Number(token.slice(5)) : null;
}

const now = () => new Date().toISOString();
const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString();
let nextId = 100;
const id = () => nextId++;

const users: MockUser[] = [
  { id: 1, name: 'Committee Admin', phone: '9000000001', password: 'admin123', role: 'COMMITTEE', flatNumber: null },
  { id: 2, name: 'Ravi (Guard)', phone: '9000000002', password: 'guard123', role: 'GUARD', flatNumber: null },
  { id: 3, name: 'Anita Sharma', phone: '9000000003', password: 'resident123', role: 'RESIDENT', flatNumber: 'A-101' },
  { id: 4, name: 'Vikram Rao', phone: '9000000004', password: 'resident123', role: 'RESIDENT', flatNumber: 'B-202' },
];

const visits: Visit[] = [
  {
    id: id(), visitorName: 'Swiggy rider', visitorPhone: '9811100000', purpose: 'Food delivery',
    flatNumber: 'A-101', status: 'PENDING_APPROVAL', passCode: null, expectedAt: null,
    createdAt: ago(2), checkedInAt: null, checkedOutAt: null, createdByName: 'Ravi (Guard)',
  },
  {
    id: id(), visitorName: 'Meera (sister)', visitorPhone: '9822200000', purpose: 'Family visit',
    flatNumber: 'A-101', status: 'PRE_APPROVED', passCode: '482913', expectedAt: ago(-120),
    createdAt: ago(60), checkedInAt: null, checkedOutAt: null, createdByName: 'Anita Sharma',
  },
  {
    id: id(), visitorName: 'Plumber', visitorPhone: '9833300000', purpose: 'Repair',
    flatNumber: 'B-202', status: 'CHECKED_IN', passCode: null, expectedAt: null,
    createdAt: ago(45), checkedInAt: ago(40), checkedOutAt: null, createdByName: 'Ravi (Guard)',
  },
];

const deliveries: Delivery[] = [
  {
    id: id(), flatNumber: 'A-101', courier: 'Amazon', description: 'Medium box', status: 'AT_GATE',
    instruction: null, receivedAt: ago(30), collectedAt: null, loggedByName: 'Ravi (Guard)',
  },
];

const alerts: Alert[] = [];

const notices: Notice[] = [
  {
    id: id(), title: 'Water supply maintenance', body: 'Water supply will be off on Saturday from 10 AM to 1 PM.',
    createdAt: ago(600), postedByName: 'Committee Admin',
  },
];

const delay = <T>(v: T): Promise<T> => new Promise((r) => setTimeout(() => r(structuredClone(v)), 250));

function me(): MockUser {
  const u = users.find((x) => x.id === currentUserId);
  if (!u) throw new ApiError('Session expired. Please log in again.', 401);
  return u;
}
function requireRole(...roles: Role[]) {
  const u = me();
  if (!roles.includes(u.role)) throw new ApiError('You are not allowed to do this.', 403);
  return u;
}
function find<T extends { id: number }>(list: T[], itemId: number, what: string): T {
  const item = list.find((x) => x.id === itemId);
  if (!item) throw new ApiError(`${what} not found`, 404);
  return item;
}
function ownVisit(visitId: number) {
  const u = requireRole('RESIDENT');
  const v = find(visits, visitId, 'Visit');
  if (v.flatNumber !== u.flatNumber) throw new ApiError('Not your flat', 403);
  return v;
}
const publicUser = ({ password: _p, ...u }: MockUser): User => u;
const newestFirst = <T extends { createdAt?: string; receivedAt?: string }>(a: T, b: T) =>
  (b.createdAt ?? b.receivedAt ?? '').localeCompare(a.createdAt ?? a.receivedAt ?? '');

export const mockApi: Api = {
  async login(phone, password) {
    const u = users.find((x) => x.phone === phone.trim() && x.password === password);
    if (!u) throw new ApiError('Invalid phone number or password', 401);
    return delay({ token: `mock-${u.id}`, user: publicUser(u) });
  },
  async me() {
    return delay(publicUser(me()));
  },

  async listVisits(status) {
    const u = me();
    return delay(
      visits
        .filter((v) => (u.role === 'RESIDENT' ? v.flatNumber === u.flatNumber : true))
        .filter((v) => !status || v.status === status)
        .sort(newestFirst),
    );
  },
  async preApprove(req) {
    const u = requireRole('RESIDENT');
    const v: Visit = {
      id: id(), ...req, flatNumber: u.flatNumber!, status: 'PRE_APPROVED',
      passCode: String(Math.floor(100000 + Math.random() * 900000)), createdAt: now(),
      checkedInAt: null, checkedOutAt: null, createdByName: u.name,
    };
    visits.push(v);
    return delay(v);
  },
  async walkIn(req) {
    const u = requireRole('GUARD');
    if (!users.some((x) => x.role === 'RESIDENT' && x.flatNumber === req.flatNumber.trim().toUpperCase()))
      throw new ApiError(`No resident registered for flat ${req.flatNumber}`, 400);
    const v: Visit = {
      id: id(), ...req, flatNumber: req.flatNumber.trim().toUpperCase(), status: 'PENDING_APPROVAL',
      passCode: null, expectedAt: null, createdAt: now(), checkedInAt: null, checkedOutAt: null,
      createdByName: u.name,
    };
    visits.push(v);
    return delay(v);
  },
  async verifyPass(passCode) {
    requireRole('GUARD');
    const v = visits.find((x) => x.passCode === passCode.trim() && x.status === 'PRE_APPROVED');
    if (!v) throw new ApiError('Invalid or already used pass code', 404);
    v.status = 'CHECKED_IN';
    v.checkedInAt = now();
    return delay(v);
  },
  async approveVisit(visitId) {
    const v = ownVisit(visitId);
    if (v.status !== 'PENDING_APPROVAL') throw new ApiError('This request is no longer pending', 409);
    v.status = 'APPROVED';
    return delay(v);
  },
  async denyVisit(visitId) {
    const v = ownVisit(visitId);
    if (v.status !== 'PENDING_APPROVAL') throw new ApiError('This request is no longer pending', 409);
    v.status = 'DENIED';
    return delay(v);
  },
  async cancelVisit(visitId) {
    const v = ownVisit(visitId);
    if (v.status !== 'PRE_APPROVED') throw new ApiError('Only unused passes can be cancelled', 409);
    v.status = 'CANCELLED';
    return delay(v);
  },
  async checkIn(visitId) {
    requireRole('GUARD');
    const v = find(visits, visitId, 'Visit');
    if (v.status !== 'APPROVED') throw new ApiError('Visitor is not approved yet', 409);
    v.status = 'CHECKED_IN';
    v.checkedInAt = now();
    return delay(v);
  },
  async checkOut(visitId) {
    requireRole('GUARD');
    const v = find(visits, visitId, 'Visit');
    if (v.status !== 'CHECKED_IN') throw new ApiError('Visitor is not inside', 409);
    v.status = 'CHECKED_OUT';
    v.checkedOutAt = now();
    return delay(v);
  },

  async listDeliveries(status) {
    const u = me();
    return delay(
      deliveries
        .filter((d) => (u.role === 'RESIDENT' ? d.flatNumber === u.flatNumber : true))
        .filter((d) => !status || d.status === status)
        .sort(newestFirst),
    );
  },
  async logDelivery(req) {
    const u = requireRole('GUARD');
    const d: Delivery = {
      id: id(), ...req, flatNumber: req.flatNumber.trim().toUpperCase(), status: 'AT_GATE',
      instruction: null, receivedAt: now(), collectedAt: null, loggedByName: u.name,
    };
    deliveries.push(d);
    return delay(d);
  },
  async setDeliveryInstruction(deliveryId, instruction) {
    const u = requireRole('RESIDENT');
    const d = find(deliveries, deliveryId, 'Delivery');
    if (d.flatNumber !== u.flatNumber) throw new ApiError('Not your flat', 403);
    d.instruction = instruction;
    return delay(d);
  },
  async collectDelivery(deliveryId) {
    const d = find(deliveries, deliveryId, 'Delivery');
    d.status = 'COLLECTED';
    d.collectedAt = now();
    return delay(d);
  },
  async returnDelivery(deliveryId) {
    requireRole('GUARD');
    const d = find(deliveries, deliveryId, 'Delivery');
    d.status = 'RETURNED';
    return delay(d);
  },

  async listAlerts(status) {
    me();
    return delay(alerts.filter((a) => !status || a.status === status).sort(newestFirst));
  },
  async raiseAlert(type, message) {
    const u = me();
    const a: Alert = {
      id: id(), type, message, status: 'ACTIVE', raisedByName: u.name, raisedByPhone: u.phone, flatNumber: u.flatNumber,
      createdAt: now(), acknowledgedByName: null, resolvedAt: null,
    };
    alerts.push(a);
    return delay(a);
  },
  async acknowledgeAlert(alertId) {
    const u = requireRole('GUARD', 'COMMITTEE');
    const a = find(alerts, alertId, 'Alert');
    a.status = 'ACKNOWLEDGED';
    a.acknowledgedByName = u.name;
    return delay(a);
  },
  async resolveAlert(alertId) {
    requireRole('GUARD', 'COMMITTEE');
    const a = find(alerts, alertId, 'Alert');
    a.status = 'RESOLVED';
    a.resolvedAt = now();
    return delay(a);
  },

  async listUsers(role) {
    requireRole('COMMITTEE');
    return delay(users.filter((u) => !role || u.role === role).map(publicUser));
  },
  async createUser(req) {
    requireRole('COMMITTEE');
    if (users.some((u) => u.phone === req.phone)) throw new ApiError('Phone number already registered', 409);
    const u: MockUser = { id: id(), ...req, flatNumber: req.flatNumber?.trim().toUpperCase() || null };
    users.push(u);
    return delay(publicUser(u));
  },
  async deleteUser(userId) {
    const self = requireRole('COMMITTEE');
    if (self.id === userId) throw new ApiError('You cannot remove yourself', 400);
    const i = users.findIndex((u) => u.id === userId);
    if (i < 0) throw new ApiError('User not found', 404);
    users.splice(i, 1);
    return delay(undefined);
  },
  async summary() {
    requireRole('COMMITTEE');
    const today = new Date().toDateString();
    return delay({
      visitorsToday: visits.filter((v) => v.checkedInAt && new Date(v.checkedInAt).toDateString() === today).length,
      pendingApprovals: visits.filter((v) => v.status === 'PENDING_APPROVAL').length,
      deliveriesAtGate: deliveries.filter((d) => d.status === 'AT_GATE').length,
      activeAlerts: alerts.filter((a) => a.status !== 'RESOLVED').length,
      residents: users.filter((u) => u.role === 'RESIDENT').length,
      guards: users.filter((u) => u.role === 'GUARD').length,
    });
  },

  async listNotices() {
    me();
    return delay([...notices].sort(newestFirst));
  },
  async postNotice(title, body) {
    const u = requireRole('COMMITTEE');
    const n: Notice = { id: id(), title, body, createdAt: now(), postedByName: u.name };
    notices.push(n);
    return delay(n);
  },

  // Demo mode has no server to send pushes, so device registration is a no-op.
  async registerDevice() {},
  async unregisterDevice() {},
};
