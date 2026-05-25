'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { usePlannerStore } from '@/lib/store';
import { getCatalogItem } from '@/lib/catalog';
import { isItemOnDesk } from '@/lib/collision';
import { STACKABLE_CATEGORIES } from '@/lib/types';
import type { PlacedItem } from '@/lib/types';

// ── Scale constants (1 unit ≈ 1 ft, heights stylised but proportional) ──────

const DESK_H      = 0.72;             // desk leg height
const SLAB        = 0.06;             // desktop slab thickness
const DESK_SURFACE = DESK_H + SLAB;   // y-elevation for items placed on desks (0.78)

// ── Material presets ─────────────────────────────────────────────────────────

const wood    = (c: string) => ({ color: c, roughness: 0.78, metalness: 0.04 });
const fabric  = (c: string) => ({ color: c, roughness: 0.92, metalness: 0.00 });
const plastic = (c: string) => ({ color: c, roughness: 0.58, metalness: 0.06 });
const metal   = (c: string) => ({ color: c, roughness: 0.22, metalness: 0.80 });
const screen  = (c: string) => ({ color: c, roughness: 0.08, metalness: 0.40 });

// ── Shared desk-leg cluster ───────────────────────────────────────────────────

function Legs({ w, d, c, positions }: {
  w: number; d: number; c: string;
  positions?: [number, number][];
}) {
  const pts = positions ?? ([
    [-w / 2 + 0.1, -d / 2 + 0.1],
    [ w / 2 - 0.1, -d / 2 + 0.1],
    [-w / 2 + 0.1,  d / 2 - 0.1],
    [ w / 2 - 0.1,  d / 2 - 0.1],
  ] as [number, number][]);
  return (
    <>
      {pts.map(([x, z], i) => (
        <mesh key={i} position={[x, DESK_H / 2, z]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, DESK_H, 8]} />
          <meshStandardMaterial {...metal(c)} />
        </mesh>
      ))}
    </>
  );
}

// ── Item shape components ────────────────────────────────────────────────────

function ShapeDesk({ w, d, color, color3d }: { w: number; d: number; color: string; color3d: string }) {
  return (
    <>
      <mesh position={[0, DESK_H + SLAB / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.04, SLAB, d - 0.04]} />
        <meshStandardMaterial {...wood(color)} />
      </mesh>
      {/* Thin front apron panel */}
      <mesh position={[0, DESK_H / 2 + 0.06, d / 2 - 0.02]} castShadow>
        <boxGeometry args={[w - 0.04, DESK_H - 0.12, 0.04]} />
        <meshStandardMaterial {...wood(color)} />
      </mesh>
      <Legs w={w} d={d} c={color3d} />
    </>
  );
}

function ShapeDeskL({ w, d, color, color3d }: { w: number; d: number; color: string; color3d: string }) {
  const hw = w / 2, hd = d / 2;
  return (
    <>
      {/* Main top surface */}
      <mesh position={[0, DESK_H + SLAB / 2, -hd / 2]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.04, SLAB, hd - 0.02]} />
        <meshStandardMaterial {...wood(color)} />
      </mesh>
      {/* Return surface */}
      <mesh position={[-hw / 2, DESK_H + SLAB / 2, hd / 2]} castShadow receiveShadow>
        <boxGeometry args={[hw - 0.02, SLAB, hd - 0.04]} />
        <meshStandardMaterial {...wood(color)} />
      </mesh>
      {/* 4 outer-corner legs */}
      <Legs w={w} d={d} c={color3d} positions={[
        [-w / 2 + 0.1, -d / 2 + 0.1],
        [ w / 2 - 0.1, -d / 2 + 0.1],
        [-w / 2 + 0.1,  d / 2 - 0.1],
        [-0.12, 0.12],                  // inner corner
      ]} />
    </>
  );
}

