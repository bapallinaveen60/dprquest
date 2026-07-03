"use client";

import { useState } from "react";
import { Binary, HelpCircle, ArrowRight, Eye, RefreshCw, Star } from "lucide-react";

interface EquationItem {
  id: string;
  math: string;
  english: string;
  concept: string;
  variables: { symbol: string; meaning: string }[];
  details: string;
}

export default function EquationTranslatorPage() {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const equations: EquationItem[] = [
    {
      id: "radar_eq",
      math: "P_r = \\frac{C \\cdot |K|^2 \\cdot Z}{r^2}",
      english: "What the radar receives equals the hardware constant times the water dielectric factor times the drop reflectivity, divided by the distance squared.",
      concept: "The Radar Equation",
      variables: [
        { symbol: "P_r", meaning: "Received power backscattered to the satellite antenna." },
        { symbol: "C", meaning: "Radar constant (hardware characteristics: antenna gain, beamwidth, pulse length)." },
        { symbol: "||K||^2", meaning: "Dielectric factor. Liquid water is ~0.93 (reflects strongly); dry ice is ~0.176 (reflects poorly)." },
        { symbol: "Z", meaning: "Radar reflectivity factor. Depends heavily on drop sizes." },
        { symbol: "r", meaning: "Range (distance from satellite to the rain volume gate)." }
      ],
      details: "This is the fundamental formula of active remote sensing. It connects raw electrical power measured by GPM back to the physical reflectivity of the clouds. Note that as rain gets farther away (larger r), the signal returns much weaker."
    },
    {
      id: "pia_eq",
      math: "PIA = 2 \\int_0^r k(s) ds",
      english: "Total signal loss caused by the radar pulse traveling through the rain column and back.",
      concept: "Path Integrated Attenuation (PIA)",
      variables: [
        { symbol: "PIA", meaning: "Path Integrated Attenuation (in decibels)." },
        { symbol: "k(s)", meaning: "Specific attenuation coefficient in dB/km at distance s." },
        { symbol: "ds", meaning: "Integration step (range gate thickness)." }
      ],
      details: "As the microwave pulse moves down through rain, droplets absorb and scatter the beam. GPM has to account for this two-way loss. If not corrected, the estimated rainfall at the bottom of the cloud will be severely underestimated."
    },
    {
      id: "hb_eq",
      math: "Z_e(r) = \\frac{Z_m(r)}{\\left[1 - \\beta \\int_0^r \\alpha Z_m^\\beta ds\\right]^{1/\\beta}}",
      english: "True reflectivity equals measured reflectivity corrected step-by-step from the top of the cloud downward.",
      concept: "Hitschfeld-Bordan Attenuation Correction",
      variables: [
        { symbol: "Z_e(r)", meaning: "True corrected reflectivity at range r." },
        { symbol: "Z_m(r)", meaning: "Measured attenuated reflectivity at range r." },
        { symbol: "alpha, beta", meaning: "Empirical coefficients relating specific attenuation to reflectivity (k = alpha * Z^beta)." }
      ],
      details: "This represents the step-by-step solver algorithm. It compensates for signal loss gates. Starting at the top of the storm (where attenuation is zero), it calculates how much energy was lost, corrects the next gate, and integrates downward to the surface."
    },
    {
      id: "dsd_eq",
      math: "R = 1.885 \\times 10^{-3} \\int D^3 v(D) N(D) dD",
      english: "Physical rain rate is the total volume of all drops multiplied by their fall speed and droplet concentrations.",
      concept: "Precipitation Rate DSD Integral",
      variables: [
        { symbol: "R", meaning: "Rainfall rate in mm/hour." },
        { symbol: "D", meaning: "Raindrop diameter in mm." },
        { symbol: "v(D)", meaning: "Terminal fall velocity of a drop of diameter D (in m/s)." },
        { symbol: "N(D)", meaning: "Drop concentration distribution function." }
      ],
      details: "This equation links the microphysics to the bulk rain rate. If we know the size distribution of the drops (N(D)), we can integrate over all drop sizes to calculate exactly how many millimeters of rain reach the ground per hour."
    },
    {
      id: "dfr_eq",
      math: "DFR = dBZ_{ku} - dBZ_{ka}",
      english: "The difference in signal strength between the Ku and Ka frequencies, which reveals the size of the raindrops.",
      concept: "Dual-Frequency Ratio (DFR)",
      variables: [
        { symbol: "DFR", meaning: "Dual-Frequency Ratio in decibels." },
        { symbol: "dBZ_ku", meaning: "Reflectivity measured at 13.6 GHz (Ku-band)." },
        { symbol: "dBZ_ka", meaning: "Reflectivity measured at 35.5 GHz (Ka-band)." }
      ],
      details: "Because Ka-band has a shorter wavelength, it suffers stronger Mie scattering and attenuation than Ku-band as drop sizes increase. The resulting difference (DFR) is positive for large drops, providing the mathematical key to estimate mean raindrop diameter (Dm)."
    }
  ];

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-gray-800 pb-4">
        <span className="text-xs text-emerald-400 font-semibold tracking-widest uppercase font-mono">Translation Engine</span>
        <h1 className="text-3xl font-extrabold text-white">Equation Translator</h1>
        <p className="text-gray-400 text-sm font-light">
          Radar remote sensing mathematics can look intimidating. This translator breaks GPM-DPR equations down into plain, logical English.
        </p>
      </div>

      {/* Equations loop */}
      <div className="flex flex-col gap-6">
        {equations.map((eq) => {
          const isRevealed = revealedIds[eq.id];
          return (
            <div 
              key={eq.id}
              className="glass-panel rounded-2xl border border-gray-800 bg-gray-950/20 overflow-hidden flex flex-col transition-all"
            >
              {/* Card top */}
              <div className="p-6 border-b border-gray-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold font-mono">CONSTRUCT</span>
                  <h3 className="font-extrabold text-white text-md">{eq.concept}</h3>
                </div>
                
                {/* Math Formula box */}
                <div className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-center font-mono text-xs text-emerald-400">
                  {`$$ ${eq.math} $$`}
                </div>
              </div>

              {/* Reveal panel */}
              <div className="p-6 flex flex-col gap-4 bg-gray-950/40">
                {isRevealed ? (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-emerald-950/15 border border-emerald-800/20">
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest font-mono">PLAIN ENGLISH TRANSLATION</span>
                      <p className="text-sm font-semibold text-white leading-relaxed">{eq.english}</p>
                    </div>

                    {/* Variable breakdowns */}
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Variables Explained:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                        {eq.variables.map((v, i) => (
                          <div key={i} className="flex gap-2 p-2.5 rounded-lg bg-gray-900 border border-gray-850">
                            <span className="text-cyan-400 font-bold shrink-0">{v.symbol}</span>
                            <span className="text-gray-300 font-sans text-[11px] leading-normal">{v.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Details */}
                    <div className="border-t border-gray-800 pt-4 mt-2">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Algorithm Application:</span>
                      <p className="text-xs text-gray-400 leading-relaxed font-light mt-1">{eq.details}</p>
                    </div>

                    <button 
                      onClick={() => toggleReveal(eq.id)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white font-mono self-start"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Hide Translation</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center">
                    <HelpCircle className="w-8 h-8 text-gray-600 mb-2" />
                    <span className="text-xs text-gray-400 font-light mb-4">Click below to translate the math into plain English.</span>
                    <button
                      onClick={() => toggleReveal(eq.id)}
                      className="inline-flex items-center gap-2 py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Translate Equation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
