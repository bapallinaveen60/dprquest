"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Home as HomeIcon, 
  Compass as CompassIcon, 
  MessageSquare as MessageIcon, 
  User as UserIcon,
  ChevronLeft,
  MoreHorizontal
} from "lucide-react";
import {
  PreSimulation,
  VerSimulation,
  CsfSimulation,
  DsdSimulation,
  SrtSimulation,
  TrgSimulation,
  SlvSimulation
} from "@/components/RemotionSimulations";

const Player = dynamic(() => import("@remotion/player").then((mod) => mod.Player), {
  ssr: false,
  loading: () => <div className="h-40 bg-slate-950 rounded flex items-center justify-center text-xs text-slate-500 animate-pulse">LOADING PHYSICS SIMULATOR...</div>
});

// =============================================================
// Mobile Mockup Helper Components
// =============================================================
function IOSStatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? "#fff" : "#000";
  return (
    <div style={{
      display: "flex", gap: 154, alignItems: "center", justifyContent: "center",
      padding: "21px 24px 19px", boxSizing: "border-box",
      position: "relative", zIndex: 20, width: "100%",
    }}>
      <div style={{ flex: 1, height: 22, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 1.5 }}>
        <span style={{
          fontFamily: '-apple-system, "SF Pro", system-ui', fontWeight: 590,
          fontSize: 17, lineHeight: "22px", color: c,
        }}>9:41</span>
      </div>
      <div style={{ flex: 1, height: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, paddingTop: 1, paddingRight: 1 }}>
        <svg width="19" height="12" viewBox="0 0 19 12">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={c}/>
          <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={c}/>
          <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={c}/>
          <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={c}/>
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12">
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c}/>
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c}/>
          <circle cx="8.5" cy="10.5" r="1.5" fill={c}/>
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width="20" height="9" rx="2" fill={c}/>
          <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

function IOSGlassPill({ children, dark = false }: { children: any; dark?: boolean }) {
  return (
    <div style={{
      height: 44, minWidth: 44, borderRadius: 9999,
      position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: dark
        ? "0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)"
        : "0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: 9999,
        backdropFilter: "blur(12px) saturate(180%)",
        WebkitBackdropFilter: "blur(12px) saturate(180%)",
        background: dark ? "rgba(120,120,128,0.28)" : "rgba(255,255,255,0.5)",
      }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: 9999,
        boxShadow: dark
          ? "inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)"
          : "inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)",
        border: dark ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(0,0,0,0.06)",
      }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", padding: "0 4px" }}>
        {children}
      </div>
    </div>
  );
}

function IOSNavBar({ title = "Title", dark = false, onBack }: { title?: string; dark?: boolean; onBack: () => void }) {
  const muted = dark ? "rgba(255,255,255,0.6)" : "#404040";
  const text = dark ? "#fff" : "#000";
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 10,
      paddingTop: 62, paddingBottom: 10, position: "relative", zIndex: 5,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
      }}>
        <button 
          onClick={onBack} 
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <IOSGlassPill dark={dark}>
            <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft style={{ color: muted, width: 20, height: 20 }} />
            </div>
          </IOSGlassPill>
        </button>
        
        <IOSGlassPill dark={dark}>
          <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MoreHorizontal style={{ color: muted, width: 22, height: 22 }} />
          </div>
        </IOSGlassPill>
      </div>
      <div style={{
        padding: "0 16px",
        fontFamily: '-apple-system, system-ui',
        fontSize: 34, fontWeight: 700, lineHeight: "41px",
        color: text, letterSpacing: 0.4,
      }}>{title}</div>
    </div>
  );
}

function IOSDevice({ children, width = 402, height = 874, dark = false, onBack }: { children: any; width?: number; height?: number; dark?: boolean; onBack: () => void }) {
  return (
    <div style={{
      width, height, borderRadius: 48, overflow: "hidden",
      position: "relative", background: dark ? "#000" : "#F2F2F7",
      boxShadow: "0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)",
      fontFamily: "-apple-system, system-ui, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      {/* dynamic island */}
      <div style={{
        position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)",
        width: 126, height: 37, borderRadius: 24, background: "#000", zIndex: 50,
      }} />
      {/* status bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <IOSStatusBar dark={dark} />
      </div>
      {/* nav + content */}
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
      </div>
      {/* home indicator */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 60,
        height: 34, display: "flex", justifyContent: "center", alignItems: "flex-end",
        paddingBottom: 8, pointerEvents: "none",
      }}>
        <div style={{
          width: 139, height: 5, borderRadius: 100,
          background: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.25)",
        }} />
      </div>
    </div>
  );
}

// =============================================================
// Module Definitions & Interactive Content
// =============================================================
const MODULE_DEFS = [
  { id: "pre", step: 1, title: "Is There Rain At All?", kicker: "Step 1 · PRE" },
  { id: "ver", step: 2, title: "What's the Air Doing?", kicker: "Step 2 · VER" },
  { id: "csf", step: 3, title: "What Kind of Rain?", kicker: "Step 3 · CSF" },
  { id: "dsd", step: 4, title: "Which Drops Made This Echo?", kicker: "Step 4 · DSD" },
  { id: "srt", step: 5, title: "How Much Signal Was Lost?", kicker: "Step 5 · SRT" },
  { id: "trg", step: 6, title: "Can We Trust the Retrieval?", kicker: "Step 6 · TRG" },
  { id: "slv", step: 7, title: "So, What's the Rain Rate?", kicker: "Step 7 · SLV" },
];

