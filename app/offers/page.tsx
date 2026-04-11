import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Special Offers | Custom Repair — Metro Atlanta',
  description: 'Save on HVAC, plumbing, and electrical. $50 off first visit, free tune-ups, and 0% APR financing available.',
};

const offers = [
  {
    emoji: '🏷',
    title: '$50 OFF',
    sub: 'First-Time Customer',
    desc: 'New to Custom Repair? Receive $50 off your very first service call. No coupon code needed — just mention it when you book.',
    badge: 'Most Popular',
    badgeBg: 'var(--red)',
    borderColor: '#003580',
    topBg: '#e8f0fe',
    topText: '#003580',
  },
  {
    emoji: '🎁',
    title: 'FREE',
    sub: 'System Tune-Up',
    desc: 'Schedule a full HVAC or plumbing system tune-up absolutely free with any repair over $150. A $99 value included automatically.',
    badge: 'Limited Time',
    badgeBg: 'var(--red)',
    borderColor: 'var(--red)',
    topBg: '#fef2f2',
    topText: '#e31b23',
  },
  {
    emoji: '💳',
    title: '0% APR',
    sub: '12-Month Financing',
    desc: 'Big repairs don\'t have to hurt your budget. Apply for 0% APR financing in under 5 minutes right at the job site.',
    badge: 'Flexible',
    badgeBg: '#d97706',
    borderColor: '#d97706',
    topBg: '#fffbeb',
    topText: '#d97706',
  },
];

export default function OffersPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 text-center" style={{ background: 'var(--navy)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-4">Current Deals</p>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white mb-4 leading-[0.95]">
            Special Offers
          </h1>
          <p className="text-white/60 font-medium text-lg max-w-xl mx-auto">
            Quality service at a price that makes sense. Don't miss these deals.
          </p>
        </div>
      </section>

      {/* Offer cards */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {offers.map((o) => (
              <div key={o.title} className="card-lift relative rounded-3xl overflow-hidden border-2 bg-white flex flex-col"
                style={{ borderColor: o.borderColor }}>
                <span className="absolute top-4 right-4 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: o.badgeBg }}>
                  {o.badge}
                </span>
                {/* Top */}
                <div className="p-8 pb-6 text-center" style={{ background: o.topBg }}>
                  <div className="text-4xl mb-3">{o.emoji}</div>
                  <p className="text-5xl font-black italic tracking-tighter leading-none mb-1" style={{ color: o.topText }}>
                    {o.title}
                  </p>
                  <p className="font-black text-xs uppercase tracking-widest opacity-70" style={{ color: o.topText }}>
                    {o.sub}
                  </p>
                </div>
                {/* Body */}
                <div className="p-8 flex-grow">
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">{o.desc}</p>
                </div>
                {/* CTA */}
                <div className="px-8 pb-8">
                  <Link href="/contact" className="btn-navy w-full text-center block" style={{ padding: '0.875rem' }}>
                    Claim Offer →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs font-medium mt-10 max-w-lg mx-auto">
            Valid for Metro Atlanta service area only. Offers cannot be combined. Subject to change without notice.
          </p>
        </div>
      </section>
    </>
  );
}
