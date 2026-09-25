'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import type { Group, Mesh } from 'three';
import { Box, Layers3, RefreshCw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { colorForMaterial, darken } from '@/lib/package-visuals';

export interface ViewerLayer {
  order: number;
  layerRole: string;
  materialName: string;
}

const LAYER_COLORS: Record<string, string> = {
  OUTER: '#3b82f6',
  BARRIER: '#f59e0b',
  ADHESIVE: '#a3a3a3',
  SEAL: '#15803d',
  TRAY: '#8b5cf6',
};

const PANEL_WIDTH = 2.6;
const PANEL_HEIGHT = 1.8;
const PANEL_DEPTH = 0.12;
const COLLAPSED_GAP = PANEL_DEPTH + 0.01;
const EXPLODED_GAP = 0.55;

function LayerPanel({
  layer,
  index,
  total,
  exploded,
}: {
  layer: ViewerLayer;
  index: number;
  total: number;
  exploded: boolean;
}) {
  const meshRef = useRef<Mesh>(null);
  const centeredIndex = index - (total - 1) / 2;
  const targetZ = centeredIndex * (exploded ? EXPLODED_GAP : COLLAPSED_GAP);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.position.z += (targetZ - mesh.position.z) * 0.12;
  });

  const color = LAYER_COLORS[layer.layerRole] ?? '#6b7280';

  return (
    <RoundedBox
      ref={meshRef}
      args={[PANEL_WIDTH, PANEL_HEIGHT, PANEL_DEPTH]}
      radius={0.08}
      smoothness={4}
      position={[0, 0, centeredIndex * COLLAPSED_GAP]}
    >
      <meshStandardMaterial color={color} transparent opacity={0.88} roughness={0.45} metalness={0.05} />
    </RoundedBox>
  );
}

function LayerStackScene({ layers, exploded }: { layers: ViewerLayer[]; exploded: boolean }) {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 4, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} />
      {layers.map((layer, i) => (
        <LayerPanel key={layer.order} layer={layer} index={i} total={layers.length} exploded={exploded} />
      ))}
    </>
  );
}

/**
 * Real-world pack-size feel: a 1kg pouch and a 2000kg jumbo bag shouldn't
 * render the same size. Kept modest (not literally proportional to weight)
 * so the shape always stays framed in the fixed camera view.
 */
function scaleForWeight(packageWeightKg?: number): number {
  if (!packageWeightKg) return 1;
  if (packageWeightKg <= 2) return 0.85;
  if (packageWeightKg <= 25) return 1;
  if (packageWeightKg <= 50) return 1.1;
  if (packageWeightKg <= 500) return 1.2;
  return 1.3;
}

