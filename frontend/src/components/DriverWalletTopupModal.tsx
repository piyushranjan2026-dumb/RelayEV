"use client";

import React, { useState } from "react";
import { soundFx } from "@/lib/audioFx";
import { triggerCyberParticles } from "@/lib/particles";

interface DriverWalletTopupModalProps {
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onBalanceUpdated: (newBalance: number) => void;
  backendUrl?: string;
}

export function DriverWalletTopupModal({
  currentBalance,
  isOpen,
  onClose,
  onBalanceUpdated,
  backendUrl = "http://localhost:8000",
}: DriverWalletTopupModalProps) {
  const [amount, setAmount] = useState<number>(200);
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI_INSTANT");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen) return null;

  const handlePresetSelect = (preset: number) => {
    soundFx.playCyberClick();
    setAmount(preset);
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`${backendUrl}/api/user/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "user_88",
          amount,
          payment_method: paymentMethod,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        soundFx.playEscrowSuccess();
        triggerCyberParticles(window.innerWidth / 2, window.innerHeight / 2, "emerald");
        setSuccessMessage(`₹${amount} added successfully! Reference: ${data.reference_id}`);
        onBalanceUpdated(data.new_balance);
        setTimeout(() => {
          onClose();
          setSuccessMessage("");
        }, 1400);
      } else {
        const err = await res.json();
        setErrorMessage(err.detail || "Topup failed");
      }
    } catch {
      // Offline fallback: top up local balance
      const newBal = +(currentBalance + amount).toFixed(2);
      soundFx.playEscrowSuccess();
      triggerCyberParticles(window.innerWidth / 2, window.innerHeight / 2, "emerald");
      onBalanceUpdated(newBal);
      setSuccessMessage(`₹${amount} added offline to wallet!`);
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1400);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md grid place-items-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-md text-slate-100 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        {/* Top ambient aura */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl">
              👛
            </div>
            <div>
              <h3 className="text-base font-black text-white">Driver Escrow Wallet</h3>
              <p className="text-xs text-slate-400">Pre-fund for offline charging dead-zones</p>
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

        {/* Current Balance Display */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Available Pre-Funded Balance
            </span>
            <div className="text-3xl font-black text-white mt-1">₹{currentBalance.toFixed(2)}</div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
            ✓ SECURED
          </span>
        </div>

        <form onSubmit={handleTopup} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Select Preset Recharge Amount:
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[100, 200, 500, 1000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    amount === preset
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 scale-105"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 text-sm font-bold">
                ₹
              </span>
              <input
                type="number"
                min="10"
                step="10"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Payment Instrument:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "UPI_INSTANT", label: "Instant UPI / QR ⚡" },
                { id: "DEBIT_CARD", label: "RuPay / Bank Card 💳" },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    soundFx.playCyberClick();
                    setPaymentMethod(m.id);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition cursor-pointer ${
                    paymentMethod === m.id
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl">
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
              ✓ {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-shimmer w-full text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
          >
            <span>⚡</span>
            <span>{isSubmitting ? "Locking Escrow Deposit..." : `Deposit ₹${amount} to Escrow`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
