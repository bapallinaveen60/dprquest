"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Sliders, 
  Play, 
  BarChart2, 
  Info,
  Eye
} from "lucide-react";

// Dynamically import ThreeStormViewer to prevent SSR errors
const ThreeStormViewer = dynamic(() => import("@/components/ThreeStormViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 md:h-[450px] rounded-xl bg-slate-900/60 flex items-center justify-center border border-gray-800">
      <div className="text-orange-400 font-mono text-xs animate-pulse">LOADING 3D VOLUME SWEEP...</div>
    </div>
  )
});

interface SimulationData {
  truth: {
    heights: number[];
    precip_phase: string[];
    true_rain_rate: number[];
    true_dm: number[];
    ze_ku_true: number[];
    ze_ka_true: number[];
    zm_ku: number[];
    zm_ka: number[];
    pia_ku: number[];
    pia_ka: number[];
    srt: {
      clean_sigma_0_ku: number;
      clean_sigma_0_ka: number;
      measured_sigma_0_ku: number;
      measured_sigma_0_ka: number;
      retrieved_pia_srt_ku: number;
      retrieved_pia_srt_ka: number;
    };
  };
  retrieved: {
    storm_top: number;
    freezing_level: number;
    rain_type: string;
    has_bright_band: boolean;
    corrected_ze_ku: number[];
    retrieved_rain_rate: number[];
    retrieved_dm: number[];
    estimated_pia_ku: number;
    srt_adjustment_scale: number;
  };
}

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState<"retrieval" | "volume">("retrieval");
  
  // Simulation Input Sliders
  const [stormHeight, setStormHeight] = useState(8.0); // km
  const [freezingLevel, setFreezingLevel] = useState(4.0); // km
  const [rainRate, setRainRate] = useState(15.0); // mm/h
  const [dmSurface, setDmSurface] = useState(1.6); // mm
  const [noiseLevel, setNoiseLevel] = useState(0.4); // dBZ

  // 3D Volume Slicing offset
  const [sliceOffset, setSliceOffset] = useState(6.0); // -6.0 to 6.0. 6 means no slice

  // Simulation Results
  const [simData, setSimData] = useState<SimulationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/simulate/retrieval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storm_height: stormHeight,
          freezing_level: freezingLevel,
          surface_rain_rate: rainRate,
          d_m_surface: dmSurface,
          noise_level: noiseLevel
        })
      });

      if (!response.ok) {
        throw new Error("Backend offline");
      }

      const data = await response.json();
      setSimData(data);
    } catch (err) {
      console.warn("FastAPI backend is offline. Running client-side physical mock solver fallback.");
      generateLocalSimulationFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalSimulationFallback = () => {
    const heights: number[] = [];
    const precip_phase: string[] = [];
    const true_rain_rate: number[] = [];
    const true_dm: number[] = [];
    const ze_ku_true: number[] = [];
    const ze_ka_true: number[] = [];
    const zm_ku: number[] = [];
    const zm_ka: number[] = [];
    const pia_ku: number[] = [];
    const pia_ka: number[] = [];

    const gate_spacing = 15.0 / 120.0;
    
    for (let i = 0; i < 120; i++) {
      const h = i * gate_spacing;
      heights.push(h);

      if (h > stormHeight) {
        precip_phase.push("clear");
        true_rain_rate.push(0.0);
        true_dm.push(0.0);
        ze_ku_true.push(-99.0);
        ze_ka_true.push(-99.0);
      } else if (h > freezingLevel) {
        precip_phase.push("snow");
        const frac = (stormHeight - h) / (stormHeight - freezingLevel);
        true_rain_rate.push(rainRate * 0.4 * frac);
        true_dm.push(dmSurface * 1.2);
        ze_ku_true.push(15 + rainRate * 0.2);
        ze_ka_true.push(16 + rainRate * 0.2);
      } else if (h > freezingLevel - 0.5) {
        precip_phase.push("melting");
        true_rain_rate.push(rainRate * 0.8);
        true_dm.push(dmSurface * 1.1);
        ze_ku_true.push(24 + rainRate * 0.4 + 8.0); 
        ze_ka_true.push(22 + rainRate * 0.35 + 4.0);
      } else {
        precip_phase.push("rain");
        true_rain_rate.push(rainRate);
        true_dm.push(dmSurface);
        ze_ku_true.push(20 + 10 * Math.log10(rainRate));
        ze_ka_true.push(18 + 7 * Math.log10(rainRate));
      }
    }

    let running_k_ku = 0;
    let running_k_ka = 0;
    for (let i = 119; i >= 0; i--) {
      const phase = precip_phase[i];
      const r_rate = true_rain_rate[i];
      
      let k_ku_val = 0;
      let k_ka_val = 0;
      
      if (phase === "rain") {
        k_ku_val = 0.0003 * Math.pow(r_rate, 1.1);
        k_ka_val = 0.0025 * Math.pow(r_rate, 1.25);
      } else if (phase === "melting") {
        k_ku_val = 0.0006 * Math.pow(r_rate, 1.1);
        k_ka_val = 0.004 * Math.pow(r_rate, 1.25);
      } else if (phase === "snow") {
        k_ku_val = 0.00005 * Math.pow(r_rate, 1.0);
        k_ka_val = 0.0003 * Math.pow(r_rate, 1.15);
      }

      pia_ku[i] = 2.0 * running_k_ku * gate_spacing;
      pia_ka[i] = 2.0 * running_k_ka * gate_spacing;
      
      running_k_ku += k_ku_val;
      running_k_ka += k_ka_val;
    }

    for (let i = 0; i < 120; i++) {
      if (ze_ku_true[i] <= -90) {
        zm_ku.push(-99.0);
        zm_ka.push(-99.0);
      } else {
        const noise_ku = (Math.random() - 0.5) * noiseLevel * 2.0;
        const noise_ka = (Math.random() - 0.5) * noiseLevel * 2.0;
        zm_ku.push(Math.max(ze_ku_true[i] - pia_ku[i] + noise_ku, -99.0));
        zm_ka.push(Math.max(ze_ka_true[i] - pia_ka[i] + noise_ka, -99.0));
      }
    }

    const s_0_ku_measured = -10.0 - pia_ku[0] + (Math.random() - 0.5) * 0.5;
    const s_0_ka_measured = -12.0 - pia_ka[0] + (Math.random() - 0.5) * 0.7;

    const corrected_ze_ku = ze_ku_true.map(v => v > 0 ? v - 0.2 : -99.0);
    const retrieved_rain_rate = true_rain_rate.map(v => v > 0 ? v * 0.95 : 0.0);
    const retrieved_dm = true_dm.map(v => v > 0 ? v * 0.98 : 0.0);

    setSimData({
      truth: {
        heights,
        precip_phase,
        true_rain_rate,
        true_dm,
        ze_ku_true,
        ze_ka_true,
        zm_ku,
        zm_ka,
        pia_ku,
        pia_ka,
        srt: {
          clean_sigma_0_ku: -10.0,
          clean_sigma_0_ka: -12.0,
          measured_sigma_0_ku: s_0_ku_measured,
          measured_sigma_0_ka: s_0_ka_measured,
          retrieved_pia_srt_ku: -10.0 - s_0_ku_measured,
          retrieved_pia_srt_ka: -12.0 - s_0_ka_measured
        }
      },
      retrieved: {
        storm_top: stormHeight,
        freezing_level: freezingLevel,
        rain_type: rainRate > 30 ? "Convective" : "Stratiform",
        has_bright_band: rainRate <= 30,
        corrected_ze_ku,
        retrieved_rain_rate,
        retrieved_dm,
        estimated_pia_ku: pia_ku[0] * 0.96,
        srt_adjustment_scale: 1.02
      }
    });
  };

  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-orange-400 font-semibold tracking-widest uppercase font-mono">Simulator Workspace</span>
          <h1 className="text-2xl font-extrabold text-white">Dual Frequency & Retrieval Simulator</h1>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-gray-800 text-xs">
          <button
            onClick={() => setActiveTab("retrieval")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded font-semibold transition-all ${
              activeTab === "retrieval" 
                ? "bg-slate-800 text-white" 
                : "text-gray-555 hover:text-white"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Retrieval Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab("volume")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded font-semibold transition-all ${
              activeTab === "volume" 
                ? "bg-slate-800 text-white" 
                : "text-gray-555 hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>3D Storm Viewer</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: RETRIEVAL SIMULATOR --- */}
      {activeTab === "retrieval" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Control Sliders (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 glass-panel p-6 rounded-xl border border-gray-800">
            <h3 className="font-bold text-white text-xs flex items-center gap-2 border-b border-gray-800 pb-3">
              <Sliders className="w-4 h-4 text-orange-400" />
              <span>Storm Configuration</span>
            </h3>

            {/* Storm Height Slider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 flex justify-between">
                <span>Storm Top Height</span>
                <span className="text-orange-400">{stormHeight.toFixed(1)} km</span>
              </label>
              <input 
                type="range" min="4.0" max="12.0" step="0.5" value={stormHeight}
                onChange={(e) => setStormHeight(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
              />
            </div>

            {/* Freezing Level Slider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 flex justify-between">
                <span>Freezing Level (0°C)</span>
                <span className="text-orange-400">{freezingLevel.toFixed(1)} km</span>
              </label>
              <input 
                type="range" min="2.0" max="6.0" step="0.25" value={freezingLevel}
                onChange={(e) => setFreezingLevel(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
              />
            </div>

            {/* Rain Rate Slider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 flex justify-between">
                <span>Rain Rate (Intensity)</span>
                <span className="text-orange-400">{rainRate.toFixed(1)} mm/h</span>
              </label>
              <input 
                type="range" min="0.5" max="80.0" step="1.0" value={rainRate}
                onChange={(e) => setRainRate(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
              />
            </div>

            {/* Mean Drop Size Slider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 flex justify-between">
                <span>Mean Drop Size (Dm)</span>
                <span className="text-orange-400">{dmSurface.toFixed(2)} mm</span>
              </label>
              <input 
                type="range" min="0.8" max="3.0" step="0.05" value={dmSurface}
                onChange={(e) => setDmSurface(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
              />
            </div>

            {/* Noise Level Slider */}
            <div className="flex flex-col gap-1.5 border-t border-gray-800 pt-4">
              <label className="text-xs font-semibold text-gray-400 flex justify-between">
                <span>Radar Measurement Noise</span>
                <span className="text-orange-400">{noiseLevel.toFixed(2)} dBZ</span>
              </label>
              <input 
                type="range" min="0.0" max="1.5" step="0.1" value={noiseLevel}
                onChange={(e) => setNoiseLevel(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
              />
            </div>

            <button
              onClick={runSimulation}
              disabled={isLoading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 font-bold text-white shadow-lg disabled:opacity-40 transition-all text-xs"
            >
              <Play className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Running Solver..." : "Simulate & Retrieve"}</span>
            </button>
          </div>

          {/* Right panel: Profile Graphs (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {simData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Reflectivity Profile Graph */}
                <div className="glass-panel p-5 rounded-xl border border-gray-800 bg-slate-950/40 flex flex-col">
                  <div className="flex items-center justify-between border-b border-gray-850 pb-2 mb-4">
                    <span className="text-[10px] font-bold text-gray-400">Reflectivity Profile (Z)</span>
                    <div className="flex gap-3 text-[8px] font-mono select-none">
                      <span className="text-blue-400">Ku True</span>
                      <span className="text-blue-600 line-through">Ku Meas</span>
                      <span className="text-orange-400">Ka True</span>
                    </div>
                  </div>

                  {/* SVG Profile Chart */}
                  <div className="h-80 border-l border-b border-gray-800 relative flex items-end pl-10 pb-2 pr-2">
                    {/* Altitudes grid */}
                    <div className="absolute left-1 top-2 text-[8px] text-gray-500 font-mono flex flex-col justify-between h-[90%] pointer-events-none">
                      <span>15 km</span>
                      <span>10 km</span>
                      <span>5 km</span>
                      <span>0 km</span>
                    </div>
                    
                    <svg className="w-full h-full absolute inset-y-0 right-2 left-10 h-[calc(100%-8px)] w-[calc(100%-48px)]" viewBox="0 0 100 120" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="25" y1="0" x2="25" y2="120" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="50" y1="0" x2="50" y2="120" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="75" y1="0" x2="75" y2="120" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                      
                      {/* Ku True Profile path (Blue) */}
                      <path
                        d={simData.truth.ze_ku_true.map((val, idx) => {
                          if (val <= 0) return "";
                          const x = ((val - 10) / 45) * 100;
                          const y = 120 - (idx / 119) * 120;
                          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                        }).filter(Boolean).join(" ")}
                        fill="none" stroke="#3b82f6" strokeWidth="2"
                      />
                      
                      {/* Ku Measured Profile path */}
                      <path
                        d={simData.truth.zm_ku.map((val, idx) => {
                          if (val <= 0) return "";
                          const x = ((val - 10) / 45) * 100;
                          const y = 120 - (idx / 119) * 120;
                          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                        }).filter(Boolean).join(" ")}
                        fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3" opacity="0.6"
                      />

                      {/* Ka True Profile path (Orange) */}
                      <path
                        d={simData.truth.ze_ka_true.map((val, idx) => {
                          if (val <= 0) return "";
                          const x = ((val - 10) / 45) * 100;
                          const y = 120 - (idx / 119) * 120;
                          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                        }).filter(Boolean).join(" ")}
                        fill="none" stroke="#f97316" strokeWidth="2"
                      />
                    </svg>

                    <div className="absolute bottom-1 right-2 text-[8px] text-gray-600 font-mono">
                      10 ───────────────── 55 dBZ
                    </div>
                  </div>
                </div>

                {/* 2. Retrieved Rainfall Profile Graph */}
                <div className="glass-panel p-5 rounded-xl border border-gray-800 bg-slate-950/40 flex flex-col">
                  <div className="flex items-center justify-between border-b border-gray-850 pb-2 mb-4">
                    <span className="text-[10px] font-bold text-gray-400">Rain Rate Profile (R)</span>
                    <div className="flex gap-3 text-[8px] font-mono select-none">
                      <span className="text-gray-400">True R</span>
                      <span className="text-blue-400">Retrieved R</span>
                    </div>
                  </div>

                  {/* SVG Rain Rate Chart */}
                  <div className="h-80 border-l border-b border-gray-800 relative flex items-end pl-10 pb-2 pr-2">
                    {/* Altitudes grid */}
                    <div className="absolute left-1 top-2 text-[8px] text-gray-500 font-mono flex flex-col justify-between h-[90%] pointer-events-none">
                      <span>15 km</span>
                      <span>10 km</span>
                      <span>5 km</span>
                      <span>0 km</span>
                    </div>

                    <svg className="w-full h-full absolute inset-y-0 right-2 left-10 h-[calc(100%-8px)] w-[calc(100%-48px)]" viewBox="0 0 100 120" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="25" y1="0" x2="25" y2="120" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="50" y1="0" x2="50" y2="120" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="75" y1="0" x2="75" y2="120" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                      
                      {/* True Rain rate path (Steel Gray) */}
                      <path
                        d={simData.truth.true_rain_rate.map((val, idx) => {
                          const x = (val / Math.max(rainRate * 1.5, 10)) * 100;
                          const y = 120 - (idx / 119) * 120;
                          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                        }).join(" ")}
                        fill="none" stroke="#64748b" strokeWidth="2.5" opacity="0.6"
                      />
                      
                      {/* Retrieved Rain rate path (Blue) */}
                      <path
                        d={simData.retrieved.retrieved_rain_rate.map((val, idx) => {
                          const x = (val / Math.max(rainRate * 1.5, 10)) * 100;
                          const y = 120 - (idx / 119) * 120;
                          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                        }).join(" ")}
                        fill="none" stroke="#2563eb" strokeWidth="2"
                      />
                    </svg>

                    <div className="absolute bottom-1 right-2 text-[8px] text-gray-600 font-mono">
                      0 ───────────────── {Math.max(rainRate * 1.5, 10).toFixed(0)} mm/h
                    </div>
                  </div>
                </div>

                {/* SRT & Solved Data card info */}
                <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Precipitation Physics Log</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-1 text-xs">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500">Rain Class</span>
                        <span className="font-bold text-white">{simData.retrieved.rain_type}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500">Total Column Atten. (Ku)</span>
                        <span className="font-bold text-blue-400">{simData.truth.pia_ku[0].toFixed(2)} dB</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500">SRT Retrieved PIA (Ku)</span>
                        <span className="font-bold text-orange-400">{simData.truth.srt.retrieved_pia_srt_ku.toFixed(2)} dB</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="w-full h-80 rounded-xl bg-slate-900/60 border border-gray-800 flex items-center justify-center">
                <span className="text-xs text-gray-500 font-mono animate-pulse">Waiting for simulation inputs...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: 3D STORM VIEWER --- */}
      {activeTab === "volume" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 flex flex-col gap-6 glass-panel p-6 rounded-xl border border-gray-800">
            <h3 className="font-bold text-white text-xs flex items-center gap-2 border-b border-gray-800 pb-3">
              <Eye className="w-4 h-4 text-orange-400" />
              <span>3D Cross-Section Controls</span>
            </h3>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-gray-400 flex justify-between">
                <span>Vertical Slice Plane (X-Offset)</span>
                <span className="text-orange-400 font-mono">{sliceOffset === 6.0 ? "No Slicing" : `${sliceOffset.toFixed(1)} m`}</span>
              </label>
              <input 
                type="range" min="-6.0" max="6.0" step="0.5" value={sliceOffset}
                onChange={(e) => setSliceOffset(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
              />
              <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                <span>SLICE LEFT CORE</span>
                <span>SHOW FULL VOLUMETRICS</span>
              </div>
            </div>

            {/* Volumetric Legend info */}
            <div className="flex flex-col gap-3 border-t border-gray-800 pt-4">
              <span className="text-xs font-semibold text-gray-400">Reflectivity Intensity Color Legend</span>
              <div className="flex flex-col gap-2 font-mono text-[9px] text-gray-400">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-red-700 rounded"></span>&gt;38 dBZ (Convective Rain Core)</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-orange-600 rounded"></span>30 - 38 dBZ (Moderate rain)</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-yellow-600 rounded"></span>22 - 30 dBZ (Melting bright band)</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-teal-800 rounded"></span>14 - 22 dBZ (Light rain)</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-slate-650 rounded"></span>&lt;14 dBZ (Dry snow / Drizzle)</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-gray-800 text-xs text-gray-400 leading-normal flex gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p>
                Drag to rotate the storm, pinch to zoom. Use the slice plane slider to slice open the storm and inspect the internal vertical structure. Note the higher reflectivity in the bright band melting layer.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <ThreeStormViewer sliceOffset={sliceOffset} />
          </div>
        </div>
      )}
    </div>
  );
}
