import Link from 'next/link';
import { ShieldAlert, Home, ChevronRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0B0E] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-24 h-24 rounded-full bg-[#ff3333]/10 border border-[#ff3333]/30 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,51,51,0.2)]">
          <ShieldAlert className="w-12 h-12 text-[#ff3333]" />
        </div>
        
        <h1 className="text-8xl font-serif text-[#FFD700] font-bold tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          404
        </h1>
        
        <h2 className="text-2xl text-white font-bold tracking-[0.2em] uppercase mb-4">
          Access Denied / Sector Not Found
        </h2>
        
        <p className="text-slate-400 max-w-md mx-auto mb-10 text-sm leading-relaxed">
          The requested operational sector does not exist within the PTM Prime network, or your clearance level is insufficient. Return to base immediately.
        </p>
        
        <Link href="/" className="group relative px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold rounded-xl uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center gap-3 overflow-hidden">
          <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></span>
          <Home className="w-4 h-4" />
          Return to Headquarters
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
          PTM Prime Core Systems // Unauthorized Access Attempt Logged
        </p>
      </div>
    </div>
  );
}
