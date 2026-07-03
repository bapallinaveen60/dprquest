"use client";

import { useState } from "react";
import { LineChart, BookOpen, Layers, ExternalLink, HelpCircle, Activity, Globe, Zap } from "lucide-react";

export default function ResearchModePage() {
  const [activeTab, setActiveTab] = useState<"versions" | "boost" | "references">("versions");

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-purple-400 font-semibold tracking-widest uppercase font-mono">Advanced Scientific Mode</span>
          <h1 className="text-3xl font-extrabold text-white">Research Mode</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-900/60 p-1 rounded-xl border border-gray-800 text-xs">
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
                <div key={i} className="p-4 rounded-xl bg-gray-900 border border-gray-850 flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-purple-400 font-mono font-bold uppercase tracking-wider">{ref.org}</span>
                    <h4 className="font-bold text-white text-sm">{ref.title}</h4>
                    <p className="text-xs text-gray-400 leading-normal font-light mt-0.5">{ref.desc}</p>
                  </div>
                  
                  <a
                    href={ref.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-950 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white shrink-0"
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
