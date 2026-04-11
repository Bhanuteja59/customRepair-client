import Link from 'next/link';
import { ConversionBanner } from '@/app/components/sections/ConversionBanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Electrical Services | Custom Repair — Metro Atlanta',
  description: 'Licensed electricians in Metro Atlanta. Panel upgrades, wiring, generators, EV chargers, smart home. Safe, code-compliant work.',
};

const features = [
  { icon: '⚡', title: 'Panel Upgrades', desc: 'Safely upgrade your electrical panel to handle modern loads. We work with all panel brands and pull all permits.' },
  { icon: '🔌', title: 'Wiring & Rewiring', desc: 'Old knob-and-tube or aluminum wiring? We modernize your home\'s electrical system safely and up to code.' },
  { icon: '🔍', title: 'Safety Inspections', desc: 'Comprehensive electrical audits that catch hazards before they cause fires or code violations.' },
  { icon: '🏠', title: 'Smart Home Install', desc: 'Nest, Ring, smart switches, dimmers, and EV charger installation — handled professionally.' },
  { icon: '🔋', title: 'Backup Generators', desc: 'Whole-home generator installation and maintenance. Keep the lights on when storms hit.' },
  { icon: '💡', title: 'Lighting Solutions', desc: 'Recessed lighting, ceiling fans, outdoor lighting, and LED retrofits done right.' },
];

const faqs = [
  { q: 'Is DIY electrical work safe?', a: 'Most electrical work requires a licensed electrician and a permit. DIY mistakes are a leading cause of house fires — let our certified team handle it safely.' },
  { q: 'How do I know if my panel needs upgrading?', a: 'Frequently tripped breakers, flickering lights, a 100-amp panel in a modern home, or a panel over 30 years old are all signs it\'s time to upgrade.' },
  { q: 'Do you install EV chargers?', a: 'Yes. We install Level 2 EV chargers for Tesla, Ford, Chevy, and all other major brands — and we pull the permit so your installation is code-compliant.' },
];

export default function ElectricalPage() {
  return (
    <>
      <section className="relative text-white py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1c1500 0%, #78350f 50%, #d97706 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <p className="text-amber-300 font-black text-xs uppercase tracking-widest mb-4">Electrical Services</p>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.95] mb-6">
              Safe. Certified.<br /><span style={{ color: '#fbbf24' }}>Powered Up.</span>
            </h1>
            <p className="text-lg text-white/70 font-medium mb-8 max-w-xl leading-relaxed">
              Licensed electricians for Metro Atlanta homes. Panel upgrades, wiring, generators, and smart home solutions — all permitted and code-compliant.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary">Book an Electrician →</Link>
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
            <h2 className="section-title">Complete Electrical Solutions</h2>
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
            <h2 className="section-title">Electrical FAQ</h2>
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
