"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChargingSessionManager } from "@/components/ChargingSessionManager";
import { DriverWalletTopupModal } from "@/components/DriverWalletTopupModal";
import { RouteNavigationModal, NavStation } from "@/components/RouteNavigationModal";
import { Coordinates, calculateDistanceKm, DEFAULT_DRIVER_COORDS } from "@/lib/geoUtils";
import { CyberTelemetryBar } from "@/components/CyberTelemetryBar";
import { MeshRadarVisualizer } from "@/components/MeshRadarVisualizer";
import { InteractiveStationCard } from "@/components/InteractiveStationCard";
import { soundFx } from "@/lib/audioFx";
import { triggerCyberParticles } from "@/lib/particles";

export interface Station extends NavStation {
  status: "Available" | "Charging";
  color: "mint" | "peach" | "blue" | "emerald";
  coords: { x: number; y: number };
  hardwareNote?: string;
  baseRate?: number;
  gridAvailability?: "SURPLUS" | "NORMAL" | "STRAINED" | "BATTERY" | string;
  powerSource?: string;
  tariffReason?: string;
}

const initialStations: Station[] = [
  {
    id: "node_esp32_01",
    name: "VIT Campus Solar Relay",
    host: "Rajesh Kumar (VIT Solar Grid)",
    place: "Near VIT Main Gate, Tiruvalam Road, Katpadi",
    power: "3.3 kW",
    rate: 8.00,
    baseRate: 10.00,
    gridAvailability: "SURPLUS",
    powerSource: "SOLAR",
    tariffReason: "Surplus Green Solar / Off-Peak (20% Discount)",
    status: "Available",
    initials: "VC",
    color: "mint",
    latitude: 12.9692,
    longitude: 79.1559,
    coords: { x: 50, y: 35 },
    hardwareNote: "100% Rooftop solar + PZEM-004T with shaded 2W bay",
  },
  {
    id: "node_esp32_02",
    name: "Katpadi Junction Charging Point",
    host: "Murugan S. (Station Relay)",
    place: "Near Katpadi Railway Station, NH-46",
    power: "3.3 kW",
    rate: 12.50,
    baseRate: 12.50,
    gridAvailability: "NORMAL",
    powerSource: "GRID",
    tariffReason: "Standard Grid Power Availability",
    status: "Available",
    initials: "KJ",
    color: "blue",
    latitude: 12.9783,
    longitude: 79.1450,
    coords: { x: 42, y: 28 },
    hardwareNote: "24/7 Chai point beside station parking, 30A relay",
  },
  {
    id: "node_esp32_03",
    name: "Sripuram Golden Temple Hub",
    host: "Lakshmi Narayani Trust",
    place: "Malaikodi, Sripuram Temple Road",
    power: "7.2 kW",
    rate: 6.80,
    baseRate: 8.50,
    gridAvailability: "SURPLUS",
    powerSource: "SOLAR",
    tariffReason: "Solar Pilgrim Trust Subsidy (20% Off)",
    status: "Available",
    initials: "SG",
    color: "peach",
    latitude: 12.8998,
    longitude: 79.1162,
    coords: { x: 35, y: 65 },
    hardwareNote: "Dual Type-2 Fast AC with pilgrimage visitor parking",
  },
  {
    id: "node_esp32_04",
    name: "Vellore Fort Heritage Tap",
    host: "Kannan Heritage Cafeteria",
    place: "Opp. Vellore Fort East Gate, Anna Salai",
    power: "3.3 kW",
    rate: 11.00,
    baseRate: 11.00,
    gridAvailability: "NORMAL",
    powerSource: "GRID",
    tariffReason: "Standard City Grid Availability",
    status: "Available",
    initials: "VF",
    color: "emerald",
    latitude: 12.9205,
    longitude: 79.1325,
    coords: { x: 46, y: 52 },
    hardwareNote: "Heritage moat parking with shaded tree canopy",
  },
  {
    id: "node_esp32_05",
    name: "Bagayam Rural Clean Hub",
    host: "Dr. Anand Green Energy",
    place: "Near CMC Bagayam Campus, College Hill",
    power: "3.3 kW",
    rate: 7.60,
    baseRate: 9.50,
    gridAvailability: "SURPLUS",
    powerSource: "SOLAR",
    tariffReason: "Clean Campus Micro-Grid Solar (20% Off)",
    status: "Available",
    initials: "BR",
    color: "mint",
    latitude: 12.8710,
    longitude: 79.1350,
    coords: { x: 48, y: 78 },
    hardwareNote: "Solar battery buffer, open for public 2W/3W charging",
  },
  {
    id: "node_esp32_06",
    name: "Ranipet Industrial Corridor Relay",
    host: "Ranipet Fleet Co-op",
    place: "SIPCOT Phase 1, Chennai Highway, Ranipet",
    power: "7.4 kW",
    rate: 17.55,
    baseRate: 13.00,
    gridAvailability: "STRAINED",
    powerSource: "GRID",
    tariffReason: "SIPCOT Industrial Peak Load Surge (+35%)",
    status: "Available",
    initials: "RI",
    color: "blue",
    latitude: 12.9275,
    longitude: 79.3330,
    coords: { x: 80, y: 48 },
    hardwareNote: "Heavy-duty 32A industrial line for commercial cargo 3W",
  },
  {
    id: "node_esp32_07",
    name: "Ambur Leather Town Node",
    host: "Ismail Leather Works",
    place: "NH-48 Bypass, Near Star Biryani, Ambur",
    power: "3.3 kW",
    rate: 14.40,
    baseRate: 12.00,
    gridAvailability: "BATTERY",
    powerSource: "HYBRID",
    tariffReason: "Highway Battery Backup Inverter (+20%)",
    status: "Available",
    initials: "AL",
    color: "peach",
    latitude: 12.7905,
    longitude: 78.7160,
    coords: { x: 12, y: 88 },
    hardwareNote: "Highway rest stop node with 24/7 tea & tire check",
  },
  {
    id: "node_esp32_08",
    name: "Sholinghur Hill Temple Relay",
    host: "Govindarajan Temple Inn",
    place: "Foot of Yoga Narasimha Swamy Hill, Sholinghur",
    power: "3.3 kW",
    rate: 14.18,
    baseRate: 10.50,
    gridAvailability: "STRAINED",
    powerSource: "GRID",
    tariffReason: "Hill Route Peak Grid Strain (+35%)",
    status: "Available",
    initials: "SH",
    color: "emerald",
    latitude: 13.1140,
    longitude: 79.4240,
    coords: { x: 88, y: 15 },
    hardwareNote: "Solar off-grid battery backed charging tap",
  },
  {
    id: "node_esp32_09",
    name: "Walajah Highway Toll Dhaba",
    host: "Highway King Dhaba Tap",
    place: "NH-48 Toll Plaza Corridor, Walajapet",
    power: "7.2 kW",
    rate: 16.80,
    baseRate: 14.00,
    gridAvailability: "BATTERY",
    powerSource: "HYBRID",
    tariffReason: "Toll Plaza High-Power Inverter Storage (+20%)",
    status: "Available",
    initials: "WH",
    color: "mint",
    latitude: 12.9810,
    longitude: 79.3620,
    coords: { x: 84, y: 32 },
    hardwareNote: "24/7 Dhaba dining with fenced overnight EV charging bay",
  },
  {
    id: "node_esp32_10",
    name: "Gudiyatham Agricultural Feeder",
    host: "Venkatesan Agro Solar",
    place: "Agricultural Market Yard, Gudiyatham Bypass",
    power: "3.3 kW",
    rate: 7.20,
    baseRate: 9.00,
    gridAvailability: "SURPLUS",
    powerSource: "SOLAR",
    tariffReason: "Agro Solar Cooperative Surplus (20% Off)",
    status: "Available",
    initials: "GA",
    color: "blue",
    latitude: 12.9460,
    longitude: 78.8710,
    coords: { x: 22, y: 45 },
    hardwareNote: "Subsidized farm community tariff with solar canopy",
  },
  {
    id: "node_esp32_11",
    name: "Arcot Royal Palace Tap",
    host: "Nawaz Basha (Arcot Sweets Corner)",
    place: "Palace Road, Near Arcot Clock Tower",
    power: "3.3 kW",
    rate: 10.50,
    baseRate: 10.50,
    gridAvailability: "NORMAL",
    powerSource: "GRID",
    tariffReason: "Standard Municipal Grid Tariff",
    status: "Available",
    initials: "AP",
    color: "mint",
    latitude: 12.9042,
    longitude: 79.3326,
    coords: { x: 74, y: 55 },
    hardwareNote: "Town center sweet stall tap with shaded e-bike parking",
  },
  {
    id: "node_esp32_12",
    name: "Vaniyambadi Biryani Expressway Stop",
    host: "Farooq Hospitality & EV Point",
    place: "Chennai-Bengaluru Highway, Vaniyambadi Toll",
    power: "7.4 kW",
    rate: 10.80,
    baseRate: 13.50,
    gridAvailability: "SURPLUS",
    powerSource: "SOLAR",
    tariffReason: "High-Capacity Highway Solar Canopy (20% Off)",
    status: "Available",
    initials: "VB",
    color: "peach",
    latitude: 12.6830,
    longitude: 78.6180,
    coords: { x: 8, y: 95 },
    hardwareNote: "Express highway dual 32A charging with 24h restaurant",
  },
  {
    id: "node_esp32_13",
    name: "Pallikonda Toll Plaza Safe Rest",
    host: "Senguttuvan Highway Lodge",
    place: "NH-48 KM 126, Pallikonda Service Road",
    power: "3.3 kW",
    rate: 14.40,
    baseRate: 12.00,
    gridAvailability: "BATTERY",
    powerSource: "HYBRID",
    tariffReason: "Highway Heavy Inverter Storage Relay (+20%)",
    status: "Available",
    initials: "PT",
    color: "blue",
    latitude: 12.9090,
    longitude: 78.9660,
    coords: { x: 30, y: 62 },
    hardwareNote: "Quiet night parking with 16A industrial plug socket",
  },
  {
    id: "node_esp32_14",
    name: "Melvisharam Tannery Eco-Charge",
    host: "Tariq Leather Works & Green Power",
    place: "Trunk Road, Melvisharam Industrial Area",
    power: "3.3 kW",
    rate: 15.53,
    baseRate: 11.50,
    gridAvailability: "STRAINED",
    powerSource: "GRID",
    tariffReason: "Industrial Feeder Peak Strain (+35%)",
    status: "Available",
    initials: "MT",
    color: "emerald",
    latitude: 12.9350,
    longitude: 79.2480,
    coords: { x: 62, y: 46 },
    hardwareNote: "Secured yard with surge protector & fire safety buffer",
  },
  {
    id: "node_esp32_15",
    name: "Tiruvallam Bridge River Tap",
    host: "Selvam Coconut Grove & Charging",
    place: "Ponnai Road Junction, Tiruvallam",
    power: "3.3 kW",
    rate: 7.20,
    baseRate: 9.00,
    gridAvailability: "SURPLUS",
    powerSource: "SOLAR",
    tariffReason: "Riverbed Farm Solar Array Discount (20% Off)",
    status: "Available",
    initials: "TB",
    color: "mint",
    latitude: 12.9960,
    longitude: 79.2230,
    coords: { x: 58, y: 22 },
    hardwareNote: "Shaded coconut orchard parking with cool breeze & water",
  },
  {
    id: "node_esp32_16",
    name: "Sathuvachari Expressway Transit",
    host: "Ramesh Babu Express Laundry",
    place: "Near Collectorate Office, Sathuvachari",
    power: "3.3 kW",
    rate: 10.00,
    baseRate: 10.00,
    gridAvailability: "NORMAL",
    powerSource: "GRID",
    tariffReason: "District HQ Stable Municipal Feeder",
    status: "Available",
    initials: "SE",
    color: "blue",
    latitude: 12.9380,
    longitude: 79.1650,
    coords: { x: 52, y: 45 },
    hardwareNote: "Convenient urban node near govt offices & commercial banks",
  },
  {
    id: "node_esp32_17",
    name: "VIT Lake Back-Gate Eco-Tap",
    host: "Student Tech Innovators Co-op",
    place: "Behind VIT Lake, Kangeyanallur Road",
    power: "3.3 kW",
    rate: 6.40,
    baseRate: 8.00,
    gridAvailability: "SURPLUS",
    powerSource: "SOLAR",
    tariffReason: "Campus Micro-Grid Student Research Subsidy (-20%)",
    status: "Available",
    initials: "VL",
    color: "emerald",
    latitude: 12.9730,
    longitude: 79.1620,
    coords: { x: 51, y: 34 },
    hardwareNote: "IoT PZEM telemetry node with experimental solar tracker",
  },
  {
    id: "node_esp32_18",
    name: "Vellore Old Town Bazaar Point",
    host: "Mustafa Merchant Union",
    place: "Main Bazaar Road, Near Long Bazaar",
    power: "3.3 kW",
    rate: 16.88,
    baseRate: 12.50,
    gridAvailability: "STRAINED",
    powerSource: "GRID",
    tariffReason: "Dense Market Evening Peak Congestion (+35%)",
    status: "Available",
    initials: "VO",
    color: "peach",
    latitude: 12.9150,
    longitude: 79.1300,
    coords: { x: 45, y: 56 },
    hardwareNote: "Heavy traffic commercial corridor with delivery 3W bay",
  },
  {
    id: "node_esp32_19",
    name: "Otteri Lake Nature Park Relay",
    host: "Green Valley Eco Resort",
    place: "Otteri Circular Road, Southern Foothills",
    power: "7.2 kW",
    rate: 10.00,
    baseRate: 10.00,
    gridAvailability: "NORMAL",
    powerSource: "HYBRID",
    tariffReason: "Stable Green Buffer Zone Baseline",
    status: "Available",
    initials: "OL",
    color: "mint",
    latitude: 12.8870,
    longitude: 79.1240,
    coords: { x: 44, y: 72 },
    hardwareNote: "Dual fast AC charging bay surrounded by nature walking trail",
  },
  {
    id: "node_esp32_20",
    name: "Arakkonam Rail Hub Inter-Connect",
    host: "Murthy Transport Logistics",
    place: "Station Road, Arakkonam Junction Feeder",
    power: "7.4 kW",
    rate: 13.20,
    baseRate: 11.00,
    gridAvailability: "BATTERY",
    powerSource: "BATTERY_BACKUP",
    tariffReason: "Railway Substation Battery Inverter Bank (+20%)",
    status: "Available",
    initials: "AR",
    color: "blue",
    latitude: 13.0800,
    longitude: 79.6700,
    coords: { x: 96, y: 12 },
    hardwareNote: "High-capacity railway interchange buffer for 2W/3W fleets",
  },
];

