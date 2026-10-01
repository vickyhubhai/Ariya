'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import type { RefObject } from 'react';

const ACCENT = '#7c5cfc';
const ACCENT_2 = '#22d3ee';

/**
 * Camera rig: eases position/rotation toward the pointer so the whole scene
 * gains depth without any per-frame React work.
 */
function Rig({ pointer, children }: { pointer: RefObject<{ x: number; y: number }>; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const target = pointer.current;
    // Idle drift keeps the scene alive when the visitor does not move the mouse.
    const drift = Math.sin(clock.elapsedTime * 0.25) * 0.08;
    const nx = target.x * 0.5 + drift;
    const ny = -target.y * 0.32;
    g.rotation.y += (nx - g.rotation.y) * Math.min(1, delta * 2.2);
    g.rotation.x += (ny - g.rotation.x) * Math.min(1, delta * 2.2);
    g.position.x += (nx * 0.45 - g.position.x) * Math.min(1, delta * 2);
  });

  return <group ref={group}>{children}</group>;
}

/** A record disc built from flat circles and thin tori: cheap and recognisable. */
function Vinyl({ radius = 1.5, position, speed = 0.45, tint = ACCENT }: { radius?: number; position: [number, number, number]; speed?: number; tint?: string }) {
  const disc = useRef<THREE.Group>(null);
  const grooves = useMemo(() => [0.42, 0.58, 0.74, 0.9, 1.06, 1.22].map((r) => r * radius), [radius]);

  useFrame((_, delta) => {
    if (disc.current) disc.current.rotation.z -= delta * speed;
  });

  return (
    <group position={position} rotation={[0.22, -0.28, 0]}>
      <group ref={disc}>
        <mesh>
          <circleGeometry args={[radius, 64]} />
          <meshStandardMaterial color="#0d0d16" metalness={0.7} roughness={0.34} side={THREE.DoubleSide} />
        </mesh>
        {grooves.map((r, i) => (
          <mesh key={r} position={[0, 0, 0.006 + i * 0.0004]}>
            <torusGeometry args={[r, 0.0045, 5, 96]} />
            <meshStandardMaterial color="#26263c" metalness={1} roughness={0.22} emissive={tint} emissiveIntensity={0.22} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.012]}>
          <circleGeometry args={[radius * 0.24, 40]} />
          <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.55} roughness={0.5} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Rim light ring, static so the disc reads against the dark hero. */}
      <mesh position={[0, 0, -0.01]}>
        <torusGeometry args={[radius * 1.03, 0.012, 6, 120]} />
        <meshBasicMaterial color={tint} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/** Low-poly "sound shards" drifting around the disc. */
function Shards() {
  const seeds = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        key: i,
        position: [
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 4.4,
          -1 - Math.random() * 3,
        ] as [number, number, number],
        scale: 0.18 + Math.random() * 0.3,
        speed: 0.7 + Math.random() * 0.8,
        wire: i % 3 === 0,
      })),
    [],
  );

  return (
    <>
      {seeds.map((s) => (
        <Float key={s.key} speed={s.speed} rotationIntensity={1.1} floatIntensity={1.5} floatingRange={[-0.35, 0.35]}>
          <mesh position={s.position} scale={s.scale}>
            <icosahedronGeometry args={[1, 0]} />
            {s.wire ? (
              <meshBasicMaterial color={ACCENT_2} wireframe transparent opacity={0.45} />
            ) : (
              <meshStandardMaterial color="#1b1b2c" metalness={0.9} roughness={0.2} flatShading emissive={ACCENT} emissiveIntensity={0.28} />
            )}
          </mesh>
        </Float>
      ))}
    </>
  );
}

/** Muted equalizer at the bottom of the hero - the musical cue, not a visualiser. */
function Equalizer({ count = 13 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);
  const bars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i - (count - 1) / 2) * 0.46,
        phase: i * 0.55,
        rate: 0.8 + (i % 4) * 0.22,
        base: 0.18 + (i % 3) * 0.12,
        z: -2 - (i % 2) * 0.6,
      })),
    [count],
  );

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.children.forEach((child, i) => {
      const b = bars[i];
      const h = b.base + Math.abs(Math.sin(t * b.rate + b.phase)) * 1.25;
      child.scale.y = h;
      child.position.y = h / 2 - 1.9;
    });
  });

  return (
    <group ref={group}>
      {bars.map((b) => (
        <mesh key={b.x} position={[b.x, 0, b.z]}>
          <boxGeometry args={[0.18, 1, 0.18]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.5} metalness={0.4} roughness={0.6} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The hero scene. Mounted lazily and only for capable devices; every mesh here
 * is low-poly, shares two materials' worth of shading and never allocates in
 * the render loop.
 */
export default function HeroScene({
  pointer,
  frameloop = 'always',
  onReady,
}: {
  pointer: RefObject<{ x: number; y: number }>;
  frameloop?: 'always' | 'never';
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop={frameloop}
      onCreated={onReady}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 7.5], fov: 42 }}
      gl={{ alpha: true, antialias: false, depth: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#8f7bff', '#050508', 0.6]} />
      <pointLight position={[4, 3, 4]} intensity={28} distance={20} color={ACCENT} />
      <pointLight position={[-5, -1, 2]} intensity={16} distance={18} color={ACCENT_2} />

      <Rig pointer={pointer}>
        <Vinyl position={[1.9, 0.5, -1.2]} radius={1.55} speed={0.5} />
        <Vinyl position={[-3.1, -0.9, -2.6]} radius={0.85} speed={-0.7} tint={ACCENT_2} />
        <Shards />
        <Equalizer />
        <Sparkles count={26} scale={[13, 6, 5]} size={2.1} speed={0.32} opacity={0.5} color="#c4b5fd" />
      </Rig>
    </Canvas>
  );
}
