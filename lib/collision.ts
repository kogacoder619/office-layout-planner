import type { PlacedItem } from './types';
import { getCatalogItem } from './catalog';

export function getDisplayDims(item: PlacedItem): { dw: number; dh: number } {
  const cat = getCatalogItem(item.catalogId);
  if (!cat) return { dw: 1, dh: 1 };
  const rotated = item.rotation % 180 !== 0;
  return { dw: rotated ? cat.h : cat.w, dh: rotated ? cat.w : cat.h };
}

/**
 * Returns true if a box of (dw × dh) placed at (x, y) fits inside the room
 * and does not overlap any existing item (excluding excludeUid).
 */
export function canPlace(
  items: PlacedItem[],
  x: number,
  y: number,
  dw: number,
  dh: number,
  excludeUid: string | null,
  roomW: number,
  roomH: number
): boolean {
  if (x < 0 || y < 0 || x + dw > roomW || y + dh > roomH) return false;

  for (const item of items) {
    if (item.uid === excludeUid) continue;
    const { dw: iw, dh: ih } = getDisplayDims(item);
    const clear =
      x + dw <= item.x || x >= item.x + iw ||
      y + dh <= item.y || y >= item.y + ih;
    if (!clear) return false;
  }
  return true;
}
