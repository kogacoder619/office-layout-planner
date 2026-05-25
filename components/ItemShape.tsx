'use client';

// Top-down SVG floor-plan shapes for every catalog item.
// Each component receives the item's display dimensions (in ft) and colors.

interface C { color: string; color3d: string }
type D = C & { dw: number; dh: number }
type DR = D & { rotation: number }

// ── Desks ───────────────────────────────────────────────────────────────────

function DeskL({ color, color3d, dw, dh }: D) {
  const mx = dw / 2, my = dh / 2;
  // L = full rectangle minus top-right quadrant
  const path = `M0,0 H${dw} V${my} H${mx} V${dh} H0 Z`;
  const inset = `M.1,.1 H${dw - .1} V${my - .1} H${mx - .1} V${dh - .1} H.1 Z`;
  const legs: [number, number][] = [
    [.1, .1], [dw - .35, .1], [.1, dh - .35], [mx - .35, my - .35],
  ];
  return (
    <svg viewBox={`0 0 ${dw} ${dh}`} width="100%" height="100%" preserveAspectRatio="none">
      <path d={path} fill={color} />
      {/* Surface highlight */}
      <path d={inset} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth=".07" strokeLinejoin="round" />
      {/* Front edges (user-facing) */}
      <path d={`M0,${dh} H${mx} M${dw},0 V${my}`} stroke={color3d} strokeWidth=".14" fill="none" />
      {/* Leg dots */}
      {legs.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width=".22" height=".22" rx=".04" fill={color3d} opacity=".6" />
      ))}
    </svg>
  );
}

function DeskRect({ color, color3d, dw, dh }: D) {
  const legs: [number, number][] = [
    [.12, .12], [dw - .34, .12], [.12, dh - .34], [dw - .34, dh - .34],
  ];
  return (
    <svg viewBox={`0 0 ${dw} ${dh}`} width="100%" height="100%" preserveAspectRatio="none">
      <rect width={dw} height={dh} fill={color} />
      <rect x=".1" y=".1" width={dw - .2} height={dh - .2}
            fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth=".06" />
      {/* Front edge strip (bottom = user-facing) */}
      <rect x="0" y={dh - .18} width={dw} height=".18" fill={color3d} opacity=".35" />
      {legs.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width=".22" height=".22" rx=".04" fill={color3d} opacity=".55" />
      ))}
    </svg>
  );
}

// ── Chairs ──────────────────────────────────────────────────────────────────
// Uses a 10×10 internal grid for precision; backrest is at the top (y≈0).
// Rotation is applied via SVG transform so the backrest direction follows.

function ChairShape({ color, color3d, dw, dh, rotation }: DR) {
  const s = 10, cx = 5, cy = 5;
  const seatR = 3.6;
  const bw = 5.8, bh = 2.2, by = cy - seatR - bh + 1;
  const armW = 2, armH = 0.9;
  return (
    <svg viewBox={`0 0 ${s} ${s}`} width="100%" height="100%"
         preserveAspectRatio="xMidYMid meet">
      <g transform={`rotate(${rotation} ${cx} ${cy})`}>
        {/* 5-spoke caster base */}
        <circle cx={cx} cy={cy} r="1.8" fill={color3d} opacity=".22" />
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          return (
            <line key={i} x1={cx} y1={cy}
              x2={cx + Math.cos(a) * 3} y2={cy + Math.sin(a) * 3}
              stroke={color3d} strokeWidth=".5" opacity=".2" />
          );
        })}
        {/* Seat cushion */}
        <circle cx={cx} cy={cy} r={seatR} fill={color} />
        {/* Armrests */}
        <rect x={cx - seatR - armW + .4} y={cy - armH / 2} width={armW} height={armH} rx=".3" fill={color3d} opacity=".75" />
        <rect x={cx + seatR - .4}          y={cy - armH / 2} width={armW} height={armH} rx=".3" fill={color3d} opacity=".75" />
        {/* Backrest */}
        <rect x={cx - bw / 2} y={by} width={bw} height={bh + .6} rx="1" fill={color3d} />
        <rect x={cx - bw / 2 + .6} y={by + .4} width={bw - 1.2} height={bh - .5}
              rx=".6" fill={color} opacity=".22" />
      </g>
    </svg>
  );
}

// ── Monitors ────────────────────────────────────────────────────────────────
// Top-down: thin screen panel at the back, stand neck + oval base toward front.

