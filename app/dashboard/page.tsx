'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Status → display metadata
const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  open:        { label: 'Pending Review',   color: '#f59e0b', bg: '#fef3c7', dot: 'bg-amber-400' },
  pending:     { label: 'Pending Review',   color: '#f59e0b', bg: '#fef3c7', dot: 'bg-amber-400' },
  assigned:    { label: 'Worker Assigned',  color: '#3b82f6', bg: '#dbeafe', dot: 'bg-blue-500' },
  claimed:     { label: 'Confirmed',        color: '#10b981', bg: '#d1fae5', dot: 'bg-emerald-500' },
  accepted:    { label: 'Confirmed (Legacy)',color: '#10b981', bg: '#d1fae5', dot: 'bg-emerald-500' },
  in_progress: { label: 'Work in Progress', color: '#8b5cf6', bg: '#ede9fe', dot: 'bg-violet-500' },
  completed:   { label: 'Completed',        color: '#6b7280', bg: '#f3f4f6', dot: 'bg-gray-400' },
};

const TIMELINE_STEPS = [
  { label: 'Received',         field: 'created_at',   src: 'booking', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Assigned',         field: 'assigned_at',  src: 'assign',  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Confirmed/Claimed',field: 'accepted_at',  src: 'assign',  icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Commenced',        field: 'started_at',   src: 'assign',  icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { label: 'Completed',        field: 'completed_at', src: 'assign',  icon: 'M5 13l4 4L19 7' },
];

const SERVICE_ICONS: Record<string, string> = {
  hvac: '❄️', furnace: '🔥', plumbing: '💧', electrical: '⚡', thermostat: '🌡️',
};
function serviceIcon(service: string) {
  const s = service.toLowerCase();
  for (const [k, v] of Object.entries(SERVICE_ICONS)) if (s.includes(k)) return v;
  return '🔧';
}
function fmt(ts: string | null) {
  if (!ts) return null;
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Icon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

type Tab = 'services' | 'assigned' | 'completed' | 'create' | 'help';

// ──────────────────────────────────────────────────────────────────────────────
// Workflow timeline card shown inside each booking
// ──────────────────────────────────────────────────────────────────────────────
function WorkflowTimeline({ job }: { job: any }) {
  const a = job.assignment;
  return (
    <div className="bg-[#f8fafc] rounded-3xl p-6 border border-gray-100">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5">Workflow Timeline</p>
      <div className="space-y-3">
        {TIMELINE_STEPS.map((step, idx) => {
          const ts = step.src === 'booking' ? job[step.field] : a?.[step.field];
          const done = !!ts;
          const isActive = !done && TIMELINE_STEPS.slice(0, idx).every(s => {
            const prev = s.src === 'booking' ? job[s.field] : a?.[s.field];
            return !!prev;
          });
          return (
            <div key={step.label} className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all
              ${done ? 'bg-white border border-blue-100' : isActive ? 'bg-amber-50 border border-amber-100' : 'opacity-35'}
            `}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                ${done ? 'bg-blue-600 text-white' : isActive ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400'}
              `}>
                <Icon d={step.icon} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-black ${done ? 'text-[#001d4a]' : 'text-gray-400'}`}>{step.label}</p>
                {ts && <p className="text-[10px] font-bold text-gray-400 tabular-nums mt-0.5">{fmt(ts)}</p>}
                {isActive && !ts && <p className="text-[10px] font-black text-amber-500 mt-0.5 animate-pulse">In Progress…</p>}
              </div>
              {done && <Icon d="M5 13l4 4L19 7" className="w-4 h-4 text-blue-500 shrink-0" />}
            </div>
          );
        })}
      </div>
      {a?.worker_notes && (
        <div className="mt-4 bg-[#001d4a] rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-3xl -mr-10 -mt-10" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Progress Notes</p>
          <p className="text-sm font-bold italic">"{a.worker_notes}"</p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Full booking card
// ──────────────────────────────────────────────────────────────────────────────
function BookingCard({ job, compact = false }: { job: any; compact?: boolean }) {
  const [open, setOpen] = useState(!compact);
  const meta = STATUS_META[job.status] || STATUS_META['pending'];
  const a = job.assignment;

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-lg overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">{serviceIcon(job.service)}</span>
          <div>
            <h3 className="text-lg font-black text-[#001d4a] capitalize leading-tight">{job.service}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Ref: {job.id.split('-')[0].toUpperCase()} · {job.preferred_date || 'Date TBD'}
              {job.preferred_time ? ` · ${job.preferred_time}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
            <Icon d="M19 9l-7 7-7-7" className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-7 pb-8 grid lg:grid-cols-2 gap-6">
          {/* Left: booking info + timeline */}
          <div className="space-y-5">
            {job.notes && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Your Notes</p>
                <p className="text-sm font-bold text-[#001d4a]">{job.notes}</p>
              </div>
            )}
            <WorkflowTimeline job={job} />
          </div>

          {/* Right: technician info */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned Technician</p>
            {a?.worker ? (
              <div className="bg-[#001d4a] rounded-3xl p-7 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16" />
                <div className="flex items-center gap-5 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl">
                    {a.worker.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-lg leading-tight">{a.worker.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-1 capitalize">{(a.worker.specializations ?? []).join(', ')} Specialist</p>
                  </div>
                </div>
                <div className="relative z-10 space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-t border-white/10">
                    <span className="text-white/50 font-bold text-xs uppercase tracking-wide">Security Code</span>
                    <span className="font-black tabular-nums tracking-widest">CR-{a.id.slice(-4).toUpperCase()}</span>
                  </div>
                  {a.worker.phone && (
                    <div className="flex justify-between items-center py-2 border-t border-white/10">
                      <span className="text-white/50 font-bold text-xs uppercase tracking-wide">Contact</span>
                      <span className="font-black">{a.worker.phone}</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-white/30 font-bold text-center mt-5 relative z-10">
                  Arriving within your {job.preferred_time || 'scheduled'} window.
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                  <p className="font-black text-sm text-[#001d4a]">Finding Best Match</p>
                  <p className="text-gray-400 font-bold text-xs mt-1">We're assigning the right specialist for your job.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Customer Dashboard
// ──────────────────────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const [user, setUser]         = useState<any>(null);
  const [token, setToken]       = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [toast, setToast]       = useState<string | null>(null);
  const router = useRouter();

  const fetchDashboard = useCallback(async (t: string) => {
    try {
      const res = await fetch(`${API_URL}/api/customer/dashboard`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookings(data.bookings ?? []);
      if (data.customer) setUser(data.customer);
    } catch {
      /* swallow — next poll will retry */
    } finally {
      setLoading(false);
    }
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 8000);
  }

  useEffect(() => {
    const t = localStorage.getItem('customer_token');
    const u = localStorage.getItem('customer_data');
    if (!t || !u) { router.push('/login'); return; }
    setToken(t);
    const parsedUser = JSON.parse(u);
    setUser(parsedUser);
    fetchDashboard(t);
    const interval = setInterval(() => fetchDashboard(t), 10000);
    return () => clearInterval(interval);
  }, [router, fetchDashboard]);

  const logout = () => { localStorage.clear(); router.push('/'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#001d4a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black text-[#001d4a] uppercase tracking-widest text-xs">Loading your hub…</p>
        </div>
      </div>
    );
  }

  // Bucket bookings
  const assigned   = bookings.filter(b => ['assigned', 'accepted'].includes(b.status));
  const inProgress = bookings.filter(b => b.status === 'in_progress');
  const completed  = bookings.filter(b => b.status === 'completed');
  const pending    = bookings.filter(b => b.status === 'pending');
  const active     = bookings.filter(b => b.status !== 'completed');

  const TABS: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: 'services',  label: 'All Services',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', count: bookings.length },
    { id: 'assigned',  label: 'Assigned',         icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', count: assigned.length + inProgress.length },
    { id: 'completed', label: 'Completed',         icon: 'M5 13l4 4L19 7', count: completed.length },
    { id: 'create',    label: 'New Service',       icon: 'M12 4v16m8-8H4' },
    { id: 'help',      label: '24/7 Help',         icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* ── Hero Header ─────────────────────────────────────── */}
      <header className="bg-[#001d4a] text-white pt-10 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <p className="text-red-500 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Member Hub · Real-Time Sync</p>
            <h1 className="text-4xl md:text-5xl font-[1000] italic tracking-tighter mb-2">
              Hello, {user?.name?.split(' ')[0] ?? 'there'}!
            </h1>
            <p className="text-white/50 font-bold text-sm">Track your repairs and get live technician updates.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/10 text-center">
              <p className="text-2xl font-[1000]">{active.length}</p>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active</p>
            </div>
            <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/10 text-center">
              <p className="text-2xl font-[1000]">{completed.length}</p>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Done</p>
            </div>
            <button
              onClick={logout}
              className="bg-white/10 hover:bg-white/20 text-white font-black px-6 py-4 rounded-2xl transition-all border border-white/10 text-sm"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 -mt-12 relative z-20 pb-24">

        {/* Tab Bar */}
        <nav className="bg-white p-2.5 rounded-[28px] border border-gray-100 shadow-xl flex gap-1.5 mb-8 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-[20px] font-black text-sm transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-[#001d4a] text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
              `}
            >
              <Icon d={tab.icon} className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black
                  ${activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* ── All Services ──────────────────────────────────── */}
        {activeTab === 'services' && (
          <div className="space-y-5">
            {pending.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3">
                  ⏳ Pending Assignment ({pending.length})
                </p>
                <div className="space-y-4">
                  {pending.map(j => <BookingCard key={j.id} job={j} compact />)}
                </div>
              </div>
            )}
            {(assigned.length > 0 || inProgress.length > 0) && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3">
                  ⚡ In Progress ({assigned.length + inProgress.length})
                </p>
                <div className="space-y-4">
                  {[...assigned, ...inProgress].map(j => <BookingCard key={j.id} job={j} />)}
                </div>
              </div>
            )}
            {completed.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  ✓ Completed ({completed.length})
                </p>
                <div className="space-y-4">
                  {completed.map(j => <BookingCard key={j.id} job={j} compact />)}
                </div>
              </div>
            )}
            {bookings.length === 0 && (
              <EmptyState onBook={() => setActiveTab('create')} />
            )}
          </div>
        )}

        {/* ── Assigned ─────────────────────────────────────── */}
        {activeTab === 'assigned' && (
          <div className="space-y-5">
            {[...assigned, ...inProgress].length === 0 ? (
              <EmptyState label="No Assigned Jobs" sub="No technician assigned yet — check back soon." onBook={() => setActiveTab('create')} />
            ) : (
              [...assigned, ...inProgress].map(j => <BookingCard key={j.id} job={j} />)
            )}
          </div>
        )}

        {/* ── Completed ────────────────────────────────────── */}
        {activeTab === 'completed' && (
          <div>
            {completed.length === 0 ? (
              <EmptyState label="No Completed Services Yet" sub="Finished jobs will show up here." onBook={() => setActiveTab('create')} />
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {completed.map(j => (
                  <div key={j.id} className="bg-white border border-gray-100 p-7 rounded-[32px] shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-5">
                      <span className="text-3xl">{serviceIcon(j.service)}</span>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        {new Date(j.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-[#001d4a] mb-2 capitalize">{j.service}</h3>
                    {j.assignment?.worker && (
                      <p className="text-sm font-bold text-gray-500 mb-1">
                        Tech: <span className="text-[#001d4a]">{j.assignment.worker.name}</span>
                      </p>
                    )}
                    <p className="text-gray-400 font-bold text-sm mb-5">{j.notes || 'Service completed.'}</p>
                    {j.assignment?.worker_notes && (
                      <p className="text-xs font-bold italic text-gray-500 bg-gray-50 rounded-xl px-4 py-3 mb-4">"{j.assignment.worker_notes}"</p>
                    )}
                    <div className="flex flex-col gap-2 text-[10px]">
                      {j.assignment?.completed_at && (
                        <p className="text-gray-400 font-bold">
                          Completed: {fmt(j.assignment.completed_at)}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                        <Icon d="M5 13l4 4L19 7" className="w-3 h-3" />
                        Verified Work Order Complete
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Create Service ───────────────────────────────── */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
            <div className="bg-[#001d4a] px-10 py-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full" />
              <p className="text-red-500 font-black uppercase tracking-[0.3em] text-[10px] mb-3 relative z-10">Quick Dispatch</p>
              <h2 className="text-4xl font-[1000] italic tracking-tighter mb-3 relative z-10">Book a Service</h2>
              <p className="text-white/50 font-bold relative z-10 max-w-md">
                Our certified technicians cover HVAC, plumbing, electrical, and more. Same-day availability.
              </p>
            </div>
            <div className="p-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { id: 'hvac',       label: 'HVAC / AC Repair',        icon: '❄️', desc: 'Cooling, heating, tune-ups' },
                { id: 'furnace',    label: 'Furnace / Heating',        icon: '🔥', desc: 'Gas, heat pumps, electric' },
                { id: 'plumbing',   label: 'Plumbing',                 icon: '💧', desc: 'Leaks, drains, water heaters' },
                { id: 'electrical', label: 'Electrical',               icon: '⚡', desc: 'Panels, wiring, smart home' },
                { id: 'thermostat', label: 'Thermostat / Smart Home',  icon: '🌡️', desc: 'Nest, Ecobee, Honeywell' },
                { id: 'other',      label: 'Other / Not Sure',         icon: '🔧', desc: 'Tell us what you need' },
              ].map(svc => (
                <Link
                  key={svc.id}
                  href={`/schedule?service=${svc.id}`}
                  className="p-6 rounded-3xl border-2 border-gray-100 hover:border-red-400 hover:bg-red-50/30 transition-all group flex flex-col gap-4"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{svc.icon}</span>
                  <div>
                    <h3 className="font-black text-[#001d4a] text-sm">{svc.label}</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-tight mt-1">{svc.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-10 pb-10">
              <Link
                href="/schedule"
                className="w-full flex items-center justify-center gap-3 py-6 bg-[#e31b23] text-white font-black text-lg rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-[0.98]"
              >
                <Icon d="M12 4v16m8-8H4" className="w-5 h-5" />
                Start Full Booking Form
              </Link>
            </div>
          </div>
        )}

        {/* ── Help ─────────────────────────────────────────── */}
        {activeTab === 'help' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left info panel */}
            <div className="bg-[#001d4a] rounded-[40px] p-10 text-white relative overflow-hidden lg:col-span-1">
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 blur-3xl -mr-20 -mt-20" />
              <h3 className="text-3xl font-[1000] italic tracking-tighter mb-8 relative z-10">
                Expert Help,<br /><span className="text-red-500">Fast.</span>
              </h3>
              <div className="space-y-7 relative z-10">
                {[
                  { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label: 'Emergency Line', val: '(555) 123-4567' },
                  { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Email Support', val: 'help@customrepair.com' },
                  { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Response Time', val: '< 60 minutes' },
                ].map(item => (
                  <div key={item.label} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Icon d={item.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">{item.label}</p>
                      <p className="font-bold text-sm">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: FAQ + Chat */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl p-8">
                <h4 className="font-black text-[#001d4a] text-xl mb-6 italic">Common Questions</h4>
                <div className="space-y-4">
                  {[
                    { q: 'How soon can a technician arrive?', a: 'Same-day or within 2 hours for emergencies. We confirm arrival window by phone within 60 minutes of booking.' },
                    { q: 'What\'s included in a free estimate?', a: 'A full diagnostic of the issue, cost breakdown, and timeline — at no charge, no obligation.' },
                    { q: 'What if I need to reschedule?', a: 'Call or text us at (555) 123-4567 at least 2 hours before your window and we\'ll find a new slot.' },
                    { q: 'Is there a warranty on work done?', a: 'Yes — lifetime workmanship guarantee on all labor. Parts carry manufacturer warranty.' },
                  ].map(item => (
                    <details key={item.q} className="group bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <summary className="font-black text-[#001d4a] text-sm cursor-pointer list-none flex justify-between items-center">
                        {item.q}
                        <Icon d="M19 9l-7 7-7-7" className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-3 text-sm text-gray-500 font-bold leading-relaxed">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl p-8 flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-3xl animate-bounce">💬</span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#001d4a] mb-1">Live AI Troubleshooting</h4>
                  <p className="text-gray-400 font-bold text-sm">Describe the issue and our AI assistant will guide you through initial steps.</p>
                </div>
                <Link
                  href="/#chat"
                  className="bg-[#001d4a] text-white font-black px-10 py-5 rounded-2xl shadow-xl hover:bg-[#002b6b] transition-all"
                >
                  Launch Support Chat
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Real-time Toast ──────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[100] max-w-sm animate-slide-up">
          <div className="bg-[#001d4a] text-white px-7 py-5 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-5">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
              <Icon d="M13 10V3L4 14h7v7l9-11h-7z" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-0.5">Live Update</p>
              <p className="text-sm font-bold leading-tight">{toast}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function EmptyState({
  label = 'No Services Yet',
  sub   = "You don't have any bookings. Start by creating a service request.",
  onBook,
}: { label?: string; sub?: string; onBook: () => void }) {
  return (
    <div className="bg-white border-2 border-dashed border-gray-200 rounded-[40px] p-20 text-center">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-black text-[#001d4a] mb-2 italic">{label}</h3>
      <p className="text-gray-400 font-bold mb-8 max-w-xs mx-auto">{sub}</p>
      <button
        onClick={onBook}
        className="inline-block bg-[#001d4a] text-white font-black px-10 py-5 rounded-2xl shadow-xl hover:bg-[#002b6b] transition-all active:scale-95"
      >
        Schedule a Service
      </button>
    </div>
  );
}
