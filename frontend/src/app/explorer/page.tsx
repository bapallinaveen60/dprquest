"use client";

import { useState } from "react";
import { 
  GitBranch, 
  ArrowRight,
  Info,
  Sparkles,
  Award
} from "lucide-react";

export default function ExplorerPage() {
  const [activeModule, setActiveModule] = useState<"PRE" | "VER" | "CSF" | "DSD" | "SRT" | "SLV">("PRE");

  // --- PRE State ---
  const [isPreCleaned, setIsPreCleaned] = useState(false);

  // --- VER State ---
  const [freezingLevel, setFreezingLevel] = useState(4.0); // km

  // --- CSF State ---
  const [csfStormType, setCsfStormType] = useState<"stratiform" | "convective">("stratiform");

  // --- DSD State ---
  const [dmSlider, setDmSlider] = useState(1.5); // mm
  const [nwSlider, setNwSlider] = useState(8000); // base value

  // --- SRT State ---
  const [srtRainState, setSrtRainState] = useState<"clear" | "rainy">("clear");

  // --- SLV State ---
  const [slvRainType, setSlvRainType] = useState<"light" | "heavy">("light");
  const [slvAlpha, setSlvAlpha] = useState(0.00025); // attenuation coeff
  const [slvGateIndex, setSlvGateIndex] = useState(0);

  const slvZmProfiles = {
    light: [20, 22, 23, 24, 24, 23, 22, 20],
    heavy: [35, 38, 39, 38, 36, 33, 29, 23]
  };

  const calcK = (ze: number, alpha: number) => alpha * Math.pow(10, ze * 0.08);

  const initialHistory = (rainType: "light" | "heavy", alpha: number) => {
    const profile = slvZmProfiles[rainType];
    const firstZm = profile[0];
    const firstK = calcK(firstZm, alpha);
    return [{
      gate: 0,
      height: 4.0,
      zm: firstZm,
      pia: 0,
      ze: firstZm,
      k: firstK
    }];
  };

  const [slvHistory, setSlvHistory] = useState(() => initialHistory("light", 0.00025));

  const resetSlv = (rainType: "light" | "heavy", alpha: number) => {
    setSlvGateIndex(0);
    setSlvHistory(initialHistory(rainType, alpha));
  };

  const stepNextGate = () => {
    if (slvGateIndex >= 7) return; // already at bottom gate
    const current = slvHistory[slvGateIndex];
    const deltaR = 0.25;
    const nextPia = current.pia + 2.0 * current.k * deltaR;
    const profile = slvZmProfiles[slvRainType];
    const nextZm = profile[slvGateIndex + 1];
    const nextZe = nextZm + nextPia;
    const nextK = calcK(nextZe, slvAlpha);

    const nextEntry = {
      gate: slvGateIndex + 1,
      height: 4.0 - (slvGateIndex + 1) * deltaR,
      zm: nextZm,
      pia: nextPia,
      ze: nextZe,
      k: nextK
    };

    setSlvHistory([...slvHistory, nextEntry]);
    setSlvGateIndex(slvGateIndex + 1);
  };

  const modules = [
    { id: "PRE", title: "PRE Module", desc: "Preparation & Noise Removal" },
    { id: "VER", title: "VER Module", desc: "Vertical Height Detection" },
    { id: "CSF", title: "CSF Module", desc: "Precipitation Classification" },
    { id: "DSD", title: "DSD Module", desc: "Drop Size Distribution" },
    { id: "SRT", title: "SRT Module", desc: "Surface Reference" },
    { id: "SLV", title: "SLV Module", desc: "Solver & Retrieval" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-gray-800 pb-4">
        <span className="text-xs text-blue-400 font-semibold tracking-widest uppercase font-mono">Level-2 Pipeline</span>
        <h1 className="text-2xl font-extrabold text-white">Interactive Algorithm Explorer</h1>
        <p className="text-gray-400 text-xs font-light leading-relaxed">
          Explore the sequential processing modules of the GPM Dual-frequency Precipitation Radar (DPR) Level-2 ground processing software.
        </p>
      </div>

      {/* Horizontal Pipeline Navigation Flowchart */}
      <section className="glass-panel p-4 rounded-xl border border-gray-800 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[760px] gap-2">
          {modules.map((m, idx) => (
            <div key={m.id} className="flex items-center flex-1">
              <button
                onClick={() => setActiveModule(m.id as any)}
                className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                  activeModule === m.id 
                    ? "bg-slate-800 text-white border-blue-500/50" 
                    : "bg-slate-900/60 border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <div className="text-[9px] font-bold font-mono tracking-widest uppercase mb-1">MODULE {idx + 1}</div>
                <div className="text-xs font-bold leading-none">{m.id}</div>
                <div className="text-[9px] text-gray-500 mt-1.5 font-light truncate">{m.desc}</div>
              </button>
              
              {idx < modules.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-700 mx-1 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Main Work Area */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Interactive Playground (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-gray-950/20">
            
            {/* --- PRE MODULE WORKSPACE --- */}
            {activeModule === "PRE" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-sm">PRE: Signal Preparation & Noise Removal</h3>
                  <button
                    onClick={() => setIsPreCleaned(!isPreCleaned)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                      isPreCleaned 
                        ? "bg-emerald-600 text-white" 
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isPreCleaned ? "Restore Raw Signal" : "Run PRE Cleaning Filters"}</span>
                  </button>
                </div>

                {/* Graphic Profile Column comparison */}
                <div className="h-80 relative flex">
                  {/* Y-Axis Label */}
                  <div className="w-12 h-full flex items-center justify-center relative select-none">
                    <span className="text-[9px] text-gray-500 font-mono rotate-270 whitespace-nowrap absolute">Altitude (km)</span>
                  </div>

                  {/* Y-Axis Ticks */}
                  <div className="w-10 h-full text-[8px] text-gray-500 font-mono flex flex-col justify-between py-2 border-r border-gray-800 select-none">
                    <span>22 km</span>
                    <span>16 km</span>
                    <span>11 km</span>
                    <span>5 km</span>
                    <span>0 km</span>
                  </div>

                  {/* Profile Plot Area */}
                  <div className="flex-1 relative h-full bg-slate-950/40 p-2 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="25" y1="0" x2="25" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="75" y1="0" x2="75" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="75" x2="100" y2="75" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      
                      {/* Raw Signal (with noise and clutter) */}
                      {!isPreCleaned && (
                        <>
                          {/* Noise speckles */}
                          <path d="M 12 5 L 8 10 L 15 15 L 10 20 L 13 25" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
                          <path d="M 9 35 L 14 40 L 7 45" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
                          {/* Ground Clutter spike at surface */}
                          <path d="M 0 92 L 48 95 L 45 98 L 5 100" fill="none" stroke="#ea580c" strokeWidth="2" />
                        </>
                      )}
                      
                      {/* Cleaned reflectivity profile (rain profile) */}
                      <path
                        d="M 0 25 L 18 35 L 20 50 L 38 60 L 25 75 L 23 90"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Clutter Limit boundary line */}
                      <line x1="0" y1="92" x2="100" y2="92" stroke="#ea580c" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                    </svg>

                    {/* Chart Labels */}
                    <div className="absolute bottom-1 right-2 bg-slate-900/80 px-2 py-0.5 rounded border border-gray-800 text-[8px] text-gray-400 font-mono">
                      X: Reflectivity (dBZ)
                    </div>
                  </div>
                </div>

                {/* X-Axis Ticks */}
                <div className="flex justify-between pl-24 pr-4 text-[8px] text-gray-500 font-mono select-none">
                  <span>10 dBZ</span>
                  <span>25 dBZ</span>
                  <span>40 dBZ</span>
                  <span>55 dBZ</span>
                </div>

                {/* Clutter Explanation details */}
                <div className="p-4 rounded-lg bg-slate-900 border border-gray-800 text-xs text-gray-400 leading-normal flex flex-col gap-2">
                  <span className="font-bold text-white">Algorithm Step Detail:</span>
                  {isPreCleaned ? (
                    <p>
                      <span className="text-emerald-400 font-bold">PRE CLEANING COMPLETED:</span> Background noise fluctuation 
                      (thermal receiver noise) is masked out. Ground clutter reflections (echo leakage from sidelobes hitting ground) 
                      are suppressed below the Clutter-Free Bottom Gate (CFB) boundary.
                    </p>
                  ) : (
                    <p>
                      Note the <span className="text-red-400 font-semibold">noise speckles</span> at high altitudes and the <span className="text-orange-500 font-semibold">ground clutter spike</span> at the surface (lowest 1.5 km). Ground clutter has huge reflectivity that completely masks the precipitation echo. Click the cleaning filters button above to remove them.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* --- VER MODULE WORKSPACE --- */}
            {activeModule === "VER" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-sm">VER: Storm Top & Freezing Height Detection</h3>
                  <span className="text-xs text-orange-400 font-mono">Freezing Level: {freezingLevel.toFixed(1)} km</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Vertical Slider Control */}
                  <div className="md:col-span-4 flex flex-col gap-4 p-4 rounded-lg bg-slate-900 border border-gray-800">
                    <span className="text-xs font-semibold text-gray-400">Drag Freezing Height</span>
                    <div className="flex items-center justify-center py-4">
                      <input 
                        type="range"
                        min="2.0"
                        max="5.5"
                        step="0.25"
                        value={freezingLevel}
                        onChange={(e) => setFreezingLevel(Number(e.target.value))}
                        className="h-40 w-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                        style={{ writingMode: "bt-lr", WebkitAppearance: "slider-vertical" } as any}
                      />
                    </div>
                    <div className="text-[9px] text-gray-500 font-mono text-center">
                      RANGE: 2.0 - 5.5 km
                    </div>
                  </div>

                  {/* Interactive profile display */}
                  <div className="md:col-span-8 h-80 border border-gray-800 bg-slate-950/40 rounded-lg relative overflow-hidden flex flex-col justify-between p-4">
                    {/* Visual Gates */}
                    <div className="absolute top-[10%] left-6 text-xs font-mono text-slate-400">Storm Top: 7.5 km</div>
                    
                    {/* Freezing isotherm line moving dynamically */}
                    <div 
                      className="absolute left-0 w-full border-t-2 border-orange-500/50 flex items-center justify-between px-6 z-10"
                      style={{ bottom: `${(freezingLevel / 7.5) * 80}%` }}
                    >
                      <span className="text-[9px] bg-slate-900 px-2 py-0.5 border border-gray-800 text-orange-400 font-mono">
                        0°C ISOTHERM (FREEZING LEVEL)
                      </span>
                      <span className="text-[9px] text-orange-400 font-mono">{freezingLevel.toFixed(2)} km</span>
                    </div>

                    {/* Snow Phase boundary */}
                    <div 
                      className="absolute left-0 w-full bg-slate-400/5 flex items-center justify-center"
                      style={{ 
                        top: "20%", 
                        bottom: `${(freezingLevel / 7.5) * 80}%` 
                      }}
                    >
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">DRY SNOW LAYER</span>
                    </div>

                    {/* Rain Phase boundary */}
                    <div 
                      className="absolute left-0 w-full bg-blue-500/5 border-t border-dashed border-gray-800/20 flex items-center justify-center"
                      style={{ 
                        bottom: 0, 
                        top: `${100 - (freezingLevel / 7.5) * 80}%` 
                      }}
                    >
                      <span className="text-[9px] text-blue-500/30 font-bold uppercase tracking-widest">LIQUID RAIN LAYER</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-normal p-3 rounded-lg bg-slate-900 border border-gray-800">
                  <span className="font-semibold text-white">Verification Steps:</span> VER detects storm top first (highest bin with echo strength &gt; 12 dBZ), then identifies the melting layer using reflectivity peaks (melting snowflakes coat in water, elevating dielectric constant).
                </p>
              </div>
            )}

            {/* --- CSF WORKSPACE --- */}
            {activeModule === "CSF" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-sm">CSF: Convective vs. Stratiform Classification</h3>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-gray-800 text-xs">
                    <button
                      onClick={() => setCsfStormType("stratiform")}
                      className={`px-3 py-1 rounded font-semibold transition-all ${
                        csfStormType === "stratiform" ? "bg-slate-800 text-white" : "text-gray-500"
                      }`}
                    >
                      Stratiform
                    </button>
                    <button
                      onClick={() => setCsfStormType("convective")}
                      className={`px-3 py-1 rounded font-semibold transition-all ${
                        csfStormType === "convective" ? "bg-slate-800 text-white" : "text-gray-500"
                      }`}
                    >
                      Convective
                    </button>
                  </div>
                </div>

                {/* Storm structure visualizer */}
                <div className="h-80 border border-gray-800 bg-slate-950/40 rounded-lg relative overflow-hidden p-6 flex flex-col justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">CSF Classification Result</span>
                    <span className={`text-md font-bold uppercase ${
                      csfStormType === "stratiform" ? "text-blue-400" : "text-orange-400"
                    }`}>
                      {csfStormType === "stratiform" ? "Stratiform (Layered Storm)" : "Convective (Violent Core)"}
                    </span>
                  </div>

                  {/* Render corresponding graphic */}
                  <div className="flex-1 flex items-end justify-center pb-2 relative">
                    {csfStormType === "stratiform" ? (
                      <div className="w-full flex flex-col items-center gap-2">
                        <div className="w-full h-8 bg-slate-800/20 border-y border-gray-800 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                          HORIZONTAL MELTING BAND (BRIGHT BAND DETECTED)
                        </div>
                        <div className="w-[80%] h-20 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-center text-[10px] text-blue-400">
                          Widespread Uniform Rainfall
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex justify-center gap-6 h-full items-end">
                        <div className="w-24 h-48 bg-gradient-to-t from-orange-500/10 to-transparent border-x border-t border-orange-500/20 rounded-t-lg flex flex-col items-center justify-center p-2 text-center">
                          <span className="text-[9px] text-orange-400 font-bold uppercase">Updraft Core</span>
                          <span className="text-[8px] text-gray-500 mt-1">No Bright Band</span>
                        </div>
                        <div className="w-32 h-60 bg-gradient-to-t from-orange-500/20 to-transparent border-x border-t border-orange-500/30 rounded-t-xl flex flex-col items-center justify-end pb-6 p-2 text-center">
                          <span className="text-xs text-orange-400 font-extrabold uppercase">STORM CORE</span>
                          <span className="text-[9px] text-gray-400 mt-1">High Reflectivity (&gt;39 dBZ)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-gray-500 italic font-mono leading-tight">
                    {csfStormType === "stratiform" 
                      ? "Algorithm: Scans vertical profiles for melting peaks. Horizontal bright bands indicate uniform stratiform layers."
                      : "Algorithm: V-method detects strong vertical reflectivity gradients and absence of bright bands to identify active convective cells."
                    }
                  </div>
                </div>
              </div>
            )}

            {/* --- DSD WORKSPACE --- */}
            {activeModule === "DSD" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-sm">DSD: Drop Size Distribution Parameters</h3>
                  <span className="text-xs text-blue-400 font-mono">Dm: {dmSlider.toFixed(2)} mm</span>
                </div>

                {/* Sliders */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-900 border border-gray-850">
                    <label className="text-xs font-semibold text-gray-400 flex justify-between">
                      <span>Mean Drop Size (Dm)</span>
                      <span className="text-blue-400">{dmSlider.toFixed(2)} mm</span>
                    </label>
                    <input 
                      type="range"
                      min="0.6"
                      max="3.5"
                      step="0.1"
                      value={dmSlider}
                      onChange={(e) => setDmSlider(Number(e.target.value))}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-900 border border-gray-850">
                    <label className="text-xs font-semibold text-gray-400 flex justify-between">
                      <span>Drop Concentration (Nw)</span>
                      <span className="text-blue-400">{nwSlider}</span>
                    </label>
                    <input 
                      type="range"
                      min="1000"
                      max="25000"
                      step="500"
                      value={nwSlider}
                      onChange={(e) => setNwSlider(Number(e.target.value))}
                      className="w-full h-1 bg-gray-850 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                  </div>
                </div>

                {/* Output Display Boxes */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded bg-slate-950 border border-gray-800 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Liquid Water Content</span>
                    <span className="text-sm font-bold text-white mt-1">
                      {(1e-6 * nwSlider * Math.pow(dmSlider, 3) * 0.52).toFixed(2)} g/m³
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-gray-800 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Rain Rate (R)</span>
                    <span className="text-sm font-bold text-blue-400 mt-1">
                      {(1.5e-6 * nwSlider * Math.pow(dmSlider, 3.5) * 0.52).toFixed(1)} mm/h
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-gray-800 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Reflectivity (Ze)</span>
                    <span className="text-sm font-bold text-orange-400 mt-1">
                      {(10 * Math.log10(Math.max(1e-18 * nwSlider * Math.pow(dmSlider, 6) * 1e12, 1e-10)) + 30).toFixed(1)} dBZ
                    </span>
                  </div>
                </div>

                {/* Drop display comparison */}
                <div className="h-24 rounded-lg border border-gray-800 bg-slate-950/20 flex items-center justify-center gap-4 p-4 relative overflow-hidden">
                  <span className="absolute top-2 left-2 text-[9px] text-gray-500 font-mono">RAIN DROP SIZE VISUALIZATION</span>
                  <div className="flex flex-wrap gap-2.5 items-center justify-center">
                    {Array.from({ length: Math.min(Math.floor(25000 / nwSlider * 4), 20) }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className="bg-blue-500/30 rounded-full border border-blue-400/50"
                        style={{ 
                          width: `${dmSlider * 8}px`,
                          height: `${dmSlider * 8}px`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- SRT WORKSPACE --- */}
            {activeModule === "SRT" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-sm">SRT: Surface Reference Technique</h3>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-gray-805 text-xs">
                    <button
                      onClick={() => setSrtRainState("clear")}
                      className={`px-3 py-1 rounded font-semibold transition-all ${
                        srtRainState === "clear" ? "bg-slate-800 text-white" : "text-gray-500"
                      }`}
                    >
                      Clear Air
                    </button>
                    <button
                      onClick={() => setSrtRainState("rainy")}
                      className={`px-3 py-1 rounded font-semibold transition-all ${
                        srtRainState === "rainy" ? "bg-slate-800 text-white" : "text-gray-500"
                      }`}
                    >
                      Rainy
                    </button>
                  </div>
                </div>

                {/* SRT signal comparison graph */}
                <div className="h-80 border border-gray-800 bg-slate-950/40 rounded-lg relative overflow-hidden p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Surface Backscatter (Sigma-0)</span>
                      <span className="text-md font-bold text-white">
                        {srtRainState === "clear" ? "-10.0 dB (Reference)" : "-18.5 dB (Attenuated)"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 border border-gray-800 rounded-lg flex flex-col items-center">
                      <span className="text-[9px] text-gray-500 uppercase font-mono">Calculated PIA</span>
                      <span className="text-sm font-extrabold text-orange-400 mt-0.5">
                        {srtRainState === "clear" ? "0.0 dB" : "8.5 dB"}
                      </span>
                    </div>
                  </div>

                  {/* Radar beam hit ocean drawing */}
                  <div className="flex-1 flex justify-center items-end relative pb-4">
                    <div className="absolute bottom-4 left-0 w-full h-1 bg-blue-500/20"></div>

                    <div className="flex flex-col items-center gap-1">
                      {/* Beam incoming */}
                      <div 
                        className={`w-1 h-32 rounded-t-full transition-all duration-500 ${
                          srtRainState === "clear" ? "bg-blue-500/40" : "bg-blue-900/10"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 leading-normal italic font-mono">
                    {srtRainState === "clear"
                      ? "Reference: Cleared path gives maximum Sigma-0 returned signal."
                      : "Attenuated: Rain column absorbs power, decreasing the surface reflection by 8.5 dB (Column PIA)."
                    }
                  </div>
                </div>
              </div>
            )}

            {/* --- SLV WORKSPACE (Interactive Gate Solver) --- */}
            {activeModule === "SLV" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-3 gap-3">
                  <h3 className="font-bold text-white text-sm">SLV: Step-by-Step Gate Solver</h3>
                  
                  {/* Select rain type profile */}
                  <div className="flex bg-slate-900 p-1 rounded border border-gray-800 text-[10px]">
                    <button
                      onClick={() => {
                        setSlvRainType("light");
                        resetSlv("light", slvAlpha);
                      }}
                      className={`px-2 py-1 rounded font-semibold transition-all ${
                        slvRainType === "light" ? "bg-slate-800 text-white" : "text-gray-500"
                      }`}
                    >
                      Light Rain Profile
                    </button>
                    <button
                      onClick={() => {
                        setSlvRainType("heavy");
                        resetSlv("heavy", slvAlpha);
                      }}
                      className={`px-2 py-1 rounded font-semibold transition-all ${
                        slvRainType === "heavy" ? "bg-slate-800 text-white" : "text-gray-500"
                      }`}
                    >
                      Heavy Rain Profile
                    </button>
                  </div>
                </div>

                {/* Alpha coefficient slider */}
                <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-900 border border-gray-800">
                  <label className="text-[10px] font-mono font-bold text-gray-400 flex justify-between">
                    <span>Attenuation scaling factor (Alpha / α):</span>
                    <span className="text-orange-400">{slvAlpha.toFixed(5)}</span>
                  </label>
                  <input
                    type="range" min="0.0001" max="0.0008" step="0.00005" value={slvAlpha}
                    onChange={(e) => {
                      const newAlpha = Number(e.target.value);
                      setSlvAlpha(newAlpha);
                      resetSlv(slvRainType, newAlpha);
                    }}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-405"
                  />
                  <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                    <span>Low Attenuation</span>
                    <span>High Attenuation (Risk of Divergence)</span>
                  </div>
                </div>

                {/* Interactive Grid Columns */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Vertical Gates Stack (7 cols) */}
                  <div className="md:col-span-7 flex flex-col gap-2">
                    <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest pl-1">Storm Profile Gates (Storm Top to Surface)</span>
                    
                    <div className="flex flex-col gap-1 bg-slate-950/60 p-2 rounded-lg border border-gray-900">
                      {slvZmProfiles[slvRainType].map((zmVal, idx) => {
                        const isSolved = idx <= slvGateIndex;
                        const isActive = idx === slvGateIndex;
                        const historyEntry = slvHistory.find(h => h.gate === idx);
                        
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded border text-xs transition-all ${
                              isActive 
                                ? "bg-slate-800 border-yellow-500/80 shadow-inner" 
                                : isSolved 
                                  ? "bg-slate-900/60 border-blue-900/40 text-blue-300"
                                  : "bg-slate-950/40 border-gray-900 text-gray-600 opacity-40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                isActive ? "bg-yellow-500 text-slate-950" : isSolved ? "bg-blue-900/40 text-blue-300" : "bg-gray-900 text-gray-700"
                              }`}>
                                {idx + 1}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-semibold">Gate {idx + 1}</span>
                                <span className="text-[8px] text-gray-500 font-mono">Alt: {(4.0 - idx * 0.25).toFixed(2)} km</span>
                              </div>
                            </div>

                            <div className="flex gap-4 font-mono text-[9px] text-right">
                              <div className="flex flex-col">
                                <span className="text-[7px] text-gray-500">MEASURED Zm</span>
                                <span className="font-bold text-white">{zmVal} dBZ</span>
                              </div>
                              {historyEntry && (
                                <>
                                  <div className="flex flex-col">
                                    <span className="text-[7px] text-gray-500">CORRECTED Ze</span>
                                    <span className="font-bold text-orange-400">{historyEntry.ze.toFixed(1)} dBZ</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[7px] text-gray-500">ATTEN (k)</span>
                                    <span className="font-bold text-blue-400">{historyEntry.k.toFixed(3)} dB/km</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Step Controls & Math Display (5 cols) */}
                  <div className="md:col-span-5 flex flex-col gap-4">
                    
                    {/* Stepping controls */}
                    <div className="flex gap-2">
                      <button
                        onClick={stepNextGate}
                        disabled={slvGateIndex >= 7}
                        className="flex-1 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md"
                      >
                        Step Next Gate
                      </button>
                      <button
                        onClick={() => resetSlv(slvRainType, slvAlpha)}
                        className="py-2.5 px-3 rounded-lg bg-slate-900 border border-gray-800 text-xs font-bold text-gray-400 hover:text-white"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Math Dashboard */}
                    {(() => {
                      const active = slvHistory[slvGateIndex];
                      if (!active) return null;
                      
                      const isDiverging = active.ze > 52.0 && slvRainType === "heavy";

                      return (
                        <div className="glass-panel p-4 rounded-xl border border-gray-850 bg-slate-950/40 flex flex-col gap-3">
                          <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider border-b border-gray-850 pb-1.5">Active Gate Calculations</span>
                          
                          <div className="flex flex-col gap-2 text-[10px] font-mono text-gray-300">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Measured Zm:</span>
                              <span className="text-white font-bold">{active.zm.toFixed(1)} dBZ</span>
                            </div>
                            
                            <div className="flex justify-between border-t border-gray-900 pt-1.5">
                              <span className="text-gray-500">Accumulated PIA:</span>
                              <span className="text-blue-400 font-bold">+{active.pia.toFixed(2)} dB</span>
                            </div>

                            <div className="flex justify-between border-t border-gray-900 pt-1.5">
                              <span className="text-gray-500">Corrected Ze (Zm + PIA):</span>
                              <span className="text-orange-400 font-extrabold">{active.ze.toFixed(1)} dBZ</span>
                            </div>

                            <div className="flex justify-between border-t border-gray-900 pt-1.5">
                              <span className="text-gray-500">Attenuation Rate (k):</span>
                              <span className="text-blue-400 font-bold">{active.k.toFixed(4)} dB/km</span>
                            </div>
                          </div>

                          {/* Divergence warning or column success */}
                          {slvGateIndex === 7 ? (
                            isDiverging ? (
                              <div className="p-2.5 rounded bg-red-950/20 border border-red-800/30 text-red-400 text-[9px] leading-normal font-mono flex gap-1.5 mt-2 animate-pulse">
                                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>
                                  <strong>⚠️ SOLVER DIVERGENCE!</strong> Correcting heavy attenuation without a boundary constraint created a runaway positive feedback loop. Corrected reflectivity has blown up!
                                </span>
                              </div>
                            ) : (
                              <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-[9px] leading-normal font-mono flex gap-1.5 mt-2">
                                <Award className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>
                                  <strong>✅ COLUMN SOLVED CLEANLY.</strong> Attenuation correction converged safely. Retrieved rain profile is stable!
                                </span>
                              </div>
                            )
                          ) : null}
                        </div>
                      );
                    })()}

                  </div>
                </div>

                <div className="text-[10px] text-gray-500 leading-normal italic font-mono p-3 bg-slate-900 border border-gray-850 rounded-lg">
                  Algorithm Rule: The Hitschfeld-Bordan profile solver integrates downward gate-by-gate. Ze(i) at each step is calculated from the measured reflectivity Zm(i) plus the cumulative path attenuation (PIA) solved from the gates above.
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Educational Guide & Step-by-Step Algorithm (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-gray-900/40 flex flex-col gap-4">
            
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <GitBranch className="w-4.5 h-4.5 text-blue-400" />
              <span className="font-bold text-white text-sm">Pipeline Step Breakdown</span>
            </div>

            {/* PRE module educational text */}
            {activeModule === "PRE" && (
              <div className="flex flex-col gap-4 text-xs text-gray-300 font-light leading-relaxed">
                <p className="font-bold text-white text-xs">Module Objective:</p>
                <p>
                  Prepare Level-1 raw echo profiles for retrieval by isolating actual physical precipitation from background instrumental noise and earth boundary backscatter.
                </p>
                
                <div className="flex flex-col gap-2 p-3.5 bg-slate-950 border border-gray-850 rounded-lg text-[10px] font-mono text-gray-400">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">Step-by-Step Logic:</span>
                  <ol className="list-decimal pl-4 flex flex-col gap-2">
                    <li>
                      <strong className="text-white">Noise Estimator:</strong> Calculates the system temperature to define the minimum detectable threshold {"($T_{\\text{noise}} \\approx -99\\text{ dBm}$)"}.
                    </li>
                    <li>
                      <strong className="text-white">Boundary Detection:</strong> Locates range bins containing ocean or land returns by checking the range gate distance matching the surface elevation database.
                    </li>
                    <li>
                      <strong className="text-white">Sidelobe Clutter Mask:</strong> Flags the lowest 1.5 km gates where ground reflectivity leaks into off-nadir angle bins.
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* VER module educational text */}
            {activeModule === "VER" && (
              <div className="flex flex-col gap-4 text-xs text-gray-300 font-light leading-relaxed">
                <p className="font-bold text-white text-xs">Module Objective:</p>
                <p>
                  Identify crucial vertical temperature altitudes, melting layer boundaries, and storm bounds.
                </p>
                
                <div className="flex flex-col gap-2 p-3.5 bg-slate-950 border border-gray-850 rounded-lg text-[10px] font-mono text-gray-400">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">Step-by-Step Logic:</span>
                  <ol className="list-decimal pl-4 flex flex-col gap-2">
                    <li>
                      <strong className="text-white">Storm Top Search:</strong> Scanning from the space gate downwards, identifies the first gate where reflectivity exceeds 12 dBZ for three consecutive bins.
                    </li>
                    <li>
                      <strong className="text-white">0°C Boundary:</strong> Estimates the height of the freezing level (0°C isotherm) from ancillary meteorological forecast models (e.g. GANAL / GEOS).
                    </li>
                    <li>
                      <strong className="text-white">Bright Band Profiling:</strong> Scans within $\pm 1$ km of the estimated 0°C height for a local maximum in Ku reflectivity. If a clear peak is found, the bin is marked as the center of the melting layer.
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* CSF module educational text */}
            {activeModule === "CSF" && (
              <div className="flex flex-col gap-4 text-xs text-gray-300 font-light leading-relaxed">
                <p className="font-bold text-white text-xs">Module Objective:</p>
                <p>
                  Classify the rain column type to guide physical assumptions about drop sizes and vertical dynamics.
                </p>
                
                <div className="flex flex-col gap-2 p-3.5 bg-slate-950 border border-gray-850 rounded-lg text-[10px] font-mono text-gray-400">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">Step-by-Step Logic:</span>
                  <ol className="list-decimal pl-4 flex flex-col gap-2">
                    <li>
                      <strong className="text-white">V-Method:</strong> Searches for a bright band signature. If found, the pixel is classified as **Stratiform**.
                    </li>
                    <li>
                      <strong className="text-white">H-Method:</strong> Compares the horizontal reflectivity texture of a pixel to its neighbors. If a pixel has a local surface reflectivity that exceeds its neighbors by &gt; 10 dBZ, it is classified as **Convective**.
                    </li>
                    <li>
                      <strong className="text-white">Parameter Selection:</strong> Assigns appropriate scattering density models (stratiform has narrow, small drops; convective has larger cores).
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* DSD module educational text */}
            {activeModule === "DSD" && (
              <div className="flex flex-col gap-4 text-xs text-gray-300 font-light leading-relaxed">
                <p className="font-bold text-white text-xs">Module Objective:</p>
                <p>
                  Resolve the Drop Size Distribution (DSD) parameters at each gate along the beam.
                </p>
                
                <div className="flex flex-col gap-2 p-3.5 bg-slate-950 border border-gray-850 rounded-lg text-[10px] font-mono text-gray-400">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">Step-by-Step Logic:</span>
                  <ol className="list-decimal pl-4 flex flex-col gap-2">
                    <li>
                      <strong className="text-white">Gamma DSD Model:</strong> Rain drop concentrations $N(D)$ are represented by:
                      <div className="py-1.5 text-center font-serif text-blue-400 text-xs">
                        {"$$N(D) = N_w \\cdot f(\\mu) (D/D_m)^\\mu e^{-\\Lambda D}$$"}
                      </div>
                    </li>
                    <li>
                      <strong className="text-white">Dual-Frequency Solver:</strong> For matched swaths, compares Ku and Ka reflectivity. The difference (DFR) is matched against scattering lookup tables to solve for mass-weighted mean diameter ($D_m$).
                    </li>
                    <li>
                      <strong className="text-white">Concentration Calculation:</strong> Once $D_m$ is determined, the solver calculates the intercept parameter $N_w$ from the absolute reflectivity value at Ku-band.
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* SRT module educational text */}
            {activeModule === "SRT" && (
              <div className="flex flex-col gap-4 text-xs text-gray-300 font-light leading-relaxed">
                <p className="font-bold text-white text-xs">Module Objective:</p>
                <p>
                  Establish a boundary constraint for total column attenuation.
                </p>
                
                <div className="flex flex-col gap-2 p-3.5 bg-slate-950 border border-gray-850 rounded-lg text-[10px] font-mono text-gray-400">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">Step-by-Step Logic:</span>
                  <ol className="list-decimal pl-4 flex flex-col gap-2">
                    <li>
                      <strong className="text-white">Reference database:</strong> Retrieves the mean sea/land backscatter {"($\\sigma_{0, \\text{ref}}$)"} for the current geographic coordinate under clear skies.
                    </li>
                    <li>
                      <strong className="text-white">Attenuated echo:</strong> Measures the surface backscatter {"($\\sigma_{0, \\text{meas}}$)"} in the precipitation beam.
                    </li>
                    <li>
                      <strong className="text-white">PIA Solver:</strong> Computes path attenuation:
                      <div className="py-1.5 text-center font-serif text-blue-400 text-xs">
                        {"$$\\text{PIA}_{\\text{SRT}} = \\sigma_{0, \\text{ref}} - \\sigma_{0, \\text{meas}}$$"}
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* SLV module educational text */}
            {activeModule === "SLV" && (
              <div className="flex flex-col gap-4 text-xs text-gray-300 font-light leading-relaxed">
                <p className="font-bold text-white text-xs">Module Objective:</p>
                <p>
                  Perform profiling and output physical rain rate $R(r)$ profiles.
                </p>
                
                <div className="flex flex-col gap-2 p-3.5 bg-slate-950 border border-gray-850 rounded-lg text-[10px] font-mono text-gray-400">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">Step-by-Step Logic:</span>
                  <ol className="list-decimal pl-4 flex flex-col gap-2">
                    <li>
                      <strong className="text-white">Profiling (Hitschfeld-Bordan):</strong> Integrates downward from the storm top, calculating specific attenuation $k(r) = \alpha Z_e(r)^\beta$ and correcting measured reflectivity gate-by-gate:
                      <div className="py-1.5 text-center font-serif text-blue-400 text-xs">
                        {"$$Z_e(r) = Z_m(r) + 2 \\int_0^r k(s) ds$$"}
                      </div>
                    </li>
                    <li>
                      <strong className="text-white">SRT Constraint:</strong> If the integrated attenuation diverges, scales {"$\\alpha$"} to match the independent column {"$\\text{PIA}_{\\text{SRT}}$"} boundary estimate.
                    </li>
                    <li>
                      <strong className="text-white">R-Retrieval:</strong> Converts corrected $Z_e(r)$ to rain rate:
                      <div className="py-1.5 text-center font-serif text-blue-400 text-xs">
                        {"$$R = \\int v(D) \\left(\\frac{\\pi D^3}{6}\\right) N(D) dD$$"}
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            )}

          </div>

          {/* Quick learning card */}
          <div className="p-4 rounded-xl glass-panel border border-gray-800 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Test your knowledge</span>
              <span className="text-xs font-bold text-white">Quiz Level 2: Reflectivity Basics</span>
            </div>
            <button className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold text-white transition-all">
              Start Quiz
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
