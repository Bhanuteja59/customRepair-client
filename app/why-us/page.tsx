import Link from 'next/link';
import { ConversionBanner } from '@/app/components/sections/ConversionBanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why Custom Repair? | Metro Atlanta Home Services',
  description: 'Discover why 15,000+ Atlanta homeowners trust Custom Repair. Lifetime guarantee, background-checked techs, and upfront pricing.',
};

const reasons = [
  { icon: '🛡️', title: 'Lifetime Workmanship Guarantee', desc: 'Every repair is backed for life. If our work causes a repeat issue, we fix it free — no questions asked.' },
  { icon: '👷', title: 'Background-Checked Technicians', desc: 'Fully drug-tested, background-screened, and licensed. You know exactly who\'s entering your home.' },
  { icon: '💰', title: 'Upfront Flat-Rate Pricing', desc: 'You approve the price before we pick up a single tool. No hourly rates, no surprise invoices.' },
  { icon: '⚡', title: 'Same-Day Emergency Service', desc: 'Most calls resolved same-day. Emergency response in under 2 hours, 365 days a year.' },
  { icon: '🌟', title: '4.8-Star Google Rating', desc: 'Over 2,400 five-star reviews from real Atlanta homeowners — our reputation speaks for itself.' },
  { icon: '🏆', title: '25+ Industry Awards', desc: 'Recognized for service excellence, safety standards, and customer satisfaction at local and national levels.' },
  { icon: '📋', title: 'Fully Licensed & Insured', desc: 'Licensed in HVAC, plumbing, and electrical. Full liability and workers\' comp coverage on every job.' },
  { icon: '♻️', title: 'Energy-Efficient Options', desc: 'We prioritize eco-friendly systems and help you qualify for utility rebates and federal tax credits.' },
];

export default function WhyUsPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-5">Our Promise</p>
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white mb-6 leading-[0.95]">
              We Don't Just Fix Things.<br />
              <span style={{ color: '#fbbf24' }}>We Make Them Right.</span>
            </h1>
            <p className="text-lg text-white/70 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              Over 15,000 Metro Atlanta homeowners have trusted us with their most important asset. Here's what makes us different.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary">Schedule a Visit</Link>
              <Link href="/offers" className="btn-secondary">See Our Offers</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reasons */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((r, i) => (
              <div key={r.title} className="card-lift rounded-3xl p-7 border border-gray-100 bg-white shadow-sm text-center"
                style={i === 0 ? { background: 'var(--navy)', borderColor: 'var(--navy)' } : {}}>
                <div className="text-4xl mb-4">{r.icon}</div>
                <h3 className="font-black italic tracking-tight text-lg mb-2 leading-tight"
                  style={{ color: i === 0 ? '#fbbf24' : 'var(--navy)' }}>
                  {r.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed"
                  style={{ color: i === 0 ? 'rgba(255,255,255,0.65)' : '#6b7280' }}>
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards strip */}
      <section className="py-14" style={{ background: 'var(--navy)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-7">Certifications & Recognitions</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Best of Atlanta 2024', 'Carrier Factory Auth. Dealer', 'BBB A+ Rated', 'Angi Super Service Award', 'HomeAdvisor Elite', 'ACCA Member', 'EPA 608 Certified'].map((award) => (
              <span key={award} className="bg-white/10 border border-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-xl">
                {award}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ConversionBanner />
    </>
  );
}
