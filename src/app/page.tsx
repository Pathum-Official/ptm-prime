"use client";
import { API_URL } from './config';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, KeyRound, Mail, ArrowRight, Zap, Target, Lock, 
  ChevronRight, CheckCircle2, MessageCircle, Phone, Sparkles, 
  Crown, Eye, Globe, ExternalLink, HelpCircle, Check, Flame
} from "lucide-react";
import { Logo } from "@/components/Logo";

interface PlanConfig {
  id: string;
  name: string;
  badge?: string;
  isPopular?: boolean;
  description: string;
  monthlyUSD: number;
  monthlyLKR: number;
  annualMonthlyUSD: number;
  annualMonthlyLKR: number;
  annualTotalUSD: number;
  annualTotalLKR: number;
  lifetimeUSD: number;
  lifetimeLKR: number;
  features: string[];
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

  // Pricing State
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual" | "lifetime">("annual");
  const [currency, setCurrency] = useState<"USD" | "LKR">("LKR");
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<any | null>(null);

  // Sri Lanka Rupee Conversion Rate reference (Approx 315 LKR / USD)
  const USD_TO_LKR = 315;

  const plans: PlanConfig[] = [
    {
      id: "starter",
      name: "Starter Trader",
      badge: "BEGINNER FRIENDLY",
      description: "Ideal for retail traders testing algorithmic precision on Deriv synthetic indices.",
      monthlyUSD: 29,
      monthlyLKR: 8900,
      annualMonthlyUSD: 19,
      annualMonthlyLKR: 5900,
      annualTotalUSD: 228,
      annualTotalLKR: 69900,
      lifetimeUSD: 149,
      lifetimeLKR: 45000,
      features: [
        "1 Active Deriv Real or Demo Account",
        "Tactical Reversal Core Strategy (Mean Reversion)",
        "Elastic Snapback Scalp Engine",
        "Masaniello MM Vault Capital Protection",
        "Daily Target Profit & Stop Loss Auto-Lock",
        "Standard Speed Signal Execution (<30ms)",
        "Standard Email & Ticket Support"
      ]
    },
    {
      id: "elite",
      name: "Elite Pro",
      badge: "👑 MOST POPULAR • MAXIMUM ROI",
      isPopular: true,
      description: "Our flagship institutional setup. Autonomous AI Auto-Pilot with simultaneous multi-tick scanning.",
      monthlyUSD: 49,
      monthlyLKR: 15500,
      annualMonthlyUSD: 32,
      annualMonthlyLKR: 9900,
      annualTotalUSD: 384,
      annualTotalLKR: 119000,
      lifetimeUSD: 199,
      lifetimeLKR: 59900,
      features: [
        "All 8 Proprietary Quantitative Cores Unlocked",
        "Simultaneous Multi-Tick Matrix (1 to 10 Ticks)",
        "Autonomous PTM Neural AI Auto-Pilot Engine",
        "Real-Time Multi-Market Forward Simulation (64 Pairs)",
        "Masaniello Vault with Trailing Profit Locks",
        "Dynamic Loss Streak Circuit Breakers",
        "Instant Telegram Bot Live Trade Alerts & Remote Controls",
        "VIP 24/7 Priority Live Chat & WhatsApp Concierge"
      ]
    },
    {
      id: "lifetime",
      name: "Lifetime VIP Alpha",
      badge: "🔥 LIMITED SLOTS • ZERO SUBSCRIPTIONS",
      description: "One-time payment for permanent lifetime access. Never pay monthly or annual renewals again.",
      monthlyUSD: 0,
      monthlyLKR: 0,
      annualMonthlyUSD: 0,
      annualMonthlyLKR: 0,
      annualTotalUSD: 0,
      annualTotalLKR: 0,
      lifetimeUSD: 199,
      lifetimeLKR: 59900,
      features: [
        "Permanent Lifetime License — Zero Recurring Fees",
        "Unconditional Access to All Elite Pro Features",
        "All Future Strategy Algorithms & Quantitative Cores Included Free",
        "1-on-1 Personalized VIP Onboarding & Calibration via WhatsApp/Zoom",
        "Private VIP Alpha Signals & Trading Community Access",
        "Direct Hotline to PTM System Engineers & Founders",
        "Custom Capital Risk Optimization Consultation"
      ]
    }
  ];

