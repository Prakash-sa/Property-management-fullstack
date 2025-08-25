import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../auth/authSlice';

export default function UserMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return (
    <button onClick={() => { dispatch(logout()); navigate('/login'); }} className="rounded-xl border px-3 py-1.5 text-sm">Logout</button>
  );
}
