'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import type { RefObject } from 'react';

export type SceneQuality = 'high' | 'medium';

const GROOVE_UNITS = [0.42, 0.58, 0.74, 0.9, 1.06, 1.22];

/** Deterministic pseudo-random spread (same hash the CSS particles use). */
function hash(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Sampled from the stylesheet so the 3D palette can never drift away from the
 * CSS design system; the hex values are only offline fallbacks.
 */
function usePalette() {
  return useMemo(() => {
    const css = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    const v = (name: string, fallback: string) => (css?.getPropertyValue(name).trim() || fallback);
    return {
      accent: v('--accent', '#7c5cfc'),
      accent2: v('--accent2', '#a78bfa'),
      accent3: v('--accent3', '#c4b5fd'),
    };
  }, []);
}

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

/** A record disc: flat circle + one instanced groove ring set + label + rim. */
function Vinyl({
  radius,
  position,
  speed,
  tint,
  discMat,
  quality,
}: {
  radius: number;
  position: [number, number, number];
  speed: number;
  tint: string;
  discMat: THREE.Material;
  quality: SceneQuality;
}) {
  const spinner = useRef<THREE.Group>(null);
  const grooves = useRef<THREE.InstancedMesh>(null);
  const grooveCount = quality === 'high' ? GROOVE_UNITS.length : 4;

  const grooveMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#26263c', metalness: 1, roughness: 0.22, emissive: tint, emissiveIntensity: 0.22 }),
    [tint],
  );
  const labelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: tint, emissive: tint, emissiveIntensity: 0.55, roughness: 0.5, metalness: 0.2, side: THREE.DoubleSide }),
    [tint],
  );
  const rimMat = useMemo(() => new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.5 }), [tint]);

  useEffect(
    () => () => {
      grooveMat.dispose();
      labelMat.dispose();
      rimMat.dispose();
    },
    [grooveMat, labelMat, rimMat],
  );

  // Grooves share one torus geometry: each instance is the unit ring scaled
  // to its radius, so the whole record costs three draw calls, not ten.
  useLayoutEffect(() => {
    const mesh = grooves.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < grooveCount; i++) {
      dummy.position.set(0, 0, 0.006 + i * 0.0004);
      dummy.scale.setScalar(GROOVE_UNITS[i] * radius);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [grooveCount, radius]);

  useFrame((_, delta) => {
    if (spinner.current) spinner.current.rotation.z -= delta * speed;
  });

  return (
    <group position={position} rotation={[0.22, -0.28, 0]}>
      <group ref={spinner}>
        <mesh material={discMat}>
          <circleGeometry args={[radius, 64]} />
        </mesh>
        <instancedMesh ref={grooves} args={[undefined, undefined, grooveCount]} material={grooveMat}>
          <torusGeometry args={[1, 0.0045, 5, 96]} />
        </instancedMesh>
        <mesh position={[0, 0, 0.012]} material={labelMat}>
          <circleGeometry args={[radius * 0.24, 40]} />
        </mesh>
      </group>
      {/* Rim light ring, static so the disc reads against the dark hero. */}
      <mesh position={[0, 0, -0.01]} material={rimMat}>
        <torusGeometry args={[radius * 1.03, 0.012, 6, 120]} />
      </mesh>
    </group>
  );
}

type ShardSeed = {
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
  spin: number;
  wire: boolean;
};