function ShapeChair({ w, d, color, color3d }: { w: number; d: number; color: string; color3d: string }) {
  const seatY = 0.60;
  const r = Math.min(w, d) * 0.42;
  return (
    <>
      {/* 5-spoke star base */}
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <cylinderGeometry args={[r * 0.88, r * 0.88, 0.04, 5]} />
        <meshStandardMaterial {...plastic(color3d)} />
      </mesh>
      {/* Hydraulic column */}
      <mesh position={[0, seatY / 2, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.045, seatY, 10]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      {/* Seat cushion */}
      <mesh position={[0, seatY + 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r * 0.96, 0.13, 20]} />
        <meshStandardMaterial {...fabric(color)} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, seatY + 0.44, -(r * 0.82)]} castShadow>
        <boxGeometry args={[r * 1.7, 0.72, 0.1]} />
        <meshStandardMaterial {...fabric(color3d)} />
      </mesh>
      {/* Lumbar bump */}
      <mesh position={[0, seatY + 0.22, -(r * 0.84)]}>
        <boxGeometry args={[r * 1.1, 0.22, 0.06]} />
        <meshStandardMaterial {...fabric(color)} />
      </mesh>
      {/* Armrests */}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s * (r + 0.06), seatY + 0.2, -0.06]} castShadow>
          <boxGeometry args={[0.08, 0.07, r * 1.1]} />
          <meshStandardMaterial {...plastic(color3d)} />
        </mesh>
      ))}
    </>
  );
}

