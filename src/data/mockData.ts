import { Incident, ResponderUnit, EmergencyStation } from '../types';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-8902',
    code: '#INC-8902',
    title: 'Multi-Vehicle Collision',
    type: 'accident',
    urgency: 'critical',
    status: 'pending',
    locationName: 'I-95 & Expressway Ex 42',
    lat: 41.875,
    lng: -87.635,
    timeAgo: '2m ago',
    timestamp: '14:35 Local',
    reporterName: 'Highway Sensor #12',
    reporterRole: 'Automated Radar',
    description: 'Two-car collision blocking right two lanes. Heavy traffic backup. Potential fuel leak.',
    occupancy: '3 persons involved',
    hazmat: 'Small fuel spill',
    accuracy: '±5m (High Precision)',
    stage: 1,
    assignedUnitId: '',
    assignedUnitName: '',
    commsLog: [
      {
        id: 'c-10',
        sender: 'CAD Intake',
        senderType: 'bot',
        text: 'Emergency collision report logged. Triage active.',
        time: '14:35'
      }
    ]
  },
  {
    id: 'inc-8903',
    code: '#INC-8903',
    title: 'Structural Fire - Warehouse',
    type: 'fire',
    urgency: 'high',
    status: 'responding',
    locationName: '842 Industrial Pkwy',
    lat: 41.881832,
    lng: -87.623177,
    timeAgo: '6m ago',
    timestamp: '14:31 Local',
    reporterName: 'Alarm Monitoring Co.',
    reporterRole: 'Facility Sensor',
    description: 'Smoke detected in rear loading dock. Suppression system active.',
    occupancy: 'Industrial Facility',
    hazmat: 'None reported',
    accuracy: '±4m (High Precision)',
    stage: 2,
    assignedUnitId: 'unit-engine42',
    assignedUnitName: 'Engine 42 (ETA: 3m)',
    commsLog: [
      {
        id: 'c-1',
        sender: 'CAD Intake',
        senderType: 'bot',
        text: 'Automated thermal alarm triggered.',
        time: '14:31'
      },
      {
        id: 'c-2',
        sender: 'Engine 42',
        senderType: 'responder',
        avatarInitials: 'E42',
        text: 'En route lights & sirens. ETA 3 minutes.',
        time: '14:33'
      }
    ]
  },
  {
    id: 'inc-8870',
    code: '#INC-8870',
    title: 'Medical Assistance - Heat Exhaustion',
    type: 'medical',
    urgency: 'low',
    status: 'resolved',
    locationName: 'Downtown Transit Center',
    lat: 41.878,
    lng: -87.625,
    timeAgo: '25m ago',
    timestamp: '14:10 Local',
    reporterName: 'Transit Officer Kelly',
    reporterRole: 'Transit Staff',
    description: 'Commuter experienced mild heat exhaustion. Hydrated and stabilized on scene.',
    occupancy: '1 Patient',
    hazmat: 'None',
    accuracy: '±3m (High Precision)',
    stage: 4,
    assignedUnitId: 'unit-ems7',
    assignedUnitName: 'EMS Medic 7',
    commsLog: [
      {
        id: 'c-30',
        sender: 'EMS Medic 7',
        senderType: 'responder',
        avatarInitials: 'M7',
        text: 'Patient stabilized. Transport declined. Unit clear.',
        time: '14:28'
      }
    ]
  }
];

export const INITIAL_RESPONDERS: ResponderUnit[] = [
  {
    id: 'unit-engine42',
    name: 'Engine 42',
    callsign: 'ENG-42',
    type: 'engine',
    status: 'en_route',
    eta: '3m',
    sector: 'Central Downtown',
    assignedIncidentId: 'inc-8903',
    lat: 41.883,
    lng: -87.625,
    battery: 92,
    signalStrength: 4,
    phone: '(555) 019-4201'
  },
  {
    id: 'unit-patrol19',
    name: 'Patrol 19',
    callsign: 'PAT-19',
    type: 'patrol',
    status: 'available',
    eta: '4m',
    sector: 'Sector 1 (Metro Core)',
    lat: 41.88,
    lng: -87.627,
    battery: 88,
    signalStrength: 4,
    phone: '(555) 019-1919'
  },
  {
    id: 'unit-ems7',
    name: 'EMS Medic 7',
    callsign: 'MED-07',
    type: 'ems',
    status: 'available',
    eta: '5m',
    sector: 'Metro Health Hub',
    lat: 41.874,
    lng: -87.628,
    battery: 95,
    signalStrength: 4,
    phone: '(555) 019-0707'
  }
];

