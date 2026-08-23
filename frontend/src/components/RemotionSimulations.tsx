"use client";

import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// =============================================================
// 1. PRE Simulation
// =============================================================
export const PreSimulation = ({ val = 10, checked = false }: { val?: number; checked?: boolean }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Pulse animation loop
  const progress = (frame % 30) / 30; // 0 to 1
  const pulseY = progress * 240;

  const isRain = val >= 18;

  return (
    <div style={{
      width: "100%", height: "100%", background: "#0a0a0f",
      position: "relative", fontFamily: "monospace", color: "#f3f2f2",
      overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: 16, boxSizing: "border-box"
    }}>
      <div style={{ textAlign: "center", fontSize: 10, color: "#8b8b9f", textTransform: "uppercase" }}>
        Satellite Radar Transmit (PR)
      </div>

      {/* Satellite */}
      <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: 35, left: 0, right: 0 }}>
        <div style={{ width: 40, height: 16, border: "1px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#3b82f6" }} />
        </div>
      </div>

      {/* Cloud target */}
      <div style={{
        position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
        width: 120, height: 60, borderRadius: 12,
        background: isRain ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.05)",
        border: isRain ? "1.5px dashed #3b82f6" : "1.5px dashed #605d5d",
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
        transition: "all 0.2s"
      }}>
        <span style={{ fontSize: 9, color: isRain ? "#3b82f6" : "#605d5d" }}>
          {isRain ? "Rain Target" : "Clear Sky"}
        </span>
        <span style={{ fontSize: 11, fontWeight: "bold", color: isRain ? "#ec3013" : "#7d7979" }}>
          {val} dBZ
        </span>
      </div>

      {/* Transmitted Pulse wave */}
      {pulseY < 120 && (
        <div style={{
          position: "absolute", top: 50 + pulseY, left: "50%", transform: "translateX(-50%)",
          width: 32, height: 4, background: "#3b82f6", borderRadius: "50%",
          boxShadow: "0 0 10px #3b82f6", opacity: 0.8
        }} />
      )}

      {/* Return Echo wave */}
      {pulseY >= 120 && (
        <div style={{
          position: "absolute", top: 170 - (pulseY - 120), left: "50%", transform: "translateX(-50%)",
          width: 32, height: 4,
          background: isRain ? "#ec3013" : "#7d7979",
          borderRadius: "50%",
          boxShadow: isRain ? "0 0 10px #ec3013" : "none",
          opacity: isRain ? 0.8 : 0.25
        }} />
      )}

      {/* Noise or echo classification display */}
      <div style={{ textAlign: "center", fontSize: 11, color: isRain ? "#ec3013" : "#7d7979" }}>
        PRE Flag: {isRain ? "flagPrecip = 1 (RAIN)" : "flagPrecip = 0 (NO RAIN)"}
      </div>
    </div>
  );
};

// =============================================================
// 2. VER Simulation
// =============================================================
export const VerSimulation = ({ val = 2.0 }: { val?: number }) => {
  const frame = useCurrentFrame();

  // Floating particles loop
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const seed = (i * 37) % 100;
    const speed = 1.5 + (seed % 2);
    const y = ((frame * speed + seed * 2) % 150) + 40;
    const x = 30 + ((seed * 7) % 140);
    return { x, y };
  });

  const freezeY = 100; // 4.5 km height boundary
  const probeY = 200 - (val / 8.0) * 160;

  return (
    <div style={{
      width: "100%", height: "100%", background: "#0a0a0f",
      position: "relative", fontFamily: "monospace", color: "#f3f2f2",
      overflow: "hidden", border: "1.5px solid var(--color-divider)",
      padding: 16, boxSizing: "border-box"
    }}>
      {/* 0C Freezing Isotherm line */}
      <div style={{
        position: "absolute", top: freezeY, left: 0, right: 0,
        height: 1, borderTop: "2px dashed #ec3013", opacity: 0.6
      }} />
      <span style={{ position: "absolute", top: freezeY - 12, right: 8, fontSize: 8, color: "#ec3013" }}>
        0°C LEVEL (4.5 km)
      </span>

      {/* Particles */}
      {particles.map((p, idx) => {
        const isFrozen = p.y < freezeY;
        return (
          <div
            key={idx}
            style={{
              position: "absolute", left: p.x, top: p.y,
              fontSize: isFrozen ? 14 : 10,
              color: isFrozen ? "#d7d3d3" : "#3b82f6",
              transition: "color 0.1s"
            }}
          >
            {isFrozen ? "❄️" : "💧"}
          </div>
        );
      })}

      {/* Probe selector indicator */}
      <div style={{
        position: "absolute", top: probeY, left: 10, right: 10,
        height: 2, background: "#fff", boxShadow: "0 0 8px #fff",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontSize: 9, background: "#201e1d", padding: "1px 4px", transform: "translateY(-50%)" }}>
          Probe: {val.toFixed(1)} km
        </span>
        <span style={{
          fontSize: 9, background: val >= 4.5 ? "#2d2b2b" : "#ec3013",
          color: "#fff", padding: "1px 4px", transform: "translateY(-50%)"
        }}>
          {val >= 4.5 ? "ICE" : "RAIN"}
        </span>
      </div>
    </div>
  );
};

