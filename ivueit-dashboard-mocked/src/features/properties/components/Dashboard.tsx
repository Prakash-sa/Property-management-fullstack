import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchAllProperties, fetchMoreProperties, upsertProperty } from '../propertiesSlice';
import { selectAllIds, selectFilter, selectFilteredIds, selectPagedIds } from '../selectors';
import PropertyListVirtual from './PropertyListVirtual';
import FilterBar from './FilterBar';
import UserMenu from './UserMenu';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.properties.mode);
  const status = useAppSelector((s) => s.properties.status);
  const error = useAppSelector((s) => s.properties.error);
  const hasMore = useAppSelector((s) => s.properties.hasMore);
  const filter = useAppSelector(selectFilter);
  const allIds = useAppSelector(selectAllIds);
  const pagedIds = useAppSelector(selectPagedIds);
  const filteredIds = useAppSelector(selectFilteredIds);
  const token = useAppSelector((s) => s.auth.token);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token) return;
    if (mode === 'pagination') dispatch(fetchAllProperties());
    else dispatch(fetchMoreProperties({ offset: 0, limit: 30, status: filter }));
  }, [dispatch, mode, filter, token]);

  useEffect(() => {
    if (mode !== 'infinite') return;
    const el = sentinelRef.current; if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasMore && status !== 'loading') {
        dispatch(fetchMoreProperties({ offset: allIds.length, limit: 30, status: filter }));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode, hasMore, status, allIds.length, filter, dispatch]);

  useEffect(() => {
    if (!token) return;
    const es = new EventSource(`/api/properties/stream?token=${encodeURIComponent(token)}`);
    es.onmessage = (evt) => { try { const update = JSON.parse(evt.data); dispatch(upsertProperty(update)); } catch {} };
    return () => es.close();
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <h1 className="text-xl font-semibold">iVueit • Property Dashboard</h1>
          <div className="ml-auto" />
          <UserMenu />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-4"><FilterBar /></div>
        <div className="rounded-2xl bg-white shadow-sm border">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-4 border-b px-4 py-3 text-sm font-medium text-gray-600">
            <div>Name</div><div>Price</div><div>Status</div><div>Location</div>
          </div>
          <div className="p-2">
            {mode === 'pagination' ? (
              <PropertyListVirtual ids={pagedIds} />
            ) : (
              <>
                <PropertyListVirtual ids={filteredIds} />
                <div ref={sentinelRef} className="h-10 flex items-center justify-center text-sm text-gray-500">
                  {hasMore ? (status === 'loading' ? 'Loading more…' : 'Scroll to load more') : 'All records loaded'}
                </div>
              </>
            )}
          </div>
          {error && <div className="border-t p-3 text-sm text-rose-700 bg-rose-50">{String(error)}</div>}
        </div>
      </main>
    </div>
  );
}