export const EMERGENCY_STATIONS: EmergencyStation[] = [
  {
    id: 'stn-fire-42',
    name: 'Fire & Rescue Station #42',
    type: 'fire',
    badgeCode: 'STN-42',
    address: '420 W Adams St',
    sector: 'Central Sector',
    watchCommander: 'Capt. Marcus Vance',
    hotlinePhone: '(555) 911-FD42',
    radioChannel: '154.280 MHz (TAC-1 Fire)',
    status: 'operational',
    availableUnitsCount: 2,
    stationedUnits: ['Engine 42', 'Heavy Rescue 4'],
    responseLeadTime: '3-4 min',
    lat: 41.8795,
    lng: -87.639,
    notes: 'Primary structural response station with extrication equipment.'
  },
  {
    id: 'stn-police-01',
    name: 'Metro Police HQ (1st Pct)',
    type: 'police',
    badgeCode: 'MPD-PCT01',
    address: '112 State Street',
    sector: 'Metro Core',
    watchCommander: 'Capt. Elena Ramirez',
    hotlinePhone: '(555) 911-PD01',
    radioChannel: '460.125 MHz (TAC-3 Police)',
    status: 'operational',
    availableUnitsCount: 3,
    stationedUnits: ['Patrol 19', 'Cruiser 08'],
    responseLeadTime: '2-3 min',
    lat: 41.883,
    lng: -87.627,
    notes: 'Central command precinct with rapid patrol units.'
  },
  {
    id: 'stn-hospital-mgh',
    name: 'Metro General Trauma Center',
    type: 'hospital',
    badgeCode: 'MGH-TR01',
    address: '500 E Superior St',
    sector: 'Health Hub',
    watchCommander: 'Dr. Sarah Lin',
    hotlinePhone: '(555) 911-MED1',
    radioChannel: '155.340 MHz (MED-NET)',
    status: 'operational',
    availableUnitsCount: 2,
    stationedUnits: ['EMS Medic 7', 'Mobile ICU 2'],
    responseLeadTime: 'Immediate',
    lat: 41.874,
    lng: -87.622,
    notes: 'Level 1 Trauma Center with 24/7 emergency care.'
  }
];

export const BRAND_LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfXPDr86I3_ebfXZF_vVV8Vg5uIdAAphK_1QthB9xZRKNup1O0u-8A_2R5tzKdb2_eAThd1pHH8qPRY2AkyHdnF2UZz5CuNdgOdx7vMACbEjiXhbkJ3BplbJZRRjcvjt3e7MLYydF4NVf-Oz6Lb_6HK0Y39doV0dpBJae3qYJhOuWQ3wpu41R_hTdytH5PAFFZ0rJbOuZC33nMCXjrmDGGqutFUCTI6ttJn6y-Mm8Pv-_IjL3e4i4';

export const DISPATCHER_AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmbWa27hk_haGGxADf541RGcTYZ_p3jqANm8nT79gh62l4OHFASLP4dn7GcrDwiXctIzH6XcvoHbt6HLTeA-O_aQeHK_qgMc80-WcUk8O9-DBOP3mNkoRamMI94xMKXEs2k_AF5GPJEvwks58CToPy_OrP7rE1I7Fv5nZweGNgw0DIrfS4u-2LnITavSm0CiwSipsmAqUA9ApHkdSUvNhzXD9Rcr-U8vf5pHkvJ2Gf8yIuCw36aj4';

export const MAP_TEXTURE_URL_CHICAGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-yRCqHJzKasnln_5PcdjBhMPOya2YzJG3tzO_LVKHrZlx6qYaRc7BVYTFD2w-KEmLEQoCiBu7NFBJsbzAjU_byEB9Tu5HF-2tn5AKfTdnIeeVs4k1_BHM8a2mhmrycOalqGa6huTFxV007YZZCEUcXqXeeQS_aGYGr_5UIEvZm9XTgQ9tajicLv3WZBLq2OWdEGsDSRZpvtZ2oPtcgkaGwXCNu-okkz9874Vz-x0MclLjlJlnyAE';

export const MAP_TEXTURE_URL_NYC = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7J-ez_mvilIzwNA6y74ldCOVE3goAoodjWp21eV4h6kkYk3RfLp38tJgF4YgU38nyUGNb4wwVGBoj4Skus5CB5Jk5EdjNNrL_D-6rAipugBaVeYbpeq29jdi05ySvvMztk-rpUnrB76QCa4p4v41yjVHM3oSxs8MgB-Dy6PZ90OWwgo_c0dO41WokBOsWH8SHrQu3BjB84deG0mbtnfUSt-WZzOeHnMvzZJ7aqwRlTeqQ1QX0MIM';
