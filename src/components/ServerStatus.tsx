"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/app/config';
import { ServerOff, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ServerStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/health`, { cache: 'no-store' });
      if (res.ok) setIsOffline(false);
      else setIsOffline(true);
    } catch (e) {
      setIsOffline(true);
    }
    setIsChecking(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-[#0B0B0E]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <ServerOff className="w-12 h-12 text-red-500" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif text-white font-bold tracking-widest mb-4">
              SYSTEM <span className="text-red-500">OFFLINE</span>
            </h1>
            
            <h2 className="text-lg md:text-xl text-[#C5A059] font-bold tracking-[0.2em] uppercase mb-8">
              The core trading engine is unreachable
            </h2>
            
            <p className="text-slate-400 max-w-md mx-auto mb-10 text-sm leading-relaxed">
              PTM Prime backend servers are currently powered down or experiencing network disruptions. Please wait for the administrator to engage the master servers.
            </p>
            
            <button 
              onClick={checkStatus} 
              disabled={isChecking}
              className="group relative px-8 py-4 bg-transparent border border-red-500/50 text-red-500 font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all flex items-center gap-3 overflow-hidden disabled:opacity-50"
            >
              <Power className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Reconnecting...' : 'Attempt Reconnection'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
