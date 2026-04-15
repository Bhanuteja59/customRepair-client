"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LucideIcon, ICONS } from "../../components/ui/Icons";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function WorkerLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/workers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Login failed");
      localStorage.setItem("worker_token", data.access_token);
      localStorage.setItem("worker_data", JSON.stringify(data.worker));
      router.replace("/worker/dashboard");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] animate-fadeIn">
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-emerald-500 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-100 italic text-white font-[1000] text-2xl">CR</div>
           <h1 className="text-2xl font-[1000] text-slate-900 tracking-tighter italic uppercase">Technical Node</h1>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Field login for technicians</p>
        </div>
        
        <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <input 
                type="email" required placeholder="tech@customrepair.com" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] p-5 font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all shadow-inner"
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" required placeholder="••••••••" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] p-5 font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all shadow-inner"
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>
            {error && <p className="text-[10px] font-black text-red-500 uppercase text-center bg-red-50 py-3 rounded-xl border border-red-100">⚠️ {error}</p>}
            <button disabled={loading} className="w-full py-5 bg-emerald-500 text-white font-[1000] text-[10px] uppercase tracking-[0.2em] rounded-[20px] shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all">
              {loading ? "Establishing Sync..." : "Confirm Presence ✓"}
            </button>
          </form>
          <div className="mt-8 pt-6 text-center">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Live Pulse Enabled · End-to-End Secure</p>
          </div>
        </div>
      </div>
      <style jsx global>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }`}</style>
    </div>
  );
}
