"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Radio, 
  Info,
  Droplet,
  CloudSnow,
  CloudRain,
  Flame,
  HelpCircle,
  CheckCircle,
  XCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";

// Dynamically import the 3D globe visualization to avoid SSR window errors
const ThreeOrbitalScan = dynamic(() => import("@/components/ThreeOrbitalScan"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 md:h-[450px] rounded-xl bg-slate-900/60 flex items-center justify-center border border-gray-800">
      <div className="text-blue-400 font-mono text-xs animate-pulse">LOADING 3D ORBITAL SIMULATION...</div>
    </div>
  )
});

export default function StoryPage() {
  const [chapter, setChapter] = useState(1);
  
  // --- CHAPTER 1 PUZZLE ---
  const [c1Answer, setC1Answer] = useState<number | null>(null);
  const [c1Checked, setC1Checked] = useState(false);
  const [c1Correct, setC1Correct] = useState(false);

  // --- CHAPTER 2 PUZZLE ---
  const [timeDelay, setTimeDelay] = useState(50); // microseconds
  const [c2Input, setC2Input] = useState("");
  const [c2Checked, setC2Checked] = useState(false);
  const [c2Correct, setC2Correct] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [pulsePosition, setPulsePosition] = useState(0);
  const [reflectivityProfile, setReflectivityProfile] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);

  // --- CHAPTER 3 PUZZLE ---
  const [c3Answer, setC3Answer] = useState<number | null>(null);
  const [c3Checked, setC3Checked] = useState(false);
  const [c3Correct, setC3Correct] = useState(false);
  const [dropSize, setDropSize] = useState(2.0); // mm

  // --- CHAPTER 4 PUZZLE ---
  const [journeyStep, setJourneyStep] = useState(0);
  const [c4Answer, setC4Answer] = useState<number | null>(null);
  const [c4Checked, setC4Checked] = useState(false);
  const [c4Correct, setC4Correct] = useState(false);

  // Chapter 2: Animation Effect
  useEffect(() => {
    if (pulseActive) {
      const step = () => {
        setPulsePosition((prev) => {
          if (prev >= 100) {
            setPulseActive(false);
            return 100;
          }
          return prev + 2.0;
        });

        setReflectivityProfile((prev) => {
          const currentHeight = Math.floor(pulsePosition);
          if (currentHeight <= 0 || currentHeight >= 100) return prev;
          
          let ref = 0;
          if (currentHeight >= 35 && currentHeight < 65) {
            ref = 18; // dry snow
          } else if (currentHeight >= 65 && currentHeight < 72) {
            ref = 35; // bright band melting layer
          } else if (currentHeight >= 72 && currentHeight < 96) {
            ref = 26; // rain
          } else if (currentHeight >= 96) {
            ref = 55; // ground
          }

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
  }, [pulseActive, pulsePosition]);

  const triggerPulse = () => {
    setPulsePosition(0);
    setReflectivityProfile(new Array(100).fill(0));
    setPulseActive(true);
  };

  // Chapter 2: Check Answer
  const checkC2Answer = () => {
    setC2Checked(true);
    // Distance = (0.3 * timeDelay) / 2
    const targetDistance = (0.3 * timeDelay) / 2;
    const userVal = parseFloat(c2Input);
    if (Math.abs(userVal - targetDistance) < 0.15) {
      setC2Correct(true);
    } else {
      setC2Correct(false);
    }
  };

  // Chapter 4: Stepper questions
  const journeyStages = [
    {
      title: "Pulse Transmission",
      desc: "The satellite's antenna fires microwave pulses traveling downwards at the speed of light (300,000 km/s).",
      question: "How long does it take for a radar pulse to travel from the GPM satellite orbit (435 km height) down to the Earth's surface?",
      options: [
        "Approximately 1.45 milliseconds",
        "Approximately 1.45 seconds",
        "Exactly 5 seconds"
      ],
      correct: 0,
      explanation: "Time = Distance / speed. For 435 km at 300,000 km/s, it is 435 / 300,000 = 0.00145 seconds, which is 1.45 milliseconds."
    },
    {
      title: "Snow & Ice Boundaries",
      desc: "The pulse enters the high altitude cloud. Dry snow crystals reflect some power, but absorb almost nothing.",
      question: "Why is specific attenuation (signal energy loss) minimal in the upper snow layer?",
      options: [
        "Ice crystals are larger than raindrops.",
        "Dry ice has a very low dielectric factor and does not absorb microwave energy.",
        "Snow crystals reflect 100% of the beam back."
      ],
      correct: 1,
      explanation: "Because ice has no liquid water coating, its imaginary refractive index (dielectric factor) is extremely low, causing near-zero signal absorption."
    },
    {
      title: "The Melting Layer (Bright Band)",
      desc: "Snowflakes melt, getting coated in a liquid water film. They appear as massive water drops, producing a reflectivity spike.",
      question: "What physical change causes the reflectivity spike in the melting layer?",
      options: [
        "Particles become colder.",
        "Particles accelerate to rain speed.",
        "Dry snowflakes get coated in water, combining large snowflake size with water's high reflectivity factor."
      ],
      correct: 2,
      explanation: "Melting snowflakes look like giant water droplets to the radar. Since reflectivity scales as D^6, this creates a temporary spike (bright band) before the snowflakes collapse into raindrops."
    },
    {
      title: "Rain Column Attenuation",
      desc: "The pulse propagates through liquid raindrops. Water absorbs and scatters microwave energy, weakening the pulse.",
      question: "Which frequency band suffers worse attenuation as it travels down through heavy rain?",
      options: [
        "Ku-band (13.6 GHz)",
        "Ka-band (35.5 GHz)",
        "Both suffer identical attenuation"
      ],
      correct: 1,
      explanation: "Ka-band has a shorter wavelength (8.4mm) which is closer to the size of raindrops, triggering Mie scattering and heavy attenuation."
    },
    {
      title: "Surface Echo Spike",
      desc: "The remaining beam strikes the dense land/ocean boundary, reflecting a massive, easily identifiable echo.",
      question: "Why is the surface echo useful for atmospheric rain retrieval?",
      options: [
        "It tells us the temperature of the ocean.",
        "By comparing the attenuated surface return to a clear-sky reference, we compute the total Path Integrated Attenuation (PIA).",
        "It creates a cloud filter mask."
      ],
      correct: 1,
      explanation: "The reduction in the surface echo (measured vs. clean-air reference) gives the total Path Integrated Attenuation (PIA), which anchors the profile solver."
    },
    {
      title: "Solver & Retrieval",
      desc: "Echo returns are processed by the Level-2 ground software (PRE, VER, CSF, DSD, SRT, SLV) to output precipitation profiles.",
      question: "What is the final step of the Level-2 solver pipeline?",
      options: [
        "Noise floor thresholding",
        "Correcting reflectivity profiles and converting them to rain rates (mm/h) using DSD models",
        "Orbit trajectory calculation"
      ],
      correct: 1,
      explanation: "The final solver (SLV) applies attenuation correction to rebuild Ze, then uses the retrieved DSD to calculate rain rate profiles."
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Chapter Stepper Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-orange-400 font-semibold tracking-widest uppercase font-mono">Story Mode (Interactive Puzzles)</span>
          <h1 className="text-xl font-bold text-white">Chapter {chapter}: {
            chapter === 1 ? "Meet GPM Satellite" :
            chapter === 2 ? "How Radar Sees Rain" :
            chapter === 3 ? "Meet Ku and Ka Bands" :
            "The Journey of a Radar Pulse"
          }</h1>
        </div>
        
        {/* Navigation */}
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setChapter(prev => Math.max(prev - 1, 1));
              setC1Checked(false);
              setC2Checked(false);
              setC3Checked(false);
              setC4Checked(false);
            }}
            disabled={chapter === 1}
            className="p-2 rounded-lg bg-slate-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
            aria-label="Previous Chapter"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 px-3 bg-slate-900 border border-gray-800 rounded-lg text-xs font-mono text-gray-400">
            {chapter} / 4
          </div>

          <button 
            onClick={() => {
              setChapter(prev => Math.min(prev + 1, 4));
              setC1Checked(false);
              setC2Checked(false);
              setC3Checked(false);
              setC4Checked(false);
            }}
            disabled={
              (chapter === 1 && !c1Correct) ||
              (chapter === 2 && !c2Correct) ||
              (chapter === 3 && !c3Correct) ||
              chapter === 4
            }
            className="p-2 rounded-lg bg-slate-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
            aria-label="Next Chapter"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- CHAPTER 1: MEET THE GPM SATELLITE --- */}
      {chapter === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-white">Why inclined orbit?</h2>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Ground radars cannot scan oceans, deserts, or mountain ranges. To study global weather, GPM Core Observatory flies in an inclined orbit tilt ($65^\circ$), allowing it to cross over locations at different hours of the day.
              </p>
            </div>

            {/* Active Challenge Puzzle Card */}
            <div className="glass-panel p-5 rounded-xl border border-gray-850 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Brilliant Challenge: Orbit Mechanics</span>
              </div>
              
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Most weather imaging satellites use a **Sun-Synchronous Polar Orbit** (crossing the equator at exactly 1:30 PM local time daily). Why did scientists choose an **Inclined Orbit** for the GPM precipitation radar?
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  "Sun-synchronous orbits require less thruster fuel.",
                  "Rainfall varies hourly (diurnal cycle). An inclined orbit allows GPM to sample the same coordinates at different times of the day to map this cycle.",
                  "Polar regions block active radar pulses."
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!c1Checked) setC1Answer(idx);
                    }}
                    disabled={c1Checked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      c1Checked 
                        ? idx === 1 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : c1Answer === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-950 border-gray-900 text-gray-600 opacity-60"
                        : c1Answer === idx 
                          ? "bg-blue-900/10 border-blue-500/40 text-blue-400 font-semibold"
                          : "bg-slate-900/40 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!c1Checked ? (
                <button
                  onClick={() => {
                    setC1Checked(true);
                    if (c1Answer === 1) setC1Correct(true);
                  }}
                  disabled={c1Answer === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Submit Answer
                </button>
              ) : (
                <div className="flex flex-col gap-3 p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400">
                  {c1Correct ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Correct!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect</span>
                    </div>
                  )}
                  <p className="leading-relaxed font-light">
                    If GPM always crossed at 1:30 PM, it would completely miss early morning convective cells or nighttime convective lines. Tilted orbit shifts GPM scanning times daily, capturing the complete diurnal rain cycle.
                  </p>
                  {c1Correct && (
                    <button 
                      onClick={() => setChapter(2)}
                      className="mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs self-start"
                    >
                      Unlock Chapter 2
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <ThreeOrbitalScan />
          </div>
        </div>
      )}

      {/* --- CHAPTER 2: HOW RADAR SEES RAIN --- */}
      {chapter === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-white">Range Gate Delay calculation</h2>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                DPR sends microwave pulses down. We calculate distance by counting the milliseconds it takes for the pulse to bounce off rain and return.
              </p>
            </div>

            {/* Timing Challenge Puzzle Card */}
            <div className="glass-panel p-5 rounded-xl border border-gray-850 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Brilliant Challenge: Radar Range Logic</span>
              </div>

              {/* Time delay slider */}
              <div className="flex flex-col gap-2 p-3 rounded bg-slate-900 border border-gray-850">
                <label className="text-xs font-semibold text-gray-400 flex justify-between">
                  <span>Simulate Echo Delay:</span>
                  <span className="text-orange-400 font-mono font-bold">{timeDelay} microseconds (μs)</span>
                </label>
                <input 
                  type="range" min="10" max="80" step="2" value={timeDelay}
                  onChange={(e) => {
                    if (!c2Checked) {
                      setTimeDelay(Number(e.target.value));
                      triggerPulse();
                    }
                  }}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400 leading-normal">
                  "If the round-trip delay is exactly <span className="text-white font-bold">{timeDelay} μs</span>, how far away is the storm?"
                </p>
                <div className="p-3 bg-slate-900 border border-gray-850 rounded text-[10px] font-mono text-gray-500">
                  Hint: speed of light is 300,000 km/s (or 0.3 km per μs). The round-trip distance is speed * delay, but range to storm is exactly HALF of that total path.
                </div>
                
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="number"
                    placeholder="Enter range (km)"
                    value={c2Input}
                    onChange={(e) => setC2Input(e.target.value)}
                    disabled={c2Checked}
                    className="flex-1 bg-slate-900 border border-gray-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500"
                  />
                  {!c2Checked ? (
                    <button
                      onClick={checkC2Answer}
                      className="py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white"
                    >
                      Check
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setC2Checked(false);
                        setC2Input("");
                      }}
                      className="py-2.5 px-4 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-400"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>

              {c2Checked && (
                <div className="p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400 leading-relaxed font-light">
                  {c2Correct ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Correct!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect</span>
                    </div>
                  )}
                  <p>
                    Target Range: **{((0.3 * timeDelay) / 2).toFixed(1)} km**. 
                    Range gates are calculated using: {"$Range = \\frac{0.3 \\times t}{2}$"} where {"$t$"} is the return trip delay.
                  </p>
                  {c2Correct && (
                    <button 
                      onClick={() => setChapter(3)}
                      className="mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs self-start"
                    >
                      Unlock Chapter 3
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Interactive radar simulator screen */}
          <div className="lg:col-span-7 h-[400px] border border-gray-800 bg-slate-950/40 rounded-xl relative overflow-hidden flex flex-col justify-between p-4">
            <div className="flex justify-between items-start">
              <span className="text-[9px] text-gray-500 font-mono">RADAR GATE SCANNER VIEW</span>
              <button 
                onClick={triggerPulse} 
                disabled={pulseActive}
                className="py-1 px-3 bg-blue-600 hover:bg-blue-500 rounded text-[9px] font-bold text-white disabled:opacity-40"
              >
                Fire Pulse
              </button>
            </div>

            {/* Radar column and profile plot */}
            <div className="flex-1 grid grid-cols-2 gap-6 items-end mt-4">
              {/* Beam column visual */}
              <div className="h-full border border-gray-900 rounded-lg relative overflow-hidden flex flex-col justify-end bg-slate-950/20">
                {/* Cloud layer */}
                <div className="absolute top-[35%] left-0 w-full h-[30%] bg-slate-400/5 border-y border-dashed border-gray-800 flex items-center justify-center text-[9px] text-gray-500">
                  Melting Layer
                </div>

                {pulseActive && (
                  <div 
                    className="absolute w-full h-1 bg-yellow-400/80 animate-pulse shadow-glow shadow-yellow-400/30"
                    style={{ top: `${pulsePosition}%` }}
                  />
                )}
                
                <div className="h-4 bg-slate-900 border-t border-gray-800 text-[8px] font-mono text-center flex items-center justify-center text-gray-500 select-none">
                  SURFACE
                </div>
              </div>

              {/* Reflectivity chart */}
              <div className="h-full border-l border-b border-gray-850 relative flex items-end">
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {reflectivityProfile.map((val, idx) => (
                    <rect 
                      key={idx} x="0" y={100 - idx} width={val * 1.5} height="1" 
                      fill={idx >= 65 && idx < 72 ? "#d97706" : "#3b82f6"} 
                      opacity="0.75"
                    />
                  ))}
                </svg>
                <div className="absolute bottom-1 right-2 text-[8px] text-gray-600 font-mono select-none">
                  0 ────────── 55 dBZ
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CHAPTER 3: MEET KU AND KA BANDS --- */}
      {chapter === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-white">Mie Scattering & DSD Ambiguity</h2>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                A single reflectivity reading ($Z$) cannot resolve drop size distributions. We need two frequencies to differentiate small abundant drops from large sparse drops.
              </p>
            </div>

            {/* Droplet Puzzle Challenge Card */}
            <div className="glass-panel p-5 rounded-xl border border-gray-850 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Brilliant Challenge: scattering scale</span>
              </div>

              <div className="flex flex-col gap-1.5 p-3 rounded bg-slate-900 border border-gray-850">
                <label className="text-xs font-semibold text-gray-400 flex justify-between">
                  <span>Simulated Drop Size ($D_m$):</span>
                  <span className="text-orange-400 font-mono font-bold">{dropSize.toFixed(1)} mm</span>
                </label>
                <input 
                  type="range" min="1.0" max="3.5" step="0.25" value={dropSize}
                  onChange={(e) => {
                    if (!c3Checked) setDropSize(Number(e.target.value));
                  }}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                />
              </div>

              <p className="text-xs text-gray-300 font-light leading-relaxed">
                If reflectivity $Z$ is calculated by integrating drop size concentrations ($Z = \int D^6 N(D) dD$), how does the backscattering of a single massive 3.0 mm raindrop compare to a single 1.0 mm raindrop?
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  "A 3.0mm drop scatters exactly 3 times more radar energy.",
                  "A 3.0mm drop scatters exactly 9 times more radar energy.",
                  "A 3.0mm drop scatters exactly 729 times more radar energy (3^6)."
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!c3Checked) setC3Answer(idx);
                    }}
                    disabled={c3Checked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      c3Checked 
                        ? idx === 2 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : c3Answer === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-950 border-gray-900 text-gray-600 opacity-60"
                        : c3Answer === idx 
                          ? "bg-blue-900/10 border-blue-500/40 text-blue-400 font-semibold"
                          : "bg-slate-900/40 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!c3Checked ? (
                <button
                  onClick={() => {
                    setC3Checked(true);
                    if (c3Answer === 2) setC3Correct(true);
                  }}
                  disabled={c3Answer === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Submit Answer
                </button>
              ) : (
                <div className="p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400 leading-relaxed font-light">
                  {c3Correct ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Correct!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect</span>
                    </div>
                  )}
                  <p>
                    Because Rayleigh scattering scales exponentially as $D^6$, increasing the diameter by a factor of 3 boosts scattering power by $3^6 = 729$. This explains why a few massive drops look like a torrential downpour, creating massive Z-R ambiguities that only dual-frequency DFR can resolve.
                  </p>
                  {c3Correct && (
                    <button 
                      onClick={() => setChapter(4)}
                      className="mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs self-start"
                    >
                      Unlock Chapter 4
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Interactive DFR Curve Visualizer */}
          <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-slate-950/40 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-1 border-b border-gray-850 pb-2">
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">INTUITIVE PHYSICS SANDBOX</span>
              <h3 className="text-xs font-bold text-white uppercase">Rayleigh vs. Mie Scattering (DFR)</h3>
            </div>

            {/* SVG Plot */}
            <div className="h-44 border-l border-b border-gray-850 relative mt-4 flex items-end pl-8 pb-4 pr-2">
              {/* Y Axis Labels */}
              <div className="absolute left-1 top-0 bottom-4 text-[8px] text-gray-500 font-mono flex flex-col justify-between pointer-events-none select-none">
                <span>40 dBZ</span>
                <span>20 dBZ</span>
                <span>0 dBZ</span>
              </div>

              {/* Curves SVG */}
              <svg className="w-full h-full absolute inset-y-0 right-2 left-8 h-[calc(100%-16px)] w-[calc(100%-40px)] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Vertical grid lines */}
                <line x1="16.6" y1="0" x2="16.6" y2="100" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="83.3" y1="0" x2="83.3" y2="100" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />

                {/* Plot Shaded DFR area */}
                <polygon 
                  points={(() => {
                    const kuPts: string[] = [];
                    const kaPts: string[] = [];
                    for (let d = 0.5; d <= 3.5; d += 0.1) {
                      const x = ((d - 0.5) / 3.0) * 100;
                      const valKu = 10 + 25 * Math.log10(d / 0.5);
                      const yKu = 100 - (valKu / 40) * 100;
                      kuPts.push(`${x},${yKu}`);

                      const valKa = valKu - (d > 0.5 ? 2.5 * Math.pow(d - 0.5, 1.8) : 0);
                      const yKa = 100 - (Math.max(valKa, 0) / 40) * 100;
                      kaPts.unshift(`${x},${yKa}`); // reverse order for polygon
                    }
                    return [...kuPts, ...kaPts].join(" ");
                  })()}
                  fill="rgba(139, 92, 246, 0.08)"
                />

                {/* Ku Rayleigh Curve (Blue) */}
                <path 
                  d={(() => {
                    const pts: string[] = [];
                    let i = 0;
                    for (let d = 0.5; d <= 3.5; d += 0.1) {
                      const x = ((d - 0.5) / 3.0) * 100;
                      const valKu = 10 + 25 * Math.log10(d / 0.5);
                      const yKu = 100 - (valKu / 40) * 100;
                      pts.push(`${i === 0 ? "M" : "L"} ${x} ${yKu}`);
                      i++;
                    }
                    return pts.join(" ");
                  })()}
                  fill="none" stroke="#3b82f6" strokeWidth="2.5"
                />

                {/* Ka Mie Curve (Orange) */}
                <path 
                  d={(() => {
                    const pts: string[] = [];
                    let i = 0;
                    for (let d = 0.5; d <= 3.5; d += 0.1) {
                      const x = ((d - 0.5) / 3.0) * 100;
                      const valKu = 10 + 25 * Math.log10(d / 0.5);
                      const valKa = valKu - (d > 0.5 ? 2.5 * Math.pow(d - 0.5, 1.8) : 0);
                      const yKa = 100 - (Math.max(valKa, 0) / 40) * 100;
                      pts.push(`${i === 0 ? "M" : "L"} ${x} ${yKa}`);
                      i++;
                    }
                    return pts.join(" ");
                  })()}
                  fill="none" stroke="#f97316" strokeWidth="2.5"
                />

                {/* Vertical slider tracker line */}
                {(() => {
                  const x = ((dropSize - 0.5) / 3.0) * 100;
                  const currentKu = 10 + 25 * Math.log10(dropSize / 0.5);
                  const currentKa = currentKu - (dropSize > 0.5 ? 2.5 * Math.pow(dropSize - 0.5, 1.8) : 0);
                  const yKu = 100 - (currentKu / 40) * 100;
                  const yKa = 100 - (Math.max(currentKa, 0) / 40) * 100;
                  
                  return (
                    <g>
                      <line x1={x} y1="0" x2={x} y2="100" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3" />
                      <circle cx={x} cy={yKu} r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
                      <circle cx={x} cy={yKa} r="3.5" fill="#f97316" stroke="#ffffff" strokeWidth="1" />
                    </g>
                  );
                })()}
              </svg>

              {/* X Axis Labels */}
              <div className="absolute bottom-1 left-8 right-2 text-[8px] text-gray-500 font-mono flex justify-between pointer-events-none select-none">
                <span>0.5 mm</span>
                <span>1.5 mm</span>
                <span>2.5 mm</span>
                <span>3.5 mm</span>
              </div>
            </div>

            {/* DFR explanation text */}
            {(() => {
              const currentKu = 10 + 25 * Math.log10(dropSize / 0.5);
              const currentKa = currentKu - (dropSize > 0.5 ? 2.5 * Math.pow(dropSize - 0.5, 1.8) : 0);
              const currentDfr = currentKu - currentKa;
              
              return (
                <div className="p-3.5 rounded bg-slate-900 border border-gray-850 text-[10px] font-mono text-gray-300 leading-normal flex flex-col gap-1 mt-2">
                  <div className="flex justify-between font-bold text-white border-b border-gray-800 pb-1 mb-1">
                    <span>At Dm = {dropSize.toFixed(2)} mm</span>
                    <span className="text-purple-400">DFR = {currentDfr.toFixed(2)} dB</span>
                  </div>
                  {dropSize <= 1.2 ? (
                    <p>
                      <span className="text-blue-400 font-bold">Rayleigh scattering:</span> Raindrops are small relative to both wavelengths. Reflectivity values are identical. DFR is zero, making single-frequency radar retrieval highly ambiguous.
                    </p>
                  ) : (
                    <p>
                      <span className="text-orange-400 font-bold">Mie scattering:</span> Raindrops are close to Ka-band wavelength (8.4mm), causing its signal to roll off. The diverging gap (DFR) uniquely resolves the mean drop size without guessing.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- CHAPTER 4: THE JOURNEY OF A RADAR PULSE --- */}
      {chapter === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Steps sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {journeyStages.map((stage, idx) => (
              <button
                key={stage.title}
                onClick={() => {
                  setJourneyStep(idx);
                  setC4Answer(null);
                  setC4Checked(false);
                  setC4Correct(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  journeyStep === idx 
                    ? "bg-slate-800 text-white border-orange-500/40" 
                    : "bg-slate-900/60 border-gray-850 text-gray-400 hover:text-white"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  journeyStep === idx ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400"
                }`}>
                  {idx + 1}
                </div>
                <span className="text-xs font-semibold">{stage.title}</span>
              </button>
            ))}
          </div>

          {/* Stepper display and review challenge card */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4">
              <span className="text-[9px] text-orange-400 font-mono font-bold uppercase tracking-wider">STAGE {journeyStep + 1} OF 6</span>
              <h3 className="text-md font-bold text-white">{journeyStages[journeyStep].title}</h3>
              <p className="text-gray-400 text-xs font-light leading-relaxed">{journeyStages[journeyStep].desc}</p>
            </div>

            {/* Brilliant review challenge */}
            <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4 bg-slate-950/20">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Review Concept: Unlock next stage</span>
              </div>
              
              <p className="text-xs text-gray-300 font-light leading-normal">{journeyStages[journeyStep].question}</p>

              <div className="flex flex-col gap-2">
                {journeyStages[journeyStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!c4Checked) setC4Answer(idx);
                    }}
                    disabled={c4Checked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      c4Checked 
                        ? idx === journeyStages[journeyStep].correct 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : c4Answer === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-950 border-gray-900 text-gray-600 opacity-60"
                        : c4Answer === idx 
                          ? "bg-blue-900/10 border-blue-500/40 text-blue-400 font-semibold"
                          : "bg-slate-900/40 border-gray-850 text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!c4Checked ? (
                <button
                  onClick={() => {
                    setC4Checked(true);
                    if (c4Answer === journeyStages[journeyStep].correct) setC4Correct(true);
                  }}
                  disabled={c4Answer === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Verify Concept
                </button>
              ) : (
                <div className="p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400 leading-normal font-light">
                  {c4Correct ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Correct! Concept Mastered.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect</span>
                    </div>
                  )}
                  <p>{journeyStages[journeyStep].explanation}</p>
                  {c4Correct && journeyStep < 5 && (
                    <button 
                      onClick={() => {
                        setJourneyStep(prev => prev + 1);
                        setC4Answer(null);
                        setC4Checked(false);
                        setC4Correct(false);
                      }}
                      className="mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs self-start"
                    >
                      Proceed to Stage {journeyStep + 2}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