function ShapeMonitor({ w, d, color, color3d, by }: { w: number; d: number; color: string; color3d: string; by: number }) {
  const panelH = 0.58;
  const panelY = by + 0.56 + panelH / 2;
  return (
    <>
      {/* Stand base */}
      <mesh position={[0, by + 0.015, 0]} castShadow>
        <boxGeometry args={[w * 0.38, 0.03, d * 0.9]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, by + 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.035, 0.52, 10]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      {/* Hinge bracket */}
      <mesh position={[0, by + 0.54, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.06]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      {/* Panel housing */}
      <mesh position={[0, panelY, 0]} castShadow>
        <boxGeometry args={[w - 0.06, panelH, 0.06]} />
        <meshStandardMaterial {...plastic(color3d)} />
      </mesh>
      {/* Screen face */}
      <mesh position={[0, panelY, 0.032]}>
        <boxGeometry args={[w - 0.16, panelH - 0.08, 0.005]} />
        <meshStandardMaterial {...screen(color)} />
      </mesh>
    </>
  );
}

function ShapeKeyboard({ w, d, color, color3d, by }: { w: number; d: number; color: string; color3d: string; by: number }) {
  return (
    <>
      {/* Body */}
      <mesh position={[0, by + 0.018, 0]} castShadow>
        <boxGeometry args={[w - 0.04, 0.034, d - 0.03]} />
        <meshStandardMaterial {...plastic(color3d)} />
      </mesh>
      {/* Key surface */}
      <mesh position={[0, by + 0.028, 0]}>
        <boxGeometry args={[w - 0.08, 0.01, d - 0.07]} />
        <meshStandardMaterial {...plastic(color)} />
      </mesh>
    </>
  );
}

function ShapeMousePad({ w, d, color, color3d, by }: { w: number; d: number; color: string; color3d: string; by: number }) {
  return (
    <>
      {/* Pad mat */}
      <mesh position={[0, by + 0.006, 0]} receiveShadow>
        <boxGeometry args={[w - 0.02, 0.012, d - 0.02]} />
        <meshStandardMaterial {...fabric(color)} />
      </mesh>
      {/* Mouse body */}
      <mesh position={[w * 0.22, by + 0.026, 0]} castShadow>
        <boxGeometry args={[d * 0.52, 0.04, d * 0.88]} />
        <meshStandardMaterial {...plastic(color3d)} />
      </mesh>
      {/* Scroll wheel */}
      <mesh position={[w * 0.22, by + 0.042, -d * 0.16]}>
        <cylinderGeometry args={[0.018, 0.018, 0.04, 10]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial {...plastic('#888')} />
      </mesh>
    </>
  );
}

function ShapeTablet({ w, d, color, color3d, by }: { w: number; d: number; color: string; color3d: string; by: number }) {
  return (
    <>
      <mesh position={[0, by + 0.016, 0]} castShadow>
        <boxGeometry args={[w - 0.04, 0.03, d - 0.04]} />
        <meshStandardMaterial {...plastic(color3d)} />
      </mesh>
      {/* Active area */}
      <mesh position={[w * 0.04, by + 0.028, 0]}>
        <boxGeometry args={[w * 0.76, 0.006, d - 0.12]} />
        <meshStandardMaterial {...screen(color)} />
      </mesh>
    </>
  );
}

function ShapeSpeakers({ w, d, color, color3d, by }: { w: number; d: number; color: string; color3d: string; by: number }) {
  const sw = d * 0.78, sh = 0.22;
  return (
    <>
      {([-1, 1] as number[]).map((s, i) => (
        <group key={i} position={[s * (w / 2 - sw / 2 - 0.02), by + sh / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[sw, sh, d - 0.04]} />
            <meshStandardMaterial {...plastic(color)} />
          </mesh>
          {/* Woofer cone */}
          <mesh position={[0, 0, (d - 0.04) / 2 + 0.003]}>
            <cylinderGeometry args={[sw * 0.28, sw * 0.28, 0.005, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial {...plastic(color3d)} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function ShapeHeadphoneStand({ color, color3d, by }: { color: string; color3d: string; by: number }) {
  return (
    <>
      <mesh position={[0, by + 0.022, 0]}>
        <cylinderGeometry args={[0.17, 0.21, 0.04, 14]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      <mesh position={[0, by + 0.30, 0]} castShadow>
        <cylinderGeometry args={[0.024, 0.028, 0.55, 10]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      {/* Arch top bar */}
      <mesh position={[0, by + 0.60, 0]} castShadow>
        <boxGeometry args={[0.48, 0.07, 0.07]} />
        <meshStandardMaterial {...plastic(color)} />
      </mesh>
    </>
  );
}

function ShapeMicrophone({ color, color3d, by }: { color: string; color3d: string; by: number }) {
  return (
    <>
      <mesh position={[0, by + 0.022, 0]}>
        <cylinderGeometry args={[0.15, 0.19, 0.044, 12]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      <mesh position={[0, by + 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.36, 8]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      <mesh position={[0, by + 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.072, 0.072, 0.18, 14]} />
        <meshStandardMaterial {...metal(color)} />
      </mesh>
    </>
  );
}

function ShapeDeskLamp({ color, color3d, by }: { color: string; color3d: string; by: number }) {
  return (
    <>
      <mesh position={[0, by + 0.026, 0]}>
        <cylinderGeometry args={[0.14, 0.17, 0.05, 12]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      {/* Arm (angled box) */}
      <mesh position={[-0.05, by + 0.24, 0.04]} rotation={[0.38, 0, -0.18]} castShadow>
        <boxGeometry args={[0.025, 0.36, 0.025]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      {/* Shade */}
      <mesh position={[-0.14, by + 0.40, 0.06]} castShadow>
        <cylinderGeometry args={[0.14, 0.08, 0.1, 12]} />
        <meshStandardMaterial {...metal(color)} />
      </mesh>
    </>
  );
}

function ShapeLedStrip({ w, d, color, color3d, by }: { w: number; d: number; color: string; color3d: string; by: number }) {
  return (
    <mesh position={[0, by + 0.012, 0]}>
      <boxGeometry args={[w - 0.06, 0.024, d - 0.02]} />
      <meshStandardMaterial
        color={color3d}
        roughness={0.35}
        metalness={0.18}
        emissive={color}
        emissiveIntensity={0.55}
      />
    </mesh>
  );
}

function ShapeKeyLight({ w, d, color, color3d }: { w: number; d: number; color: string; color3d: string }) {
  return (
    <>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.06, 12]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      <mesh position={[0, 0.76, 0]} castShadow>
        <cylinderGeometry args={[0.024, 0.03, 1.4, 10]} />
        <meshStandardMaterial {...metal(color3d)} />
      </mesh>
      <mesh position={[0, 1.46, 0]} castShadow>
        <boxGeometry args={[w - 0.06, 0.24, 0.07]} />
        <meshStandardMaterial {...plastic(color3d)} />
      </mesh>
      {/* Emissive face */}
      <mesh position={[0, 1.46, 0.038]}>
        <boxGeometry args={[w - 0.16, 0.17, 0.005]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.1} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </>
  );
}

// ── Main item dispatcher ──────────────────────────────────────────────────────

function ItemMesh({ item, allItems }: { item: PlacedItem; allItems: PlacedItem[] }) {
  const cat = getCatalogItem(item.catalogId);
  if (!cat) return null;

  const rotated = item.rotation % 180 !== 0;
  const dw = rotated ? cat.h : cat.w;
  const dd = rotated ? cat.w : cat.h;

  const onDesk = STACKABLE_CATEGORIES.has(cat.category) && isItemOnDesk(item, allItems);
  const by = onDesk ? DESK_SURFACE : 0;

  const cx = item.x + dw / 2;
  const cz = item.y + dd / 2;
  const { color, color3d } = cat;
  const s = { w: dw, d: dd, color, color3d, by };

  let shape: React.ReactNode;
  switch (cat.id) {
    case 'desk-l':        shape = <ShapeDeskL w={dw} d={dd} color={color} color3d={color3d} />; break;
    case 'desk-standing':
    case 'desk-standard': shape = <ShapeDesk  w={dw} d={dd} color={color} color3d={color3d} />; break;
    case 'chair-office':
    case 'chair-gaming':  shape = <ShapeChair w={dw} d={dd} color={color} color3d={color3d} />; break;
    case 'monitor-27':
    case 'monitor-ultra':
    case 'monitor-dual':  shape = <ShapeMonitor  {...s} />; break;
    case 'keyboard-tkl':
    case 'keyboard-full': shape = <ShapeKeyboard {...s} />; break;
    case 'mouse-pad':     shape = <ShapeMousePad {...s} />; break;
    case 'tablet':        shape = <ShapeTablet   {...s} />; break;
    case 'speakers':      shape = <ShapeSpeakers {...s} />; break;
    case 'headphone-stand': shape = <ShapeHeadphoneStand color={color} color3d={color3d} by={by} />; break;
    case 'microphone':    shape = <ShapeMicrophone color={color} color3d={color3d} by={by} />; break;
    case 'desk-lamp':     shape = <ShapeDeskLamp  color={color} color3d={color3d} by={by} />; break;
    case 'led-strip':     shape = <ShapeLedStrip  {...s} />; break;
    case 'key-light':     shape = <ShapeKeyLight  w={dw} d={dd} color={color} color3d={color3d} />; break;
    default:
      shape = (
        <mesh position={[0, by + 0.1, 0]} castShadow>
          <boxGeometry args={[dw - 0.08, 0.2, dd - 0.08]} />
          <meshStandardMaterial {...plastic(color)} />
        </mesh>
      );
  }

  return <group position={[cx, 0, cz]}>{shape}</group>;
}

// ── Scene ────────────────────────────────────────────────────────────────────

function Scene() {
  const items = usePlannerStore((s) => s.items);
  const roomW = usePlannerStore((s) => s.roomW);
  const roomH = usePlannerStore((s) => s.roomH);

  const cx = roomW / 2;
  const cz = roomH / 2;
  const wallH = 0.45;
  const wallT = 0.12;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.38} />
      <directionalLight
        position={[cx + 8, 14, cz + 6]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-roomW * 1.2}
        shadow-camera-right={roomW * 1.2}
        shadow-camera-top={roomH * 1.2}
        shadow-camera-bottom={-roomH * 1.2}
      />
      <directionalLight position={[cx - 6, 8, cz - 8]} intensity={0.32} />
      <pointLight position={[cx, 5, cz]} intensity={0.55} color="#fff8f0" decay={2} />

      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 32, 72]} />

      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0, cz]}>
        <planeGeometry args={[roomW, roomH]} />
        <meshStandardMaterial color="#dde1e7" roughness={0.88} metalness={0.02} />
      </mesh>

      {/* Soft contact shadows */}
      <ContactShadows
        position={[cx, 0.001, cz]}
        width={roomW + 4}
        height={roomH + 4}
        far={2.2}
        blur={1.8}
        opacity={0.55}
        frames={1}
      />

      {/* Grid */}
      <gridHelper
        args={[Math.max(roomW, roomH) + 2, Math.max(roomW, roomH) + 2, '#94a3b8', '#cbd5e1']}
        position={[cx, 0.003, cz]}
      />

      {/* Walls */}
      <mesh position={[cx, wallH / 2, 0]}>
        <boxGeometry args={[roomW, wallH, wallT]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} />
      </mesh>
      <mesh position={[cx, wallH / 2, roomH]}>
        <boxGeometry args={[roomW, wallH, wallT]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} />
      </mesh>
      <mesh position={[0, wallH / 2, cz]}>
        <boxGeometry args={[wallT, wallH, roomH]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} />
      </mesh>
      <mesh position={[roomW, wallH / 2, cz]}>
        <boxGeometry args={[wallT, wallH, roomH]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} />
      </mesh>

      {items.map((item) => (
        <ItemMesh key={item.uid} item={item} allItems={items} />
      ))}

      <OrbitControls
        target={[cx, 0, cz]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={4}
        maxDistance={55}
        enablePan
      />
    </>
  );
}

// ── Canvas wrapper ────────────────────────────────────────────────────────────

export default function DeskPreview3D() {
  const roomW = usePlannerStore((s) => s.roomW);
  const roomH = usePlannerStore((s) => s.roomH);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
        3D Preview — drag to orbit · scroll to zoom
      </div>
      <div className="flex-1">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{
            position: [roomW / 2, Math.max(roomW, roomH) * 0.75, roomH + roomH * 0.65],
            fov: 46,
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <Scene />
        </Canvas>
      </div>
    </div>
  );
}
