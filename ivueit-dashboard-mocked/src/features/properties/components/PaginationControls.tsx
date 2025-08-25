import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setPage } from '../propertiesSlice';
import { selectFilteredIds } from '../selectors';

export default function PaginationControls() {
  const dispatch = useAppDispatch();
  const page = useAppSelector((s) => s.properties.page);
  const pageSize = useAppSelector((s) => s.properties.pageSize);
  const totalFiltered = useAppSelector(selectFilteredIds).length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  return (
    <div className="flex items-center gap-2 ml-auto">
      <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" onClick={() => dispatch(setPage(Math.max(1, page - 1)))} disabled={page <= 1}>Prev</button>
      <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
      <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))} disabled={page >= totalPages}>Next</button>
    </div>
  );
}
