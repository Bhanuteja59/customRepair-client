'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const SERVICES = [
  { id: 'hvac', label: 'HVAC / AC Repair', icon: '❄️', desc: 'Cooling, heating, tune-ups' },
  { id: 'furnace', label: 'Furnace / Heating', icon: '🔥', desc: 'Gas, heat pumps, electric' },
  { id: 'plumbing', label: 'Plumbing', icon: '💧', desc: 'Leaks, drains, water heaters' },
  { id: 'electrical', label: 'Electrical', icon: '⚡', desc: 'Panels, wiring, smart home' },
  { id: 'thermostat', label: 'Thermostat / Smart Home', icon: '🌡️', desc: 'Nest, Ecobee, Honeywell' },
  { id: 'other', label: 'Other / Not Sure', icon: '🔧', desc: 'Tell us what you need' },
];

type Step = 1 | 2 | 3;

interface AvailableSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  display: string;
}

interface SkillGroup {
  skill: string;
  slots: AvailableSlot[];
  available: boolean;
}

type SlotResponseType = 'single_worker' | 'split_required' | 'unavailable';

interface SlotResponse {
  type: SlotResponseType;
  slots?: AvailableSlot[];
  required_skills?: string[];
  skill_groups?: SkillGroup[];
  all_skills_covered?: boolean;
  missing_skills?: string[];
  message?: string;
}

