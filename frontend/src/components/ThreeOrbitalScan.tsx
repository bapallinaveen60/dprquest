"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

function SatelliteAndSwath() {
  const satelliteRef = useRef<THREE.Group>(null);
  const swathRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() * 0.3; // orbit speed
    
    // Orbital rotation
    if (satelliteRef.current) {
      const radius = 3.2;
      const x = Math.cos(elapsed) * radius;
      const z = Math.sin(elapsed) * radius;
      const y = Math.sin(elapsed * 0.5) * radius * 0.4;
      
      satelliteRef.current.position.set(x, y, z);
      satelliteRef.current.lookAt(0, 0, 0);
      
      if (swathRef.current) {
        swathRef.current.position.set(x / 2, y / 2, z / 2);
        swathRef.current.lookAt(x, y, z);
      }
    }
  });

  return (
    <group>
      {/* Orbit Ring */}
      <mesh rotation={[Math.PI / 6, 0, 0]}>
        <ringGeometry args={[3.19, 3.21, 64]} />
        <meshBasicMaterial color="#475569" side={THREE.DoubleSide} transparent opacity={0.2} />
      </mesh>

      {/* Satellite Body */}
      <group ref={satelliteRef}>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.25]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.12]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.12]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.1, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} />
        </mesh>
      </group>

      {/* Translucent Radar Swath (cone) */}
      <mesh ref={swathRef}>
        <coneGeometry args={[0.35, 3.2, 32, 1, true]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.1} 
          side={THREE.DoubleSide} 
          wireframe 
        />
      </mesh>
    </group>
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshStandardMaterial 
          color="#0f172a" 
          roughness={0.9} 
          metalness={0.1}
          emissive="#0f172a"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* desaturated grid overlay */}
      <mesh>
        <sphereGeometry args={[2.01, 32, 32]} />
        <meshBasicMaterial 
          color="#64748b" 
          wireframe 
          transparent 
          opacity={0.05} 
        />
      </mesh>

      {/* Atmospheric Glow */}
      <mesh>
        <sphereGeometry args={[2.08, 32, 32]} />
        <meshBasicMaterial 
          color="#2563eb" 
          transparent 
          opacity={0.03} 
          side={THREE.BackSide} 
        />
      </mesh>
    </group>
  );
}

export default function ThreeOrbitalScan() {
  return (
    <div className="w-full h-80 md:h-[450px] rounded-xl overflow-hidden bg-slate-950 border border-gray-800 shadow-inner relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 px-3 py-1.5 rounded border border-gray-800 text-[9px] text-gray-400 font-mono">
        CAMERA: INTERACTIVE ORBIT (DRAG & PINCH)
      </div>
      <Canvas camera={{ position: [0, 2.0, 5.5], fov: 55 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        <Stars radius={100} depth={50} count={500} factor={1} saturation={0} fade />
        <Earth />
        <SatelliteAndSwath />
        <OrbitControls enableZoom={true} enablePan={false} maxDistance={8} minDistance={3.5} />
      </Canvas>
    </div>
  );
}
