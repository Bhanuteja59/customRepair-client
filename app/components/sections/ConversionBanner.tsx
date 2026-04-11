import Link from 'next/link';

export function ConversionBanner() {
  return (
    <section className="relative overflow-hidden py-20" style={{ background: 'linear-gradient(135deg, #e31b23 0%, #b3151a 100%)' }}>
      {/* Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              🏷 Limited Time Offer
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white leading-[1] mb-3">
              $50 OFF Your First Service
            </h2>
            <p className="text-white/80 text-lg font-medium max-w-xl">
              New customers get $50 off their first repair. Schedule online today — no coupon code needed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <Link href="/schedule"
              className="bg-white font-black uppercase tracking-wide text-sm px-8 py-4 rounded-lg shadow-xl text-center transition-all hover:bg-gray-100 hover:-translate-y-0.5"
              style={{ color: 'var(--red)' }}>
              Schedule Online →
            </Link>
            <a href="tel:5551234567"
              className="border-2 border-white/50 text-white font-black uppercase tracking-wide text-sm px-8 py-4 rounded-lg text-center transition-all hover:bg-white/10 hover:border-white">
              📞 Call (555) 123-4567
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