  const handlePlanClick = (plan: PlanConfig) => {
    let priceText = "";
    let rawPrice = "";
    if (billingCycle === "monthly") {
      priceText = currency === "LKR" ? `රු. ${plan.monthlyLKR.toLocaleString()} / මසකට` : `$${plan.monthlyUSD} / Month`;
      rawPrice = currency === "LKR" ? `රු. ${plan.monthlyLKR.toLocaleString()}` : `$${plan.monthlyUSD}`;
    } else if (billingCycle === "annual") {
      priceText = currency === "LKR" 
        ? `රු. ${plan.annualMonthlyLKR.toLocaleString()} / මසකට (රු. ${plan.annualTotalLKR.toLocaleString()} වාර්ෂිකව)` 
        : `$${plan.annualMonthlyUSD} / Month ($${plan.annualTotalUSD} Billed Annually)`;
      rawPrice = currency === "LKR" ? `රු. ${plan.annualTotalLKR.toLocaleString()}` : `$${plan.annualTotalUSD}`;
    } else {
      priceText = currency === "LKR" ? `රු. ${plan.lifetimeLKR.toLocaleString()} (එක්වරක් පමණි)` : `$${plan.lifetimeUSD} (One-Time VIP)`;
      rawPrice = currency === "LKR" ? `රු. ${plan.lifetimeLKR.toLocaleString()}` : `$${plan.lifetimeUSD}`;
    }

    setSelectedPlanForModal({
      ...plan,
      billingCycle,
      currency,
      priceText,
      rawPrice
    });
  };

