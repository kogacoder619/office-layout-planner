'use client';
import { usePlannerStore } from '@/lib/store';
import { getCatalogItem, CATEGORIES } from '@/lib/catalog';

// ── Inventory view (no item selected) ──────────────────────────────────────

function InventoryView() {
  const items     = usePlannerStore((s) => s.items);
  const selectItem = usePlannerStore((s) => s.selectItem);

  const grouped = CATEGORIES.map((c) => ({
    ...c,
    entries: items.filter((i) => getCatalogItem(i.catalogId)?.category === c.key),
  })).filter((g) => g.entries.length > 0);

  if (items.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center gap-2 text-center text-gray-600">
        <span className="text-3xl opacity-30">🖱</span>
        <p className="text-xs leading-relaxed">
          Drag items from the catalog onto the canvas to start planning.
          <br />
          <span className="text-gray-500">
            Click an item to inspect it.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Inventory &mdash; {items.length} item{items.length !== 1 ? 's' : ''}
      </div>

      <div className="space-y-3">
        {grouped.map((group) => (
          <div key={group.key}>
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <span>{group.icon}</span>
              <span>{group.label}</span>
              <span className="ml-auto text-gray-600">&times;{group.entries.length}</span>
            </div>
            {group.entries.map((item) => {
              const cat = getCatalogItem(item.catalogId)!;
              return (
                <button
                  key={item.uid}
                  onClick={() => selectItem(item.uid)}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 text-left transition-colors"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: cat.color3d }}
                  />
                  <span className="text-xs text-gray-300 truncate flex-1">{cat.name}</span>
                  <span className="text-xs text-gray-600 font-mono shrink-0">
                    {item.x},{item.y}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Properties view (item selected) ────────────────────────────────────────

export default function PropertiesPanel() {
  const { selectedUid, items, rotateItem, removeItem, selectItem, duplicateItem } =
    usePlannerStore();

  const placed   = items.find((i) => i.uid === selectedUid);
  const cat      = placed ? getCatalogItem(placed.catalogId) : null;
  const catMeta  = CATEGORIES.find((c) => c.key === cat?.category);

  if (!placed || !cat) return <InventoryView />;

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
        <button
          onClick={() => selectItem(null)}
          className="ml-auto text-gray-600 hover:text-gray-300 text-xs shrink-0"
          title="Deselect"
        >
          ✕
        </button>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded p-2 space-y-1.5">
        <Row label="Position" value={`(${placed.x} ft, ${placed.y} ft)`} />
        <Row label="Size"     value={`${dw} ft × ${dh} ft`} />
        <Row label="Dims"     value={`${Math.round(dw * 12)}" × ${Math.round(dh * 12)}"`} />
        <Row label="Rotation" value={`${placed.rotation}°`} />
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 leading-relaxed bg-gray-800/50 rounded p-2">
        {cat.description}
      </p>

      {/* Actions */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => rotateItem(placed.uid)}
            className="flex-1 py-1.5 text-xs font-medium rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            ↻ Rotate 90°
          </button>
          <button
            onClick={() => duplicateItem(placed.uid)}
            className="flex-1 py-1.5 text-xs font-medium rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            ⧉ Duplicate
          </button>
        </div>
        <button
          onClick={() => { removeItem(placed.uid); selectItem(null); }}
          className="w-full py-1.5 text-xs font-medium rounded bg-red-900/60 hover:bg-red-800/80 text-red-200 transition-colors"
        >
          🗑 Delete item
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
