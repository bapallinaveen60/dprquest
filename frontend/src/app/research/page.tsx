"use client";

import { useState } from "react";
import { 
  LineChart, 
  BookOpen, 
  Layers, 
  ExternalLink, 
  Activity, 
  Globe, 
  Zap, 
  FileText, 
  CheckCircle,
  Cpu
} from "lucide-react";

export default function ResearchModePage() {
  const [activeTab, setActiveTab] = useState<"atbd" | "versions" | "boost" | "references">("atbd");
  const [activeAtbdSection, setActiveAtbdSection] = useState("3.1");

  const atbdSections = [
    { id: "3.1", title: "3.1 Theoretical Description", desc: "Active radar scattering physics & Rayleigh vs Mie zones" },
    { id: "3.2", title: "3.2 Main Module", desc: "Execution control flow & matched swath alignment" },
    { id: "3.3", title: "3.3 Preparation (PRE)", desc: "Noise suppression, clutter thresholds & bottom gate detection" },
    { id: "3.4", title: "3.4 Vertical Profile (VER)", desc: "Storm top bounds, freezing isotherm & bright band extraction" },
    { id: "3.5", title: "3.5 Classification (CSF)", desc: "Stratiform bright bands vs Convective core gradients" },
    { id: "3.6", title: "3.6 Drop Size Distribution (DSD)", desc: "Dual-Frequency Ratio DSD mapping & normalized intercepts" },
    { id: "3.7", title: "3.7 Surface Reference (SRT)", desc: "Sea surface reference mirrors & Path Integrated Attenuation" },
    { id: "3.8", title: "3.8 Solver (SLV)", desc: "Gate-by-gate attenuation correction & stable scale factors" },
    { id: "3.9", title: "3.9 Trigger (TRG)", desc: "Signal-to-noise threshold gate check logic" }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-purple-400 font-semibold tracking-widest uppercase font-mono">Advanced Scientific Mode</span>
          <h1 className="text-3xl font-extrabold text-white">Research Mode</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-900/60 p-1 rounded-xl border border-gray-800 text-xs">
          <button
            onClick={() => setActiveTab("atbd")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "atbd" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            Level-2 Modules (In-Depth)
          </button>
          <button
            onClick={() => setActiveTab("versions")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "versions" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            V06 vs. V07 Algorithms
          </button>
          <button
            onClick={() => setActiveTab("boost")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "boost" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            Orbit Boost Physics
          </button>
          <button
            onClick={() => setActiveTab("references")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "references" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            Literature & ATBD
          </button>
        </div>
      </div>

      {/* --- TAB 0: ATBD IN-DEPTH TECHNICAL DESCRIPTIONS --- */}
      {activeTab === "atbd" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation: Sections Checklist (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-2 bg-slate-950/40 p-4 rounded-2xl border border-gray-800">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono font-bold pl-1 mb-2">
              ATBD Chapters 3.1 - 3.9
            </span>
            {atbdSections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveAtbdSection(s.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  activeAtbdSection === s.id 
                    ? "bg-purple-950/20 border-purple-500/40 text-white" 
                    : "bg-slate-900/40 border-gray-850 text-gray-400 hover:text-white"
                }`}
              >
                <span className="text-xs font-bold font-mono">{s.title}</span>
                <span className="text-[9px] text-gray-500 leading-normal font-light">{s.desc}</span>
              </button>
            ))}
          </div>

          {/* Right Panel: Scientific Content (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Section 3.1: Theoretical Description */}
            {activeAtbdSection === "3.1" && (
              <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-white border-b border-gray-850 pb-2.5">
                  3.1 Theoretical Description of Rain Retrieval
                </h2>
                
                <div className="flex flex-col gap-3 text-xs text-gray-300 font-light leading-relaxed">
                  <p>
                    Active spaceborne precipitation radar operates by transmitting a pulse of microwave energy into the atmosphere and measuring the backscattered power returned from cloud hydrometeors.
                  </p>
                  
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-gray-900 font-mono text-center my-2 text-cyan-400">
                    {"\\[Z_m(r) = Z_e(r) \\cdot \\exp\\left( -0.2 \\ln(10) \\int_0^r k(s) ds \\right)\\]"}
                  </div>

                  <p>
                    where {"$Z_m(r)$"} is the measured, attenuated reflectivity (dBZ) at range {"$r$"}, {"$Z_e(r)$"} is the true, attenuation-corrected equivalent reflectivity factor, and {"$k(s)$"} is the specific attenuation coefficient (dB/km) at range gate {"$s$"}.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Scattering Zones (Rayleigh vs. Mie):</h3>
                  <ul className="list-disc pl-4 flex flex-col gap-1.5 text-gray-400">
                    <li>
                      <strong>Rayleigh Scattering Zone:</strong> Occurs when droplet diameters are significantly smaller than the radar wavelength ({"$D_m \\ll \\lambda$"}). In this zone, backscatter is independent of frequency and proportional to the sixth power of drop diameter ({"$Z \\propto D^6$"}).
                    </li>
                    <li>
                      <strong>Mie Scattering Zone:</strong> Occurs when droplet sizes approach the radar wavelength ({"$D_m \\approx \\lambda$"}), causing wave phase interference. Ka-band (8.4mm wavelength) enters Mie scattering for drop sizes above 1.2 mm, causing reflectivity to roll off compared to Ku-band (22mm wavelength).
                    </li>
                  </ul>

                  <h3 className="font-bold text-white text-xs mt-3">Variable Extraction:</h3>
                  <p>
                    The Dual-Frequency Ratio {"($DFR = Z_{e,\\text{Ku}} - Z_{e,\\text{Ka}}$)"} is extracted by comparing matched beam profiles. In the Mie zone, DFR is a monotonic function of mean droplet size, allowing the direct retrieval of drop size distributions.
                  </p>
                </div>
              </div>
            )}

            {/* Section 3.2: Main Module */}
            {activeAtbdSection === "3.2" && (
              <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-white border-b border-gray-850 pb-2.5">
                  3.2 Main Module Control Flow
                </h2>

                <div className="flex flex-col gap-3 text-xs text-gray-300 font-light leading-relaxed">
                  <p>
                    The Main module manages the execution thread of the Level-2 ground processing software. It reads orbital telemetry arrays (Level-1B products containing raw power measurements) and outputs the standardized GPM Level-2 arrays.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Matched Swath Beam Synchronization:</h3>
                  <p>
                    Since GPM utilizes two separate instruments—the Ku-band precipitation radar (KuPR) scanning 49 beams, and the Ka-band radar (KaPR) scanning 49 beams—the Main module synchronizes their spatial coordinates. It matches the scan geometries and registers the range gate index bins to line up exactly in 3D coordinates.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Extraction Process:</h3>
                  <p>
                    The Main module extracts georeferencing variables (latitude, longitude, elevation) and orbital states, loops through the matched swaths, triggers sub-modules sequentially, handles memory allocations, and packs the processed parameters into GPM Level-2 HDF5 files.
                  </p>

                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-850 flex flex-col gap-2 mt-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-purple-400">Primary Output GPM Variables</span>
                    <ul className="list-disc pl-4 text-gray-400 font-mono text-[10px] flex flex-col gap-1">
                      <li>`Latitude`, `Longitude` - (nScan, nBeam) georeferenced coordinates</li>
                      <li>`scanTime` - orbital sweep timestamps</li>
                      <li>`landOceanFlag` - surface boundary indicators</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3.3: Preparation (PRE) Module */}
            {activeAtbdSection === "3.3" && (
              <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-white border-b border-gray-850 pb-2.5">
                  3.3 Preparation (PRE) Module
                </h2>

                <div className="flex flex-col gap-3 text-xs text-gray-300 font-light leading-relaxed">
                  <p>
                    PRE represents the entry gateway of the atmospheric processing pipeline. It filters raw power returns to isolate noise and determine ground borders.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Receiver Noise Suppression:</h3>
                  <p>
                    PRE estimates the thermal noise floor by averaging return powers at the highest range gates (typically gates 1-15, equivalent to altitudes above 18 km where no meteorological backscatter is present). Received power below this threshold is flagged as noise.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Ground Clutter Masking:</h3>
                  <p>
                    Radar beams striking the solid ocean or land produce a massive spike in reflectivity. This clutter masks rain returns directly above the surface. The PRE module calculates the scan-angle dependent clutter boundaries:
                  </p>
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-gray-900 font-mono text-center my-2 text-cyan-400">
                    {"\\[\\text{Bin}_{\\text{clutter}} = \\text{Bin}_{\\text{surface}} - \\Delta \\text{Bin}(\\theta_{\\text{scan}})\\]"}
                  </div>
                  <p>
                    where {"$\\theta_{\\text{scan}}$"} is the scan beam pointing angle relative to nadir. At edge scan angles, sidelobe leaks extend clutter further up.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Extracted Variables:</h3>
                  <ul className="list-disc pl-4 text-gray-450 flex flex-col gap-1">
                    <li><strong>`zFactorMeasured`:</strong> Extracted by subtracting noise floor from received power and applying radar calibration constants.</li>
                    <li><strong>`binClutterFreeBottom`:</strong> Extracted by identifying the surface return peak bin and subtracting the scan-angle clutter margin.</li>
                    <li><strong>`localNoiseLevel`:</strong> Receivers thermal noise floor calculated from top gates.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Section 3.4: Vertical Profile (VER) Module */}
            {activeAtbdSection === "3.4" && (
              <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-white border-b border-gray-850 pb-2.5">
                  3.4 Vertical Profile (VER) Module
                </h2>

                <div className="flex flex-col gap-3 text-xs text-gray-300 font-light leading-relaxed">
                  <p>
                    The VER module identifies physical heights, boundary layers, and temperature isotherms inside the precipitation column.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Storm Top Detection:</h3>
                  <p>
                    VER searches from the top range gate downward. The storm top is defined as the first gate where the measured reflectivity factor exceeds the minimum detection threshold (~12 dBZ for Ku, ~18 dBZ for Ka) for at least three consecutive range gates.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Bright Band (BB) Melting Peak Extraction:</h3>
                  <p>
                    In stratiform rain, VER locates the bright band peak. It checks the vertical derivatives of reflectivity surrounding the freezing level:
                  </p>
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-gray-900 font-mono text-center my-2 text-cyan-400">
                    {"\\[\\frac{d Z_m}{d r} \\rightarrow 0 \\quad \\text{at local peak, with } \\frac{d^2 Z_m}{d r^2} < 0\\]"}
                  </div>
                  <p>
                    Once the peak is found, the boundaries of the melting layer are located at the inflection points.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Extracted Variables:</h3>
                  <ul className="list-disc pl-4 text-gray-450 flex flex-col gap-1">
                    <li><strong>`binStormTop`:</strong> Top boundary index of detected precipitation.</li>
                    <li><strong>`heightBB`:</strong> Inflection point peak of the melting layer (km).</li>
                    <li><strong>`binZeroDegIsotherm`:</strong> Freezing level gate index extracted from external thermodynamic models.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Section 3.5: Classification (CSF) Module */}
            {activeAtbdSection === "3.5" && (
              <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-white border-b border-gray-850 pb-2.5">
                  3.5 Classification (CSF) Module
                </h2>

                <div className="flex flex-col gap-3 text-xs text-gray-300 font-light leading-relaxed">
                  <p>
                    The CSF module classifies precipitation cells to select proper drop size and scattering coefficients.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">V-Method (Vertical Bright Band Test):</h3>
                  <p>
                    If the VER module successfully identifies a melting bright band peak near the freezing level, the column is classified as <strong>Stratiform</strong>.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">H-Method (Horizontal Texture Test):</h3>
                  <p>
                    If no bright band is detected, CSF analyzes the horizontal variance of reflectivity at the clutter-free bottom gate. The index of convective texturing is calculated relative to adjacent sweeps:
                  </p>
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-gray-900 font-mono text-center my-2 text-cyan-400">
                    {"\\[\\text{Texture} = Z_m(x,y) - \\text{Average}(Z_m(x\\pm 1, y\\pm 1))\\]"}
                  </div>
                  <p>
                    If the reflectivity exceeds the background average by more than a scan-dependent threshold (typically 10-15 dBZ) or if the reflectivity exceeds 39 dBZ, the cell is classified as <strong>Convective</strong>.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Extracted Variables:</h3>
                  <ul className="list-disc pl-4 text-gray-450 flex flex-col gap-1">
                    <li><strong>`precipType`:</strong> Categorical flag (1 = Stratiform, 2 = Convective, 3 = Other).</li>
                    <li><strong>`rainFlag`:</strong> Binary flag confirming rainfall presence.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Section 3.6: Drop Size Distribution (DSD) Module */}
            {activeAtbdSection === "3.6" && (
              <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-white border-b border-gray-850 pb-2.5">
                  3.6 Drop Size Distribution (DSD) Module
                </h2>

                <div className="flex flex-col gap-3 text-xs text-gray-300 font-light leading-relaxed">
                  <p>
                    The DSD module extracts the parameters of the Gamma Drop Size Distribution modeling raindrop size variance per unit volume.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">DSD Modeling Equations:</h3>
                  <p>
                    Raindrop sizes are modeled as a normalized Gamma distribution:
                  </p>
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-gray-900 font-mono text-center my-2 text-cyan-400">
                    {"\\[N(D) = N_w f(\\mu) \\left( \\frac{D}{D_m} \\right)^\\mu \\exp\\left(-\\Lambda D\\right)\\]"}
                  </div>
                  <p>
                    where {"$N_w$"} is the intercept parameter, {"$D_m$"} is the mass-weighted mean diameter (mm), {"$\\mu$"} is the shape parameter, and {"$\\Lambda$"} is the slope parameter.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">DFR Variable Extraction:</h3>
                  <p>
                    DSD extracts Dm by taking the Dual-Frequency Ratio {"($DFR = Z_{e,\\text{Ku}} - Z_{e,\\text{Ka}}$)"} at gates below the melting level. Because Ka-band scattering rolls off in the Mie zone for larger drops while Ku-band continues Rayleigh scattering, DFR maps directly to {"$D_m$"}. Once {"$D_m$"} is resolved, the liquid water content and {"$N_w$"} are extracted.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Extracted Variables:</h3>
                  <ul className="list-disc pl-4 text-gray-450 flex flex-col gap-1">
                    <li><strong>`meanDomeDiameter` {"($D_m$)"}:</strong> Mass-weighted mean drop diameter (mm).</li>
                    <li><strong>`paramNw` {"($N_w$)"}:</strong> Intercept concentration parameter.</li>
                    <li><strong>`precipWaterCont`:</strong> Liquid water content (g/m³).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Section 3.7: Surface Reference Technique (SRT) Module */}
            {activeAtbdSection === "3.7" && (
              <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-white border-b border-gray-850 pb-2.5">
                  3.7 Surface Reference Technique (SRT)
                </h2>

                <div className="flex flex-col gap-3 text-xs text-gray-300 font-light leading-relaxed">
                  <p>
                    SRT estimates path integrated attenuation by measuring the reduction in the backscattering cross-section of the Earth's surface.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">The Surface Mirror Equation:</h3>
                  <p>
                    Under clear air, the ocean/land backscatter {"($\\sigma_{0,\\text{ref}}$)"} is stable. Under rain, the signal attenuates on its round-trip:
                  </p>
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-gray-900 font-mono text-center my-2 text-cyan-400">
                    {"\\[\\text{PIA}_{\\text{SRT}} = \\sigma_{0,\\text{ref}} - \\sigma_{0,\\text{meas}}\\]"}
                  </div>
                  <p>
                    Subtracting the measured surface return from nearby clear references gives the Path Integrated Attenuation constraint {"($PIA_{\\text{SRT}}$)"}.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Variable Extraction:</h3>
                  <p>
                    SRT averages nearby non-raining pixels within a sliding window to calculate a local reference {"$\\sigma_{0,\\text{ref}}$"}, subtracts the measured value, checks signal stability to output a reliability flag, and exports the total attenuation constraint.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Extracted Variables:</h3>
                  <ul className="list-disc pl-4 text-gray-450 flex flex-col gap-1">
                    <li><strong>`pathAttenEstimation`:</strong> Total column path attenuation constraint (dB).</li>
                    <li><strong>`srtReliabilityFlag`:</strong> Quality indicator of the reference mirror.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Section 3.8: Solver (SLV) Module */}
            {activeAtbdSection === "3.8" && (
              <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-white border-b border-gray-850 pb-2.5">
                  3.8 Solver (SLV) Module
                </h2>

                <div className="flex flex-col gap-3 text-xs text-gray-300 font-light leading-relaxed">
                  <p>
                    The SLV module executes the final attenuation correction and rain rate retrievals.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Hitschfeld-Bordan Attenuation Correction:</h3>
                  <p>
                    The solver integrates downward gate-by-gate, correcting reflectivity for attenuation:
                  </p>
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-gray-900 font-mono text-center my-2 text-cyan-400">
                    {"\\[Z_e(i) = Z_m(i) + \\text{PIA}(i)\\]"}
                    {"\\[\\text{PIA}(i+1) = \\text{PIA}(i) + 2 \\cdot \\alpha Z_e(i)^\\beta \\cdot \\Delta r\\]"}
                  </div>
                  <p>
                    To stabilize this positive feedback loop, the solver scales the parameter {"$\\alpha$"} by an adjustment factor {"$\\epsilon$"} so that the integrated attenuation matches the SRT boundary constraint {"($PIA(surface) = PIA_{\\text{SRT}}$)"}.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Extracted Variables:</h3>
                  <ul className="list-disc pl-4 text-gray-450 flex flex-col gap-1">
                    <li><strong>`zFactorCorrected`:</strong> Corrected reflectivity profile {"$Z_e(i)$"} (dBZ).</li>
                    <li><strong>`precipRate`:</strong> Solved vertical rainfall rate profile (mm/h).</li>
                    <li><strong>`epsilon`:</strong> Scale parameter adjustment ratio.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Section 3.9: Trigger (TRG) Module */}
            {activeAtbdSection === "3.9" && (
              <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-white border-b border-gray-850 pb-2.5">
                  3.9 Trigger (TRG) Module
                </h2>

                <div className="flex flex-col gap-3 text-xs text-gray-300 font-light leading-relaxed">
                  <p>
                    The TRG module acts as an initial gatekeeper check. It scans range gates in the vertical profile to determine if a coordinates contains significant backscattering above noise boundaries.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Threshold Gate Check Logic:</h3>
                  <p>
                    Rather than spending computing resources running DSD and SLV modules on clear-sky coordinates, TRG checks if the received signal at any gate exceeds the radar sensitivity thresholds (~12 dBZ for Ku, ~18 dBZ for Ka). If a threshold is met, the trigger flag is set to 1.
                  </p>

                  <h3 className="font-bold text-white text-xs mt-3">Extracted Variables:</h3>
                  <ul className="list-disc pl-4 text-gray-450 flex flex-col gap-1">
                    <li><strong>`triggerFlag`:</strong> Binary flag (1 = run processing pipeline, 0 = skip).</li>
                    <li><strong>`binLowestTrigger`:</strong> Index of the lowest gate triggering the threshold check.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- TAB 1: V06 VS V07 COMPARISON --- */}
      {activeTab === "versions" && (
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>GPM-DPR Version Transition: V06 to V07</span>
            </h2>
            <p className="text-gray-300 text-xs font-light leading-relaxed mb-6">
              NASA and JAXA periodically update the ground processing software packages for GPM. Version 07 (V07) is the current major release, 
              introducing massive architectural changes to scan patterns and matched swaths.
            </p>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-3 px-4">Parameter Feature</th>
                    <th className="py-3 px-4 text-cyan-400">Version 06 (V06)</th>
                    <th className="py-3 px-4 text-purple-400">Version 07 (V07)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900 text-gray-300">
                  <tr className="hover:bg-gray-900/25">
                    <td className="py-4 px-4 font-bold text-white">Ka-Band Matched Beams (MS)</td>
                    <td className="py-4 px-4">25 beams (inner swath width only)</td>
                    <td className="py-4 px-4 font-semibold text-white">49 beams (fully matched to Ku-band swath width)</td>
                  </tr>
                  <tr className="hover:bg-gray-900/25">
                    <td className="py-4 px-4 font-bold text-white">Ka High-Sensitivity Gates (HS)</td>
                    <td className="py-4 px-4">88 vertical range gates (250m resolution)</td>
                    <td className="py-4 px-4 font-semibold text-white">176 vertical range gates (125m resolution)</td>
                  </tr>
                  <tr className="hover:bg-gray-900/25">
                    <td className="py-4 px-4 font-bold text-white">Swath Scan Type</td>
                    <td className="py-4 px-4">Interlaced beams for Ka-band</td>
                    <td className="py-4 px-4 font-semibold text-white">Matched scan beams (Ku and Ka beams align perfectly)</td>
                  </tr>
                  <tr className="hover:bg-gray-900/25">
                    <td className="py-4 px-4 font-bold text-white">DSD Solver Strategy</td>
                    <td className="py-4 px-4">Single-frequency profiling for edge beams</td>
                    <td className="py-4 px-4 font-semibold text-white">Dual-frequency retrieval across the entire swath width</td>
                  </tr>
                  <tr className="hover:bg-gray-900/25">
                    <td className="py-4 px-4 font-bold text-white">Sidelobe Clutter Filter</td>
                    <td className="py-4 px-4">Simple geometric mask thresholds</td>
                    <td className="py-4 px-4 font-semibold text-white">Wavelet-based clutter mitigation algorithm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-gray-300 leading-normal flex gap-2">
            <Activity className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p>
              <strong>Algorithm Takeaway:</strong> By expanding the Matched Swath (MS) to cover all 49 beams, V07 allows true dual-frequency retrieval (DFR) across the entire 245 km swath width, rather than just the narrow 120 km core. This vastly improves global rain drop size statistics.
            </p>
          </div>
        </div>
      )}

      {/* --- TAB 2: ORBIT BOOST PHYSICS --- */}
      {activeTab === "boost" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <span>The 2021 GPM Orbital Boost</span>
              </h2>
              <p className="text-gray-300 text-xs font-light leading-relaxed">
                In June 2021, GPM spacecraft operators executed a series of engine thruster burns to raise the satellite's 
                orbit from **407 km** to **435 km** above the Earth.
              </p>
              <p className="text-gray-300 text-xs font-light leading-relaxed">
                This orbit boost was necessary to counter atmospheric drag. GPM flies in a relatively low orbit where trace thermospheric gas 
                decelerates the satellite, consuming fuel to maintain altitude. By raising GPM to 435km, drag was reduced by 70%, 
                extending GPM's lifetime by over a decade.
              </p>
              
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-850 flex flex-col gap-3 text-xs">
                <span className="font-bold text-white font-mono text-[10px] uppercase tracking-wider">Physical Impacts on Radar</span>
                <ul className="list-disc pl-4 flex flex-col gap-1.5 text-gray-400 font-light leading-normal">
                  <li><strong>Swath Width:</strong> Increased from 245 km to 262 km (expanding swath coverage area).</li>
                  <li><strong>Pixel Footprint Resolution:</strong> Shifted slightly from 5.2 km to 5.4 km spatial footprint.</li>
                  <li><strong>Minimum detectable signal:</strong> Dropped by ~0.5 dB due to larger distance path loss.</li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-gray-800 text-center flex flex-col items-center justify-center gap-4 bg-gray-950/20">
              <Zap className="w-12 h-12 text-purple-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 font-mono font-bold uppercase">Spacecraft State</span>
                <span className="text-lg font-extrabold text-white">435 km Stable Orbit</span>
                <span className="text-[10px] text-purple-400 font-mono mt-1 font-semibold">Fuel Life: Extended to 2035+</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: REFERENCES & PAPERS --- */}
      {activeTab === "references" && (
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span>GPM-DPR Algorithm Literature</span>
            </h2>

            <div className="flex flex-col gap-4">
              {[
                {
                  title: "GPM DPR Level-2 Algorithm Theoretical Basis Document (ATBD)",
                  org: "NASA / JAXA Precipitation Processing System",
                  desc: "The official 265-page technical document defining all L2 algorithms: PRE, VER, CSF, DSD, SRT, and SLV physics.",
                  href: "https://gpm.nasa.gov/resources/documents/ATBD"
                },
                {
                  title: "Dual-Frequency Precipitation Radar (DPR) Status and Science",
                  org: "JAXA GPM Project Team",
                  desc: "Core paper explaining Ka and Ku hardware characteristics, matched scan geometry calibration, and version release schedules.",
                  href: "https://www.jaxa.jp/projects/sat/gpm/index_e.html"
                },
                {
                  title: "Drop Size Distribution Retrievals from GPM Dual-Frequency Radar",
                  org: "IEEE Transactions on Geoscience & Remote Sensing",
                  desc: "Scientific publication explaining the mathematical principles of using DFR to resolve Dm and Nw parameters.",
                  href: "https://ieeexplore.ieee.org/"
                }
              ].map((ref, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-900 border border-gray-855 flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-purple-400 font-mono font-bold uppercase tracking-wider">{ref.org}</span>
                    <h4 className="font-bold text-white text-sm">{ref.title}</h4>
                    <p className="text-xs text-gray-400 leading-normal font-light mt-0.5">{ref.desc}</p>
                  </div>
                  
                  <a
                    href={ref.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-955 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white shrink-0"
                    aria-label={`Open link to ${ref.title}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
