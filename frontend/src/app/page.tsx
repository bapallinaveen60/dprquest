"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Compass, 
  Layers, 
  Sliders, 
  Map, 
  Book, 
  Binary, 
  Trophy, 
  MessageSquareCode, 
  ArrowRight,
  Radio,
  Globe,
  Settings,
  GraduationCap
} from "lucide-react";

export default function Home() {
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  useEffect(() => {
    const saved = localStorage.getItem("gpm_learning_level") || "beginner";
    setLevel(saved as any);
  }, []);

  const changeLevel = (newLevel: "beginner" | "intermediate" | "advanced") => {
    setLevel(newLevel);
    localStorage.setItem("gpm_learning_level", newLevel);
    window.dispatchEvent(new Event("storage_learning_level"));
  };

  const missions = [
    {
      id: "m1",
      title: "Mission 1: The Swath Sweeper",
      desc: "Observe how GPM maps the globe in 3D. Differentiate how orbit tilts capture rainfall changes over time.",
      href: "/story",
      category: "story",
      bullets: ["Observe Orbits", "Predict coverage", "Inclined Orbit Physics"],
      accent: "text-blue-400"
    },
    {
      id: "m2",
      title: "Mission 2: Echo Delay Mystery",
      desc: "Trigger radar pulses, count echo delays, and calculate the distance to storm cells using the speed of light.",
      href: "/story",
      category: "story",
      bullets: ["Observe echoes", "Predict ranges", "Range Gating math"],
      accent: "text-blue-400"
    },
    {
      id: "m3",
      title: "Mission 3: The Frequency Duel",
      desc: "Experiment with raindrops of different sizes and discover why Ku and Ka bands respond differently to water volumes.",
      href: "/story",
      category: "story",
      bullets: ["Rayleigh vs. Mie", "Measured curves", "DFR Fingerprinting"],
      accent: "text-blue-400"
    },
    {
      id: "m4",
      title: "Mission 4: Rain Type Detective",
      desc: "Analyze vertical profiles to classify stratiform horizontal bands vs convective cores.",
      href: "/explorer",
      category: "pipeline",
      bullets: ["CSF classifier", "Melting bright band", "V/H-Methods"],
      accent: "text-orange-400"
    },
    {
      id: "m5",
      title: "Mission 5: The Runaway Solver",
      desc: "Step gate-by-gate, witness mathematical attenuation correction runaway, and discover how ocean mirrors resolve it.",
      href: "/explorer",
      category: "pipeline",
      bullets: ["Path Attenuation", "Hitschfeld-Bordan", "SRT constraints"],
      accent: "text-orange-400"
    },
    {
      id: "m6",
      title: "Mission 6: Real Storm Tracker",
      desc: "Investigate actual GPM cyclone granule swaths. Identify real precipitation structures and freezing layers.",
      href: "/granule",
      category: "data",
      bullets: ["HDF5 swath pathing", "Reflectivity curtains", "Pixel profiling"],
      accent: "text-emerald-400"
    }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      
      {/* Header with Learning Level Selector */}
      <section className="relative rounded-3xl overflow-hidden glass-panel p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-gray-800">
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-gray-850 text-[10px] text-gray-400 font-bold uppercase tracking-wider w-fit">
            <Radio className="w-3.5 h-3.5 text-blue-500" />
            <span>Interactive Educational Platform</span>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            GPM-DPR Explorer
          </h1>
          
          <p className="text-gray-405 text-sm leading-relaxed font-light">
            Welcome to the active rediscovery workbench. Adjust the sliders, guess outcomes, and uncover the principles of satellite radar rain retrieval.
          </p>
        </div>

        {/* Level Switcher */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-950/40 border border-gray-850 w-full md:w-auto">
          <span className="text-[10px] text-gray-500 uppercase font-mono font-bold flex items-center gap-1.5 justify-center md:justify-start">
            <GraduationCap className="w-3.5 h-3.5 text-orange-400" />
            <span>Select Learning Depth:</span>
          </span>

          <div className="flex bg-slate-900 p-1 rounded-lg border border-gray-800 text-xs">
            {[
              { id: "beginner", label: "Beginner", desc: "No formulas, visual analogies" },
              { id: "intermediate", label: "Intermediate", desc: "Simplified mathematics" },
              { id: "advanced", label: "Advanced", desc: "Complete physics and variables" }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => changeLevel(l.id as any)}
                className={`px-3 py-1.5 rounded transition-all font-semibold ${
                  level === l.id 
                    ? "bg-slate-800 text-white" 
                    : "text-gray-550 hover:text-gray-300"
                }`}
                title={l.desc}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Progress & Badge Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Your Rediscovery Progress</span>
            <h3 className="text-md font-bold text-white">
              Level 1: Radar Explorer
            </h3>
            <div className="w-64 md:w-80 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1">
              <div className="w-[30%] h-full bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-[10px] text-gray-500">Solved 2 / 6 active missions</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-slate-900 border border-gray-800 rounded-xl">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500">Unlocked Badge</span>
              <span className="text-xs font-bold text-white">Diurnal Pioneer</span>
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
            <h4 className="font-bold text-white text-xs">Socratic AI Tutor</h4>
            <p className="text-[10px] text-gray-500">Stuck on a concept? Chat with our tutor, who will guide you to the answer without giving it away.</p>
          </div>
        </Link>
      </section>

      {/* active Mission Map Grid */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-extrabold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
          <Compass className="w-5 h-5 text-orange-400" />
          <span>Active Discovery Missions</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((m) => (
            <div 
              key={m.id} 
              className="group relative rounded-xl overflow-hidden glass-panel glass-panel-hover flex flex-col justify-between p-6 border border-gray-800"
            >
              <div className="flex flex-col gap-4">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-gray-500 text-[8px] font-mono w-fit uppercase font-semibold">
                  {m.category}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-md font-bold text-white group-hover:text-blue-400 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed font-light">
                    {m.desc}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-900 flex flex-col gap-3">
                <div className="flex flex-wrap gap-1">
                  {m.bullets.map((bullet) => (
                    <span key={bullet} className="px-2 py-0.5 rounded bg-slate-900 text-gray-500 text-[9px] font-mono">
                      {bullet}
                    </span>
                  ))}
                </div>
                <Link 
                  href={m.href} 
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${m.accent} mt-1`}
                >
                  <span>Begin Mission</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Utilities Reference Decks */}
      <section className="flex flex-col gap-6 pt-6 border-t border-gray-800">
        <h2 className="text-md font-extrabold text-gray-400">Reference & Science Utility Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href="/dictionary" className="glass-panel p-5 rounded-xl border border-gray-800 hover:bg-slate-900/30 transition-all flex flex-col gap-2 group">
            <Book className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            <h4 className="font-bold text-white text-xs mt-1">Variable Dictionary</h4>
            <p className="text-[10px] text-gray-500">Descriptions and arrays shapes for level-2 products.</p>
          </Link>

          <Link href="/translator" className="glass-panel p-5 rounded-xl border border-gray-800 hover:bg-slate-900/30 transition-all flex flex-col gap-2 group">
            <Binary className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            <h4 className="font-bold text-white text-xs mt-1">Equation Translator</h4>
            <p className="text-[10px] text-gray-500">Translate complex radar math into simple plain English sentences.</p>
          </Link>

          <Link href="/quiz" className="glass-panel p-5 rounded-xl border border-gray-800 hover:bg-slate-900/30 transition-all flex flex-col gap-2 group">
            <Trophy className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            <h4 className="font-bold text-white text-xs mt-1">Quiz Sandbox</h4>
            <p className="text-[10px] text-gray-500">Verify your final conceptual models and unlock scientist badges.</p>
          </Link>

        </div>
      </section>

    </div>
  );
}
