"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Pause, 
  RefreshCw, 
  Radio, 
  Info,
  Droplet,
  CloudSnow,
  CloudRain,
  Flame,
  ChevronRight,
  HelpCircle
} from "lucide-react";

// Dynamically import the 3D globe visualization to avoid SSR window errors
const ThreeOrbitalScan = dynamic(() => import("@/components/ThreeOrbitalScan"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 md:h-[450px] rounded-2xl bg-gray-900/60 flex items-center justify-center border border-gray-800">
      <div className="text-cyan-400 font-mono text-sm animate-pulse">LOADING 3D ORBITAL SIMULATION...</div>
    </div>
  )
});

export default function StoryPage() {
  const [chapter, setChapter] = useState(1);
  
  // Chapter 2: Radar Pulse States
  const [rainIntensity, setRainIntensity] = useState(50); // 0 to 100
  const [pulseActive, setPulseActive] = useState(false);
  const [pulsePosition, setPulsePosition] = useState(0); // 0 (satellite) to 100 (ground)
  const [echoPosition, setEchoPosition] = useState(-1); // -1 (inactive) or 0 to 100
  const [reflectivityProfile, setReflectivityProfile] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);

  // Chapter 3: Ku/Ka Bands States
  const [selectedWeather, setSelectedWeather] = useState<"light" | "moderate" | "heavy" | "snow">("moderate");

  // Chapter 4: Pulse Journey Stepper
  const [journeyStep, setJourneyStep] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);

  // Chapter 2: Animation Effect
  useEffect(() => {
    if (pulseActive) {
      const step = () => {
        setPulsePosition((prev) => {
          if (prev >= 100) {
            // Pulse hits ground, activate echo going up
            setEchoPosition(100);
            return 100;
          }
          return prev + 1.8; // Speed of downward pulse
        });

        setEchoPosition((prev) => {
          if (prev === -1) return -1;
          if (prev <= 0) {
            setPulseActive(false);
            return -1;
          }
          return prev - 1.8; // Speed of upward echo
        });

        // Compute simulated reflectivity in real-time
        setReflectivityProfile((prev) => {
          const currentHeight = Math.floor(pulsePosition);
          if (currentHeight <= 0 || currentHeight >= 100) return prev;
          
          // Generate a profile based on rain intensity
          // Height: 0 is space, 40 is cloud top, 85 is freezing level, 100 is ground
          let ref = 0;
          if (currentHeight >= 30 && currentHeight < 70) {
            // Dry snow above freezing
            ref = (rainIntensity * 0.15) + 8;
          } else if (currentHeight >= 70 && currentHeight < 76) {
            // Bright band melting spike
            ref = (rainIntensity * 0.3) + 22;
          } else if (currentHeight >= 76 && currentHeight < 96) {
            // Liquid rain
            ref = (rainIntensity * 0.35) + 12;
          } else if (currentHeight >= 96) {
            // Surface echo spike
            ref = 50;
          }

          // Append to array (representing height gates)
          const newProfile = [...prev];
          newProfile[currentHeight] = ref;
          return newProfile;
        });

        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [pulseActive, pulsePosition, rainIntensity]);

  const triggerPulse = () => {
    setPulsePosition(0);
    setEchoPosition(-1);
    setReflectivityProfile(new Array(100).fill(0));
    setPulseActive(true);
  };

  // Chapter 4: Autoplay Journey
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoplay) {
      timer = setInterval(() => {
        setJourneyStep((prev) => {
          if (prev === 5) {
            setIsAutoplay(false);
            return 5;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isAutoplay]);

  // Weather configurations for Chapter 3
  const weatherConfigs = {
    light: {
      desc: "Light drizzle. Drops are tiny (Dm ~ 0.8mm).",
      ku: [12, 14, 15, 14, 13, 12, 10, 0],
      ka: [14, 16, 17, 16, 15, 13, 11, 0], // Ka is more sensitive than Ku in light rain!
      dfr: [-2, -2, -2, -2, -2, -1, -1, 0],
      note: "Notice that Ka reflectivity is actually slightly higher than Ku reflectivity here. This is because Ka-band's shorter wavelength (8.4mm) is much more sensitive to tiny droplets."
    },
    moderate: {
      desc: "Standard stratiform rainfall with a clear bright band. Medium drops (Dm ~ 1.5mm).",
      ku: [15, 20, 22, 34, 25, 24, 23, 0], // 34 dBZ bright band melting spike
      ka: [16, 19, 21, 28, 20, 18, 15, 0], // Ka bright band is smaller, drops off at bottom due to moderate attenuation
      dfr: [-1, 1, 1, 6, 5, 6, 8, 0],
      note: "A clear bright band peak is visible at the freezing level (melting layer). Below this melting layer, Ka-band reflectivity begins to fall below Ku-band because Ka-band starts getting attenuated by the rain column."
    },
    heavy: {
      desc: "Convective downpour. Large drops (Dm ~ 2.8mm). High attenuation.",
      ku: [25, 38, 42, 44, 43, 42, 41, 0],
      ka: [24, 30, 28, 24, 18, 12, 6, 0], // Ka attenuates heavily, drops to near noise level at surface!
      dfr: [1, 8, 14, 20, 25, 30, 35, 0],
      note: "Under heavy downpours, Ka-band is severely attenuated. By the time the Ka pulse reaches the surface, its signal is almost completely absorbed by the rain column, creating a massive DFR (Dual-Frequency Ratio)."
    },
    snow: {
      desc: "Dry fluffy snowflakes above freezing. Large size but very low density.",
      ku: [18, 20, 22, 22, 21, 20, 18, 0],
      ka: [19, 21, 23, 22, 21, 20, 18, 0],
      dfr: [-1, -1, -1, 0, 0, 0, 0, 0],
      note: "Because ice has a low dielectric constant (|K|^2 ≈ 0.176), dry snow reflects poorly compared to liquid rain. Both bands see similar backscatter because there is almost no attenuation, keeping DFR close to 0 dB."
    }
  };

  const currentConfig = weatherConfigs[selectedWeather];

  // Journey steps for Chapter 4
  const journeyStages = [
    {
      title: "Pulse Transmitted",
      desc: "The satellite's transmitters fire high-power microwave pulses downward at Ku (13.6 GHz) and Ka (35.5 GHz) frequencies. The pulse travels at the speed of light.",
      visual: "satellite-pulse"
    },
    {
      title: "Cloud & Snow Penetration",
      desc: "The pulse enters the top of the cloud. High-altitude dry snow reflects some energy back. Because snow is dry, attenuation (signal loss) is very low, and the pulse moves onward.",
      visual: "cloud-snow"
    },
    {
      title: "The Melting Layer (Bright Band)",
      desc: "As the pulse crosses the freezing level, snowflakes start melting. Coated in a water skin, they appear as massive raindrops to the radar, producing a giant spike in the returned echo.",
      visual: "bright-band"
    },
    {
      title: "Rain Column Attenuation",
      desc: "The pulse travels through liquid rain. Raindrops absorb and scatter the radar energy. The higher-frequency Ka band gets heavily attenuated (weakened) compared to the Ku band.",
      visual: "rain-attenuation"
    },
    {
      title: "Surface Echo Spike",
      desc: "The remaining radar energy strikes the ocean or land surface. The surface has a very high density, reflecting a massive, easily identifiable echo back to the satellite.",
      visual: "surface-echo"
    },
    {
      title: "Return and Retrieval",
      desc: "The weak backscattered echoes return to the satellite's antenna. The onboard receivers digitize the signals. The Level-2 algorithm cleans noise, corrects for attenuation, and outputs retrieved rain rates.",
      visual: "retrieval-step"
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Chapter Stepper Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-cyan-400 font-semibold tracking-widest uppercase">Story Mode</span>
          <h1 className="text-2xl font-bold text-white">Chapter {chapter}: {
            chapter === 1 ? "Meet the GPM Satellite" :
            chapter === 2 ? "How Radar Sees Rain" :
            chapter === 3 ? "Meet Ku and Ka Bands" :
            "The Journey of a Radar Pulse"
          }</h1>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => setChapter(prev => Math.max(prev - 1, 1))}
            disabled={chapter === 1}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
            aria-label="Previous Chapter"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 px-3 bg-gray-900 border border-gray-800 rounded-xl text-xs font-mono text-gray-400">
            {chapter} / 4
          </div>

          <button 
            onClick={() => setChapter(prev => Math.min(prev + 1, 4))}
            disabled={chapter === 4}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
            aria-label="Next Chapter"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- CHAPTER 1: MEET THE GPM SATELLITE --- */}
      {chapter === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-white">Why Measure Rainfall from Space?</h2>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                Water is life, but 70% of Earth's surface is covered by oceans, and vast land areas have no weather radars. 
                Ground instruments only cover a tiny fraction of the globe. To understand global weather, climate cycles, 
                and predict disasters like hurricanes or floods, we need an eye in the sky.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                The **Global Precipitation Measurement (GPM) Core Observatory**, launched jointly by **NASA** and **JAXA** in 2014, 
                serves as the anchor satellite. It flies in a tilted, non-sunsynchronous orbit ($65^\circ$ inclination), 
                allowing it to scan the same locations at different times of day to study how rainfall changes hourly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30 flex gap-3">
              <Info className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-cyan-400">Scanning Geometry</span>
                <p className="text-xs text-gray-300 leading-normal font-light">
                  The Dual-frequency Precipitation Radar (DPR) sweeps a cross-track swath. As GPM flies, the Ku-band radar 
                  scans a 245 km wide path, while the Ka-band radar scans a narrower matched path (120 km) inside it. 
                  This creates a 3D volumetric curtain slice of clouds!
                </p>
              </div>
            </div>

            <button 
              onClick={() => setChapter(2)}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-white shadow-md w-fit text-sm transition-all"
            >
              <span>How does it see rain? Next Chapter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <ThreeOrbitalScan />
          </div>
        </div>
      )}

      {/* --- CHAPTER 2: HOW RADAR SEES RAIN --- */}
      {chapter === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-white">Radar Pulse & Backscatter Echo</h2>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                A weather radar is an active sensor. Unlike camera satellites that just capture visible sunlight, GPM DPR fires its own energy.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                It transmits a brief **microwave pulse** down toward Earth. As the pulse travels through clouds and rain, it strikes raindrops. 
                A tiny portion of the microwave energy is scattered backwards toward the satellite. This is the **backscatter echo**.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                By measuring the **time delay** of the returned echo, we calculate the altitude of the rain. By measuring the **signal strength (reflectivity $Z$)**, 
                we estimate the amount of water in the cloud column.
              </p>
            </div>

            {/* Intensity Slider */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-900 border border-gray-800">
              <label className="text-xs font-semibold text-gray-400 flex items-center justify-between">
                <span>Rain Column Density (Intensity)</span>
                <span className="text-cyan-400 font-bold">{rainIntensity}%</span>
              </label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={rainIntensity} 
                onChange={(e) => setRainIntensity(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>LIGHT DRIZZLE</span>
                <span>STORMY CLOUD</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={triggerPulse}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-white shadow-md text-sm transition-all"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Fire Radar Pulse</span>
              </button>
              
              <button 
                onClick={() => {
                  setReflectivityProfile(new Array(100).fill(0));
                  setPulsePosition(0);
                  setEchoPosition(-1);
                  setPulseActive(false);
                }}
                className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
                aria-label="Reset simulation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Animation Screen */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-4">
            {/* Visual Column */}
            <div className="h-[420px] rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-950 to-space-900 relative overflow-hidden flex flex-col justify-between p-4">
              <div className="absolute top-2 left-2 z-10 bg-gray-950/80 px-2 py-1 rounded border border-gray-800 text-[10px] text-gray-400 font-mono">
                RADAR GATE COLUMN
              </div>

              {/* Satellite Graphic */}
              <div className="flex flex-col items-center relative z-10 pt-2">
                <div className="w-10 h-6 bg-slate-700 rounded-md border border-slate-500 flex items-center justify-center text-[10px] font-bold text-white">DPR</div>
                <div className="w-0.5 h-3 bg-cyan-500/80"></div>
              </div>

              {/* Pulse Ray animation */}
              {pulseActive && (
                <div 
                  className="absolute w-full flex justify-center pointer-events-none"
                  style={{ top: `${pulsePosition * 3.4 + 40}px` }}
                >
                  <div className="w-24 h-1.5 bg-yellow-400/80 blur-[1px] rounded-full animate-pulse shadow-glow shadow-yellow-400/30"></div>
                </div>
              )}

              {/* Echo Ray animation */}
              {echoPosition !== -1 && (
                <div 
                  className="absolute w-full flex justify-center pointer-events-none"
                  style={{ top: `${echoPosition * 3.4 + 40}px` }}
                >
                  <div className="w-20 h-1 bg-cyan-400/60 blur-[2px] rounded-full"></div>
                </div>
              )}

              {/* Cloud Layer Graphic */}
              <div className="absolute top-[130px] left-0 w-full h-[240px] flex flex-col items-center justify-between pointer-events-none">
                {/* Cloud top (snow) */}
                <div 
                  className="w-[90%] h-[120px] bg-white/5 border border-white/5 rounded-2xl filter blur-[1px] flex items-center justify-center"
                  style={{ opacity: rainIntensity / 100 }}
                >
                  <CloudSnow className="w-6 h-6 text-slate-400 opacity-20" />
                </div>
                {/* Melting Layer line */}
                <div className="w-full border-t border-dashed border-orange-500/30 flex justify-end pr-4 z-10">
                  <span className="text-[9px] text-orange-400/60 font-mono -mt-2 bg-space-950 px-1">MELTING LAYER (0°C)</span>
                </div>
                {/* Liquid rain */}
                <div 
                  className="w-[90%] h-[110px] bg-blue-500/5 border border-blue-500/5 rounded-2xl filter blur-[1px] flex items-center justify-center"
                  style={{ opacity: rainIntensity / 100 }}
                >
                  <CloudRain className="w-6 h-6 text-blue-400 opacity-20" />
                </div>
              </div>

              {/* Earth Surface */}
              <div className="h-10 border-t border-emerald-500/20 bg-emerald-950/20 w-full rounded-xl flex items-center justify-center z-10">
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">EARTH SURFACE</span>
              </div>
            </div>

            {/* Live Chart Plot */}
            <div className="h-[420px] rounded-2xl border border-gray-800 bg-gray-950 p-4 flex flex-col justify-between">
              <div className="bg-gray-900/80 px-2 py-1 rounded border border-gray-800 text-[10px] text-gray-400 font-mono w-fit">
                MEASURED REFLECTIVITY (Z_m)
              </div>

              {/* Plot canvas simulated */}
              <div className="flex-1 w-full border-l border-b border-gray-800 relative mt-4 mb-2 flex flex-col justify-between">
                {/* Freezing layer line in plot */}
                <div className="absolute top-[70%] left-0 w-full border-t border-dashed border-orange-500/20 pointer-events-none"></div>
                
                {/* Drawing profile gates */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col pointer-events-none">
                  {reflectivityProfile.map((val, idx) => (
                    <div 
                      key={idx} 
                      className="h-[1%] bg-cyan-400/40 rounded-r"
                      style={{ 
                        width: `${Math.min((val / 55) * 100, 100)}%`,
                        backgroundColor: idx >= 70 && idx < 76 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(6, 182, 212, 0.4)'
                      }}
                    />
                  ))}
                </div>

                <div className="w-full flex justify-between absolute bottom-1 right-1 text-[8px] text-gray-600 font-mono pointer-events-none">
                  <span>0 dBZ (NOISE)</span>
                  <span>55 dBZ (STORM CORE)</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 leading-relaxed font-light">
                {pulseActive ? (
                  <span className="text-yellow-400 font-mono animate-pulse">Pulse penetrating storm. Receiving echoes...</span>
                ) : reflectivityProfile.some(v => v > 0) ? (
                  <span>
                    Pulse complete. Reflectivity profile successfully measured. Note the melting peak (<span className="text-orange-400">bright band</span>) in the center.
                  </span>
                ) : (
                  <span>Click "Fire Radar Pulse" above to start measuring.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CHAPTER 3: MEET KU AND KA BANDS --- */}
      {chapter === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-white">Dual Frequencies: Why Two?</h2>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                GPM is the first satellite to carry a **Dual-frequency** Precipitation Radar (DPR). Single-frequency radars 
                have a huge weakness: they cannot solve the **Drop Size Distribution (DSD)** ambiguity.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                A storm with many tiny raindrops can produce the exact same reflectivity as a storm with a few massive raindrops. 
                DPR solves this by using two frequencies:
              </p>
              <ul className="list-disc pl-4 text-xs text-gray-400 flex flex-col gap-1 leading-normal font-light">
                <li><strong className="text-cyan-400">Ku-band (13.6 GHz):</strong> Less attenuated. Penetrates heavy storms to see deep core details.</li>
                <li><strong className="text-magenta-400">Ka-band (35.5 GHz):</strong> Highly sensitive. Detects light drizzle and snow, but attenuates rapidly.</li>
              </ul>
            </div>

            {/* Weather Selector */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-gray-900 border border-gray-800">
              <span className="text-xs font-semibold text-gray-400">Select Weather Condition</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "light", label: "Light Drizzle", icon: Droplet },
                  { id: "moderate", label: "Stratiform", icon: CloudRain },
                  { id: "heavy", label: "Heavy Storm", icon: Flame },
                  { id: "snow", label: "Dry Snow", icon: CloudSnow },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedWeather(item.id as any)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedWeather === item.id 
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40" 
                          : "bg-gray-950 border-gray-850 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 leading-normal mt-1 italic font-light">{currentConfig.desc}</p>
            </div>
          </div>

          {/* Graphical comparison display */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-bold text-gray-400">RADAR CURVES</span>
                <div className="flex gap-4 text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-cyan-400"><span className="w-2.5 h-2.5 bg-cyan-400 rounded-full"></span>Ku-Band</span>
                  <span className="flex items-center gap-1.5 text-magenta-400"><span className="w-2.5 h-2.5 bg-magenta-400 rounded-full"></span>Ka-Band</span>
                  <span className="flex items-center gap-1.5 text-violet-400"><span className="w-2.5 h-2.5 bg-violet-400 rounded-full"></span>DFR (Ku - Ka)</span>
                </div>
              </div>

              {/* Profiles layout */}
              <div className="flex-1 grid grid-cols-3 gap-6 h-[280px] mt-6">
                {/* Ku and Ka plot */}
                <div className="col-span-2 border-l border-b border-gray-800 relative h-full flex flex-col justify-between">
                  {/* Drawing curves */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Ku Path */}
                    <path
                      d={currentConfig.ku.map((val, idx) => {
                        const x = (val / 50) * 100;
                        const y = (idx / 7) * 100;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Ka Path */}
                    <path
                      d={currentConfig.ka.map((val, idx) => {
                        const x = (val / 50) * 100;
                        const y = (idx / 7) * 100;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#d946ef"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  <div className="w-full flex justify-between absolute bottom-1 right-1 text-[8px] text-gray-600 font-mono">
                    <span>0 dBZ</span>
                    <span>50 dBZ</span>
                  </div>
                </div>

                {/* DFR plot */}
                <div className="border-l border-b border-gray-800 relative h-full flex flex-col justify-between">
                  {/* Drawing DFR curve */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d={currentConfig.dfr.map((val, idx) => {
                        // DFR goes from -5 to 35 dB
                        const x = ((val + 5) / 40) * 100;
                        const y = (idx / 7) * 100;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  <div className="w-full flex justify-between absolute bottom-1 right-1 text-[8px] text-gray-600 font-mono">
                    <span>-5 dB</span>
                    <span>35 dB</span>
                  </div>
                </div>
              </div>

              {/* Note callout */}
              <div className="mt-4 p-3 rounded-lg bg-gray-900 border border-gray-850 text-xs text-gray-300">
                {currentConfig.note}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CHAPTER 4: THE JOURNEY OF A RADAR PULSE --- */}
      {chapter === 4 && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Steps Sidebar list */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              {journeyStages.map((stage, idx) => (
                <button
                  key={stage.title}
                  onClick={() => {
                    setJourneyStep(idx);
                    setIsAutoplay(false);
                  }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    journeyStep === idx 
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40" 
                      : "bg-gray-900 border-gray-850 text-gray-400 hover:text-white"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    journeyStep === idx ? "bg-cyan-500 text-black" : "bg-gray-800 text-gray-400"
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-xs font-semibold">{stage.title}</span>
                </button>
              ))}

              {/* Autoplay controller */}
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                className={`mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  isAutoplay 
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/30" 
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {isAutoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isAutoplay ? "Pause Autoplay" : "Start Autoplay walk (4s/step)"}</span>
              </button>
            </div>

            {/* Stepper Display Card */}
            <div className="lg:col-span-8 glass-panel p-6 md:p-8 rounded-2xl border border-gray-800 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-widest">STAGE {journeyStep + 1} OF 6</span>
                <h3 className="text-xl font-bold text-white">{journeyStages[journeyStep].title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed font-light">{journeyStages[journeyStep].desc}</p>
              </div>

              {/* Visual Simulation Display Box */}
              <div className="h-60 rounded-xl bg-gray-950 border border-gray-850 flex items-center justify-center relative overflow-hidden">
                {/* 1. Pulse Transmitted */}
                {journeyStep === 0 && (
                  <div className="flex flex-col items-center gap-4">
                    <Radio className="w-12 h-12 text-cyan-400 animate-pulse" />
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-yellow-400 font-mono animate-bounce">Pulse sweeping downward</span>
                      <div className="w-32 h-0.5 bg-yellow-400/80 rounded-full mt-2 animate-ping"></div>
                    </div>
                  </div>
                )}

                {/* 2. Cloud & Snow Penetration */}
                {journeyStep === 1 && (
                  <div className="flex flex-col items-center gap-4">
                    <CloudSnow className="w-12 h-12 text-slate-400" />
                    <span className="text-xs text-gray-300">Penetrating ice particles. Echoes returning.</span>
                  </div>
                )}

                {/* 3. The Melting Layer (Bright Band) */}
                {journeyStep === 2 && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <CloudSnow className="w-12 h-12 text-slate-300 blur-[0.5px]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-orange-400 animate-pulse mt-6" />
                      </div>
                    </div>
                    <span className="text-xs text-orange-400 font-mono font-bold animate-pulse">
                      Reflectivity Boost (+8 dB) - MELTING MELT
                    </span>
                  </div>
                )}

                {/* 4. Rain Column Attenuation */}
                {journeyStep === 3 && (
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-cyan-400 font-mono">Ku (13.6 GHz)</span>
                      <div className="h-28 w-1 bg-cyan-400 rounded-full mt-2"></div>
                      <span className="text-[9px] text-cyan-500 mt-1">Light Attenuation</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-magenta-400 font-mono">Ka (35.5 GHz)</span>
                      <div className="h-28 w-1 bg-gradient-to-b from-magenta-400 to-magenta-950 rounded-full mt-2"></div>
                      <span className="text-[9px] text-magenta-600 mt-1">Heavy Attenuation</span>
                    </div>
                  </div>
                )}

                {/* 5. Surface Echo Spike */}
                {journeyStep === 4 && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-40 h-8 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-center font-bold text-emerald-400 text-xs tracking-widest">
                      LAND/OCEAN BOUNDARY
                    </div>
                    <span className="text-xs text-yellow-400 font-mono font-bold animate-ping">MASSIVE REFLECTIVITY SPIKE</span>
                  </div>
                )}

                {/* 6. Return and Retrieval */}
                {journeyStep === 5 && (
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin" />
                    <span className="text-xs text-gray-300">Level-2 Algorithm solving: Zm → Ze → Rain Rate</span>
                  </div>
                )}
              </div>

              {/* Step selector footer */}
              <div className="flex justify-between border-t border-gray-800 pt-4">
                <button
                  onClick={() => setJourneyStep(prev => Math.max(prev - 1, 0))}
                  disabled={journeyStep === 0}
                  className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-850 text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                >
                  Previous Stage
                </button>
                <button
                  onClick={() => setJourneyStep(prev => Math.min(prev + 1, 5))}
                  disabled={journeyStep === 5}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Next Stage
                </button>
              </div>
            </div>
          </div>

          {/* Platform transition callout */}
          <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
            <div className="flex flex-col gap-1.5 text-center md:text-left">
              <h4 className="font-bold text-white text-md">Ready to dive into the mathematical processing modules?</h4>
              <p className="text-xs text-gray-400 leading-normal">
                Transition from the physics story into the GPM Level-2 processing pipeline (PRE, VER, CSF, DSD, SRT, SLV) and explore how each module changes.
              </p>
            </div>
            <Link 
              href="/explorer"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-white shadow-md text-sm shrink-0 transition-all"
            >
              <span>Go to Algorithm Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
