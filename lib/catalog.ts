import { CatalogItem } from './types';

// All w/h values are in feet (1 cell = 1 ft).
// Decimal values are fine — snap granularity is 0.5 ft (6 in).

export const CATALOG: CatalogItem[] = [
  // ── Desks ──────────────────────────────────────────────────────────
  {
    id: 'desk-l',
    name: 'L-Shape Desk',
    category: 'desk',
    w: 6, h: 4,                    // 72" × 48" corner desk
    color: '#78350F', color3d: '#D97706',
    icon: '🗂',
    description: '72" × 48" L-shaped corner desk',
  },
  {
    id: 'desk-standing',
    name: 'Standing Desk',
    category: 'desk',
    w: 5, h: 2.5,                  // 60" × 30" sit-stand
    color: '#7C2D12', color3d: '#EA580C',
    icon: '⬛',
    description: '60" × 30" motorized sit-stand desk',
  },
  {
    id: 'desk-standard',
    name: 'Standard Desk',
    category: 'desk',
    w: 4.5, h: 2,                  // 54" × 24" writing desk
    color: '#92400E', color3d: '#F59E0B',
    icon: '⬛',
    description: '54" × 24" standard writing desk',
  },

  // ── Chairs ─────────────────────────────────────────────────────────
  {
    id: 'chair-office',
    name: 'Office Chair',
    category: 'chair',
    w: 2, h: 2,                    // 24" × 24" ergonomic mesh
    color: '#334155', color3d: '#94A3B8',
    icon: '🪑',
    description: 'Ergonomic mesh office chair — 24" × 24" footprint',
  },
  {
    id: 'chair-gaming',
    name: 'Gaming Chair',
    category: 'chair',
    w: 2.5, h: 2.5,                // 30" × 30" racing-style
    color: '#7F1D1D', color3d: '#DC2626',
    icon: '🪑',
    description: 'Racing-style gaming chair — 30" × 30" footprint',
  },

  // ── Monitors ───────────────────────────────────────────────────────
  {
    id: 'monitor-27',
    name: '27" Monitor',
    category: 'monitor',
    w: 2, h: 1,                    // 24" wide, 12" stand depth
    color: '#1E3A5F', color3d: '#1D4ED8',
    icon: '🖥',
    description: '27" IPS 1440p — 24" wide, 12" stand depth',
  },
  {
    id: 'monitor-ultra',
    name: 'Ultrawide 34"',
    category: 'monitor',
    w: 3, h: 1,                    // 32" wide, 12" stand depth
    color: '#1E3A5F', color3d: '#2563EB',
    icon: '🖥',
    description: '34" 21:9 ultrawide — 32" wide, 12" stand depth',
  },
  {
    id: 'monitor-dual',
    name: 'Dual Monitors',
    category: 'monitor',
    w: 4, h: 1,                    // 48" wide (2× 24"), 12" depth
    color: '#172554', color3d: '#3B82F6',
    icon: '🖥',
    description: 'Two 24" displays — 48" wide, 12" stand depth',
  },

  // ── Input ──────────────────────────────────────────────────────────
  {
    id: 'keyboard-tkl',
    name: 'Mech Keyboard',
    category: 'input',
    w: 1.5, h: 0.5,                // 18" × 6" TKL
    color: '#064E3B', color3d: '#059669',
    icon: '⌨',
    description: 'TKL mechanical keyboard — 18" × 6"',
  },
  {
    id: 'keyboard-full',
    name: 'Full Keyboard',
    category: 'input',
    w: 1.5, h: 0.5,                // 18" × 6" with numpad
    color: '#065F46', color3d: '#10B981',
    icon: '⌨',
    description: 'Full-size keyboard with numpad — 18" × 6"',
  },
  {
    id: 'mouse-pad',
    name: 'Mouse + Pad',
    category: 'input',
    w: 1, h: 0.5,                  // 12" × 6" desk mat + mouse
    color: '#14532D', color3d: '#16A34A',
    icon: '🖱',
    description: 'Mouse with desk mat — 12" × 6"',
  },
  {
    id: 'tablet',
    name: 'Drawing Tablet',
    category: 'input',
    w: 1.5, h: 1,                  // 18" × 12" medium tablet
    color: '#1E1B4B', color3d: '#4F46E5',
    icon: '✏',
    description: 'Graphics tablet for design — 18" × 12"',
  },

  // ── Audio ──────────────────────────────────────────────────────────
  {
    id: 'speakers',
    name: 'Desk Speakers',
    category: 'audio',
    w: 3, h: 0.5,                  // 36" span × 6" depth (pair)
    color: '#4C1D95', color3d: '#7C3AED',
    icon: '🔊',
    description: '2.0 studio monitors — 36" span, 6" depth',
  },
  {
    id: 'headphone-stand',
    name: 'Headphone Stand',
    category: 'audio',
    w: 0.5, h: 0.5,                // 6" × 6" stand base
    color: '#3B0764', color3d: '#9333EA',
    icon: '🎧',
    description: 'Headphone stand + DAC/amp — 6" × 6"',
  },
  {
    id: 'microphone',
    name: 'Microphone',
    category: 'audio',
    w: 0.5, h: 0.5,                // 6" × 6" desk base
    color: '#831843', color3d: '#DB2777',
    icon: '🎙',
    description: 'Condenser mic on desk stand — 6" × 6" base',
  },

  // ── Lighting ───────────────────────────────────────────────────────
  {
    id: 'desk-lamp',
    name: 'Desk Lamp',
    category: 'lighting',
    w: 0.5, h: 0.5,                // 6" × 6" base
    color: '#78350F', color3d: '#FBBF24',
    icon: '💡',
    description: 'Adjustable LED desk lamp — 6" × 6" base',
  },
  {
    id: 'led-strip',
    name: 'LED Strip',
    category: 'lighting',
    w: 3, h: 0.5,                  // 36" × 6" behind-monitor run
    color: '#312E81', color3d: '#818CF8',
    icon: '✨',
    description: 'RGB LED ambient strip — 36" run, 6" depth',
  },
  {
    id: 'key-light',
    name: 'Key Light',
    category: 'lighting',
    w: 1, h: 1.5,                  // 12" × 18" on floor stand
    color: '#1C1917', color3d: '#FB923C',
    icon: '🌟',
    description: 'Professional streaming key light — 12" × 18" stand',
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
