
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcription]);

  const startConsultation = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `Transcribe this medical consultation between a Doctor and Patient (${appointment.patientName}). Be clinically accurate. Categorize findings.`,
        },
        callbacks: {
          onopen: () => {
            const source = audioCtxRef.current!.createMediaStreamSource(stream);
            const processor = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromiseRef.current?.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(processor);
            processor.connect(audioCtxRef.current!.destination);
          },
          onmessage: async (msg: any) => {
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
        }
      });
      setIsRecording(true);
    } catch (err) {
      console.error("Session failed", err);
    }
  };

  const stopConsultation = () => {
    setIsRecording(false);
    audioCtxRef.current?.close();
  };

  const generatePrescription = async () => {
    setIsProcessing(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fullText = transcription.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate clinical prescription JSON from this transcript: ${fullText}`,
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
                  }
                }
              },
              instructions: { type: Type.STRING },
              followUp: { type: Type.STRING }
            }
          }
        }
      });
      onComplete(JSON.parse(response.text || '{}'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] space-y-6">
      <div className="flex items-center justify-between bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Live Consultation Feed</h2>
          <p className="text-slate-500 font-medium text-sm">Patient: <span className="text-blue-600 font-bold">{appointment.patientName}</span></p>
        </div>
        <div className="flex gap-4">
          {!isRecording ? (
            <button 
              onClick={startConsultation}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              Start Listening
            </button>
          ) : (
            <button 
              onClick={stopConsultation}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100 animate-pulse"
            >
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
              Stop Session
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-8 bg-white rounded-xl border border-slate-200 shadow-inner">
        {transcription.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <svg className="w-12 h-12 opacity-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
            <p className="text-sm font-bold uppercase tracking-widest opacity-30">Waiting for clinical dialogue...</p>
          </div>
        ) : (
          transcription.map((turn, idx) => (
            <div key={idx} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-sm ${
                turn.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-br-none' 
                  : 'bg-blue-50 text-blue-900 rounded-bl-none border border-blue-100'
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">{turn.role === 'user' ? 'Practitioner' : 'Sync Log'}</p>
                <p className="text-md leading-relaxed">{turn.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {transcription.length > 0 && !isRecording && (
        <button 
          disabled={isProcessing}
          onClick={generatePrescription}
          className="w-full bg-blue-600 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          )}
          {isProcessing ? 'Transcribing Prescription...' : 'Generate Clinical Prescription Record'}
        </button>
      )}
    </div>
  );
};
