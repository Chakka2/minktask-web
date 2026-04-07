'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuthUser, setAuthAccount, setAuthUser } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const existing = getAuthUser();
    if (existing) router.replace('/dashboard');
  }, [router]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    const cleanEmail = email.trim().toLowerCase();
    setAuthAccount({ email: cleanEmail, password: password.trim() });
    setAuthUser({ email: cleanEmail });
    router.push('/dashboard');
  };

  return (
    <main className="page-bg min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="glass-card w-full max-w-md p-8 space-y-4">
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="text-sm text-white/50">Complete this once after your entry payment is confirmed.</p>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          type="email"
          required
          placeholder="Email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          type="password"
          required
          placeholder="Password"
        />
        <button type="submit" className="btn-primary w-full">
          Create account
        </button>
        <p className="text-sm text-white/50">
          Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Login</Link>
        </p>
      </form>
    </main>
  );
}

