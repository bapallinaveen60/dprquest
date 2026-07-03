"use client";

import { useState } from "react";
import { MessageSquareCode, Send, Sparkles, User, Cpu, Info } from "lucide-react";

interface Message {
  sender: "user" | "tutor";
  text: string;
}

export default function TutorPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "tutor",
      text: "Hello! I am your GPM-DPR AI Tutor. I can answer questions about satellite precipitation radar retrieval algorithms, Ku/Ka bands, drop sizes, or path attenuation. Feel free to ask me anything or click one of the suggested prompts below!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    "Explain DFR like I am 15.",
    "Why does attenuation matter?",
    "How is rainType determined?",
    "What causes the bright band?"
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Add user message
    const newMessages = [...messages, { sender: "user", text: textToSend } as Message];
    setMessages(newMessages);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/tutor/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToSend })
      });

      if (!response.ok) {
        throw new Error("Tutor backend offline");
      }

      const data = await response.json();
      setMessages([...newMessages, { sender: "tutor", text: data.reply }]);
    } catch (err) {
      console.warn("FastAPI tutor endpoint offline. Running client-side semantic match fallback.");
      // Fallback local semantic match QA router
      const reply = getLocalTutorReply(textToSend);
      setMessages([...newMessages, { sender: "tutor", text: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalTutorReply = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes("dfr") || q.includes("dual frequency") || q.includes("15")) {
      return (
        "### Dual-Frequency Ratio (DFR) - Explained Simply\n\n" +
        "Imagine you are shining two different flashlights into a foggy forest. One flashlight has a wide beam (Ku-band), and the other has a very fine, bright beam (Ka-band).\n\n" +
        "1. **Rayleigh scattering (Small drops):** When the fog consists of tiny droplets, both flashlights shine right through, and the backscatter is identical. DFR is 0.\n" +
        "2. **Mie scattering (Big drops):** As the drops grow, the Ka-band (magenta) flashlight starts hitting the drops like tiny mirrors, scattering and rolling off. The Ku-band (cyan) flashlight is larger, and continues reflecting power. The difference in their reflected echoes ($dBZ_{ku} - dBZ_{ka}$) is the **DFR**.\n\n" +
        "By measuring the size of this difference, we can instantly tell whether the storm contains tiny mist particles or large, heavy raindrops. This is how we retrieve the average drop diameter ($D_m$)."
      );
    }
    if (q.includes("attenuation") || q.includes("weak") || q.includes("loss")) {
      return (
        "### Why Attenuation Matters in Radar\n\n" +
        "**Attenuation** is the loss of radar beam power as it travels through precipitation. It is caused by two main factors:\n" +
        "- **Absorption:** Droplets absorb microwave energy and convert it to heat.\n" +
        "- **Scattering:** Droplets deflect the energy away from the radar receiver's path.\n\n" +
        "If you don't correct for this signal loss, the radar echo returning from near the ground will look extremely weak, making a torrential flood look like a light drizzle. GPM DPR uses mathematical corrections (like Hitschfeld-Bordan) to step-by-step rebuild the true signal strength down the vertical column."
      );
    }
    if (q.includes("type") || q.includes("determined") || q.includes("csf") || q.includes("classify")) {
      return (
        "### How GPM Determines Rain Type (CSF)\n\n" +
        "The Classification (CSF) module analyzes the horizontal and vertical shape of the radar profile to determine rain type:\n" +
        "1. **Stratiform (Uniform Rain):** If the radar detects a distinct **melting bright band** peak near the freezing level ($0^\\circ\\text{C}$ isotherm), it is classified as Stratiform.\n" +
        "2. **Convective (Violent Storms):** If there is no bright band, but the reflectivity is high ($> 39\\text{ dBZ}$) in the vertical core, it indicates rapid updrafts, classifying it as Convective.\n" +
        "3. **Other:** Includes shallow showers that don't reach the freezing level, or high-altitude ice clouds."
      );
    }
    if (q.includes("bright band") || q.includes("melting") || q.includes("freezing")) {
      return (
        "### The Radar Bright Band Melting Layer\n\n" +
        "The **Bright Band** is a prominent horizontal line of strong radar reflectivity observed just below the freezing level. It is caused by melting snow:\n" +
        "- **Above Freezing:** Precipitation is dry snow. Ice has a low dielectric constant ($|K|^2 \\approx 0.176$), so it reflects weakly.\n" +
        "- **Melting Layer:** As snowflakes fall below the freezing level, they begin melting from the outside, getting coated in liquid water. Liquid water has a high dielectric constant ($|K|^2 \\approx 0.93$). The radar now sees a giant water drop the size of a snowflake, creating a massive reflectivity spike.\n" +
        "- **Below Freezing:** Snow completes melting, collapsing into compact, fast-falling raindrops. The particles accelerate ($1\\text{ m/s} \\rightarrow 8\\text{ m/s}$), decreasing their concentrations in space, causing reflectivity to drop back down."
      );
    }

    return (
      "I understand you are asking about GPM-DPR Level-2 algorithms. Here are some key points:\n\n" +
      "- **Level-2 pipeline:** Runs PRE (preparation), VER (heights), CSF (classification), DSD (particle size), SRT (attenuation), and SLV (solver).\n" +
      "- **Dual Frequencies:** Ku (13.6 GHz) and Ka (35.5 GHz) allow GPM to separate rainfall intensity from droplet size distribution.\n" +
      "- **SRT:** The Surface Reference Technique calculates Path Integrated Attenuation (PIA) using the reduction in the surface echo.\n\n" +
      "Could you please clarify your question? Or try clicking one of the suggested prompts below!"
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-gray-800 pb-4">
        <span className="text-xs text-magenta-400 font-semibold tracking-widest uppercase font-mono">Academic Assistant</span>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <MessageSquareCode className="w-8 h-8 text-magenta-500 animate-bounce" />
          <span>AI Tutor</span>
        </h1>
      </div>

      {/* Chat Window */}
      <div className="flex-1 glass-panel rounded-2xl border border-gray-800 bg-gray-950/20 p-4 md:p-6 overflow-y-auto flex flex-col gap-4">
        {messages.map((m, i) => (
          <div 
            key={i}
            className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}
          >
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
              m.sender === "user" 
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" 
                : "bg-magenta-500/10 border-magenta-500/20 text-magenta-400"
            }`}>
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
            </div>

            <div className={`p-4 rounded-2xl text-xs leading-relaxed font-light ${
              m.sender === "user"
                ? "bg-cyan-950/25 border border-cyan-800/30 text-white rounded-tr-none"
                : "bg-gray-900 border border-gray-850 text-gray-300 rounded-tl-none flex flex-col gap-2"
            }`}>
              {/* Render markdown text */}
              <div className="prose prose-invert max-w-none">
                {m.text.split("\n\n").map((para, pIdx) => {
                  if (para.startsWith("### ")) {
                    return <h3 key={pIdx} className="text-sm font-bold text-white mt-1 border-b border-gray-800 pb-1">{para.replace("### ", "")}</h3>;
                  }
                  if (para.startsWith("- ") || para.match(/^\d+\. /)) {
                    return (
                      <ul key={pIdx} className="list-disc pl-4 flex flex-col gap-1 my-1">
                        {para.split("\n").map((li, lIdx) => (
                          <li key={lIdx}>{li.replace(/^(- |\d+\. )/, "")}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={pIdx}>{para}</p>;
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 self-start max-w-[85%] animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-magenta-500/10 border border-magenta-500/20 text-magenta-400 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-850 text-xs text-gray-500 font-mono">
              Tutor is typing...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts Grid */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-850 text-gray-400 hover:text-white hover:border-gray-700 transition-all text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Ask a question (e.g. How is DFR calculated?)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend(query);
          }}
          className="w-full bg-gray-900/60 border border-gray-850 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-magenta-500/40 focus:ring-1 focus:ring-magenta-500/20 transition-all"
        />
        <button
          onClick={() => handleSend(query)}
          className="absolute right-3 top-3 p-1.5 rounded-xl bg-magenta-600 hover:bg-magenta-500 text-white transition-all shadow-md"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
