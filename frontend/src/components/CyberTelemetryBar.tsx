"use client";

import React, { useState } from "react";
import { soundFx } from "@/lib/audioFx";
import { triggerCyberParticles } from "@/lib/particles";

interface CyberTelemetryBarProps {
  onSimulateState: (state: "SURPLUS" | "STRAINED" | "BATTERY" | "NORMAL") => void;
  activeFilter: string;
}

export function CyberTelemetryBar({ onSimulateState }: CyberTelemetryBarProps) {
  const [activeSim, setActiveSim] = useState<string>("NORMAL");
  const [notification, setNotification] = useState<string | null>(null);

  const handleSimulate = (state: "SURPLUS" | "STRAINED" | "BATTERY" | "NORMAL", e: React.MouseEvent) => {
    setActiveSim(state);
    soundFx.playPowerPulse();
    triggerCyberParticles(
      e.clientX,
      e.clientY,
      state === "SURPLUS" ? "solar" : state === "STRAINED" ? "electric" : "emerald"
    );
    onSimulateState(state);

    const labels = {
      SURPLUS: "☀️ Solar generation surplus injected! All solar stations receiving 20% discount.",
      STRAINED: "⚡ Industrial grid peak strain simulated! +35% surge tariff applied to heavy nodes.",
      BATTERY: "🔋 Feeder blackout simulated! Nodes seamlessly running on inverter battery backup (+20%).",
      NORMAL: "🔄 Standard municipal grid availability restored across all 20 mesh nodes.",
    };

    setNotification(labels[state]);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const tickerItems = [
    "🟢 SOLAR GENERATION: 48.6 kW (SURPLUS IN HIGHWAY CORRIDOR)",
    "⚡ 20/20 MESH NODES OPERATIONAL (ZERO SIM CARD OPEX)",
    "📡 BLUETOOTH LE 5.2 BEACON ADVERTISING: ACTIVE",
    "🛡️ CRYPTOGRAPHIC OFFLINE ESCROW ENGINE: ARMED",
    "🔋 HIGHWAY INVERTER STORAGE BUFFER: 184.2 kWh (98% FULL)",
    "🚗 DATA MULE SYNC PROTOCOL: READY FOR DRIVE-BY VOUCHERS",
    "📍 VELLORE - KATPADI - RANIPET - AMBUR MESH LINK: VERIFIED",
  ];

  return (
    <div className="w-full mb-6 flex flex-col gap-3">
      {/* 1. Continuous Cybernetic Market Ticker */}
      <div className="w-full bg-slate-950/80 border border-slate-800/90 rounded-2xl overflow-hidden py-1.5 shadow-md flex items-center">
        <div className="px-3 shrink-0 flex items-center gap-1.5 border-r border-slate-800 text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>LIVE MESH TELEMETRY</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="ticker-track flex items-center gap-8 text-[11px] font-mono text-slate-300">
            {tickerItems.concat(tickerItems).map((text, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <span>{text}</span>
                <span className="text-slate-600">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive Power Grid Simulation Controls */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-850/90 to-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-black shrink-0">
            🎛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Live Grid Tariff Simulation Sandbox
              </h4>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                INTERACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Test dynamic tariff recalculation live across all 20 stations. Click any state to simulate grid shifts:
            </p>
          </div>
        </div>

        {/* Action Buttons Strip */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={(e) => handleSimulate("SURPLUS", e)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSim === "SURPLUS"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105"
                : "bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            <span>☀️</span>
            <span>Solar Surplus (-20%)</span>
          </button>

          <button
            onClick={(e) => handleSimulate("STRAINED", e)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSim === "STRAINED"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                : "bg-slate-800/80 hover:bg-slate-700 text-rose-400 border border-rose-500/30"
            }`}
          >
            <span>⚡</span>
            <span>Peak Strain (+35%)</span>
          </button>

          <button
            onClick={(e) => handleSimulate("BATTERY", e)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSim === "BATTERY"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105"
                : "bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-amber-500/30"
            }`}
          >
            <span>🔋</span>
            <span>Inverter Backup (+20%)</span>
          </button>

          <button
            onClick={(e) => handleSimulate("NORMAL", e)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSim === "NORMAL"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >
            <span>🔄</span>
            <span>Reset Grid</span>
          </button>
        </div>
      </div>

      {/* Floating Simulation Broadcast Notification */}
      {notification && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-slide-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