function PackageShape({
  structureType,
  outerColor,
  scale,
}: {
  structureType: string;
  outerColor: string;
  scale: number;
}) {
  const groupRef = useRef<Group>(null);

  switch (structureType) {
    case 'bottle':
      return (
        <group ref={groupRef} scale={scale}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 2, 32]} />
            <meshStandardMaterial color={outerColor} roughness={0.3} metalness={0.05} />
          </mesh>
          <mesh position={[0, 1.25, 0]}>
            <cylinderGeometry args={[0.32, 0.5, 0.5, 24]} />
            <meshStandardMaterial color={outerColor} roughness={0.3} metalness={0.05} />
          </mesh>
        </group>
      );

    case 'jerry_can':
      return (
        <group ref={groupRef} scale={scale}>
          <RoundedBox args={[1.7, 2, 1.1]} radius={0.15} smoothness={4}>
            <meshStandardMaterial color={outerColor} roughness={0.35} metalness={0.05} />
          </RoundedBox>
          <mesh position={[0.4, 1.15, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.3, 16]} />
            <meshStandardMaterial color={outerColor} roughness={0.3} />
          </mesh>
          <mesh position={[0.1, 0.75, 0.65]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.32, 0.06, 8, 16, Math.PI]} />
            <meshStandardMaterial color={outerColor} roughness={0.4} />
          </mesh>
        </group>
      );

    case 'milk_can':
      return (
        <group ref={groupRef} scale={scale}>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.95, 0.85, 2.1, 24]} />
            <meshStandardMaterial color={outerColor} roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.6, 0.95, 0.3, 24]} />
            <meshStandardMaterial color={outerColor} roughness={0.35} metalness={0.4} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 1.05, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.28, 0.06, 8, 16]} />
              <meshStandardMaterial color={outerColor} roughness={0.4} metalness={0.4} />
            </mesh>
          ))}
        </group>
      );

    case 'drum':
      return (
        <group ref={groupRef} scale={scale}>
          <mesh>
            <cylinderGeometry args={[0.95, 0.95, 2.4, 28]} />
            <meshStandardMaterial color={outerColor} roughness={0.4} metalness={0.1} />
          </mesh>
          {[-0.7, 0, 0.7].map((y, i) => (
            <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.97, 0.05, 8, 28]} />
              <meshStandardMaterial color={darken(outerColor, 18)} roughness={0.4} />
            </mesh>
          ))}
        </group>
      );

    case 'tray':
      return (
        <group ref={groupRef} scale={scale}>
          <RoundedBox args={[2.6, 0.6, 1.8]} radius={0.1} smoothness={4} position={[0, -0.3, 0]}>
            <meshStandardMaterial color={outerColor} roughness={0.2} metalness={0.05} transparent opacity={0.85} />
          </RoundedBox>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.5, 1.7]} />
            <meshStandardMaterial color="#dbeafe" transparent opacity={0.35} roughness={0.1} />
          </mesh>
        </group>
      );

    case 'sack':
      return (
        <group ref={groupRef} scale={scale}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[1, 0.85, 2, 20]} />
            <meshStandardMaterial color={outerColor} roughness={0.85} metalness={0} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <sphereGeometry args={[0.35, 16, 12]} />
            <meshStandardMaterial color={outerColor} roughness={0.85} metalness={0} />
          </mesh>
        </group>
      );

    case 'jumbo_bag':
      return (
        <group ref={groupRef} scale={scale}>
          <RoundedBox args={[2.2, 2.4, 2.2]} radius={0.12} smoothness={4}>
            <meshStandardMaterial color={outerColor} roughness={0.9} metalness={0} />
          </RoundedBox>
          {[
            [-0.9, 1.35, -0.9],
            [0.9, 1.35, -0.9],
            [-0.9, 1.35, 0.9],
            [0.9, 1.35, 0.9],
          ].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <torusGeometry args={[0.16, 0.05, 8, 16]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.6} />
            </mesh>
          ))}
        </group>
      );

    case 'carton':
      return (
        <group ref={groupRef} scale={scale}>
          <RoundedBox args={[2.4, 1.7, 1.7]} radius={0.06} smoothness={3}>
            <meshStandardMaterial color={outerColor} roughness={0.95} metalness={0} />
          </RoundedBox>
          <mesh position={[0, 0.86, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 1.7]} />
            <meshStandardMaterial color="#a9773f" roughness={0.95} />
          </mesh>
        </group>
      );

    case 'crate':
      return (
        <group ref={groupRef} scale={scale}>
          <RoundedBox args={[2.6, 1.4, 1.9]} radius={0.08} smoothness={3}>
            <meshStandardMaterial color={outerColor} roughness={0.5} metalness={0.05} />
          </RoundedBox>
          {[-0.9, -0.45, 0, 0.45, 0.9].map((x, i) => (
            <mesh key={i} position={[x, 0, 0.96]}>
              <boxGeometry args={[0.08, 1.3, 0.06]} />
              <meshStandardMaterial color="#0f766e" roughness={0.4} />
            </mesh>
          ))}
        </group>
      );

    case 'sachet':
      return (
        <group ref={groupRef} scale={scale}>
          <RoundedBox args={[1.6, 1.2, 0.15]} radius={0.05} smoothness={3}>
            <meshStandardMaterial color={outerColor} roughness={0.35} metalness={0.35} />
          </RoundedBox>
        </group>
      );

    case 'bag':
    case 'pouch':
    default:
      return (
        <group ref={groupRef} scale={scale}>
          <RoundedBox args={[1.9, 2.3, 0.55]} radius={0.35} smoothness={4}>
            <meshStandardMaterial color={outerColor} roughness={0.4} metalness={0.1} />
          </RoundedBox>
        </group>
      );
  }
}

