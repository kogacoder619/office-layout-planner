import { CatalogItem } from './types';

export const CATALOG: CatalogItem[] = [
  // ── Desks ──────────────────────────────────────────────────────────
  {
    id: 'desk-l',
    name: 'L-Shape Desk',
    category: 'desk',
    w: 6, h: 4,
    color: '#78350F', color3d: '#D97706',
    icon: '🗂',
    description: '72"×60" L-shaped corner desk',
  },
  {
    id: 'desk-standing',
    name: 'Standing Desk',
    category: 'desk',
    w: 5, h: 2,
    color: '#7C2D12', color3d: '#EA580C',
    icon: '⬛',
    description: '60"×30" motorized sit-stand desk',
  },
  {
    id: 'desk-standard',
    name: 'Standard Desk',
    category: 'desk',
    w: 4, h: 2,
    color: '#92400E', color3d: '#F59E0B',
    icon: '⬛',
    description: '48"×24" standard writing desk',
  },

  // ── Chairs ─────────────────────────────────────────────────────────
  {
    id: 'chair-office',
    name: 'Office Chair',
    category: 'chair',
    w: 2, h: 2,
    color: '#111827', color3d: '#4B5563',
    icon: '🪑',
    description: 'Ergonomic mesh office chair',
  },
  {
    id: 'chair-gaming',
    name: 'Gaming Chair',
    category: 'chair',
    w: 2, h: 2,
    color: '#7F1D1D', color3d: '#DC2626',
    icon: '🪑',
    description: 'Racing-style gaming chair',
  },

  // ── Monitors ───────────────────────────────────────────────────────
  {
    id: 'monitor-27',
    name: '27" Monitor',
    category: 'monitor',
    w: 2, h: 1,
    color: '#1E3A5F', color3d: '#1D4ED8',
    icon: '🖥',
    description: '27" IPS 1440p display',
  },
  {
    id: 'monitor-ultra',
    name: 'Ultrawide 34"',
    category: 'monitor',
    w: 3, h: 1,
    color: '#1E3A5F', color3d: '#2563EB',
    icon: '🖥',
    description: '34" 21:9 ultrawide monitor',
  },
  {
    id: 'monitor-dual',
    name: 'Dual Monitors',
    category: 'monitor',
    w: 4, h: 1,
    color: '#172554', color3d: '#3B82F6',
    icon: '🖥',
    description: 'Two 24" displays side-by-side',
  },

  // ── Input ──────────────────────────────────────────────────────────
  {
    id: 'keyboard-tkl',
    name: 'Mech Keyboard',
    category: 'input',
    w: 2, h: 1,
    color: '#064E3B', color3d: '#059669',
    icon: '⌨',
    description: 'TKL mechanical keyboard',
  },
  {
    id: 'keyboard-full',
    name: 'Full Keyboard',
    category: 'input',
    w: 3, h: 1,
    color: '#065F46', color3d: '#10B981',
    icon: '⌨',
    description: 'Full-size keyboard with numpad',
  },
  {
    id: 'mouse-pad',
    name: 'Mouse + Pad',
    category: 'input',
    w: 2, h: 1,
    color: '#14532D', color3d: '#16A34A',
    icon: '🖱',
    description: 'Ergonomic mouse with large desk mat',
  },
  {
    id: 'tablet',
    name: 'Drawing Tablet',
    category: 'input',
    w: 2, h: 2,
    color: '#1E1B4B', color3d: '#4F46E5',
    icon: '✏',
    description: 'Graphics tablet for design work',
  },

  // ── Audio ──────────────────────────────────────────────────────────
  {
    id: 'speakers',
    name: 'Desk Speakers',
    category: 'audio',
    w: 3, h: 1,
    color: '#4C1D95', color3d: '#7C3AED',
    icon: '🔊',
    description: '2.0 studio monitor speakers',
  },
  {
    id: 'headphone-stand',
    name: 'Headphone Stand',
    category: 'audio',
    w: 1, h: 1,
    color: '#3B0764', color3d: '#9333EA',
    icon: '🎧',
    description: 'Headphone stand + DAC/amp',
  },
  {
    id: 'microphone',
    name: 'Microphone',
    category: 'audio',
    w: 1, h: 1,
    color: '#831843', color3d: '#DB2777',
    icon: '🎙',
    description: 'Condenser desk microphone',
  },

  // ── Lighting ───────────────────────────────────────────────────────
  {
    id: 'desk-lamp',
    name: 'Desk Lamp',
    category: 'lighting',
    w: 1, h: 1,
    color: '#78350F', color3d: '#FBBF24',
    icon: '💡',
    description: 'Adjustable LED desk lamp',
  },
  {
    id: 'led-strip',
    name: 'LED Strip',
    category: 'lighting',
    w: 4, h: 1,
    color: '#312E81', color3d: '#818CF8',
    icon: '✨',
    description: 'RGB LED ambient light strip',
  },
  {
    id: 'key-light',
    name: 'Key Light',
    category: 'lighting',
    w: 1, h: 2,
    color: '#1C1917', color3d: '#FB923C',
    icon: '🌟',
    description: 'Professional streaming key light',
  },
];

export const CATEGORIES = [
  { key: 'desk',     label: 'Desks',         icon: '🗂' },
  { key: 'chair',    label: 'Chairs',        icon: '🪑' },
  { key: 'monitor',  label: 'Monitors',      icon: '🖥' },
  { key: 'input',    label: 'Input Devices', icon: '⌨' },
  { key: 'audio',    label: 'Audio',         icon: '🎧' },
  { key: 'lighting', label: 'Lighting',      icon: '💡' },
] as const;

export function getCatalogItem(id: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.id === id);
}
