'use client';
import { usePlannerStore } from '@/lib/store';
import { getCatalogItem, CATEGORIES } from '@/lib/catalog';

export default function PropertiesPanel() {
  const { selectedUid, items, rotateItem, removeItem, selectItem } =
    usePlannerStore();

  const placed = items.find((i) => i.uid === selectedUid);
  const cat    = placed ? getCatalogItem(placed.catalogId) : null;
  const catMeta = CATEGORIES.find((c) => c.key === cat?.category);

  if (!placed || !cat) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-2 text-center text-gray-600">
        <span className="text-3xl opacity-30">🖱</span>
        <p className="text-xs leading-relaxed">
          Click an item on the canvas to inspect it.
          <br />
          Use <kbd className="bg-gray-800 text-gray-300 px-1 rounded">R</kbd> to rotate
          and <kbd className="bg-gray-800 text-gray-300 px-1 rounded">Del</kbd> to delete.
        </p>
      </div>
    );
  }

  const rotated = placed.rotation % 180 !== 0;
  const dw = rotated ? cat.h : cat.w;
  const dh = rotated ? cat.w : cat.h;

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-5 h-5 rounded shrink-0 border border-white/20"
          style={{ backgroundColor: cat.color3d }}
        />
        <div className="min-w-0">
          <div className="font-semibold text-sm text-white truncate">{cat.name}</div>
          <div className="text-xs text-gray-400">
            {catMeta?.icon} {catMeta?.label}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded p-2 space-y-1.5">
        <Row label="Position" value={`(${placed.x}, ${placed.y})`} />
        <Row label="Grid size" value={`${dw} × ${dh} cells`} />
        <Row label="Approx size" value={`${dw * 2}′ × ${dh * 2}′`} />
        <Row label="Rotation" value={`${placed.rotation}°`} />
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 leading-relaxed bg-gray-800/50 rounded p-2">
        {cat.description}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => rotateItem(placed.uid)}
          className="flex-1 py-1.5 text-xs font-medium rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          ↻ Rotate 90°
        </button>
        <button
          onClick={() => { removeItem(placed.uid); selectItem(null); }}
          className="flex-1 py-1.5 text-xs font-medium rounded bg-red-900/60 hover:bg-red-800/80 text-red-200 transition-colors"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 font-mono">{value}</span>
    </div>
  );
}