const CONTENT: Record<string, {
  intro: Record<string, string>;
  explain: Record<string, string>;
  threshold?: number;
  freezeLevel?: number;
  expected?: number;
  observed?: number;
}> = {
  pre: {
    intro: {
      beginner: "The satellite's radar sends energy down and listens for what bounces back. Before anything else, it has to decide: is this echo rain, or just empty sky? Drag the slider to set how strong the echo is, then guess.",
      intermediate: "PRE converts received power into a measured reflectivity factor (Zm) and flags each pixel rain or no-rain before any other module runs. Set a reflectivity value and predict how PRE would classify it.",
      advanced: "PRE derives Zm′ from received power Pr via the radar equation and applies a rain/no-rain threshold ahead of VER, CSF, or retrieval. Set Zm and predict PRE's flagPrecip outcome.",
    },
    explain: {
      beginner: "Below about 18 dBZ the echo is too weak to be confident it's rain, it could just be noise. Above that, PRE calls it rain.",
      intermediate: "PRE's detection threshold sits near 18 dBZ of measured reflectivity. Below it, flagPrecip is no-rain; above it, the profile moves on to VER and CSF.",
      advanced: "The ~18 dBZ threshold reflects DPR's minimum detectable signal; flagPrecip and zFactorMeasured are fixed here before any downstream module runs.",
    },
    threshold: 18,
  },
  ver: {
    intro: {
      beginner: "As the radar beam travels down through the air, it crosses a line where the temperature hits 0°C. Above that line, falling particles are ice and snow; below it, they've melted into rain. Move the marker and guess which side you're on.",
      intermediate: "VER models temperature, pressure, water vapor and cloud liquid water along the beam, and locates the 0°C level, essential for the bright band CSF looks for. Move the marker and predict ice or rain.",
      advanced: "VER supplies the atmospheric profile used for gaseous and cloud-liquid attenuation correction, and pinpoints the melting layer used downstream by CSF. Predict which side of the 4.5 km freezing level your chosen height falls on.",
    },
    explain: {
      beginner: "The freezing level sits around 4.5 km here. Above it, the falling particles are ice or snow; below it, they've become rain.",
      intermediate: "With the 0°C level at 4.5 km, anything above is frozen hydrometeors and anything below is liquid rain, this boundary is what produces the radar bright band.",
      advanced: "The 0°C level (4.5 km) marks the melting layer; CSF uses this height, plus the reflectivity bump it produces, to help separate stratiform from convective profiles.",
    },
    freezeLevel: 4.5,
  },
  csf: {
    intro: {
      beginner: "Tap to scan a rain column. If there's a bright, sudden bump in the signal partway down, that's melting snow, a bright band. Stratiform rain almost always has one; convective storms usually don't.",
      intermediate: "CSF classifies each profile as stratiform, convective, or other, partly by detecting a bright band and partly by comparing horizontal reflectivity patterns and the Ku–Ka dual-frequency ratio. Scan the profile and classify it.",
      advanced: "The V-method flags a profile stratiform when a bright band is detected and reflectivity stays below the convective threshold; the H-method and DFRm method cross-check with horizontal structure and Ku–Ka differences. Scan and classify.",
    },
    explain: {
      beginner: "This profile shows a clear bright band, a sign of a wide, gently melting layer, so it's stratiform rain.",
      intermediate: "A detected bright band with reflectivity below the convective threshold is classified stratiform by the V-method.",
      advanced: "Bright-band detection plus sub-threshold reflectivity satisfies the V-method's stratiform criterion; H-method and DFRm results would be checked for consistency before finalizing typePrecip.",
    },
  },
  dsd: {
    intro: {
      beginner: "The same echo can come from a few big drops or lots of small ones, and that difference changes how much rain actually falls. Drag drop size and watch the satellite's two radar colors, Ku and Ka, react differently as drops grow.",
      intermediate: "Ku-band and Ka-band reflectivity both grow with drop size, but Ka starts falling behind once drops approach its wavelength. Explore the slider, then predict where they split apart.",
      advanced: "Rayleigh scattering (Z ∝ D⁶) holds while D ≪ λ; Ka's shorter wavelength (8.4 mm vs Ku's 22 mm) causes it to depart from that curve first, producing the dual-frequency ratio DPR uses to size hydrometeors. Predict the divergence diameter.",
    },
    explain: {
      beginner: "Once raindrops grow past about 2 mm, the shorter Ka-band signal starts weakening compared to Ku, and that gap is what tells the algorithm the drops are big.",
      intermediate: "Around 2 mm, Ka-band reflectivity begins departing from the D⁶ Rayleigh trend while Ku-band stays closer to it, producing a rising dual-frequency ratio.",
      advanced: "Divergence emerges near D ≈ 2 mm, where Ka's shorter wavelength brings drop size into the Mie regime sooner than Ku's, the physical basis for DFR-based drop-size retrievals.",
    },
  },
  srt: {
    intro: {
      beginner: "Without rain, the ground normally sends back a steady echo. With heavy rain in the way, some of that energy gets absorbed before it even makes the round trip. Measure the echo, then guess how many decibels were lost.",
      intermediate: "SRT compares the surface echo expected in clear conditions against what's actually observed; the gap approximates path-integrated attenuation (PIA). Measure it and predict the loss in dB.",
      advanced: "SRT estimates PIA from the deficit between the rain-free reference σ⁰ and the observed surface return, often blended with Hitschfeld–Bordan or dual-wavelength estimates. Predict the PIA in dB from this measurement.",
    },
    explain: {
      beginner: "The echo dropped from 100 to 35, about a 4.6 dB loss. That missing signal tells the algorithm how much rain was in the way.",
      intermediate: "10·log10(100/35) ≈ 4.6 dB of path-integrated attenuation, SRT feeds this straight to the Solver for attenuation correction.",
      advanced: "PIA ≈ 4.6 dB from the σ⁰ deficit; in practice this is combined with Hitschfeld–Bordan or Ku–Ka differential estimates for a more robust attenuation correction.",
    },
    expected: 100, observed: 35,
  },
  trg: {
    intro: {
      beginner: "The radar footprint on the ground isn't a single point, it's a patch several kilometers wide. If part of that patch has heavy rain and part has none, the radar sees a blurred average, not the truth. Should we trust the usual math here?",
      intermediate: "TRG checks for two problems: multiple scattering and non-uniform beam filling (NUBF), where rain isn't the same across a footprint. Look at this patch and decide whether to trust the standard Solver.",
      advanced: "TRG runs just before SLV, using PRE/VER/SRT/CSF/DSD outputs to flag profiles where NUBF or multiple scattering would invalidate the standard Solver's single-scattering, uniform-fill assumptions.",
    },
    explain: {
      beginner: "This footprint mixes rain and clear cells, that's non-uniform beam filling. TRG would flag it so the Solver can adjust.",
      intermediate: "A footprint with mixed rain and no-rain cells shows non-uniform beam filling, exactly what TRG is built to catch before the Solver runs.",
      advanced: "The mixed-cell pattern is a textbook NUBF case: the footprint-averaged echo no longer represents a single homogeneous rain rate, so TRG would flag it for the Solver.",
    },
  },
  slv: {
    intro: {
      beginner: "Two storms can send back the exact same radar echo and still be raining at very different rates, because the raindrops themselves are different sizes. Which rain rate belongs to the storm with fewer, bigger drops?",
      intermediate: "For the same measured Z, different DSD assumptions (Nw, Dm) map to different rain rates. Pick the estimate matching a population of large, sparse drops.",
      advanced: "R and Z are both functions of the DSD but weight different moments (Z ∝ ∫N(D)D⁶dD, R ∝ ∫N(D)D^3.67v(D)dD); identical Z can correspond to different R depending on Dm and Nw. Pick the rate consistent with large Dm, low Nw.",
    },
    explain: {
      beginner: "Large, sparse drops carry more mass per drop, so for the same echo they produce the higher rain rate, 12 mm/h. This is why CSF and DSD run before SLV: the Solver needs the right particle assumptions to turn Z into an accurate rain rate.",
      intermediate: "Large-Dm, low-Nw populations yield a higher R for the same Z, about 12 mm/h here. SLV depends on the DSD assumptions handed to it by earlier modules.",
      advanced: "The higher-order D^3.67 weighting of R versus D⁶ for Z means a large-Dm/low-Nw population resolves to ~12 mm/h at this Z, underscoring why SLV's output is only as good as the DSD and classification feeding it.",
    },
  },
};

