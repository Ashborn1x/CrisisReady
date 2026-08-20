export type IncidentType = 'medical' | 'fire' | 'accident' | 'flood' | 'police' | 'other';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'pending' | 'assigned' | 'responding' | 'on_scene' | 'resolved';

export interface CommsMessage {
  id: string;
  sender: string;
  senderType: 'bot' | 'dispatcher' | 'responder' | 'citizen';
  avatarInitials?: string;
  text: string;
  time: string;
}

export interface Incident {
  id: string;
  code: string; // e.g. #INC-8902, #CR-8492
  title: string;
  type: IncidentType;
  urgency: UrgencyLevel;
  status: IncidentStatus;
  locationName: string;
  lat: number;
  lng: number;
  timeAgo: string;
  timestamp: string;
  reporterName: string;
  reporterRole: string;
  description: string;
  notes?: string;
  assignedUnitId?: string;
  assignedUnitName?: string;
  occupancy?: string;
  hazmat?: string;
  accuracy?: string;
  stage: number; // 1: Accept, 2: Responding, 3: On Scene, 4: Complete
  commsLog: CommsMessage[];
}

export interface ResponderUnit {
  id: string;
  name: string;
  callsign: string;
  type: 'engine' | 'ladder' | 'ems' | 'patrol' | 'battalion' | 'rescue';
  status: 'available' | 'en_route' | 'on_scene' | 'offline';
  eta: string;
  sector: string;
  assignedIncidentId?: string;
  lat: number;
  lng: number;
  battery: number;
  signalStrength: number; // 1-4
  phone: string;
}

export type StationType = 'police' | 'fire' | 'hospital' | 'ems' | 'emergency_desk';

export interface EmergencyStation {
  id: string;
  name: string;
  type: StationType;
  badgeCode: string;
  address: string;
  sector: string;
  watchCommander: string;
  hotlinePhone: string;
  radioChannel: string;
  status: 'operational' | 'busy' | 'alerted' | 'standby';
  availableUnitsCount: number;
  stationedUnits: string[];
  responseLeadTime: string;
  lat: number;
  lng: number;
  notes?: string;
}

export type UserRole = 'user' | 'dispatcher' | 'station' | 'admin' | 'citizen' | 'responder';

export type ScreenView =
  | 'home'
  | 'report_new'
  | 'sms_fallback'
  | 'user_status'
  | 'dispatcher_dashboard'
  | 'responder_incident'
  | 'resource_map'
  | 'station_portal'
  | 'admin_dashboard'
  | 'personnel'
  | 'analytics'
  | 'settings';

