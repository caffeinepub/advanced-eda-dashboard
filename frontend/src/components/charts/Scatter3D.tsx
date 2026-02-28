import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { DataRow } from '@/context/DataContext';
import * as THREE from 'three';

interface Props {
  data: DataRow[];
  xCol: string;
  yCol: string;
  zCol: string;
}

function normalize(vals: number[]): number[] {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  return vals.map(v => ((v - min) / range) * 4 - 2);
}

function Points({ positions }: { positions: Float32Array }) {
  const ref = useRef<THREE.Points>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.002;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#4CAF50" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export default function Scatter3D({ data, xCol, yCol, zCol }: Props) {
  const positions = useMemo(() => {
    const pts = data
      .map(r => [Number(r[xCol]), Number(r[yCol]), Number(r[zCol])])
      .filter(([x, y, z]) => !isNaN(x) && !isNaN(y) && !isNaN(z))
      .slice(0, 1000);

    if (pts.length === 0) return null;

    const xs = normalize(pts.map(p => p[0]));
    const ys = normalize(pts.map(p => p[1]));
    const zs = normalize(pts.map(p => p[2]));

    const arr = new Float32Array(pts.length * 3);
    for (let i = 0; i < pts.length; i++) {
      arr[i * 3] = xs[i];
      arr[i * 3 + 1] = ys[i];
      arr[i * 3 + 2] = zs[i];
    }
    return arr;
  }, [data, xCol, yCol, zCol]);

  if (!positions) return <p className="text-muted-foreground text-center py-8">No data available.</p>;

  return (
    <div className="w-full rounded-lg overflow-hidden bg-muted/20" style={{ height: 360 }}>
      <Canvas camera={{ position: [5, 4, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Points positions={positions} />
        <OrbitControls enablePan enableZoom enableRotate />
        {/* Axis labels */}
        <Text position={[2.5, 0, 0]} fontSize={0.2} color="#4CAF50">{xCol.slice(0, 10)}</Text>
        <Text position={[0, 2.5, 0]} fontSize={0.2} color="#4CAF50">{yCol.slice(0, 10)}</Text>
        <Text position={[0, 0, 2.5]} fontSize={0.2} color="#4CAF50">{zCol.slice(0, 10)}</Text>
        {/* Grid lines */}
        <gridHelper args={[4, 8, '#333', '#222']} />
      </Canvas>
      <p className="text-xs text-muted-foreground text-center py-1">
        Drag to rotate • Scroll to zoom • {Math.min(data.length, 1000)} points
      </p>
    </div>
  );
}
