'use client';

import { useState } from 'react';

const services = ['HVAC Repair', 'AC Installation', 'Plumbing', 'Electrical', 'Water Heater', 'Other'];

export default function ContactPage() {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => { e.preventDefault(); setDone(true); };

  const inputCls = "w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors";
  const labelCls = "block text-xs font-black uppercase tracking-widest mb-1.5";

  return (
    <>
      {/* Hero */}
      <section className="py-20 text-center section-gradient border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6">
          <p className="eyebrow">Get In Touch</p>
          <h1 className="section-title mb-3">Let's Fix It Together</h1>
          <p className="text-gray-500 font-medium text-base">
            Schedule a visit, get a quote, or ask a question. We respond within 1 business hour.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-14">

            {/* Contact info — narrower */}
            <div className="lg:col-span-2">
              <h2 className="font-black italic tracking-tight text-2xl mb-8" style={{ color: 'var(--navy)' }}>Contact Info</h2>
              <div className="space-y-5 mb-8">
                {[
                  { icon: '📞', label: 'Phone', val: '(555) 123-4567', note: '24/7 Emergency Line' },
                  { icon: '✉️', label: 'Email', val: 'info@customrepair.com', note: 'Reply within 1 hour' },
                  { icon: '📍', label: 'Office', val: '123 Service Blvd, Atlanta GA', note: 'By appointment only' },
                  { icon: '🕐', label: 'Hours', val: 'Mon–Fri 7am–8pm', note: 'Emergency service 24/7' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3 items-start">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: '#e8f0fe' }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-0.5">{item.label}</p>
                      <p className="font-bold text-gray-800 text-sm">{item.val}</p>
                      <p className="text-gray-400 text-xs font-medium">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency box */}
              <div className="rounded-2xl p-6 text-white" style={{ background: 'var(--navy)' }}>
                <h3 className="font-black italic text-lg mb-1">Need Help Now?</h3>
                <p className="text-white/60 text-sm font-medium mb-4">Emergency dispatch within 2 hours.</p>
                <a href="tel:5551234567"
                  className="block text-center py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--red)', color: '#fff' }}>
                  📞 Call (555) 123-4567
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="font-black italic tracking-tight text-2xl mb-8" style={{ color: 'var(--navy)' }}>
                Schedule a Visit
              </h2>

              {done ? (
                <div className="text-center py-16 rounded-3xl border border-gray-100 bg-gray-50">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="font-black italic text-2xl mb-2" style={{ color: 'var(--navy)' }}>Request Received!</h3>
                  <p className="text-gray-500 font-medium text-sm">We'll call you within 1 hour to confirm your appointment.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls} style={{ color: '#6b7280' }}>Full Name</label>
                      <input required type="text" placeholder="John Smith"
                        value={form.name} onChange={(e) => set('name', e.target.value)}
                        className={inputCls} style={{ '--tw-ring-color': 'var(--navy)' } as React.CSSProperties}
                        onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
                    </div>
                    <div>
                      <label className={labelCls} style={{ color: '#6b7280' }}>Phone</label>
                      <input required type="tel" placeholder="(555) 000-0000"
                        value={form.phone} onChange={(e) => set('phone', e.target.value)}
                        className={inputCls}
                        onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: '#6b7280' }}>Email</label>
                    <input required type="email" placeholder="john@example.com"
                      value={form.email} onChange={(e) => set('email', e.target.value)}
                      className={inputCls}
                      onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: '#6b7280' }}>Service Needed</label>
                    <select required value={form.service} onChange={(e) => set('service', e.target.value)}
                      className={inputCls}
                      onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}>
                      <option value="">Select a service...</option>
                      {services.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: '#6b7280' }}>Message (Optional)</label>
                    <textarea rows={4} placeholder="Describe your issue or question..."
                      value={form.message} onChange={(e) => set('message', e.target.value)}
                      className={`${inputCls} resize-none`}
                      onFocus={(e) => e.target.style.borderColor = 'var(--navy)'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                  <button type="submit" className="btn-primary w-full text-center" style={{ padding: '1rem', fontSize: '0.95rem' }}>
                    Submit Request →
                  </button>
                  <p className="text-center text-xs text-gray-400 font-medium">
                    No spam, ever. We only contact you about your service request.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
