export interface Pal {
  id: number | string;
  auth_user_id?: string;
  name: string;
  phone?: string;
  ssn?: string;
  bio?: string;
  availability?: string;
  background_check_status?: string;
  rating?: number;
  hourly_rate_cents?: number;
  stripe_account_id?: string;
  created_at?: string;
  // UI helper / display properties
  email?: string;
  avatar?: string;
  completedVisits?: number;
  languages?: string[];
  specialties?: string[];
  isVerified?: boolean;
  account_status?: 'pending_approval' | 'approved_pending_verification' | 'active' | 'suspended' | string;
  email_verified?: boolean;
  hospitalAffiliations?: string[];
  badgeNumber?: string;
  updated_at?: string;
}

export interface PalApplication {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  phone: string;
  ssn?: string;
  languages: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  created_at: string;
  specialties?: string;
  bio?: string;
  admin_notes?: string;
  approved_at?: string;
  signup_completed_at?: string;
}

export interface Patient {
  id: number;
  auth_user_id?: string;
  name: string;
  phone?: string;
  email?: string;
  created_at: string;
}

export interface PalRequest {
  id: string;
  patient_id?: number;
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
  status: 'pending' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  assignedPal?: Pal;
  createdAt: string;
}

export interface Match {
  id: number;
  request_id: string;
  pal_id: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled' | string;
  matched_at?: string;
  created_at: string;
  pal?: Pal;
  request?: PalRequest;
}

export interface HospitalVisit {
  id: number;
  match_id?: number;
  pal_id?: number;
  patient_id?: number;
  hospital_name?: string;
  department?: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | string;
  notes?: string;
  created_at: string;
}

export interface Membership {
  id: number;
  patient_id: number;
  plan_name: string;
  status: 'active' | 'paused' | 'cancelled' | string;
  start_date?: string;
  renewal_date?: string;
  end_date?: string;
  price_cents: number;
  created_at: string;
}

export interface Payment {
  id: number;
  patient_id?: number;
  amount_cents: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | string;
  stripe_payment_id?: string;
  description?: string;
  created_at: string;
}

export interface Payout {
  id: number;
  pal_id: number;
  amount_cents: number;
  status: 'pending' | 'processing' | 'paid' | 'failed' | string;
  stripe_transfer_id?: string;
  period_start?: string;
  period_end?: string;
  created_at: string;
}

export interface Review {
  id: number;
  visit_id?: number;
  match_id?: number;
  pal_id: number;
  patient_id?: number;
  rating: number;
  comment?: string;
  created_at: string;
  pal_name?: string;
  patient_name?: string;
}

export interface HospitalInquiry {
  id: number | string;
  hospital_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  estimated_annual_dispatches?: number;
  notes?: string;
  status?: string;
  created_at: string;
}

export interface Notification {
  id: number | string;
  user_id?: string;
  title: string;
  message: string;
  type?: 'info' | 'dispatch' | 'approval' | 'system' | 'reminder' | string;
  is_read?: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | string;
  is_active: boolean;
  badgeNumber?: string;
  created_at?: string;
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

