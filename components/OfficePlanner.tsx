'use client';
import dynamic from 'next/dynamic';
import ItemCatalog from './ItemCatalog';
import RoomCanvas from './RoomCanvas';
import PropertiesPanel from './PropertiesPanel';
import { usePlannerStore } from '@/lib/store';

// Three.js canvas must be client-only (no SSR)
const DeskPreview3D = dynamic(() => import('./DeskPreview3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
      Loading 3D…
    </div>
  ),
});

export default function OfficePlanner() {
  const planName   = usePlannerStore((s) => s.planName);
  const setPlanName = usePlannerStore((s) => s.setPlanName);
  const clearAll   = usePlannerStore((s) => s.clearAll);
  const itemCount  = usePlannerStore((s) => s.items.length);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0">🏢</span>
          <input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="bg-transparent text-white font-semibold text-base focus:outline-none border-b border-transparent focus:border-blue-500 transition-colors min-w-0 truncate"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-500">
            {itemCount} item{itemCount !== 1 ? 's' : ''} placed
          </span>
          <button
            onClick={() => { if (confirm('Clear all items?')) clearAll(); }}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
          <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">
            Office Layout Planner
          </span>
        </div>
      </header>

      {/* ── Main panels ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Left: item catalog */}
        <aside className="w-52 shrink-0 border-r border-gray-800 overflow-y-auto bg-gray-900">
          <ItemCatalog />
        </aside>

        {/* Center: 2D canvas */}
        <main className="flex-1 overflow-auto bg-gray-800 p-5">
          <RoomCanvas />
        </main>

        {/* Right: 3D preview + properties */}
        <aside className="w-72 shrink-0 border-l border-gray-800 flex flex-col bg-gray-900 overflow-hidden">
          {/* 3D view — fixed height */}
          <div className="h-72 shrink-0 border-b border-gray-800">
            <DeskPreview3D />
          </div>

          {/* Properties panel — scrollable remainder */}
          <div className="flex-1 overflow-y-auto">
            <PropertiesPanel />
          </div>
        </aside>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────── */}
      <footer className="flex items-center gap-4 px-4 py-1 bg-gray-900 border-t border-gray-800 shrink-0 text-xs text-gray-600">
        <span>Room: {ROOM_W_LABEL} × {ROOM_H_LABEL}</span>
        <span>&bull;</span>
        <span>Drag from catalog &rarr; canvas &bull; <kbd className="bg-gray-800 text-gray-400 px-1 rounded">R</kbd> rotate &bull; <kbd className="bg-gray-800 text-gray-400 px-1 rounded">Del</kbd> delete</span>
      </footer>
    </div>
  );
}

const ROOM_W_LABEL = '40 ft';
const ROOM_H_LABEL = '32 ft';
