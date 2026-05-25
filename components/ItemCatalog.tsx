'use client';
import { useState } from 'react';
import { CATALOG, CATEGORIES } from '@/lib/catalog';
import { dragState } from '@/lib/dragState';
import type { CatalogItem } from '@/lib/types';

function CatalogCard({ item }: { item: CatalogItem }) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/catalog-item', item.id);
    e.dataTransfer.effectAllowed = 'copy';
    dragState.set({ type: 'catalog', catalogId: item.id, dw: item.w, dh: item.h });
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => dragState.clear()}
      className="flex items-center gap-2 px-2 py-1.5 mx-2 mb-1 rounded cursor-grab active:cursor-grabbing bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 transition-colors select-none"
      title={item.description}
    >
      <div
        className="w-3 h-3 rounded-sm shrink-0 border border-white/20"
        style={{ backgroundColor: item.color3d }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-white truncate">{item.name}</div>
        <div className="text-xs text-gray-500">{Math.round(item.w * 12)}&Prime;&thinsp;&times;&thinsp;{Math.round(item.h * 12)}&Prime;</div>
      </div>
      <span className="text-base opacity-60 shrink-0">{item.icon}</span>
    </div>
  );
}

export default function ItemCatalog() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.key, true]))
  );
  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="py-2 select-none">
      <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Drag items onto the canvas
      </div>

      {CATEGORIES.map((cat) => {
        const items = CATALOG.filter((i) => i.category === cat.key);
        const open = expanded[cat.key];
        return (
          <div key={cat.key} className="mb-0.5">
            <button
              onClick={() => toggle(cat.key)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <span className="text-base">{cat.icon}</span>
              <span className="flex-1 text-left">{cat.label}</span>
              <span className="text-gray-600 text-xs">{open ? '▾' : '▸'}</span>
            </button>
            {open && (
              <div className="pb-1">
                {items.map((item) => <CatalogCard key={item.id} item={item} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