export default function StoryPage() {
  const router = useRouter();

  // Screen state
  const [screen, setScreen] = useState<"home" | "mission">("home");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [xpTotal, setXpTotal] = useState(0);
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({
    pre: false, ver: false, csf: false, dsd: false, srt: false, trg: false, slv: false
  });

  // Responsive device view state
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Per-mission interaction states
  const [preVal, setPreVal] = useState(10);
  const [preChoice, setPreChoice] = useState<"norain" | "rain" | null>(null);
  const [preChecked, setPreChecked] = useState(false);
  const [preCorrect, setPreCorrect] = useState(false);

  const [verVal, setVerVal] = useState(2.0);
  const [verChoice, setVerChoice] = useState<"ice" | "rain" | null>(null);
  const [verChecked, setVerChecked] = useState(false);
  const [verCorrect, setVerCorrect] = useState(false);

  const [csfRevealed, setCsfRevealed] = useState(false);
  const [csfChoice, setCsfChoice] = useState<"strat" | "conv" | null>(null);
  const [csfChecked, setCsfChecked] = useState(false);
  const [csfCorrect, setCsfCorrect] = useState(false);

  const [dropSize, setDropSize] = useState(2.0);
  const [dsdPredicted, setDsdPredicted] = useState("");
  const [dsdChecked, setDsdChecked] = useState(false);
  const [dsdCorrect, setDsdCorrect] = useState(false);

  const [srtRevealed, setSrtRevealed] = useState(false);
  const [srtPredicted, setSrtPredicted] = useState("");
  const [srtChecked, setSrtChecked] = useState(false);
  const [srtCorrect, setSrtCorrect] = useState(false);

  const [trgChoice, setTrgChoice] = useState<"trust" | "flag" | null>(null);
  const [trgChecked, setTrgChecked] = useState(false);
  const [trgCorrect, setTrgCorrect] = useState(false);

  const [slvChoice, setSlvChoice] = useState<string | null>(null);
  const [slvChecked, setSlvChecked] = useState(false);
  const [slvCorrect, setSlvCorrect] = useState(false);

  // Sync Learning Level from local storage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("gpm_learning_level") || "beginner";
      setLevel(saved as any);
    };
    handleStorageChange();
    window.addEventListener("storage_learning_level", handleStorageChange);

    // Responsive frame check
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("storage_learning_level", handleStorageChange);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const setLevelAndSync = (newLevel: "beginner" | "intermediate" | "advanced") => {
    setLevel(newLevel);
    localStorage.setItem("gpm_learning_level", newLevel);
    window.dispatchEvent(new Event("storage_learning_level"));
  };

  const goToMission = (id: string) => {
    setActiveMission(id);
    setScreen("mission");
    if (id === "pre") {
      setPreVal(10);
      setPreChoice(null);
      setPreChecked(false);
      setPreCorrect(false);
    } else if (id === "ver") {
      setVerVal(2.0);
      setVerChoice(null);
      setVerChecked(false);
      setVerCorrect(false);
    } else if (id === "csf") {
      setCsfRevealed(false);
      setCsfChoice(null);
      setCsfChecked(false);
      setCsfCorrect(false);
    } else if (id === "dsd") {
      setDropSize(2.0);
      setDsdPredicted("");
      setDsdChecked(false);
      setDsdCorrect(false);
    } else if (id === "srt") {
      setSrtRevealed(false);
      setSrtPredicted("");
      setSrtChecked(false);
      setSrtCorrect(false);
    } else if (id === "trg") {
      setTrgChoice(null);
      setTrgChecked(false);
      setTrgCorrect(false);
    } else if (id === "slv") {
      setSlvChoice(null);
      setSlvChecked(false);
      setSlvCorrect(false);
    }
  };

  const goHome = () => setScreen("home");

  const finishMission = () => {
    if (!activeMission) return;
    const isCorrect = 
      activeMission === "pre" ? preCorrect :
      activeMission === "ver" ? verCorrect :
      activeMission === "csf" ? csfCorrect :
      activeMission === "dsd" ? dsdCorrect :
      activeMission === "srt" ? srtCorrect :
      activeMission === "trg" ? trgCorrect :
      activeMission === "slv" ? slvCorrect : false;

    setDone(prev => ({ ...prev, [activeMission]: true }));
    setXpTotal(prev => prev + (isCorrect ? 40 : 10));
    setScreen("home");
  };

  // Derive layout configurations
  const levelDefs = [
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
  ];
  const levels = levelDefs.map((l) => ({
    id: l.id,
    label: l.label,
    checked: level === l.id,
    onSelect: () => setLevelAndSync(l.id as any)
  }));

  const order = ["pre", "ver", "csf", "dsd", "srt", "trg", "slv"];
  const missions = MODULE_DEFS.map((m, i) => {
    const unlocked = i === 0 || done[order[i - 1]];
    const isDone = done[m.id];
    return {
      id: m.id,
      kicker: "Step " + m.step + " of 7",
      title: m.title,
      desc: CONTENT[m.id].intro.beginner.split(".")[0] + ".",
      tagLabel: isDone ? "Done" : unlocked ? "Start" : "Locked",
      tagClass: isDone ? "tag-accent" : unlocked ? "tag-outline" : "tag-neutral",
      cursor: unlocked ? "pointer" : "default",
      opacity: unlocked ? 1 : 0.5,
      onOpen: unlocked ? () => goToMission(m.id) : () => {},
    };
  });
  const doneCount = order.filter((id) => done[id]).length;
  const progressPct = Math.round((doneCount / 7) * 100);

  const activeDef = activeMission ? MODULE_DEFS.find((m) => m.id === activeMission) : null;
  const missionKicker = activeDef ? activeDef.kicker : "";
  const missionTitle = activeDef ? activeDef.title : "";
  const content = activeMission ? CONTENT[activeMission] : null;
  const introText = content ? content.intro[level] : "";

  // ---- per-module derived values ----
  let hasSlider = false, sliderLabel = "", sliderValueLabel = "", sliderMin = 0, sliderMax = 100, sliderStep = 1, sliderVal = 0, sliderLocked = false, onSliderChange = (e: any) => {};
  let showBar = false, barPct = 0, barLeftLabel = "", barRightLabel = "";
  let showRevealButton = false, revealLabel = "", revealDone = false, onReveal = () => {};
  let isDsd = false, isCsf = false, isTrg = false, isSlv = false;
  let showChoice = false, choiceLabel = "", choiceOptions: any[] = [], choiceChecked = false;
  let showNumeric = false, numericLabel = "", numericPlaceholder = "", numericVal = "", onNumericChange = (e: any) => {}, numericChecked = false, showNumericCheckButton = false, checkNumeric = () => {}, numericCheckDisabled = true;
  let isChecked = false, feedbackHeadline = "", feedbackColor = "", feedbackBg = "", explainText = "";
  let kuPct = 0, kaPct = 0, dfrLabel = "0.0";
  let trgCells: any[] = [];
  let dropSizeLabel = "2.0";
  let onDropSizeChange = (e: any) => {};

  if (activeMission === "pre") {
    hasSlider = true;
    sliderLabel = "Measured reflectivity";
    sliderMin = 0; sliderMax = 40; sliderStep = 1; sliderVal = preVal;
    sliderValueLabel = preVal + " dBZ";
    sliderLocked = preChecked;
    onSliderChange = (e: any) => setPreVal(parseInt(e.target.value, 10));
    showBar = true; barPct = Math.round((preVal / 40) * 100);
    barLeftLabel = "clear"; barRightLabel = "strong echo";
    showChoice = !preChecked;
    choiceLabel = "Rain, or no rain?";
    choiceOptions = [
      { label: "No rain", btnClass: preChoice === "norain" ? "btn-primary" : "btn-secondary", onPick: () => setPreChoice("norain") },
      { label: "Rain", btnClass: preChoice === "rain" ? "btn-primary" : "btn-secondary", onPick: () => setPreChoice("rain") },
    ];
    choiceChecked = preChecked;
    isChecked = preChecked;
  }

  if (activeMission === "ver") {
    hasSlider = true;
    sliderLabel = "Beam height";
    sliderMin = 0; sliderMax = 8; sliderStep = 0.5; sliderVal = verVal;
    sliderValueLabel = verVal + " km";
    sliderLocked = verChecked;
    onSliderChange = (e: any) => setVerVal(parseFloat(e.target.value));
    showBar = true; barPct = Math.round((verVal / 8) * 100);
    barLeftLabel = "surface"; barRightLabel = "8 km";
    showChoice = !verChecked;
    choiceLabel = "Ice/snow, or rain, at this height?";
    choiceOptions = [
      { label: "Ice / snow", btnClass: verChoice === "ice" ? "btn-primary" : "btn-secondary", onPick: () => setVerChoice("ice") },
      { label: "Rain", btnClass: verChoice === "rain" ? "btn-primary" : "btn-secondary", onPick: () => setVerChoice("rain") },
    ];
    choiceChecked = verChecked;
    isChecked = verChecked;
  }

  if (activeMission === "csf") {
    isCsf = true;
    showChoice = csfRevealed && !csfChecked;
    choiceLabel = "Stratiform, or convective?";
    choiceOptions = [
      { label: "Stratiform", btnClass: csfChoice === "strat" ? "btn-primary" : "btn-secondary", onPick: () => setCsfChoice("strat") },
      { label: "Convective", btnClass: csfChoice === "conv" ? "btn-primary" : "btn-secondary", onPick: () => setCsfChoice("conv") },
    ];
    choiceChecked = csfChecked;
    isChecked = csfChecked;
  }

  if (activeMission === "dsd") {
    isDsd = true;
    dropSizeLabel = dropSize.toFixed(1);
    onDropSizeChange = (e: any) => setDropSize(parseFloat(e.target.value));
    const ku = Math.pow(dropSize, 6);
    const ka = dropSize < 2 ? Math.pow(dropSize, 6) : Math.pow(dropSize, 6) * (1 - (dropSize - 2) * 0.18);
    const maxRef = Math.pow(5, 6);
    kuPct = Math.min(100, (ku / maxRef) * 100);
    kaPct = Math.min(100, Math.max(2, (ka / maxRef) * 100));
    dfrLabel = (10 * Math.log10(ku / Math.max(ka, 0.001))).toFixed(1);
    showNumeric = true;
    numericLabel = "At what drop size (mm) do the two bands start to diverge?";
    numericPlaceholder = "e.g. 2";
    numericVal = dsdPredicted;
    onNumericChange = (e: any) => setDsdPredicted(e.target.value);
    numericChecked = dsdChecked;
    showNumericCheckButton = !dsdChecked;
    numericCheckDisabled = !dsdPredicted || String(dsdPredicted).trim() === "";
    checkNumeric = () => {
      const val = parseFloat(dsdPredicted);
      setDsdChecked(true);
      setDsdCorrect(!isNaN(val) && Math.abs(val - 2) <= 0.6);
    };
    isChecked = dsdChecked;
  }

  if (activeMission === "srt") {
    showRevealButton = !srtRevealed;
    revealLabel = "Measure the surface echo";
    onReveal = () => setSrtRevealed(true);
    hasSlider = false;
    sliderLabel = "Surface echo strength";
    sliderMin = 0; sliderMax = 100; sliderStep = 1;
    sliderVal = srtRevealed ? 35 : 100;
    sliderValueLabel = sliderVal + " / 100";
    sliderLocked = true;
    showBar = true; barPct = sliderVal;
    barLeftLabel = "0 (fully absorbed)"; barRightLabel = "100 (clear-sky reference)";
    showRevealButton = !srtRevealed;
    showNumeric = srtRevealed;
    numericLabel = "How much signal was lost, in dB (PIA)?";
    numericPlaceholder = "e.g. 5";
    numericVal = srtPredicted;
    onNumericChange = (e: any) => setSrtPredicted(e.target.value);
    numericChecked = srtChecked;
    showNumericCheckButton = srtRevealed && !srtChecked;
    numericCheckDisabled = !srtPredicted || String(srtPredicted).trim() === "";
    checkNumeric = () => {
      const val = parseFloat(srtPredicted);
      setSrtChecked(true);
      setSrtCorrect(!isNaN(val) && Math.abs(val - 4.6) <= 1);
    };
    isChecked = srtChecked;
  }

  if (activeMission === "trg") {
    isTrg = true;
    const pattern = [1, 0, 1, 0, 1, 1, 1, 0, 0];
    trgCells = pattern.map((v) => ({ color: v ? "var(--color-accent-200)" : "var(--color-neutral-200)" }));
    showChoice = !trgChecked;
    choiceLabel = "Trust the standard Solver, or flag this footprint?";
    choiceOptions = [
      { label: "Trust it", btnClass: trgChoice === "trust" ? "btn-primary" : "btn-secondary", onPick: () => setTrgChoice("trust") },
      { label: "Flag NUBF", btnClass: trgChoice === "flag" ? "btn-primary" : "btn-secondary", onPick: () => setTrgChoice("flag") },
    ];
    choiceChecked = trgChecked;
    isChecked = trgChecked;
  }

  if (activeMission === "slv") {
    isSlv = true;
    showChoice = !slvChecked;
    choiceLabel = "Which rain rate matches the large-drop storm?";
    choiceOptions = [
      { label: "5 mm/h", btnClass: slvChoice === "5" ? "btn-primary" : "btn-secondary", onPick: () => setSlvChoice("5") },
      { label: "12 mm/h", btnClass: slvChoice === "12" ? "btn-primary" : "btn-secondary", onPick: () => setSlvChoice("12") },
    ];
    choiceChecked = slvChecked;
    isChecked = slvChecked;
  }

  // Generic Choice confirming
  const choiceCheckMap: Record<string, () => void> = {
    pre: () => { setPreChecked(true); setPreCorrect((preChoice === "rain") === (preVal >= 18)); },
    ver: () => { setVerChecked(true); setVerCorrect((verChoice === "ice") === (verVal >= 4.5)); },
    csf: () => { setCsfChecked(true); setCsfCorrect(csfChoice === "strat"); },
    trg: () => { setTrgChecked(true); setTrgCorrect(trgChoice === "flag"); },
    slv: () => { setSlvChecked(true); setSlvCorrect(slvChoice === "12"); },
  };
  const choiceMadeMap: Record<string, any> = { pre: preChoice, ver: verChoice, csf: csfChoice, trg: trgChoice, slv: slvChoice };
  let showChoiceConfirm = false, choiceConfirmDisabled = true, confirmChoice = () => {};
  if (["pre", "ver", "csf", "trg", "slv"].includes(activeMission || "") && showChoice) {
    showChoiceConfirm = true;
    choiceConfirmDisabled = !choiceMadeMap[activeMission || ""];
    confirmChoice = choiceCheckMap[activeMission || ""];
  }

  if (isChecked && content && activeMission) {
    const correct = 
      activeMission === "pre" ? preCorrect :
      activeMission === "ver" ? verCorrect :
      activeMission === "csf" ? csfCorrect :
      activeMission === "dsd" ? dsdCorrect :
      activeMission === "srt" ? srtCorrect :
      activeMission === "trg" ? trgCorrect :
      activeMission === "slv" ? slvCorrect : false;

    const headlines: Record<string, string> = {
      pre: correct ? "Correct classification" : "Not quite",
      ver: correct ? "Correct" : "Not quite",
      csf: correct ? "Correct — stratiform" : "Actually, stratiform",
      trg: correct ? "Correct — flag it" : "Actually, this should be flagged",
      slv: correct ? "Correct — 12 mm/h" : "Actually, 12 mm/h",
      dsd: correct ? "Correct — around 2 mm" : "Not quite — it's around 2 mm",
      srt: correct ? "Correct — about 4.6 dB" : "Not quite — about 4.6 dB",
    };
    feedbackHeadline = headlines[activeMission];
    feedbackColor = correct ? "var(--color-accent-700)" : "var(--color-text)";
    feedbackBg = correct ? "var(--color-accent-100)" : "var(--color-surface)";
    explainText = content.explain[level];
  }

  // Common UI handlers
  const handleNavClick = (route: string) => {
    router.push(route);
  };

  const CSS_STYLES = `
    :root {
      --color-bg: #f3f2f2;
      --color-surface: #eae9e9;
      --color-text: #201e1d;
      --color-accent: #ec3013;
      --color-accent-2: #e15b47;
      --color-divider: rgba(32, 30, 29, 0.4);

      --color-neutral-100: #f8f4f4;
      --color-neutral-200: #eae7e7;
      --color-neutral-300: #d7d3d3;
      --color-neutral-400: #bab6b6;
      --color-neutral-500: #9b9797;
      --color-neutral-600: #7d7979;
      --color-neutral-700: #605d5d;
      --color-neutral-800: #444141;
      --color-neutral-900: #2d2b2b;

      --color-accent-100: #fff2ef;
      --color-accent-200: #ffe0d9;
      --color-accent-300: #ffc4b8;
      --color-accent-400: #ff9783;
      --color-accent-500: #ff563c;
      --color-accent-600: #dd2b0f;
      --color-accent-700: #ae1800;
      --color-accent-800: #7c1405;
      --color-accent-900: #4d170e;

      --color-accent-2-100: #fff2ef;
      --color-accent-2-200: #ffe0da;
      --color-accent-2-300: #ffc4b9;
      --color-accent-2-400: #ff9784;
      --color-accent-2-500: #ef6853;
      --color-accent-2-600: #c94b39;
      --color-accent-2-700: #9e3526;
      --color-accent-2-800: #71261b;
      --color-accent-2-900: #471d16;

      --font-heading: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-heading-weight: 800;
      --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

      --space-1: 4.0px;
      --space-2: 8.0px;
      --space-3: 12.0px;
      --space-4: 16.0px;
      --space-6: 24.0px;
      --space-8: 32.0px;

      --radius-sm: 0px;
      --radius-md: 0px;
      --radius-lg: 0px;

      --shadow-sm: 0 1px 2px rgba(45, 43, 43, 0.14);
      --shadow-md: 0 3px 10px rgba(45, 43, 43, 0.16);
      --shadow-lg: 0 12px 32px rgba(45, 43, 43, 0.22);
    }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      cursor: pointer; text-decoration: none;
      font-family: var(--font-heading); font-weight: var(--font-heading-weight);
      font-size: 14px; line-height: 1.2; color: var(--color-text);
      background: transparent; border: 1px solid transparent;
      padding: var(--space-2) calc(var(--space-3) * 1.2);
      border-radius: var(--radius-md);
      transition: all 0.15s ease;
    }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-primary { background: var(--color-accent); color: var(--color-bg); }
    .btn-primary:hover:not(:disabled) { background: var(--color-accent-600); }
    .btn-primary:active:not(:disabled) { background: var(--color-accent-700); }
    .btn-secondary { border: 1.5px solid var(--color-divider); }
    .btn-secondary:hover:not(:disabled) { background: color-mix(in srgb, var(--color-text) 7%, transparent); }
    .btn-secondary:active:not(:disabled) { background: color-mix(in srgb, var(--color-text) 14%, transparent); }
    .btn-icon { width: 36px; height: 36px; padding: 0; }
    .btn-block { width: 100%; margin-top: var(--space-2); justify-content: flex-start; text-align: left; }

    .field > label {
      display: block; font-size: 12px; margin-bottom: 5px;
      color: color-mix(in srgb, var(--color-text) 70%, transparent);
    }
    .input {
      width: 100%; min-height: 36px; padding: 6px 10px; font: inherit;
      font-size: 14px; color: var(--color-text); caret-color: var(--color-accent);
      background: var(--color-surface);
      border: 1px solid var(--color-divider); border-radius: var(--radius-md);
    }
    .input:hover { border-color: color-mix(in srgb, var(--color-text) 45%, transparent); }
    .input:focus { border-color: var(--color-accent); outline: none; }

    .seg {
      display: inline-flex; overflow: hidden;
      border: 1.5px solid var(--color-divider); border-radius: var(--radius-md);
    }
    .seg-opt {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 12px; font-size: 13px; cursor: pointer;
    }
    .seg-opt + .seg-opt { border-left: 1.5px solid var(--color-divider); }

    .card {
      display: flex; flex-direction: column; gap: var(--space-2);
      padding: var(--space-3); border-radius: var(--radius-md); background: var(--color-surface);
    }
    .card-kicker { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
    .card-title {
      font-family: var(--font-heading); font-weight: var(--font-heading-weight);
      font-size: 17px; line-height: 1.2;
    }
    .card-body { margin: 0; font-size: 13px; opacity: 0.8; flex: 1; }
    .elev-sm { box-shadow: var(--shadow-sm); }
    .elev-md { box-shadow: var(--shadow-md); }

    .tag {
      display: inline-flex; align-items: center; font-size: 11px;
      letter-spacing: 0.02em; padding: 3px 10px;
      border-radius: calc(var(--radius-md) * 0.75);
    }
    .tag-accent { background: var(--color-accent-100); color: var(--color-accent-800); }
    .tag-accent-2 { background: var(--color-accent-2-100); color: var(--color-accent-2-800); }
    .tag-neutral { background: var(--color-neutral-100); color: var(--color-neutral-800); }
    .tag-outline { border: 1px solid var(--color-accent); color: var(--color-accent); }
  `;

  // =============================================================
  // Screen Render Blocks
  // =============================================================
  const homeScreen = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--color-bg)", fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
      <div style={{ flex: 1, overflow: "auto", padding: "60px 20px 12px" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: "var(--color-accent-700)", textTransform: "uppercase", marginBottom: 4 }}>Rediscovery Lab</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 26, margin: "0 0 4px", letterSpacing: "-0.01em" }}>The GPM · DPR Story</h1>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: "color-mix(in srgb, var(--color-text) 65%, transparent)", marginBottom: 20 }}>
          Radar sends a pulse → gets an echo → decides if it's rain → classifies the rain column → maps the raindrop sizes → calculates attenuation losses → gauges retrieval trust → and finally, computes the rain rate. Explore each module.
        </p>

        {/* Level segment selector */}
        <div className="seg" style={{ marginBottom: 20 }}>
          {levels.map((lv) => (
            <label 
              key={lv.id} 
              className={`seg-opt ${lv.checked ? "bg-[#ec3013] text-[#f3f2f2]" : "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]"}`}
              style={{ transition: "all 0.15s ease" }}
            >
              <input 
                type="radio" 
                name="level-home" 
                checked={lv.checked} 
                onChange={lv.onSelect} 
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
              />
              <span>{lv.label}</span>
            </label>
          ))}
        </div>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>Radar Cadet · {xpTotal} XP</span>
          <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>{doneCount}/7 modules</span>
        </div>
        <div style={{ height: 6, background: "var(--color-neutral-200)", marginBottom: 24 }}>
          <div style={{ height: "100%", background: "var(--color-accent)", width: `${progressPct}%`, transition: "width 0.3s ease" }}></div>
        </div>

        <h6 style={{ marginBottom: 12 }}>The Seven Modules</h6>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {missions.map((m) => (
            <div 
              key={m.id}
              className="card elev-sm" 
              style={{ cursor: m.cursor, opacity: m.opacity, transition: "all 0.2s" }} 
              onClick={m.onOpen}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <span className="card-kicker">{m.kicker}</span>
                  <span className="card-title">{m.title}</span>
                  <p className="card-body">{m.desc}</p>
                </div>
                <span className={`tag ${m.tagClass}`} style={{ whiteSpace: "nowrap" }}>{m.tagLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation tabs */}
      <div style={{ flex: "none", display: "flex", borderTop: "2.5px solid var(--color-divider)", padding: "10px 8px 26px", background: "var(--color-bg)" }}>
        <div onClick={goHome} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "var(--color-accent)", cursor: "pointer" }}>
          <HomeIcon width="20" height="20" />
          <span style={{ fontSize: 9, fontWeight: 700 }}>Home</span>
        </div>
        <div onClick={() => handleNavClick("/explorer")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "var(--color-neutral-600)", cursor: "pointer" }}>
          <CompassIcon width="20" height="20" />
          <span style={{ fontSize: 9, fontWeight: 700 }}>Modules</span>
        </div>
        <div onClick={() => handleNavClick("/tutor")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "var(--color-neutral-600)", cursor: "pointer" }}>
          <MessageIcon width="20" height="20" />
          <span style={{ fontSize: 9, fontWeight: 700 }}>Tutor</span>
        </div>
        <div onClick={() => handleNavClick("/")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "var(--color-neutral-600)", cursor: "pointer" }}>
          <UserIcon width="20" height="20" />
          <span style={{ fontSize: 9, fontWeight: 700 }}>Profile</span>
        </div>
      </div>
    </div>
  );

  const missionScreen = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--color-bg)", fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
      <div style={{ flex: 1, overflow: "auto", padding: "58px 20px 12px" }}>

        {/* Back navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <button 
            className="btn btn-icon btn-secondary" 
            style={{ borderRadius: "50%", padding: 0 }}
            onClick={goHome} 
            aria-label="Back"
          >
            <ChevronLeft width="18" height="18" style={{ color: "var(--color-text)" }} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "var(--color-accent-700)", textTransform: "uppercase" }}>{missionKicker}</div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 19, margin: 0 }}>{missionTitle}</h2>
          </div>
          <span className="tag tag-outline">+40 XP</span>
        </div>

        {/* Level switcher */}
        <div className="seg" style={{ marginBottom: 16 }}>
          {levels.map((lv) => (
            <label 
              key={lv.id} 
              className={`seg-opt ${lv.checked ? "bg-[#ec3013] text-[#f3f2f2]" : "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]"}`}
              style={{ transition: "all 0.15s ease" }}
            >
              <input 
                type="radio" 
                name="level-mission" 
                checked={lv.checked} 
                onChange={lv.onSelect} 
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
              />
              <span>{lv.label}</span>
            </label>
          ))}
        </div>

        <hr className="hr" style={{ margin: "0 0 16px" }} />

        <p style={{ fontSize: "13.5px", lineHeight: 1.6, marginBottom: 18 }}>{introText}</p>

        {/* Slider-driven templates (PRE, VER) */}
        {hasSlider && (
          <div className="card elev-md" style={{ background: "var(--color-surface)", padding: "18px 16px", marginBottom: 16 }}>
            {activeMission === "pre" && (
              <div className="rounded overflow-hidden mb-4" style={{ height: 180 }}>
                <Player
                  component={PreSimulation}
                  inputProps={{ val: preVal, checked: preChecked }}
                  durationInFrames={60}
                  fps={30}
                  compositionWidth={320}
                  compositionHeight={180}
                  style={{ width: "100%", height: "180px" }}
                  controls={false}
                  loop
                  autoPlay
                />
              </div>
            )}
            {activeMission === "ver" && (
              <div className="rounded overflow-hidden mb-4" style={{ height: 180 }}>
                <Player
                  component={VerSimulation}
                  inputProps={{ val: verVal }}
                  durationInFrames={60}
                  fps={30}
                  compositionWidth={320}
                  compositionHeight={180}
                  style={{ width: "100%", height: "180px" }}
                  controls={false}
                  loop
                  autoPlay
                />
              </div>
            )}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>{sliderLabel}</span>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 18 }}>{sliderValueLabel}</span>
            </div>
            
            <input 
              type="range" 
              min={sliderMin} 
              max={sliderMax} 
              step={sliderStep} 
              value={sliderVal} 
              onChange={onSliderChange} 
              disabled={sliderLocked}
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                width: "100%",
                height: 2,
                background: "var(--color-divider)",
                outline: "none"
              }}
            />
          </div>
        )}

        {/* SRT Module template */}
        {activeMission === "srt" && (
          <div className="card elev-md" style={{ background: "var(--color-surface)", padding: "18px 16px", marginBottom: 16 }}>
            <div className="rounded overflow-hidden mb-4" style={{ height: 160 }}>
              <Player
                component={SrtSimulation}
                inputProps={{ revealed: srtRevealed }}
                durationInFrames={60}
                fps={30}
                compositionWidth={320}
                compositionHeight={160}
                style={{ width: "100%", height: "160px" }}
                controls={false}
                loop
                autoPlay
              />
            </div>
            {!srtRevealed && (
              <button 
                className="btn btn-primary btn-block" 
                style={{ justifyContent: "center" }} 
                onClick={onReveal}
              >
                Measure the surface echo
              </button>
            )}
          </div>
        )}

        {/* DSD Module template */}
        {isDsd && (
          <div className="card elev-md" style={{ background: "var(--color-surface)", padding: "18px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>Raindrop diameter</span>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 18 }}>{dropSizeLabel} mm</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="5" 
              step="0.1" 
              value={dropSize} 
              onChange={onDropSizeChange} 
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                width: "100%",
                height: 2,
                background: "var(--color-divider)",
                outline: "none",
                marginBottom: 16
              }}
            />
            <div className="rounded overflow-hidden" style={{ height: 160 }}>
              <Player
                component={DsdSimulation}
                inputProps={{ dropSize }}
                durationInFrames={60}
                fps={30}
                compositionWidth={320}
                compositionHeight={160}
                style={{ width: "100%", height: "160px" }}
                controls={false}
                loop
                autoPlay
              />
            </div>
          </div>
        )}

        {/* CSF scan profile template */}
        {isCsf && (
          <div className="card elev-md" style={{ background: "var(--color-surface)", padding: "18px 16px", marginBottom: 16 }}>
            {!csfRevealed ? (
              <button 
                className="btn btn-primary btn-block" 
                style={{ justifyContent: "center" }} 
                onClick={() => setCsfRevealed(true)}
              >
                Scan the profile
              </button>
            ) : (
              <div className="rounded overflow-hidden" style={{ height: 120 }}>
                <Player
                  component={CsfSimulation}
                  inputProps={{ revealed: csfRevealed, choice: csfChoice }}
                  durationInFrames={60}
                  fps={30}
                  compositionWidth={320}
                  compositionHeight={120}
                  style={{ width: "100%", height: "120px" }}
                  controls={false}
                  loop={false}
                  autoPlay
                />
              </div>
            )}
          </div>
        )}

        {/* TRG footprint grid template */}
        {isTrg && (
          <div className="card elev-md" style={{ background: "var(--color-surface)", padding: "18px 16px", marginBottom: 16 }}>
            <div className="rounded overflow-hidden" style={{ height: 160 }}>
              <Player
                component={TrgSimulation}
                inputProps={{ choice: trgChoice }}
                durationInFrames={60}
                fps={30}
                compositionWidth={320}
                compositionHeight={160}
                style={{ width: "100%", height: "160px" }}
                controls={false}
                loop
                autoPlay
              />
            </div>
          </div>
        )}

        {/* SLV solver template */}
        {isSlv && (
          <div className="card elev-md" style={{ background: "var(--color-surface)", padding: "18px 16px", marginBottom: 16 }}>
            <div className="rounded overflow-hidden" style={{ height: 160 }}>
              <Player
                component={SlvSimulation}
                inputProps={{ choice: slvChoice }}
                durationInFrames={60}
                fps={30}
                compositionWidth={320}
                compositionHeight={160}
                style={{ width: "100%", height: "160px" }}
                controls={false}
                loop
                autoPlay
              />
            </div>
          </div>
        )}

        {/* Choices rendering */}
        {showChoice && (
          <div className="field" style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>{choiceLabel}</label>
            <div style={{ display: "flex", gap: 10 }}>
              {choiceOptions.map((opt, idx) => (
                <button 
                  key={idx}
                  className={`btn ${opt.btnClass} btn-block`} 
                  style={{ justifyContent: "center" }} 
                  onClick={opt.onPick}
                  disabled={choiceChecked}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {showChoiceConfirm && (
              <button 
                className="btn btn-secondary btn-block" 
                style={{ justifyContent: "center", marginTop: 12 }} 
                onClick={confirmChoice} 
                disabled={choiceConfirmDisabled}
              >
                Check my answer
              </button>
            )}
          </div>
        )}

        {/* Numeric input rendering */}
        {showNumeric && (
          <>
            <div className="field" style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>{numericLabel}</label>
              <input 
                className="input" 
                type="number" 
                inputMode="decimal" 
                placeholder={numericPlaceholder} 
                value={numericVal} 
                onChange={onNumericChange} 
                disabled={numericChecked}
              />
            </div>
            {showNumericCheckButton && (
              <button 
                className="btn btn-secondary btn-block" 
                style={{ justifyContent: "center", marginBottom: 16 }} 
                onClick={checkNumeric} 
                disabled={numericCheckDisabled}
              >
                Check my answer
              </button>
            )}
          </>
        )}

        {/* Feedback layout */}
        {isChecked && (
          <>
            <div className="card" style={{ background: feedbackBg, marginBottom: 16, border: `1.5px solid ${feedbackColor}30` }}>
              <span className="card-title" style={{ fontSize: 14, color: feedbackColor }}>{feedbackHeadline}</span>
              <p className="card-body" style={{ opacity: 1, color: "var(--color-text)", marginTop: 4 }}>{explainText}</p>
            </div>
            <button 
              className="btn btn-primary btn-block" 
              style={{ justifyContent: "center" }} 
              onClick={finishMission}
            >
              Continue
            </button>
          </>
        )}

      </div>

      {/* Tabs */}
      <div style={{ flex: "none", display: "flex", borderTop: "2.5px solid var(--color-divider)", padding: "10px 8px 26px", background: "var(--color-bg)" }}>
        <div onClick={goHome} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "var(--color-neutral-600)", cursor: "pointer" }}>
          <HomeIcon width="20" height="20" />
          <span style={{ fontSize: 9, fontWeight: 700 }}>Home</span>
        </div>
        <div onClick={() => handleNavClick("/explorer")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "var(--color-accent)", cursor: "pointer" }}>
          <CompassIcon width="20" height="20" />
          <span style={{ fontSize: 9, fontWeight: 700 }}>Modules</span>
        </div>
        <div onClick={() => handleNavClick("/tutor")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "var(--color-neutral-600)", cursor: "pointer" }}>
          <MessageIcon width="20" height="20" />
          <span style={{ fontSize: 9, fontWeight: 700 }}>Tutor</span>
        </div>
        <div onClick={() => handleNavClick("/")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "var(--color-neutral-600)", cursor: "pointer" }}>
          <UserIcon width="20" height="20" />
          <span style={{ fontSize: 9, fontWeight: 700 }}>Profile</span>
        </div>
      </div>
    </div>
  );

  // Responsive device container wrapper
  const contentEl = screen === "home" ? homeScreen : missionScreen;

  if (isMobileScreen) {
    return (
      <div className="w-full min-h-screen bg-[#f3f2f2] text-[#201e1d] overflow-hidden select-none">
        <style dangerouslySetInnerHTML={{ __html: CSS_STYLES }} />
        {contentEl}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eae9e9] py-10 px-4 select-none">
      <style dangerouslySetInnerHTML={{ __html: CSS_STYLES }} />
      <IOSDevice dark={false} width={402} height={874} onBack={goHome}>
        {contentEl}
      </IOSDevice>
    </div>
  );
}
