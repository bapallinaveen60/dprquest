"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Menu, 
  X, 
  Radio, 
  HelpCircle 
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Learn by Story", href: "/story", icon: BookOpen },
    { name: "Algorithm Explorer", href: "/explorer", icon: GitBranch },
    { name: "Simulators", href: "/simulator", icon: Sliders },
    { name: "Granule Explorer", href: "/granule", icon: Map },
    { name: "Variable Dictionary", href: "/dictionary", icon: Book },
    { name: "Equation Translator", href: "/translator", icon: Binary },
    { name: "Quiz Mode", href: "/quiz", icon: Trophy },
    { name: "Research Mode", href: "/research", icon: LineChart },
  ];

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="lg:hidden w-full h-16 glass-panel fixed top-0 left-0 z-50 flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
          <span className="font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
            GPM-DPR Explorer
          </span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-gray-300 hover:text-white p-1"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop/Mobile Sidebar */}
      <aside className={`
        fixed top-16 lg:top-0 left-0 z-40 h-[calc(100vh-4rem)] lg:h-screen w-64 
        glass-panel border-r border-gray-800 transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full justify-between p-6">
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-3 py-2 border-b border-gray-800">
              <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg leading-none bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
                  GPM-DPR
                </span>
                <span className="text-xs text-gray-400 tracking-wider">EXPLORER</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-2">
              <Link 
                href="/"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/" 
                    ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400" 
                    : "text-gray-400 hover:bg-gray-800/40 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Radio className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400" 
                        : "text-gray-400 hover:bg-gray-800/40 hover:text-white"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick AI Tutor & Footer Info */}
          <div className="flex flex-col gap-4 border-t border-gray-800 pt-4">
            <Link
              href="/tutor"
              className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                pathname === "/tutor"
                  ? "bg-magenta-600 text-white"
                  : "bg-magenta-600/20 text-magenta-400 hover:bg-magenta-600/35 border border-magenta-500/20"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <MessageSquareCode className="w-4 h-4 animate-bounce" />
              <span>Ask AI Tutor</span>
            </Link>
            
            <div className="text-center">
              <span className="text-[10px] text-gray-500">NASA & JAXA GPM Mission Learn Suite</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
