"use client";

import { useState } from "react";
import { Search, BookOpen, Layers, Binary, Info, HelpCircle } from "lucide-react";

interface DictionaryVar {
  name: string;
  module: string;
  units: string;
  shape: string;
  desc: string;
  equation: string;
  example: string;
  longDesc: string;
}

export default function DictionaryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const variables: DictionaryVar[] = [
    {
      name: "zFactorMeasured",
      module: "PRE / Level-1",
      units: "dBZ",
      shape: "(nScan, nBeam, nBin)",
      desc: "Raw radar reflectivity factor measured by the spacecraft, uncorrected for attenuation.",
      equation: "Z_m = Z_e \\cdot A_p",
      example: "12.0 to 55.0 dBZ",
      longDesc: "This is the initial power return from clouds backscattered to the KuPR and KaPR receivers. It represents the primary raw observation. Because the microwave pulse loses energy as it penetrates rain, zFactorMeasured is always smaller than or equal to the true reflectivity (zFactorCorrected)."
    },
    {
      name: "zFactorFinal (zFactorCorrected)",
      module: "SLV",
      units: "dBZ",
      shape: "(nScan, nBeam, nBin)",
      desc: "True radar reflectivity factor after correcting for path attenuation and Mie scattering.",
      equation: "Z_e = Z_m / \\text{AttenuationFactor}",
      example: "12.0 to 65.0 dBZ",
      longDesc: "The final corrected reflectivity factor representing the true physical backscattering profile of the cloud droplets. It compensates for specific attenuation (absorption + scattering) along the propagation path. This corrected profile is the direct input to the rain rate estimation algorithm."
    },
    {
      name: "precipRateNearSurface",
      module: "SLV / Level-2 Products",
      units: "mm/h",
      shape: "(nScan, nBeam)",
      desc: "Estimated precipitation rate at the lowest clutter-free gate near the Earth's surface.",
      equation: "R = a \\cdot Z_e^b",
      example: "0.0 to 120.0 mm/h",
      longDesc: "This is the most widely used Level-2 scientific product. It estimates the instantaneous rainfall rate reaching the ground. The solver selects appropriate Z-R coefficients (a and b) based on whether the CSF module classified the rainfall as stratiform or convective."
    },
    {
      name: "rainType (typePrecip)",
      module: "CSF",
      units: "Dimensionless (Category Flag)",
      shape: "(nScan, nBeam)",
      desc: "Classification of precipitation column type (Convective, Stratiform, or Other).",
      equation: "\\text{Flag} \\in \\{0, 1, 2, 3\\}",
      example: "1 (Stratiform), 2 (Convective), 3 (Other)",
      longDesc: "An integer flag representing the classification of the precipitation vertical structure. It is determined by the CSF module using horizontal texture analysis and checking for the presence of a bright band melting peak."
    },
    {
      name: "Dm (meanDropletDiameter)",
      module: "DSD",
      units: "mm",
      shape: "(nScan, nBeam, nBin)",
      desc: "Mass-weighted mean diameter of the raindrop size distribution.",
      equation: "D_m = \\frac{\\int D^4 N(D) dD}{\\int D^3 N(D) dD}",
      example: "0.5 to 3.5 mm",
      longDesc: "A critical parameter of the Drop Size Distribution (DSD). It specifies the average physical diameter of the raindrops in a unit volume. Larger Dm values mean the storm is composed of fewer, larger drops, while smaller Dm means a mist of tiny droplets."
    },
    {
      name: "PIA (pathIntegratedAttenuation)",
      module: "SRT",
      units: "dB",
      shape: "(nScan, nBeam)",
      desc: "Total two-way signal loss suffered by the radar pulse traveling through the entire atmospheric column.",
      equation: "\\text{PIA} = 2 \\int_0^H k(s) ds",
      example: "0.0 to 45.0 dB",
      longDesc: "Calculated primarily by the Surface Reference Technique (SRT) by comparing the land/ocean surface echo reduction relative to nearby rain-free reference sweeps. PIA provides a crucial boundary condition constraint for correcting reflectivity profiles."
    },
    {
      name: "stormTopHeight",
      module: "VER",
      units: "m or km",
      shape: "(nScan, nBeam)",
      desc: "Maximum altitude in the vertical column where precipitation echoes are first detected above the noise floor.",
      equation: "H_{\\text{top}} = \\text{GateIndex} \\cdot \\text{GateSpacing}",
      example: "1.5 to 16.0 km",
      longDesc: "Detected by the VER module as the highest gate where the measured reflectivity exceeds the minimum detectable threshold (~12 dBZ for Ku-band). High storm top heights (>12km) are indicators of strong convective updrafts and severe storms."
    }
  ];

  const filteredVariables = variables.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-gray-800 pb-4">
        <span className="text-xs text-indigo-400 font-semibold tracking-widest uppercase font-mono">Encyclopedia</span>
        <h1 className="text-3xl font-extrabold text-white">Variable Dictionary</h1>
        <p className="text-gray-400 text-sm font-light">
          Search the core scientific parameters of GPM-DPR Level-2 files. Understand their physical meaning, units, and array dimensions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by variable name or module (e.g., Dm, SLV, PIA)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-900/60 border border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
      </div>

      {/* Variables List */}
      <div className="flex flex-col gap-6">
        {filteredVariables.map((v) => (
          <div 
            key={v.name}
            className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-850 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white font-mono">{v.name}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-400 uppercase">
                  Units: {v.units}
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-950/20 border border-indigo-900/30 text-indigo-400">
                  Module: {v.module}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 flex flex-col gap-3">
                <p className="text-gray-300 text-sm font-light leading-relaxed">{v.desc}</p>
                <div className="p-3 bg-gray-900 border border-gray-850 rounded-xl flex gap-2.5 items-start">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400 leading-normal font-light">{v.longDesc}</p>
                </div>
              </div>

              {/* Data Specifications panel */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-gray-900/60 border border-gray-850">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Data Specifications</span>
                <div className="flex flex-col gap-2 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">Array Shape:</span>
                    <span className="text-gray-300">{v.shape}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">Formula:</span>
                    <span className="text-cyan-400 font-sans italic">{v.equation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Example Range:</span>
                    <span className="text-white">{v.example}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredVariables.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-mono text-sm">
            No variables match your search query. Try searching for Dm, Z, rainType, or PIA.
          </div>
        )}
      </div>
    </div>
  );
}
