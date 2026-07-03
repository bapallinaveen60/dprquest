"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  HelpCircle as QuestionIcon,
  Play,
  RotateCcw,
  Compass,
  GraduationCap
} from "lucide-react";

// Dynamically import ThreeOrbitalScan to avoid SSR window errors
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
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  // Sync Learning Level from local storage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("gpm_learning_level") || "beginner";
      setLevel(saved as any);
    };
    handleStorageChange();
    window.addEventListener("storage_learning_level", handleStorageChange);
    return () => window.removeEventListener("storage_learning_level", handleStorageChange);
  }, []);

  // --- CHAPTER 1 STATE (Orbits) ---
  const [c1Prediction, setC1Prediction] = useState<number | null>(null);
  const [c1Checked, setC1Checked] = useState(false);
  const [c1Correct, setC1Correct] = useState(false);

  // --- CHAPTER 2 STATE (Timing Delay) ---
  const [timeDelay, setTimeDelay] = useState(50); // microseconds
  const [c2Prediction, setC2Prediction] = useState<number | null>(null);
  const [c2Input, setC2Input] = useState("");
  const [c2Checked, setC2Checked] = useState(false);
  const [c2Correct, setC2Correct] = useState(false);
  
  // Animation states for radar pulse
  const [pulseActive, setPulseActive] = useState(false);
  const [pulsePosition, setPulsePosition] = useState(0);
  const [reflectivityProfile, setReflectivityProfile] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);

  // --- CHAPTER 3 STATE (Rayleigh vs Mie) ---
  const [dropSize, setDropSize] = useState(2.0); // mm
  const [c3Prediction, setC3Prediction] = useState<number | null>(null);
  const [c3Checked, setC3Checked] = useState(false);
  const [c3Correct, setC3Correct] = useState(false);

  // --- CHAPTER 4 STATE (Pulse Journey stepper) ---
  const [journeyStep, setJourneyStep] = useState(0);
  const [c4Prediction, setC4Prediction] = useState<number | null>(null);
  const [c4Checked, setC4Checked] = useState(false);
  const [c4Correct, setC4Correct] = useState(false);

  // Chapter 2: Animation loop
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
          if (currentHeight >= 35 && currentHeight < 65) ref = 15; // snow
          else if (currentHeight >= 65 && currentHeight < 72) ref = 35; // bright band melting layer
          else if (currentHeight >= 72 && currentHeight < 96) ref = 25; // rain
          else if (currentHeight >= 96) ref = 50; // surface

          const newProfile = [...prev];
          newProfile[currentHeight] = ref;
          return newProfile;
        });

        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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

  const checkC2Answer = () => {
    setC2Checked(true);
    const targetDistance = (0.3 * timeDelay) / 2;
    const userVal = parseFloat(c2Input);
    if (Math.abs(userVal - targetDistance) < 0.15) {
      setC2Correct(true);
    } else {
      setC2Correct(false);
    }
  };

  const journeyStages = [
    {
      title: "Pulse Transmission",
      question: "If GPM flies at 435 km, how long does the pulse take to reach the ocean?",
      options: [
        "1.45 milliseconds",
        "1.45 seconds",
        "5 seconds"
      ],
      correct: 0,
      explain: {
        beginner: "Microwaves travel at the speed of light, crossing the 435 km distance in a blink of an eye—just 1.45 thousandths of a second.",
        intermediate: "Speed of light is 300,000 km/s. Time = Distance / speed = 435 / 300,000 = 1.45 milliseconds.",
        advanced: "The round-trip delay is tracked from transmission gate ($r=0$) using a Master Clock (5.76 MHz frequency) resolving range gates to 125m resolution."
      }
    },
    {
      title: "Dry Snow Layer",
      question: "Why does dry snow cause very little signal loss (attenuation)?",
      options: [
        "Snow is cold and freezes the beam.",
        "Dry ice crystals do not absorb microwave energy because liquid water is absent.",
        "Snow acts like a mirror."
      ],
      correct: 1,
      explain: {
        beginner: "Dry ice crystals behave almost like clean air—they bounce a small amount of signal back but do not soak up the beam's energy.",
        intermediate: "Dry ice has a low dielectric index ($|K|^2 \\approx 0.176$), causing near-zero absorption (specific attenuation $k \\approx 0$).",
        advanced: "Because the imaginary part of the complex refractive index of ice is tiny, the specific attenuation coefficient ($k$) in the dry snow region is negligible ($k < 0.02$ dB/km at both Ku and Ka bands)."
      }
    },
    {
      title: "The Melting Layer",
      question: "What makes the melting layer look like an intense storm peak (Bright Band)?",
      options: [
        "Falling snowflakes accelerate.",
        "Dry snow crystals melt, getting coated in a film of water that acts like a massive raindrop.",
        "Ice crystals merge."
      ],
      correct: 1,
      explain: {
        beginner: "As dry snow starts to melt, the snowflake gets wrapped in a sticky water layer. This film acts like a giant water mirror, reflecting massive energy back to the radar.",
        intermediate: "The dielectric factor of melting snow rises to match liquid water ($|K|^2 \\approx 0.93$), causing a surge in reflectivity (Ze) due to size and coating.",
        advanced: "This is the Bright Band. The mixture of ice cores covered in water maximizes the dielectric constant ($|K|^2$) while preserving the large physical diameter of the snowflake, causing a localized peak in the backscattering cross-section (GPM variable `zFactorMeasured`)."
      }
    },
    {
      title: "Rain Attenuation",
      question: "Which band suffers worse attenuation as it travels down through liquid rain?",
      options: [
        "Ku-band (13.6 GHz)",
        "Ka-band (35.5 GHz)",
        "Both suffer identical loss"
      ],
      correct: 1,
      explain: {
        beginner: "The Ka-band has a shorter wavelength and gets blocked/absorbed easily by water droplets. It loses energy rapidly as it descends.",
        intermediate: "Ka-band (8.4mm wavelength) is closer in size to raindrops, transitioning from Rayleigh to Mie scattering. Attenuation coefficient $k$ is much higher than Ku-band.",
        advanced: "At Ka-band (35.5 GHz), Mie scattering rolloff and specific attenuation ($k$) are significant. Ka-band signal experiences up to 4 times more attenuation per km than Ku-band, leading to a large DFR (`zFactorMeasured[Ku] - zFactorMeasured[Ka]`) near the surface."
      }
    },
    {
      title: "Surface Echo",
      question: "What can the reduction in the ocean reflection echo tell us?",
      options: [
        "The ocean depth.",
        "The total amount of signal lost through the entire storm column (Path Integrated Attenuation).",
        "Wind speed."
      ],
      correct: 1,
      explain: {
        beginner: "Since we know how strong the ocean mirror usually is under clear skies, the decrease in the ocean echo tells us exactly how much the rain column blocked our beam.",
        intermediate: "Comparing the measured sea backscatter to clear air gives the total column Path Integrated Attenuation: $PIA = \\sigma_{0,\\text{ref}} - \\sigma_{0,\\text{meas}}$.",
        advanced: "This is the Surface Reference Technique (SRT). It outputs the total path integrated attenuation ($PIA_{\\text{SRT}}$), which provides a crucial boundary constraint to scale the Hitschfeld-Bordan profile solver."
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Chapter Stepper */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-orange-400 font-semibold tracking-widest uppercase font-mono flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>Rediscovery Mode ({level} depth)</span>
          </span>
          <h1 className="text-xl font-bold text-white">
            Chapter {chapter}: {
              chapter === 1 ? "Meet the GPM satellite" :
              chapter === 2 ? "Timing Echoes" :
              chapter === 3 ? "Wave Scattering Physics" :
              "The Journey of a Radar Pulse"
            }
          </h1>
        </div>
        
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
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- CHAPTER 1: ORBITS --- */}
      {chapter === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest">Step 1: Observe & Experiment</span>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Look at the 3D GPM orbital model on the right. GPM does not cross the poles. Instead, it orbits tilted at a 65-degree angle, sweeping a cross-track swath pattern on the Earth's surface.
              </p>
            </div>

            {/* Prediction Challenge */}
            <div className="glass-panel p-5 rounded-xl border border-gray-850 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Predict & Discover Patterns</span>
              </div>
              
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                If the satellite orbits tilted at 65 degrees instead of a standard sun-synchronous polar orbit (which crosses the poles at the exact same local time daily), what will be the consequence for mapping rain?
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  "It will take more rocket fuel to stay in space.",
                  "It allows GPM to scan the same geographic coordinates at different times of day, mapping the hourly precipitation cycle.",
                  "It prevents the radar sensors from overheating."
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!c1Checked) setC1Prediction(idx);
                    }}
                    disabled={c1Checked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      c1Checked 
                        ? idx === 1 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : c1Prediction === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-950 border-gray-900 text-gray-600 opacity-60"
                        : c1Prediction === idx 
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
                    if (c1Prediction === 1) setC1Correct(true);
                  }}
                  disabled={c1Prediction === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Submit Prediction
                </button>
              ) : (
                <div className="flex flex-col gap-3 p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {c1Correct ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Correct Prediction!</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Prediction Incorrect</span>
                    )}
                  </div>

                  {/* Level-adjusted Explanation */}
                  {level === "beginner" && (
                    <p className="leading-relaxed font-light">
                      <strong>The Principle:</strong> Rain does not fall on a fixed clock. By tilting the orbit, GPM crosses locations at 8:00 AM today, 10:00 AM tomorrow, and 2:00 PM the next day, letting us map early morning storms vs afternoon showers.
                    </p>
                  )}
                  {level === "intermediate" && (
                    <p className="leading-relaxed font-light">
                      <strong>Explanation:</strong> A tilted orbit precesses relative to the sun. This means GPM samples the diurnal (hourly) precipitation cycles over weeks, which is impossible with fixed sun-synchronous orbits.
                    </p>
                  )}
                  {level === "advanced" && (
                    <div className="flex flex-col gap-2 font-light">
                      <p>
                        <strong>Formalization:</strong> The orbit inclination is $65^\circ$ with a nodal precession period of 53 days. This precessing orbit samples the complete diurnal cycle of tropical and sub-tropical precipitation.
                      </p>
                      <span className="text-[9px] font-mono text-gray-500">Related variables: `orbitState`, `scanStatus`.</span>
                    </div>
                  )}

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

      {/* --- CHAPTER 2: TIMING ECHOES --- */}
      {chapter === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest">Step 1: Observe & Experiment</span>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Use the slider to adjust the delay. Press <strong>Fire Pulse</strong> to watch the pulse travel down and bounce back to the satellite.
              </p>
            </div>

            {/* Timing Challenge */}
            <div className="glass-panel p-5 rounded-xl border border-gray-850 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Predict & Calculate Range</span>
              </div>

              {/* Time delay slider */}
              <div className="flex flex-col gap-2 p-3 rounded bg-slate-900 border border-gray-850">
                <label className="text-xs font-semibold text-gray-400 flex justify-between">
                  <span>Adjust Echo Return Delay:</span>
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
                  "If the echo takes exactly <span className="text-white font-bold">{timeDelay} μs</span> to return, what is the distance to the storm?"
                </p>
                
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="number" placeholder="Enter range (km)" value={c2Input}
                    onChange={(e) => setC2Input(e.target.value)} disabled={c2Checked}
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
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {c2Correct ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Correct Calculation!</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Incorrect</span>
                    )}
                  </div>
                  
                  {/* Level-adjusted Explanation */}
                  {level === "beginner" && (
                    <p className="leading-relaxed font-light">
                      <strong>The Principle:</strong> Microwaves travel at the speed of light. Because the pulse must go down and bounce back, the distance is exactly half the total flight time.
                    </p>
                  )}
                  {level === "intermediate" && (
                    <p className="leading-relaxed font-light">
                      <strong>Explanation:</strong> {"$Distance = \\frac{\\text{speed of light} \\cdot t}{2}$"}. At {"$0.3\\text{ km}/\\mu\\text{s}$"}, the range for {timeDelay} {"$\\mu\\text{s}$"} is exactly {((0.3 * timeDelay) / 2).toFixed(2)} km.
                    </p>
                  )}
                  {level === "advanced" && (
                    <div className="flex flex-col gap-2 font-light">
                      <p>
                        <strong>Formalization:</strong> The distance $r$ to the target bin is defined by:
                        {"\\[r = \\frac{c \\cdot \\tau}{2}\\]"}
                        where {"$c \\approx 2.9979 \\times 10^8\\text{ m/s}$"} and {"$\\tau$"} is the round-trip echo delay.
                      </p>
                      <span className="text-[9px] font-mono text-gray-500">Related variable: `zFactorMeasured`.</span>
                    </div>
                  )}

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

          {/* Interactive pulse visualizer */}
          <div className="lg:col-span-7 h-[400px] border border-gray-800 bg-slate-950 rounded-xl relative overflow-hidden flex flex-col justify-between p-4">
            <div className="flex justify-between items-start">
              <span className="text-[9px] text-gray-500 font-mono">PULSE TRAVEL SIMULATOR</span>
              <button 
                onClick={triggerPulse} disabled={pulseActive}
                className="py-1 px-3 bg-blue-600 hover:bg-blue-500 rounded text-[9px] font-bold text-white disabled:opacity-40"
              >
                Fire Pulse
              </button>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6 items-end mt-4">
              <div className="h-full border border-gray-900 rounded-lg relative overflow-hidden flex flex-col justify-end bg-slate-950/20">
                <div className="absolute top-[35%] left-0 w-full h-[30%] bg-slate-400/5 border-y border-dashed border-gray-800 flex items-center justify-center text-[9px] text-gray-500">
                  Melting Layer
                </div>

                {pulseActive && (
                  <div 
                    className="absolute w-full h-1 bg-yellow-400/80 animate-pulse shadow-glow"
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

      {/* --- CHAPTER 3: SCATTERING PHYSICS --- */}
      {chapter === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest">Step 1: Observe & Experiment</span>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Use the slider on the right to adjust the drop size $D_m$. Watch how the Ku-band (Rayleigh) and Ka-band (Mie) curves react as drop sizes grow.
              </p>
            </div>

            {/* Scattering Challenge */}
            <div className="glass-panel p-5 rounded-xl border border-gray-850 bg-slate-950/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Predict & Discover Patterns</span>
              </div>

              <div className="flex flex-col gap-1.5 p-3 rounded bg-slate-900 border border-gray-850">
                <label className="text-xs font-semibold text-gray-400 flex justify-between">
                  <span>Mean Drop Size (Dm):</span>
                  <span className="text-orange-400 font-mono font-bold">{dropSize.toFixed(2)} mm</span>
                </label>
                <input 
                  type="range" min="0.5" max="3.5" step="0.1" value={dropSize}
                  onChange={(e) => {
                    if (!c3Checked) setDropSize(Number(e.target.value));
                  }}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                />
              </div>

              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Why does Ka-band reflectivity drop below Ku-band (creating a gap called DFR) once droplets exceed 1.2 mm, even though both beams hit the exact same raindrops?
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  "Ka-band is absorbed by the surrounding nitrogen in the air.",
                  "Ka-band wavelength (8.4mm) is close to the raindrop size, causing complex self-interference (Mie scattering) which saturates the signal.",
                  "Ku-band reflects off water, while Ka-band only reflects off ice."
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!c3Checked) setC3Prediction(idx);
                    }}
                    disabled={c3Checked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      c3Checked 
                        ? idx === 1 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : c3Prediction === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-950 border-gray-900 text-gray-650 opacity-60"
                        : c3Prediction === idx 
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
                    if (c3Prediction === 1) setC3Correct(true);
                  }}
                  disabled={c3Prediction === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Submit Prediction
                </button>
              ) : (
                <div className="p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400 leading-relaxed font-light">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {c3Correct ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Correct Discovery!</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Prediction Incorrect</span>
                    )}
                  </div>
                  
                  {/* Level-adjusted Explanation */}
                  {level === "beginner" && (
                    <p className="leading-relaxed font-light">
                      <strong>The Principle:</strong> Shorter waves (Ka) struggle to resolve large objects cleanly, while longer waves (Ku) handle them without losing reflectivity. The difference between their reflections tells us drop sizes.
                    </p>
                  )}
                  {level === "intermediate" && (
                    <p className="leading-relaxed font-light">
                      <strong>Explanation:</strong> Smaller drops follow Rayleigh scattering ({"$Z \\propto D^6$"} for both bands). Larger drops cross into Mie scattering for Ka-band, causing it to roll off and creating the Dual Frequency Ratio (DFR).
                    </p>
                  )}
                  {level === "advanced" && (
                    <div className="flex flex-col gap-2 font-light">
                      <p>
                        <strong>Formalization:</strong> The Dual Frequency Ratio is defined by:
                        {"\\[DFR = Z_{e,\\text{Ku}} - Z_{e,\\text{Ka}}\\]"}
                        In the Mie scattering regime {"($D_m > 1.2$ mm)"}, the backscattering cross-section {"$\\sigma_b(D_m)$"} at Ka-band is smaller than its Rayleigh approximation, making {"$DFR$"} a unique function of {"$D_m$"}.
                      </p>
                      <span className="text-[9px] font-mono text-gray-500">Related variables: `zFactorCorrected`, `meanDomeDiameter`.</span>
                    </div>
                  )}

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

          {/* Interactive DFR Curves sandbox */}
          <div className="glass-panel p-6 rounded-xl border border-gray-800 bg-slate-950/40 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-1 border-b border-gray-850 pb-2">
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">INTUITIVE PHYSICS SANDBOX</span>
              <h3 className="text-xs font-bold text-white uppercase">Rayleigh vs. Mie Scattering (DFR)</h3>
            </div>

            <div className="h-44 border-l border-b border-gray-850 relative mt-4 flex items-end pl-8 pb-4 pr-2">
              <div className="absolute left-1 top-0 bottom-4 text-[8px] text-gray-500 font-mono flex flex-col justify-between pointer-events-none select-none">
                <span>40 dBZ</span>
                <span>20 dBZ</span>
                <span>0 dBZ</span>
              </div>

              <svg className="w-full h-full absolute inset-y-0 right-2 left-8 h-[calc(100%-16px)] w-[calc(100%-40px)] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="16.6" y1="0" x2="16.6" y2="100" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="83.3" y1="0" x2="83.3" y2="100" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2" />

                {/* Shaded DFR area */}
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
                      kaPts.unshift(`${x},${yKa}`);
                    }
                    return [...kuPts, ...kaPts].join(" ");
                  })()}
                  fill="rgba(139, 92, 246, 0.08)"
                />

                {/* Ku Curve */}
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

                {/* Ka Curve */}
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

                {/* Tracker Indicator */}
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

              <div className="absolute bottom-1 left-8 right-2 text-[8px] text-gray-500 font-mono flex justify-between pointer-events-none select-none">
                <span>0.5 mm</span>
                <span>1.5 mm</span>
                <span>2.5 mm</span>
                <span>3.5 mm</span>
              </div>
            </div>

            {/* Readout */}
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
                      Both frequencies mirror each other. This is the Rayleigh zone.
                    </p>
                  ) : (
                    <p>
                      Curves diverge. The gap size reveals the exact mean drop diameter ($D_m$).
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- CHAPTER 4: PULSE JOURNEY STEPPER --- */}
      {chapter === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Steps sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {journeyStages.map((stage, idx) => (
              <button
                key={stage.title}
                onClick={() => {
                  setJourneyStep(idx);
                  setC4Prediction(null);
                  setC4Checked(false);
                  setC4Correct(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  journeyStep === idx 
                    ? "bg-slate-800 text-white border-orange-500/40" 
                    : "bg-slate-900/60 border-gray-855 text-gray-400 hover:text-white"
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
              <span className="text-[9px] text-orange-400 font-mono font-bold uppercase tracking-wider">STAGE {journeyStep + 1} OF 5</span>
              <h3 className="text-md font-bold text-white">{journeyStages[journeyStep].title}</h3>
            </div>

            {/* Predict Challenge */}
            <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col gap-4 bg-slate-955/20">
              <div className="flex items-center gap-2 border-b border-gray-850 pb-2">
                <QuestionIcon className="w-4.5 h-4.5 text-orange-400" />
                <span className="text-xs font-bold text-white">Predict & Verify Concept</span>
              </div>
              
              <p className="text-xs text-gray-300 font-light leading-normal">{journeyStages[journeyStep].question}</p>

              <div className="flex flex-col gap-2">
                {journeyStages[journeyStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!c4Checked) setC4Prediction(idx);
                    }}
                    disabled={c4Checked}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      c4Checked 
                        ? idx === journeyStages[journeyStep].correct 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-semibold"
                          : c4Prediction === idx 
                            ? "bg-red-950/25 border-red-500/30 text-red-400"
                            : "bg-slate-955 border-gray-900 text-gray-600 opacity-60"
                        : c4Prediction === idx 
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
                    if (c4Prediction === journeyStages[journeyStep].correct) setC4Correct(true);
                  }}
                  disabled={c4Prediction === null}
                  className="py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-40"
                >
                  Verify Prediction
                </button>
              ) : (
                <div className="p-3 rounded bg-slate-900 border border-gray-850 text-xs animate-fadeIn text-gray-400 leading-normal font-light">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {c4Correct ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Concept Solved!</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Incorrect</span>
                    )}
                  </div>
                  
                  {/* Level-adjusted Explanation */}
                  <p className="mt-1">
                    {level === "beginner" && journeyStages[journeyStep].explain.beginner}
                    {level === "intermediate" && journeyStages[journeyStep].explain.intermediate}
                    {level === "advanced" && journeyStages[journeyStep].explain.advanced}
                  </p>

                  {c4Correct && journeyStep < 4 && (
                    <button 
                      onClick={() => {
                        setJourneyStep(prev => prev + 1);
                        setC4Prediction(null);
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
