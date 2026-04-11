const usps = [
  { icon: '🛡️', title: 'Lifetime Workmanship Guarantee', desc: "If our work fails, we fix it — free, forever. That's a promise you can hold us to." },
  { icon: '👷', title: 'Background-Checked Technicians', desc: 'Every tech is drug-tested, background-screened, and fully certified before entering your home.' },
  { icon: '💰', title: 'Upfront Flat-Rate Pricing', desc: 'You approve the quote before we start. No hidden fees, no hourly surprises — ever.' },
  { icon: '⚡', title: 'Same-Day & Emergency Service', desc: 'Most calls resolved same-day. Emergency dispatch in under 2 hours, 365 days a year.' },
];

const stats = [
  { value: '4.8★', label: 'Google Rating', sub: '2,400+ reviews' },
  { value: '15k+', label: 'Homes Served', sub: 'Annually' },
  { value: '25+', label: 'Industry Awards', sub: 'Excellence' },
  { value: '24/7', label: 'Availability', sub: 'Always on call' },
];

export function TrustSignals() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: USPs */}
          <div>
            <p className="eyebrow">Why Choose Us?</p>
            <h2 className="section-title mb-8">
              The Most Trusted Name In Atlanta Home Services.
            </h2>
            <div className="space-y-4">
              {usps.map((u) => (
                <div key={u.title} className="card-lift flex gap-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: '#e8f0fe' }}>
                    {u.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-base italic tracking-tight mb-1" style={{ color: 'var(--navy)' }}>{u.title}</h4>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{u.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stats */}
          <div>
            <div className="grid grid-cols-2 gap-5">
              {stats.map((s, i) => (
                <div key={s.label}
                  className="card-lift rounded-3xl p-8 text-center border border-gray-100 shadow-sm"
                  style={{ background: i === 1 ? 'var(--navy)' : 'white' }}>
                  <p className="stat-number mb-1" style={{ color: i === 1 ? '#fbbf24' : 'var(--navy)' }}>{s.value}</p>
                  <p className={`font-black text-sm uppercase tracking-widest ${i === 1 ? 'text-white' : 'text-gray-800'}`}>{s.label}</p>
                  <p className={`text-xs font-medium mt-1 ${i === 1 ? 'text-white/50' : 'text-gray-400'}`}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Certifications strip */}
            <div className="mt-6 rounded-2xl p-6 border border-gray-100 bg-gray-50">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 text-center">
                Certified & Authorized By
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Carrier', 'Trane', 'Lennox', 'BBB A+', 'Angi', 'ACCA'].map((cert) => (
                  <span key={cert} className="px-4 py-2 bg-white rounded-xl text-sm font-black border border-gray-200"
                    style={{ color: 'var(--navy)' }}>
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
