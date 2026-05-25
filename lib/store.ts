import { create } from 'zustand';
import { PlacedItem, ROOM_W, ROOM_H } from './types';

interface PlannerStore {
  roomW: number;
  roomH: number;
  items: PlacedItem[];
  selectedUid: string | null;
  planName: string;
  addItem: (item: Omit<PlacedItem, 'uid'>) => void;
  moveItem: (uid: string, x: number, y: number) => void;
  rotateItem: (uid: string) => void;
  removeItem: (uid: string) => void;
  selectItem: (uid: string | null) => void;
  clearAll: () => void;
  setPlanName: (name: string) => void;
}

export const usePlannerStore = create<PlannerStore>((set) => ({
  roomW: ROOM_W,
  roomH: ROOM_H,
  items: [],
  selectedUid: null,
  planName: 'My Office',

  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        { ...item, uid: crypto.randomUUID() },
      ],
    })),

  moveItem: (uid, x, y) =>
    set((state) => ({
      items: state.items.map((i) => (i.uid === uid ? { ...i, x, y } : i)),
    })),

  rotateItem: (uid) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.uid === uid ? { ...i, rotation: (i.rotation + 90) % 360 } : i
      ),
    })),

  removeItem: (uid) =>
    set((state) => ({
      items: state.items.filter((i) => i.uid !== uid),
      selectedUid: state.selectedUid === uid ? null : state.selectedUid,
    })),

  selectItem: (uid) => set({ selectedUid: uid }),

  clearAll: () => set({ items: [], selectedUid: null }),

  setPlanName: (name) => set({ planName: name }),
}));
