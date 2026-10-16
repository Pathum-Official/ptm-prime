"use client";
import { API_URL } from './config';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, KeyRound, Mail, ArrowRight, Zap, Target, Lock, 
  ChevronRight, CheckCircle2, MessageCircle, Phone, Sparkles, 
  Crown, Eye, Globe, ExternalLink, HelpCircle, Check, Shield, Award
} from "lucide-react";
import { Logo } from "@/components/Logo";

interface PricingPlan {
  id: "monthly" | "annual" | "lifetime";
  name: string;
  badge?: string;
  isPopular?: boolean;
  tagline: string;
  priceUSD: number;
  priceLKR: number;
  periodTextUSD: string;
  periodTextLKR: string;
  subtextUSD?: string;
  subtextLKR?: string;
  features: string[];
  ctaText: string;
}

export default function Home() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [flowState, setFlowState] = useState<"login" | "forgot" | "reset">("login");

  // Currency selection: USD ($) or LKR (Rs.)
  const [currency, setCurrency] = useState<"USD" | "LKR">("USD");
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PricingPlan | null>(null);

  const plans: PricingPlan[] = [
    {
      id: "monthly",
      name: "Monthly Plan",
      badge: "FLEXIBLE COMMITMENT",
      tagline: "Pay-as-you-go algorithmic execution. Full terminal capabilities with flexible monthly renewals.",
      priceUSD: 49,
      priceLKR: 15500,
      periodTextUSD: "/ month",
      periodTextLKR: "/ month",
      subtextUSD: "Cancel or modify anytime",
      subtextLKR: "Cancel or modify anytime",
      ctaText: "Activate Monthly Plan",
      features: [
        "Full Terminal Access for 1 Deriv Account",
        "All 8 Proprietary Quantitative Strategy Cores",
        "Multi-Tick Matrix Engine (1 to 10 Ticks)",
        "Autonomous Neural AI Market Regime Detection",
        "Masaniello Capital Vault & Stop-Loss Shield",
        "Automated Daily Profit Locking",
        "Telegram Bot Alerts & Mobile Remote Controls",
        "Standard Operations Desk Support"
      ]
    },
    {
      id: "annual",
      name: "Annual Plan",
      badge: "MOST POPULAR • SAVE 40%",
      isPopular: true,
      tagline: "Our most requested institutional tier. A complete year of continuous automated profits with 40% discount.",
      priceUSD: 29,
      priceLKR: 9200,
      periodTextUSD: "/ month (billed $348 / yr)",
      periodTextLKR: "/ month (billed Rs. 110,000 / yr)",
      subtextUSD: "Save $240 per year compared to monthly billing",
      subtextLKR: "Save over Rs. 75,000 per year compared to monthly",
      ctaText: "Activate Annual Plan",
      features: [
        "Includes Everything in Monthly Plan",
        "Full 12-Month Continuous Algorithm Execution",
        "2 Months Free Platform Access Included",
        "Priority High-Frequency Execution Queue (<15ms)",
        "Advanced Masaniello Multi-Tier Circuit Breakers",
        "Instant Telegram Remote Bot Automation",
        "Priority 24/7 Dedicated Concierge Support",
        "Free 1-on-1 Account Calibration Session"
      ]
    },
    {
      id: "lifetime",
      name: "Lifetime Plan",
      badge: "VIP FOUNDER PASS • ZERO RECURRING FEES",
      tagline: "Permanent, unconditional terminal ownership. Pay once and never worry about subscriptions again.",
      priceUSD: 199,
      priceLKR: 62000,
      periodTextUSD: "one-time payment",
      periodTextLKR: "one-time payment",
      subtextUSD: "Lifetime license • Zero renewal fees forever",
      subtextLKR: "Lifetime license • Zero renewal fees forever",
      ctaText: "Claim Lifetime License",
      features: [
        "Permanent Terminal License — Never Pay Renewals",
        "Unrestricted Access to All Algorithmic Features",
        "All Future Quantitative Models & Upgrades Free",
        "Private VIP Alpha Research & Quant Signal Desk",
        "Direct 1-on-1 Founder & Engineering Concierge",
        "Personalized Risk Management Consultation",
        "VIP Access to Quantitative Beta Releases",
        "Priority Emergency Trade Interception Service"
      ]
    }
  ];

  const handleOpenLiveChatForPlan = (plan: PricingPlan) => {
    const formattedPrice = currency === "USD" 
      ? `$${plan.priceUSD} ${plan.periodTextUSD}` 
      : `Rs. ${plan.priceLKR.toLocaleString()} ${plan.periodTextLKR}`;

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open_ptm_live_chat", {
        detail: {
          initialMsg: `Hello PTM Prime Team. I would like to subscribe to the ${plan.name} (${formattedPrice}). Please provide activation and payment details.`
        }
      }));
    }
    setSelectedPlanForModal(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST", 
        headers: { "ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user && data.user.is_admin !== undefined) {
          window.location.href = data.user.is_admin ? "/admin" : "/dashboard";
        } else {
          window.location.href = data.is_admin ? "/admin" : "/dashboard";
        }
      } else { setError(data.detail || "Invalid credentials."); }
    } catch (err) { setError("Cannot reach backend server."); } 
    finally { setIsLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(""); setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setMessage("OTP sent to your Telegram!");
        setFlowState("reset");
      } else { setError("Failed to send OTP."); }
    } catch (err) { setError("Server error."); }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(""); setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword })
      });
      if (res.ok) {
        setMessage("Password updated successfully! Please login.");
        setFlowState("login");
        setPassword("");
      } else { setError("Invalid OTP."); }
    } catch (err) { setError("Server error."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-slate-100 font-sans selection:bg-[#D4AF37]/30 overflow-x-hidden relative">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/12 via-[#07070A]/80 to-transparent pointer-events-none blur-2xl" />
      
      {/* Navigation */}
      <nav className="border-b border-white/[0.08] bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"><Logo /></div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-serif tracking-[0.25em] text-white uppercase">PTM PRIME</span>
              <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-mono -mt-1 font-semibold">Quantitative Systems</span>
            </div>
          </div>
          
          <div className="flex gap-7 items-center text-xs font-bold tracking-widest uppercase">
            <a href="#features" className="hidden md:block text-slate-400 hover:text-white transition-colors">Technology</a>
            <a href="#pricing" className="hidden md:block text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#support" className="hidden sm:block text-slate-400 hover:text-white transition-colors">Support Desk</a>
            <button 
              onClick={() => setShowLogin(true)} 
              className="px-6 py-2.5 border border-[#D4AF37]/60 text-[#FFD700] rounded-full hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all font-semibold"
            >
              Client Terminal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] text-[#D4AF37] text-[11px] font-mono font-semibold uppercase tracking-[0.2em] mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          PTM Engine v2.0 • Ultra Low Latency Execution
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold text-white mb-6 leading-[1.12] tracking-tight">
          Algorithmic Supremacy for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#D4AF37]">
            Synthetic Volatility Indices
          </span>
        </h1>
        
        <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-10 tracking-wide font-light leading-relaxed">
          PTM Prime combines real-time multi-harmonic momentum alignment, statistical volatility envelopes, and autonomous neural regime switching into an institutional-grade execution platform on Deriv.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="#pricing" 
            className="bg-gradient-to-r from-[#D4AF37] to-[#F1D16B] text-black font-bold py-4 px-9 rounded-full flex items-center gap-2.5 hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] hover:scale-105 transition-all uppercase tracking-widest text-xs cursor-pointer shadow-lg font-sans"
          >
            <span>Explore Plans & Pricing</span>
            <ChevronRight className="w-4 h-4" />
          </a>
          <a 
            href="https://wa.me/94773535384?text=Hello%20PTM%20Prime!%20I%20am%20interested%20in%20the%20Trading%20Bot." 
            target="_blank" 
            className="border border-white/15 bg-white/[0.04] text-white hover:border-[#D4AF37]/60 hover:text-[#FFD700] font-bold py-4 px-8 rounded-full flex items-center gap-2.5 transition-all uppercase tracking-widest text-xs backdrop-blur-md"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Operations</span>
          </a>
          <a 
            href="https://t.me/PTM_PRIME_bot" 
            target="_blank" 
            className="border border-white/10 text-slate-400 hover:text-white font-bold py-4 px-8 rounded-full flex items-center gap-2 transition-all uppercase tracking-widest text-xs"
          >
            <span>Telegram Channel</span>
          </a>
        </div>

        {/* Institutional Metrics Trust Bar */}
        <div className="mt-16 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#0E0E14]/80 border border-white/[0.08] backdrop-blur-md shadow-2xl">
          <div className="p-3 text-center border-r border-white/[0.06]">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#FFD700]">94.8%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Confluence Win Edge</div>
          </div>
          <div className="p-3 text-center border-r border-white/[0.06]">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">&lt; 15ms</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Zero-Latency Execution</div>
          </div>
          <div className="p-3 text-center border-r border-white/[0.06]">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white">100%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Capital Vault Lock</div>
          </div>
          <div className="p-3 text-center flex flex-col justify-center items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400">184 Live</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Active Quant Traders</div>
          </div>
        </div>

        {/* Platform Terminal Mockup */}
        <div className="mt-14 rounded-3xl border border-white/[0.1] p-2 bg-[#0C0C12]/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#07070A] z-10 opacity-70 pointer-events-none" />
          <div className="aspect-[16/9] md:aspect-[21/9] bg-[#050508] rounded-2xl border border-white/5 relative overflow-hidden flex flex-col">
             <div className="h-10 border-b border-white/[0.06] flex items-center justify-between px-5 bg-black/40">
               <div className="flex gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
               </div>
               <div className="text-[10px] text-[#C5A059] font-mono tracking-widest uppercase">
                 PTM PRIME QUANTUM LAB • 64 PAIRS SIMULTANEOUS SCAN
               </div>
               <div className="w-10" />
             </div>

             <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 border border-white/[0.08] rounded-xl bg-white/[0.02] p-4 flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                      <Crown className="w-4 h-4 text-[#FFD700]" /> Current Best Live Edge
                    </div>
                    <div className="text-sm text-[#FFD700] font-mono font-bold mt-2">Low-Vol Tactical Reversal</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">Volatility 10 (1s) Index • 5 Ticks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-extrabold text-emerald-400">78.4% Win Rate</div>
                    <div className="mt-2 w-full h-8 bg-emerald-950/40 border border-emerald-500/30 rounded-lg flex items-center justify-center text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                      AI Auto-Pilot Synchronized
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 border border-white/[0.06] rounded-xl bg-white/[0.01] p-5 relative overflow-hidden flex flex-col justify-between">
                  <svg className="absolute bottom-0 w-full h-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L 15 80 L 30 85 L 45 55 L 60 65 L 75 35 L 90 40 L 100 10" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                    <path d="M0 100 L 15 80 L 30 85 L 45 55 L 60 65 L 75 35 L 90 40 L 100 10 L 100 100 Z" fill="url(#greenGradient)" />
                    <defs>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="100">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="flex justify-between items-start relative z-10 text-left">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Automated Real-Time Session PnL</div>
                      <div className="text-3xl sm:text-4xl font-mono font-extrabold text-[#22c55e] mt-1">+ $348.50</div>
                    </div>
                    <div className="bg-black/60 border border-white/[0.08] px-3.5 py-1.5 rounded-xl text-right">
                      <div className="text-[9px] uppercase tracking-widest text-[#C5A059] font-mono">Masaniello Vault Status</div>
                      <div className="text-xs font-mono font-bold text-white">Daily Target Locked</div>
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-2">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">12 Wins / 1 Loss Streak</span>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/[0.04] text-slate-300 border border-white/10">Drawdown Circuit Breaker: Armed</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Technology Architecture Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">Engineering Precision</h2>
          <p className="text-[#C5A059] uppercase tracking-widest text-xs font-semibold">Architected specifically for quantitative synthetic execution</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#0C0C12] border border-white/[0.08] p-8 rounded-3xl hover:border-[#D4AF37]/50 hover:-translate-y-1.5 transition-all duration-300 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#FFD700] mb-6"><Target className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-white mb-3">Proprietary Confluence Matrix</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Eliminates subjective guesswork. The engine demands simultaneous mathematical convergence across multi-timeframe impulse vectors, dynamic volatility envelopes, and liquidity exhaustions before firing an order.</p>
          </div>
          <div className="bg-[#0C0C12] border border-white/[0.08] p-8 rounded-3xl hover:border-emerald-500/50 hover:-translate-y-1.5 transition-all duration-300 text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6"><Shield className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-white mb-3">Masaniello Capital Vault</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Deterministic ruin prevention built into the core. Pre-set your daily target profit and hard stop-loss. Once reached, the terminal automatically disconnects from the broker to lock in gains and protect your account.</p>
          </div>
          <div className="bg-[#0C0C12] border border-white/[0.08] p-8 rounded-3xl hover:border-blue-500/50 hover:-translate-y-1.5 transition-all duration-300 text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6"><Zap className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-white mb-3">Autonomous AI & Telegram Sync</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Autonomous neural auto-pilot evaluates all 64 strategy/market matrix pairs in real time, automatically shifting execution to the highest-probability edge. Receive real-time mobile alerts and emergency stop commands via Telegram.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section (Choose Your Plan: Monthly, Annual, Lifetime) */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/[0.08]">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] text-[#D4AF37] text-[10px] font-mono font-bold uppercase tracking-widest mb-4 border border-white/10">
            TRANSPARENT LICENSING • ZERO HIDDEN FEES
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white mb-4">Choose Your Plan</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base font-light">
            Select the membership tier that aligns with your trading volume. All plans include full algorithmic execution access.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Display Currency:</span>
          <div className="inline-flex items-center bg-[#101016] border border-white/10 p-1 rounded-full text-xs font-mono font-bold">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                currency === "USD" 
                  ? "bg-[#D4AF37] text-black shadow-md font-extrabold" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency("LKR")}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                currency === "LKR" 
                  ? "bg-[#D4AF37] text-black shadow-md font-extrabold" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              LKR (Rs.)
            </button>
          </div>
        </div>

        {/* The Three Plans Grid: Monthly, Annual, Lifetime */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isAnnual = plan.id === "annual";
            const isLifetime = plan.id === "lifetime";
            
            const displayPrice = currency === "USD" 
              ? `$${plan.priceUSD}` 
              : `Rs. ${plan.priceLKR.toLocaleString()}`;
              
            const periodLabel = currency === "USD" ? plan.periodTextUSD : plan.periodTextLKR;
            const subtextLabel = currency === "USD" ? plan.subtextUSD : plan.subtextLKR;

            return (
              <div 
                key={plan.id}
                className={`rounded-3xl p-8 sm:p-9 flex flex-col justify-between relative transition-all duration-300 text-left ${
                  isAnnual
                    ? "bg-gradient-to-b from-[#16151E] via-[#0E0E14] to-[#08080C] border-2 border-[#D4AF37] shadow-[0_0_50px_rgba(212,175,55,0.2)] md:scale-105 z-20"
                    : isLifetime
                    ? "bg-gradient-to-b from-[#131118] to-[#0A0A0E] border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.12)]"
                    : "bg-[#0C0C12] border border-white/[0.08]"
                }`}
              >
                {/* Top Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-widest whitespace-nowrap shadow-md ${
                    isAnnual 
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#F3D372] text-black font-sans" 
                      : isLifetime
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-sans"
                      : "bg-white/10 text-slate-300 border border-white/10"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-2xl font-serif font-bold ${isAnnual ? "text-[#FFD700]" : "text-white"}`}>
                      {plan.name}
                    </h3>
                    {isLifetime && <Crown className="w-5 h-5 text-amber-400" />}
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed mb-6 min-h-[36px]">
                    {plan.tagline}
                  </p>

                  {/* Price Block */}
                  <div className="mb-6 pb-6 border-b border-white/[0.06]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-tight">
                        {displayPrice}
                      </span>
                    </div>
                    <div className="text-xs text-[#C5A059] font-mono mt-1 font-semibold">
                      {periodLabel}
                    </div>
                    {subtextLabel && (
                      <div className="text-[11px] text-emerald-400 font-mono mt-2 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{subtextLabel}</span>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="flex flex-col gap-3.5 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300 text-xs sm:text-sm leading-snug">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isAnnual ? "text-[#FFD700]" : "text-emerald-400"
                        }`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA */}
                <div className="mt-4 flex flex-col gap-2.5">
                  <button 
                    onClick={() => setSelectedPlanForModal(plan)}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all ${
                      isAnnual
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-[1.02]"
                        : "bg-white/[0.08] hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/40 text-[#FFD700]"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleOpenLiveChatForPlan(plan)}
                    className="text-[11px] text-slate-400 hover:text-[#FFD700] font-mono text-center transition-colors cursor-pointer pt-1"
                  >
                    Inquire via Live Chat Concierge →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Institutional Settlement Methods Bar */}
        <div className="mt-16 p-6 rounded-2xl bg-[#0C0C12] border border-white/[0.08] max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FFD700]" />
              <span>Multi-Currency Settlement Channels</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1 font-light">
              Wire Transfer (Commercial Bank, Sampath, BOC, HNB) • Binance Pay USDT (TRC-20 / BEP-20) • Deriv DP2P Escrow
            </p>
          </div>
          <button 
            onClick={() => handleOpenLiveChatForPlan(plans[1])}
            className="px-5 py-2.5 rounded-full bg-white/[0.05] hover:bg-[#D4AF37]/20 border border-white/15 hover:border-[#D4AF37]/50 text-white hover:text-[#FFD700] text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            Payment Inquiries
          </button>
        </div>
      </section>

      {/* Support & Concierge Desk Section */}
      <section id="support" className="py-20 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/[0.08]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">Institutional Operations Desk</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-light">
            Connect directly with system engineers and client specialists for terminal calibration, activation, and support.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* WhatsApp Channel */}
          <a 
            href="https://wa.me/94773535384?text=Hello%20PTM%20Prime!%20I%20need%20assistance%20with%20terminal%20activation." 
            target="_blank" 
            className="p-6 rounded-2xl bg-[#0C0C12] border border-white/[0.08] hover:border-emerald-500/50 transition-all group flex flex-col items-center text-center shadow-lg hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-sm mb-1">WhatsApp Operations Desk</h4>
            <p className="text-emerald-400 font-mono text-xs font-bold mb-2">+94 77 353 5384</p>
            <span className="text-[11px] text-slate-500">Instant Priority Response (24/7)</span>
          </a>

          {/* Telegram Channel */}
          <a 
            href="https://t.me/PTM_PRIME_bot" 
            target="_blank" 
            className="p-6 rounded-2xl bg-[#0C0C12] border border-white/[0.08] hover:border-blue-500/50 transition-all group flex flex-col items-center text-center shadow-lg hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-sm mb-1">Telegram VIP Bot & Feed</h4>
            <p className="text-blue-400 font-mono text-xs font-bold mb-2">@PTM_PRIME_bot</p>
            <span className="text-[11px] text-slate-500">Live Trade Sync & Mobile Controls</span>
          </a>

          {/* Email Support */}
          <a 
            href="mailto:info.ptmprime@gmail.com" 
            className="p-6 rounded-2xl bg-[#0C0C12] border border-white/[0.08] hover:border-[#D4AF37]/50 transition-all group flex flex-col items-center text-center shadow-lg hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#FFD700] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-sm mb-1">Client Relations Desk</h4>
            <p className="text-[#FFD700] font-mono text-xs font-bold mb-2">info.ptmprime@gmail.com</p>
            <span className="text-[11px] text-slate-500">Corporate & Institutional Inquiries</span>
          </a>

          {/* In-Site Live Chat */}
          <button 
            onClick={() => handleOpenLiveChatForPlan(plans[1])}
            className="p-6 rounded-2xl bg-[#0C0C12] border border-white/[0.08] hover:border-yellow-500/50 transition-all group flex flex-col items-center text-center shadow-lg hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-sm mb-1">Live Chat Concierge</h4>
            <p className="text-yellow-400 font-mono text-xs font-bold mb-2">Instant Ticket Support</p>
            <span className="text-[11px] text-slate-500">Direct In-App Specialist Assistance</span>
          </button>
        </div>
      </section>

      {/* Footer Area with Verified Page Views Counter Badge */}
      <footer className="border-t border-white/[0.08] bg-[#050508] py-14 px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-10 h-10 mb-3 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]"><Logo/></div>
          <span className="text-base font-serif font-bold text-white tracking-[0.2em] uppercase mb-1">PTM PRIME QUANTUM SYSTEMS</span>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-mono font-semibold mb-4">Autonomous Algorithmic Trading Systems</p>
          
          {/* Verified Hits.sh Counter Badge */}
          <div className="my-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-xs text-slate-300 font-mono shadow-inner">
              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-slate-400">Total Platform Traffic:</span>
              <img 
                src="https://hits.sh/ptm-prime-tradings.vercel.app.svg?style=for-the-badge&label=Views&color=D4AF37&labelColor=121218" 
                alt="Total Page Views Counter" 
                className="h-5 rounded inline-block"
              />
            </div>
          </div>

          <p className="text-slate-500 text-[11px] max-w-2xl mx-auto leading-relaxed mt-2 font-light">
            Trading synthetic volatility indices on Deriv carries capital risk. Algorithmic execution and quantitative models do not guarantee future returns. Capital preservation relies on strict adherence to the Masaniello vault protocol.
          </p>
          <div className="text-slate-600 text-[10px] uppercase tracking-widest font-mono mt-6">
            © 2026 PTM Prime Group. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Plan Activation & Payment Concierge Modal */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setSelectedPlanForModal(null)} />
          <div className="w-full max-w-lg bg-[#0E0E14] border-2 border-[#D4AF37] p-8 sm:p-10 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.3)] relative z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto text-left">
            <button 
              onClick={() => setSelectedPlanForModal(null)} 
              className="absolute top-4 right-6 text-slate-400 hover:text-white font-bold text-2xl cursor-pointer"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38728] text-black">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-mono font-bold">Selected Terminal License</span>
                <h3 className="text-2xl font-serif font-extrabold text-white">{selectedPlanForModal.name}</h3>
              </div>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">License Fee</div>
                <div className="text-2xl font-mono font-extrabold text-[#FFD700]">
                  {currency === "USD" ? `$${selectedPlanForModal.priceUSD}` : `Rs. ${selectedPlanForModal.priceLKR.toLocaleString()}`}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs px-3 py-1 rounded-full bg-white/[0.05] text-[#FFD700] border border-[#D4AF37]/30 uppercase font-mono font-bold">
                  {selectedPlanForModal.name}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-light">
              To instantly activate your terminal license, contact our operations desk via WhatsApp, Telegram, or in-site Live Chat below:
            </p>

            {/* Direct Activation Actions */}
            <div className="flex flex-col gap-3">
              {/* WhatsApp Instant Activation */}
              <a 
                href={`https://wa.me/94773535384?text=${encodeURIComponent(
                  `Hello PTM Prime Team. I would like to activate the ${selectedPlanForModal.name} (${currency === "USD" ? `$${selectedPlanForModal.priceUSD}` : `Rs. ${selectedPlanForModal.priceLKR.toLocaleString()}`}). Please provide payment settlement details.`
                )}`}
                target="_blank"
                className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,211,102,0.4)] cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-black" />
                <span>Instant Activation via WhatsApp Desk</span>
              </a>

              {/* In-Site Live Chat Activation */}
              <button
                onClick={() => handleOpenLiveChatForPlan(selectedPlanForModal)}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open In-Site Live Chat Concierge</span>
              </button>

              {/* Telegram VIP Channel Activation */}
              <a 
                href="https://t.me/PTM_PRIME_bot" 
                target="_blank"
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Connect via Telegram VIP Desk</span>
              </a>
            </div>

            {/* Supported Channels in Modal */}
            <div className="mt-6 pt-5 border-t border-white/10 text-left">
              <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-2 font-mono">Accepted Settlement Channels:</span>
              <ul className="text-[11px] text-slate-300 space-y-1.5 font-mono">
                <li>• Bank Wire / Transfer (Commercial, Sampath, BOC, HNB)</li>
                <li>• Binance Pay USDT (TRC-20 / BEP-20)</li>
                <li>• Deriv DP2P Escrow Direct Transfer</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowLogin(false)} />
          <div className="w-full max-w-md bg-[#0E0E14] border border-[#D4AF37]/30 p-10 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.2)] relative z-10 animate-in fade-in zoom-in-95 duration-200 text-left">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-6 text-slate-500 hover:text-white font-bold text-xl cursor-pointer">&times;</button>
            <div className="flex flex-col items-center mb-8 text-center">
              <h2 className="text-2xl font-serif font-bold tracking-[0.1em] text-white">Client Terminal</h2>
              <p className="text-xs text-[#C5A059] uppercase tracking-widest mt-1 font-mono">Authorized Operators Only</p>
            </div>
            
            {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm font-semibold"><ShieldAlert className="w-5 h-5 flex-shrink-0" /> {error}</div>}
            {message && <div className="mb-6 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl flex items-center gap-3 text-[#FFD700] text-sm font-semibold"><KeyRound className="w-5 h-5 flex-shrink-0" /> {message}</div>}

            {flowState === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <input type="email" placeholder="Operator Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-all font-medium text-sm" />
                <input type="password" placeholder="Terminal Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-all font-medium text-sm" />
                <button type="submit" disabled={isLoading} className="mt-2 w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all uppercase tracking-widest text-xs cursor-pointer">
                  {isLoading ? "Authenticating..." : "Access Terminal"} <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => {setFlowState("forgot"); setError(""); setMessage("");}} className="text-slate-400 hover:text-[#FFD700] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer">Forgot Password?</button>
                </div>
              </form>
            )}

            {flowState === "forgot" && (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                <p className="text-slate-400 text-sm text-center mb-2 font-medium">Enter your registered email to receive an authorization OTP via Telegram.</p>
                <input type="email" placeholder="Registered Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] text-sm" />
                <button type="submit" disabled={isLoading} className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/50 text-[#FFD700] font-bold py-4 rounded-xl hover:bg-[#D4AF37]/20 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" /> Request OTP Token
                </button>
                <button type="button" onClick={() => setFlowState("login")} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mt-2 transition-colors cursor-pointer text-center">Return to Login</button>
              </form>
            )}

            {flowState === "reset" && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <input type="text" placeholder="6-Digit OTP Token" value={otp} onChange={e => setOtp(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-5 text-[#FFD700] focus:outline-none focus:border-[#D4AF37] text-center font-mono tracking-[0.5em] text-2xl font-bold" maxLength={6} />
                <input type="password" placeholder="New Terminal Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-[#D4AF37] font-medium text-sm" />
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all uppercase tracking-widest text-xs cursor-pointer">
                  Confirm Password Reset
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
