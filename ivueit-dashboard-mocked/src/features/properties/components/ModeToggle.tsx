import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setMode } from '../propertiesSlice';

export default function ModeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.properties.mode);
  return (
    <div className="inline-flex rounded-xl border overflow-hidden">
      <button className={`px-3 py-2 text-sm ${mode === 'pagination' ? 'bg-gray-900 text-white' : 'bg-white'}`} onClick={() => dispatch(setMode('pagination'))}>Pagination</button>
      <button className={`px-3 py-2 text-sm ${mode === 'infinite' ? 'bg-gray-900 text-white' : 'bg-white'}`} onClick={() => dispatch(setMode('infinite'))}>Infinite Scroll</button>
    </div>
  );
}
