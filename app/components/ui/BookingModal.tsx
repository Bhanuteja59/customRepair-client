'use client';

import { useState } from 'react';

const services = ['HVAC Repair', 'AC Installation', 'Plumbing', 'Electrical', 'Water Heater', 'Other'];
const times = ['8:00 AM – 10:00 AM', '10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM', '2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM'];

export const BookingModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ service: '', name: '', phone: '', address: '', date: '', time: '' });

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#004a99] px-8 py-6 flex justify-between items-center">
          <div>
            <p className="text-amber-300 text-xs font-black uppercase tracking-widest">Step {step} of 2</p>
            <h2 className="text-white text-2xl font-black italic tracking-tighter">
              {step === 1 ? 'Select Your Service' : 'Your Details'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl font-bold transition-colors">✕</button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div className="h-1 bg-[#e31b23] transition-all duration-300" style={{ width: step === 1 ? '50%' : '100%' }} />
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Service Needed</label>
                <div className="grid grid-cols-2 gap-3">
                  {services.map((s) => (
                    <button
                      key={s}
                      onClick={() => update('service', s)}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all text-left ${
                        form.service === s
                          ? 'border-[#004a99] bg-blue-50 text-[#004a99]'
                          : 'border-gray-200 hover:border-[#004a99] text-gray-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => form.service && setStep(2)}
                disabled={!form.service}
                className="w-full bg-[#004a99] text-white py-4 rounded-xl font-black uppercase tracking-tight hover:bg-[#003366] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continue →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Smith' },
                { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 000-0000' },
                { key: 'address', label: 'Service Address', type: 'text', placeholder: '123 Main St, Atlanta, GA' },
                { key: 'date', label: 'Preferred Date', type: 'date', placeholder: '' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#004a99] focus:outline-none transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5">Preferred Time</label>
                <select
                  value={form.time}
                  onChange={(e) => update('time', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#004a99] focus:outline-none transition-colors"
                >
                  <option value="">Select a window</option>
                  {times.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-black hover:border-gray-400 transition-all">
                  ← Back
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-[#e31b23] text-white py-3 rounded-xl font-black uppercase tracking-tight hover:bg-[#b3151a] transition-all"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
