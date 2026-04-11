import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
      <div className="absolute bottom-[-15%] left-[-5%] w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />

      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-amber-300 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Certified · Background-Checked · Insured
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white italic tracking-tighter leading-[0.95] mb-6">
              Comfort &amp; <span style={{ color: '#fbbf24' }}>Reliability</span>{' '}
              For Your Home.
            </h1>

            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-lg font-medium">
              From a broken AC to a burst pipe — our Metro Atlanta experts arrive fast, fix it right, and back every job with a <strong className="text-white">Lifetime Guarantee.</strong>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/schedule" className="btn-primary">
                Book a Technician →
              </Link>
              <a href="tel:5551234567" className="btn-secondary">
                📞 Call Now — Free Quote
              </a>
            </div>

            {/* Social proof row */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-xl">★★★★★</span>
                <div>
                  <p className="text-white font-black text-sm">4.8 / 5</p>
                  <p className="text-white/40 text-xs">2,400+ Google Reviews</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-white font-black text-sm">15,000+</p>
                <p className="text-white/40 text-xs">Homes Served</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-white font-black text-sm">2 Hr</p>
                <p className="text-white/40 text-xs">Emergency Response</p>
              </div>
            </div>
          </div>

          {/* Right: Feature card */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <h3 className="font-black italic tracking-tighter mb-6" style={{ color: 'var(--navy)', fontSize: '1.4rem' }}>
                  What can we fix today?
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: '❄️', label: 'AC Repair', sub: 'Same day' },
                    { icon: '🔥', label: 'Furnace', sub: 'All brands' },
                    { icon: '💧', label: 'Plumbing', sub: 'Licensed' },
                    { icon: '⚡', label: 'Electrical', sub: 'Certified' },
                    { icon: '🌡️', label: 'Thermostat', sub: 'Smart home' },
                    { icon: '🚿', label: 'Water Heater', sub: 'Tankless too' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer group">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-bold text-sm text-gray-800 group-hover:text-blue-800">{item.label}</p>
                        <p className="text-xs text-gray-400 font-medium">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/schedule" className="btn-primary w-full text-center block" style={{ padding: '0.875rem' }}>
                  Schedule a Free Visit
                </Link>
              </div>

              {/* Floating review badge */}
              <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black"
                  style={{ background: 'var(--navy)' }}>S</div>
                <div>
                  <p className="text-xs font-black text-gray-800">"Fastest service in town!"</p>
                  <p className="text-amber-400 text-sm">★★★★★</p>
                  <p className="text-gray-400 text-xs">Sarah M., Atlanta</p>
                </div>
              </div>

              {/* Floating stat badge */}
              <div className="absolute -top-5 -right-4 bg-amber-400 rounded-2xl shadow-xl px-5 py-3 text-center">
                <p className="text-blue-900 font-black text-2xl italic leading-none">24/7</p>
                <p className="text-blue-900 text-xs font-bold opacity-70">Emergency</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 48 C360 0 1080 0 1440 48 L1440 48 L0 48 Z" fill="#fff" />
        </svg>
      </div>
    </section>
  );
}
