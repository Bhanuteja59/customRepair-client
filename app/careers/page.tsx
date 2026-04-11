import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | Join Custom Repair — Metro Atlanta',
  description: 'Join Metro Atlanta\'s fastest growing home service team. HVAC, plumbing, and electrical roles. Competitive pay, full benefits, company vehicle.',
};

const perks = [
  { icon: '💵', title: 'Competitive Pay', desc: 'Top-of-market wages with monthly performance bonuses.' },
  { icon: '🏥', title: 'Full Benefits', desc: 'Health, dental, vision, and 401k with 4% company match.' },
  { icon: '🚐', title: 'Take-Home Vehicle', desc: 'Company truck goes home with you every night.' },
  { icon: '📚', title: 'Paid Certifications', desc: 'EPA 608, NATE, and continuing education fully paid.' },
  { icon: '📈', title: 'Clear Growth Path', desc: 'Defined advancement from tech → lead → manager.' },
  { icon: '🏖️', title: 'PTO & Holidays', desc: '15 days PTO + all major holidays from day one.' },
];

const jobs = [
  { title: 'HVAC Technician', type: 'Full-Time', location: 'Atlanta, GA', req: '2+ yrs · EPA 608 certified · All brands' },
  { title: 'Master Plumber', type: 'Full-Time', location: 'Marietta, GA', req: 'Master license required · Residential & commercial' },
  { title: 'Electrician (Journeyman)', type: 'Full-Time', location: 'Metro Atlanta', req: 'Journeyman license · Panels · Smart home installs' },
  { title: 'Customer Service Rep', type: 'Full-Time', location: 'Remote / Atlanta', req: 'CRM experience preferred · Scheduling & follow-up' },
];

export default function CareersPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              🚀 We're Growing Fast
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.95] mb-6 text-white">
              Build Your Career<br />
              <span style={{ color: '#fbbf24' }}>With The Best.</span>
            </h1>
            <p className="text-lg text-white/70 font-medium mb-8 max-w-xl leading-relaxed">
              Join Metro Atlanta's fastest-growing home service company. We invest heavily in our people — so our people can give customers the best experience in the industry.
            </p>
            <a href="mailto:careers@customrepair.com" className="btn-primary inline-block">
              Apply Today →
            </a>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="eyebrow">Benefits</p>
            <h2 className="section-title">Why Work Here</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {perks.map((p) => (
              <div key={p.title} className="card-lift flex gap-4 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="text-3xl flex-shrink-0">{p.icon}</div>
                <div>
                  <h4 className="font-black italic text-lg mb-1" style={{ color: 'var(--navy)' }}>{p.title}</h4>
                  <p className="text-gray-500 text-sm font-medium">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-24 section-gradient">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="eyebrow">Open Roles</p>
            <h2 className="section-title">Current Openings</h2>
          </div>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.title} className="card-lift bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-5 items-start sm:items-center">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ background: '#e8f0fe', color: 'var(--navy)' }}>
                      {job.type}
                    </span>
                    <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {job.location}
                    </span>
                  </div>
                  <h3 className="font-black italic text-xl mb-1" style={{ color: 'var(--navy)' }}>{job.title}</h3>
                  <p className="text-gray-400 text-sm font-medium">{job.req}</p>
                </div>
                <a href="mailto:careers@customrepair.com"
                  className="btn-primary whitespace-nowrap flex-shrink-0"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.825rem' }}>
                  Apply →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
