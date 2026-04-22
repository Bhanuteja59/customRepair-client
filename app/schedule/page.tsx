'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const SERVICES = [
  { id: 'hvac', label: 'HVAC / AC Repair', icon: '❄️', desc: 'Cooling, heating, tune-ups' },
  { id: 'furnace', label: 'Furnace / Heating', icon: '🔥', desc: 'Gas, heat pumps, electric' },
  { id: 'plumbing', label: 'Plumbing', icon: '💧', desc: 'Leaks, drains, water heaters' },
  { id: 'electrical', label: 'Electrical', icon: '⚡', desc: 'Panels, wiring, smart home' },
  { id: 'thermostat', label: 'Thermostat / Smart Home', icon: '🌡️', desc: 'Nest, Ecobee, Honeywell' },
  { id: 'other', label: 'Other / Not Sure', icon: '🔧', desc: 'Tell us what you need' },
];

const TIME_WINDOWS = [
  '8:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
  '6:00 PM – 8:00 PM',
];

type Step = 1 | 2 | 3;

function ScheduleContent() {
  const [step, setStep] = useState<Step>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', date: '', time: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [availableSlots, setAvailableSlots] = useState<Record<string, {id: string, time: string}[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const toggleService = (label: string) => {
    setSelectedServices((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const router = useRouter();
  const searchParams = useSearchParams();

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

  const fetchAvailableSlots = async (service: string, silent = false) => {
    if (!silent) setLoadingSlots(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiBase}/api/public/available-slots?service=${encodeURIComponent(service)}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data);
        // Clear selected time if its slot was just removed
        setForm(f => {
          if (f.time && f.date && !data[f.date]?.some((s: {time: string}) => s.time === f.time)) {
            return { ...f, time: '' };
          }
          return f;
        });
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    } finally {
      if (!silent) setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedServices.length > 0) {
      fetchAvailableSlots(selectedServices.join(', '));
    }
  }, [selectedServices]);

  // Real-time polling: refresh slots every 30s while on step 3
  useEffect(() => {
    if (step !== 3 || selectedServices.length === 0) return;
    const interval = setInterval(() => {
      fetchAvailableSlots(selectedServices.join(', '), true);
    }, 30000);
    return () => clearInterval(interval);
  }, [step, selectedServices]);

  const handleSubmit = async () => {
    // Find the slot object to get the ID
    const daySlots = availableSlots[form.date] || [];
    const selectedSlot = daySlots.find(s => s.time === form.time);
    
    submitFinal(selectedServices, { ...form, slot_id: selectedSlot?.id });
  };

  const submitFinal = async (services: string[], formData: any) => {
    setSubmitting(true);
    setError('');
    const token = localStorage.getItem('customer_token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/schedule`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          service: services.join(', '),
          ...formData
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Booking failed. Please try again.');
      }
      const data = await res.json();
      setBookingRef(data.customer_id || '');
      setDone(true);
      
      // Auto-redirect to dashboard after 3 seconds only if logged in
      if (token) {
        setTimeout(() => router.push('/dashboard'), 3000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep2 = form.name && form.phone && form.email;
  const canProceedStep3 = form.date && form.time;

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

                  {/* Step 3: Timing */}
                  {step === 3 && (
                    <div className="space-y-8">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-3xl font-[1000] italic tracking-tighter text-[#001d4a] mb-2">When do you need us?</h2>
                          <p className="text-gray-400 font-bold">Technicians typically arrive within the 2-hour window.</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 mt-1 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Live</span>
                        </div>
                      </div>

                      {/* No workers available at all */}
                      {!loadingSlots && Object.keys(availableSlots).length === 0 ? (
                        <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[28px] text-center space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-3xl">🔧</span>
                          </div>
                          <div>
                            <p className="text-lg font-black text-[#001d4a] mb-2">No Free Workers Available</p>
                            <p className="text-sm font-bold text-gray-400 leading-relaxed max-w-sm mx-auto">
                              All our technicians are currently fully booked or off-shift for <span className="text-[#001d4a]">{selectedServices.join(' & ')}</span>.
                              Our team will check back shortly — or call us to be added to the waitlist.
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <a href="tel:+15551234567" className="inline-flex items-center gap-2 px-5 py-3 bg-[#001d4a] text-white rounded-2xl font-black text-sm hover:bg-[#002b6b] transition-all">
                              📞 Call Now
                            </a>
                            <button
                              onClick={() => fetchAvailableSlots(selectedServices.join(', '))}
                              className="inline-flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-2xl font-black text-sm text-gray-500 hover:border-[#001d4a] hover:text-[#001d4a] transition-all"
                            >
                              ↻ Refresh
                            </button>
                          </div>
                        </div>
                      ) : (
                      <div className="space-y-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Date *</label>
                            <input
                              type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => set('date', e.target.value)}
                              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold text-[#001d4a] outline-none focus:border-[#001d4a] focus:bg-white transition-all shadow-inner"
                            />
                          </div>

                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Arrival Window *</label>

                            {loadingSlots ? (
                              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl animate-pulse">
                                <div className="w-5 h-5 rounded-full bg-gray-200" />
                                <div className="h-4 w-32 bg-gray-200 rounded" />
                              </div>
                            ) : (
                              <>
                                {form.date && (!availableSlots[form.date] || availableSlots[form.date].length === 0) ? (
                                  <div className="space-y-6 animate-fadeIn">
                                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-[24px] flex items-start gap-4">
                                      <span className="text-2xl">📅</span>
                                      <div>
                                        <p className="text-sm font-black text-amber-900 mb-1">No technicians available on this date</p>
                                        <p className="text-[11px] font-bold text-amber-700 leading-tight">
                                          Workers have no open slots for the selected date.
                                          Choose from the next available days below:
                                        </p>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Next Available Dates</p>
                                      <div className="flex flex-wrap gap-2">
                                        {Object.keys(availableSlots).sort().slice(0, 5).map(date => (
                                          <button
                                            key={date}
                                            onClick={() => set('date', date)}
                                            className="px-5 py-3 bg-white border-2 border-gray-100 rounded-2xl text-xs font-black text-[#001d4a] hover:border-[#e31b23] hover:text-[#e31b23] transition-all shadow-sm hover:shadow-md"
                                          >
                                            {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ) : !form.date ? (
                                  <div className="space-y-3">
                                    <p className="text-[11px] font-bold text-gray-400">Select a date above. Available worker slots:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {Object.keys(availableSlots).sort().slice(0, 5).map(date => (
                                        <button
                                          key={date}
                                          onClick={() => set('date', date)}
                                          className="px-5 py-3 bg-white border-2 border-gray-100 rounded-2xl text-xs font-black text-[#001d4a] hover:border-[#e31b23] hover:text-[#e31b23] transition-all shadow-sm hover:shadow-md"
                                        >
                                          {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                          <span className="ml-1.5 text-[9px] text-gray-400">{availableSlots[date].length} slot{availableSlots[date].length !== 1 ? 's' : ''}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(availableSlots[form.date] || []).map((slot) => (
                                      <button
                                        key={`${slot.id}-${slot.time}`}
                                        onClick={() => set('time', slot.time)}
                                        className={`
                                          py-4 px-6 rounded-2xl border-2 font-black text-sm transition-all text-left flex items-center justify-between group
                                          ${form.time === slot.time ? 'border-red-500 bg-red-50/50 text-[#001d4a]' : 'border-gray-100 text-gray-400 hover:border-blue-200'}
                                        `}
                                      >
                                        <span>🕐 {slot.time}</span>
                                        {form.time === slot.time && <span className="w-2 h-2 rounded-full bg-red-500" />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Final Summary Card */}
                          {canProceedStep3 && (
                            <div className="bg-[#001d4a] rounded-3xl p-8 text-white relative overflow-hidden animate-slideUp">
                               {/* Background highlight */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-20 blur-3xl -mr-16 -mt-16" />
                              
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Summary of Service</p>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">⚡</span>
                                  <p className="font-black text-lg tracking-tight">{selectedServices.join(' & ')}</p>
                                </div>
                                <div className="flex items-center gap-3 text-white/60 font-bold text-sm">
                                  <span>📅</span>
                                  <p>{form.date} at {form.time}</p>
                                </div>
                                <div className="flex items-center gap-3 text-white/60 font-bold text-sm">
                                  <span>📍</span>
                                  <p>{form.address || 'Address on file'}</p>
                                </div>
                              </div>
                            </div>
                          )}

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
                              {submitting ? 'Connecting...' : 'Confirm Fast Booking ✓'}
                            </button>
                          </div>
                      </div>
                      )}

                      {/* Back button always visible even when no slots */}
                      {Object.keys(availableSlots).length === 0 && !loadingSlots && (
                        <div className="flex gap-4 pt-2">
                          <button onClick={() => setStep(2)} className="flex-1 py-5 rounded-2xl font-black text-gray-400 border-2 border-gray-100 hover:border-gray-200 hover:text-gray-600 transition-all">
                            ← Back
                          </button>
                        </div>
                      )}
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

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ScheduleContent />
    </Suspense>
  );
}
