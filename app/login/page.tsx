'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

type LoginResponse = {
  access_token: string;
  user: {
    _id: string;
    name?: string;
    email: string;
    role?: string;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Login failed');
      }

      const payload = data as LoginResponse;
      console.log('Login response payload:', payload);
      if (!payload?.access_token) {
        throw new Error('Access token missing in response');
      }

      localStorage.setItem('accessToken', payload.access_token);
      // localStorage.setItem('authUser', JSON.stringify(payload.user || null));

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.12),_transparent_30%),linear-gradient(180deg,_#0b0b12,_#08080d)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#d4af37]">

            </p>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight">
              Winstead Admin Control Panel
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">
              Secure access for operations, property management, CRM workflows,
              media controls, and master configuration.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
            <p className="text-sm text-white/80">Admin access only</p>
            <p className="mt-2 text-xs leading-6 text-white/50">
              This panel is intended for internal staff, relationship managers,
              sales teams, and content administrators.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur sm:p-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.32em] text-[#d4af37]">
                Sign in
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Enter your credentials to access the admin dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-white/80">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#11131a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#d4af37]/60"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#11131a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#d4af37]/60"
                  placeholder="Enter your password"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  'w-full rounded-2xl px-4 py-3 text-sm font-medium transition',
                  loading
                    ? 'cursor-not-allowed bg-white/10 text-white/40'
                    : 'bg-[#d4af37] text-black hover:opacity-90'
                )}
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}