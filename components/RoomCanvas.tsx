'use client';
import { useRef, useCallback, useEffect } from 'react';
import { usePlannerStore } from '@/lib/store';
import { getCatalogItem } from '@/lib/catalog';
import { CELL_SIZE, ROOM_W, ROOM_H } from '@/lib/types';

// ── Single placed item ──────────────────────────────────────────────────────

interface PlacedProps {
  uid: string;
  catalogId: string;
  x: number;
  y: number;
  rotation: number;
  selected: boolean;
}

function PlacedItem({ uid, catalogId, x, y, rotation, selected }: PlacedProps) {
  const selectItem = usePlannerStore((s) => s.selectItem);
  const cat = getCatalogItem(catalogId);
  if (!cat) return null;

  const rotated = rotation % 180 !== 0;
  const dw = rotated ? cat.h : cat.w;
  const dh = rotated ? cat.w : cat.h;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const offsetY = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    e.dataTransfer.setData(
      'application/placed-item',
      JSON.stringify({ uid, offsetX, offsetY })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => { e.stopPropagation(); selectItem(uid); }}
      className={`absolute rounded flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none transition-[box-shadow] ${
        selected
          ? 'ring-2 ring-white shadow-lg z-10'
          : 'hover:ring-1 hover:ring-gray-300'
      }`}
      style={{
        left:   x  * CELL_SIZE + 2,
        top:    y  * CELL_SIZE + 2,
        width:  dw * CELL_SIZE - 4,
        height: dh * CELL_SIZE - 4,
        backgroundColor: cat.color + 'dd',
        borderLeft: `3px solid ${cat.color3d}`,
      }}
    >
      <span className="text-lg leading-none pointer-events-none">{cat.icon}</span>
      <span className="text-white text-xs font-medium leading-tight mt-0.5 px-1 text-center truncate w-full pointer-events-none">
        {cat.name}
      </span>
    </div>
  );
}

// ── Room canvas ─────────────────────────────────────────────────────────────

export default function RoomCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { items, addItem, moveItem, selectItem, selectedUid, rotateItem, removeItem } =
    usePlannerStore();

  // Keyboard shortcuts for selected item
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedUid) return;
      if (e.key === 'r' || e.key === 'R') rotateItem(selectedUid);
      if (e.key === 'Delete' || e.key === 'Backspace') removeItem(selectedUid);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedUid, rotateItem, removeItem]);

  const gridPos = useCallback(
    (e: React.DragEvent, offsetX = 0, offsetY = 0) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = Math.max(0, Math.min(ROOM_W - 1, Math.floor((e.clientX - rect.left)  / CELL_SIZE) - offsetX));
      const y = Math.max(0, Math.min(ROOM_H - 1, Math.floor((e.clientY - rect.top) / CELL_SIZE) - offsetY));
      return { x, y };
    },
    []
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/placed-item')
      ? 'move'
      : 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/placed-item')) {
      const { uid, offsetX, offsetY } = JSON.parse(
        e.dataTransfer.getData('application/placed-item')
      );
      const { x, y } = gridPos(e, offsetX, offsetY);
      moveItem(uid, x, y);
    } else {
      const catalogId = e.dataTransfer.getData('application/catalog-item');
      if (catalogId) {
        const { x, y } = gridPos(e);
        addItem({ catalogId, x, y, rotation: 0 });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>
          Room&nbsp;
          <span className="text-gray-200">{ROOM_W}&times;{ROOM_H}</span>
          &nbsp;grid&nbsp;
          <span className="text-gray-500">(1 cell ≈ 2 ft)</span>
        </span>
        <span className="text-gray-600">&bull;</span>
        <span>
          <kbd className="bg-gray-800 px-1 rounded text-gray-300">R</kbd> rotate
          &nbsp;&nbsp;
          <kbd className="bg-gray-800 px-1 rounded text-gray-300">Del</kbd> delete
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative bg-white rounded border-2 border-gray-300 select-none overflow-hidden"
        style={{
          width:  ROOM_W * CELL_SIZE,
          height: ROOM_H * CELL_SIZE,
          backgroundImage: [
            'linear-gradient(to right, #e5e7eb 1px, transparent 1px)',
            'linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => selectItem(null)}
      >
        {/* Wall markers */}
        <div className="absolute inset-0 border-4 border-gray-400 rounded pointer-events-none" />

        {/* Placed items */}
        {items.map((item) => (
          <PlacedItem
            key={item.uid}
            {...item}
            selected={item.uid === selectedUid}
          />
        ))}

        {/* Empty state hint */}
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2 opacity-30">🏢</div>
              <div className="text-sm opacity-50">Drag items here to start planning</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
