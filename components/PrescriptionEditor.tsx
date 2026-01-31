
import React from 'react';
import { Prescription } from '../types';

interface PrescriptionEditorProps {
  prescription: Prescription;
  onSave: (p: Prescription) => void;
  onCancel: () => void;
}

export const PrescriptionEditor: React.FC<PrescriptionEditorProps> = ({ prescription, onSave, onCancel }) => {
  const [edited, setEdited] = React.useState<Prescription>(prescription);

  const updateMed = (index: number, field: string, value: string) => {
    const newMeds = [...edited.medications];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setEdited({ ...edited, medications: newMeds });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
        Review Prescription
      </h3>
      
      <div className="space-y-4 mb-6">
        {edited.medications.map((med, idx) => (
          <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Medication</label>
              <input 
                className="w-full bg-transparent border-b border-slate-300 py-1 focus:border-blue-500 outline-none"
                value={med.name}
                onChange={(e) => updateMed(idx, 'name', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Dosage</label>
              <input 
                className="w-full bg-transparent border-b border-slate-300 py-1 focus:border-blue-500 outline-none"
                value={med.dosage}
                onChange={(e) => updateMed(idx, 'dosage', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Frequency</label>
              <input 
                className="w-full bg-transparent border-b border-slate-300 py-1 focus:border-blue-500 outline-none"
                value={med.frequency}
                onChange={(e) => updateMed(idx, 'frequency', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Duration</label>
              <input 
                className="w-full bg-transparent border-b border-slate-300 py-1 focus:border-blue-500 outline-none"
                value={med.duration}
                onChange={(e) => updateMed(idx, 'duration', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500 uppercase">General Instructions</label>
        <textarea 
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={edited.instructions}
          onChange={(e) => setEdited({...edited, instructions: e.target.value})}
        />
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button 
          onClick={onCancel}
          className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
        >
          Discard
        </button>
        <button 
          onClick={() => onSave(edited)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md shadow-blue-200 transition-all"
        >
          Finalize & Complete Visit
        </button>
      </div>
    </div>
  );
};
