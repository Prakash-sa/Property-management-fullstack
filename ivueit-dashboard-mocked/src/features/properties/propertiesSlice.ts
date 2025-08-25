import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Property, PropertyStatus } from '../../types';
import { getWithRetry } from '../../services/api';

interface PropsState {
  byId: Record<string, Property>;
  allIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'all' | PropertyStatus;
  mode: 'pagination' | 'infinite';
  page: number;
  pageSize: number;
  hasMore: boolean;
  total: number;
  lastQueriedOffset: number;
}

const initialState: PropsState = {
  byId: {}, allIds: [], status: 'idle', error: null, filter: 'all', mode: 'pagination',
  page: 1, pageSize: 20, hasMore: true, total: 0, lastQueriedOffset: 0,
};

const normalize = (arr: Property[]) => {
  const byId: Record<string, Property> = {}; const allIds: string[] = [];
  for (const p of arr) { byId[p.id] = p; allIds.push(p.id); }
  return { byId, allIds };
};

export const fetchAllProperties = createAsyncThunk('properties/fetchAll', async () => {
  const { data } = await getWithRetry('/properties'); return data as Property[];
});

export const fetchMoreProperties = createAsyncThunk('properties/fetchMore',
  async ({ offset, limit, status }: { offset: number; limit: number; status: PropsState['filter']; }) => {
    const { data } = await getWithRetry('/properties', { params: { offset, limit, ...(status && status !== 'all' ? { status } : {}) } });
    return data as Property[];
  });

const slice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
      if (state.mode === 'infinite') { state.byId = {}; state.allIds = []; state.hasMore = true; state.lastQueriedOffset = 0; }
      else { state.page = 1; }
    },
    setMode(state, action) {
      const next = action.payload as PropsState['mode'];
      if (state.mode !== next) { state.mode = next; state.byId = {}; state.allIds = []; state.hasMore = true; state.page = 1; state.lastQueriedOffset = 0; state.status = 'idle'; state.error = null; }
    },
    setPage(state, action) { state.page = action.payload; },
    upsertProperty(state, action) {
      const p = action.payload as Property; const exists = !!state.byId[p.id];
      state.byId[p.id] = { ...state.byId[p.id], ...p } as Property;
      if (!exists) state.allIds.unshift(p.id);
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchAllProperties.pending, (s) => { s.status = 'loading'; s.error = null; });
    b.addCase(fetchAllProperties.fulfilled, (s, a) => {
      const { byId, allIds } = normalize(a.payload); s.byId = byId; s.allIds = allIds; s.status = 'succeeded'; s.total = allIds.length; s.hasMore = false;
    });
    b.addCase(fetchAllProperties.rejected, (s, a) => { s.status = 'failed'; s.error = a.error?.message || 'Failed to fetch properties'; });
    b.addCase(fetchMoreProperties.pending, (s) => { s.status = 'loading'; s.error = null; });
    b.addCase(fetchMoreProperties.fulfilled, (s, a) => {
      const chunk = a.payload || [];
      for (const p of chunk) { const exists = !!s.byId[p.id]; s.byId[p.id] = p; if (!exists) s.allIds.push(p.id); }
      s.status = 'succeeded'; s.lastQueriedOffset = s.allIds.length; s.hasMore = chunk.length > 0; s.total = s.allIds.length;
    });
    b.addCase(fetchMoreProperties.rejected, (s, a) => { s.status = 'failed'; s.error = a.error?.message || 'Failed to fetch more properties'; });
  },
});

export const { setFilter, setMode, setPage, upsertProperty } = slice.actions;
export default slice.reducer;
