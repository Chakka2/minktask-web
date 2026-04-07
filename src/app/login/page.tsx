'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuthAccount, getAuthUser, setAuthUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const existing = getAuthUser();
    if (existing) router.replace('/dashboard');
  }, [router]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const account = getAuthAccount();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    if (!account || account.email !== cleanEmail || account.password !== cleanPass) {
      setError('Invalid email or password');
      return;
    }
    setAuthUser({ email: cleanEmail });
    router.push('/dashboard');
  };

  return (
    <main className="page-bg min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="glass-card w-full max-w-md p-8 space-y-4">
        <h1 className="text-2xl font-bold text-white">Login</h1>
        <p className="text-sm text-white/50">Continue to your dashboard.</p>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          className="input-field"
          type="email"
          required
          placeholder="Email"
        />
        <input
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          className="input-field"
          type="password"
          required
          placeholder="Password"
        />
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        <button type="submit" className="btn-primary w-full">
          Login
        </button>
        <p className="text-sm text-white/50">
          New user? <Link href="/signup" className="text-blue-400 hover:underline">Create account</Link>
        </p>
      </form>
    </main>
  );
}

