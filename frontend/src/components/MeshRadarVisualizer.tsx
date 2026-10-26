"use client";

import React, { useState } from "react";
import { Station } from "@/app/page";
import { soundFx } from "@/lib/audioFx";
import { triggerCyberParticles } from "@/lib/particles";

interface MeshRadarVisualizerProps {
  stations: Station[];
  onSelectStation: (station: Station) => void;
  onNavigateStation: (station: Station) => void;
}

export function MeshRadarVisualizer({
  stations,
  onSelectStation,
  onNavigateStation,
}: MeshRadarVisualizerProps) {
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);

  // Normalize coordinates for radar plotting (center around Vellore: lat ~12.93, lng ~79.15)
  const centerLat = 12.93;
  const centerLng = 79.15;
  const latSpan = 0.45; // approx 50 km coverage
  const lngSpan = 0.95;

  const getCanvasCoords = (lat: number, lng: number) => {
    // Map to percentage coordinates 5% - 95%
    const normX = 50 + ((lng - centerLng) / lngSpan) * 80;
    const normY = 50 - ((lat - centerLat) / latSpan) * 80;
    return {
      x: Math.max(8, Math.min(92, normX)),
      y: Math.max(8, Math.min(92, normY)),
    };
  };

  return (
    <div className="relative w-full bg-slate-950/90 border border-slate-800 rounded-3xl p-6 overflow-hidden shadow-2xl backdrop-blur-2xl">
      {/* Background Radar Rings & Grid Lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[85%] h-[85%] rounded-full border border-emerald-500/40" />
        <div className="absolute w-[60%] h-[60%] rounded-full border border-emerald-500/30" />
        <div className="absolute w-[35%] h-[35%] rounded-full border border-emerald-500/20" />
        <div className="absolute w-full h-[1px] bg-emerald-500/20" />
        <div className="absolute h-full w-[1px] bg-emerald-500/20" />
      </div>

      {/* Rotating Radar Sweep Beam */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div className="w-[85%] h-[85%] rounded-full relative radar-sweep-beam">
          <div className="w-1/2 h-1/2 absolute top-0 right-0 bg-gradient-to-br from-emerald-400/30 via-emerald-500/10 to-transparent rounded-tr-full origin-bottom-left" />
        </div>
      </div>

      {/* Radar Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Autonomous Mesh Radar Constellation
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time peer discovery showing 20 offline-first nodes across Vellore district.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Surplus Solar
          </span>
          <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Grid Strain
          </span>
          <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Battery Buffer
          </span>
        </div>
      </div>

      {/* Interactive Radar Plane */}
      <div className="relative w-full h-[420px] bg-slate-900/40 rounded-2xl border border-slate-800/60 overflow-hidden">
        {/* SVG Mesh Beams */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Connect center node (node_esp32_01) to neighbor nodes */}
          {stations.slice(1, 10).map((st, i) => {
            const start = getCanvasCoords(stations[0].latitude, stations[0].longitude);
            const end = getCanvasCoords(st.latitude, st.longitude);
            return (
              <line
                key={`line-${i}`}
                x1={`${start.x}%`}
                y1={`${start.y}%`}
                x2={`${end.x}%`}
                y2={`${end.y}%`}
                stroke="url(#beamGradient)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Station Node Blips on the Radar */}
        {stations.map((st) => {
          const pos = getCanvasCoords(st.latitude, st.longitude);
          const isSurplus = st.gridAvailability === "SURPLUS";
          const isStrained = st.gridAvailability === "STRAINED";
          const isBattery = st.gridAvailability === "BATTERY";

          const colorBg = isSurplus
            ? "bg-emerald-500"
            : isStrained
            ? "bg-rose-500"
            : isBattery
            ? "bg-amber-500"
            : "bg-blue-500";

          const ringColor = isSurplus
            ? "border-emerald-400"
            : isStrained
            ? "border-rose-400"
            : isBattery
            ? "border-amber-400"
            : "border-blue-400";

          return (
            <div
              key={st.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              onMouseEnter={() => {
                setHoveredStation(st);
                soundFx.playCyberClick();
              }}
              onClick={(e) => {
                triggerCyberParticles(e.clientX, e.clientY, isSurplus ? "solar" : "emerald");
                soundFx.playPowerPulse();
                onSelectStation(st);
              }}
            >
              {/* Outer Pulsing Aura */}
              <div
                className={`w-6 h-6 rounded-full border ${ringColor} opacity-75 animate-ping absolute -inset-1`}
              />

              {/* Core Node Marker */}
              <div
                className={`w-4 h-4 rounded-full ${colorBg} border-2 border-slate-950 flex items-center justify-center shadow-lg transition-transform group-hover:scale-150`}
              >
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>

              {/* Hover Floating Mini Label */}
              <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-5 whitespace-nowrap bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-[10px] font-mono text-white shadow-xl z-30 pointer-events-none">
                <span className="font-bold text-emerald-400">{st.name}</span>
                <span className="text-slate-400 ml-1.5">₹{st.rate.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Telemetry HUD Footer */}
      {hoveredStation && (
        <div className="relative z-10 mt-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {hoveredStation.id}
              </span>
              <h4 className="text-sm font-bold text-white">{hoveredStation.name}</h4>
              <span className="text-xs text-slate-400">• {hoveredStation.host}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">📍 {hoveredStation.place}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-white">₹{hoveredStation.rate.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400">/kWh</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">
                {hoveredStation.tariffReason}
              </span>
            </div>

            <button
              onClick={() => onNavigateStation(hoveredStation)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              📍 Route
            </button>
            <button
              onClick={() => onSelectStation(hoveredStation)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-emerald-900/40 transition"
            >
              ⚡ Charge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