export default function SchedulePage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', date: '', time: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [bookingRef, setBookingRef] = useState('');

  // Slot state
  const [slotResponse, setSlotResponse] = useState<SlotResponse | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const toggleService = (label: string) => {
    setSelectedServices((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch available worker slots whenever date or services change (in step 3)
  const fetchSlots = useCallback(async (date: string, services: string[]) => {
    if (!date || services.length === 0) return;
    setSlotsLoading(true);
    setSlotResponse(null);
    setSelectedSlotId('');
    try {
      const serviceParam = encodeURIComponent(services.join(', '));
      const res = await fetch(`${API}/api/slots/available?service=${serviceParam}&date=${date}`);
      if (res.ok) {
        const data: SlotResponse = await res.json();
        setSlotResponse(data);
      }
    } catch {
      // silently fail — user will see empty state
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Check for resume
    const isResuming = searchParams.get('resume') === 'true';
    if (isResuming) {
       const saved = localStorage.getItem('pending_booking');
       if (saved) {
          const { services, form: savedForm } = JSON.parse(saved);
          setSelectedServices(services);
          setForm(savedForm);
          setStep(3);
          localStorage.removeItem('pending_booking');
          setTimeout(() => submitFinal(services, savedForm), 500);
       }
    }

    // 2. Pre-fill for logged in users
    const userDataStr = localStorage.getItem('customer_data');
    if (userDataStr) {
       try {
         const user = JSON.parse(userDataStr);
         setForm(f => ({
           ...f,
           name: f.name || user.name || '',
           email: f.email || user.email || '',
           phone: f.phone || user.phone || '',
           address: f.address || user.address || ''
         }));
       } catch (e) {}
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    const token = localStorage.getItem('customer_token');
    
    if (!token) {
       // Save state and redirect to login
       localStorage.setItem('pending_booking', JSON.stringify({
          services: selectedServices,
          form
       }));
       router.push('/login');
       return;
    }

    submitFinal(selectedServices, form);
  };

  const submitFinal = async (services: string[], formData: any) => {
    setSubmitting(true);
    setError('');
    const token = localStorage.getItem('customer_token');
    
    try {
      const res = await fetch(`${API}/api/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          service: services.join(', '),
          ...formData,
          slot_id: selectedSlotId || undefined,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Booking failed. Please try again.');
      }
      const data = await res.json();
      setBookingRef(data.customer_id || '');
      setDone(true);
      
      // Auto-redirect to dashboard after 3 seconds
      setTimeout(() => router.push('/dashboard'), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch slots when date changes while on step 3
  useEffect(() => {
    if (step === 3 && form.date && selectedServices.length > 0) {
      fetchSlots(form.date, selectedServices);
    }
  }, [step, form.date, selectedServices, fetchSlots]);

  const availableSlots: AvailableSlot[] = slotResponse?.type === 'single_worker' ? (slotResponse.slots ?? []) : [];
  const canProceedStep2 = form.name && form.phone && form.email;
  const canProceedStep3 = form.date && selectedSlotId && slotResponse?.type === 'single_worker';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero / Header Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#001d4a]/5 to-transparent pointer-events-none" />
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-blue-400/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[15%] w-72 h-72 bg-red-400/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-block py-1 px-4 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-600">Online Booking · Same Day Available</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-[1000] italic tracking-tighter text-[#001d4a] mb-6 leading-[1.1]">
            Schedule Your <span style={{ color: '#e31b23' }}>Service</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg max-w-xl mx-auto leading-relaxed">
            Pick your repair service, tell us when works for you, and we'll confirm your technician within 60 minutes.
          </p>
        </div>
      </section>

      {/* Main Booking Container */}
      <section className="pb-32 relative z-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,29,74,0.12)] border border-gray-100 overflow-hidden">
            
            {/* Multi-step Header */}
            <div className="bg-[#001d4a] p-8 md:p-12 relative overflow-hidden">
               {/* Accent patterns */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 -mr-10 -mt-10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 -ml-10 -mb-10 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4 mb-8">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="flex flex-col items-center flex-1 group">
                      <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg mb-3 transition-all duration-300
                        ${step === num ? 'bg-[#e31b23] text-white scale-110 shadow-lg shadow-red-500/40' : 
                          step > num ? 'bg-green-500 text-white' : 'bg-white/10 text-white/40 border border-white/10'}
                      `}>
                        {step > num ? '✓' : `0${num}`}
                      </div>
                      <span className={`text-[10px] uppercase font-black tracking-widest transition-colors duration-300
                        ${step === num ? 'text-white' : 'text-white/30'}
                      `}>
                        {num === 1 ? 'Service' : num === 2 ? 'Details' : 'Timing'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress Strip */}
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-700 ease-out"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Form Content Body */}
            <div className="p-8 md:p-12">
              {done ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <span className="text-5xl">🎉</span>
                  </div>
                  <h2 className="text-4xl font-[1000] italic tracking-tighter text-[#001d4a] mb-4">Booking Confirmed!</h2>
                  {bookingRef && (
                    <div className="inline-block bg-blue-50 border border-blue-100 rounded-2xl px-6 py-3 mb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Your Booking Reference</p>
                      <p className="text-2xl font-[1000] tracking-tighter text-[#001d4a]">{bookingRef}</p>
                    </div>
                  )}
                  <p className="text-gray-500 font-bold text-lg mb-4 max-w-sm mx-auto">
                    We've received your request for <span className="text-[#001d4a]">{selectedServices.join(' & ')}</span>.
                  </p>
                  <p className="text-gray-400 font-bold text-sm mb-8 max-w-sm mx-auto">
                    A technician will call <span className="text-red-500 font-black">{form.phone}</span> shortly to confirm your arrival window for <span className="font-black text-[#001d4a]">{form.date}</span>.
                  </p>
                  <Link href="/" className="inline-block bg-[#001d4a] text-white font-black px-10 py-5 rounded-2xl shadow-xl hover:bg-[#002b6b] transition-all active:scale-95">
                    Return Home
                  </Link>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  {/* Step 1: Services */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-[1000] italic tracking-tighter text-[#001d4a] mb-2">What's the issue?</h2>
                        <p className="text-gray-400 font-bold">Select all that apply to your current situation.</p>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        {SERVICES.map((svc) => {
                          const isSelected = selectedServices.includes(svc.label);
                          return (
                            <button
                              key={svc.id}
                              onClick={() => toggleService(svc.label)}
                              className={`
                                relative p-6 rounded-3xl border-2 text-left transition-all duration-300 flex items-start gap-4 overflow-hidden group
                                ${isSelected ? 'border-red-500 bg-red-50/50 scale-[0.98]' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'}
                              `}
                            >
                              {isSelected && (
                                <div className="absolute top-4 right-4 text-red-500">
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{svc.icon}</span>
                              <div>
                                <h3 className={`font-black text-sm mb-1 ${isSelected ? 'text-[#001d4a]' : 'text-gray-700'}`}>{svc.label}</h3>
                                <p className="text-gray-400 text-[11px] font-bold tracking-tight uppercase">{svc.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => selectedServices.length > 0 && setStep(2)}
                        disabled={selectedServices.length === 0}
                        className={`
                          w-full py-6 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3
                          ${selectedServices.length > 0 ? 'bg-[#e31b23] text-white hover:bg-red-600 shadow-red-500/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                        `}
                      >
                        Next Step: Enter Details
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Step 2: Contact Details */}
                  {step === 2 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-[1000] italic tracking-tighter text-[#001d4a] mb-2">Who should we contact?</h2>
                        <p className="text-gray-400 font-bold">Provide your contact info for arrival alerts.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name *</label>
                            <input
                              type="text" placeholder="John Smith" value={form.name}
                              onChange={(e) => set('name', e.target.value)}
                              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold text-[#001d4a] outline-none focus:border-[#001d4a] focus:bg-white transition-all shadow-inner"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone *</label>
                            <input
                              type="tel" placeholder="(555) 000-0000" value={form.phone}
                              onChange={(e) => set('phone', e.target.value)}
                              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold text-[#001d4a] outline-none focus:border-[#001d4a] focus:bg-white transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address *</label>
                          <input
                            type="email" placeholder="john@example.com" value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold text-[#001d4a] outline-none focus:border-[#001d4a] focus:bg-white transition-all shadow-inner"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Service Address</label>
                          <input
                            type="text" placeholder="123 Main St, Atlanta, GA 30301" value={form.address}
                            onChange={(e) => set('address', e.target.value)}
                            className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold text-[#001d4a] outline-none focus:border-[#001d4a] focus:bg-white transition-all shadow-inner"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Notes (Optional)</label>
                          <textarea
                            rows={3} placeholder="Tell us more about the symptoms..." value={form.notes}
                            onChange={(e) => set('notes', e.target.value)}
                            className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold text-[#001d4a] outline-none focus:border-[#001d4a] focus:bg-white transition-all shadow-inner resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl font-black text-gray-400 border-2 border-gray-100 hover:border-gray-200 hover:text-gray-600 transition-all">
                          ← Back
                        </button>
                        <button
                          onClick={() => canProceedStep2 && setStep(3)}
                          disabled={!canProceedStep2}
                          className={`
                            flex-[2] py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3
                            ${canProceedStep2 ? 'bg-[#e31b23] text-white hover:bg-red-600 shadow-red-500/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                          `}
                        >
                          Pick Arrival Time →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Pick a Worker Slot */}
                  {step === 3 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-[1000] italic tracking-tighter text-[#001d4a] mb-2">Pick Your Arrival Slot</h2>
                        <p className="text-gray-400 font-bold">Choose a date — we'll show you the real available windows from our technicians.</p>
                      </div>

                      <div className="space-y-8">
                        {/* Date Picker */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Date *</label>
                          <input
                            type="date"
                            value={form.date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => { set('date', e.target.value); setSelectedSlotId(''); }}
                            className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold text-[#001d4a] outline-none focus:border-[#001d4a] focus:bg-white transition-all shadow-inner"
                          />
                        </div>

                        {/* Available Slots */}
                        {form.date && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                              Available Windows *
                              {slotsLoading && <span className="ml-2 text-blue-400 normal-case">Checking availability...</span>}
                            </label>

                            {/* Loading skeleton */}
                            {slotsLoading && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                                {[1,2,3,4].map(n => (
                                  <div key={n} className="h-14 rounded-2xl bg-gray-100" />
                                ))}
                              </div>
                            )}

                            {/* ── CASE 1: Single worker can do everything ── */}
                            {!slotsLoading && slotResponse?.type === 'single_worker' && availableSlots.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {availableSlots.map((slot) => {
                                  const isSelected = selectedSlotId === slot.id;
                                  return (
                                    <button
                                      key={slot.id}
                                      onClick={() => setSelectedSlotId(slot.id)}
                                      className={`
                                        py-4 px-6 rounded-2xl border-2 font-black text-sm transition-all text-left flex items-center justify-between
                                        ${isSelected ? 'border-red-500 bg-red-50/50 text-[#001d4a]' : 'border-gray-100 text-gray-400 hover:border-blue-200 hover:bg-blue-50/20'}
                                      `}
                                    >
                                      <span>🕐 {slot.display}</span>
                                      {isSelected && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* ── CASE 2: Split required — no single worker covers all skills ── */}
                            {!slotsLoading && slotResponse?.type === 'split_required' && (
                              <div className="space-y-4">
                                {/* Notice banner */}
                                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
                                  <div className="flex items-start gap-3">
                                    <span className="text-2xl shrink-0">⚠️</span>
                                    <div>
                                      <p className="font-black text-amber-800 text-sm mb-1">No single technician available for all selected services</p>
                                      <p className="text-amber-700 text-xs font-bold leading-relaxed">
                                        We currently don't have one technician who can handle{' '}
                                        <span className="text-amber-900">{selectedServices.join(' & ')}</span>{' '}
                                        together on this date. Here's what's available individually:
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Per-skill slot groups */}
                                {slotResponse.skill_groups?.map((group) => (
                                  <div key={group.skill} className="rounded-2xl border-2 border-gray-100 p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        {group.skill.toUpperCase()} Specialist
                                      </p>
                                      {group.available
                                        ? <span className="text-[10px] font-black uppercase tracking-wider text-green-600 bg-green-50 px-3 py-1 rounded-full">Available</span>
                                        : <span className="text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-50 px-3 py-1 rounded-full">No Slots</span>
                                      }
                                    </div>
                                    {group.available ? (
                                      <div className="flex flex-wrap gap-2">
                                        {group.slots.map((s) => (
                                          <span key={s.id} className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-500">
                                            🕐 {s.display}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-400 font-bold">No technicians free on this date for this service.</p>
                                    )}
                                  </div>
                                ))}

                                {/* Guidance */}
                                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-center">
                                  <p className="text-xs font-black text-blue-700">
                                    💡 Try a different date — or book each service separately to lock individual technicians.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* ── CASE 3: Nothing available at all ── */}
                            {!slotsLoading && (slotResponse?.type === 'unavailable' || (!slotResponse && !slotsLoading && form.date)) && (
                              <div className="rounded-2xl border-2 border-dashed border-gray-200 py-10 text-center">
                                <p className="text-2xl mb-3">📅</p>
                                <p className="font-black text-gray-500 text-sm">No technician slots available on this date.</p>
                                <p className="text-gray-400 text-xs font-bold mt-1">Our technicians update their schedules daily — try another date.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Summary Card — only for confirmed single-worker booking */}
                        {canProceedStep3 && (() => {
                          const chosen = availableSlots.find((s: AvailableSlot) => s.id === selectedSlotId);
                          return (
                            <div className="bg-[#001d4a] rounded-3xl p-8 text-white relative overflow-hidden animate-slideUp">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-20 blur-3xl -mr-16 -mt-16" />
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Booking Summary</p>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">⚡</span>
                                  <p className="font-black text-lg tracking-tight">{selectedServices.join(' & ')}</p>
                                </div>
                                <div className="flex items-center gap-3 text-white/60 font-bold text-sm">
                                  <span>📅</span>
                                  <p>{form.date} · {chosen?.display}</p>
                                </div>
                                <div className="flex items-center gap-3 text-white/60 font-bold text-sm">
                                  <span>📍</span>
                                  <p>{form.address || 'Address on file'}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {error && (
                          <p className="text-red-500 text-sm font-black text-center bg-red-50 py-3 rounded-xl border border-red-100">⚠️ {error}</p>
                        )}

                        <div className="flex gap-4 pt-4">
                          <button onClick={() => setStep(2)} className="flex-1 py-5 rounded-2xl font-black text-gray-400 border-2 border-gray-100 hover:border-gray-200 hover:text-gray-600 transition-all">
                            ← Back
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={!canProceedStep3 || submitting}
                            className={`
                              flex-[2] py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3
                              ${canProceedStep3 && !submitting ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                            `}
                          >
                            {submitting ? 'Locking your slot...' : 'Confirm Booking ✓'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Trust Footer */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">Trusted by 10,000+ Metro Atlanta Homeowners</p>
            <div className="flex justify-center flex-wrap gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               {/* Just text logos for now */}
               <span className="font-black text-xl italic tracking-tighter">GOOGLE 4.8★</span>
               <span className="font-black text-xl italic tracking-tighter">YELP</span>
               <span className="font-black text-xl italic tracking-tighter">NEXTDOOR</span>
               <span className="font-black text-xl italic tracking-tighter">BBB A+</span>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
