"use client";

import { useState } from "react";
import { Trophy, CheckCircle, XCircle, Award, Star, RefreshCw, ArrowRight } from "lucide-react";

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Level {
  levelNum: number;
  title: string;
  xpReward: number;
  badge: string;
  questions: Question[];
}

export default function QuizPage() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [xp, setXp] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(["Radar Cadet"]);
  const [isLevelFinished, setIsLevelFinished] = useState(false);

  const levels: Level[] = [
    {
      levelNum: 1,
      title: "Radar Basics",
      xpReward: 30,
      badge: "Pulse Pioneer",
      questions: [
        {
          q: "What type of remote sensing instrument is the GPM Dual-frequency Precipitation Radar?",
          options: [
            "Passive Microwave Radiometer",
            "Active Microwave Radar",
            "Infrared Imager",
            "Visible Light Spectrometer"
          ],
          correct: 1,
          explanation: "Active radar sensors transmit their own electromagnetic pulses and measure the backscattered echo power, whereas passive radiometers only measure emitted thermal radiation."
        },
        {
          q: "How does GPM DPR measure the altitude of a precipitation range gate?",
          options: [
            "By measuring the frequency shift (Doppler effect)",
            "By measuring the round-trip time delay of the pulse",
            "By estimating cloud temperature profiles",
            "By analyzing the color intensity of the echo"
          ],
          correct: 1,
          explanation: "Because radar pulses travel at the speed of light, the time delay between transmitting the pulse and receiving the echo directly corresponds to distance (Range = c * time / 2)."
        }
      ]
    },
    {
      levelNum: 2,
      title: "Reflectivity & Echoes",
      xpReward: 40,
      badge: "Reflectivity Analyst",
      questions: [
        {
          q: "What causes the radar 'Bright Band' melting layer signature?",
          options: [
            "Reflections from high altitude nitrogen gas",
            "Fast-falling liquid rain drops collapsing",
            "Melting snowflakes coated in liquid water",
            "Light reflections from dry fluffy ice crystals"
          ],
          correct: 2,
          explanation: "As snowflakes melt from the outside, they get covered in water. Liquid water scatters radar energy much stronger than dry ice, and the large snowflake size causes a massive reflectivity peak."
        },
        {
          q: "For Rayleigh scattering, how does radar reflectivity scale with raindrop diameter?",
          options: [
            "Proportional to Diameter squared (D^2)",
            "Proportional to Diameter cubed (D^3)",
            "Proportional to Diameter to the fourth (D^4)",
            "Proportional to Diameter to the sixth (D^6)"
          ],
          correct: 3,
          explanation: "Under Rayleigh conditions (where drops are much smaller than wavelength), backscattering scales as diameter to the sixth power. This means a tiny increase in drop size causes a massive increase in reflectivity."
        }
      ]
    },
    {
      levelNum: 3,
      title: "Electromagnetic Attenuation",
      xpReward: 50,
      badge: "Attenuation Expert",
      questions: [
        {
          q: "Why is the Ka-band (35.5 GHz) signal much more attenuated by rain than the Ku-band (13.6 GHz)?",
          options: [
            "Because Ka-band has a shorter wavelength that is closer to raindrop sizes",
            "Because Ka-band has a longer wavelength that scatters off clouds",
            "Because the Ka-band antenna emits less power",
            "Because ice crystals absorb Ka-band energy completely"
          ],
          correct: 0,
          explanation: "Wavelength of Ka-band is 8.4mm, which is closer to the size of raindrops, triggering Mie scattering and thermal absorption. Ku-band (22mm wavelength) is much larger, experiencing minimal attenuation."
        },
        {
          q: "What does Path Integrated Attenuation (PIA) represent?",
          options: [
            "The height of the storm top",
            "The total signal strength lost by the pulse traversing the entire rain column and back",
            "The density of the cloud cover",
            "The dielectric constant of snow crystals"
          ],
          correct: 1,
          explanation: "PIA is the accumulated two-way attenuation (signal loss) in decibels along the radar beam path. It is corrected step-by-step to recover the true rain reflectivity."
        }
      ]
    },
    {
      levelNum: 4,
      title: "Dual Frequency Retrieval",
      xpReward: 60,
      badge: "DFR Master",
      questions: [
        {
          q: "How does the Dual-Frequency Ratio (DFR) help estimate raindrop sizes?",
          options: [
            "By comparing the speed of light at both frequencies",
            "By measuring the temperature difference in the cloud core",
            "By exploiting the difference in Mie scattering rolloff between Ku and Ka bands as drops grow",
            "By calculating the storm top height differences"
          ],
          correct: 2,
          explanation: "As drops grow, Ka-band reflectivity rolls off due to Mie scattering while Ku-band continues to follow Rayleigh scattering. The resulting ratio (Ku - Ka) corresponds to the mass-weighted mean diameter (Dm)."
        },
        {
          q: "What is the primary variable that is resolved using DFR in the DSD module?",
          options: [
            "Freezing Level Height",
            "Mass-Weighted Mean Diameter (Dm)",
            "Land-Water boundary flag",
            "Surface backscatter reference (Sigma-0)"
          ],
          correct: 1,
          explanation: "Dm represents the average size of the raindrops. Uniquely determining Dm using DFR allows the GPM-DPR algorithm to select the correct Z-R relationships to estimate rainfall rate accurately."
        }
      ]
    },
    {
      levelNum: 5,
      title: "Advanced DPR Scientist",
      xpReward: 80,
      badge: "DPR Scientist",
      questions: [
        {
          q: "How does the Surface Reference Technique (SRT) compute column attenuation?",
          options: [
            "By measuring wind speeds over the ocean",
            "By comparing the surface backscatter under rain to a clean-air reference database",
            "By analyzing the temperature profiles of storm cores",
            "By measuring radar noise floor thresholds"
          ],
          correct: 1,
          explanation: "SRT computes PIA by measuring how much the land/ocean surface echo drops when rain is present. The difference between clean reference Sigma-0 and measured rainy Sigma-0 yields the total attenuation."
        },
        {
          q: "Why did NASA/JAXA perform an orbital boost of the GPM satellite from 407km to 435km?",
          options: [
            "To escape solar storm flares",
            "To match the orbit of the International Space Station",
            "To extend fuel lifetime and synchronize scan overlaps with other satellites",
            "To capture light snow more effectively"
          ],
          correct: 2,
          explanation: "The orbital boost in 2021 raised GPM to 435km to counter atmospheric drag and extend the spacecraft's operational fuel lifespan, sustaining the long-term climatological records."
        }
      ]
    }
  ];

  const currentLevel = levels[currentLevelIdx];
  const currentQuestion = currentLevel.questions[currentQuestionIdx];

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    
    // Check answer
    if (idx === currentQuestion.correct) {
      setXp(prev => prev + 15);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    
    if (currentQuestionIdx < currentLevel.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Finished level
      setIsLevelFinished(true);
      // Unlock badge if not unlocked yet
      if (!unlockedBadges.includes(currentLevel.badge)) {
        setUnlockedBadges(prev => [...prev, currentLevel.badge]);
      }
      setXp(prev => prev + currentLevel.xpReward);
    }
  };

  const startNextLevel = () => {
    setIsLevelFinished(false);
    setCurrentQuestionIdx(0);
    setCurrentLevelIdx(prev => Math.min(prev + 1, levels.length - 1));
  };

  const restartQuiz = () => {
    setCurrentLevelIdx(0);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setXp(0);
    setUnlockedBadges(["Radar Cadet"]);
    setIsLevelFinished(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-amber-400 font-semibold tracking-widest uppercase font-mono">Gamified Academy</span>
          <h1 className="text-3xl font-extrabold text-white font-sans">Quiz Mode</h1>
        </div>

        {/* XP and Badges Summary */}
        <div className="flex items-center gap-4 bg-gray-900/60 p-2 border border-gray-800 rounded-xl">
          <div className="flex flex-col font-mono text-xs px-2">
            <span className="text-gray-500">XP SCORE</span>
            <span className="text-amber-400 font-bold">{xp} XP</span>
          </div>
          <div className="h-6 w-[1px] bg-gray-800"></div>
          <div className="flex items-center gap-1.5 text-xs text-white font-semibold pr-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{unlockedBadges[unlockedBadges.length - 1]}</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      {!isLevelFinished ? (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-gray-800 flex flex-col gap-6 bg-gray-950/20 relative overflow-hidden">
          
          {/* Level information bar */}
          <div className="flex items-center justify-between border-b border-gray-850 pb-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">LEVEL {currentLevel.levelNum} OF 5</span>
              <span className="text-sm font-bold text-white">{currentLevel.title}</span>
            </div>
            
            <div className="text-[10px] text-gray-400 font-mono">
              Question {currentQuestionIdx + 1} / {currentLevel.questions.length}
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-lg font-bold text-white leading-relaxed">
            {currentQuestion.q}
          </h2>

          {/* Options list */}
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((opt, idx) => {
              let btnStyle = "bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-850 hover:text-white";
              let statusIcon = null;

              if (isAnswered) {
                if (idx === currentQuestion.correct) {
                  btnStyle = "bg-emerald-950/30 border-emerald-500/50 text-emerald-400 font-semibold";
                  statusIcon = <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
                } else if (selectedOption === idx) {
                  btnStyle = "bg-rose-950/30 border-rose-500/50 text-rose-400";
                  statusIcon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
                } else {
                  btnStyle = "bg-gray-950 border-gray-900 text-gray-600 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  className={`flex items-center justify-between p-4 rounded-2xl border text-left text-xs transition-all ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {statusIcon}
                </button>
              );
            })}
          </div>

          {/* Explanation panel */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-850 text-xs text-gray-400 leading-relaxed font-light animate-fadeIn">
              <span className="font-bold text-white block mb-1">Explanation:</span>
              {currentQuestion.explanation}
              
              <button
                onClick={handleNext}
                className="mt-4 flex items-center gap-1 bg-amber-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-amber-500 transition-all text-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      ) : (
        /* Level Finished Screen */
        <div className="glass-panel p-8 rounded-3xl border border-gray-800 text-center flex flex-col items-center gap-6 bg-gray-950/20 animate-fadeIn">
          <Trophy className="w-16 h-16 text-amber-400 animate-bounce" />
          
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white">Level Complete!</h2>
            <p className="text-gray-300 text-sm font-light">
              You have successfully completed **Level {currentLevel.levelNum}: {currentLevel.title}**.
            </p>
          </div>

          {/* Badge unlocked alert */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex flex-col items-center gap-2 max-w-sm">
            <Award className="w-10 h-10 text-amber-400" />
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-semibold">New Badge Unlocked</span>
            <span className="text-md font-extrabold text-white">{currentLevel.badge}</span>
            <span className="text-[11px] text-amber-500 font-bold font-mono">+{currentLevel.xpReward} XP Reward Claimed</span>
          </div>

          <div className="flex gap-4 mt-2">
            {currentLevelIdx < levels.length - 1 ? (
              <button
                onClick={startNextLevel}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white text-xs shadow-lg shadow-amber-950/20 transition-all"
              >
                <span>Proceed to Level {currentLevelIdx + 2}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                <span className="text-emerald-400 font-mono text-xs font-bold uppercase">CONGRATULATIONS! YOU ARE AN ADVANCED DPR SCIENTIST!</span>
                <button
                  onClick={restartQuiz}
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restart Academy</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badges unlocked grid */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Unlocked Badges Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {levels.map((lvl) => {
            const isUnlocked = unlockedBadges.includes(lvl.badge);
            return (
              <div 
                key={lvl.badge}
                className={`p-4 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                  isUnlocked 
                    ? "bg-amber-950/5 border-amber-500/20 text-white" 
                    : "bg-gray-900/30 border-gray-900 text-gray-700 opacity-45"
                }`}
              >
                <Award className={`w-8 h-8 ${isUnlocked ? "text-amber-400" : "text-gray-700"}`} />
                <span className="text-[10px] font-bold tracking-wider leading-none mt-1 truncate max-w-full">{lvl.badge}</span>
                <span className="text-[8px] font-mono text-gray-500">Level {lvl.levelNum}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
