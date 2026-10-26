"use client";

import React, { useState } from "react";
import { Coordinates, calculateDistanceKm, getGoogleMapsNavigationUrl } from "@/lib/geoUtils";
import { soundFx } from "@/lib/audioFx";
import { triggerCyberParticles } from "@/lib/particles";

export interface NavStation {
  id: string;
  name: string;
  host: string;
  place: string;
  power: string;
  rate: number;
  baseRate?: number;
  gridAvailability?: "SURPLUS" | "NORMAL" | "STRAINED" | "BATTERY" | string;
  powerSource?: string;
  tariffMultiplier?: number;
  tariffReason?: string;
  badgeColor?: string;
  latitude: number;
  longitude: number;
  initials: string;
}

interface RouteNavigationModalProps {
  station: NavStation | null;
  driverCoords: Coordinates;
  isOpen: boolean;
  onClose: () => void;
  onStartCharging: (station: NavStation) => void;
}

export function RouteNavigationModal({
  station,
  driverCoords,
  isOpen,
  onClose,
  onStartCharging,
}: RouteNavigationModalProps) {
  const [targetKwh, setTargetKwh] = useState<number>(10);

  if (!isOpen || !station) return null;

  const distanceKm = calculateDistanceKm(driverCoords, {
    latitude: station.latitude,
    longitude: station.longitude,
  });

  const driveMinutes = Math.max(2, Math.round((distanceKm / 30) * 60));
  const estimatedCost = +(targetKwh * station.rate).toFixed(2);
  const powerKw = parseFloat(station.power) || 3.3;
  const chargeHours = +(targetKwh / powerKw).toFixed(1);
  const addedRangeKm = Math.round(targetKwh * 9); // ~9 km/kWh average

  const isSurplus = station.gridAvailability === "SURPLUS";
  const isStrained = station.gridAvailability === "STRAINED";
  const isBattery = station.gridAvailability === "BATTERY";

  const googleMapsUrl = getGoogleMapsNavigationUrl(
    { latitude: station.latitude, longitude: station.longitude },
    station.name
  );

  const handleStartChargingClick = (e: React.MouseEvent) => {
    soundFx.playChargeHum();
    triggerCyberParticles(e.clientX, e.clientY, isSurplus ? "solar" : "emerald");
    onStartCharging(station);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-lg text-slate-100 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        {/* Top ambient aura */}
        <div
          className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-25 pointer-events-none ${
            isSurplus ? "bg-emerald-400" : isStrained ? "bg-rose-500" : "bg-blue-400"
          }`}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xl">
              🗺️
            </div>
            <div>
              <h3 className="text-base font-black text-white">Route Navigation</h3>
              <p className="text-xs text-slate-400">
                {station.id} • {station.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playCyberClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Dynamic Grid Tariff Banner */}
        <div
          className={`p-3.5 rounded-2xl mb-4 border flex items-center justify-between text-xs ${
            isSurplus
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : isStrained
              ? "bg-rose-950/40 border-rose-500/40 text-rose-300"
              : isBattery
              ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
              : "bg-blue-950/40 border-blue-500/40 text-blue-300"
          }`}
        >
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>
                {isSurplus && "🟢 Surplus Solar Energy (-20%)"}
                {isStrained && "🔴 Peak Demand Strain (+35%)"}
                {isBattery && "⚡ Inverter Battery Backup (+20%)"}
                {station.gridAvailability === "NORMAL" && "🟡 Standard Municipal Grid"}
              </span>
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">{station.tariffReason}</div>
          </div>

          <div className="text-right">
            <div className="font-black text-base">₹{station.rate.toFixed(2)}</div>
            <div className="text-[10px] opacity-70">/ kWh</div>
          </div>
        </div>

        {/* Distance & Drive Time Metric Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Distance</span>
            <span className="text-base font-black text-white">{distanceKm} km</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Drive Time</span>
            <span className="text-base font-black text-cyan-400">~{driveMinutes} mins</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">AC Power</span>
            <span className="text-base font-black text-emerald-400">{station.power}</span>
          </div>
        </div>

        {/* Target Energy Slider */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-300">Target Charge Energy:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {targetKwh} kWh (~{addedRangeKm} km range)
            </span>
          </div>

          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={targetKwh}
            onChange={(e) => {
              setTargetKwh(Number(e.target.value));
              soundFx.playCyberClick();
            }}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
            <span>Est. Duration: ~{chargeHours} hrs</span>
            <span>Est. Escrow Lock: <strong className="text-white text-xs">₹{estimatedCost}</strong></span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundFx.playCyberClick()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span>🧭</span>
            <span>Open in Maps</span>
          </a>

          <button
            onClick={handleStartChargingClick}
            className="btn-shimmer text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
          >
            <span>⚡</span>
            <span>Connect & Charge</span>
          </button>
        </div>
      </div>
    </div>
  );
}
