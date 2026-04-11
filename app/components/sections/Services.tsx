import Link from 'next/link';

const services = [
  {
    icon: '❄️',
    title: 'HVAC',
    href: '/hvac',
    accent: '#e8f0fe',
    accentDark: '#003580',
    desc: 'Keep your home perfectly comfortable year-round with expert AC repair, furnace service, and full system installs.',
    features: ['AC Repair & Tune-Up', 'Furnace Maintenance', 'System Replacement', 'Indoor Air Quality'],
    badge: 'Most Popular',
  },
  {
    icon: '💧',
    title: 'Plumbing',
    href: '/plumbing',
    accent: '#fef2f2',
    accentDark: '#e31b23',
    desc: 'From a dripping faucet to a full sewer line replacement, our licensed plumbers handle it all without the drama.',
    features: ['Drain Cleaning', 'Water Heater Repair', 'Leak Detection', 'Sewer Line Service'],
    badge: null,
  },
  {
    icon: '⚡',
    title: 'Electrical',
    href: '/electrical',
    accent: '#fffbeb',
    accentDark: '#d97706',
    desc: 'Safe, code-compliant electrical work by certified electricians. Panel upgrades to smart home integration.',
    features: ['Panel Upgrades', 'Wiring Inspection', 'Backup Generators', 'Smart Home Install'],
    badge: null,
  },
];

export function Services() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="eyebrow">Our Services</p>
          <h2 className="section-title mb-4">Professional Home Services</h2>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto text-base">
            Top-tier technicians. Upfront pricing. Guaranteed results. One call covers it all.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((svc) => (
            <div key={svc.title} className="card-lift relative rounded-3xl border border-gray-100 overflow-hidden bg-white flex flex-col">
              {svc.badge && (
                <div className="absolute top-5 right-5 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full text-white"
                  style={{ background: 'var(--red)' }}>
                  {svc.badge}
                </div>
              )}
              {/* Card top */}
              <div className="p-8 pb-6" style={{ background: svc.accent }}>
                <div className="text-5xl mb-4">{svc.icon}</div>
                <h3 className="text-2xl font-black italic tracking-tighter mb-2" style={{ color: svc.accentDark }}>
                  {svc.title}
                </h3>
                <p className="text-gray-600 text-sm font-medium leading-relaxed">{svc.desc}</p>
              </div>
              {/* Features */}
              <div className="px-8 py-6 flex-grow">
                <ul className="space-y-3">
                  {svc.features.map((f) => (
                    <li key={f} className="check-item">
                      <span className="check-icon">✓</span>
                      <span className="text-gray-700 font-semibold text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* CTA */}
              <div className="px-8 pb-8">
                <Link href={svc.href} className="btn-navy w-full text-center block" style={{ padding: '0.875rem' }}>
                  Learn More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