export default function Home() {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [navStation, setNavStation] = useState<NavStation | null>(null);
  const [driverBalance, setDriverBalance] = useState<number>(500.0);
  const [driverCoords, setDriverCoords] = useState<Coordinates>(DEFAULT_DRIVER_COORDS);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locateStatus, setLocateStatus] = useState<string>("Katpadi / Vellore Core (GPS Active)");

  // View Mode: Cards Grid vs Interactive Mesh Radar
  const [viewMode, setViewMode] = useState<"GRID" | "RADAR">("GRID");

  // Filtering & Search States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"ALL" | "SURPLUS" | "CHEAP" | "FAST" | "NEAREST">("ALL");

  // Modals
  const [isTopupOpen, setIsTopupOpen] = useState<boolean>(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchDriverBalance();
    fetchLiveNodes();
  }, []);

  const fetchDriverBalance = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/user/me");
      if (res.ok) {
        const data = await res.json();
        setDriverBalance(data.wallet_balance);
      }
    } catch {
      // Backend offline fallback
    }
  };

  const fetchLiveNodes = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/nodes");
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const merged: Station[] = data.map((n: any) => {
            const preset = initialStations.find((s) => s.id === n.id) || initialStations[0];
            const effectiveRate = n.effective_rate_per_kwh ?? n.rate_per_kwh ?? preset.rate;
            const baseRate = n.base_rate_per_kwh ?? preset.baseRate ?? preset.rate;
            const gridAvail = (n.grid_availability || preset.gridAvailability || "NORMAL").toUpperCase();
            const tariffReason = n.tariff_reason || preset.tariffReason || "Standard Grid Availability";
            return {
              id: n.id,
              name: n.name,
              host: n.host_name,
              place: n.location,
              power: `${n.max_power_kw || 3.3} kW`,
              rate: effectiveRate,
              baseRate: baseRate,
              gridAvailability: gridAvail,
              powerSource: n.power_source || preset.powerSource || "GRID",
              tariffReason: tariffReason,
              status: n.is_active ? "Available" : "Charging",
              initials: n.name
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              color: preset.color,
              latitude: n.latitude || preset.latitude,
              longitude: n.longitude || preset.longitude,
              coords: preset.coords,
              hardwareNote: n.hardware_note || preset.hardwareNote,
            };
          });
          setStations(merged);
        }
      }
    } catch {
      // Keep initial stations
    }
  };

  // Live Grid Simulation Sandbox Handler
  const handleSimulateGridState = (simState: "SURPLUS" | "STRAINED" | "BATTERY" | "NORMAL") => {
    setStations((prev) =>
      prev.map((st) => {
        let multiplier = 1.0;
        let reason = "Standard Municipal Grid Baseline";
        let gridAvail = simState;

        if (simState === "SURPLUS") {
          multiplier = 0.8;
          reason = "☀️ Live Solar Surplus Generation (-20% Discount)";
        } else if (simState === "STRAINED") {
          multiplier = 1.35;
          reason = "⚡ Grid Feeder Peak Strain Surge (+35%)";
        } else if (simState === "BATTERY") {
          multiplier = 1.2;
          reason = "🔋 High-Capacity Inverter Storage Backup (+20%)";
        } else {
          multiplier = 1.0;
          reason = "Standard Grid Normal Availability";
        }

        const base = st.baseRate || st.rate;
        const effectiveRate = Math.round(base * multiplier * 100) / 100;
        return {
          ...st,
          rate: effectiveRate,
          gridAvailability: gridAvail,
          tariffReason: reason,
        };
      })
    );
  };

  // Driver GPS Geolocation
  const handleLocateMe = () => {
    soundFx.playCyberClick();
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setDriverCoords(coords);
          setLocateStatus(`GPS Locked (${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E)`);
          setIsLocating(false);
          setFilterType("NEAREST");
          soundFx.playPowerPulse();
        },
        (err) => {
          console.warn("GPS error:", err.message);
          setLocateStatus("Katpadi / Vellore Core (Default Corridor)");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocateStatus("Geolocation not supported");
    }
  };

  // Filtered & Sorted Stations
  const displayedStations = useMemo(() => {
    let result = [...stations];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.host.toLowerCase().includes(q) ||
          st.place.toLowerCase().includes(q) ||
          st.id.toLowerCase().includes(q)
      );
    }

    // Filter Chips
    if (filterType === "SURPLUS") {
      result = result.filter(
        (st) => (st.gridAvailability?.toUpperCase() === "SURPLUS") || st.rate < 10.0
      );
    } else if (filterType === "CHEAP") {
      result = result.filter((st) => st.rate <= 10.0);
    } else if (filterType === "FAST") {
      result = result.filter((st) => parseFloat(st.power) >= 3.3);
    } else if (filterType === "NEAREST") {
      result.sort((a, b) => {
        const distA = calculateDistanceKm(driverCoords, { latitude: a.latitude, longitude: a.longitude });
        const distB = calculateDistanceKm(driverCoords, { latitude: b.latitude, longitude: b.longitude });
        return distA - distB;
      });
    }

    return result;
  }, [stations, searchQuery, filterType, driverCoords]);

  const openStationDrawer = (station: Station) => {
    setSelectedStation(station);
  };

  const closeStationDrawer = () => {
    setSelectedStation(null);
    fetchDriverBalance();
  };

  const openRouteModal = (station: Station, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNavStation(station);
    setIsNavModalOpen(true);
  };

  return (
    <div className="matrix-ambient-bg w-full min-h-screen text-slate-100 pb-20 relative">
      {/* Topup & Navigation Modals */}
      <DriverWalletTopupModal
        currentBalance={driverBalance}
        isOpen={isTopupOpen}
        onClose={() => setIsTopupOpen(false)}
        onBalanceUpdated={(newBal) => {
          setDriverBalance(newBal);
          soundFx.playEscrowSuccess();
          triggerCyberParticles();
        }}
      />

      <RouteNavigationModal
        station={navStation}
        driverCoords={driverCoords}
        isOpen={isNavModalOpen}
        onClose={() => setIsNavModalOpen(false)}
        onStartCharging={(st) => {
          const found = stations.find((s) => s.id === st.id);
          if (found) openStationDrawer(found);
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Continuous Cyber Ticker & Interactive Simulation Sandbox */}
        <CyberTelemetryBar
          onSimulateState={handleSimulateGridState}
          activeFilter={filterType}
        />

        {/* Top Header / Driver Status Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-emerald-400">
                P2P Offline Mesh • Real-Time Dynamic Grid Pricing
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
              <span>Vellore EV Mesh Network</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                20 NODES
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Decentralized peer-to-peer charging with cryptographic escrow over Web Bluetooth in cellular dead zones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold shadow-md transition cursor-pointer active:scale-95"
            >
              <span>📍</span>
              <span>{isLocating ? "Acquiring GPS..." : locateStatus}</span>
            </button>
            <Link
              href="/map"
              onClick={() => soundFx.playCyberClick()}
              className="btn-shimmer flex items-center gap-1.5 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/25 transition cursor-pointer"
            >
              <span>🗺️ Full Hex Map</span>
              <span>↗</span>
            </Link>
          </div>
        </div>

        {/* Driver Wallet & Mesh Quick Stats Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
          {/* Driver Wallet Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900/90 via-slate-850/90 to-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between backdrop-blur-2xl">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-400">
                  DRIVER PRE-FUNDED ESCROW WALLET
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">₹{driverBalance.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 font-mono">INR Available</span>
                </div>
                <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                    AR
                  </span>
                  <span>Anaya Rao (EV Driver • user_88)</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-semibold">✓ Cryptographic Escrow Active</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  soundFx.playCyberClick();
                  triggerCyberParticles(e.clientX, e.clientY, "emerald");
                  setIsTopupOpen(true);
                }}
                className="btn-shimmer text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/25 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span className="text-sm">+</span>
                <span>Top Up Wallet</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs relative z-10">
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Verified Stations</span>
                <span className="font-black text-white text-base">20 Nodes</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Dynamic Tariff Span</span>
                <span className="font-black text-emerald-400 text-base">₹6.40 - ₹17.55</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-mono">Macro Hex Clusters</span>
                <span className="font-black text-cyan-400 text-base">3 Sectors (Tier 1)</span>
              </div>
            </div>
          </div>

          {/* Quick Connect / Mesh Radar Portal Card */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-2">
                <span>INTERACTIVE RADAR</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] border border-cyan-500/30">
                  REAL-TIME MESH
                </span>
              </div>
              <h3 className="text-base font-black text-white mb-1.5">
                Full Corridor Spatial Discovery
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Leaflet map indexing Katpadi, VIT, Sripuram, Fort, Ranipet, Ambur, Sholinghur, Walajah, and Arakkonam.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2.5 relative z-10">
              <button
                onClick={() => {
                  soundFx.playPowerPulse();
                  setViewMode(viewMode === "GRID" ? "RADAR" : "GRID");
                }}
                className="w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{viewMode === "GRID" ? "📡 Switch to Mesh Radar" : "🎴 Switch to Cards Grid"}</span>
              </button>
              <button
                onClick={() => {
                  soundFx.playChargeHum();
                  openStationDrawer(stations[0]);
                }}
                className="w-full text-center bg-slate-950/80 hover:bg-slate-950 text-emerald-400 font-bold text-xs py-2 rounded-xl border border-emerald-500/30 transition cursor-pointer"
              >
                ⚡ Start BLE Charge at VIT Relay
              </button>
            </div>
          </div>
        </div>

        {/* Station Search & Filter Toolbar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search 20 stations (VIT, Katpadi, Sripuram, Arcot, Ambur, Vaniyambadi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Filter Chips + View Switcher */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {[
              { id: "ALL", label: `All (${stations.length})` },
              { id: "SURPLUS", label: "🟢 Surplus Solar (<₹10)" },
              { id: "CHEAP", label: "Under ₹10 🏷️" },
              { id: "FAST", label: "Fast (3.3+ kW) ⚡" },
              { id: "NEAREST", label: "Nearest First 📍" },
            ].map((f) => {
              const isActive = filterType === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    soundFx.playCyberClick();
                    setFilterType(f.id as any);
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 scale-105"
                      : "bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}

            {/* View Mode Toggle Button */}
            <button
              onClick={() => {
                soundFx.playPowerPulse();
                setViewMode(viewMode === "GRID" ? "RADAR" : "GRID");
              }}
              className="ml-auto text-xs px-3.5 py-1.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{viewMode === "GRID" ? "📡 Radar View" : "🎴 Cards Grid"}</span>
            </button>
          </div>
        </div>

        {/* Main Feed Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Verified Charging Stations</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-mono">
                {displayedStations.length} available
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live power tariffs adjust dynamically based on solar generation, battery backup, and grid load.
            </p>
          </div>
        </div>

        {/* View Mode 1: Interactive Mesh Radar */}
        {viewMode === "RADAR" && (
          <div className="mb-8 animate-fade-in">
            <MeshRadarVisualizer
              stations={displayedStations}
              onSelectStation={(st) => openStationDrawer(st)}
              onNavigateStation={(st) => openRouteModal(st)}
            />
          </div>
        )}

        {/* View Mode 2: Interactive Station 3D Cards Grid */}
        {viewMode === "GRID" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {displayedStations.map((st) => {
              const distanceKm = calculateDistanceKm(driverCoords, {
                latitude: st.latitude,
                longitude: st.longitude,
              });

              return (
                <InteractiveStationCard
                  key={st.id}
                  station={st}
                  distanceKm={distanceKm}
                  onCharge={openStationDrawer}
                  onNavigate={openRouteModal}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-out Charging Drawer Overlay */}
      {selectedStation && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex justify-end animate-fade-in"
          onClick={closeStationDrawer}
        >
          <div
            className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto flex flex-col shadow-2xl animate-slide-in backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {selectedStation.id}
                </span>
                <h2 className="text-xl font-black text-white mt-2">{selectedStation.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hosted by {selectedStation.host} • 📍 {selectedStation.place}
                </p>
              </div>
              <button
                onClick={() => {
                  soundFx.playCyberClick();
                  closeStationDrawer();
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Embedded Charging Session Manager */}
            <ChargingSessionManager
              initialNodeId={selectedStation.id}
              initialNodeName={selectedStation.name}
              ratePerKwh={selectedStation.rate}
              onClose={closeStationDrawer}
              onBalanceUpdated={(newBal) => {
                setDriverBalance(newBal);
                soundFx.playEscrowSuccess();
                triggerCyberParticles();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
