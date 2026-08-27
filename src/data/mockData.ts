import { Pal, Hospital, PalRequest, PilotMetric } from '../types';
import raanyaAvatar from '../assets/images/raanya_pal_avatar_1785711035373.jpg';

export const SAMPLE_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Path Pal Partner Hospital - Downtown',
    city: 'New York',
    state: 'NY',
    meetingPoints: ['Main Entrance Valet Desk', 'Parking Garage A Elevator Lobby', 'Outpatient Pavilion Desk', 'East Wing Drop-Off Zone'],
    departments: ['Cardiology', 'Oncology', 'Orthopedics', 'Diagnostic Imaging / Radiology', 'Outpatient Pharmacy'],
    activePalsCount: 18,
  },
  {
    id: 'hosp-2',
    name: 'St. Jude Regional Health Center',
    city: 'Chicago',
    state: 'IL',
    meetingPoints: ['North Entrance Information Desk', 'Central Atrium Coffee Kiosk', 'Emergency Dept Family Waiting'],
    departments: ['Pediatrics', 'Neurology', 'Internal Medicine', 'Rehabilitation Unit', 'Main Pharmacy'],
    activePalsCount: 14,
  },
  {
    id: 'hosp-3',
    name: 'Valley Care Community Hospital',
    city: 'San Jose',
    state: 'CA',
    meetingPoints: ['Main Entrance Lobby', 'South Tower Check-In Desk', 'Mobility Shuttle Stop #2'],
    departments: ['Geriatrics', 'Ophthalmology', 'Surgical Suites Waiting', 'Lab & Blood Draw Desk'],
    activePalsCount: 22,
  },
];

export const SAMPLE_PALS: Pal[] = [];

export const INITIAL_REQUESTS: PalRequest[] = [];

export const PILOT_METRICS: PilotMetric[] = [
  {
    category: 'MATCH',
    title: 'Request-to-Match Success',
    metric: '98.4%',
    badgeColor: 'bg-[#E85D75] text-white',
    description: 'Proportion of patient support requests matched with a verified Pal within target timeframe.',
  },
  {
    category: 'SPEED',
    title: 'Time to Confirmed Pal',
    metric: '< 4 Mins',
    badgeColor: 'bg-[#48A6A5] text-white',
    description: 'Average response time from initial patient request submission to Pal confirmation.',
  },
  {
    category: 'RELIABILITY',
    title: 'On-Time & Completed Visits',
    metric: '99.1%',
    badgeColor: 'bg-[#F1B84C] text-[#1F3449]',
    description: 'Pals meeting patients promptly at designated entrance points and completing full journey.',
  },
  {
    category: 'EXPERIENCE',
    title: 'Patient Satisfaction',
    metric: '4.95 / 5',
    badgeColor: 'bg-[#E85D75] text-white',
    description: 'Post-visit rating across anxiety reduction, clarity of directions, and friendly care.',
  },
  {
    category: 'CONTINUITY',
    title: 'Repeat & Favorite-Pal Requests',
    metric: '76%',
    badgeColor: 'bg-[#48A6A5] text-white',
    description: 'Returning patients requesting the same familiar Pal for follow-up hospital visits.',
  },
  {
    category: 'SAFETY',
    title: 'Preventable Incidents',
    metric: '0',
    badgeColor: 'bg-[#F1B84C] text-[#1F3449]',
    description: 'Strict adherence to non-clinical role boundaries, screening, and safety protocols.',
  },
];
