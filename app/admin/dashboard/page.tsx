"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LucideIcon, ICONS } from "../../components/ui/Icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

const STATUS_THEMES: Record<string, { label: string; badge: string; icon: string }> = {
  pending: { label: "Wait for Worker", badge: "bg-amber-50 text-amber-600 border-amber-100", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  assigned: { label: "Worker Assigned", badge: "bg-blue-50 text-blue-600 border-blue-100", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0z" },
  accepted: { label: "Confirmed", badge: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  in_progress: { label: "Working Now", badge: "bg-violet-50 text-violet-600 border-violet-100", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  completed: { label: "Done", badge: "bg-gray-50 text-gray-500 border-gray-100", icon: "M5 13l4 4L19 7" },
  cancelled: { label: "Cancelled", badge: "bg-red-50 text-red-600 border-red-100", icon: "M6 18L18 6" },
};

function StatCard({ label, value, trend, color, icon }: { label: string; value: any; trend?: string; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}10`, color }}>
          <LucideIcon d={icon} className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full tracking-widest uppercase">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-[1000] tracking-tighter text-slate-900 leading-none">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();

  const [admin, setAdmin] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsStatus, setWsStatus] = useState("offline");

  const [bookings, setBookings] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [bookingFilter, setBookingFilter] = useState("all");
  const [notification, setNotification] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    const savedData = localStorage.getItem("admin_data");
    if (!savedToken || !savedData) { router.replace("/admin/login"); return; }
    try {
      setToken(savedToken);
      setAdmin(JSON.parse(savedData));
    } catch (e) { router.replace("/admin/login"); }
  }, [router]);

  const fetchData = useCallback(async () => {
    const savedToken = localStorage.getItem("admin_token");
    if (!savedToken) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard-data`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setBookings(data.bookings || []);
      setWorkers(data.workers || []);
      setAdminUsers(data.adminUsers || []);
      setAnalytics(data.analytics);
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Auto-fetch Error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const connectWs = useCallback(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (!savedToken || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) return;
    setWsStatus("connecting");
    const ws = new WebSocket(`${WS_URL}/ws/admin?token=${savedToken}`);
    wsRef.current = ws;
    ws.onopen = () => setWsStatus("online");
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "new_booking" || data.type === "new_lead" || data.type === "job_status_update" || data.type === "job_assigned") {
           setNotification({ 
             title: data.type.replace(/_/g, ' ').toUpperCase(), 
             msg: data.message || "State change detected" 
           });
           fetchData();
           setTimeout(() => setNotification(null), 8000);
        }
      } catch (err) { console.error("WS Error", err); }
    };
    ws.onclose = () => { setWsStatus("offline"); setTimeout(connectWs, 5000); };
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { 
    if (admin) {
      fetchData(); 
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }
  }, [admin, fetchData]);

  useEffect(() => { connectWs(); return () => wsRef.current?.close(); }, [connectWs]);

  const toggleStatus = async (type: string, id: string) => {
    const savedToken = localStorage.getItem("admin_token");
    if (!savedToken) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/${type}/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      if (res.ok) fetchData();
    } catch (e) { console.error("Toggle failed"); }
  };

  const assignJob = async (bookingId: string, workerId: string) => {
    const savedToken = localStorage.getItem("admin_token");
    if (!workerId || !savedToken) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedToken}` },
        body: JSON.stringify({ booking_id: bookingId, worker_id: workerId }),
      });
      if (res.ok) fetchData();
    } catch (e) { console.error("Assign failed"); }
  };

  if (!admin) return <div className="min-h-screen bg-slate-50" />;

  const NAVIGATION = [
    { id: "overview", label: "Overview", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", roles: ["admin"] },
    { id: "dispatch", label: "Job Map", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L10 7.5l6-3 5.447 2.724A1 1 0 0122 8.118v10.764a1 1 0 01-1.447.894L15 17.5l-6 3z", roles: ["admin", "manager"] },
    { id: "bookings", label: "Bookings", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", roles: ["admin", "employee"] },
    { id: "workers", label: "Workers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857", roles: ["admin", "manager"] },
    { id: "customers", label: "Customers", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197", roles: ["admin", "manager", "employee"] },
    { id: "users", label: "Staff", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", roles: ["admin"] },
  ].filter(t => t.roles.includes(admin.role));

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 fixed inset-y-0 z-50 flex flex-col p-6 border-r border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-900/40 italic">CR</div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">Admin</h1>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Command Node</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAVIGATION.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-[1000] uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <LucideIcon d={item.icon} className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/5">
          <button onClick={() => { localStorage.clear(); router.replace("/admin/login"); }} className="w-full py-4 rounded-xl border border-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-[10px] font-black uppercase tracking-widest">Sign out</button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-[1000] text-slate-900 tracking-tighter italic">{NAVIGATION.find(t => t.id === activeTab)?.label}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${wsStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{wsStatus} Real-Time Stream</span>
            </div>
          </div>
          <button onClick={fetchData} disabled={isRefreshing} className={`p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all hover:shadow-md ${isRefreshing ? 'animate-spin' : ''}`}><LucideIcon d={ICONS.REFRESH} className="w-5 h-5" /></button>
        </div>

        {activeTab === "overview" && analytics && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Bookings" value={analytics.bookings.total} icon={ICONS.CALENDAR} color="#6366f1" />
              <StatCard label="In Progress" value={analytics.bookings.in_progress} icon={ICONS.BOLT} color="#0ea5e9" />
              <StatCard label="Completed" value={analytics.bookings.completed || 0} icon={ICONS.CHECK} color="#10b981" />
              <StatCard label="Online Techs" value={analytics.workers.available} icon={ICONS.USER} color="#f59e0b" />
            </div>
          </div>
        )}

        {(activeTab === "dispatch" || activeTab === "bookings") && (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden animate-fadeIn">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Master Ledger</p>
              <div className="flex gap-2">
                {["all", "pending", "assigned", "accepted", "in_progress"].map(f => (
                  <button key={f} onClick={() => setBookingFilter(f)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${bookingFilter === f ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"><th className="px-6 py-4">Service</th><th className="px-6 py-4">Client</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Dispatch</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4"><p className="text-sm font-black text-slate-900 capitalize">{b.service}</p><p className="text-[10px] text-slate-400 font-bold">Ref: {b.id.split('-')[0]}</p></td>
                    <td className="px-6 py-4"><p className="text-sm font-bold text-slate-700">{b.user?.name}</p><p className="text-[10px] text-slate-400 font-bold">{b.preferred_date}</p></td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_THEMES[b.status]?.badge}`}>{STATUS_THEMES[b.status]?.label}</span></td>
                    <td className="px-6 py-4">
                      <select onChange={e => assignJob(b.id, e.target.value)} className="bg-gray-50 border-2 border-transparent rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-all w-full max-w-[140px]" value={b.assignment?.worker_id || ""}>
                        <option value="">Dispatch...</option>
                        {workers.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))}
                      </select>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {notification && (
        <div className="fixed bottom-8 right-8 z-[120] animate-slideUp">
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 min-w-[300px]">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg"><LucideIcon d={ICONS.BOLT} className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-0.5">{notification.title}</p>
              <p className="text-xs font-bold leading-tight">{notification.msg}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
