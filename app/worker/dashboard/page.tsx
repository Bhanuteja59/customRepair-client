"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { LucideIcon, ICONS } from "../../components/ui/Icons";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const getWS = () => {
  const url = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
  if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("ws:")) {
    return url.replace("ws:", "wss:");
  }
  return url;
};
const WS = getWS();

const STATUS_THEMES: Record<string, { label: string; badge: string; icon: string }> = {
  pending:     { label: "Wait for Admin", badge: "bg-amber-50 text-amber-600 border-amber-100",  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  assigned:    { label: "New Job for You!",   badge: "bg-blue-50 text-blue-600 border-blue-100",     icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0z" },
  accepted:    { label: "Ready to Start",        badge: "bg-emerald-50 text-emerald-600 border-emerald-100",  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  in_progress: { label: "Working Now",  badge: "bg-emerald-50 text-emerald-600 border-emerald-100",  icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  completed:   { label: "Done!",        badge: "bg-gray-50 text-gray-500 border-gray-100",     icon: "M5 13l4 4L19 7" },
};

export default function WorkerDashboard() {
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("my_jobs");
  const [jobs, setJobs] = useState<any[]>([]);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [wsStatus, setWsStatus] = useState("offline");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notification, setNotification] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("worker_token");
    const w = localStorage.getItem("worker_data");
    if (!t || !w) { router.replace("/worker/login"); return; }
    setWorker(JSON.parse(w));
  }, [router]);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("worker_token");
    if (!token) return;
    setIsRefreshing(true);
    try {
      const [resMy, resAll] = await Promise.all([
        fetch(`${API}/api/workers/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/workers/pending-jobs`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const myData = await resMy.json();
      const allData = await resAll.json();
      setJobs(Array.isArray(myData) ? myData : []);
      setAvailableJobs(Array.isArray(allData) ? allData : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const connectWs = useCallback(() => {
    const token = localStorage.getItem("worker_token");
    const wData = localStorage.getItem("worker_data");
    if (!token || !wData || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) return;
    const workerId = JSON.parse(wData).id;
    
    setWsStatus("connecting");
    const ws = new WebSocket(`${WS}/ws/worker/${workerId}?token=${token}`);
    wsRef.current = ws;
    ws.onopen = () => setWsStatus("online");
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "new_assignment" || data.type === "new_lead") {
          setNotification({ 
            title: "Real-time Node Update", 
            msg: data.type === "new_assignment" ? "Direct Assignment Received" : "New Lead in Area",
            id: data.assignment?.id || data.assignment_id
          });
          fetchData();
        }
      } catch (err) { console.error("WS Parse Error", err); }
    };
    ws.onclose = () => { setWsStatus("offline"); setTimeout(connectWs, 5000); };
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { 
    if (worker) {
      fetchData(); 
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }
  }, [worker, fetchData]);

  useEffect(() => {
    if (worker) connectWs();
    return () => wsRef.current?.close();
  }, [worker, connectWs]);

  async function updateStatus(assignmentId: string, status: string, notes: string | null = null) {
    const token = localStorage.getItem("worker_token");
    if (!token) return;
    
    try {
      const res = await fetch(`${API}/api/jobs/${assignmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        fetchData();
        setNotification(null);
      }
    } catch (err) { console.error("Update error:", err); }
  }

  if (!worker) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 fixed inset-y-0 z-50 flex flex-col p-6 border-r border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-900/40 italic">CR</div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">Worker</h1>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Live Technician</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: "my_jobs", label: "My Desk", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", badge: 0 },
            { id: "market", label: "Job Market", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", badge: availableJobs.length },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[11px] font-[1000] uppercase tracking-widest transition-all ${
                activeTab === item.id ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-900/40' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <LucideIcon d={item.icon} className="w-5 h-5" />
                {item.label}
              </div>
              {(item.badge ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-black text-white text-[10px]">{worker.name.charAt(0)}</div>
            <div className="overflow-hidden leading-tight"><p className="text-[10px] font-black text-white truncate uppercase">{worker.name}</p><p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{worker.specialization}</p></div>
          </div>
          <button onClick={() => { localStorage.clear(); router.replace("/worker/login"); }} className="w-full py-4 rounded-xl border border-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-[10px] font-black uppercase tracking-widest">Logout</button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-[1000] text-slate-900 tracking-tighter italic capitalize">{activeTab.replace('_', ' ')}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${wsStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{wsStatus} Technical Node</span>
            </div>
          </div>
          <p className="text-sm font-black text-slate-900 tabular-nums bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">{currentTime.toLocaleTimeString()}</p>
        </div>

        <div className="space-y-6 animate-fadeIn">
          {(activeTab === "my_jobs" ? jobs : availableJobs).map(a => (
            <div key={a.id} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none" />
               
               <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="flex-1 space-y-6">
                     <div className="flex items-start justify-between">
                        <div>
                           <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${STATUS_THEMES[a.status]?.badge}`}>
                             {STATUS_THEMES[a.status]?.label || a.status}
                           </span>
                           <h3 className="text-xl font-[1000] text-slate-900 mt-3 tracking-tighter italic capitalize">{a.booking?.service}</h3>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch ID</p>
                           <p className="text-sm font-black text-slate-900 mt-1 italic tracking-tighter">#{a.id.split('-')[1]}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 rounded-2xl p-4 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><LucideIcon d={ICONS.CALENDAR} className="w-5 h-5" /></div>
                           <div className="leading-tight"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</p><p className="text-xs font-black text-slate-900 mt-0.5">{a.booking?.preferred_date}</p></div>
                        </div>
                        <div className="bg-slate-50/50 rounded-2xl p-4 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><LucideIcon d={ICONS.MAP} className="w-5 h-5" /></div>
                           <div className="leading-tight max-w-[150px]"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p><p className="text-xs font-black text-slate-900 mt-0.5 truncate">{a.booking?.user?.address}</p></div>
                        </div>
                     </div>
                  </div>

                  <div className="md:w-56 flex flex-col justify-end gap-3 pt-6 md:pt-0 md:border-l md:pl-8 border-slate-100">
                     {activeTab === "market" && (
                        <button onClick={() => updateStatus(a.id, 'accepted')} className="w-full py-5 bg-emerald-500 text-white font-[1000] text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all">Claim Job ✓</button>
                     )}
                     {a.status === 'assigned' && (
                        <button onClick={() => updateStatus(a.id, 'accepted')} className="w-full py-5 bg-emerald-500 text-white font-[1000] text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all">Confirm Match ✓</button>
                     )}
                     {a.status === 'accepted' && (
                        <button onClick={() => updateStatus(a.id, 'in_progress')} className="w-full py-5 bg-indigo-600 text-white font-[1000] text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Start Task ⚡</button>
                     )}
                     {a.status === 'in_progress' && (
                        <button onClick={() => updateStatus(a.id, 'completed')} className="w-full py-5 bg-slate-900 text-white font-[1000] text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-slate-100 hover:bg-black active:scale-95 transition-all">Complete ✓</button>
                     )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
