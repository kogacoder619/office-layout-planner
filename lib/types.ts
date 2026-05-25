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

export const CELL_SIZE = 48;  // px per grid cell
export const ROOM_W = 20;     // room width in cells  (~40 ft)
export const ROOM_H = 16;     // room height in cells (~32 ft)
