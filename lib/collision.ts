import type { PlacedItem } from './types';
import { STACKABLE_CATEGORIES } from './types';
import { getCatalogItem } from './catalog';

export function getDisplayDims(item: PlacedItem): { dw: number; dh: number } {
  const cat = getCatalogItem(item.catalogId);
  if (!cat) return { dw: 1, dh: 1 };
  const rotated = item.rotation % 180 !== 0;
  return { dw: rotated ? cat.h : cat.w, dh: rotated ? cat.w : cat.h };
}

/**
 * Returns true if a box of (dw × dh) at (x, y) can be placed without overlap.
 *
 * Stacking rule:
 *  - Stackable items (monitor/input/audio/lighting) may overlap desk footprints.
 *  - Desks may overlap stackable items (so moving a desk that has gear on it works).
 *  - Everything else follows normal collision.
 */
export function canPlace(
  items: PlacedItem[],
  x: number,
  y: number,
  dw: number,
  dh: number,
  catalogId: string,
  excludeUid: string | null,
  roomW: number,
  roomH: number
): boolean {
  if (x < 0 || y < 0 || x + dw > roomW || y + dh > roomH) return false;

  const newCat = getCatalogItem(catalogId);
  const newIsStackable = newCat ? STACKABLE_CATEGORIES.has(newCat.category) : false;
  const newIsDesk = newCat?.category === 'desk';

  for (const item of items) {
    if (item.uid === excludeUid) continue;
    const existingCat = getCatalogItem(item.catalogId);
    if (!existingCat) continue;

    const existingIsDesk = existingCat.category === 'desk';
    const existingIsStackable = STACKABLE_CATEGORIES.has(existingCat.category);

    // Stackable ↔ desk: always allow overlap in both directions
    if ((newIsStackable && existingIsDesk) || (newIsDesk && existingIsStackable)) continue;

    const { dw: iw, dh: ih } = getDisplayDims(item);
    const clear =
      x + dw <= item.x || x >= item.x + iw ||
      y + dh <= item.y || y >= item.y + ih;
    if (!clear) return false;
  }
  return true;
}

/**
 * Returns true if a stackable item's center sits within any desk's footprint.
 * Used to elevate the item in 3D and show the ↑ indicator in 2D.
 */
export function isItemOnDesk(item: PlacedItem, allItems: PlacedItem[]): boolean {
  const cat = getCatalogItem(item.catalogId);
  if (!cat || !STACKABLE_CATEGORIES.has(cat.category)) return false;

  const rotated = item.rotation % 180 !== 0;
  const dw = rotated ? cat.h : cat.w;
  const dh = rotated ? cat.w : cat.h;
  const cx = item.x + dw / 2;
  const cy = item.y + dh / 2;

  return allItems.some((other) => {
    if (other.uid === item.uid) return false;
    const oc = getCatalogItem(other.catalogId);
    if (oc?.category !== 'desk') return false;
    const oRot = other.rotation % 180 !== 0;
    const odw = oRot ? oc.h : oc.w;
    const odh = oRot ? oc.w : oc.h;
    return cx > other.x && cx < other.x + odw && cy > other.y && cy < other.y + odh;
  });
}
