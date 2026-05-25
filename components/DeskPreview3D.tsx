'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { usePlannerStore } from '@/lib/store';
import { getCatalogItem } from '@/lib/catalog';
import { ROOM_W, ROOM_H } from '@/lib/types';
import type { PlacedItem } from '@/lib/types';

// Height of each item category in 3D units (1 unit = 1 grid cell ≈ 2 ft)
const HEIGHTS: Record<string, number> = {
  desk:     0.10,
  chair:    0.50,
  monitor:  0.65,
  input:    0.05,
  audio:    0.20,
  lighting: 0.28,
};

function ItemMesh({ item }: { item: PlacedItem }) {
  const cat = getCatalogItem(item.catalogId);
  if (!cat) return null;

  const rotated = item.rotation % 180 !== 0;
  const dw = rotated ? cat.h : cat.w;
  const dd = rotated ? cat.w : cat.h;
  const h  = HEIGHTS[cat.category] ?? 0.12;

  return (
    <mesh
      position={[item.x + dw / 2, h / 2, item.y + dd / 2]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[dw - 0.08, h, dd - 0.08]} />
      <meshStandardMaterial color={cat.color3d} roughness={0.55} metalness={0.15} />
    </mesh>
  );
}

function Scene() {
  const items = usePlannerStore((s) => s.items);
  const cx = ROOM_W / 2;
  const cz = ROOM_H / 2;
  const wallH = 0.4;
  const wallT = 0.12;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[cx + 8, 14, cz + 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[cx - 6, 8, cz - 8]} intensity={0.3} />

      {/* Sky color */}
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 30, 70]} />

      {/* Floor */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, 0, cz]}
      >
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Grid overlay on floor */}
      <gridHelper
        args={[Math.max(ROOM_W, ROOM_H) + 2, Math.max(ROOM_W, ROOM_H) + 2, '#94a3b8', '#cbd5e1']}
        position={[cx, 0.002, cz]}
      />

      {/* Room walls (North / South / West / East) */}
      <mesh position={[cx, wallH / 2, 0]}>
        <boxGeometry args={[ROOM_W, wallH, wallT]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[cx, wallH / 2, ROOM_H]}>
        <boxGeometry args={[ROOM_W, wallH, wallT]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[0, wallH / 2, cz]}>
        <boxGeometry args={[wallT, wallH, ROOM_H]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[ROOM_W, wallH / 2, cz]}>
        <boxGeometry args={[wallT, wallH, ROOM_H]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>

      {/* Placed items */}
      {items.map((item) => (
        <ItemMesh key={item.uid} item={item} />
      ))}

      <OrbitControls
        target={[cx, 0, cz]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={4}
        maxDistance={45}
        enablePan
      />
    </>
  );
}

export default function DeskPreview3D() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
        3D Preview &mdash; drag to orbit &bull; scroll to zoom
      </div>
      <div className="flex-1">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{
            position: [ROOM_W / 2, ROOM_H * 0.9, ROOM_H + ROOM_H * 0.6],
            fov: 48,
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <Scene />
        </Canvas>
      </div>
    </div>
  );
}
