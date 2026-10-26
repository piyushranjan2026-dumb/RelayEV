"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { soundFx } from "@/lib/audioFx";

export function Navigation() {
  const pathname = usePathname();
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeNodesCount, setActiveNodesCount] = useState<number>(20);

  useEffect(() => {
    setIsMuted(soundFx.getMuted());
  }, []);

  const handleToggleSound = () => {
    const nextState = soundFx.toggleMute();
    setIsMuted(nextState);
  };

  const navItems = [
    { label: "Overview", href: "/", icon: "⚡" },
    { label: "Hex Map", href: "/map", icon: "🗺️" },
    { label: "BLE Charger", href: "/charge", icon: "🔌" },
    { label: "Escrow Settle", href: "/settle", icon: "🛡️" },
    { label: "Host Portal", href: "/host", icon: "📊" },
    { label: "Data Mule", href: "/mule", icon: "🚗" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
      {/* Brand & Mesh Live Status */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          onClick={() => soundFx.playCyberClick()}
          className="flex items-center gap-2.5 text-white font-extrabold text-lg tracking-tight group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-emerald-400 text-sm font-black">
              ⚡
            </div>
          </div>
          <span className="flex items-baseline">
            Relay<span className="text-emerald-400 font-black">EV</span>
          </span>
        </Link>

        {/* Live Network Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{activeNodesCount} NODES ACTIVE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => soundFx.playCyberClick()}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 scale-[1.02]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Quick Controls: Audio FX Toggle & Emergency BLE */}
      <div className="flex items-center gap-2">
        {/* Sound FX Toggle Pill */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? "Enable Sound FX" : "Mute Sound FX"}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
            isMuted
              ? "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/20"
          }`}
        >
          <span>{isMuted ? "🔇" : "🔊"}</span>
          <span className="hidden sm:inline text-[10px]">
            {isMuted ? "MUTED" : "FX ON"}
          </span>
        </button>

        {/* Instant BLE Charge Link */}
        <Link
          href="/charge"
          onClick={() => {
            soundFx.playChargeHum();
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-emerald-900/40 transition flex items-center gap-1 cursor-pointer"
        >
          <span>⚡</span>
          <span className="hidden sm:inline">Connect BLE</span>
        </Link>
      </div>
    </nav>
  );
}
