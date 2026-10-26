"use client";

import React, { useState } from "react";
import { Station } from "@/app/page";
import { soundFx } from "@/lib/audioFx";
import { triggerCyberParticles } from "@/lib/particles";

interface InteractiveStationCardProps {
  station: Station;
  distanceKm: number;
  onCharge: (station: Station) => void;
  onNavigate: (station: Station, e: React.MouseEvent) => void;
}

export function InteractiveStationCard({
  station,
  distanceKm,
  onCharge,
  onNavigate,
}: InteractiveStationCardProps) {
  const [showTariffDetails, setShowTariffDetails] = useState<boolean>(false);

  // Quick range estimate based on average 9 km per kWh for modern 2W/3W EVs
  const kwhFor100Rs = station.rate > 0 ? (100 / station.rate).toFixed(1) : "0";
  const estRangeKm = station.rate > 0 ? Math.round((100 / station.rate) * 9) : 0;

  const isSurplus = station.gridAvailability === "SURPLUS";
  const isStrained = station.gridAvailability === "STRAINED";
  const isBattery = station.gridAvailability === "BATTERY";

  const handleChargeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playChargeHum();
    triggerCyberParticles(e.clientX, e.clientY, isSurplus ? "solar" : "emerald");
    onCharge(station);
  };

  const handleNavigateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playCyberClick();
    onNavigate(station, e);
  };

  return (
    <div
      onClick={() => onCharge(station)}
      className="station-card-3d bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-5 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden backdrop-blur-xl"
    >
      {/* Top Ambient Glow Accent */}
      <div
        className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 ${
          isSurplus
            ? "bg-emerald-400"
            : isStrained
            ? "bg-rose-500"
            : isBattery
            ? "bg-amber-400"
            : "bg-blue-400"
        }`}
      />

      <div>
        {/* Card Header: Initials Avatar + Station Name + Live Status */}
        <div className="flex items-start justify-between gap-2 mb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm border shadow-lg transition-transform group-hover:scale-105 ${
                isSurplus
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
                  : isStrained
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10"
                  : isBattery
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/10"
              }`}
            >
              {station.initials}
            </div>

            <div>
              <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors line-clamp-1">
                {station.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">{station.host}</p>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${
              station.status === "Available"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}
          >
            {station.status === "Available" ? "🟢 ONLINE" : "🟡 CHARGING"}
          </span>
        </div>

        {/* Dynamic Grid Availability Badge */}
        {station.gridAvailability && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap relative z-10">
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                isSurplus
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 badge-pulse-surplus"
                  : isStrained
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : isBattery
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/40"
              }`}
            >
              {isSurplus && "🟢 Surplus Solar (-20%)"}
              {isStrained && "🔴 Grid Strain (+35%)"}
              {isBattery && "⚡ Battery Backup (+20%)"}
              {station.gridAvailability === "NORMAL" && "🟡 Normal Grid"}
            </span>

            {station.powerSource && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                {station.powerSource}
              </span>
            )}
          </div>
        )}

        {/* Location Address */}
        <div className="flex items-start gap-1.5 text-xs text-slate-300 mb-2 relative z-10">
          <span className="text-slate-400 shrink-0">📍</span>
          <span className="line-clamp-2 leading-relaxed">{station.place}</span>
        </div>

        {/* Hardware / Shaded Parking Note */}
        {station.hardwareNote && (
          <div className="text-[11px] text-slate-400 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 mb-3 relative z-10 flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold shrink-0">✓</span>
            <span className="line-clamp-2">{station.hardwareNote}</span>
          </div>
        )}

        {/* Quick Range Estimate Pill */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/60 rounded-xl px-2.5 py-1.5 border border-slate-800 mb-4">
          <span className="flex items-center gap-1">
            <span className="text-emerald-400">⚡</span>
            <span>₹100 yields ~{kwhFor100Rs} kWh</span>
          </span>
          <span className="text-emerald-400 font-bold">~{estRangeKm} km range</span>
        </div>
      </div>

      {/* Footer: Tariff & Action Buttons */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">₹{station.rate.toFixed(2)}</span>
              {station.baseRate && Math.abs(station.baseRate - station.rate) > 0.01 && (
                <span className="text-xs text-slate-500 line-through">
                  ₹{station.baseRate.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-slate-400">/ kWh</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="bg-slate-950 text-slate-300 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-800">
              ⚡ {station.power}
            </span>
            <span className="bg-cyan-500/10 text-cyan-400 font-mono text-[11px] px-2 py-0.5 rounded border border-cyan-500/30">
              🚗 {distanceKm} km
            </span>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleNavigateClick}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <span>📍</span>
            <span>Route</span>
          </button>

          <button
            onClick={handleChargeClick}
            className="btn-shimmer w-full text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <span>⚡</span>
            <span>Charge</span>
          </button>
        </div>
      </div>
    </div>
  );
}
