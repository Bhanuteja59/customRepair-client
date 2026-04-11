import Link from 'next/link';
import { ConversionBanner } from '@/app/components/sections/ConversionBanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HVAC Services | Custom Repair — Metro Atlanta',
  description: 'Expert AC repair, heating, and HVAC installation in Metro Atlanta. Same-day service, all brands, lifetime guarantee.',
};

const features = [
  { icon: '❄️', title: 'AC Repair & Tune-Up', desc: 'Refrigerant recharges, coil cleaning, compressor diagnostics — we keep your AC at peak efficiency all summer long.' },
  { icon: '🔥', title: 'Heating & Furnace', desc: 'Gas furnaces, heat pumps, and electric heating systems — we service all brands and models, fast.' },
  { icon: '🔄', title: 'System Replacement', desc: 'Installing Carrier, Trane, Lennox, and more. 0% APR financing available on qualifying systems.' },
  { icon: '💨', title: 'Indoor Air Quality', desc: 'UV purifiers, HEPA filtration, humidifiers, and professional duct cleaning for a healthier home.' },
  { icon: '📋', title: 'Maintenance Plans', desc: 'Annual tune-up plans extend equipment life and prevent expensive breakdowns.' },
  { icon: '🌡️', title: 'Smart Thermostat', desc: 'Nest, Ecobee, and Honeywell installs — we configure everything so it just works.' },
];

const faqs = [
  { q: 'How often should I service my AC?', a: 'Once a year before summer is the standard recommendation. Regular tune-ups prevent mid-summer breakdowns and can extend system life by 5–10 years.' },
  { q: 'Repair or replace — how do I know?', a: 'If the repair cost exceeds 50% of a new system\'s price, or your unit is over 15 years old, replacement usually pays off faster. We give honest recommendations, not sales pitches.' },
  { q: 'Do you offer 24/7 emergency HVAC service?', a: 'Yes. We dispatch emergency techs around the clock — most calls are handled same-day, with after-hours calls typically responded to within 2 hours.' },
];

export default function HVACPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-24 overflow-hidden hero-gradient">
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-4">HVAC Services</p>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.95] mb-6 text-white">
              Stay Cool.<br />Stay Warm.<br /><span style={{ color: '#fbbf24' }}>Stay Comfortable.</span>
            </h1>
            <p className="text-lg text-white/70 font-medium mb-8 max-w-xl leading-relaxed">
              Certified HVAC technicians serving Metro Atlanta. Same-day service, upfront pricing, and a lifetime workmanship guarantee on every job.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/schedule" className="btn-primary">Book HVAC Service →</Link>
              <a href="tel:5551234567" className="btn-secondary">📞 Emergency Line</a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48 C360 0 1080 0 1440 48 L1440 48 L0 48 Z" fill="#fff" />
          </svg>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="eyebrow">What We Do</p>
            <h2 className="section-title">Complete HVAC Solutions</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-lift rounded-2xl p-8 border border-gray-100 bg-white shadow-sm">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-black italic tracking-tight text-xl mb-2" style={{ color: 'var(--navy)' }}>{f.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand strip */}
      <section className="py-14 section-gradient border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-7">Authorized Dealer & Service Partner</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Carrier', 'Trane', 'Lennox', 'Rheem', 'Goodman', 'Daikin'].map((b) => (
              <div key={b} className="bg-white border border-gray-200 rounded-xl px-7 py-3 font-black text-base shadow-sm"
                style={{ color: 'var(--navy)' }}>
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="eyebrow">Common Questions</p>
            <h2 className="section-title">HVAC FAQ</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-gray-100 p-6 shadow-sm bg-white">
                <h4 className="font-black italic text-lg mb-2" style={{ color: 'var(--navy)' }}>{faq.q}</h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ConversionBanner />
    </>
  );
}