function MonitorShape({ color, color3d, dw, dh }: D) {
  const panelH = Math.min(dh * .28, .35);
  return (
    <svg viewBox={`0 0 ${dw} ${dh}`} width="100%" height="100%" preserveAspectRatio="none">
      {/* Stand base (front / user side) */}
      <ellipse cx={dw / 2} cy={dh * .8} rx={dw * .18} ry={dh * .18} fill={color3d} opacity=".5" />
      {/* Neck */}
      <rect x={dw / 2 - .06} y={panelH} width=".12" height={dh * .55} fill={color3d} opacity=".55" />
      {/* Screen panel (back edge) */}
      <rect x="0" y="0" width={dw} height={panelH} rx=".06" fill={color3d} />
      {/* Bezel + screen surface */}
      <rect x=".05" y=".03" width={dw - .1} height={panelH - .06} rx=".04" fill={color} opacity=".75" />
    </svg>
  );
}

// ── Input ───────────────────────────────────────────────────────────────────

function KeyboardShape({ color, color3d, dw, dh }: D) {
  const cols = Math.round(dw * 5);
  const rows = 3;
  const pad = 0.04;
  const kw = (dw - pad * 2) / cols;
  const kh = (dh - pad * 2) / rows;
  return (
    <svg viewBox={`0 0 ${dw} ${dh}`} width="100%" height="100%" preserveAspectRatio="none">
      <rect width={dw} height={dh} rx=".06" fill={color3d} />
      <rect x={pad} y={pad} width={dw - pad * 2} height={dh - pad * 2} rx=".04" fill={color} opacity=".8" />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect key={`${r}-${c}`}
            x={pad + c * kw + .008} y={pad + r * kh + .008}
            width={kw - .016} height={kh - .016} rx=".01"
            fill={color3d} opacity=".45" />
        ))
      )}
    </svg>
  );
}

function MousePadShape({ color, color3d, dw, dh }: D) {
  const mw = dh * .55, mh = dh * .88;
  const mx = dw * .75, my = dh / 2;
  return (
    <svg viewBox={`0 0 ${dw} ${dh}`} width="100%" height="100%" preserveAspectRatio="none">
      {/* Pad */}
      <rect width={dw} height={dh} rx={dh * .1} fill={color} />
      <rect x=".03" y=".02" width={dw - .06} height={dh - .04}
            rx={dh * .07} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth=".02" />
      {/* Mouse body */}
      <ellipse cx={mx} cy={my} rx={mw / 2} ry={mh / 2} fill={color3d} />
      {/* Button split */}
      <line x1={mx} y1={my - mh * .38} x2={mx} y2={my + mh * .1}
            stroke="rgba(0,0,0,0.45)" strokeWidth=".025" />
      {/* Scroll wheel */}
      <ellipse cx={mx} cy={my - mh * .18} rx={dh * .06} ry={dh * .09}
               fill="rgba(0,0,0,0.35)" />
    </svg>
  );
}

function TabletShape({ color, color3d, dw, dh }: D) {
  const bx = dh * .14;
  return (
    <svg viewBox={`0 0 ${dw} ${dh}`} width="100%" height="100%" preserveAspectRatio="none">
      <rect width={dw} height={dh} rx=".1" fill={color3d} />
      {/* Active area */}
      <rect x={bx} y={dh * .12} width={dw - bx - dh * .08} height={dh * .76}
            rx=".06" fill={color} opacity=".75" />
      {/* Side buttons */}
      {[.18, .38, .58, .78].map((t, i) => (
        <rect key={i} x=".04" y={dh * t} width={dh * .08} height={dh * .12}
              rx=".02" fill={color3d} opacity=".6" />
      ))}
      {/* Pen holder groove */}
      <rect x={dw - dh * .06} y={dh * .1} width={dh * .03} height={dh * .8}
            rx=".015" fill={color3d} opacity=".5" />
    </svg>
  );
}

// ── Audio ───────────────────────────────────────────────────────────────────

function SpeakersShape({ color, color3d, dw, dh }: D) {
  const r = dh * .44;
  return (
    <svg viewBox={`0 0 ${dw} ${dh}`} width="100%" height="100%" preserveAspectRatio="none">
      {/* Bar between speakers */}
      <rect x={r * 1.9} y={dh * .32} width={dw - r * 3.8} height={dh * .36} fill={color3d} opacity=".2" />
      {[r, dw - r].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={dh / 2} r={r} fill={color} />
          <circle cx={cx} cy={dh / 2} r={r * .55} fill={color3d} opacity=".5" />
          <circle cx={cx} cy={dh / 2} r={r * .24} fill={color3d} />
        </g>
      ))}
    </svg>
  );
}

