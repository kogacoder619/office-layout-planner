'use client';
import { useRef, useCallback, useEffect, useState } from 'react';
import { usePlannerStore } from '@/lib/store';
import { getCatalogItem } from '@/lib/catalog';
import { canPlace, getDisplayDims } from '@/lib/collision';
import { dragState } from '@/lib/dragState';
import { CELL_SIZE } from '@/lib/types';

// ── Ghost overlay shown while dragging ──────────────────────────────────────

interface Ghost {
  x: number;
  y: number;
  dw: number;
  dh: number;
  valid: boolean;
}

// ── Single placed item ───────────────────────────────────────────────────────

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
    dragState.set({ type: 'placed', catalogId, uid, dw, dh, offsetX, offsetY });
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => dragState.clear()}
      onClick={(e) => { e.stopPropagation(); selectItem(uid); }}
      className={`absolute rounded flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none transition-[box-shadow] ${
        selected ? 'ring-2 ring-white shadow-lg z-10' : 'hover:ring-1 hover:ring-gray-300'
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

// ── Room canvas ──────────────────────────────────────────────────────────────

export default function RoomCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    items, addItem, moveItem, selectItem, selectedUid,
    rotateItem, removeItem, undo, redo, roomW, roomH,
  } = usePlannerStore();

  const [ghost, setGhost] = useState<Ghost | null>(null);

  // ── Keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return; }

      if (!selectedUid) return;
      if (e.key === 'r' || e.key === 'R') rotateItem(selectedUid);
      if (e.key === 'Delete' || e.key === 'Backspace') removeItem(selectedUid);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedUid, rotateItem, removeItem, undo, redo]);

  // ── Grid position from mouse event ────────────────────────────────
  const gridPos = useCallback(
    (e: React.DragEvent, offsetX = 0, offsetY = 0) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(roomW - 1, Math.floor((e.clientX - rect.left)  / CELL_SIZE) - offsetX)),
        y: Math.max(0, Math.min(roomH - 1, Math.floor((e.clientY - rect.top) / CELL_SIZE) - offsetY)),
      };
    },
    [roomW, roomH]
  );

  // ── Drag over: update ghost ───────────────────────────────────────
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const src = dragState.active;
      if (!src) return;

      const offsetX = src.type === 'placed' ? src.offsetX : 0;
      const offsetY = src.type === 'placed' ? src.offsetY : 0;
      const rect = canvasRef.current!.getBoundingClientRect();
      const rawX = Math.floor((e.clientX - rect.left) / CELL_SIZE) - offsetX;
      const rawY = Math.floor((e.clientY - rect.top)  / CELL_SIZE) - offsetY;
      const x = Math.max(0, Math.min(roomW - src.dw, rawX));
      const y = Math.max(0, Math.min(roomH - src.dh, rawY));

      const excludeUid = src.type === 'placed' ? src.uid : null;
      const valid = canPlace(items, x, y, src.dw, src.dh, excludeUid, roomW, roomH);

      setGhost({ x, y, dw: src.dw, dh: src.dh, valid });
      e.dataTransfer.dropEffect = src.type === 'placed' ? 'move' : 'copy';
    },
    [items, roomW, roomH]
  );

  const handleDragLeave = (e: React.DragEvent) => {
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) setGhost(null);
  };

  // ── Drop: place or move item if valid ────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setGhost(null);
      dragState.clear();

      if (e.dataTransfer.types.includes('application/placed-item')) {
        const { uid, offsetX, offsetY } = JSON.parse(
          e.dataTransfer.getData('application/placed-item')
        );
        const { x, y } = gridPos(e, offsetX, offsetY);
        const placed = items.find((i) => i.uid === uid);
        if (!placed) return;
        const { dw, dh } = getDisplayDims(placed);
        if (canPlace(items, x, y, dw, dh, uid, roomW, roomH)) {
          moveItem(uid, x, y);
        }
      } else {
        const catalogId = e.dataTransfer.getData('application/catalog-item');
        if (!catalogId) return;
        const cat = getCatalogItem(catalogId);
        if (!cat) return;
        const { x, y } = gridPos(e);
        if (canPlace(items, x, y, cat.w, cat.h, null, roomW, roomH)) {
          addItem({ catalogId, x, y, rotation: 0 });
        }
      }
    },
    [items, addItem, moveItem, gridPos, roomW, roomH]
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>
          Room&nbsp;
          <span className="text-gray-200">{roomW}&times;{roomH}</span>
          &nbsp;grid&nbsp;
          <span className="text-gray-500">(1 cell ≈ 2 ft)</span>
        </span>
        <span className="text-gray-600">&bull;</span>
        <span>
          <kbd className="bg-gray-800 px-1 rounded text-gray-300">R</kbd> rotate
          &nbsp;&nbsp;
          <kbd className="bg-gray-800 px-1 rounded text-gray-300">Del</kbd> delete
          &nbsp;&nbsp;
          <kbd className="bg-gray-800 px-1 rounded text-gray-300">Ctrl+Z</kbd> undo
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative bg-white rounded border-2 border-gray-300 select-none overflow-hidden"
        style={{
          width:  roomW * CELL_SIZE,
          height: roomH * CELL_SIZE,
          backgroundImage: [
            'linear-gradient(to right, #e5e7eb 1px, transparent 1px)',
            'linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => selectItem(null)}
      >
        {/* Wall border */}
        <div className="absolute inset-0 border-4 border-gray-400 rounded pointer-events-none" />

        {/* Placed items */}
        {items.map((item) => (
          <PlacedItem key={item.uid} {...item} selected={item.uid === selectedUid} />
        ))}

        {/* Drop ghost */}
        {ghost && (
          <div
            className={`absolute pointer-events-none rounded border-2 transition-colors ${
              ghost.valid
                ? 'border-blue-400 bg-blue-400/20'
                : 'border-red-400 bg-red-400/20'
            }`}
            style={{
              left:   ghost.x  * CELL_SIZE,
              top:    ghost.y  * CELL_SIZE,
              width:  ghost.dw * CELL_SIZE,
              height: ghost.dh * CELL_SIZE,
              zIndex: 20,
            }}
          />
        )}

        {/* Empty state */}
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
