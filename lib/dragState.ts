/**
 * Module-level mutable drag state shared across components.
 * The HTML5 DnD API blocks reading dataTransfer content during dragover,
 * so we track what's being dragged here instead.
 */

export type DragSource =
  | { type: 'catalog'; catalogId: string; dw: number; dh: number }
  | { type: 'placed'; catalogId: string; uid: string; dw: number; dh: number; offsetX: number; offsetY: number };

let _active: DragSource | null = null;

export const dragState = {
  get active(): DragSource | null { return _active; },
  set: (d: DragSource | null) => { _active = d; },
  clear: () => { _active = null; },
};