// =============================================================
// 3. CSF Simulation
// =============================================================
export const CsfSimulation = ({ revealed = false, choice = null }: { revealed?: boolean; choice?: "strat" | "conv" | null }) => {
  const frame = useCurrentFrame();

  // Scan line animation (runs if scanning has been activated)
  const scanProgress = revealed ? Math.min(1, frame / 30) : 0;
  const scanY = scanProgress * 110 + 10;

  return (
    <div style={{
      width: "100%", height: "100%", background: "#0a0a0f",
      position: "relative", fontFamily: "monospace", color: "#f3f2f2",
      overflow: "hidden", border: "1.5px solid var(--color-divider)",
      padding: 16, boxSizing: "border-box"
    }}>
      <div style={{ fontSize: 10, color: "#8b8b9f", textAlign: "center", marginBottom: 12 }}>
        CLASSIFICATION (CSF) METEOROLOGY
      </div>

      {revealed ? (
        <div style={{ position: "relative", width: "100%", height: 120 }}>
          {/* Wave Scan laser line */}
          {scanProgress < 1 && (
            <div style={{
              position: "absolute", top: scanY, left: 20, right: 20,
              height: 2, background: "#ec3013", boxShadow: "0 0 10px #ec3013", zIndex: 10
            }} />
          )}

          <svg viewBox="0 0 220 120" width="100%" height="120" style={{ display: "block" }}>
            <line x1="20" y1="10" x2="20" y2="110" stroke="var(--color-divider)" strokeWidth="2"></line>
            <line x1="20" y1="110" x2="210" y2="110" stroke="var(--color-divider)" strokeWidth="2"></line>

            {/* Profile curves mapped frame-by-frame */}
            {choice === "strat" || !choice ? (
              <path
                d="M 30 100 C 40 98, 55 90, 65 65 C 72 45, 85 38, 95 40 C 105 42, 100 65, 90 70 C 78 80, 60 85, 50 92 C 44 98, 36 100, 30 100"
                fill="none"
                stroke="#ec3013"
                strokeWidth="2.5"
                strokeDasharray={interpolate(scanProgress, [0, 1], [1000, 0]).toFixed(0) + " 1000"}
              />
            ) : (
              <path
                d="M 30 100 C 60 90, 90 70, 130 50 C 160 30, 180 20, 175 15 C 160 10, 120 40, 90 50 C 70 65, 45 85, 30 100"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeDasharray={interpolate(scanProgress, [0, 1], [1000, 0]).toFixed(0) + " 1000"}
              />
            )}

            {scanProgress >= 0.6 && (choice === "strat" || !choice) && (
              <text x="100" y="45" fontSize="9" fill="#ec3013" fontWeight="bold">bright band</text>
            )}
            {scanProgress >= 0.6 && choice === "conv" && (
              <text x="110" y="30" fontSize="9" fill="#3b82f6" fontWeight="bold">convective</text>
            )}
            <text x="8" y="110" fontSize="8" fill="#8b8b9f" transform="rotate(-90 8 110)">height</text>
            <text x="105" y="118" fontSize="8" fill="#8b8b9f">reflectivity →</text>
          </svg>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, color: "#7d7979", fontSize: 11 }}>
          Scan the profile to classify
        </div>
      )}
    </div>
  );
};

