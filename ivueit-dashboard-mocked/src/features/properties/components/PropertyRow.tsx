import React from 'react';
import type { Property } from '../../../types';
import { fmtPrice } from '../../../utils/format';

const statusStyles: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  sold: 'bg-rose-100 text-rose-800 border-rose-200',
};

export default React.memo(function PropertyRow({ property }: { property: Property }) {
  return (
    <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-4 items-center border-b py-3">
      <div className="truncate font-medium">{property.name}</div>
      <div className="tabular-nums">{fmtPrice(property.price)}</div>
      <div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[property.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
          {property.status}
        </span>
      </div>
      <div className="truncate text-gray-700">{property.location}</div>
    </div>
  );
});
