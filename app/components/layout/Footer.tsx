import Link from 'next/link';

const cols = [
  {
    heading: 'Services',
    links: [
      { label: 'HVAC Repair & Install', href: '/hvac' },
      { label: 'Plumbing', href: '/plumbing' },
      { label: 'Electrical', href: '/electrical' },
      { label: 'Service Areas', href: '/service-areas' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Why Custom Repair?', href: '/why-us' },
      { label: 'Special Offers', href: '/offers' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="text-white" style={{ background: '#0a1628' }}>
      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-2xl font-black italic tracking-tighter mb-3">
              CUSTOM<span style={{ color: 'var(--red)' }}>REPAIR</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-xs">
              Metro Atlanta's most trusted home service company. Certified technicians, upfront pricing, lifetime workmanship guarantee.
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-400 text-lg">★★★★★</span>
              <span className="text-white font-bold text-sm">4.8</span>
              <span className="text-white/40 text-xs">/ 5 · 2,400+ Google Reviews</span>
            </div>
            <a href="tel:5551234567" className="text-amber-400 font-black text-lg hover:text-amber-300 transition-colors">
              (555) 123-4567
            </a>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/50 text-sm font-medium hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '📞', label: 'Phone', value: '(555) 123-4567' },
            { icon: '✉️', label: 'Email', value: 'info@customrepair.com' },
            { icon: '📍', label: 'Office', value: 'Metro Atlanta, GA' },
            { icon: '🕐', label: 'Hours', value: '24/7 Emergency Service' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wide">{item.label}</p>
                <p className="text-white text-sm font-bold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-white/30 text-xs font-medium">
        <p>© 2026 Custom Repair Services LLC. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white/60 transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
