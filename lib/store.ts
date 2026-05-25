import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlacedItem } from './types';
import { ROOM_W, ROOM_H } from './types';

interface PlannerStore {
  roomW: number;
  roomH: number;
  items: PlacedItem[];
  selectedUid: string | null;
  planName: string;
  // Ephemeral undo/redo stacks (not persisted)
  history: PlacedItem[][];
  future: PlacedItem[][];

  addItem: (item: Omit<PlacedItem, 'uid'>) => void;
  moveItem: (uid: string, x: number, y: number) => void;
  rotateItem: (uid: string) => void;
  removeItem: (uid: string) => void;
  duplicateItem: (uid: string) => void;
  selectItem: (uid: string | null) => void;
  clearAll: () => void;
  setPlanName: (name: string) => void;
  setRoomSize: (w: number, h: number) => void;
  undo: () => void;
  redo: () => void;
}

// Push current items into history and return new items/history/future
function snap(
  s: Pick<PlannerStore, 'items' | 'history' | 'future'>,
  next: PlacedItem[]
): Pick<PlannerStore, 'items' | 'history' | 'future'> {
  return {
    items: next,
    history: [...s.history.slice(-29), s.items],
    future: [],
  };
}

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      roomW: ROOM_W,
      roomH: ROOM_H,
      items: [],
      selectedUid: null,
      planName: 'My Office',
      history: [],
      future: [],

      addItem: (item) =>
        set((s) => snap(s, [...s.items, { ...item, uid: crypto.randomUUID() }])),

      moveItem: (uid, x, y) =>
        set((s) => snap(s, s.items.map((i) => (i.uid === uid ? { ...i, x, y } : i)))),

      rotateItem: (uid) =>
        set((s) =>
          snap(
            s,
            s.items.map((i) =>
              i.uid === uid ? { ...i, rotation: (i.rotation + 90) % 360 } : i
            )
          )
        ),

      removeItem: (uid) =>
        set((s) => ({
          ...snap(s, s.items.filter((i) => i.uid !== uid)),
          selectedUid: s.selectedUid === uid ? null : s.selectedUid,
        })),

      duplicateItem: (uid) =>
        set((s) => {
          const orig = s.items.find((i) => i.uid === uid);
          if (!orig) return {};
          const copy: PlacedItem = {
            ...orig,
            uid: crypto.randomUUID(),
            x: Math.min(orig.x + 1, s.roomW - 1),
            y: Math.min(orig.y + 1, s.roomH - 1),
          };
          return { ...snap(s, [...s.items, copy]), selectedUid: copy.uid };
        }),

      selectItem: (uid) => set({ selectedUid: uid }),

      clearAll: () => set((s) => ({ ...snap(s, []), selectedUid: null })),

      setPlanName: (name) => set({ planName: name }),

      setRoomSize: (w, h) => set({ roomW: w, roomH: h }),

      undo: () =>
        set((s) => {
          if (!s.history.length) return {};
          const prev = s.history[s.history.length - 1];
          return {
            items: prev,
            history: s.history.slice(0, -1),
            future: [s.items, ...s.future.slice(0, 29)],
            selectedUid: null,
          };
        }),

      redo: () =>
        set((s) => {
          if (!s.future.length) return {};
          const [next, ...rest] = s.future;
          return {
            items: next,
            history: [...s.history.slice(-29), s.items],
            future: rest,
            selectedUid: null,
          };
        }),
    }),
    {
      name: 'office-planner-v1',
      // Only persist the layout data, not ephemeral UI or history stacks
      partialize: (s) => ({
        items: s.items,
        planName: s.planName,
        roomW: s.roomW,
        roomH: s.roomH,
      }),
    }
  )
);