// =============================================================
// 4. DSD Simulation
// =============================================================
export const DsdSimulation = ({ dropSize = 2.0 }: { dropSize?: number }) => {
  const frame = useCurrentFrame();
  const progress = (frame % 20) / 20;

  const ku = Math.pow(dropSize, 6);
  const ka = dropSize < 2 ? Math.pow(dropSize, 6) : Math.pow(dropSize, 6) * (1 - (dropSize - 2) * 0.18);
  const maxRef = Math.pow(5, 6);

  const kuPct = Math.min(100, (ku / maxRef) * 100);
  const kaPct = Math.min(100, Math.max(2, (ka / maxRef) * 100));
  const dfr = (10 * Math.log10(ku / Math.max(ka, 0.001))).toFixed(1);

  const dropRadius = 15 + dropSize * 8;

  return (
    <div style={{
      width: "100%", height: "100%", background: "#0a0a0f",
      position: "relative", fontFamily: "monospace", color: "#f3f2f2",
      overflow: "hidden", border: "1.5px solid var(--color-divider)",
      padding: 16, boxSizing: "border-box"
    }}>
      <div style={{ fontSize: 10, color: "#8b8b9f", textAlign: "center", marginBottom: 12 }}>
        Wavelength Attenuation (Ku vs Ka)
      </div>

      <div style={{ display: "flex", height: 100, alignItems: "center", justifyContent: "space-around", position: "relative" }}>
        {/* Ku wave */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 9, color: "#8b8b9f", marginBottom: 4 }}>Ku (13.6 GHz)</div>
          <svg width="60" height="40">
            <path
              d={`M 0 20 Q 15 ${20 - 15 * Math.sin(progress * Math.PI * 2)}, 30 20 T 60 20`}
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
          <div style={{ width: 50, height: 6, background: "rgba(255,255,255,0.15)", position: "relative", marginTop: 6 }}>
            <div style={{ height: "100%", background: "#fff", width: `${kuPct}%`, transition: "width 0.1s" }} />
          </div>
        </div>

        {/* Drop sizing mockup */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 80, height: 80 }}>
          <div style={{
            width: dropRadius * 2, height: dropRadius * 2, borderRadius: "50%",
            background: "rgba(59,130,246,0.3)", border: "1.5px solid #3b82f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 15px rgba(59,130,246,0.2)", transition: "all 0.1s"
          }}>
            <span style={{ fontSize: 10, color: "#fff", fontWeight: "bold" }}>{dropSize.toFixed(1)}mm</span>
          </div>
        </div>

        {/* Ka wave */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 9, color: "#ec3013", marginBottom: 4 }}>Ka (35.5 GHz)</div>
          <svg width="60" height="40">
            <path
              d={`M 0 20 Q 7.5 ${20 - 8 * Math.sin(progress * Math.PI * 4)}, 15 20 T 30 20 T 45 20 T 60 20`}
              fill="none"
              stroke="#ec3013"
              strokeWidth="1.5"
              style={{ opacity: dropSize >= 2 ? interpolate(dropSize, [2, 4], [1, 0.25]) : 1 }}
            />
          </svg>
          <div style={{ width: 50, height: 6, background: "rgba(236,48,19,0.15)", position: "relative", marginTop: 6 }}>
            <div style={{ height: "100%", background: "#ec3013", width: `${kaPct}%`, transition: "width 0.1s" }} />
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "#ec3013", marginTop: 10 }}>
        DFR (Mie Divergence): {dfr} dB
      </div>
    </div>
  );
};

