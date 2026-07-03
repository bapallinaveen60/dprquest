"use client";

import { useState, useEffect } from "react";
import { 
  GitBranch, 
  ArrowRight,
  Info,
  Sparkles,
  Award,
  HelpCircle as QuestionIcon,
  CheckCircle,
  XCircle,
  GraduationCap
} from "lucide-react";

export default function ExplorerPage() {
  const [activeModule, setActiveModule] = useState<"PRE" | "VER" | "CSF" | "DSD" | "SRT" | "SLV">("PRE");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  // Sync learning level
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("gpm_learning_level") || "beginner";
      setLevel(saved as any);
    };
    handleStorageChange();
    window.addEventListener("storage_learning_level", handleStorageChange);
    return () => window.removeEventListener("storage_learning_level", handleStorageChange);
  }, []);

  // --- PRE State ---
  const [isPreCleaned, setIsPreCleaned] = useState(false);
  const [cPrePred, setCPrePred] = useState<number | null>(null);
  const [cPreChecked, setCPreChecked] = useState(false);
  const [cPreCorrect, setCPreCorrect] = useState(false);

  // --- VER State ---
  const [freezingLevel, setFreezingLevel] = useState(4.0); // km
  const [cVerPred, setCVerPred] = useState<number | null>(null);
  const [cVerChecked, setCVerChecked] = useState(false);
  const [cVerCorrect, setCVerCorrect] = useState(false);

  // --- CSF State ---
  const [csfStormType, setCsfStormType] = useState<"stratiform" | "convective">("stratiform");
  const [cCsfPred, setCCsfPred] = useState<number | null>(null);
  const [cCsfChecked, setCCsfChecked] = useState(false);
  const [cCsfCorrect, setCCsfCorrect] = useState(false);

  // --- DSD State ---
  const [dmSlider, setDmSlider] = useState(1.5); // mm
  const [nwSlider, setNwSlider] = useState(8000); // base value
  const [cDsdPred, setCDsdPred] = useState<number | null>(null);
  const [cDsdChecked, setCDsdChecked] = useState(false);
  const [cDsdCorrect, setCDsdCorrect] = useState(false);

  // --- SRT State ---
  const [srtRainState, setSrtRainState] = useState<"clear" | "rainy">("clear");
  const [cSrtPred, setCSrtPred] = useState<number | null>(null);
  const [cSrtChecked, setCSrtChecked] = useState(false);
  const [cSrtCorrect, setCSrtCorrect] = useState(false);

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
    { id: "PRE", title: "PRE Module", desc: "Noise & Clutter Clues" },
    { id: "VER", title: "VER Module", desc: "Melting Height Peak" },
    { id: "CSF", title: "CSF Module", desc: "Rain Type Detective" },
    { id: "DSD", title: "DSD Module", desc: "Drop Count Paradox" },
    { id: "SRT", title: "SRT Module", desc: "Ocean Mirror Clue" },
    { id: "SLV", title: "SLV Module", desc: "The Runaway Solver" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-gray-800 pb-4">
        <span className="text-xs text-orange-400 font-semibold tracking-widest uppercase font-mono flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4" />
          <span>Active Discovery Workspace ({level} level)</span>
        </span>
        <h1 className="text-2xl font-extrabold text-white">Interactive Pipeline Puzzles</h1>
        <p className="text-gray-400 text-xs font-light leading-relaxed">
          Step through the radar retrieval stages. Observe phenomena, make predictions, and discover the mathematical rules that govern weather satellites.
        </p>
      </div>

      {/* Horizontal Navigation Flowchart */}
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
                <div className="text-[9px] font-bold font-mono tracking-widest uppercase mb-1">PUZZLE {idx + 1}</div>
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
        
        {/* Left Side: Playground & Experiments (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-gray-950/20">
            
            {/* --- PRE MODULE --- */}
            {activeModule === "PRE" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-sm">PRE: The Ground Echo Illusion</h3>
                  <button
                    onClick={() => setIsPreCleaned(!isPreCleaned)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                      isPreCleaned ? "bg-emerald-600 text-white" : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isPreCleaned ? "Restore Raw Signal" : "Apply PRE Filters"}</span>
                  </button>
                </div>

                <div className="h-80 relative flex">
                  <div className="w-12 h-full flex items-center justify-center relative select-none">
                    <span className="text-[9px] text-gray-500 font-mono rotate-270 whitespace-nowrap absolute">Altitude (km)</span>
                  </div>
                  <div className="w-10 h-full text-[8px] text-gray-500 font-mono flex flex-col justify-between py-2 border-r border-gray-800 select-none">
                    <span>22 km</span>
                    <span>16 km</span>
                    <span>11 km</span>
                    <span>5 km</span>
                    <span>0 km</span>
                  </div>

                  <div className="flex-1 relative h-full bg-slate-950/40 p-2 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="25" y1="0" x2="25" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="75" y1="0" x2="75" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="75" x2="100" y2="75" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      
                      {!isPreCleaned && (
                        <>
                          <path d="M 12 5 L 8 10 L 15 15 L 10 20 L 13 25" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
                          <path d="M 9 35 L 14 40 L 7 45" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
                          <path d="M 0 92 L 48 95 L 45 98 L 5 100" fill="none" stroke="#ea580c" strokeWidth="2" />
                        </>
                      )}
                      
                      <path d="M 0 25 L 18 35 L 20 50 L 38 60 L 25 75 L 23 90" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                      <line x1="0" y1="92" x2="100" y2="92" stroke="#ea580c" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                    </svg>
                    <div className="absolute bottom-1 right-2 bg-slate-900/80 px-2 py-0.5 rounded border border-gray-800 text-[8px] text-gray-400 font-mono">
                      X: Reflectivity (dBZ)
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pl-24 pr-4 text-[8px] text-gray-500 font-mono select-none">
                  <span>10 dBZ</span>
                  <span>25 dBZ</span>
                  <span>40 dBZ</span>
                  <span>55 dBZ</span>
                </div>
              </div>
            )}

            {/* --- VER MODULE --- */}
            {activeModule === "VER" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-sm">VER: Freezing Height Peak</h3>
                  <span className="text-xs text-orange-400 font-mono">Slider Altitude: {freezingLevel.toFixed(1)} km</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 flex flex-col gap-4 p-4 rounded-lg bg-slate-900 border border-gray-800">
                    <span className="text-xs font-semibold text-gray-400">Drag Freezing Isotherm</span>
                    <div className="flex items-center justify-center py-4">
                      <input 
                        type="range" min="2.0" max="5.5" step="0.25" value={freezingLevel}
                        onChange={(e) => setFreezingLevel(Number(e.target.value))}
                        className="h-40 w-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                        style={{ writingMode: "bt-lr", WebkitAppearance: "slider-vertical" } as any}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-8 h-80 border border-gray-800 bg-slate-950/40 rounded-lg relative overflow-hidden flex flex-col justify-between p-4">
                    <div 
                      className="absolute left-0 w-full border-t-2 border-orange-500/50 flex items-center justify-between px-6 z-10"
                      style={{ bottom: `${(freezingLevel / 7.5) * 80}%` }}
                    >
                      <span className="text-[9px] bg-slate-900 px-2 py-0.5 border border-gray-800 text-orange-400 font-mono">
                        0°C MELTING LEVEL
                      </span>
                    </div>

                    <div className="absolute left-0 w-full bg-slate-400/5 flex items-center justify-center" style={{ top: "20%", bottom: `${(freezingLevel / 7.5) * 80}%` }}>
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">DRY SNOW (ICE)</span>
                    </div>

                    <div className="absolute left-0 w-full bg-blue-500/5 flex items-center justify-center" style={{ bottom: 0, top: `${100 - (freezingLevel / 7.5) * 80}%` }}>
                      <span className="text-[9px] text-blue-500/30 font-bold uppercase tracking-widest">LIQUID RAIN</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- CSF MODULE --- */}
            {activeModule === "CSF" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-sm">CSF: Precipitation Detective</h3>
                  <div className="flex bg-slate-900 p-1 rounded border border-gray-800 text-xs">
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

                <div className="h-80 border border-gray-800 bg-slate-950/40 rounded-lg relative overflow-hidden p-6 flex flex-col justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Classification Result</span>
                    <span className={`text-md font-bold uppercase ${
                      csfStormType === "stratiform" ? "text-blue-400" : "text-orange-400"
                    }`}>
                      {csfStormType === "stratiform" ? "Stratiform (Horizontal layers)" : "Convective (Updraft cores)"}
                    </span>
                  </div>

                  <div className="flex-1 flex items-end justify-center pb-2 relative">
                    {csfStormType === "stratiform" ? (
                      <div className="w-full flex flex-col items-center gap-2">
                        <div className="w-full h-8 bg-slate-800/20 border-y border-gray-800 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                          HORIZONTAL BRIGHT BAND MELTING LAYER DETECTED
                        </div>
                        <div className="w-[80%] h-20 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-center text-[10px] text-blue-400">
                          Layered uniform rain
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex justify-center gap-6 h-full items-end">
                        <div className="w-32 h-60 bg-gradient-to-t from-orange-500/20 to-transparent border-x border-t border-orange-500/30 rounded-t-xl flex flex-col items-center justify-end pb-6 p-2 text-center">
                          <span className="text-xs text-orange-400 font-extrabold uppercase font-mono">STRONG CORE</span>
                          <span className="text-[9px] text-gray-450 mt-1">High Reflectivity (&gt;39 dBZ) extending high</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- DSD MODULE --- */}
            {activeModule === "DSD" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-sm">DSD: Drop Count Paradox</h3>
                  <span className="text-xs text-blue-400 font-mono">Dm: {dmSlider.toFixed(2)} mm</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 p-3 rounded bg-slate-905 border border-gray-850">
                    <label className="text-xs font-semibold text-gray-400 flex justify-between">
                      <span>Drop Diameter (Dm):</span>
                      <span className="text-blue-400">{dmSlider.toFixed(2)} mm</span>
                    </label>
                    <input 
                      type="range" min="0.6" max="3.5" step="0.1" value={dmSlider}
                      onChange={(e) => setDmSlider(Number(e.target.value))}
                      className="w-full h-1 bg-gray-850 rounded-lg appearance-none cursor-pointer accent-blue-450"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 p-3 rounded bg-slate-905 border border-gray-850">
                    <label className="text-xs font-semibold text-gray-400 flex justify-between">
                      <span>Concentration (Nw):</span>
                      <span className="text-blue-400">{nwSlider}</span>
                    </label>
                    <input 
                      type="range" min="1000" max="25000" step="500" value={nwSlider}
                      onChange={(e) => setNwSlider(Number(e.target.value))}
                      className="w-full h-1 bg-gray-850 rounded-lg appearance-none cursor-pointer accent-blue-450"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 font-mono">
                  <div className="p-3 rounded bg-slate-950 border border-gray-900 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">LWC (Water Mass)</span>
                    <span className="text-sm font-bold text-white mt-1">
                      {(1e-6 * nwSlider * Math.pow(dmSlider, 3) * 0.52).toFixed(2)} g/m³
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-gray-900 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest text-blue-400 font-semibold">Reflectivity (Ze)</span>
                    <span className="text-sm font-bold text-orange-400 mt-1">
                      {(10 * Math.log10(Math.max(1e-18 * nwSlider * Math.pow(dmSlider, 6) * 1e12, 1e-10)) + 30).toFixed(1)} dBZ
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-gray-900 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">Rain Rate (R)</span>
                    <span className="text-sm font-bold text-blue-400 mt-1">
                      {(1.5e-6 * nwSlider * Math.pow(dmSlider, 3.5) * 0.52).toFixed(1)} mm/h
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* --- SRT MODULE --- */}
            {activeModule === "SRT" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-sm">SRT: Ocean Mirror Clue</h3>
                  <div className="flex bg-slate-900 p-1 rounded border border-gray-800 text-xs">
                    <button
                      onClick={() => setSrtRainState("clear")}
                      className={`px-3 py-1 rounded font-semibold transition-all ${
                        srtRainState === "clear" ? "bg-slate-800 text-white" : "text-gray-505"
                      }`}
                    >
                      Clear Air Path
                    </button>
                    <button
                      onClick={() => setSrtRainState("rainy")}
                      className={`px-3 py-1 rounded font-semibold transition-all ${
                        srtRainState === "rainy" ? "bg-slate-800 text-white" : "text-gray-505"
                      }`}
                    >
                      Rainy Path
                    </button>
                  </div>
                </div>

                <div className="h-80 border border-gray-800 bg-slate-950/40 rounded-lg relative overflow-hidden p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Surface Backscatter (Sigma-0)</span>
                      <span className="text-md font-bold text-white">
                        {srtRainState === "clear" ? "-10.0 dB (Max Return)" : "-18.5 dB (Weak Return)"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 border border-gray-800 rounded-lg flex flex-col items-center">
                      <span className="text-[9px] text-gray-500 uppercase font-mono">Calculated attenuation</span>
                      <span className="text-sm font-extrabold text-orange-405 mt-0.5">
                        {srtRainState === "clear" ? "0.0 dB" : "8.5 dB"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex justify-center items-end relative pb-4">
                    <div className="absolute bottom-4 left-0 w-full h-1 bg-blue-500/20"></div>
                    <div className={`w-1 h-32 rounded-t-full transition-all duration-500 ${
                      srtRainState === "clear" ? "bg-blue-500/40" : "bg-blue-900/10"
                    }`} />
                  </div>
                </div>
              </div>
            )}

            {/* --- SLV MODULE --- */}
            {activeModule === "SLV" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-3 gap-3">
                  <h3 className="font-bold text-white text-sm">SLV: Runaway Solver</h3>
                  
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
                    <span>Stable Correction</span>
                    <span>Runaway Risk (Try Heavy Rain + High α)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-7 flex flex-col gap-2">
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
                                ? "bg-slate-800 border-yellow-500/80" 
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

                  <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="flex gap-2">
                      <button
                        onClick={stepNextGate} disabled={slvGateIndex >= 7}
                        className="flex-1 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md"
                      >
                        Step Next Gate
                      </button>
                      <button
                        onClick={() => resetSlv(slvRainType, slvAlpha)}
                        className="py-2.5 px-3 rounded-lg bg-slate-900 border border-gray-800 text-xs font-bold text-gray-450 hover:text-white"
                      >
                        Reset
                      </button>
                    </div>

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
                              <span className="text-gray-500">Corrected Ze:</span>
                              <span className="text-orange-400 font-extrabold">{active.ze.toFixed(1)} dBZ</span>
                            </div>

                            <div className="flex justify-between border-t border-gray-900 pt-1.5">
                              <span className="text-gray-500">Atten Rate (k):</span>
                              <span className="text-blue-400 font-bold">{active.k.toFixed(4)} dB/km</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Predict & Discover Challenge Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* PRE Puzzle Challenge Card */}
          {activeModule === "PRE" && (
            <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Predict & Verify</span>
              </div>
              
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Look at the raw profile. A massive reflectivity spike (&gt;50 dBZ) appears in the lowest 1.5 km near the surface. What is causing this?
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  "A layer of super-heavy tropical rain sitting directly on the surface.",
                  "Ground Clutter—leakage from the radar main beam striking the solid ocean or land surface.",
                  "Thermal noise fluctuations in the satellite receiver."
                ].map((opt, idx) => (
                  <button
                    key={idx} onClick={() => { if (!cPreChecked) setCPrePred(idx); }} disabled={cPreChecked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      cPreChecked 
                        ? idx === 1 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : cPrePred === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-950 border-gray-900 text-gray-600 opacity-60"
                        : cPrePred === idx 
                          ? "bg-blue-900/10 border-blue-500/40 text-blue-400 font-semibold"
                          : "bg-slate-900/40 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!cPreChecked ? (
                <button
                  onClick={() => {
                    setCPreChecked(true);
                    if (cPrePred === 1) setCPreCorrect(true);
                  }}
                  disabled={cPrePred === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Verify Prediction
                </button>
              ) : (
                <div className="p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400 leading-normal font-light">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {cPreCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Correct Discovery!</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Incorrect</span>
                    )}
                  </div>
                  
                  {level === "beginner" && (
                    <p>
                      <strong>The Principle:</strong> The ground is a massive reflector. Radar signals hitting it swamp our receivers, making it impossible to see rain directly at the surface. We must slice this clutter zone out (Clutter-Free Bottom Gate).
                    </p>
                  )}
                  {level === "intermediate" && (
                    <p>
                      <strong>Explanation:</strong> Radar mainlobe and sidelobe interactions with the Earth boundary produce high returns. The filter locates the Clutter-Free Bottom Gate (CFB) and discards returns below this altitude.
                    </p>
                  )}
                  {level === "advanced" && (
                    <div className="flex flex-col gap-1">
                      <p>
                        <strong>Formalization:</strong> PRE filters out mainlobe surface clutter and flags gates using the GPM variable `clutterFreeBottomBin`. Any echo below this gate is flagged as contaminated.
                      </p>
                      <span className="text-[9px] font-mono text-gray-500">Variables: `clutterFreeBottomBin`, `zFactorMeasured`.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VER Puzzle Challenge Card */}
          {activeModule === "VER" && (
            <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Predict & Verify</span>
              </div>
              
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Why does the radar echo show a localized, very strong reflectivity peak (Bright Band) exactly at the melting boundary?
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  "Melting snowflakes collapse into massive ice blocks that reflect more.",
                  "Snowflakes melt from outside in, creating a water-coated film. This film combines the large size of a snowflake with water's high dielectric reflectivity.",
                  "Raindrops freeze as they fall, forming reflective sleet."
                ].map((opt, idx) => (
                  <button
                    key={idx} onClick={() => { if (!cVerChecked) setCVerPred(idx); }} disabled={cVerChecked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      cVerChecked 
                        ? idx === 1 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : cVerPred === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-955 border-gray-900 text-gray-650 opacity-60"
                        : cVerPred === idx 
                          ? "bg-blue-900/10 border-blue-500/40 text-blue-400 font-semibold"
                          : "bg-slate-900/40 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!cVerChecked ? (
                <button
                  onClick={() => {
                    setCVerChecked(true);
                    if (cVerPred === 1) setCVerCorrect(true);
                  }}
                  disabled={cVerPred === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Verify Prediction
                </button>
              ) : (
                <div className="p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400 leading-normal font-light">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {cVerCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Correct Discovery!</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Incorrect</span>
                    )}
                  </div>
                  
                  {level === "beginner" && (
                    <p>
                      <strong>The Principle:</strong> Wet snow is sticky and acts like a mirror. When dry ice crystals get coated in water, they look like giant water droplets to the radar, producing a bright horizontal band.
                    </p>
                  )}
                  {level === "intermediate" && (
                    <p>
                      <strong>Explanation:</strong> The dielectric constant $|K|^2$ of water ($0.93$) is much larger than ice ($0.176$). As snowflakes start melting, they form water coatings while retaining snowflake diameters $D$, producing a peak in $Z_e$.
                    </p>
                  )}
                  {level === "advanced" && (
                    <div className="flex flex-col gap-1">
                      <p>
                        <strong>Formalization:</strong> The algorithm identifies the melting layer peak (`heightBB`) using the vertical gradient profile of measured reflectivity $zFactorMeasured$, matching it against local climatological temperature data.
                      </p>
                      <span className="text-[9px] font-mono text-gray-500">Variables: `heightBB`, `widthBB`, `binMeltingLevel`.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CSF Puzzle Challenge Card */}
          {activeModule === "CSF" && (
            <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Predict & Verify</span>
              </div>
              
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                If you look at the vertical storm core reflectivity profile, what visual feature uniquely differentiates a convective core from a stratiform cell?
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  "Convective profiles show a horizontal bright band melting layer.",
                  "Convective profiles show a continuous, high-reflectivity vertical core (>38 dBZ) extending past the freezing level with NO horizontal bright band.",
                  "Convective profiles always have dry snow at the surface."
                ].map((opt, idx) => (
                  <button
                    key={idx} onClick={() => { if (!cCsfChecked) setCCsfPred(idx); }} disabled={cCsfChecked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      cCsfChecked 
                        ? idx === 1 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : cCsfPred === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-955 border-gray-900 text-gray-650 opacity-60"
                        : cCsfPred === idx 
                          ? "bg-blue-900/10 border-blue-500/40 text-blue-400 font-semibold"
                          : "bg-slate-900/40 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!cCsfChecked ? (
                <button
                  onClick={() => {
                    setCCsfChecked(true);
                    if (cCsfPred === 1) setCCsfCorrect(true);
                  }}
                  disabled={cCsfPred === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Verify Prediction
                </button>
              ) : (
                <div className="p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400 leading-normal font-light">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {cCsfCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Correct Discovery!</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Incorrect</span>
                    )}
                  </div>
                  
                  {level === "beginner" && (
                    <p>
                      <strong>The Principle:</strong> Stratiform storms are calm, layered rain clouds that form clean horizontal lines (melting band). Convective storms are violent chimneys of air that churn up water and ice, erasing the clean melting band line.
                    </p>
                  )}
                  {level === "intermediate" && (
                    <p>
                      <strong>Explanation:</strong> Convective updrafts prevent the formation of a distinct melting layer. The classifier checks the vertical gradient profiles (V-method) and horizontal textures (H-method) to output rain classes.
                    </p>
                  )}
                  {level === "advanced" && (
                    <div className="flex flex-col gap-1">
                      <p>
                        <strong>Formalization:</strong> CSF module classifies ranges into Stratiform (clear horizontal bright band peak) and Convective (high vertical reflectivity, no bright band peak), outputting the variable `rainType`.
                      </p>
                      <span className="text-[9px] font-mono text-gray-500">Variables: `rainType`, `precipTypeDecisions`.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DSD Puzzle Challenge Card */}
          {activeModule === "DSD" && (
            <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Predict & Verify</span>
              </div>
              
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                If you double the raindrop diameter ($D_m$) but divide the total number of drops ($N_w$) so that the total volume of rain water remains identical, what will happen to the radar reflectivity?
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  "Reflectivity remains exactly the same because the water mass is identical.",
                  "Reflectivity decreases because there are fewer reflecting surfaces.",
                  "Reflectivity increases exponentially! Larger drops scatter far more energy back to the radar."
                ].map((opt, idx) => (
                  <button
                    key={idx} onClick={() => { if (!cDsdChecked) setCDsdPred(idx); }} disabled={cDsdChecked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      cDsdChecked 
                        ? idx === 2 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : cDsdPred === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-955 border-gray-900 text-gray-650 opacity-60"
                        : cDsdPred === idx 
                          ? "bg-blue-900/10 border-blue-500/40 text-blue-400 font-semibold"
                          : "bg-slate-900/40 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!cDsdChecked ? (
                <button
                  onClick={() => {
                    setCDsdChecked(true);
                    if (cDsdPred === 2) setCDsdCorrect(true);
                  }}
                  disabled={cDsdPred === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Verify Prediction
                </button>
              ) : (
                <div className="p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400 leading-normal font-light">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {cDsdCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Correct Discovery!</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Incorrect</span>
                    )}
                  </div>
                  
                  {level === "beginner" && (
                    <p>
                      <strong>The Principle:</strong> Radar is highly sensitive to the size of drops, not just the amount of water. A single big raindrop scatters vastly more energy back than a thousand small mist droplets.
                    </p>
                  )}
                  {level === "intermediate" && (
                    <p>
                      <strong>Explanation:</strong> Radar reflectivity $Z$ scales as $D^6$, whereas Liquid Water Content scales as $D^3$. This $D^3$ bias means a few large drops dominate the returned echo.
                    </p>
                  )}
                  {level === "advanced" && (
                    <div className="flex flex-col gap-1">
                      <p>
                        <strong>Formalization:</strong> The DSD parameters shape the reflectivity:
                        \[Z = \\int_0^\\infty D^6 N(D) dD\]
                        Because of the $D^6$ dependence, single-frequency radars suffer from severe drop-size ambiguity, which GPM corrects by comparing Ku and Ka reflectivity.
                      </p>
                      <span className="text-[9px] font-mono text-gray-500">Variables: `precipWaterCont`, `meanDomeDiameter`.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SRT Puzzle Challenge Card */}
          {activeModule === "SRT" && (
            <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Predict & Verify</span>
              </div>
              
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                If the radar echo returned from the ocean surface drops by 8.5 dB in a storm compared to a clear-air path, what does this tell us?
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  "The ocean surface has cooled down in the storm.",
                  "The rain column has absorbed and scattered 8.5 dB of energy on the pulse's round trip.",
                  "The satellite's transmitters have lost power."
                ].map((opt, idx) => (
                  <button
                    key={idx} onClick={() => { if (!cSrtChecked) setCSrtPred(idx); }} disabled={cSrtChecked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      cSrtChecked 
                        ? idx === 1 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : cSrtPred === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-955 border-gray-900 text-gray-650 opacity-60"
                        : cSrtPred === idx 
                          ? "bg-blue-900/10 border-blue-500/40 text-blue-400 font-semibold"
                          : "bg-slate-900/40 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!cSrtChecked ? (
                <button
                  onClick={() => {
                    setCSrtChecked(true);
                    if (cSrtPred === 1) setCSrtCorrect(true);
                  }}
                  disabled={cSrtPred === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Verify Prediction
                </button>
              ) : (
                <div className="p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400 leading-normal font-light">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {cSrtCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Correct Discovery!</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Incorrect</span>
                    )}
                  </div>
                  
                  {level === "beginner" && (
                    <p>
                      <strong>The Principle:</strong> The ocean surface acts like a known target mirror. If the returned reflection gets dimmer, it is because the rain column absorbed some of the energy on the round trip.
                    </p>
                  )}
                  {level === "intermediate" && (
                    <p>
                      <strong>Explanation:</strong> The reduction in sea surface backscatter {"($\\sigma_0$)"} gives the Path Integrated Attenuation {"($PIA = \\sigma_{0,\\text{ref}} - \\sigma_{0,\\text{meas}}$)"}. This anchors the atmospheric correction algorithms.
                    </p>
                  )}
                  {level === "advanced" && (
                    <div className="flex flex-col gap-1">
                      <p>
                        <strong>Formalization:</strong> The Surface Reference Technique (SRT) computes the path integrated attenuation {"$PIA_{\\text{SRT}}$"}. This total column constraint is output as the variable `pathAttenEstimation`.
                      </p>
                      <span className="text-[9px] font-mono text-gray-500">Variables: `pathAttenEstimation`, `pathAttenEstimationSigmaZero`.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SLV Puzzle Challenge Card */}
          {activeModule === "SLV" && (
            <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Understand Divergence</span>
              </div>

              {/* Readout of current state */}
              {(() => {
                const active = slvHistory[slvGateIndex];
                if (!active) return null;
                const isDiverging = active.ze > 52.0 && slvRainType === "heavy";

                return (
                  <div className="text-xs text-gray-300 font-light leading-relaxed flex flex-col gap-3">
                    <p>
                      Step through the gates. If you correct attenuation at one gate, it increases corrected $Z_e$, which increases specific attenuation $k(i)$, which increases the correction at the next gate down.
                    </p>
                    
                    {slvGateIndex === 7 && isDiverging && (
                      <div className="p-3.5 bg-red-950/30 border border-red-800/40 rounded-lg text-[10px] font-mono text-red-400">
                        {level === "beginner" && (
                          <p>
                            <strong>⚠️ Feedback Loop Divergence:</strong> In heavy rain, our guesses ran away! A tiny error at the top multiplied at every gate, causing the corrected values to explode at the surface.
                          </p>
                        )}
                        {level === "intermediate" && (
                          <p>
                            <strong>⚠️ Hitschfeld-Bordan Instability:</strong> The single-frequency integral:
                            {"\\[Z_e(r) = \\frac{Z_m(r)}{\\left(1 - \\frac{0.2}{\\ln 10} \\beta \\int_0^r \\alpha Z_m^\\beta ds\\right)^{1/\\beta}}\\]"}
                            diverged because the denominator approached zero. GPM fixes this by scaling {"$\\alpha$"} to match the SRT attenuation constraint.
                          </p>
                        )}
                        {level === "advanced" && (
                          <p>
                            <strong>⚠️ Mathematical Runway:</strong> The Hitschfeld-Bordan correction behaves as a positive feedback loop. GPM's SLV module scales the parameter {"$\\alpha$"} dynamically to match the independent sea backscatter attenuation {"($PIA_{\\text{SRT}}$)"}, enforcing boundary convergence.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
