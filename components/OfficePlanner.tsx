'use client';
import dynamic from 'next/dynamic';
import ItemCatalog from './ItemCatalog';
import RoomCanvas from './RoomCanvas';
import PropertiesPanel from './PropertiesPanel';
import { usePlannerStore } from '@/lib/store';

const DeskPreview3D = dynamic(() => import('./DeskPreview3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
      Loading 3D…
    </div>
  ),
});

export default function OfficePlanner() {
  const planName    = usePlannerStore((s) => s.planName);
  const setPlanName = usePlannerStore((s) => s.setPlanName);
  const clearAll    = usePlannerStore((s) => s.clearAll);
  const itemCount   = usePlannerStore((s) => s.items.length);
  const canUndo     = usePlannerStore((s) => s.history.length > 0);
  const canRedo     = usePlannerStore((s) => s.future.length > 0);
  const undo        = usePlannerStore((s) => s.undo);
  const redo        = usePlannerStore((s) => s.redo);
  const roomW       = usePlannerStore((s) => s.roomW);
  const roomH       = usePlannerStore((s) => s.roomH);
  const setRoomSize = usePlannerStore((s) => s.setRoomSize);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        {/* Plan name */}
        <span className="text-xl shrink-0">🏢</span>
        <input
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="bg-transparent text-white font-semibold text-base focus:outline-none border-b border-transparent focus:border-blue-500 transition-colors w-40 truncate"
        />

        <div className="w-px h-5 bg-gray-700 shrink-0" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="px-2 py-1 text-sm rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ↩
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="px-2 py-1 text-sm rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ↪
        </button>

        <div className="w-px h-5 bg-gray-700 shrink-0" />

        {/* Room size */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
          <span>Room</span>
          <input
            type="number"
            min={8} max={40}
            value={roomW}
            onChange={(e) => setRoomSize(Math.max(8, Math.min(40, +e.target.value || roomW)), roomH)}
            className="w-11 text-center bg-gray-800 text-white rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-gray-600">×</span>
          <input
            type="number"
            min={8} max={40}
            value={roomH}
            onChange={(e) => setRoomSize(roomW, Math.max(8, Math.min(40, +e.target.value || roomH)))}
            className="w-11 text-center bg-gray-800 text-white rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-gray-600">cells</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Item count + clear */}
        <span className="text-xs text-gray-500 shrink-0">
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => { if (confirm('Clear all items?')) clearAll(); }}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors shrink-0"
        >
          Clear all
        </button>
      </header>

      {/* ── Main panels ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Left: catalog */}
        <aside className="w-52 shrink-0 border-r border-gray-800 overflow-y-auto bg-gray-900">
          <ItemCatalog />
        </aside>

        {/* Center: 2D canvas */}
        <main className="flex-1 overflow-auto bg-gray-800 p-5">
          <RoomCanvas />
        </main>

        {/* Right: 3D preview + properties */}
        <aside className="w-72 shrink-0 border-l border-gray-800 flex flex-col bg-gray-900 overflow-hidden">
          <div className="h-72 shrink-0 border-b border-gray-800">
            <DeskPreview3D />
          </div>
          <div className="flex-1 overflow-y-auto">
            <PropertiesPanel />
          </div>
        </aside>
      </div>

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <footer className="flex items-center gap-3 px-4 py-1 bg-gray-900 border-t border-gray-800 shrink-0 text-xs text-gray-600">
        <span>{roomW * 2} ft &times; {roomH * 2} ft</span>
        <span>&bull;</span>
        <span>Layout auto-saved to browser</span>
        <span>&bull;</span>
        <span>
          Blue ghost&nbsp;= valid drop &nbsp;&nbsp;
          Red ghost&nbsp;= blocked
        </span>
      </footer>
    </div>
  );
}
