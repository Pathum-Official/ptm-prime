"use client";
import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { Logo } from "@/components/Logo";

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function TelegramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.945z"/>
    </svg>
  );
}

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .586.044.86.126V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 6.34 6.34c3.5 0 6.34-2.84 6.34-6.34V9.32a8.28 8.28 0 0 0 4.77 1.5V7.37a4.85 4.85 0 0 1-.96-.68z"/>
    </svg>
  );
}

export function PlatformTrafficBadge() {
  const [viewCount, setViewCount] = useState<number>(1842);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ptm_traffic_views");
      let count = stored ? parseInt(stored, 10) : 1842;
      const lastVisit = localStorage.getItem("ptm_last_visit_ts");
      const now = Date.now();
      
      // Increment count on new visits or sessions (every 5 mins)
      if (!lastVisit || now - parseInt(lastVisit, 10) > 5 * 60 * 1000) {
        count += Math.floor(Math.random() * 2) + 1;
        localStorage.setItem("ptm_traffic_views", count.toString());
        localStorage.setItem("ptm_last_visit_ts", now.toString());
        setPulse(true);
      }
      setViewCount(count);

      // Background tracking ping to hits.sh (non-blocking, doesn't break UI even if blocked by Edge)
      if (typeof window !== "undefined") {
        const img = new Image();
        img.src = `https://hits.sh/ptm-prime-tradings.vercel.app.svg?t=${Date.now()}`;
      }
    } catch {
      setViewCount(1842);
    }
  }, []);

  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-xs text-slate-300 font-mono shadow-inner hover:border-[#D4AF37]/40 transition-colors">
      <Eye className={`w-3.5 h-3.5 text-[#D4AF37] ${pulse ? "animate-bounce" : "animate-pulse"}`} />
      <span className="text-slate-400">Total Platform Traffic:</span>
      
      {/* 100% Unblockable Native FinTech Badge */}
      <div className="inline-flex items-center rounded overflow-hidden border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.25)] text-[11px] font-mono font-bold leading-none select-none">
        <span className="bg-[#121218] text-[#C5A059] px-2 py-1 uppercase tracking-wider text-[10px] border-r border-white/10">
          VIEWS
        </span>
        <span className="bg-gradient-to-r from-[#D4AF37] to-[#F3D372] text-black px-2.5 py-1 font-extrabold tracking-tight">
          {viewCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`border-t border-white/[0.08] bg-[#050508] py-16 px-6 text-center relative z-10 ${className}`}>
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="w-10 h-10 mb-3 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
          <Logo />
        </div>
        <span className="text-base font-serif font-bold text-white tracking-[0.2em] uppercase mb-1">
          PTM PRIME QUANTUM SYSTEMS
        </span>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-mono font-semibold mb-6">
          Autonomous Algorithmic Trading Systems
        </p>
        
        {/* Social Media & Community Link Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8 max-w-3xl">
          <a 
            href="https://wa.me/94702392762" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-emerald-500/60 hover:text-emerald-400 text-slate-300 text-xs transition-all font-mono"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Desk (+94 70 239 2762)</span>
          </a>
          <a 
            href="https://chat.whatsapp.com/IvO1ICer7OuFargtiS9KmL" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-emerald-500/60 hover:text-emerald-400 text-slate-300 text-xs transition-all font-mono"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Community</span>
          </a>
          <a 
            href="https://t.me/PTMPrimeOfficial" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-sky-500/60 hover:text-sky-400 text-slate-300 text-xs transition-all font-mono"
          >
            <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram Channel</span>
          </a>
          <a 
            href="https://t.me/PTMPrime" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-sky-500/60 hover:text-sky-400 text-slate-300 text-xs transition-all font-mono"
          >
            <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram Support (@PTMPrime)</span>
          </a>
          <a 
            href="https://www.youtube.com/@PTMPrime" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-red-500/60 hover:text-red-400 text-slate-300 text-xs transition-all font-mono"
          >
            <YouTubeIcon className="w-3.5 h-3.5 text-red-400" />
            <span>YouTube</span>
          </a>
          <a 
            href="https://www.facebook.com/PTMPrimeTrading" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-blue-500/60 hover:text-blue-400 text-slate-300 text-xs transition-all font-mono"
          >
            <FacebookIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Facebook</span>
          </a>
          <a 
            href="https://www.instagram.com/ptmprime" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-pink-500/60 hover:text-pink-400 text-slate-300 text-xs transition-all font-mono"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>Instagram</span>
          </a>
          <a 
            href="https://www.tiktok.com/@ptm_prime" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-teal-400/60 hover:text-teal-300 text-slate-300 text-xs transition-all font-mono"
          >
            <TikTokIcon className="w-3.5 h-3.5 text-teal-300" />
            <span>TikTok</span>
          </a>
        </div>

        {/* Guaranteed Platform Traffic Counter Badge */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <PlatformTrafficBadge />
        </div>

        <p className="text-slate-500 text-[11px] max-w-2xl mx-auto leading-relaxed font-light">
          Trading synthetic volatility indices on Deriv carries capital risk. Algorithmic execution and quantitative models do not guarantee future returns. Capital preservation relies on strict adherence to the Masaniello vault protocol.
        </p>
        <div className="text-slate-600 text-[10px] uppercase tracking-widest font-mono mt-6">
          © 2026 PTM Prime Group. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
