const reviews = [
  { name: 'Sarah M.', city: 'Atlanta', rating: 5, service: 'HVAC', text: 'The technician arrived within 2 hours and had my AC running perfectly. Best home service experience I\'ve ever had!' },
  { name: 'James R.', city: 'Marietta', rating: 5, service: 'Plumbing', text: 'Fixed a major pipe burst same-day. Transparent pricing, no surprise fees. Couldn\'t be happier.' },
  { name: 'Linda T.', city: 'Decatur', rating: 5, service: 'Electrical', text: 'Panel upgrade done professionally and passed inspection first try. Very knowledgeable team.' },
  { name: 'Marcus W.', city: 'Smyrna', rating: 5, service: 'HVAC', text: 'Called at 11pm for an emergency — technician was at my door by midnight. Absolute lifesavers.' },
];

const serviceColors: Record<string, string> = {
  HVAC:       '#e8f0fe',
  Plumbing:   '#fef2f2',
  Electrical: '#fffbeb',
};
const serviceText: Record<string, string> = {
  HVAC:       '#003580',
  Plumbing:   '#e31b23',
  Electrical: '#d97706',
};

export function Reviews() {
  return (
    <section className="py-24" style={{ background: 'var(--navy)' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-3">Customer Reviews</p>
            <h2 className="text-4xl font-black italic tracking-tighter text-white leading-[1.05]">
              Trusted By<br />Thousands of Families
            </h2>
          </div>
          <div className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl px-6 py-4">
            <div>
              <p className="text-5xl font-black italic text-white leading-none">4.8</p>
              <p className="text-amber-400">★★★★★</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <p className="text-white font-bold text-sm">2,400+ Reviews</p>
              <p className="text-white/50 text-xs">on Google</p>
            </div>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-6 flex flex-col">
              {/* Stars + badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="stars text-lg">{'★'.repeat(r.rating)}</span>
                <span className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide"
                  style={{ background: serviceColors[r.service] ?? '#f3f4f6', color: serviceText[r.service] ?? '#374151' }}>
                  {r.service}
                </span>
              </div>
              {/* Review text */}
              <p className="text-gray-600 text-sm leading-relaxed font-medium flex-grow mb-5">
                "{r.text}"
              </p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                  style={{ background: 'var(--navy)' }}>
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-sm" style={{ color: 'var(--navy)' }}>{r.name}</p>
                  <p className="text-gray-400 text-xs font-medium">{r.city}, GA</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
