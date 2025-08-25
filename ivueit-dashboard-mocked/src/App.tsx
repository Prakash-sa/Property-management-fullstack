import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import Dashboard from './features/properties/components/Dashboard';
import RequireAuth from './routes/RequireAuth';
import { useAppSelector } from './app/hooks';

export default function App() {
  const token = useAppSelector((s) => s.auth.token);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
    </Routes>
  );
}
