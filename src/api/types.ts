// Shapes mirror the Spring Boot backend contract in docs/API.md.

export type Role = 'RESIDENT' | 'GUARD' | 'COMMITTEE';

export interface User {
  id: number;
  name: string;
  phone: string;
  role: Role;
  flatNumber: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type VisitStatus =
  | 'PRE_APPROVED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'DENIED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface Visit {
  id: number;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  flatNumber: string;
  status: VisitStatus;
  passCode: string | null;
  expectedAt: string | null;
  validUntil?: string | null;
  createdAt: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  createdByName: string;
}

export interface PreApproveRequest {
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  expectedAt: string | null;
}

export interface WalkInRequest {
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  flatNumber: string;
}

export type DeliveryStatus = 'AT_GATE' | 'COLLECTED' | 'RETURNED';
export type DeliveryInstruction = 'LEAVE_AT_GATE' | 'SEND_UP';

export interface Delivery {
  id: number;
  flatNumber: string;
  courier: string;
  description: string;
  status: DeliveryStatus;
  instruction: DeliveryInstruction | null;
  receivedAt: string;
  collectedAt: string | null;
  loggedByName: string;
}

export interface LogDeliveryRequest {
  flatNumber: string;
  courier: string;
  description: string;
}

export type AlertType = 'MEDICAL' | 'FIRE' | 'SECURITY' | 'OTHER';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: number;
  type: AlertType;
  message: string;
  status: AlertStatus;
  raisedByName: string;
  raisedByPhone?: string | null;
  flatNumber: string | null;
  createdAt: string;
  acknowledgedByName: string | null;
  resolvedAt: string | null;
  acknowledgedAt?: string | null;
  resolvedByName?: string | null;
}

export interface Notice {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  postedByName: string;
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  password: string;
  role: Role;
  flatNumber: string | null;
}

export interface Summary {
  visitorsToday: number;
  pendingApprovals: number;
  deliveriesAtGate: number;
  activeAlerts: number;
  residents: number;
  guards: number;
}

/** Every call the app makes. Implemented by the HTTP client and by the demo mock. */
export interface Api {
  login(phone: string, password: string): Promise<LoginResponse>;
  me(): Promise<User>;

  listVisits(status?: VisitStatus): Promise<Visit[]>;
  preApprove(req: PreApproveRequest): Promise<Visit>;
  walkIn(req: WalkInRequest): Promise<Visit>;
  verifyPass(passCode: string): Promise<Visit>;
  approveVisit(id: number): Promise<Visit>;
  denyVisit(id: number): Promise<Visit>;
  cancelVisit(id: number): Promise<Visit>;
  checkIn(id: number): Promise<Visit>;
  checkOut(id: number): Promise<Visit>;

  listDeliveries(status?: DeliveryStatus): Promise<Delivery[]>;
  logDelivery(req: LogDeliveryRequest): Promise<Delivery>;
  setDeliveryInstruction(id: number, instruction: DeliveryInstruction): Promise<Delivery>;
  collectDelivery(id: number): Promise<Delivery>;
  returnDelivery(id: number): Promise<Delivery>;

  listAlerts(status?: AlertStatus): Promise<Alert[]>;
  raiseAlert(type: AlertType, message: string): Promise<Alert>;
  acknowledgeAlert(id: number): Promise<Alert>;
  resolveAlert(id: number): Promise<Alert>;

  listUsers(role?: Role): Promise<User[]>;
  createUser(req: CreateUserRequest): Promise<User>;
  deleteUser(id: number): Promise<void>;
  summary(): Promise<Summary>;

  listNotices(): Promise<Notice[]>;
  postNotice(title: string, body: string): Promise<Notice>;
}
