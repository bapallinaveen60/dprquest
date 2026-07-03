"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

interface StormParticle {
  pos: [number, number, number];
  dbz: number;
  phase: "snow" | "melting" | "rain";
}

function VolumetricStorm({ sliceOffset }: { sliceOffset: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate a grid of storm particles representing a convective storm core
  const particles = useRef<StormParticle[]>([]);
  if (particles.current.length === 0) {
    const list: StormParticle[] = [];
    const gridSize = 12;
    const heightGates = 24;
    
    for (let x = -gridSize / 2; x <= gridSize / 2; x += 1.5) {
      for (let z = -gridSize / 2; z <= gridSize / 2; z += 1.5) {
        const dist = Math.sqrt(x * x + z * z);
        if (dist > 5.5) continue;
        
        for (let y = 0; y < heightGates; y += 1.0) {
          const heightKm = (y / heightGates) * 12.0; // 0 to 12km
          
          let phase: "snow" | "melting" | "rain" = "rain";
          if (heightKm > 4.5) phase = "snow";
          else if (heightKm > 4.0) phase = "melting";
          
          let dbz = 18 + (5 - dist) * 4;
          if (phase === "melting") dbz += 8; // bright band boost
          else if (phase === "snow") dbz *= 0.6; // snow
          
          const jitterX = (Math.random() - 0.5) * 0.4;
          const jitterY = (Math.random() - 0.5) * 0.2;
          const jitterZ = (Math.random() - 0.5) * 0.4;
          
          list.push({
            pos: [x + jitterX, (heightKm / 2) - 3.0, z + jitterZ],
            dbz: Math.max(dbz, 5),
            phase
          });
        }
      }
    }
    particles.current = list;
  }

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0012;
    }
  });

  // Scientific weather radar color scale (dBZ)
  const getParticleColor = (dbz: number) => {
    if (dbz > 38) return "#b91c1c"; // Dark Red (heavy core)
    if (dbz > 30) return "#ea580c"; // Orange-Red (moderate)
    if (dbz > 22) return "#ca8a04"; // Muted Gold (melting layer)
    if (dbz > 14) return "#0d9488"; // Muted Teal (light rain)
    return "#475569"; // Slate Gray (snow/drizzle)
  };

  return (
    <group ref={groupRef}>
      {/* 3D Voxel Points */}
      {particles.current.map((p, idx) => {
        if (p.pos[0] > sliceOffset) return null;
        
        const color = getParticleColor(p.dbz);
        const scale = 0.04 + (p.dbz / 45) * 0.08;
        
        return (
          <mesh key={idx} position={p.pos}>
            <boxGeometry args={[scale, scale, scale]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={p.phase === "snow" ? 0.3 : 0.7} 
            />
          </mesh>
        );
      })}

      {/* Cloud Outline Cylinder (Translucent grid) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[5.5, 5.5, 6, 32, 1, true]} />
        <meshBasicMaterial 
          color="#475569" 
          wireframe 
          transparent 
          opacity={0.03} 
          side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  );
}

function ScanningSatellite() {
  const satelliteRef = useRef<THREE.Group>(null);
  const beamLeftRef = useRef<THREE.Mesh>(null);
  const beamRightRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const sweepAngle = Math.sin(elapsed * 1.5) * 0.35;
    
    if (satelliteRef.current) {
      satelliteRef.current.position.y = 4.8;
      satelliteRef.current.position.y += Math.sin(elapsed * 2.0) * 0.04;
    }

    if (beamLeftRef.current && beamRightRef.current) {
      beamLeftRef.current.rotation.z = sweepAngle - 0.04;
      beamRightRef.current.rotation.z = sweepAngle + 0.04;
    }
  });

  return (
    <group>
      {/* Spacecraft */}
      <group ref={satelliteRef}>
        <mesh>
          <boxGeometry args={[0.3, 0.22, 0.3]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Panels */}
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[0.7, 0.02, 0.15]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[0.7, 0.02, 0.15]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Radar Beams */}
        <group position={[0, -0.2, 0]}>
          {/* Ku Band scan swath ray (Muted Blue) */}
          <mesh ref={beamLeftRef} position={[0, -2.4, 0]}>
            <cylinderGeometry args={[0.01, 1.2, 4.8, 16, 1, true]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} side={THREE.DoubleSide} wireframe />
          </mesh>
          {/* Ka Band scan swath ray (Muted Orange) */}
          <mesh ref={beamRightRef} position={[0, -2.4, 0]}>
            <cylinderGeometry args={[0.01, 0.6, 4.8, 16, 1, true]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function ThreeStormViewer({ sliceOffset }: { sliceOffset: number }) {
  return (
    <div className="w-full h-80 md:h-[450px] rounded-xl overflow-hidden bg-slate-950 border border-gray-800 shadow-inner relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 px-3 py-1.5 rounded border border-gray-800 text-[9px] text-gray-400 font-mono">
        INTERACTIVE 3D SWEEP (ROTATION ENABLED)
      </div>

      <Canvas camera={{ position: [0, 1.5, 9.5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        <Stars radius={120} depth={40} count={500} factor={1} saturation={0} fade />
        
        <VolumetricStorm sliceOffset={sliceOffset} />
        <ScanningSatellite />
        
        <OrbitControls enableZoom={true} enablePan={false} maxDistance={14} minDistance={6.0} />
      </Canvas>
    </div>
  );
}
