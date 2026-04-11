'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');

      localStorage.setItem('customer_token', data.access_token);
      localStorage.setItem('customer_data', JSON.stringify(data.user));
      
      const pendingBooking = localStorage.getItem('pending_booking');
      if (pendingBooking) {
        router.push('/schedule?resume=true');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-[1000] italic tracking-tighter text-[#001d4a] mb-2">Create Account</h1>
          <p className="text-gray-400 font-bold">Join Custom Repair for faster booking</p>
        </div>

        <div className="bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,29,74,0.12)] border border-gray-100 p-8 md:p-10">
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
              <input
                name="name" type="text" required
                value={form.name} onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-[#001d4a] outline-none focus:border-[#e31b23] focus:bg-white transition-all shadow-inner"
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
              <input
                name="email" type="email" required
                value={form.email} onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-[#001d4a] outline-none focus:border-[#e31b23] focus:bg-white transition-all shadow-inner"
                placeholder="name@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone</label>
                <input
                  name="phone" type="tel" required
                  value={form.phone} onChange={handleChange}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-[#001d4a] outline-none focus:border-[#e31b23] focus:bg-white transition-all shadow-inner"
                  placeholder="(555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                <input
                  name="password" type="password" required
                  value={form.password} onChange={handleChange}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-[#001d4a] outline-none focus:border-[#e31b23] focus:bg-white transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Address</label>
              <input
                name="address" type="text"
                value={form.address} onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-[#001d4a] outline-none focus:border-[#e31b23] focus:bg-white transition-all shadow-inner"
                placeholder="123 Main St, Atlanta, GA"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                <p className="text-red-500 text-xs font-black text-center">⚠️ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#e31b23] text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:bg-red-600 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-50">
            <p className="text-gray-400 font-bold text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[#001d4a] hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
