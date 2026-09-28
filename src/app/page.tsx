"use client";
import { API_URL } from './config';


import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, KeyRound, Mail, ArrowRight, Zap, Target, Lock, ChevronRight, CheckCircle2 } from "lucide-react";

export const Logo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="url(#goldGradient)" stroke="#FFD700" strokeWidth="2" />
    <path d="M35 70 L35 30 L55 30 C 65 30 70 35 70 45 C 70 55 65 60 55 60 L35 60" stroke="#0B0B0E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M35 70 L35 30 L55 30 C 65 30 70 35 70 45 C 70 55 65 60 55 60 L35 60" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D4AF37" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#8B6508" />
      </linearGradient>
    </defs>
  </svg>
);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
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
        method: "POST", headers: { "Content-Type": "application/json" },
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
        method: "POST", headers: { "Content-Type": "application/json" },
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
      
      {/* Navigation */}
      <nav className="border-b border-[#D4AF37]/10 bg-[#121216]/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"><Logo /></div>
            <span className="text-xl font-bold font-serif tracking-[0.2em] text-[#FFD700] uppercase hidden sm:block">PTM PRIME</span>
          </div>
          <div className="flex gap-6 items-center text-sm font-bold tracking-widest uppercase">
            <a href="#features" className="hidden md:block text-[#C5A059] hover:text-[#FFD700] transition-colors">Features</a>
            <a href="#pricing" className="hidden md:block text-[#C5A059] hover:text-[#FFD700] transition-colors">Pricing</a>
            <button onClick={() => setShowLogin(true)} className="px-6 py-2 border border-[#D4AF37] text-[#FFD700] rounded-full hover:bg-[#D4AF37]/10 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all">
              Client Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.3em] mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Engine v2.0 Live - Triple Confluence Tech
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          Dominate the Markets with <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">Precision AI.</span>
        </h1>
        <p className="text-[#C5A059] text-lg md:text-xl max-w-3xl mx-auto mb-10 tracking-wide font-light">
          PTM Prime combines real-time RSI, EMA, and Bollinger Bands to deliver high-probability trade execution on Deriv. Protect your capital with the built-in Masaniello Money Management vault.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button onClick={() => setShowLogin(true)} className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold py-4 px-10 rounded-full flex items-center gap-2 hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-105 transition-all uppercase tracking-widest text-sm">
            Get Started Now <ChevronRight className="w-5 h-5" />
          </button>
          <a href="https://t.me/PTM_PRIME_bot" target="_blank" className="border border-slate-700 text-slate-300 font-bold py-4 px-10 rounded-full flex items-center gap-2 hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest text-sm">
            Join Telegram
          </a>
        </div>
        
        {/* Dashboard Preview Mockup */}
        <div className="mt-20 rounded-3xl border border-[#D4AF37]/20 p-2 bg-[#121216]/50 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0B0E] z-10 opacity-60"></div>
          <div className="aspect-[16/9] md:aspect-[21/9] bg-[#08080A] rounded-2xl border border-white/5 relative overflow-hidden flex flex-col">
             {/* Mock Dashboard UI */}
             <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
               <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
             </div>
             <div className="flex-1 p-6 grid grid-cols-4 gap-4">
                <div className="col-span-1 border border-white/5 rounded-xl bg-white/5 p-4 flex flex-col gap-2">
                  <div className="w-full h-4 bg-white/10 rounded"></div><div className="w-3/4 h-4 bg-white/10 rounded"></div>
                  <div className="mt-auto w-full h-10 bg-[#D4AF37]/20 rounded border border-[#D4AF37]/50"></div>
                </div>
                <div className="col-span-3 border border-white/5 rounded-xl bg-white/5 p-4 relative overflow-hidden">
                  <svg className="absolute bottom-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L 20 80 L 40 90 L 60 40 L 80 50 L 100 10" fill="none" stroke="#22c55e" strokeWidth="2"/>
                    <path d="M0 100 L 20 80 L 40 90 L 60 40 L 80 50 L 100 10 L 100 100 Z" fill="url(#greenGrad)" />
                    <defs><linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="100"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="transparent"/></linearGradient></defs>
                  </svg>
                  <div className="absolute top-4 left-4 text-[#22c55e] font-mono text-3xl font-bold">+ $248.50</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Engineering Perfection</h2>
          <p className="text-[#C5A059] uppercase tracking-widest text-xs font-bold">Built for Traders who demand the best</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#121216]/80 backdrop-blur-md border border-[#D4AF37]/20 p-8 rounded-3xl hover:border-[#D4AF37]/50 hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#FFD700] mb-6"><Target className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-white mb-3">Triple Confluence Engine</h3>
            <p className="text-slate-400 leading-relaxed text-sm">We don't guess. The bot requires strict alignment of RSI, 20-EMA, and Bollinger Bands before entering a trade, pushing win rates close to 100%.</p>
          </div>
          <div className="bg-[#121216]/80 backdrop-blur-md border border-[#D4AF37]/20 p-8 rounded-3xl hover:border-[#D4AF37]/50 hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6"><ShieldAlert className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-white mb-3">Masaniello MM Vault</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Strict risk management built-in. Set your daily target and max loss, and the vault locks the bot out to protect your hard-earned profits.</p>
          </div>
          <div className="bg-[#121216]/80 backdrop-blur-md border border-[#D4AF37]/20 p-8 rounded-3xl hover:border-[#D4AF37]/50 hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6"><Zap className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-white mb-3">Live Telegram Control</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Monitor and control your bot on the go. Get instant win/loss notifications and stop the bot remotely via your secure Telegram chat.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Choose Your Arsenal</h2>
          <p className="text-[#C5A059] uppercase tracking-widest text-xs font-bold">Transparent pricing. Zero hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-center">
          
          <div className="bg-[#121216]/80 border border-slate-700/50 p-8 rounded-3xl relative">
            <h3 className="text-white text-xl font-bold mb-2">Starter</h3>
            <div className="text-4xl font-bold text-white mb-6">$49<span className="text-sm text-slate-500 font-normal">/mo</span></div>
            <ul className="flex flex-col gap-4 mb-8">
              <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> Classic RSI Logic</li>
              <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> Deriv Token Integration</li>
              <li className="flex gap-3 text-slate-500 text-sm opacity-50"><CheckCircle2 className="w-5 h-5 shrink-0"/> Triple Confluence Engine</li>
            </ul>
            <button className="w-full py-4 rounded-xl border border-slate-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all">Select Plan</button>
          </div>

          <div className="bg-gradient-to-b from-[#1A1A24] to-[#0B0B0E] border border-[#D4AF37] p-8 rounded-3xl relative transform md:scale-105 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Most Popular</div>
            <h3 className="text-[#FFD700] text-xl font-bold mb-2">Elite Pro</h3>
            <div className="text-5xl font-bold text-white mb-6">$99<span className="text-sm text-[#C5A059] font-normal">/mo</span></div>
            <ul className="flex flex-col gap-4 mb-8">
              <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-[#FFD700] shrink-0"/> Triple Confluence Engine</li>
              <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-[#FFD700] shrink-0"/> Masaniello Vault</li>
              <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-[#FFD700] shrink-0"/> Live Telegram Alerts</li>
              <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-[#FFD700] shrink-0"/> 24/7 Priority Support</li>
            </ul>
            <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">Go Elite</button>
          </div>

          <div className="bg-[#121216]/80 border border-slate-700/50 p-8 rounded-3xl relative">
            <h3 className="text-white text-xl font-bold mb-2">Lifetime</h3>
            <div className="text-4xl font-bold text-white mb-6">$499<span className="text-sm text-slate-500 font-normal">/one-time</span></div>
            <ul className="flex flex-col gap-4 mb-8">
              <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> All Elite Pro Features</li>
              <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> Lifetime Updates</li>
              <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> Custom Feature Requests</li>
            </ul>
            <button className="w-full py-4 rounded-xl border border-slate-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all">Get Lifetime</button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D4AF37]/20 bg-[#08080A] py-12 px-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 grayscale opacity-50"><Logo/></div>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-2">© 2026 PTM Prime. All Rights Reserved.</p>
        <p className="text-slate-600 text-[10px] max-w-xl mx-auto">Trading on Deriv involves significant risk and is not suitable for everyone. Past performance does not guarantee future results.</p>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowLogin(false)}></div>
          <div className="w-full max-w-md bg-[#121216] border border-[#D4AF37]/30 p-10 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.2)] relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-6 text-slate-500 hover:text-white font-bold text-xl">&times;</button>
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-2xl font-serif font-bold tracking-[0.1em] text-white">Client Portal</h2>
            </div>
            
            {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm font-semibold"><ShieldAlert className="w-5 h-5 flex-shrink-0" /> {error}</div>}
            {message && <div className="mb-6 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl flex items-center gap-3 text-[#FFD700] text-sm font-semibold"><KeyRound className="w-5 h-5 flex-shrink-0" /> {message}</div>}

            {flowState === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-all font-medium" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-all font-medium" />
                <button type="submit" disabled={isLoading} className="mt-2 w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all uppercase tracking-widest text-sm">
                  {isLoading ? "Authenticating..." : "Access Terminal"} <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => {setFlowState("forgot"); setError(""); setMessage("");}} className="text-slate-400 hover:text-[#FFD700] text-xs font-bold uppercase tracking-widest transition-colors">Forgot Password?</button>
                </div>
              </form>
            )}

            {flowState === "forgot" && (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                <p className="text-slate-400 text-sm text-center mb-2 font-medium">Enter your email to receive a secure Telegram OTP.</p>
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]" />
                <button type="submit" disabled={isLoading} className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/50 text-[#FFD700] font-bold py-4 rounded-xl hover:bg-[#D4AF37]/20 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" /> Request OTP
                </button>
                <button type="button" onClick={() => setFlowState("login")} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mt-2 transition-colors">Cancel</button>
              </form>
            )}

            {flowState === "reset" && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <input type="text" placeholder="6-Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-4 px-5 text-[#FFD700] focus:outline-none focus:border-[#D4AF37] text-center font-mono tracking-[0.5em] text-2xl font-bold" maxLength={6} />
                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-[#D4AF37] font-medium" />
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all uppercase tracking-widest text-sm">
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
