
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { Appointment, TranscriptionTurn, Prescription } from '../types';
import { createPcmBlob } from '../services/audioUtils';

interface ConsultationRoomProps {
  appointment: Appointment;
  onComplete: (prescription: Prescription) => void;
}

export const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ appointment, onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionTurn[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<any>(null);
  const currentTurnRef = useRef({ input: '', output: '' });

  const startConsultation = async () => {
    try {
      // Fix: Use named parameter for apiKey and directly access process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are a medical assistant transcribing a consultation for ${appointment.patientName}. 
          Focus on identifying symptoms, medications discussed, dosages, and follow-up advice. 
          Respond naturally but prioritize clarity in the transcription stream.`,
        },
        callbacks: {
          onopen: () => {
            const source = audioCtxRef.current!.createMediaStreamSource(stream);
            const processor = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves and then call session.sendRealtimeInput
              sessionPromiseRef.current?.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(audioCtxRef.current!.destination);
          },
          onmessage: async (msg: any) => {
            // Fix: Standardized transcription handling
            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              currentTurnRef.current.input += text;
              setTranscription(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'user') {
                  return [...prev.slice(0, -1), { ...last, text: currentTurnRef.current.input }];
                }
                return [...prev, { role: 'user', text, timestamp: Date.now() }];
              });
            }
            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              currentTurnRef.current.output += text;
              setTranscription(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'model') {
                  return [...prev.slice(0, -1), { ...last, text: currentTurnRef.current.output }];
                }
                return [...prev, { role: 'model', text, timestamp: Date.now() }];
              });
            }
            if (msg.serverContent?.turnComplete) {
              currentTurnRef.current = { input: '', output: '' };
            }
          },
          onerror: (e: any) => console.error("Live API Error:", e),
          onclose: (e: any) => console.debug("Session closed:", e),
        }
      });

      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start consultation", err);
    }
  };

  const stopConsultation = () => {
    setIsRecording(false);
    audioCtxRef.current?.close();
  };

  const generatePrescription = async () => {
    setIsProcessing(true);
    // Fix: Use named parameter for apiKey and directly access process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fullText = transcription.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on the following doctor-patient consultation transcript, generate a structured prescription JSON:
        
        ${fullText}
        
        Reason for visit: ${appointment.reason}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              medications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    dosage: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    duration: { type: Type.STRING },
                  },
                  required: ['name', 'dosage', 'frequency', 'duration']
                }
              },
              instructions: { type: Type.STRING },
              followUp: { type: Type.STRING }
            },
            required: ['medications', 'instructions', 'followUp']
          }
        }
      });

      // Fix: Access response text using the .text property
      const jsonStr = response.text || '{}';
      const data = JSON.parse(jsonStr) as Prescription;
      onComplete(data);
    } catch (err) {
      console.error("Prescription generation failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Consultation Room</h2>
          <p className="text-slate-500">Patient: <span className="font-semibold">{appointment.patientName}</span> • ID: {appointment.patientId}</p>
        </div>
        <div className="flex gap-3">
          {!isRecording ? (
            <button 
              onClick={startConsultation}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-blue-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
              Start Recording
            </button>
          ) : (
            <button 
              onClick={stopConsultation}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-red-200"
            >
              <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd"/></svg>
              Stop & Transcribe
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 scroll-smooth">
        {transcription.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
            <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            <p className="text-lg">Voice transcription will appear here in real-time...</p>
          </div>
        ) : (
          transcription.map((turn, idx) => (
            <div key={idx} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                turn.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
              }`}>
                <p className="text-sm font-bold opacity-75 mb-1">{turn.role === 'user' ? 'Doctor' : 'Assistant'}</p>
                <p>{turn.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {transcription.length > 0 && !isRecording && (
        <div className="sticky bottom-0 bg-slate-50 p-4 border-t border-slate-200 rounded-b-2xl">
          <button 
            disabled={isProcessing}
            onClick={generatePrescription}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all"
          >
            {isProcessing ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : null}
            {isProcessing ? 'Summarizing Medical Notes...' : 'Review & Generate Prescription'}
          </button>
        </div>
      )}
    </div>
  );
};
