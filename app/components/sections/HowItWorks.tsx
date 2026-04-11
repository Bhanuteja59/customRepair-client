const steps = [
  {
    num: '01',
    icon: '📅',
    title: 'Book Online in 2 Minutes',
    desc: 'Choose your service, pick a time that works for you—morning, afternoon, or emergency. Available any day, any hour.',
  },
  {
    num: '02',
    icon: '🔍',
    title: 'Technician Arrives On Time',
    desc: 'A certified, background-checked tech shows up at the agreed time and gives you a clear, upfront quote before touching anything.',
  },
  {
    num: '03',
    icon: '✅',
    title: 'Problem Solved. Guaranteed.',
    desc: 'We fix it right the first time—every repair is backed by our Lifetime Workmanship Guarantee. If it comes back, so do we, free.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 section-gradient">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="eyebrow">Simple Process</p>
          <h2 className="section-title">Fixed In 3 Easy Steps</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Dashed connector */}
          <div className="hidden md:block absolute top-14 left-1/3 right-1/3 border-t-2 border-dashed border-gray-200" />

          {steps.map((step, i) => (
            <div key={step.num} className="flex flex-col items-center text-center">
              {/* Circle */}
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-white"
                  style={{ background: i === 0 ? 'var(--navy)' : i === 1 ? '#1d4ed8' : '#2563eb' }}>
                  {step.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full text-white text-xs font-black flex items-center justify-center border-2 border-white shadow"
                  style={{ background: 'var(--red)' }}>
                  {step.num}
                </span>
              </div>
              <h3 className="font-black italic tracking-tighter text-xl mb-3" style={{ color: 'var(--navy)' }}>
                {step.title}
              </h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