function HeadphoneStandShape({ color, color3d }: C) {
  return (
    <svg viewBox="0 0 1 1" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {/* Base */}
      <ellipse cx=".5" cy=".82" rx=".4" ry=".15" fill={color3d} opacity=".7" />
      {/* Pole */}
      <rect x=".44" y=".2" width=".12" height=".62" rx=".04" fill={color3d} opacity=".7" />
      {/* Headphone arch */}
      <path d="M .1,.3 Q .5,.04 .9,.3" stroke={color} strokeWidth=".13" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function MicrophoneShape({ color, color3d }: C) {
  return (
    <svg viewBox="0 0 1 1" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {/* Tripod legs */}
      {[150, 270, 390].map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        return (
          <line key={i} x1=".5" y1=".5"
            x2={.5 + Math.cos(a) * .42} y2={.5 + Math.sin(a) * .42}
            stroke={color3d} strokeWidth=".06" opacity=".5" />
        );
      })}
      {/* Body */}
      <circle cx=".5" cy=".5" r=".3" fill={color} />
      {/* Capsule grill */}
      <circle cx=".5" cy=".5" r=".2" fill={color3d} opacity=".55" />
      <circle cx=".5" cy=".5" r=".1" fill={color3d} />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        return (
          <circle key={i} cx={.5 + Math.cos(a) * .16} cy={.5 + Math.sin(a) * .16}
            r=".03" fill={color3d} opacity=".5" />
        );
      })}
    </svg>
  );
}

// ── Lighting ────────────────────────────────────────────────────────────────

function DeskLampShape({ color, color3d }: C) {
  return (
    <svg viewBox="0 0 1 1" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {/* Weighted base */}
      <circle cx=".5" cy=".72" r=".26" fill={color3d} />
      {/* Arm */}
      <line x1=".5" y1=".72" x2=".35" y2=".3" stroke={color3d} strokeWidth=".09" strokeLinecap="round" />
      {/* Head ellipse (lamp shade from above) */}
      <ellipse cx=".3" cy=".24" rx=".28" ry=".12" fill={color} />
      <ellipse cx=".3" cy=".24" rx=".14" ry=".06" fill={color3d} opacity=".55" />
    </svg>
  );
}

function LedStripShape({ color, color3d, dw, dh }: D) {
  const count = Math.max(6, Math.floor(dw * 5));
  return (
    <svg viewBox={`0 0 ${dw} ${dh}`} width="100%" height="100%" preserveAspectRatio="none">
      {/* PCB strip */}
      <rect x="0" y={dh * .28} width={dw} height={dh * .44} rx={dh * .22} fill={color3d} />
      {Array.from({ length: count }, (_, i) => {
        const x = (i + .5) * (dw / count);
        return <circle key={i} cx={x} cy={dh / 2} r={dh * .17} fill={color} opacity=".88" />;
      })}
    </svg>
  );
}

function KeyLightShape({ color, color3d, dw, dh }: D) {
  return (
    <svg viewBox={`0 0 ${dw} ${dh}`} width="100%" height="100%" preserveAspectRatio="none">
      {/* Floor stand base */}
      <ellipse cx={dw / 2} cy={dh * .88} rx={dw * .28} ry={dh * .09} fill={color3d} opacity=".55" />
      {/* Pole */}
      <rect x={dw / 2 - .05} y={dh * .18} width=".1" height={dh * .7} rx=".04" fill={color3d} opacity=".5" />
      {/* Light panel */}
      <rect x="0" y="0" width={dw} height={dh * .2} rx=".07" fill={color3d} />
      {/* Panel glow strip */}
      <rect x=".06" y=".04" width={dw - .12} height={dh * .13} rx=".04" fill={color} opacity=".9" />
    </svg>
  );
}

// ── Router ──────────────────────────────────────────────────────────────────

export interface ItemShapeProps {
  catalogId: string;
  dw: number;
  dh: number;
  color: string;
  color3d: string;
  rotation: number;
}

export default function ItemShape({ catalogId, dw, dh, color, color3d, rotation }: ItemShapeProps) {
  const p = { color, color3d, dw, dh, rotation };
  switch (catalogId) {
    case 'desk-l':         return <DeskL {...p} />;
    case 'desk-standing':
    case 'desk-standard':  return <DeskRect {...p} />;
    case 'chair-office':
    case 'chair-gaming':   return <ChairShape {...p} />;
    case 'monitor-27':
    case 'monitor-ultra':
    case 'monitor-dual':   return <MonitorShape {...p} />;
    case 'keyboard-tkl':
    case 'keyboard-full':  return <KeyboardShape {...p} />;
    case 'mouse-pad':      return <MousePadShape {...p} />;
    case 'tablet':         return <TabletShape {...p} />;
    case 'speakers':       return <SpeakersShape {...p} />;
    case 'headphone-stand': return <HeadphoneStandShape {...p} />;
    case 'microphone':     return <MicrophoneShape {...p} />;
    case 'desk-lamp':      return <DeskLampShape {...p} />;
    case 'led-strip':      return <LedStripShape {...p} />;
    case 'key-light':      return <KeyLightShape {...p} />;
    default:
      return <div className="w-full h-full" style={{ backgroundColor: color }} />;
  }
}
