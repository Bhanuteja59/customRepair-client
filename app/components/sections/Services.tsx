import Link from 'next/link';

const services = [
  {
    icon: '❄️',
    title: 'HVAC',
    href: '/hvac',
    accent: 'rgba(232, 240, 254, 0.5)',
    accentDark: '#003580',
    desc: 'Keep your home perfectly comfortable year-round with expert AC repair, furnace service, and full system installs.',
    features: ['AC Repair & Tune-Up', 'Furnace Maintenance', 'System Replacement', 'Indoor Air Quality'],
    badge: 'Most Popular',
  },
  {
    icon: '💧',
    title: 'Plumbing',
    href: '/plumbing',
    accent: 'rgba(254, 242, 242, 0.5)',
    accentDark: '#e31b23',
    desc: 'From a dripping faucet to a full sewer line replacement, our licensed plumbers handle it all without the drama.',
    features: ['Drain Cleaning', 'Water Heater Repair', 'Leak Detection', 'Sewer Line Service'],
    badge: null,
  },
  {
    icon: '⚡',
    title: 'Electrical',
    href: '/electrical',
    accent: 'rgba(255, 251, 235, 0.5)',
    accentDark: '#d97706',
    desc: 'Safe, code-compliant electrical work by certified electricians. Panel upgrades to smart home integration.',
    features: ['Panel Upgrades', 'Wiring Inspection', 'Backup Generators', 'Smart Home Install'],
    badge: null,
  },
];

export function Services() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Heading */}
        <div className="max-w-3xl mb-20">
          <p className="eyebrow">Our Specialized Trades</p>
          <h2 className="section-title mb-6">Professional Home Services, <br />Executed with <span className="text-brand-red">Precision.</span></h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            We don't just "fix" things. We restore your home's integrity using top-tier technicians, upfront pricing, and guaranteed results. One call covers every trade.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-10">
          {services.map((svc) => (
            <div key={svc.title} className="card-lift relative rounded-[32px] border border-gray-100 overflow-hidden bg-white flex flex-col group">
              {svc.badge && (
                <div className="absolute top-6 right-6 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full text-white z-20 shadow-lg"
                  style={{ background: 'var(--red)' }}>
                  {svc.badge}
                </div>
              )}
              {/* Card top */}
              <div className="p-10 pb-8 transition-colors duration-500 group-hover:bg-opacity-80" style={{ background: svc.accent }}>
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
                  {svc.icon}
                </div>
                <h3 className="text-3xl font-[1000] italic tracking-tighter mb-3" style={{ color: svc.accentDark }}>
                  {svc.title}
                </h3>
                <p className="text-gray-600 text-sm font-bold leading-relaxed">{svc.desc}</p>
              </div>
              {/* Features */}
              <div className="px-10 py-10 flex-grow">
                <ul className="space-y-4">
                  {svc.features.map((f) => (
                    <li key={f} className="check-item flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                        ✓
                      </div>
                      <span className="text-gray-700 font-bold text-sm tracking-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* CTA */}
              <div className="px-10 pb-10">
                <Link href={svc.href} className="btn-navy w-full text-center block shadow-none hover:shadow-xl">
                  View {svc.title} Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