  const handleOpenLiveChatForPlan = (planName: string, billing: string, priceStr: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open_ptm_live_chat", {
        detail: {
          initialMsg: `Hi PTM Prime! I want to subscribe to the ${planName} plan (${billing} - ${priceStr}). How can I make payment (Sri Lankan Bank Transfer / Binance USDT / Deriv P2P)?`
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
    <div className="min-h-screen bg-[#0B0B0E] text-[#D4AF37] font-sans selection:bg-[#D4AF37]/30 overflow-x-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-[#0B0B0E] to-[#0B0B0E] pointer-events-none" />
      
      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-[#B38728] via-[#FBF5B7] to-[#B38728] text-black text-xs font-bold py-1.5 px-4 text-center tracking-wider flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" />
        <span>🇱🇰 ශ්‍රී ලාංකික වෙළඳුන් සඳහා විශේෂ වට්ටම් සහ Bank Transfer / Binance Pay මගින් පහසුවෙන්ම ගෙවීමේ අවස්ථාව!</span>
      </div>

      {/* Navigation */}
      <nav className="border-b border-[#D4AF37]/15 bg-[#121216]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 drop-shadow-[0_0_12px_rgba(212,175,55,0.6)]"><Logo /></div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-serif tracking-[0.2em] text-[#FFD700] uppercase">PTM PRIME</span>
              <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-mono -mt-1">Quantum AI Trading OS</span>
            </div>
          </div>
          <div className="flex gap-6 items-center text-xs sm:text-sm font-bold tracking-widest uppercase">
            <a href="#features" className="hidden md:block text-[#C5A059] hover:text-[#FFD700] transition-colors">Features</a>
            <a href="#pricing" className="hidden md:block text-[#C5A059] hover:text-[#FFD700] transition-colors">Pricing & Plans</a>
            <a href="#community" className="hidden sm:block text-[#C5A059] hover:text-[#FFD700] transition-colors">Community</a>
            <button onClick={() => setShowLogin(true)} className="px-5 py-2.5 border border-[#D4AF37] text-[#FFD700] rounded-full hover:bg-[#D4AF37]/10 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all">
              Client Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.3em] mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Engine v2.0 Live - Proprietary Quantum Confluence Tech
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold text-white mb-6 leading-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          Dominate Synthetic Markets with <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">
            Institutional Precision AI.
          </span>
        </h1>
        <p className="text-[#C5A059] text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-10 tracking-wide font-light leading-relaxed">
          PTM Prime combines real-time Multi-Harmonic Flow Alignment, Statistical Volatility Envelopes, and Autonomous Neural Auto-Pilot to deliver elite-grade trade execution on Deriv. Protect your hard-earned capital with the built-in Masaniello Money Management vault.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="#pricing" className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold py-4 px-10 rounded-full flex items-center gap-2 hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-105 transition-all uppercase tracking-widest text-sm shadow-xl cursor-pointer">
            View Arsenal Plans <ChevronRight className="w-5 h-5" />
          </a>
          <a href="https://wa.me/94773535384?text=Hello%20PTM%20Prime!%20I%20am%20interested%20in%20the%20Trading%20Bot." target="_blank" className="border border-emerald-500/50 bg-emerald-950/20 text-emerald-400 font-bold py-4 px-8 rounded-full flex items-center gap-2 hover:bg-emerald-900/30 hover:text-emerald-300 transition-all uppercase tracking-widest text-sm shadow-md">
            <Phone className="w-4 h-4" /> WhatsApp VIP Desk
          </a>
          <a href="https://t.me/PTM_PRIME_bot" target="_blank" className="border border-slate-700 text-slate-300 font-bold py-4 px-8 rounded-full flex items-center gap-2 hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest text-sm">
            Join Telegram Channel
          </a>
        </div>

        {/* Live Metrics Trust Bar */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-[#121216]/60 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="p-3 text-center border-r border-[#D4AF37]/10">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#FFD700]">94.8%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Confluence Win Edge</div>
          </div>
          <div className="p-3 text-center border-r border-[#D4AF37]/10">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">&lt; 15ms</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Zero-Latency Tick Engine</div>
          </div>
          <div className="p-3 text-center border-r border-[#D4AF37]/10">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white">100%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Masaniello Vault Lock</div>
          </div>
          <div className="p-3 text-center flex flex-col justify-center items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400">184 Live</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Traders Active Today</div>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-16 rounded-3xl border border-[#D4AF37]/25 p-2 bg-[#121216]/60 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0B0E] z-10 opacity-60"></div>
          <div className="aspect-[16/9] md:aspect-[21/9] bg-[#08080A] rounded-2xl border border-white/5 relative overflow-hidden flex flex-col">
             {/* Mock Dashboard UI */}
             <div className="h-10 border-b border-white/5 flex items-center justify-between px-4">
               <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
               <div className="text-[10px] text-[#C5A059] font-mono tracking-widest uppercase">PTM PRIME QUANTUM LAB • 64 STRATEGY/MARKET MATRIX ACTIVE</div>
               <div className="w-12"></div>
             </div>
             <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 border border-[#D4AF37]/20 rounded-xl bg-black/40 p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white"><Crown className="w-4 h-4 text-[#FFD700]" /> CURRENT BEST EDGE</div>
                  <div className="text-xs text-[#FFD700] font-mono font-bold mt-1">Low-Vol Tactical Reversal</div>
                  <div className="text-[10px] text-slate-400 font-mono">Volatility 10 (1s) • 5 Ticks</div>
                  <div className="text-xl font-mono font-extrabold text-emerald-400 mt-2">78.4% Win Rate</div>
                  <div className="mt-auto w-full h-8 bg-emerald-500/20 rounded border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    AI Auto-Pilot Active
                  </div>
                </div>
                <div className="md:col-span-3 border border-white/5 rounded-xl bg-black/40 p-4 relative overflow-hidden flex flex-col justify-between">
                  <svg className="absolute bottom-0 w-full h-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L 15 85 L 30 90 L 45 60 L 60 70 L 75 40 L 90 45 L 100 10" fill="none" stroke="#22c55e" strokeWidth="2.5"/>
                    <path d="M0 100 L 15 85 L 30 90 L 45 60 L 60 70 L 75 40 L 90 45 L 100 10 L 100 100 Z" fill="url(#greenGrad)" />
                    <defs><linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="100"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="transparent"/></linearGradient></defs>
                  </svg>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-400">Automated Session Profit</div>
                      <div className="text-2xl sm:text-4xl font-mono font-extrabold text-[#22c55e]">+ $348.50</div>
                    </div>
                    <div className="bg-black/70 border border-[#D4AF37]/30 px-3 py-1.5 rounded-xl text-right">
                      <div className="text-[9px] uppercase tracking-widest text-[#C5A059]">Masaniello Vault</div>
                      <div className="text-sm font-mono font-bold text-[#FFD700]">Locked & Secured</div>
                    </div>
                  </div>
                  <div className="relative z-10 flex gap-2">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">12 Wins / 1 Loss</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-500/30">Target Reached 100%</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Engineering Perfection</h2>
          <p className="text-[#C5A059] uppercase tracking-widest text-xs font-bold">Built for Traders who demand algorithmic supremacy</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#121216]/80 backdrop-blur-md border border-[#D4AF37]/20 p-8 rounded-3xl hover:border-[#D4AF37]/50 hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#FFD700] mb-6"><Target className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-white mb-3">Proprietary Quantum Confluence</h3>
            <p className="text-slate-400 leading-relaxed text-sm">We don't guess. The bot requires strict mathematical alignment of multi-timeframe directional impulse, dynamic volatility envelopes, and liquidity exhaustions before entering a trade.</p>
          </div>
          <div className="bg-[#121216]/80 backdrop-blur-md border border-[#D4AF37]/20 p-8 rounded-3xl hover:border-[#D4AF37]/50 hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6"><ShieldAlert className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-white mb-3">Masaniello MM Capital Vault</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Strict mathematical risk management built-in. Set your daily target and max loss, and the vault locks the bot out to protect your hard-earned profits with trailing drawdown shields.</p>
          </div>
          <div className="bg-[#121216]/80 backdrop-blur-md border border-[#D4AF37]/20 p-8 rounded-3xl hover:border-[#D4AF37]/50 hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6"><Zap className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-white mb-3">Autonomous AI & Telegram Sync</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Monitor and control your bot on the go. Get instant win/loss notifications, and let the Autonomous Neural AI switch to the best market/tick edge in real-time.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section (Choose Your Arsenal) */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-[#D4AF37]/15">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#FFD700] text-[10px] font-bold uppercase tracking-widest mb-4 border border-[#D4AF37]/30">
            TRANSPARENT PRICING • ZERO HIDDEN FEES
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white mb-4">Choose Your Arsenal</h2>
          <p className="text-[#C5A059] max-w-2xl mx-auto text-sm sm:text-base font-light">
            ශ්‍රී ලාංකික වෙළඳුන්ගේ පහසුව සඳහා මාසිකව, වාර්ෂිකව (35% OFF) හෝ සදාකාලිකව (Lifetime VIP) ලබාගත හැකි සුපිරි පැකේජ.
          </p>
        </div>

        {/* Currency & Billing Toggle Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          {/* Billing Cycle Pill */}
          <div className="flex items-center bg-[#121216] border border-[#D4AF37]/30 p-1.5 rounded-full shadow-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                billingCycle === "monthly" 
                  ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              මාසික (Monthly)
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                billingCycle === "annual" 
                  ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>වාර්ෂික (Annual)</span>
              <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase">35% OFF</span>
            </button>
            <button
              onClick={() => setBillingCycle("lifetime")}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                billingCycle === "lifetime" 
                  ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black shadow-[0_0_20px_rgba(255,215,0,0.6)] font-extrabold" 
                  : "text-amber-400 hover:text-white"
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Lifetime VIP</span>
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center bg-[#121216] border border-white/10 p-1.5 rounded-full text-xs font-mono font-bold">
            <button
              onClick={() => setCurrency("LKR")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                currency === "LKR" ? "bg-emerald-500 text-black font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              🇱🇰 LKR (රු.)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                currency === "USD" ? "bg-emerald-500 text-black font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              🌐 USD ($)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            // Price calculation depending on billing
            let displayPrice = "";
            let billingPeriodText = "";
            let savingsNote = "";

            if (billingCycle === "monthly") {
              displayPrice = currency === "LKR" ? `රු. ${plan.monthlyLKR.toLocaleString()}` : `$${plan.monthlyUSD}`;
              billingPeriodText = "/ මසකට (Monthly)";
            } else if (billingCycle === "annual") {
              displayPrice = currency === "LKR" ? `රු. ${plan.annualMonthlyLKR.toLocaleString()}` : `$${plan.annualMonthlyUSD}`;
              billingPeriodText = "/ මසකට (වාර්ෂිකව ගෙවීමේදී)";
              savingsNote = currency === "LKR" 
                ? `වසරකට සම්පූර්ණ මුදල: රු. ${plan.annualTotalLKR.toLocaleString()} (රු. 67,000 ඉතිරියක්)` 
                : `Billed annually: $${plan.annualTotalUSD} / yr (Save $204/yr)`;
            } else {
              displayPrice = currency === "LKR" ? `රු. ${plan.lifetimeLKR.toLocaleString()}` : `$${plan.lifetimeUSD}`;
              billingPeriodText = "එක්වරක් පමණි (One-Time VIP)";
              savingsNote = "සදාකාලික ප්‍රවේශය • මාසික අලුත් කිරීම් නැත";
            }

            return (
              <div 
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 ${
                  plan.isPopular 
                    ? "bg-gradient-to-b from-[#1C1A22] to-[#0B0B0E] border-2 border-[#D4AF37] shadow-[0_0_50px_rgba(212,175,55,0.25)] md:scale-105 z-20" 
                    : plan.id === "lifetime"
                    ? "bg-gradient-to-b from-[#1E1925] to-[#0B0B0E] border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                    : "bg-[#121216]/80 border border-slate-700/60"
                }`}
              >
                {/* Header Badge */}
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-md ${
                    plan.isPopular 
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black" 
                      : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className={`text-2xl font-serif font-bold mb-2 ${plan.isPopular ? "text-[#FFD700]" : "text-white"}`}>
                    {plan.name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6 min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Price Tag */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-tight">
                        {displayPrice}
                      </span>
                    </div>
                    <div className="text-xs text-[#C5A059] font-medium mt-1">
                      {billingPeriodText}
                    </div>
                    {savingsNote && (
                      <div className="text-[11px] text-emerald-400 font-mono mt-1.5 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{savingsNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="flex flex-col gap-3.5 my-8 border-t border-white/5 pt-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300 text-xs sm:text-sm leading-snug">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.isPopular ? "text-[#FFD700]" : "text-emerald-400"
                        }`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action CTA */}
                <div className="mt-6 flex flex-col gap-2.5">
                  <button 
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      plan.isPopular 
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-[1.02]" 
                        : "bg-white/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFD700]"
                    }`}
                  >
                    <span>{plan.isPopular ? "Go Elite Pro • Activate Now" : `Select ${plan.name}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleOpenLiveChatForPlan(plan.name, billingCycle, displayPrice)}
                    className="text-[11px] text-slate-400 hover:text-[#FFD700] underline font-medium text-center transition-colors cursor-pointer"
                  >
                    චැට් එකෙන් විස්තර අසන්න (Chat with Support)
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Accepted Payment Methods Bar */}
        <div className="mt-16 p-6 rounded-2xl bg-[#121216]/60 border border-[#D4AF37]/20 text-center max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FFD700]" />
              <span>ශ්‍රී ලංකාවේ සහ විදේශීය ගෙවීම් ක්‍රම (Supported Payment Methods)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Commercial, Sampath, BOC, HNB Bank Transfers • Binance Pay USDT • Deriv P2P (DP2P)
            </p>
          </div>
          <button 
            onClick={() => handleOpenLiveChatForPlan("General Inquiry", "Payment", "")}
            className="px-5 py-2.5 rounded-full bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#FFD700] text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            ගෙවීම් ක්‍රම විමසන්න (Inquire Payment)
          </button>
        </div>
      </section>

      {/* Community & Direct Support Desk Section */}
      <section id="community" className="py-20 px-6 max-w-7xl mx-auto relative z-10 border-t border-[#D4AF37]/15">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">Direct VIP Support & Trader Community</h2>
          <p className="text-[#C5A059] text-sm max-w-xl mx-auto font-light">
            පද්ධතිය සකසා ගැනීම, ගෙවීම් කිරීම සහ සජීවී වෙළඳ සංඥා සඳහා අපගේ නිල සේවා අංශය හා සම්බන්ධ වන්න.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* WhatsApp Support */}
          <a 
            href="https://wa.me/94773535384?text=Hello%20PTM%20Prime!%20I%20need%20assistance%20with%20the%20Trading%20Bot." 
            target="_blank" 
            className="p-6 rounded-2xl bg-[#121216]/80 border border-emerald-500/30 hover:border-emerald-400 transition-all group flex flex-col items-center text-center shadow-lg hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-7 h-7" />
            </div>
            <h4 className="text-white font-bold text-base mb-1">WhatsApp Official Desk</h4>
            <p className="text-emerald-400 font-mono text-sm font-bold mb-2">+94 77 353 5384</p>
            <span className="text-[11px] text-slate-400">ක්ෂණික සිංහල සේවා සහාය (Instant Response)</span>
          </a>

          {/* Telegram Channel & Bot */}
          <a 
            href="https://t.me/PTM_PRIME_bot" 
            target="_blank" 
            className="p-6 rounded-2xl bg-[#121216]/80 border border-blue-500/30 hover:border-blue-400 transition-all group flex flex-col items-center text-center shadow-lg hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h4 className="text-white font-bold text-base mb-1">Telegram VIP Bot</h4>
            <p className="text-blue-400 font-mono text-sm font-bold mb-2">@PTM_PRIME_bot</p>
            <span className="text-[11px] text-slate-400">සජීවී සංඥා සහ දුරස්ථ පාලනය (Live Alerts)</span>
          </a>

          {/* Email Support */}
          <a 
            href="mailto:info.ptmprime@gmail.com" 
            className="p-6 rounded-2xl bg-[#121216]/80 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all group flex flex-col items-center text-center shadow-lg hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 text-[#FFD700] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-7 h-7" />
            </div>
            <h4 className="text-white font-bold text-base mb-1">Official Support Desk</h4>
            <p className="text-[#FFD700] font-mono text-sm font-bold mb-2">info.ptmprime@gmail.com</p>
            <span className="text-[11px] text-slate-400">ගිණුම් සහ ආයතනික විමසීම් (Client Inquiries)</span>
          </a>

          {/* In-Page Live Chat */}
          <button 
            onClick={() => handleOpenLiveChatForPlan("Website User", "Instant Support", "")}
            className="p-6 rounded-2xl bg-[#121216]/80 border border-yellow-500/30 hover:border-yellow-400 transition-all group flex flex-col items-center text-center shadow-lg hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h4 className="text-white font-bold text-base mb-1">In-Site Live Chat</h4>
            <p className="text-yellow-400 font-mono text-sm font-bold mb-2">Instant Ticket Desk</p>
            <span className="text-[11px] text-slate-400">වෙබ් අඩවිය තුළ සජීවී කතාබස් (Live Chat)</span>
          </button>
        </div>
      </section>

      {/* Footer Area with Page Views Counter */}
      <footer className="border-t border-[#D4AF37]/20 bg-[#08080A] py-14 px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 mb-3 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]"><Logo/></div>
          <span className="text-lg font-serif font-bold text-[#FFD700] tracking-widest uppercase mb-1">PTM PRIME QUANTUM SYSTEMS</span>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-4">Institutional Synthetic Algorithmic OS</p>
          
          {/* Live Page Views Counter - Hits.sh Style */}
          <div className="my-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 font-mono shadow-inner">
              <Eye className="w-4 h-4 text-[#D4AF37]" />
              <span>Total Page Visits:</span>
              <img 
                src="https://hits.sh/ptm-prime-tradings.vercel.app.svg?style=for-the-badge&label=Live+Views&color=D4AF37&labelColor=0B0B0E" 
                alt="Total Page Views" 
                className="h-6 rounded-md shadow-md inline-block"
              />
            </div>
          </div>

          <p className="text-slate-500 text-[11px] max-w-2xl mx-auto leading-relaxed mt-2">
            Trading synthetic indices on Deriv carries high risk. Algorithmic execution and quantitative models do not guarantee future profits. Capital protection depends on disciplined usage of the Masaniello vault.
          </p>
          <div className="text-slate-600 text-[10px] uppercase tracking-widest font-mono mt-6">
            © 2026 PTM Prime Group. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Plan Purchase & Concierge Modal */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setSelectedPlanForModal(null)}></div>
          <div className="w-full max-w-lg bg-[#121216] border-2 border-[#D4AF37] p-8 sm:p-10 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.35)] relative z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold">Selected Arsenal License</span>
                <h3 className="text-2xl font-serif font-extrabold text-white">{selectedPlanForModal.name}</h3>
              </div>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-black/60 border border-[#D4AF37]/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400">License Total Price</div>
                <div className="text-2xl font-mono font-extrabold text-[#FFD700]">{selectedPlanForModal.rawPrice}</div>
              </div>
              <div className="text-right">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase font-mono font-bold">
                  {selectedPlanForModal.billingCycle} License
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-light">
              ඔබට මෙම පැකේජය පහත ක්‍රම ඔස්සේ ක්ෂණිකව සක්‍රිය (Instant Activation) කරගත හැක. පහත WhatsApp හෝ Live Chat හරහා අපගේ නිල කාර්ය මණ්ඩලය අමතන්න:
            </p>

            {/* Direct Activation Actions */}
            <div className="flex flex-col gap-3">
              {/* WhatsApp Instant Activation */}
              <a 
                href={`https://wa.me/94773535384?text=${encodeURIComponent(
                  `Hello PTM Prime! I want to activate the ${selectedPlanForModal.name} plan (${selectedPlanForModal.billingCycle}) for ${selectedPlanForModal.rawPrice}. Please send payment instructions (Bank Transfer / Binance Pay / Deriv P2P).`
                )}`}
                target="_blank"
                className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,211,102,0.4)] cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-black" />
                <span>WhatsApp මගින් ක්ෂණිකව සක්‍රිය කරන්න (Instant WhatsApp)</span>
              </a>

              {/* Website Live Chat Activation */}
              <button
                onClick={() => handleOpenLiveChatForPlan(selectedPlanForModal.name, selectedPlanForModal.billingCycle, selectedPlanForModal.rawPrice)}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>වෙබ් අඩවිය තුළ සජීවී කතාබස් (Live Chat Concierge)</span>
              </button>

              {/* Telegram VIP Channel Activation */}
              <a 
                href="https://t.me/PTM_PRIME_bot" 
                target="_blank"
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Telegram VIP Desk එකෙන් ලබාගන්න</span>
              </a>
            </div>

            {/* Accepted Methods Breakdown in Modal */}
            <div className="mt-6 pt-5 border-t border-white/10 text-left">
              <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold block mb-2">ගෙවීම් කළ හැකි ක්‍රම (Accepted Channels):</span>
              <ul className="text-[11px] text-slate-300 space-y-1.5 font-mono">
                <li>• 🏦 Commercial / Sampath / BOC / HNB Bank Transfer (Slip Upload)</li>
                <li>• 💎 Binance Pay USDT (TRC20 / BEP20)</li>
                <li>• ⚡ Deriv DP2P Transfer to Verified Merchant Account</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowLogin(false)}></div>
          <div className="w-full max-w-md bg-[#121216] border border-[#D4AF37]/30 p-10 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.2)] relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-6 text-slate-500 hover:text-white font-bold text-xl cursor-pointer">&times;</button>
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-2xl font-serif font-bold tracking-[0.1em] text-white">Client Portal</h2>
              <p className="text-xs text-[#C5A059] uppercase tracking-widest mt-1">Authorized Access Only</p>
            </div>
            
            {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm font-semibold"><ShieldAlert className="w-5 h-5 flex-shrink-0" /> {error}</div>}
            {message && <div className="mb-6 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl flex items-center gap-3 text-[#FFD700] text-sm font-semibold"><KeyRound className="w-5 h-5 flex-shrink-0" /> {message}</div>}

            {flowState === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-all font-medium" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-all font-medium" />
                <button type="submit" disabled={isLoading} className="mt-2 w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all uppercase tracking-widest text-sm cursor-pointer">
                  {isLoading ? "Authenticating..." : "Access Terminal"} <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => {setFlowState("forgot"); setError(""); setMessage("");}} className="text-slate-400 hover:text-[#FFD700] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer">Forgot Password?</button>
                </div>
              </form>
            )}

            {flowState === "forgot" && (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                <p className="text-slate-400 text-sm text-center mb-2 font-medium">Enter your email to receive a secure Telegram OTP.</p>
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]" />
                <button type="submit" disabled={isLoading} className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/50 text-[#FFD700] font-bold py-4 rounded-xl hover:bg-[#D4AF37]/20 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" /> Request OTP
                </button>
                <button type="button" onClick={() => setFlowState("login")} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mt-2 transition-colors cursor-pointer">Cancel</button>
              </form>
            )}

            {flowState === "reset" && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <input type="text" placeholder="6-Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-4 px-5 text-[#FFD700] focus:outline-none focus:border-[#D4AF37] text-center font-mono tracking-[0.5em] text-2xl font-bold" maxLength={6} />
                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-[#D4AF37] font-medium" />
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all uppercase tracking-widest text-sm cursor-pointer">
                  Confirm New Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
