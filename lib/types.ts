export type Category = 'desk' | 'chair' | 'monitor' | 'input' | 'audio' | 'lighting';

export interface CatalogItem {
  id: string;
  name: string;
  category: Category;
  /** Width in grid cells (unrotated) */
  w: number;
  /** Height/depth in grid cells (unrotated) */
  h: number;
  /** 2D fill color (hex) */
  color: string;
  /** 3D mesh color (hex) */
  color3d: string;
  icon: string;
  description: string;
}

export interface PlacedItem {
  uid: string;
  catalogId: string;
  /** Grid column (0-indexed from left) */
  x: number;
  /** Grid row (0-indexed from top) */
  y: number;
  /** Rotation in degrees: 0 | 90 | 180 | 270 */
  rotation: number;
}

export const CELL_SIZE = 48;  // px per grid cell (1 cell = 1 ft)
export const SNAP = 0.5;      // snap granularity in cells (0.5 ft = 6 in)
export const ROOM_W = 16;     // default room width  (16 ft)
export const ROOM_H = 12;     // default room height (12 ft)

/** Categories that can be placed on top of desk surfaces (no floor collision with desks) */
export const STACKABLE_CATEGORIES: ReadonlySet<Category> = new Set([
  'monitor', 'input', 'audio', 'lighting',
]);
