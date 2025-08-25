import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setFilter } from '../propertiesSlice';
import ModeToggle from './ModeToggle';
import PaginationControls from './PaginationControls';

export default function FilterBar() {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((s) => s.properties.filter);
  const mode = useAppSelector((s) => s.properties.mode);
  const status = useAppSelector((s) => s.properties.status);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select value={filter} onChange={(e) => dispatch(setFilter(e.target.value))} className="rounded-xl border p-2.5" aria-label="Filter by status">
        <option value="all">All statuses</option>
        <option value="available">Available</option>
        <option value="pending">Pending</option>
        <option value="sold">Sold</option>
      </select>
      <ModeToggle />
      {mode === 'pagination' && <PaginationControls />}
      {status === 'loading' && <span className="ml-auto animate-pulse text-sm text-gray-500">Loading…</span>}
    </div>
  );
}
