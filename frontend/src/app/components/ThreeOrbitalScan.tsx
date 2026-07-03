"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

// Helper to procedurally draw a desaturated world map onto a Canvas
function createEarthMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Ocean background (very dark desaturated navy)
  ctx.fillStyle = "#0c101b";
  ctx.fillRect(0, 0, 1024, 512);

  // Muted, desaturated slate-gray-blue for landmasses
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;

  // Approximate coordinate paths for major continents
  const scaleX = (lon: number) => ((lon + 180) / 360) * 1024;
  const scaleY = (lat: number) => ((90 - lat) / 180) * 512;

  const drawContinent = (coords: [number, number][]) => {
    ctx.beginPath();
    coords.forEach((pt, i) => {
      const px = scaleX(pt[0]);
      const py = scaleY(pt[1]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // 1. North America
  drawContinent([
    [-168, 65], [-120, 70], [-80, 75], [-60, 60], [-50, 45], 
    [-80, 25], [-100, 15], [-105, 20], [-120, 35], [-125, 48]
  ]);
  // Central America link
  drawContinent([
    [-100, 15], [-90, 15], [-80, 8], [-77, 8], [-80, 15]
  ]);

  // 2. South America
  drawContinent([
    [-80, 8], [-40, -5], [-35, -7], [-70, -55], [-75, -50], 
    [-80, -20], [-81, -5]
  ]);

  // 3. Eurasia & Africa
  drawContinent([
    [-15, 35], [20, 35], [30, 30], [33, 10], [50, 12], 
    [60, 25], [75, 10], [95, 20], [105, 22], [125, 15], 
    [140, 35], [142, 50], [130, 70], [80, 75], [10, 70], 
    [-5, 55], [-10, 38]
  ]);
  // Africa
  drawContinent([
    [-17, 32], [30, 30], [51, 11], [40, -34], [18, -34], 
    [9, 5], [-17, 15]
  ]);
  // Saudi Arabia & India
  drawContinent([
    [35, 28], [50, 25], [60, 12], [75, 8], [80, 20], [50, 30]
  ]);

  // 4. Australia
  drawContinent([
    [113, -25], [115, -15], [135, -12], [145, -15], [152, -33], 
    [140, -38], [115, -35]
  ]);

  // 5. Greenland
  drawContinent([
    [-55, 75], [-45, 80], [-30, 70], [-40, 60], [-55, 65]
  ]);

  // 6. Antarctica
  ctx.fillRect(0, 480, 1024, 32);

  return canvas;
}

// Helper to draw random cloud wisps on a canvas
function createCloudMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, 512, 256);

  // Draw smooth translucent cloud bands
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    const y = 50 + Math.random() * 150;
    ctx.arc(100 + Math.random() * 300, y, 40 + Math.random() * 50, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

function SatelliteAndSwath() {
  const satelliteRef = useRef<THREE.Group>(null);
  const swathRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() * 0.25; // Slow orbit speed
    
    // Orbital rotation coordinates
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
        <meshBasicMaterial color="#334155" side={THREE.DoubleSide} transparent opacity={0.15} />
      </mesh>

      {/* Satellite spacecraft */}
      <group ref={satelliteRef}>
        <mesh>
          <boxGeometry args={[0.18, 0.18, 0.22]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.35, 0.01, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.35, 0.01, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Antennas */}
        <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.06, 0.08, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} />
        </mesh>
      </group>

      {/* Translucent Radar Swath (cone) */}
      <mesh ref={swathRef}>
        <coneGeometry args={[0.35, 3.2, 32, 1, true]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.06} 
          side={THREE.DoubleSide} 
          wireframe 
        />
      </mesh>
    </group>
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  const [earthTex, setEarthTex] = useState<THREE.CanvasTexture | null>(null);
  const [cloudsTex, setCloudsTex] = useState<THREE.CanvasTexture | null>(null);

  // Generate canvas textures once on client mount
  useEffect(() => {
    const earthCanvas = createEarthMap();
    const cloudsCanvas = createCloudMap();
    
    setEarthTex(new THREE.CanvasTexture(earthCanvas));
    setCloudsTex(new THREE.CanvasTexture(cloudsCanvas));
  }, []);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0008; // Earth self-spin
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0012; // Clouds rotate slightly faster
    }
  });

  return (
    <group>
      {/* 1. Realistic textured Earth Sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.0, 48, 48]} />
        {earthTex ? (
          <meshStandardMaterial 
            map={earthTex} 
            roughness={0.8}
            metalness={0.1}
          />
        ) : (
          <meshStandardMaterial color="#0c101b" roughness={0.8} />
        )}
      </mesh>
      
      {/* 2. Clouds Layer (translucent) */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 48, 48]} />
        {cloudsTex ? (
          <meshStandardMaterial 
            map={cloudsTex} 
            transparent 
            opacity={0.35} 
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        ) : (
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
        )}
      </mesh>

      {/* 3. Atmospheric Glow Ring */}
      <mesh>
        <sphereGeometry args={[2.08, 32, 32]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.02} 
          side={THREE.BackSide} 
        />
      </mesh>
    </group>
  );
}

export default function ThreeOrbitalScan() {
  return (
    <div className="w-full h-80 md:h-[450px] rounded-xl overflow-hidden bg-slate-950 border border-gray-800 shadow-inner relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 px-3 py-1.5 rounded border border-gray-800 text-[9px] text-gray-400 font-mono select-none">
        CAMERA: INTERACTIVE SCENE (DRAG & ZOOM)
      </div>
      <Canvas camera={{ position: [0, 1.8, 5.5], fov: 55 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <Stars radius={100} depth={50} count={600} factor={1.5} saturation={0} fade />
        <Earth />
        <SatelliteAndSwath />
        <OrbitControls enableZoom={true} enablePan={false} maxDistance={8} minDistance={3.5} />
      </Canvas>
    </div>
  );
}