/** Low-poly "sound shards" drifting behind the discs - two instanced meshes. */
function Shards({ count, solidMat, wireMat }: { count: number; solidMat: THREE.Material; wireMat: THREE.Material }) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const wireRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { solid, wire } = useMemo(() => {
    const seeds: ShardSeed[] = Array.from({ length: count }, (_, i) => ({
      position: [(hash(i, 1) - 0.5) * 9, (hash(i, 2) - 0.5) * 4.4, -1 - hash(i, 3) * 3] as [number, number, number],
      scale: 0.18 + hash(i, 4) * 0.3,
      speed: 0.7 + hash(i, 5) * 0.8,
      phase: hash(i, 6) * Math.PI * 2,
      spin: 0.2 + hash(i, 7) * 0.5,
      wire: i % 3 === 0,
    }));
    return { solid: seeds.filter((s) => !s.wire), wire: seeds.filter((s) => s.wire) };
  }, [count]);

  const fill = (mesh: THREE.InstancedMesh | null, items: ShardSeed[], t: number) => {
    if (!mesh) return;
    for (let i = 0; i < items.length; i++) {
      const s = items[i];
      dummy.position.set(s.position[0], s.position[1] + Math.sin(t * s.speed + s.phase) * 0.35, s.position[2]);
      dummy.rotation.set(t * s.spin + s.phase, t * s.spin * 0.7, 0);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  // Seed a static frame so the shards exist even before the loop starts.
  useLayoutEffect(() => {
    fill(solidRef.current, solid, 0);
    fill(wireRef.current, wire, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solid, wire]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    fill(solidRef.current, solid, t);
    fill(wireRef.current, wire, t);
  });

  return (
    <>
      <instancedMesh ref={solidRef} args={[undefined, undefined, solid.length]} material={solidMat}>
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
      <instancedMesh ref={wireRef} args={[undefined, undefined, wire.length]} material={wireMat}>
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
    </>
  );
}

/** Muted equalizer at the bottom of the hero - one instanced mesh, no per-bar meshes. */
function Equalizer({ count, barMat }: { count: number; barMat: THREE.Material }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
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

  const fill = (t: number) => {
    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < count; i++) {
      const b = bars[i];
      const h = b.base + Math.abs(Math.sin(t * b.rate + b.phase)) * 1.25;
      dummy.position.set(b.x, h / 2 - 1.9, b.z);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    fill(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame(({ clock }) => fill(clock.elapsedTime));

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} material={barMat}>
      <boxGeometry args={[0.18, 1, 0.18]} />
    </instancedMesh>
  );
}

/**
 * The hero scene. Mounted lazily and only for capable devices; every repeated
 * element is instanced, materials are shared and disposed with the scene, and
 * nothing allocates inside the render loop.
 */
export default function HeroScene({
  pointer,
  frameloop = 'always',
  quality = 'high',
  onReady,
}: {
  pointer: RefObject<{ x: number; y: number }>;
  frameloop?: 'always' | 'never';
  quality?: SceneQuality;
  onReady?: () => void;
}) {
  const palette = usePalette();

  const mats = useMemo(
    () => ({
      disc: new THREE.MeshStandardMaterial({ color: '#0d0d16', metalness: 0.7, roughness: 0.34, side: THREE.DoubleSide }),
      bar: new THREE.MeshStandardMaterial({
        color: palette.accent,
        emissive: palette.accent,
        emissiveIntensity: 0.5,
        metalness: 0.4,
        roughness: 0.6,
        transparent: true,
        opacity: 0.5,
      }),
      shard: new THREE.MeshStandardMaterial({
        color: '#1b1b2c',
        metalness: 0.9,
        roughness: 0.2,
        flatShading: true,
        emissive: palette.accent,
        emissiveIntensity: 0.28,
      }),
      shardWire: new THREE.MeshBasicMaterial({ color: palette.accent2, wireframe: true, transparent: true, opacity: 0.45 }),
    }),
    [palette],
  );

  useEffect(() => {
    const owned = mats;
    return () => Object.values(owned).forEach((m) => m.dispose());
  }, [mats]);

  const shardCount = quality === 'high' ? 7 : 4;
  const barCount = quality === 'high' ? 13 : 9;
  const sparkleCount = quality === 'high' ? 26 : 12;

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
      <hemisphereLight args={[palette.accent2, '#050508', 0.6]} />
      <pointLight position={[4, 3, 4]} intensity={28} distance={20} color={palette.accent} />
      <pointLight position={[-5, -1, 2]} intensity={16} distance={18} color={palette.accent2} />

      <Rig pointer={pointer}>
        <Vinyl position={[1.9, 0.5, -1.2]} radius={1.55} speed={0.5} tint={palette.accent} discMat={mats.disc} quality={quality} />
        <Vinyl position={[-3.1, -0.9, -2.6]} radius={0.85} speed={-0.7} tint={palette.accent2} discMat={mats.disc} quality={quality} />
        <Shards count={shardCount} solidMat={mats.shard} wireMat={mats.shardWire} />
        <Equalizer count={barCount} barMat={mats.bar} />
        <Sparkles count={sparkleCount} scale={[13, 6, 5]} size={2.1} speed={0.32} opacity={0.5} color={palette.accent3} />
      </Rig>
    </Canvas>
  );
}