// =============================================================
// 5. SRT Simulation
// =============================================================
export const SrtSimulation = ({ revealed = false }: { revealed?: boolean }) => {
  const frame = useCurrentFrame();
  const progress = (frame % 30) / 30;
  const pulseY = progress * 100;

  return (
    <div style={{
      width: "100%", height: "100%", background: "#0a0a0f",
      position: "relative", fontFamily: "monospace", color: "#f3f2f2",
      overflow: "hidden", border: "1.5px solid var(--color-divider)",
      padding: 16, boxSizing: "border-box"
    }}>
      <div style={{ fontSize: 10, color: "#8b8b9f", textAlign: "center", marginBottom: 10 }}>
        SURFACE REFERENCE TECHNIQUE (SRT)
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", height: 110, padding: "0 10px" }}>
        {/* Clear Sky beam */}
        <div style={{ flex: 1, borderRight: "1px dashed var(--color-divider)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          <span style={{ fontSize: 8, color: "#8b8b9f", marginBottom: 4 }}>Clear Reference</span>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", position: "relative", width: 10 }}>
            {pulseY < 80 ? (
              <div style={{ position: "absolute", top: pulseY, width: "100%", height: 6, background: "#fff" }} />
            ) : (
              <div style={{ position: "absolute", top: 80 - (pulseY - 80), width: "100%", height: 6, background: "#fff", boxShadow: "0 0 10px #fff" }} />
            )}
          </div>
          <div style={{ fontSize: 9, background: "#2d2b2b", width: "80%", textAlign: "center", padding: 2, marginTop: 4 }}>
            Ref: 100%
          </div>
        </div>

        {/* Rain Column beam */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          <span style={{ fontSize: 8, color: "#ec3013", marginBottom: 4 }}>Heavy Rain Path</span>
          <div style={{ flex: 1, background: "rgba(59,130,246,0.1)", position: "relative", width: 10 }}>
            {pulseY < 80 ? (
              <div style={{
                position: "absolute", top: pulseY, width: "100%", height: 6,
                background: "#3b82f6", opacity: pulseY > 40 ? 0.4 : 0.8
              }} />
            ) : (
              <div style={{
                position: "absolute", top: 80 - (pulseY - 80), width: "100%", height: 6,
                background: revealed ? "#ec3013" : "#3b82f6",
                opacity: revealed ? 0.35 : 0.8
              }} />
            )}
          </div>
          <div style={{ fontSize: 9, background: "#2d2b2b", width: "80%", textAlign: "center", padding: 2, marginTop: 4 }}>
            Obs: {revealed ? "35%" : "100%"}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 10, color: revealed ? "#ec3013" : "#7d7979", marginTop: 8 }}>
        {revealed ? "PIA Attenuation Deficit: -4.6 dB" : "Click Measure to calculate loss"}
      </div>
    </div>
  );
};

// =============================================================
// 6. TRG Simulation
// =============================================================
export const TrgSimulation = ({ choice = null }: { choice?: "trust" | "flag" | null }) => {
  const frame = useCurrentFrame();

  // Radar footprints sweep
  const angle = (frame % 60) / 60 * Math.PI * 2;
  const sweepX = Math.sin(angle) * 8;

  const isFlag = choice === "flag";

  return (
    <div style={{
      width: "100%", height: "100%", background: "#0a0a0f",
      position: "relative", fontFamily: "monospace", color: "#f3f2f2",
      overflow: "hidden", border: "1.5px solid var(--color-divider)",
      padding: 16, boxSizing: "border-box"
    }}>
      <div style={{ fontSize: 9, color: "#8b8b9f", textAlign: "center", marginBottom: 8 }}>
        Non-Uniform Beam Filling (NUBF) Scan
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 100, position: "relative" }}>
        {/* Footprint cone */}
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ position: "absolute", zIndex: 10 }}>
          <polygon
            points={`50,10 ${40 + sweepX},90 ${60 + sweepX},90`}
            fill="rgba(236,48,19,0.15)"
            stroke="#ec3013"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        </svg>

        {/* Footprint Grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2,
          width: 70, height: 70, background: "#1a1a24", padding: 4
        }}>
          {[1, 0, 1, 0, 1, 1, 1, 0, 0].map((val, idx) => (
            <div
              key={idx}
              style={{
                background: val ? "rgba(236,48,19,0.5)" : "rgba(255,255,255,0.05)",
                border: val ? "1px solid #ec3013" : "1px solid #2d2b2b"
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 10, color: isFlag ? "#ec3013" : "#7d7979", marginTop: 12 }}>
        {isFlag ? "⚠️ NUBF FLAGGED: mixed rain cells inside footprint" : "Mixed cells detected inside footprint"}
      </div>
    </div>
  );
};

// =============================================================
// 7. SLV Simulation
// =============================================================
export const SlvSimulation = ({ choice = null }: { choice?: string | null }) => {
  const frame = useCurrentFrame();

  // Gates integration solver sweep
  const activeGate = Math.floor((frame % 30) / 30 * 8);

  const isLarge = choice === "12";

  return (
    <div style={{
      width: "100%", height: "100%", background: "#0a0a0f",
      position: "relative", fontFamily: "monospace", color: "#f3f2f2",
      overflow: "hidden", border: "1.5px solid var(--color-divider)",
      padding: 16, boxSizing: "border-box"
    }}>
      <div style={{ fontSize: 9, color: "#8b8b9f", textAlign: "center", marginBottom: 8 }}>
        Hitschfeld-Bordan Attenuation Solver
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", height: 100, padding: "0 8px" }}>
        {/* Gate column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "40%" }}>
          {Array.from({ length: 8 }).map((_, idx) => {
            const isActive = idx === activeGate;
            return (
              <div
                key={idx}
                style={{
                  height: 10,
                  background: isActive
                    ? "rgba(236,48,19,0.8)"
                    : idx < activeGate
                      ? "rgba(59,130,246,0.3)"
                      : "rgba(255,255,255,0.05)",
                  border: "0.5px solid var(--color-divider)",
                  fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center",
                  color: isActive ? "#fff" : "#8b8b9f",
                  transition: "background 0.05s"
                }}
              >
                Gate {idx + 1}
              </div>
            );
          })}
        </div>

        {/* Outputs */}
        <div style={{ flex: 1, paddingLeft: 12, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
          <div>
            <div style={{ fontSize: 8, color: "#8b8b9f" }}>Measured Ze:</div>
            <div style={{ fontSize: 12, fontWeight: "bold" }}>35 dBZ</div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: "#8b8b9f" }}>Retrieved Rain Rate (R):</div>
            <div style={{
              fontSize: 16, fontWeight: "bold",
              color: choice ? (isLarge ? "#ec3013" : "#3b82f6") : "#f3f2f2",
              transition: "color 0.2s"
            }}>
              {choice ? (isLarge ? "12.0 mm/h" : "5.0 mm/h") : "-- mm/h"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 9, color: choice ? "var(--color-text)" : "#7d7979", marginTop: 8 }}>
        {choice ? (isLarge ? "Sparse large drops = higher R" : "Dense small drops = lower R") : "Select a rain rate option"}
      </div>
    </div>
  );
};
