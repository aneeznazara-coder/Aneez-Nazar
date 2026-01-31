
import React, { useState, useEffect } from 'react';
import { 
  Appointment, 
  AppointmentStatus, 
  Prescription, 
  Doctor, 
  Transaction, 
  Role, 
  PatientProfile, 
  DoctorProfile 
} from './types';
import { ConsultationRoom } from './components/ConsultationRoom';
import { PrescriptionEditor } from './components/PrescriptionEditor';
import { PaymentGate } from './components/PaymentGate';

const INITIAL_QUEUE: Appointment[] = [
  { id: '1', patientId: 'P001', patientName: 'James Wilson', status: AppointmentStatus.WAITING, time: '09:00 AM', token: 'A1', reason: 'Severe headache and nausea' },
  { id: '2', patientId: 'P002', patientName: 'Sarah Chen', status: AppointmentStatus.WAITING, time: '09:30 AM', token: 'A2', reason: 'Seasonal allergies' },
  { id: '3', patientId: 'P003', patientName: 'Marcus Miller', status: AppointmentStatus.WAITING, time: '10:00 AM', token: 'A3', reason: 'Routine checkup' },
];

const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Helena Vance', specialty: 'Cardiologist', rating: 4.9, patientsServed: 1240, image: 'https://i.pravatar.cc/150?u=helena', availability: ['09:00 AM', '10:30 AM', '01:00 PM', '04:30 PM'] },
  { id: 'd2', name: 'Dr. Marcus Thorne', specialty: 'Neurologist', rating: 4.8, patientsServed: 850, image: 'https://i.pravatar.cc/150?u=marcus', availability: ['08:00 AM', '11:00 AM', '02:00 PM', '03:30 PM'] },
  { id: 'd3', name: 'Dr. Sarah Jenkins', specialty: 'Pediatrician', rating: 5.0, patientsServed: 2100, image: 'https://i.pravatar.cc/150?u=sarah', availability: ['09:15 AM', '10:45 AM', '12:00 PM', '02:15 PM'] },
  { id: 'd4', name: 'Dr. Robert Blake', specialty: 'Dermatologist', rating: 4.7, patientsServed: 630, image: 'https://i.pravatar.cc/150?u=robert', availability: ['10:00 AM', '01:30 PM', '03:00 PM', '05:00 PM'] },
];

const CLINICS = ["Aneez Specialty Clinic", "City Care Hospital", "Modern Wellness Center", "LifeLine Medical"];

const COUNTRY_CODES = [
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'IN' },
  { code: '+971', country: 'UAE' },
  { code: '+61', country: 'AU' },
  { code: '+81', country: 'JP' },
];

