"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

// Dynamic offscreen canvas to generate a realistic desaturated world map texture
function createEarthMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "#0a0e17";
  ctx.fillRect(0, 0, 1024, 512);

  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;

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
  drawContinent([[-100, 15], [-90, 15], [-80, 8], [-77, 8], [-80, 15]]);

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
  drawContinent([
    [-17, 32], [30, 30], [51, 11], [40, -34], [18, -34], 
    [9, 5], [-17, 15]
  ]);
  drawContinent([[35, 28], [50, 25], [60, 12], [75, 8], [80, 20], [50, 30]]);

  // 4. Australia
  drawContinent([
    [113, -25], [115, -15], [135, -12], [145, -15], [152, -33], 
    [140, -38], [115, -35]
  ]);

  // 5. Greenland
  drawContinent([[-55, 75], [-45, 80], [-30, 70], [-40, 60], [-55, 65]]);

  // 6. Antarctica
  ctx.fillRect(0, 480, 1024, 32);

  return canvas;
}

// Generate translucent cloud wisps dynamically
function createCloudMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    const y = 40 + Math.random() * 170;
    ctx.arc(80 + Math.random() * 350, y, 30 + Math.random() * 60, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

interface Footprint {
  pos: [number, number, number];
  age: number;
}

function OrbitScanSystem() {
  const satelliteRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  
  // Footprint Ribbon history
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const footprintsRef = useRef<Footprint[]>([]);
  const lastRecordTimeRef = useRef(0);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const orbitalAngle = elapsed * 0.12; // slow orbit speed
    const sweepAngle = Math.sin(elapsed * 4.5) * 0.3; // rapid side-to-side sweep (-17 to +17 deg)

    const R_earth = 2.0;
    const R_orbit = 3.2;
    const inc = Math.PI * 65.0 / 180.0; // 65 deg inclination

    // 1. Calculate Satellite Position
    const satPos = new THREE.Vector3(
      Math.cos(orbitalAngle) * R_orbit,
      Math.sin(orbitalAngle) * Math.sin(inc) * R_orbit,
      Math.sin(orbitalAngle) * Math.cos(inc) * R_orbit
    );

    if (satelliteRef.current) {
      satelliteRef.current.position.copy(satPos);
      satelliteRef.current.lookAt(0, 0, 0);
    }

    // 2. Compute normal cross-track vector for sweeping
    // Normal = P x V
    const normal = new THREE.Vector3(
      0,
      -Math.cos(inc),
      Math.sin(inc)
    ).normalize();

    // 3. Compute ray direction vector (points from sat towards earth, swept along normal)
    const radial = satPos.clone().normalize().negate(); // direction to center
    const rayDir = new THREE.Vector3()
      .addScaledVector(radial, Math.cos(sweepAngle))
      .addScaledVector(normal, Math.sin(sweepAngle))
      .normalize();

    // 4. Calculate footprint intersection on the Earth sphere (radius = 2.0)
    // S + t*d is on sphere => |S + t*d|^2 = R^2
    // Let's use simple approximation since we're pointing straight down: F = R * normalize(S + t*d)
    const footprintPos = rayDir.clone().multiplyScalar(R_earth);
    
    // Rotate slightly so it meets sphere surface exactly
    const footprintVec = satPos.clone().addScaledVector(rayDir, R_orbit - R_earth);
    footprintVec.normalize().multiplyScalar(R_earth);

    // 5. Update active scanning beam orientation and length
    if (beamRef.current) {
      // Beam connects satPos to footprintVec
      const midPoint = new THREE.Vector3().addVectors(satPos, footprintVec).multiplyScalar(0.5);
      beamRef.current.position.copy(midPoint);
      beamRef.current.lookAt(footprintVec);
      
      const distance = satPos.distanceTo(footprintVec);
      beamRef.current.scale.set(1, 1, distance);
    }

    // 6. Record footprint cell history
    // Add footprint point every few frames to form a raster ribbon
    if (clock.getElapsedTime() - lastRecordTimeRef.current > 0.05) {
      lastRecordTimeRef.current = clock.getElapsedTime();
      
      const currentList = [...footprintsRef.current];
      // Increment age of existing footprints
      const updatedList = currentList
        .map(f => ({ ...f, age: f.age + 1 }))
        .filter(f => f.age < 120); // keep last 120 gates

      updatedList.push({
        pos: [footprintVec.x, footprintVec.y, footprintVec.z],
        age: 0
      });

      footprintsRef.current = updatedList;
      setFootprints(updatedList);
    }
  });

  return (
    <group>
      {/* Orbit Track ring */}
      <mesh rotation={[Math.PI * 65 / 180, 0, 0]}>
        <ringGeometry args={[3.19, 3.21, 64]} />
        <meshBasicMaterial color="#334155" side={THREE.DoubleSide} transparent opacity={0.1} />
      </mesh>

      {/* Swept footprint ribbon path on Globe */}
      {footprints.map((f, idx) => {
        // Fade older footprint cells
        const opacity = Math.max(0.01, 0.45 * (1 - f.age / 120));
        
        return (
          <mesh key={idx} position={f.pos}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshBasicMaterial 
              color="#3b82f6" 
              transparent 
              opacity={opacity} 
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {/* Thin Scanning pencil beam (a narrow cylinder rotated along Z) */}
      <group ref={beamRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.04, 1.0, 8, 1, true]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.35} 
            side={THREE.DoubleSide} 
            wireframe
          />
        </mesh>
      </group>

      {/* Satellite craft */}
      <group ref={satelliteRef}>
        <mesh>
          <boxGeometry args={[0.16, 0.16, 0.2]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Solar panels */}
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.35, 0.01, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.35, 0.01, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Radar feed horn cone */}
        <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.05, 0.08, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  const [earthTex, setEarthTex] = useState<THREE.CanvasTexture | null>(null);
  const [cloudsTex, setCloudsTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const earthCanvas = createEarthMap();
    const cloudsCanvas = createCloudMap();
    
    setEarthTex(new THREE.CanvasTexture(earthCanvas));
    setCloudsTex(new THREE.CanvasTexture(cloudsCanvas));
  }, []);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0006;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0009;
    }
  });

  return (
    <group>
      {/* Textured Earth */}
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
      
      {/* Translucent moving clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 48, 48]} />
        {cloudsTex ? (
          <meshStandardMaterial 
            map={cloudsTex} 
            transparent 
            opacity={0.3} 
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        ) : (
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
        )}
      </mesh>

      {/* Atmospheric Glow Ring */}
      <mesh>
        <sphereGeometry args={[2.06, 32, 32]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.025} 
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
        CAMERA: INTERACTIVE ORBIT (DRAG & ZOOM)
      </div>
      <Canvas camera={{ position: [0, 1.8, 5.5], fov: 55 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <Stars radius={100} depth={50} count={600} factor={1.5} saturation={0} fade />
        
        <Earth />
        <OrbitScanSystem />
        
        <OrbitControls enableZoom={true} enablePan={false} maxDistance={8} minDistance={3.5} />
      </Canvas>
    </div>
  );
}
