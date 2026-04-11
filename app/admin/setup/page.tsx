"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function AdminSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", department: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "admin", department: form.department || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Setup failed");
      localStorage.setItem("admin_token", data.access_token);
      localStorage.setItem("admin_data", JSON.stringify(data.admin));
      router.replace("/admin/dashboard");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] animate-fadeIn">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-[1000] text-slate-900 tracking-tighter italic uppercase">Initialization</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure root superadmin profile</p>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {['name', 'email', 'department', 'password', 'confirm'].map(f => (
              <div key={f}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">{f}</label>
                <input 
                  type={f.includes('password') || f === 'confirm' ? 'password' : 'text'}
                  required={f !== 'department'}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all text-sm"
                  onChange={e => setForm({...form, [f]: e.target.value})}
                />
              </div>
            ))}
            <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg mt-4">{loading ? 'Provisioning...' : 'Provision Account'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