export default function App() {
  const [role, setRole] = useState<Role>('none');
  const [step, setStep] = useState(1);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  
  // Shared / Role-Specific View State
  const [view, setView] = useState('dashboard');
  const [queue, setQueue] = useState<Appointment[]>(INITIAL_QUEUE);
  const [activeConsultation, setActiveConsultation] = useState<Appointment | null>(null);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [showPayment, setShowPayment] = useState<Appointment | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{ time: string; token: string } | null>(null);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  const startVisit = (app: Appointment) => {
    setQueue(prev => prev.map(a => a.id === app.id ? { ...a, status: AppointmentStatus.IN_PROGRESS } : a));
    setActiveConsultation(app);
  };

  const onConsultationComplete = (prescription: Prescription) => {
    setActivePrescription(prescription);
  };

  const finalizePrescription = (finalPrescription: Prescription) => {
    if (activeConsultation) {
      setQueue(prev => prev.map(a => a.id === activeConsultation.id ? { ...a, status: AppointmentStatus.COMPLETED } : a));
    }
    setActiveConsultation(null);
    setActivePrescription(null);
    setView('queue');
  };

  const resetFlow = () => {
    setRole('none');
    setStep(1);
    setSelectedClinic(null);
    setSelectedDoctor(null);
    setBookingDetails(null);
  };

  // ---------------------------------------------------------------------------
  // ROLE SELECTION
  // ---------------------------------------------------------------------------
  if (role === 'none') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center animate-in zoom-in-95 duration-500">
          <div>
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Aneez Queue</h1>
            <p className="mt-4 text-slate-400 text-lg">Select your role to continue:</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => { setRole('patient'); setStep(1); }}
              className="group bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl border border-slate-700 transition-all text-left flex items-center justify-between"
            >
              <div>
                <p className="text-indigo-400 font-bold text-lg">1. Patient</p>
                <p className="text-slate-500 text-sm">Book appointments & track queue</p>
              </div>
              <svg className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            <button 
              onClick={() => { setRole('doctor'); setStep(1); }}
              className="group bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl border border-slate-700 transition-all text-left flex items-center justify-between"
            >
              <div>
                <p className="text-indigo-400 font-bold text-lg">2. Doctor</p>
                <p className="text-slate-500 text-sm">Manage queue & transcribe prescriptions</p>
              </div>
              <svg className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // PATIENT FLOW
  // ---------------------------------------------------------------------------
  if (role === 'patient') {
    // Step 1: Auth
    if (step === 1) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
            <button onClick={resetFlow} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Patient Login</h2>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <input 
                  required 
                  onChange={(e) => setPatientProfile({ ...patientProfile, name: e.target.value } as PatientProfile)} 
                  type="text" 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all" 
                  placeholder="Enter your name" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                <div className="flex mt-1 gap-2">
                  <select 
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-bold"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.country} ({c.code})</option>
                    ))}
                  </select>
                  <input 
                    required 
                    onChange={(e) => setPatientProfile({ ...patientProfile, phone: e.target.value } as PatientProfile)} 
                    type="tel" 
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all" 
                    placeholder="555 000-0000" 
                  />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                  Send OTP Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Step 2: Simulated OTP
    if (step === 2) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
            <button onClick={() => setStep(1)} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Verify OTP</h2>
            <p className="text-slate-500 mt-2">Enter the code sent to your phone</p>
            <div className="flex justify-center gap-2 my-8">
              {[1, 2, 3, 4].map(i => <input key={i} readOnly value="4" className="w-12 h-14 bg-slate-100 rounded-xl text-center text-2xl font-bold border-2 border-indigo-500 shadow-sm" />)}
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              Verify & Dashboard
            </button>
          </div>
        </div>
      );
    }

    // Step 3: Patient Dashboard
    if (step === 3) {
      return (
        <div className="min-h-screen bg-slate-50 p-8 max-w-4xl mx-auto space-y-8">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Hello, {patientProfile?.name}</h1>
              <p className="text-slate-500">Find and book your next consultation.</p>
            </div>
            <button onClick={resetFlow} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-all">Logout</button>
          </header>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Select Clinic</h2>
            <div className="grid grid-cols-2 gap-4">
              {CLINICS.map(clinic => (
                <button 
                  key={clinic} 
                  onClick={() => setSelectedClinic(clinic)}
                  className={`p-6 rounded-2xl border text-left transition-all ${
                    selectedClinic === clinic ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105' : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-bold">{clinic}</p>
                  <p className={`text-xs mt-1 ${selectedClinic === clinic ? 'text-indigo-100' : 'text-slate-400'}`}>3.2 miles away</p>
                </button>
              ))}
            </div>
          </section>

          {selectedClinic && (
            <section className="animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Choose Specialist</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOCTORS.map(doc => (
                  <button 
                    key={doc.id}
                    onClick={() => { setSelectedDoctor(doc); setStep(4); }}
                    className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 transition-all flex items-center gap-4 group"
                  >
                    <img src={doc.image} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800 group-hover:text-indigo-600">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.specialty}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-500 font-bold">⭐ {doc.rating}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      );
    }

    // Step 4: Booking Details
    if (step === 4) {
      return (
        <div className="min-h-screen bg-slate-50 p-8 max-w-2xl mx-auto">
          <button onClick={() => setStep(3)} className="text-indigo-600 font-bold flex items-center gap-2 mb-8 group">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            Back to Clinics
          </button>
          
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-indigo-600 p-8 text-white">
              <p className="text-indigo-200 font-bold uppercase tracking-wider text-xs">Confirm Booking</p>
              <h2 className="text-3xl font-bold mt-2">{selectedDoctor?.name}</h2>
              <p className="text-indigo-100 opacity-80 mt-1">{selectedClinic}</p>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <h3 className="font-bold text-slate-800 mb-4">Select Time Slot</h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedDoctor?.availability.map(time => (
                    <button 
                      key={time}
                      onClick={() => setBookingDetails({ time, token: 'TQ-' + Math.floor(Math.random() * 900 + 100) })}
                      className={`p-3 rounded-xl border font-bold text-sm transition-all ${
                        bookingDetails?.time === time ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100 hover:border-indigo-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {bookingDetails && (
                <button onClick={() => setStep(5)} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all animate-in zoom-in-95 duration-300">
                  Proceed to Payment
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Step 5: Payment
    if (step === 5) {
      return (
        <PaymentGate 
          amount={49.00} 
          onSuccess={() => setStep(6)} 
          onCancel={() => setStep(4)} 
        />
      );
    }

    // Step 6: Confirmation
    if (step === 6) {
      return (
        <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800">Confirmed!</h2>
              <p className="text-slate-500 mt-2">Your appointment has been secured.</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Token Number</span>
                <span className="text-2xl font-mono font-black text-indigo-600">{bookingDetails?.token}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700">{selectedDoctor?.name}</p>
                <p className="text-xs text-slate-500">{selectedClinic} • {bookingDetails?.time}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Current Queue Position</p>
                <p className="text-xl font-bold text-slate-800">4th in Line</p>
              </div>
            </div>

            <button 
              onClick={resetFlow}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl"
            >
              Back to Start
            </button>
          </div>
        </div>
      );
    }
  }

  // ---------------------------------------------------------------------------
  // DOCTOR FLOW
  // ---------------------------------------------------------------------------
  if (role === 'doctor') {
    // Step 1: Registration
    if (step === 1) {
      return (
        <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
          <div className="max-w-2xl w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
            <button onClick={resetFlow} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <h2 className="text-2xl font-bold text-slate-800 mb-8 border-b pb-4">Doctor Professional Registration</h2>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <input required type="text" onChange={(e) => setDoctorProfile({...doctorProfile, name: e.target.value} as DoctorProfile)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Date of Birth</label>
                <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Medical Degree</label>
                <input required type="text" placeholder="e.g. MBBS, MD" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Registration Number</label>
                <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Specialization</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500">
                  <option>General Medicine</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Pediatrics</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Years of Experience</label>
                <input required type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Certifications</label>
                <input type="text" placeholder="Optional" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Graduation Batch</label>
                <input required type="number" placeholder="YYYY" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 pt-6">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Step 2: Verification Simulation
    if (step === 2) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
          <div className="max-w-md w-full space-y-8 animate-in fade-in duration-500">
            <button onClick={() => setStep(1)} className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <div className="w-24 h-24 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mx-auto mb-8"></div>
            <h2 className="text-3xl font-bold">Verifying Documents...</h2>
            <p className="text-slate-400">Our system is validating your Medical Council Registration and Degree credentials.</p>
            <div className="bg-slate-800 p-6 rounded-2xl text-left text-sm border border-slate-700">
              <div className="flex items-center gap-3 text-green-400 mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Identity Confirmed
              </div>
              <div className="flex items-center gap-3 text-indigo-400 animate-pulse">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Checking Registration Number...
              </div>
            </div>
            <button 
              onClick={() => { setStep(3); setDoctorProfile({ ...doctorProfile, verified: true } as DoctorProfile); }} 
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
            >
              (DEBUG: Skip Wait)
            </button>
            {/* Auto-advance after 3s */}
            {(() => { setTimeout(() => setStep(3), 3000); return null; })()}
          </div>
        </div>
      );
    }

    // Step 3: Doctor Dashboard
    if (step === 3) {
      return (
        <div className="min-h-screen bg-slate-50 flex">
          {/* Sidebar */}
          <div className="w-64 bg-slate-900 h-screen text-slate-400 p-6 fixed left-0 top-0 flex flex-col border-r border-slate-800">
            <div className="flex items-center gap-3 mb-12 text-white">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <span className="text-xl font-bold">Aneez Doctor</span>
            </div>
            <nav className="space-y-2 flex-1">
              {[
                { id: 'dashboard', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                { id: 'queue', label: 'Patient Queue', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { id: 'billing', label: 'Billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                { id: 'account', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              ].map(link => (
                <button 
                  key={link.id} 
                  onClick={() => setView(link.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === link.id ? 'bg-indigo-600/10 text-indigo-400 font-bold border-r-4 border-indigo-500 rounded-r-none' : 'hover:bg-slate-800'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}/></svg>
                  {link.label}
                </button>
              ))}
            </nav>
            <button onClick={resetFlow} className="mt-auto text-xs font-bold text-red-500 uppercase p-4 hover:bg-red-500/10 rounded-xl transition-all">Sign Out</button>
          </div>

          <main className="ml-64 p-8 flex-1 max-w-6xl">
            {view === 'dashboard' && !activeConsultation && (
              <div className="space-y-8">
                <header>
                  <h1 className="text-3xl font-bold text-slate-900">Welcome, {doctorProfile?.name || 'Dr. Vance'}</h1>
                  <p className="text-slate-500 mt-1">Verification Status: <span className="text-green-600 font-bold">Verified ✅</span></p>
                </header>
                <div className="grid grid-cols-4 gap-6">
                  {[{l: 'Waitlist', v: '3'}, {l: 'Earnings', v: '$420'}, {l: 'Visits', v: '14'}, {l: 'Efficiency', v: '92%'}].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.l}</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{s.v}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200">
                   <h2 className="text-xl font-bold text-slate-800 mb-6">Today's Appointment Timeline</h2>
                   <div className="space-y-6">
                     {queue.map((app, idx) => (
                       <div key={app.id} className="flex gap-4 items-start relative">
                         <div className="w-12 text-xs font-bold text-slate-400 pt-1">{app.time}</div>
                         <div className="w-px h-full bg-slate-100 absolute left-14 top-8"></div>
                         <div className="w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-50 shadow-sm z-10"></div>
                         <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <div className="flex justify-between">
                             <p className="font-bold text-slate-800">{app.patientName}</p>
                             <span className="text-[10px] font-bold text-indigo-500 bg-white px-2 py-1 rounded border border-indigo-100">{app.token}</span>
                           </div>
                           <p className="text-xs text-slate-500 mt-1">{app.reason}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            )}

            {view === 'queue' && !activeConsultation && (
              <div className="space-y-8">
                <header>
                  <h1 className="text-3xl font-bold text-slate-900">Patient Queue</h1>
                  <p className="text-slate-500">Live order of arrivals for the day.</p>
                </header>
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr className="text-xs font-bold text-slate-400 uppercase">
                        <th className="px-6 py-4">Patient</th>
                        <th className="px-6 py-4">Token</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {queue.map(app => (
                        <tr key={app.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-800">{app.patientName}</p>
                            <p className="text-xs text-slate-500">Scheduled: {app.time}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono bg-slate-100 px-3 py-1 rounded-lg text-slate-600 font-bold">{app.token}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${app.status === 'WAITING' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{app.status}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {app.status === 'WAITING' && (
                              <button 
                                onClick={() => startVisit(app)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                Start Consultation
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeConsultation && (
              <div className="animate-in zoom-in-95 duration-500">
                {!activePrescription ? (
                  <ConsultationRoom 
                    appointment={activeConsultation} 
                    onComplete={onConsultationComplete} 
                  />
                ) : (
                  <PrescriptionEditor 
                    prescription={activePrescription} 
                    onSave={finalizePrescription}
                    onCancel={() => setActivePrescription(null)}
                  />
                )}
              </div>
            )}

            {(view === 'billing' || view === 'account') && !activeConsultation && (
               <div className="h-96 flex flex-col items-center justify-center text-slate-400">
                 <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                 <p className="mt-4 font-bold">Section in Review</p>
                 <p className="text-sm">Administrative metrics are loading...</p>
               </div>
            )}
          </main>
        </div>
      );
    }
  }

  return null;
}
