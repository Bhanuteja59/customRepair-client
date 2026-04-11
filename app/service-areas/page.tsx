'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConversionBanner } from '@/app/components/sections/ConversionBanner';

const CITIES = [
  'Atlanta', 'Marietta', 'Decatur', 'Smyrna', 'Kennesaw',
  'Roswell', 'Alpharetta', 'Sandy Springs', 'Dunwoody', 'Norcross',
  'Tucker', 'Stone Mountain', 'Lithonia', 'Conyers', 'McDonough',
  'Peachtree City', 'Newnan', 'Fayetteville', 'Stockbridge', 'Morrow',
  'Lawrenceville', 'Duluth', 'Suwanee', 'Buford', 'Snellville',
  'Woodstock', 'Canton', 'Acworth', 'Douglasville', 'Powder Springs',
  'Jonesboro', 'Riverdale', 'College Park', 'East Point', 'Hapeville',
  'Johns Creek', 'Milton', 'Brookhaven', 'Chamblee', 'Doraville'
].sort();

export default function ServiceAreasPage() {
  const [search, setSearch] = useState('');

  const filteredCities = CITIES.filter(city => 
    city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient text-white py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-4">Coverage Map</p>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white mb-5 leading-[0.95]">
            We Come To You,<br />
            <span style={{ color: '#fbbf24' }}>Wherever You Are.</span>
          </h1>
          <p className="text-white/65 font-medium text-lg max-w-xl mx-auto">
            Serving 40+ cities across Metro Atlanta with 24/7 HVAC, plumbing, and electrical services.
          </p>
        </div>
      </section>

      {/* Cities Search Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="eyebrow">Find Your City</p>
            <h2 className="section-title mb-8">Metro Atlanta Coverage</h2>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for your city (e.g. Marietta)..."
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-lg font-bold text-gray-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <div key={city}
                  className="card-lift flex items-center gap-3 px-5 py-4 rounded-2xl border border-gray-100 bg-white shadow-sm group hover:border-blue-100 transition-all cursor-default">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#e31b23' }} />
                  <span className="text-sm font-black text-gray-700 group-hover:text-blue-900 transition-colors tracking-tight">
                    {city}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold mb-2">No service areas found matching "{search}"</p>
                <p className="text-sm text-gray-500">Try a broader term or contact us below.</p>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="rounded-[40px] p-12 text-center border-4 border-gray-50 shadow-2xl overflow-hidden relative" style={{ background: '#001d4a' }}>
             {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="text-5xl mb-6">📍</div>
              <h3 className="font-black italic tracking-tighter text-4xl mb-4 text-white">
                Don't see your city?
              </h3>
              <p className="text-white/60 font-bold mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                Our service radius is expanding daily. Call us to verify coverage in your exact neighborhood.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <a href="tel:5551234567" className="btn-primary" style={{ padding: '18px 36px', fontSize: '16px' }}>
                  📞 Call (555) 123-4567
                </a>
                <Link href="/schedule" className="btn-navy" style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', padding: '18px 36px', fontSize: '16px' }}>
                  Schedule Online
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ConversionBanner />
    </>
  );
}
