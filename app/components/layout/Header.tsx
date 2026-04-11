'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const nav = [
  { label: 'HVAC',        href: '/hvac' },
  { label: 'Plumbing',    href: '/plumbing' },
  { label: 'Electrical',  href: '/electrical' },
  { label: 'Why Us?',     href: '/why-us' },
  { label: 'Areas',       href: '/service-areas' },
];

export function TopBar() {
  return (
    <div style={{ background: 'var(--navy-dark)' }} className="text-white text-xs py-2">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <a href="tel:5551234567" className="flex items-center gap-1.5 font-semibold hover:text-amber-300 transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.02l-2.2 2.19z"/>
            </svg>
            24/7 Emergency: <strong className="text-amber-300">(555) 123-4567</strong>
          </a>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-amber-300">★★★★★</span>
          <span className="opacity-70">4.8 Google Rating · 15,000+ Homes Served</span>
          <Link href="/careers" className="bg-amber-400 text-blue-900 px-3 py-0.5 rounded font-black text-xs hover:bg-amber-300 transition-colors">
            NOW HIRING
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(!!localStorage.getItem('customer_token'));
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-black italic tracking-tighter" style={{ color: 'var(--navy)' }}>
            <span className="flex items-center justify-center w-9 h-9 rounded-lg text-white text-base" style={{ background: 'var(--navy)' }}>CR</span>
            CUSTOM<span style={{ color: 'var(--red)' }}>REPAIR</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-bold text-gray-600 hover:text-blue-800 transition-colors tracking-wide uppercase">
                {item.label}
              </Link>
            ))}
            <Link href="/offers" className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--red)' }}>
              🏷 Offers
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a href="tel:5551234567" className="hidden md:flex items-center gap-2 font-black text-sm" style={{ color: 'var(--navy)' }}>
              <span className="flex items-center justify-center w-9 h-9 rounded-full text-white text-sm" style={{ background: 'var(--navy)' }}>📞</span>
              (555) 123-4567
            </a>
            {isLogged && (
              <Link href="/dashboard" className="text-sm font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl">
                 My Repair Hub
              </Link>
            )}
            <Link href="/schedule" className="btn-primary hidden sm:inline-block" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8rem' }}>
              Schedule Visit
            </Link>
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setOpen(true)}>
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {open && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col">
          <div className="flex justify-between items-center px-6 py-5 border-b">
            <span className="text-xl font-black italic tracking-tighter" style={{ color: 'var(--navy)' }}>
              CUSTOM<span style={{ color: 'var(--red)' }}>REPAIR</span>
            </span>
            <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col px-6 py-6 gap-1 flex-grow">
            {[...nav, { label: '🏷 Offers', href: '/offers' }, { label: 'Careers', href: '/careers' }].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="py-4 px-4 text-base font-black uppercase tracking-wide text-gray-700 border-b border-gray-100 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 pb-8 flex flex-col gap-3">
            <Link href="/schedule" onClick={() => setOpen(false)} className="btn-primary text-center" style={{ padding: '1rem' }}>
              Schedule a Visit
            </Link>
            <a href="tel:5551234567" className="text-center py-4 font-black text-sm rounded-lg border-2 hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}>
              📞 Call (555) 123-4567
            </a>
          </div>
        </div>
      )}
    </>
  );
}
