
import React, { useState } from 'react';
import { 
  Appointment, 
  AppointmentStatus, 
  Prescription, 
  Doctor, 
  Role, 
  Language,
  PatientProfile, 
  DoctorProfile 
} from './types';
import { ConsultationRoom } from './components/ConsultationRoom';
import { PrescriptionEditor } from './components/PrescriptionEditor';
import { PaymentGate } from './components/PaymentGate';

const INITIAL_QUEUE: Appointment[] = [
  { id: '1', patientId: 'P001', patientName: 'James Wilson', status: AppointmentStatus.WAITING, time: '09:00 AM', token: 'A1', reason: 'Routine checkup' },
  { id: '2', patientId: 'P002', patientName: 'Sarah Chen', status: AppointmentStatus.WAITING, time: '09:30 AM', token: 'A2', reason: 'Seasonal allergies' },
];

const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Hari Haran', specialty: 'Obstetrician & Gynecologist', rating: 4.9, patientsServed: 1540, image: 'https://i.pravatar.cc/150?u=hari', availability: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'] },
  { id: 'd2', name: 'Dr. Abrar Ahamed', specialty: 'Fertility Specialist', rating: 4.8, patientsServed: 920, image: 'https://i.pravatar.cc/150?u=abrar', availability: ['08:30 AM', '10:30 AM', '02:30 PM', '04:30 PM'] },
  { id: 'd3', name: 'Dr. Antony', specialty: 'Prenatal Consultant', rating: 5.0, patientsServed: 2450, image: 'https://i.pravatar.cc/150?u=antony', availability: ['10:00 AM', '12:00 PM', '02:00 PM', '05:00 PM'] },
];

const CLINICS = ["City Wellness Center", "Modern Medical Clinic", "Godwin Pregnancy Clinic"];
const SPECIALIZATIONS = ["Obstetrics & Gynecology", "Fertility Specialist", "General Physician", "Pediatrics"];

export default function App() {
  const [role,