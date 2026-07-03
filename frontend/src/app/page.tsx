"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  BookOpen, 
  GitBranch, 
  Sliders, 
  Map, 
  Book, 
  Binary, 
  Trophy, 
  LineChart, 
  MessageSquareCode, 
  ArrowRight,
  Radio,
  Globe
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("all");

  const cards = [
    {
      title: "Learn by Story",
      desc: "Interactive journey explaining GPM satellite orbits, radar echo principles, Ku/Ka frequency bands, and pulse travel path.",
      href: "/story",
      category: "learn",
      icon: BookOpen,
      color: "from-slate-700 to-slate-800",
      accent: "text-blue-400",
      bullets: ["Orbital Scan Mechanics", "Radar Echo Equations", "Ku vs. Ka Physics"]
    },
    {
      title: "Algorithm Explorer",
      desc: "Interactive visualization of the Level-2 processing pipeline. Click modules to adjust freezing level, drop size, and storm class.",
      href: "/explorer",
      category: "algorithm",
      icon: GitBranch,
      color: "from-slate-700 to-slate-800",
      accent: "text-blue-400",
      bullets: ["Storm Top & Melting Band", "CSF Precipitation Classifier", "SRT Attenuation Solver"]
    },
    {
      title: "Simulators",
      desc: "Adjust rainfall parameters (rain rate, drop size, snow, height) and compare simulated radar profiles against the solver.",
      href: "/simulator",
      category: "simulate",
      icon: Sliders,
      color: "from-slate-700 to-slate-800",
      accent: "text-orange-400",
      bullets: ["Dual Frequency Profiling", "Retrieval Validation", "3D Volumetric Slicing"]
    },
    {
      title: "Real GPM Granule Explorer",
      desc: "Upload actual 2A-DPR HDF5 files or load our sample tropical cyclone track to inspect cross-section reflectivity curtains.",
      href: "/granule",
      category: "data",
      icon: Map,
      color: "from-slate-700 to-slate-800",
      accent: "text-orange-400",
      bullets: ["Swath Mapping", "Vertical Radar Curtains", "Pixel Profile Inspector"]
    },
    {
      title: "Variable Dictionary",
      desc: "Searchable database of Level-2 variables (zFactorMeasured, rainType, Dm, etc.) with definitions, shapes, and formulas.",
      href: "/dictionary",
      category: "learn",
      icon: Book,
      color: "from-slate-700 to-slate-800",
      accent: "text-slate-400",
      bullets: ["Symbol Explanations", "Array Shape Sizes", "Parameter Ranges"]
    },
    {
      title: "Equation Translator",
      desc: "Convert standard radar mathematics and satellite formulas (radar equation, path attenuation) into simple plain English.",
      href: "/translator",
      category: "learn",
      icon: Binary,
      color: "from-slate-700 to-slate-800",
      accent: "text-slate-400",
      bullets: ["Radar Equation", "Path Attenuation Integral", "Z-R Empirical Fits"]
    },
    {
      title: "Quiz & Gamification",
      desc: "Test your satellite radar retrieval knowledge, earn points, unlock levels, and receive your Advanced DPR Scientist badge.",
      href: "/quiz",
      category: "learn",
      icon: Trophy,
      color: "from-slate-700 to-slate-800",
      accent: "text-yellow-500",
      bullets: ["5 Skill Levels", "Explanations & Feedback", "Scientist XP Ranks"]
    },
    {
      title: "Research Mode",
      desc: "Compare V06 vs V07 retrieval algorithms, understand orbit boost effects, scan patterns, and read original research papers.",
      href: "/research",
      category: "algorithm",
      icon: LineChart,
      color: "from-slate-700 to-slate-800",
      accent: "text-slate-400",
      bullets: ["V06 vs. V07 Comparisons", "Orbit Boost Physics", "NASA/JAXA Document Links"]
    }
  ];

  const filteredCards = activeTab === "all" 
    ? cards 
    : cards.filter(c => c.category === activeTab);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-10 flex flex-col gap-6 border border-gray-800">
        <div className="relative z-10 flex flex-col gap-3 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-gray-800 text-[10px] text-gray-400 font-bold uppercase tracking-wider w-fit">
            <Radio className="w-3.5 h-3.5 text-blue-500" />
            <span>Interactive Educational Platform</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            GPM-DPR Explorer
          </h1>
          
          <p className="text-gray-400 text-md leading-relaxed font-light">
            An interactive learning platform for the Global Precipitation Measurement (GPM) Dual-frequency Precipitation Radar Level-2 retrieval algorithm. Understand sensor physics, profiles, and path integrated attenuation corrections.
          </p>
        </div>

        {/* Satellite Configuration Stats */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-800/80">
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-900/60 border border-gray-800/60">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Active Satellite</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              GPM Core Observatory
            </span>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-900/60 border border-gray-800/60">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Radar Frequencies</span>
            <span className="text-xs font-bold text-blue-400">
              Ku (13.6 GHz) & Ka (35.5 GHz)
            </span>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-900/60 border border-gray-800/60">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Orbit Height</span>
            <span className="text-xs font-bold text-orange-400">
              435 km (Post-Boost)
            </span>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-slate-900/60 border border-gray-800/60">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Swath Width</span>
            <span className="text-xs font-bold text-slate-300">
              245 km (Matched Swath)
            </span>
          </div>
        </div>
      </section>

      {/* Gamification Progress Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Your Learning Status</span>
            <h3 className="text-md font-bold text-white">
              Level 1: Radar Cadet
            </h3>
            <div className="w-64 md:w-80 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1">
              <div className="w-[20%] h-full bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-[10px] text-gray-500">20 / 100 XP to next level</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-slate-900 border border-gray-800 rounded-xl">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500">Current Badge</span>
              <span className="text-xs font-bold text-white">Radar Pioneer</span>
            </div>
          </div>
        </div>

        <Link 
          href="/tutor"
          className="glass-panel p-6 rounded-2xl border border-gray-800 hover:bg-slate-900/30 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <MessageSquareCode className="w-6 h-6 text-orange-400" />
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <h4 className="font-bold text-white text-xs">Need immediate answers?</h4>
            <p className="text-[10px] text-gray-500">Ask the AI Tutor questions about reflectivity, bright band, and precipitation retrieval algorithms.</p>
          </div>
        </Link>
      </section>

      {/* Main Feature Cards Section */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
          <h2 className="text-xl font-bold text-white">Explore the Platform</h2>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-gray-800 text-xs">
            {["all", "learn", "algorithm", "simulate", "data"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded capitalize font-medium transition-all ${
                  activeTab === tab 
                    ? "bg-slate-800 text-white font-semibold" 
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab === "all" ? "All Modules" : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => {
            const Icon = card.icon;
            return (
              <div 
                key={card.title} 
                className="group relative rounded-xl overflow-hidden glass-panel glass-panel-hover flex flex-col justify-between p-6 border border-gray-800"
              >
                <div className="flex flex-col gap-4">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-gray-800 w-fit text-gray-400 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-md font-bold text-white group-hover:text-blue-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-light">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-900 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1">
                    {card.bullets.map((bullet) => (
                      <span key={bullet} className="px-2 py-0.5 rounded bg-slate-900 text-gray-500 text-[9px] font-mono">
                        {bullet}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href={card.href} 
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${card.accent} mt-1`}
                  >
                    <span>Launch Module</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
