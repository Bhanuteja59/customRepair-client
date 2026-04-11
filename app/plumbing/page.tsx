import Link from 'next/link';
import { ConversionBanner } from '@/app/components/sections/ConversionBanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plumbing Services | Custom Repair — Metro Atlanta',
  description: 'Licensed plumbers in Metro Atlanta. Drain cleaning, water heater repair, leak detection, sewer lines. Same-day service.',
};

const features = [
  { icon: '🚿', title: 'Drain Cleaning', desc: 'Clogged drains cleared fast with professional hydro-jetting and snaking. No mess, no fuss.' },
  { icon: '💧', title: 'Leak Detection', desc: 'Non-invasive technology finds leaks behind walls and under slabs before they become floods.' },
  { icon: '🔥', title: 'Water Heater Repair', desc: 'Tank and tankless water heaters — repair, maintenance, and replacement for all brands.' },
  { icon: '🏠', title: 'Sewer Line Services', desc: 'Camera inspections, hydro-jetting, and trenchless repair so your yard stays intact.' },
  { icon: '🚽', title: 'Fixture Installation', desc: 'Faucets, toilets, showers, garbage disposals — installed correctly and guaranteed.' },
  { icon: '💦', title: 'Water Treatment', desc: 'Whole-home softeners and filtration systems for cleaner, better-tasting water.' },
];

const faqs = [
  { q: 'Do you offer same-day plumbing service?', a: 'Yes. Most calls are resolved the same day. For emergencies, we dispatch within 2 hours — any day, any time.' },
  { q: 'How much does drain cleaning cost?', a: 'Standard drain cleaning starts at $99. We always provide an upfront quote before starting any work.' },
  { q: 'What water heater brands do you service?', a: 'We install and service all major brands: Rheem, Bradford White, A.O. Smith, Navien, and more.' },
];

export default function PlumbingPage() {
  return (
    <>
      <section className="relative text-white py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0505 0%, #7f1d1d 50%, #e31b23 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-4">Plumbing Services</p>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.95] mb-6">
              No Drip Too Small.<br /><span style={{ color: '#fbbf24' }}>No Job Too Big.</span>
            </h1>
            <p className="text-lg text-white/70 font-medium mb-8 max-w-xl leading-relaxed">
              Licensed master plumbers in Metro Atlanta. Upfront pricing, no hidden fees, and a lifetime workmanship guarantee.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary">Book a Plumber →</Link>
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

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="eyebrow">What We Do</p>
            <h2 className="section-title">Complete Plumbing Solutions</h2>
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

      <section className="py-24 section-gradient">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="eyebrow">Common Questions</p>
            <h2 className="section-title">Plumbing FAQ</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
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
