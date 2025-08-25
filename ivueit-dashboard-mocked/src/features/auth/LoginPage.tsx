import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login } from './authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, token } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { if (token) navigate('/'); }, [token, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await dispatch(login({ email, password })).unwrap(); navigate('/'); } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-semibold mb-6">Sign in to iVueit</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input className="w-full rounded-xl border p-2.5 outline-none focus:ring" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="username" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input className="w-full rounded-xl border p-2.5 outline-none focus:ring" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && <p className="text-sm text-rose-600">{String(error)}</p>}
          <button type="submit" disabled={status === 'loading'} className="w-full rounded-xl bg-black text-white py-2.5 font-medium disabled:opacity-60">
            {status === 'loading' ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