function PackageScene({
  structureType,
  outerColor,
  scale,
}: {
  structureType: string;
  outerColor: string;
  scale: number;
}) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 4, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} />
      <PackageShape structureType={structureType} outerColor={outerColor} scale={scale} />
    </>
  );
}

/**
 * Shows the recommended pack two ways: a shape-accurate "Package view" (the
 * default — a sack looks like a sack, a jumbo bag like a jumbo bag, sized to
 * roughly match the requested pack weight) and a "Layer view" exploded
 * diagram of the material stack for anyone who wants the barrier-science
 * detail. Shapes are simplified primitives, not photoreal renders, but they
 * are shape- and color-differentiated per real package type rather than one
 * generic panel for everything.
 */
export function PackagingViewer({
  layers,
  structureType,
  packageWeightKg,
}: {
  layers: ViewerLayer[];
  structureType?: string;
  packageWeightKg?: number;
}) {
  const [mode, setMode] = useState<'package' | 'layers'>('package');
  const [exploded, setExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  function handleReset() {
    setExploded(false);
    setAutoRotate(true);
    controlsRef.current?.reset();
  }

  if (layers.length === 0) return null;

  const outerLayer = layers.find((l) => l.layerRole === 'OUTER' || l.layerRole === 'TRAY') ?? layers[0];
  const outerColor = colorForMaterial(outerLayer?.materialName, '#94a3b8');
  const scale = mode === 'package' ? scaleForWeight(packageWeightKg) : 1;
  const camDistance = mode === 'package' ? scale : 1;

  return (
    <div className="space-y-2">
      <div className="relative h-72 overflow-hidden rounded-xl border border-border bg-gradient-to-b from-secondary/50 to-secondary/10">
        <Canvas
          key={mode}
          camera={{ position: [3.2 * camDistance, 2 * camDistance, 4.2 * camDistance], fov: 40 }}
        >
          {mode === 'package' ? (
            <PackageScene structureType={structureType ?? 'bag'} outerColor={outerColor} scale={scale} />
          ) : (
            <LayerStackScene layers={layers} exploded={exploded} />
          )}
          <OrbitControls
            ref={controlsRef}
            autoRotate={autoRotate}
            autoRotateSpeed={1.4}
            enablePan={false}
            minDistance={3 * camDistance}
            maxDistance={9 * camDistance}
            onStart={() => setAutoRotate(false)}
          />
        </Canvas>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setMode('package')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              mode === 'package' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Box className="h-3.5 w-3.5" />
            Package
          </button>
          <button
            type="button"
            onClick={() => setMode('layers')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              mode === 'layers' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Layers3 className="h-3.5 w-3.5" />
            Layers
          </button>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setAutoRotate((v) => !v)}>
          <RotateCw className="h-3.5 w-3.5" />
          {autoRotate ? 'Stop rotating' : 'Rotate'}
        </Button>
        {mode === 'layers' && (
          <Button type="button" variant="outline" size="sm" onClick={() => setExploded((v) => !v)}>
            <Layers3 className="h-3.5 w-3.5" />
            {exploded ? 'Collapse layers' : 'Explode view'}
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </Button>
        <p className="text-[11px] text-muted-foreground">Drag to rotate · Scroll to zoom</p>
      </div>
    </div>
  );
}
