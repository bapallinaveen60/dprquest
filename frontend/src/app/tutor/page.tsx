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
      text: "Hello! I am your GPM Socratic Guide. Rather than feeding you definitions, I will help you discover the concepts yourself using analogies and questions. What part of the satellite radar retrieval are you investigating today?"
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
    if (q.includes("dfr") || q.includes("dual frequency") || q.includes("15") || q.includes("frequency")) {
      return (
        "### Let's think about DFR (Dual-Frequency Ratio)\n\n" +
        "Imagine you have two different sizes of balls (like golf balls and basketballs) and you throw them into a forest of trees. Which one gets deflected or stopped more easily by small branches?\n\n" +
        "This is what happens when GPM shines a longer Ku-band wave and a shorter Ka-band wave into rain. What do you think happens to the shorter Ka-band wave when it hits large raindrops compared to the longer Ku-band wave?\n\n" +
        "1. Does it bounce back identically?\n" +
        "2. Or does it get blocked and scatter differently (Mie scattering)?\n\n" +
        "Let me know what you think!"
      );
    }
    if (q.includes("attenuation") || q.includes("weak") || q.includes("loss") || q.includes("absorption")) {
      return (
        "### Attenuation: The Fog Analogy\n\n" +
        "Have you ever driven in heavy fog with your high beams on? The light gets dimmer as it goes forward because the fog absorbs and scatters the light. That's attenuation.\n\n" +
        "Radar beams do the same thing in rain columns. If the beam loses strength as it travels down, what will happen to the measured reflectivity values at the bottom of the storm?\n\n" +
        "Will they look smaller or larger than they actually are? And how can we restore the lost energy?"
      );
    }
    if (q.includes("type") || q.includes("determined") || q.includes("csf") || q.includes("classify") || q.includes("convective") || q.includes("stratiform")) {
      return (
        "### Convective vs. Stratiform Detective\n\n" +
        "Imagine two types of storms: one is a quiet, steady rain that falls in even sheets; the other is a violent boiling pot of water with strong upward winds mixing ice and water.\n\n" +
        "Which of these two storms do you think will form a clean, horizontal melting line (Bright Band) as ice turns to rain?\n\n" +
        "And what will happen in the violent updraft storm?"
      );
    }
    if (q.includes("bright band") || q.includes("melting") || q.includes("freezing")) {
      return (
        "### The Mystery of the Melting Layer\n\n" +
        "Let's imagine you are looking at a dry snowflake falling through the air. Now, imagine it starts to melt. It becomes covered in a wet water film, but it hasn't collapsed into a tiny drop yet.\n\n" +
        "Water reflects radar signals much better than dry ice. If you have a large particle that is coated in liquid water, what do you think it looks like to the radar?\n\n" +
        "Does it look like a small raindrop, or does it look like a giant water mirror?\n\n" +
        "Tell me your thoughts on how this affects the radar reflection intensity at that altitude!"
      );
    }

    return (
      "Hello! I am your GPM Socratic Guide.\n\n" +
      "I won't give you the answers directly—instead, I'm here to help you discover them yourself. What concept are you exploring right now?\n\n" +
      "- **Bright Band / Melting Layer** (Why does it spike?)\n" +
      "- **Ku vs. Ka / DFR** (Why do different frequencies respond differently?)\n" +
      "- **Attenuation / Signal Loss** (What absorbs the radar pulse?)\n" +
      "- **SRT / Ocean Mirror** (How does the sea surface help us?)\n" +
      "- **CSF / Classification** (Stratiform vs. Convective rain)\n" +
      "- **Retrieval Pipeline** (Why does order matter?)"
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
