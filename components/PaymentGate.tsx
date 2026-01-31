
import React, { useState } from 'react';

interface PaymentGateProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentGate: React.FC<PaymentGateProps> = ({ amount, onSuccess, onCancel }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(onSuccess, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {step === 'details' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Secure Checkout</h2>
              <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center text-blue-900 font-semibold">
                <span>Consultation Fee</span>
                <span className="text-2xl">${amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Card Number</label>
                <div className="mt-1 relative">
                  <input readOnly value="4242 4242 4242 4242" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono" />
                  <div className="absolute right-3 top-3 text-slate-400">VISA</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Expiry</label>
                  <input readOnly value="12/26" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">CVC</label>
                  <input readOnly value="123" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono" />
                </div>
              </div>
            </div>

            <button 
              onClick={handlePay}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-8 transition-all shadow-lg shadow-blue-200"
            >
              Pay ${amount.toFixed(2)}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 italic">This is a simulation. No real charges will occur.</p>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-slate-800">Processing Payment</h3>
            <p className="text-slate-500 text-center mt-2">Connecting to secure gateway...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Payment Successful</h3>
            <p className="text-slate-500 mt-2">Your consultation record has been updated.</p>
          </div>
        )}
      </div>
    </div>
  );
};
