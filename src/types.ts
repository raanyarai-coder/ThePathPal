export interface Pal {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  completedVisits: number;
  languages: string[];
  specialties: string[];
  bio: string;
  isVerified: boolean;
  hospitalAffiliations: string[];
  badgeNumber: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
  meetingPoints: string[];
  departments: string[];
  activePalsCount: number;
}

export interface PalRequest {
  id: string;
  patientName: string;
  patientPhone: string;
  hospitalId: string;
  hospitalName: string;
  appointmentDate: string;
  appointmentTime: string;
  department: string;
  meetingPoint: string;
  mobilityNeeds: string[];
  languagePreference: string;
  notes?: string;
  status: 'pending' | 'matched' | 'in_progress' | 'completed';
  assignedPal?: Pal;
  createdAt: string;
}

export interface ImpactMetric {
  label: string;
  value: string;
  description: string;
  iconName: string;
}

export interface PilotMetric {
  category: string;
  title: string;
  metric: string;
  badgeColor: string;
  description: string;
}
