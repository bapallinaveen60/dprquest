"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Map as MapIcon, 
  Upload, 
  Database, 
  Info, 
  Compass,
  AlertTriangle
} from "lucide-react";

interface GranuleData {
  is_mock: boolean;
  n_scans: number;
  n_beams: number;
  n_gates: number;
  latitudes: number[][];
  longitudes: number[][];
  rain_type: number[][];
  surface_rain_rate: number[][];
  storm_top_height: number[][];
  z_ku: number[][][];
  z_ka: number[][][];
}

export default function GranulePage() {
  const [granuleData, setGranuleData] = useState<GranuleData | null>(null);
  const [selectedScan, setSelectedScan] = useState(30); 
  const [selectedBeam, setSelectedBeam] = useState(24); 
  const [activeBand, setActiveBand] = useState<"Ku" | "Ka">("Ku");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    loadSampleGranule();
  }, []);

  const loadSampleGranule = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/granule/sample");
      if (!response.ok) {
        throw new Error("Failed to fetch sample");
      }
      const data = await response.json();
      setGranuleData(data);
    } catch (err) {
      console.warn("Backend offline. Generating GPM tropical cyclone sample local fallback.");
      generateLocalSampleFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalSampleFallback = () => {
    const n_scans = 60;
    const n_beams = 49;
    const n_gates = 176;
    
    const latitudes = Array.from({ length: n_scans }, (_, s) => 
      Array.from({ length: n_beams }, (_, b) => 23.0 + s * 0.1 + (b - 24) * 0.02)
    );
    const longitudes = Array.from({ length: n_scans }, (_, s) => 
      Array.from({ length: n_beams }, (_, b) => -85.0 - s * 0.05 + (b - 24) * 0.08)
    );
    const rain_type = Array.from({ length: n_scans }, () => new Array(n_beams).fill(0));
    const surface_rain_rate = Array.from({ length: n_scans }, () => new Array(n_beams).fill(0.0));
    const storm_top_height = Array.from({ length: n_scans }, () => new Array(n_beams).fill(0.0));
    const z_ku = Array.from({ length: n_scans }, () => 
      Array.from({ length: n_beams }, () => new Array(n_gates).fill(-99.0))
    );
    const z_ka = Array.from({ length: n_scans }, () => 
      Array.from({ length: n_beams }, () => new Array(n_gates).fill(-99.0))
    );

    for (let s = 0; s < n_scans; s++) {
      for (let b = 0; b < n_beams; b++) {
        const dist = Math.sqrt(Math.pow(s - 30, 2) + Math.pow(b - 24, 2));
        
        let type = 0;
        let r_rate = 0.0;
        let s_top = 0.0;
        
        if (dist >= 4 && dist < 9) {
          type = 2;
          r_rate = 38.0 + Math.random() * 8.0;
          s_top = 11.5 + Math.random() * 1.5;
        } else if (dist >= 9 && dist < 15) {
          type = 1;
          r_rate = 4.0 + Math.random() * 2.0;
          s_top = 7.0 + Math.random() * 0.8;
        }

        rain_type[s][b] = type;
        surface_rain_rate[s][b] = r_rate;
        storm_top_height[s][b] = s_top;

        if (r_rate > 0) {
          const top_gate = Math.min(Math.floor((s_top * 1000) / 125), n_gates - 1);
          for (let g = 0; g <= top_gate; g++) {
            const h = g * 0.125;
            let val = 20 + 8 * Math.log10(r_rate);
            
            if (type === 1 && Math.abs(h - 4.2) < 0.3) {
              val += 8.0 * (0.3 - Math.abs(h - 4.2)) / 0.3;
            }
            
            const ku_atten = 0.00025 * Math.pow(r_rate, 1.1) * (top_gate - g) * 0.125;
            const ka_atten = 0.0022 * Math.pow(r_rate, 1.25) * (top_gate - g) * 0.125;

            z_ku[s][b][g] = Math.max(val - ku_atten, 10.0);
            z_ka[s][b][g] = Math.max(val - ka_atten, 8.0);
          }
        }
      }
    }

    setGranuleData({
      is_mock: true,
      n_scans,
      n_beams,
      n_gates,
      latitudes,
      longitudes,
      rain_type,
      surface_rain_rate,
      storm_top_height,
      z_ku,
      z_ka
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/granule/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.detail || "Failed to parse HDF5 file");
      }

      const data = await response.json();
      setGranuleData(data);
      setSelectedScan(Math.floor(data.n_scans / 2));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process GPM HDF5 file.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!granuleData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const { n_scans, n_gates, z_ku, z_ka } = granuleData;
    const cellWidth = width / n_scans;
    const cellHeight = height / n_gates;

    // Professional desaturated color scale (dbZ)
    const getReflectivityColor = (val: number) => {
      if (val <= -10) return "#0b0f17"; // Matches page background slate tone
      if (val < 18) return "#1e3a8a"; // Navy
      if (val < 26) return "#0d9488"; // Muted Teal
      if (val < 34) return "#ca8a04"; // Muted Gold
      if (val < 42) return "#ea580c"; // Muted Orange
      return "#b91c1c"; // Brick Red
    };

    for (let s = 0; s < n_scans; s++) {
      for (let g = 0; g < n_gates; g++) {
        const val = activeBand === "Ku" ? z_ku[s][selectedBeam][g] : z_ka[s][selectedBeam][g];
        ctx.fillStyle = getReflectivityColor(val);
        
        const px = s * cellWidth;
        const py = height - (g * cellHeight) - cellHeight;
        ctx.fillRect(px, py, cellWidth + 0.5, cellHeight + 0.5);
      }
    }

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.0;
    ctx.strokeRect(selectedScan * cellWidth, 0, cellWidth, height);

  }, [granuleData, activeBand, selectedBeam, selectedScan]);

  const activeZProfile = granuleData 
    ? (activeBand === "Ku" ? granuleData.z_ku[selectedScan][selectedBeam] : granuleData.z_ka[selectedScan][selectedBeam])
    : [];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-orange-400 font-semibold tracking-widest uppercase font-mono">Satellite Science Center</span>
          <h1 className="text-2xl font-extrabold text-white">Real GPM Granule Explorer</h1>
        </div>

        {/* Upload & Load Sample controls */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload 2A-DPR File (.h5)</span>
            <input 
              type="file" accept=".h5,.hdf5" onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>

          <button
            onClick={loadSampleGranule}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white transition-all shadow-md"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Load Sample Cyclone Track</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/30 text-red-400 text-xs flex gap-2 items-center">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {granuleData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-gray-950/40 flex flex-col gap-6">
              
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4.5 h-4.5 text-orange-400" />
                  <span className="font-bold text-white text-sm">Vertical Reflectivity Curtain Heatmap</span>
                </div>
                
                {/* Frequency Band Selector */}
                <div className="flex bg-slate-900 p-1 rounded-lg border border-gray-800 text-xs">
                  <button
                    onClick={() => setActiveBand("Ku")}
                    className={`px-3 py-1 rounded font-semibold transition-all ${
                      activeBand === "Ku" ? "bg-slate-800 text-white" : "text-gray-500"
                    }`}
                  >
                    Ku-Band (13.6 GHz)
                  </button>
                  <button
                    onClick={() => setActiveBand("Ka")}
                    className={`px-3 py-1 rounded font-semibold transition-all ${
                      activeBand === "Ka" ? "bg-slate-800 text-white" : "text-gray-500"
                    }`}
                  >
                    Ka-Band (35.5 GHz)
                  </button>
                </div>
              </div>

              {/* Angle Beam Selector slider */}
              <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-900 border border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                  <span>Cross-Swath Scanning Beam Angle</span>
                  <span className="text-orange-400 font-bold">Beam {selectedBeam + 1} / 49 (Nadir Angle: {((selectedBeam - 24) * 0.71).toFixed(1)}°)</span>
                </div>
                <input 
                  type="range" min="0" max="48" value={selectedBeam}
                  onChange={(e) => setSelectedBeam(Number(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                />
              </div>

              {/* Heatmap Canvas Container */}
              <div className="flex flex-col gap-3 relative">
                <div className="absolute left-2 top-2 z-10 bg-slate-900/90 px-2 py-1 rounded border border-gray-850 text-[9px] text-gray-400 font-mono pointer-events-none">
                  VERTICAL SCAN HEIGHT: 0 - 22 km
                </div>

                <div className="w-full h-80 rounded-lg overflow-hidden bg-slate-950 border border-gray-800 relative">
                  <canvas 
                    ref={canvasRef} 
                    width={800} 
                    height={320} 
                    className="w-full h-full cursor-pointer"
                    onClick={(e) => {
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      const clickX = e.clientX - rect.left;
                      const percentage = clickX / rect.width;
                      const scanIndex = Math.min(Math.floor(percentage * granuleData.n_scans), granuleData.n_scans - 1);
                      setSelectedScan(scanIndex);
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono px-1">
                  <span>SCAN 1</span>
                  <span className="text-gray-400">← Click anywhere in the curtain to inspect that vertical column →</span>
                  <span>SCAN {granuleData.n_scans}</span>
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="flex flex-wrap gap-4 items-center justify-between border-t border-gray-850 pt-4 text-[9px] font-mono">
                <span className="text-gray-500">Reflectivity (dBZ) Scale:</span>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-900 rounded"></span>&lt;18 dBZ</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-800 rounded"></span>18-26</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-600 rounded"></span>26-34</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-600 rounded"></span>34-42</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-700 rounded"></span>&gt;42 dBZ</span>
                </div>
              </div>
            </div>

            {/* Orbit track mapping grid */}
            <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-gray-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                <Compass className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-white text-sm">Orbit Swath Track Mapping</span>
              </div>

              {/* Draw 2D track map */}
              <div className="h-44 bg-slate-950 border border-gray-800 rounded-lg relative overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-5 pointer-events-none">
                  {Array.from({ length: 18 }).map((_, i) => <div key={i} className="border border-white"></div>)}
                </div>

                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Shaded swath area envelope */}
                  <path
                    d={(() => {
                      const leftPoints: string[] = [];
                      const rightPoints: string[] = [];
                      const stepSize = Math.max(Math.floor(granuleData.n_scans / 10), 1);
                      
                      for (let s = 0; s < granuleData.n_scans; s += stepSize) {
                        const lx = ((granuleData.longitudes[s][0] + 90) / 10) * 100;
                        const ly = 100 - ((granuleData.latitudes[s][0] - 20) / 10) * 100;
                        leftPoints.push(`${lx},${ly}`);

                        const rx = ((granuleData.longitudes[s][48] + 90) / 10) * 100;
                        const ry = 100 - ((granuleData.latitudes[s][48] - 20) / 10) * 100;
                        rightPoints.unshift(`${rx},${ry}`);
                      }
                      
                      return `M ${leftPoints.join(" L ")} L ${rightPoints.join(" L ")} Z`;
                    })()}
                    fill="rgba(59, 130, 246, 0.03)" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5"
                  />
                  
                  {/* Center orbit path line */}
                  <path
                    d={granuleData.latitudes.map((_, s) => {
                      const x = ((granuleData.longitudes[s][24] + 90) / 10) * 100;
                      const y = 100 - ((granuleData.latitudes[s][24] - 20) / 10) * 100;
                      return `${s === 0 ? "M" : "L"} ${x} ${y}`;
                    }).join(" ")}
                    fill="none" stroke="#475569" strokeWidth="1.2"
                  />

                  {/* Dot at selected scan coordinate */}
                  {(() => {
                    const cx = ((granuleData.longitudes[selectedScan][selectedBeam] + 90) / 10) * 100;
                    const cy = 100 - ((granuleData.latitudes[selectedScan][selectedBeam] - 20) / 10) * 100;
                    return (
                      <circle cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1" />
                    );
                  })()}
                </svg>

                <div className="absolute bottom-2 left-2 text-[8px] text-gray-500 font-mono select-none">
                  GRID: LAT 20°N - 30°N | LON 90°W - 80°W
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: Pixel Profile Inspector (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 glass-panel p-6 rounded-xl border border-gray-800">
            <div className="flex flex-col gap-1 border-b border-gray-800 pb-3">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Pixel profile Inspector</span>
              <h3 className="font-extrabold text-white text-sm">Scan {selectedScan + 1} | Beam {selectedBeam + 1}</h3>
              <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                Lat: {granuleData.latitudes[selectedScan][selectedBeam].toFixed(4)}° | 
                Lon: {granuleData.longitudes[selectedScan][selectedBeam].toFixed(4)}°
              </p>
            </div>

            {/* Profile Plot inspector */}
            <div className="flex flex-col gap-4">
              <div className="h-60 border-l border-b border-gray-800 relative flex items-end pb-2 pl-8 pr-2">
                {/* Altitudes grid */}
                <div className="absolute left-1 top-2 text-[8px] text-gray-500 font-mono flex flex-col justify-between h-[90%] pointer-events-none">
                  <span>22 km</span>
                  <span>15 km</span>
                  <span>7 km</span>
                  <span>0 km</span>
                </div>

                <svg className="w-full h-full absolute inset-y-0 right-2 left-8 h-[calc(100%-8px)] w-[calc(100%-40px)]" viewBox="0 0 100 176" preserveAspectRatio="none">
                  <path
                    d={activeZProfile.map((val, idx) => {
                      if (val <= 0) return "";
                      const x = ((val - 10) / 45) * 100;
                      const y = 176 - idx;
                      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                    }).filter(Boolean).join(" ")}
                    fill="none" stroke={activeBand === "Ku" ? "#3b82f6" : "#f97316"} strokeWidth="2.5"
                  />
                </svg>

                <div className="absolute bottom-1 right-2 text-[8px] text-gray-600 font-mono">
                  10 ───────── 55 dBZ
                </div>
              </div>

              {/* Rain metadata for selected point */}
              <div className="flex flex-col gap-3 font-mono text-[10px] text-gray-300 p-3 bg-slate-900 border border-gray-800 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rain Class:</span>
                  <span className="font-bold text-white">
                    {granuleData.rain_type[selectedScan][selectedBeam] === 2 ? "Convective" :
                     granuleData.rain_type[selectedScan][selectedBeam] === 1 ? "Stratiform" :
                     "No Rain"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-2">
                  <span className="text-gray-500">Surface Rain:</span>
                  <span className="font-bold text-blue-400">
                    {granuleData.surface_rain_rate[selectedScan][selectedBeam].toFixed(2)} mm/h
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-2">
                  <span className="text-gray-500">Storm Top Height:</span>
                  <span className="font-bold text-orange-400">
                    {granuleData.storm_top_height[selectedScan][selectedBeam].toFixed(2)} km
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900 border border-gray-800 text-xs text-gray-400 leading-normal flex gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  Clicking different areas of the vertical curtain shifts the profile coordinates. Observe how stratiform sectors display bright band signatures, while convective points show deeper vertical structures and larger surface rain rates.
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="w-full h-80 rounded-xl bg-slate-900/60 border border-gray-800 flex items-center justify-center">
          <span className="text-xs text-gray-500 font-mono animate-pulse">Waiting for granule data upload or sample trigger...</span>
        </div>
      )}
    </div>
  );
}
