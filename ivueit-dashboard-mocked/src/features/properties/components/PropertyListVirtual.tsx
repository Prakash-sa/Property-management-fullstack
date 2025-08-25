import React, { useMemo } from 'react';
import { FixedSizeList as VirtualList } from 'react-window';
import { useAppSelector } from '../../../app/hooks';
import { selectById } from '../selectors';
import PropertyRow from './PropertyRow';

export default function PropertyListVirtual({ ids }: { ids: string[] }) {
  const byId = useAppSelector(selectById);
  const itemData = useMemo(() => ({ ids, byId }), [ids, byId]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const id = itemData.ids[index];
    const p = itemData.byId[id];
    return (
      <div style={style} className="px-2">
        {p && <PropertyRow property={p} />}
      </div>
    );
  };

  return (
    <VirtualList height={560} width={'100%'} itemCount={ids.length} itemSize={68} overscanCount={6}>
      {Row as any}
    </VirtualList>
  );
}
