export interface Pal {
  id: string;
  auth_user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  avatar: string;
  rating: number;
  completedVisits: number;
  languages: string[];
  specialties: string[];
  bio: string;
  isVerified: boolean;
  account_status?: 'pending_approval' | 'approved_pending_verification' | 'active' | 'suspended';
  email_verified?: boolean;
  hospitalAffiliations: string[];
  badgeNumber: string;
  created_at?: string;
  updated_at?: string;
}

export interface PalApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  languages: string;
  specialties?: string;
  bio?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  approved_at?: string;
  signup_completed_at?: string;
}

export interface PalEmailNotification {
  id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  message: string;
  sent_at: string;
  status: 'delivered';
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
