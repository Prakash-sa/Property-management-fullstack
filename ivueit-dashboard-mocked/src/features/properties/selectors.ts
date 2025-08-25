import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

export const selectPropsState = (s: RootState) => s.properties;
export const selectById = (s: RootState) => s.properties.byId;
export const selectAllIds = (s: RootState) => s.properties.allIds;
export const selectFilter = (s: RootState) => s.properties.filter;

export const selectFilteredIds = createSelector([selectAllIds, selectById, selectFilter], (ids, byId, filter) => {
  if (filter === 'all') return ids;
  return ids.filter((id) => byId[id]?.status === filter);
});

export const selectPagedIds = createSelector([selectFilteredIds, selectPropsState], (filteredIds, props) => {
  const start = (props.page - 1) * props.pageSize;
  return filteredIds.slice(start, start + props.pageSize);
});
