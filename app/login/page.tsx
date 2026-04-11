'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');

      localStorage.setItem('customer_token', data.access_token);
      localStorage.setItem('customer_data', JSON.stringify(data.user));
      
      // Check if we came from schedule
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
          <h1 className="text-4xl font-[1000] italic tracking-tighter text-[#001d4a] mb-2">Welcome Back</h1>
          <p className="text-gray-400 font-bold">Access your Custom Repair dashboard</p>
        </div>

        <div className="bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,29,74,0.12)] border border-gray-100 p-8 md:p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold text-[#001d4a] outline-none focus:border-[#e31b23] focus:bg-white transition-all shadow-inner"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold text-[#001d4a] outline-none focus:border-[#e31b23] focus:bg-white transition-all shadow-inner"
                placeholder="••••••••"
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
              className="w-full py-6 bg-[#001d4a] text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:bg-[#002b6b] active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-50">
            <p className="text-gray-400 font-bold text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-red-500 hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
