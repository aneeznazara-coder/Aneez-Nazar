
export enum AppointmentStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export type Role = 'none' | 'patient' | 'doctor';
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'hi' | 'zh' | 'ja';

export interface PatientProfile {
  name: string;
  phone: string;
  countryCode: string;
}

export interface DoctorProfile {
  name: string;
  dob: string;
  degree: string;
  regNumber: string;
  specialization: string;
  experience: string;
  certification: string;
  batchYear: string;
  verified: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  status: AppointmentStatus;
  time: string;
  token: string;
  reason: string;
  clinicName?: string;
  doctorName?: string;
}

export interface Prescription {
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  instructions: string;
  followUp: string;
}

export interface TranscriptionTurn {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  patientsServed: number;
  image: string;
  availability: string[];
}

export interface Transaction {
  id: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending';
}
