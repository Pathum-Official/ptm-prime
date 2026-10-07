"use client";
import { API_URL, WS_URL } from '../config';


import { useState, useEffect } from "react";
import { Activity, ShieldAlert, Target, TrendingUp, Wallet, Power, Settings, LogOut, ChevronDown, ChevronUp, CheckCircle2, History, Banknote } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'trade' | 'strategies' | 'settings' | 'money' | 'history'>('trade');
  
  // UI State
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const [screenFlash, setScreenFlash] = useState<'win' | 'loss' | 'signal' | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  
  const triggerFlash = (type: 'win' | 'loss' | 'signal') => {
    setScreenFlash(type);
    setFlashKey(prev => prev + 1);
  };
  
  // Strategy Logic State
  const [strategy, setStrategy] = useState("sniper");
  const [initialStake, setInitialStake] = useState(10);
  const [targetProfit, setTargetProfit] = useState(50);
  const [stopLoss, setStopLoss] = useState(100);
  const [multiplier, setMultiplier] = useState(2.1);
  const [cooldownPeriod, setCooldownPeriod] = useState(0);
  const [winCooldown, setWinCooldown] = useState(0);
  const [lossCooldown, setLossCooldown] = useState(0);
  
  // Live State
  const [pnl, setPnl] = useState(0.00);
  const [winRate, setWinRate] = useState(0.0);
  const [currentStake, setCurrentStake] = useState(0.00);
  const [liveTick, setLiveTick] = useState<number | null>(null);
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [latestSignal, setLatestSignal] = useState<string>("Analyzing Physics...");
  
  // Terminal Logs
  const [logs, setLogs] = useState<{id: string, text: string, type: 'info'|'success'|'error'|'trade'|'alert', timestamp: string}[]>([]);

  // Settings
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Security Settings State
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confPwd, setConfPwd] = useState("");
  const [derivDemoToken, setDerivDemoToken] = useState("");
  const [derivRealToken, setDerivRealToken] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [telegramOtpSent, setTelegramOtpSent] = useState(false);
  const [telegramOtp, setTelegramOtp] = useState("");
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [historyView, setHistoryView] = useState<'detailed'|'hourly'|'daily'|'monthly'|'yearly'>('detailed');
  const [historyDateContext, setHistoryDateContext] = useState<string>(new Date().toISOString().split('T')[0]);

  const processHistory = () => {
    let filtered = tradeHistory;
    const ctxDate = new Date(historyDateContext);

    if (historyView === 'detailed' || historyView === 'hourly') {
      filtered = tradeHistory.filter(t => {
        const d = new Date(t.timestamp + (t.timestamp.endsWith('Z') ? '' : 'Z'));
        return d.toDateString() === ctxDate.toDateString();
      });
    } else if (historyView === 'daily') {
      filtered = tradeHistory.filter(t => {
        const d = new Date(t.timestamp + (t.timestamp.endsWith('Z') ? '' : 'Z'));
        return d.getMonth() === ctxDate.getMonth() && d.getFullYear() === ctxDate.getFullYear();
      });
    } else if (historyView === 'monthly') {
      filtered = tradeHistory.filter(t => {
        const d = new Date(t.timestamp + (t.timestamp.endsWith('Z') ? '' : 'Z'));
        return d.getFullYear() === ctxDate.getFullYear();
      });
    }

    if (historyView === 'detailed') {
      return { type: 'detailed', data: filtered };
    }

    const groups: Record<string, {wins: number, losses: number, profit: number, total: number}> = {};
    filtered.forEach(t => {
      const d = new Date(t.timestamp + (t.timestamp.endsWith('Z') ? '' : 'Z'));
      let label = '';
      if (historyView === 'hourly') label = `${d.getHours().toString().padStart(2, '0')}:00`;
      else if (historyView === 'daily') label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      else if (historyView === 'monthly') label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      else if (historyView === 'yearly') label = d.getFullYear().toString();
      
      if (!groups[label]) groups[label] = { wins: 0, losses: 0, profit: 0, total: 0 };
      groups[label].total += 1;
      if (t.status === 'WIN') groups[label].wins += 1;
      if (t.status === 'LOSS') groups[label].losses += 1;
      groups[label].profit += t.profit;
    });

    const summaryData = Object.entries(groups).map(([label, stats]) => ({
      label, ...stats
    })).sort((a, b) => a.label.localeCompare(b.label));

    return { type: 'summary', data: summaryData };
  };

  const processedHistory = processHistory();
  const historyTotal = historyView === 'detailed' ? processedHistory.data.length : processedHistory.data.reduce((acc:any, g:any) => acc + g.total, 0);
  const historyWins = historyView === 'detailed' ? (processedHistory.data as any[]).filter(t=>t.status==='WIN').length : processedHistory.data.reduce((acc:any, g:any) => acc + g.wins, 0);
  const historyLosses = historyView === 'detailed' ? (processedHistory.data as any[]).filter(t=>t.status==='LOSS').length : processedHistory.data.reduce((acc:any, g:any) => acc + g.losses, 0);
  const historyProfit = historyView === 'detailed' ? (processedHistory.data as any[]).reduce((acc:any, t:any) => acc + t.profit, 0) : processedHistory.data.reduce((acc:any, g:any) => acc + g.profit, 0);
  const historyWinRate = historyTotal > 0 ? ((historyWins / historyTotal) * 100).toFixed(1) : '0.0';

  // Logic Settings State
  const [strategyCore, setStrategyCore] = useState("apex");
  const [accountType, setAccountType] = useState("demo");

  // Load account type from localStorage on mount
  useEffect(() => {
    const savedType = localStorage.getItem("ptm_account_type");
    if (savedType === "real" || savedType === "demo") {
      setAccountType(savedType);
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/bot/history`, {credentials: "include", headers: {"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`}});
      if (res.ok) setTradeHistory(await res.json());
    } catch(e) {}
  };

  const [toast, setToast] = useState<{message: string, type: 'success'|'error'|null}>({message: "", type: null});
  const showToast = (msg: string, type: 'success'|'error') => {
    setToast({message: msg, type});
    setTimeout(() => setToast({message: "", type: null}), 4000);
  };

  const playTTS = (text: string) => {
    if (!voiceEnabled) return;
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch(e) {}
  };

  const [hasSavedTelegram, setHasSavedTelegram] = useState(false);
  const [hasDemoToken, setHasDemoToken] = useState(false);
  const [hasRealToken, setHasRealToken] = useState(false);
  const [userName, setUserName] = useState("Elite Member");

  const fetchBalance = async (accType: string) => {
    try {
      const balanceRes = await fetch(`${API_URL}/api/v1/bot/balance?account_type=${accType}`, {credentials: "include", headers: {"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`}});
      if (balanceRes.ok) {
        const balData = await balanceRes.json();
        if (balData.balance !== null) setAccountBalance(balData.balance);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/users/me`, {credentials: "include", headers: {"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`}});
        if (!res.ok) {
          router.push("/");
          return;
        }
        setIsAuthenticated(true);
        const data = await res.json();
        if (data.full_name) {
          setUserName(data.full_name);
          if (!sessionStorage.getItem('ptm_welcomed')) {
            setTimeout(() => {
              playTTS(`Welcome back, ${data.full_name}. All systems online and ready for deployment.`);
            }, 1000);
            sessionStorage.setItem('ptm_welcomed', 'true');
          }
        }
        if (data.telegram_id) {
            setTelegramId(data.telegram_id);
            setHasSavedTelegram(true);
          }
          if (data.has_demo_token) setHasDemoToken(true);
          if (data.has_real_token) setHasRealToken(true);
          // Legacy support: if has_deriv_token is true but specific ones aren't, consider it real
          if (data.has_deriv_token && !data.has_real_token && !data.has_demo_token) setHasRealToken(true);
          if (data.logic) {
            setStrategy(data.logic.active_strategy);
            if (data.logic.strategy_core) setStrategyCore(data.logic.strategy_core);
            setInitialStake(data.logic.stake_amount);
            setCurrentStake(data.logic.stake_amount);
            setTargetProfit(data.logic.take_profit);
            setStopLoss(data.logic.stop_loss);
            setMultiplier(data.logic.martingale_multiplier);
            setCooldownPeriod(data.logic.cooldown_period || 0);
            setWinCooldown(data.logic.win_cooldown || 0);
            setLossCooldown(data.logic.loss_cooldown || 0);
          }
        
        // Fetch current bot running status
        const statusRes = await fetch(`${API_URL}/api/v1/bot/status`, {credentials: "include", headers: {"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`}});
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setIsRunning(statusData.running);
        }
        
        // Fetch account balance independently
        await fetchBalance(localStorage.getItem("ptm_account_type") || "demo");
        
        // Fetch trade history
        const historyRes = await fetch(`${API_URL}/api/v1/bot/history`, {credentials: "include", headers: {"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`}});
        if (historyRes.ok) {
          const histData = await historyRes.json();
          setTradeHistory(histData);
        }
      } catch (e) {}
    };
    loadSettings();
  }, []);

  const handleSaveLogic = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/users/settings/logic`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ active_strategy: strategy, strategy_core: strategyCore, stake_amount: initialStake, take_profit: targetProfit, stop_loss: stopLoss, martingale_multiplier: multiplier, cooldown_period: cooldownPeriod, win_cooldown: winCooldown, loss_cooldown: lossCooldown })
      });
      if (res.ok) { showToast("Logic configuration saved successfully!", "success"); playTTS("Money management logic securely locked and saved."); }
      else { showToast("Failed to save logic.", "error"); playTTS("Failed to save configuration."); }
    } catch (e) { showToast("API unreachable.", "error"); }
  };

  const handleUpdateDeriv = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/users/settings/deriv`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ demo_token: derivDemoToken || null, real_token: derivRealToken || null })
      });
      if (res.ok) { 
        showToast("Deriv tokens securely updated!", "success"); 
        if (derivDemoToken) setHasDemoToken(true);
        if (derivRealToken) setHasRealToken(true);
        setDerivDemoToken(""); 
        setDerivRealToken("");
        playTTS("API credentials updated and encrypted."); 
      }
      else { showToast("Failed to update token.", "error"); playTTS("Failed to update token."); }
    } catch (e) { showToast("API unreachable.", "error"); }
  };

  const handleRequestTelegramOtp = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/users/settings/telegram/request-otp`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ telegram_id: telegramId })
      });
      const data = await res.json();
      if (res.ok) { setTelegramOtpSent(true); showToast("OTP sent to your Telegram!", "success"); playTTS("Verification code sent to your Telegram."); }
      else { showToast(data.detail || "Invalid Telegram Chat ID.", "error"); playTTS("Invalid Telegram ID."); }
    } catch (e) { showToast("API unreachable.", "error"); }
  };

  const handleVerifyTelegram = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/users/settings/telegram/verify-otp`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ telegram_id: telegramId, otp: telegramOtp })
      });
      const data = await res.json();
      if (res.ok) { showToast("Telegram verified and securely linked!", "success"); setTelegramOtpSent(false); setTelegramOtp(""); setHasSavedTelegram(true); playTTS("Telegram secured and linked successfully."); }
      else { showToast(data.detail || "Invalid OTP.", "error"); playTTS("Verification failed. Invalid OTP."); }
    } catch (e) { showToast("API unreachable.", "error"); }
  };

  useEffect(() => {
    // Send the JWT token as a query parameter for isolated WebSocket sessions
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`${WS_URL}/ws/dashboard?token=${token}`);
    
    // playTTS is now defined globally for the component

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'tick') {
        setLiveTick(data.value);
        if (data.balance !== undefined && data.balance !== 0) setAccountBalance(data.balance);
      }
      if (data.type === 'status_update') {
        if (data.pnl !== undefined) setPnl(data.pnl);
        if (data.win_rate !== undefined) setWinRate(data.win_rate);
        if (data.current_stake !== undefined) setCurrentStake(data.current_stake);
        if (data.latest_signal !== undefined) setLatestSignal(data.latest_signal);
      }
      if (data.type === 'trade_result') {
        setPnl(p => p + data.profit);
        if (data.profit >= 0) triggerFlash('win');
        else triggerFlash('loss');
        
        // Refresh history
        fetch(`${API_URL}/api/v1/bot/history`, {credentials: "include", headers: {"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`}})
          .then(res => res.ok ? res.json() : [])
          .then(hist => setTradeHistory(hist))
          .catch(() => {});
          
        setLogs(prev => [{
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          text: data.message || `Trade ${data.contract_id || 'Closed'} with Profit: $${(data.profit || 0).toFixed(2)}`,
          type: (data.profit || 0) >= 0 ? 'success' as const : 'error' as const,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 50));
        
        if (voiceEnabled) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            if (data.profit >= 0) {
              playTTS(`Trade won. Profit is ${data.profit.toFixed(2)} dollars.`);
              // Win sound: Premium Ding (C6)
              osc.type = 'sine';
              osc.frequency.setValueAtTime(1046.50, ctx.currentTime);
              gain.gain.setValueAtTime(0.5, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            } else {
              playTTS(`Trade lost. Applying martingale.`);
              // Loss sound: Low Buzz
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(150, ctx.currentTime);
              gain.gain.setValueAtTime(0.3, ctx.currentTime);
              gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
              osc.start();
              osc.stop(ctx.currentTime + 0.3);
            }
          } catch(e) { console.error("Audio block"); }
        }
      }
      if (data.type === 'trade_proposal') {
        triggerFlash('signal');
        if (voiceEnabled) {
          try {
            let direction = data.message.includes("FALL") ? "Fall" : (data.message.includes("RISE") ? "Rise" : "Trade");
            let stakeMatch = data.message.match(/Stake: \$([0-9.]+)/);
            let stake = stakeMatch ? stakeMatch[1] : "";
            playTTS(`Signal detected. Placing ${direction} trade for ${stake} dollars.`);
            
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            // Place Trade Sound: Quick blip
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
          } catch(e) {}
        }
      }
      if (data.type === 'log' || data.type === 'alert' || data.type === 'trade_proposal' || data.type === 'account_info') {
        if (data.type === 'log' && data.message.includes('Signal Detected')) {
          triggerFlash('signal');
          if (voiceEnabled) {
            let direction = data.message.includes("FALL") ? "Fall" : "Rise";
            playTTS(`Signal detected for ${direction}. Engine is off.`);
          }
        }
        if (data.type === 'log' && data.message.includes('MONITOR OUTCOME')) {
          if (data.message.includes('WON!')) {
            triggerFlash('win');
            if (voiceEnabled) playTTS('The simulated signal won.');
          } else if (data.message.includes('LOST')) {
            triggerFlash('loss');
            if (voiceEnabled) playTTS('The simulated signal lost.');
          }
        }
        setLogs(prev => [{id: Date.now().toString(), text: data.message, type: data.type === 'account_info' ? 'alert' : data.type, timestamp: new Date().toLocaleTimeString()}, ...prev].slice(0, 50));
        if (data.type === 'account_info' && data.balance !== undefined) {
          setAccountBalance(data.balance);
        }
      }
    };
    return () => ws.close();
  }, []); // Remove isRunning from dependency array to keep connection persistent

  const toggleBot = async () => {
    try {
      const endpoint = isRunning ? "/api/v1/bot/stop" : "/api/v1/bot/start";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }, credentials: "include",
        body: isRunning ? "{}" : JSON.stringify({ 
          initial_stake: initialStake, 
          target_profit: targetProfit, 
          stop_loss: stopLoss, 
          multiplier: multiplier,
          cooldown_period: cooldownPeriod,
          win_cooldown: winCooldown,
          loss_cooldown: lossCooldown,
          strategy_core: strategyCore,
          account_type: accountType
        })
      });
      if (res.ok) {
        setIsRunning(!isRunning);
        if (!isRunning) playTTS("Engine engaged. Systems are live.");
        else playTTS("Engine halted. Standby mode activated.");
      } else {
        const errorData = await res.json();
        showToast(errorData.detail || "Failed to toggle engine.", "error");
        playTTS("Failed to toggle engine.");
      }
    } catch (e) { showToast("API unreachable", "error"); playTTS("Server connection failed."); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confPwd) {
      showToast("Passwords don't match!", "error");
      playTTS("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/v1/users/change-password`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ email: "info.ptmprime@gmail.com", current_password: curPwd, new_password: newPwd, confirm_password: confPwd })
      });
      if (res.ok) { showToast("Password changed securely!", "success"); setCurPwd(""); setNewPwd(""); setConfPwd(""); playTTS("Master password changed securely."); }
      else {
        const err = await res.json();
        showToast(err.detail || "Error changing password.", "error");
        playTTS("Error changing master password.");
      }
    } catch (e) { showToast("API unreachable", "error"); }
  };

  const handleLogout = async () => {
    try { 
      await fetch(`${API_URL}/api/v1/auth/logout`, { method: "POST", credentials: "include", headers: {"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`} }); 
      localStorage.removeItem("user");
      window.location.href = "/"; 
    } 
    catch(e) { window.location.href = "/"; }
  };

  const StatBox = ({title, value, color, icon, glow=false}: any) => (
    <div className={`bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden backdrop-blur-md ${glow ? 'shadow-[0_0_20px_rgba(212,175,55,0.15)]' : ''}`}>
      <div className="flex items-center gap-2 text-[#C5A059] text-[10px] uppercase tracking-widest font-bold">
        <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">{icon}</span> {title}
      </div>
      <div className={`text-2xl font-serif tracking-wider ${color} font-bold`}>{value}</div>
    </div>
  );

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#FFD700] rounded-full animate-spin shadow-[0_0_20px_rgba(212,175,55,0.3)]"></div>
        <p className="text-[#FFD700] mt-6 font-bold tracking-[0.2em] uppercase text-xs animate-pulse">Authenticating Identity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-[#D4AF37] font-sans pb-28 selection:bg-[#D4AF37]/30">
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            key={flashKey}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`fixed inset-0 pointer-events-none z-[100] mix-blend-screen
              ${screenFlash === 'win' ? 'bg-green-500/20' : 
                screenFlash === 'loss' ? 'bg-red-600/30' : 
                'bg-blue-500/20'}`}
          />
        )}
      </AnimatePresence>
      <nav className="border-b border-[#D4AF37]/20 bg-[#121216]/80 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"><Logo /></div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-serif tracking-widest text-[#FFD700] uppercase hidden sm:block">PTM PRIME</span>
              <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold hidden sm:block">Welcome, {userName}</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => { 
              if (isRunning) {
                showToast("Halt engine before switching accounts.", "error");
                playTTS("Please halt the engine before switching accounts.");
                return;
              }
              const newType = accountType === 'demo' ? 'real' : 'demo';
              setAccountType(newType);
              localStorage.setItem("ptm_account_type", newType);
              setAccountBalance(0); // Reset UI while loading
              fetchBalance(newType);
              playTTS(`Switched to ${newType} account.`); 
            }} className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] ${accountType === 'demo' ? 'bg-[#D4AF37]/20 text-[#FFD700] border-[#D4AF37]/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}>
              {accountType === 'demo' ? 'DEMO' : 'REAL'}
            </button>
            <button onClick={() => { setVoiceEnabled(!voiceEnabled); if (!voiceEnabled) { setTimeout(() => playTTS("Voice systems activated."), 100); } }} className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${voiceEnabled ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              Voice {voiceEnabled ? 'ON' : 'OFF'}
            </button>
            <div className="flex items-center gap-2 bg-[#D4AF37]/10 px-4 py-2 rounded-full border border-[#D4AF37]/30">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></span>
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">System Live</span>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 rounded-full border border-red-500/50 text-xs font-bold text-red-500 hover:bg-red-500/10 uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(220,38,38,0.1)]">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {activeTab === 'trade' && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              {isRunning && <div className="absolute inset-0 bg-[#FFD700]/20 blur-3xl rounded-[2.5rem]" />}
              <button onClick={toggleBot} className={`w-full relative overflow-hidden flex flex-col items-center justify-center gap-3 p-8 rounded-[2.5rem] font-bold text-xl transition-all duration-300 transform active:scale-[0.98] border uppercase tracking-[0.2em] shadow-[0_15px_50px_rgba(0,0,0,0.8)] ${isRunning ? 'bg-gradient-to-br from-[#3a0505] to-[#120000] text-[#ff3333] border-[#ff3333]/80 shadow-[0_0_60px_rgba(255,51,51,0.5)] hover:shadow-[0_0_80px_rgba(255,51,51,0.7)]' : 'bg-gradient-to-br from-[#121216] to-[#0B0B0E] text-[#FFD700] border-[#D4AF37] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)]'}`}>
                {isRunning && <span className="absolute inset-0 border-4 border-[#ff3333]/40 rounded-[2.5rem] animate-pulse pointer-events-none" />}
                <Power className={`w-12 h-12 ${isRunning ? 'animate-pulse text-[#ff3333] drop-shadow-[0_0_10px_rgba(255,51,51,0.8)]' : 'text-[#D4AF37]'}`} />
                {isRunning ? 'HALT ENGINE' : 'ENGAGE ENGINE'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatBox title="Account Balance" value={accountBalance !== null ? `$${accountBalance.toFixed(2)}` : '---'} color="text-white" icon={<Wallet className="w-4 h-4 text-white" />} glow={accountBalance !== null} />
              <StatBox title="Session PnL" value={`$${pnl.toFixed(2)}`} color={pnl >= 0 ? 'text-green-400' : 'text-red-500'} icon={<Wallet className="w-4 h-4 text-green-400" />} />
              <StatBox title="Win Rate" value={`${winRate.toFixed(1)}%`} color="text-[#FFD700]" icon={<TrendingUp className="w-4 h-4 text-[#FFD700]" />} glow={true}/>
              <StatBox title="Active Stake" value={`$${currentStake.toFixed(2)}`} color="text-[#C5A059]" icon={<Target className="w-4 h-4 text-[#C5A059]" />} />
              <StatBox title="Index (100V)" value={liveTick ? liveTick.toFixed(3) : '...'} color={isRunning ? 'text-white' : 'text-slate-600'} icon={<Activity className={`w-4 h-4 ${isRunning ? 'animate-pulse text-[#D4AF37]' : 'text-slate-600'}`} />} glow={isRunning} />
              <StatBox title="Current Signal" value={<span className={latestSignal.includes('No') || latestSignal.includes('Analyzing') ? 'text-sm text-slate-400' : 'text-lg text-[#FFD700]'}>{latestSignal}</span>} color="" icon={<TrendingUp className="w-4 h-4 text-[#3b82f6]" />} glow={!latestSignal.includes('Analyzing')} />
            </div>
            
            <div className={`bg-[rgba(18,18,22,0.9)] backdrop-blur-xl border border-[#D4AF37]/20 rounded-3xl overflow-hidden transition-all duration-500 flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${isTerminalExpanded ? 'h-[500px]' : 'h-64'}`}>
              <div onClick={() => setIsTerminalExpanded(!isTerminalExpanded)} className="flex items-center justify-between p-5 bg-[#121216] border-b border-[#D4AF37]/20 cursor-pointer hover:bg-[#1a1a1f] transition-colors">
                <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-3 text-[#FFD700]"><Activity className="w-4 h-4" />Terminal Output</h2>
                {isTerminalExpanded ? <ChevronDown className="w-5 h-5 text-[#C5A059]" /> : <ChevronUp className="w-5 h-5 text-[#C5A059]" />}
              </div>
              <div className="flex-1 p-5 font-mono text-xs overflow-y-auto flex flex-col gap-3">
                <AnimatePresence>
                  {logs.length === 0 && <div className="h-full flex items-center justify-center text-slate-700 uppercase tracking-widest font-semibold">System Ready. {accountBalance !== null ? `Balance: $${accountBalance.toFixed(2)}. ` : ''}Awaiting Command.</div>}
                  {logs.map((log) => (
                    <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`${log.type === 'info' ? 'text-slate-400' : ''} ${log.type === 'success' ? 'text-green-400 font-bold' : ''} ${log.type === 'error' ? 'text-red-500 font-bold' : ''} ${log.type === 'alert' ? 'text-[#FFD700] font-bold' : ''} ${log.type === 'trade' ? 'text-[#D4AF37]' : ''}`}>
                      <span className="text-slate-600 mr-3">[{log.timestamp}]</span>{log.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-serif text-[#FFD700] tracking-widest border-b border-[#D4AF37]/20 pb-4 flex items-center gap-3"><Settings className="w-6 h-6"/> LOGIC CONFIGURATION</h2>
            
            <div className="bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <label className="block text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-4">Active Strategy Core</label>
              <select value={strategyCore} onChange={e => { setStrategyCore(e.target.value); playTTS("Strategy core selected."); }} className="w-full bg-[#0B0B0E] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-[#FFD700] outline-none focus:border-[#FFD700]">
                <option value="apex_momentum">Apex Momentum Engine (Tick Velocity + Exhaustion)</option>
                <option value="rubber_band">Rubber-Band Spike Reversion (Extreme Over-extension)</option>
                <option value="vietnam_smart_scan">Advanced Vietnam Logic (Deep Market Scan & RSI)</option>
                <option value="low_vol_rsi_bb">Low-Vol RSI-Bollinger Reversal (V10 / 1s Optimized)</option>
              </select>
            </div>
            
            <p className="text-slate-400 text-xs mt-2">
              Note: Base Stake, Target Profit, Stop Loss, and Martingale settings have been securely migrated to the <strong className="text-[#D4AF37]">MM Vault</strong>.
            </p>
            
            <button onClick={handleSaveLogic} className="mt-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/> SAVE LOGIC CONFIGURATION</button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-xl font-serif text-[#FFD700] tracking-widest border-b border-[#D4AF37]/20 pb-4 flex items-center gap-3"><ShieldAlert className="w-6 h-6"/> SECURITY VAULT</h2>
             
             <div className="bg-[rgba(18,18,22,0.85)] border border-red-500/20 rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(220,38,38,0.05)]">
                <h3 className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-6 flex items-center gap-2"><Wallet className="w-4 h-4"/> API Credentials</h3>
                 
                 <div className="flex flex-col gap-6">
                   {/* DEMO TOKEN SECTION */}
                   <div className="bg-black/30 p-4 rounded-xl border border-slate-800">
                     <h4 className="text-slate-300 text-[10px] font-bold uppercase mb-3 flex items-center justify-between">
                        Demo API Token
                        {hasDemoToken && <span className="text-green-500 text-[9px] px-2 py-0.5 bg-green-500/10 rounded-full">SECURE</span>}
                     </h4>
                     {hasDemoToken ? (
                       <div className="flex items-center justify-between mt-2">
                         <p className="text-slate-400 text-xs"><span className="font-mono text-[#D4AF37]">********************</span></p>
                         <button onClick={() => setHasDemoToken(false)} className="text-red-500 font-bold text-[10px] uppercase hover:underline">Overwrite</button>
                       </div>
                     ) : (
                       <input type="password" placeholder="Enter Demo Token" value={derivDemoToken} onChange={e=>setDerivDemoToken(e.target.value)} className="w-full bg-[#0B0B0E] border border-slate-700 rounded-lg px-3 py-2 text-slate-300 outline-none font-mono focus:border-[#D4AF37] text-xs" />
                     )}
                   </div>

                   {/* REAL TOKEN SECTION */}
                   <div className="bg-black/30 p-4 rounded-xl border border-slate-800">
                     <h4 className="text-slate-300 text-[10px] font-bold uppercase mb-3 flex items-center justify-between">
                        Real API Token
                        {hasRealToken && <span className="text-green-500 text-[9px] px-2 py-0.5 bg-green-500/10 rounded-full">SECURE</span>}
                     </h4>
                     {hasRealToken ? (
                       <div className="flex items-center justify-between mt-2">
                         <p className="text-slate-400 text-xs"><span className="font-mono text-[#D4AF37]">********************</span></p>
                         <button onClick={() => setHasRealToken(false)} className="text-red-500 font-bold text-[10px] uppercase hover:underline">Overwrite</button>
                       </div>
                     ) : (
                       <input type="password" placeholder="Enter Real Token" value={derivRealToken} onChange={e=>setDerivRealToken(e.target.value)} className="w-full bg-[#0B0B0E] border border-slate-700 rounded-lg px-3 py-2 text-slate-300 outline-none font-mono focus:border-[#D4AF37] text-xs" />
                     )}
                   </div>

                   {(!hasDemoToken || !hasRealToken) && (
                     <button onClick={handleUpdateDeriv} className="border border-[#D4AF37] text-[#FFD700] font-bold py-3 rounded-xl uppercase tracking-widest text-[10px] hover:bg-[#D4AF37]/10 transition-all w-full mt-2">
                       Update & Encrypt Tokens
                     </button>
                   )}
                 </div>
              </div>

             <div className="bg-[rgba(18,18,22,0.85)] border border-[#3b82f6]/20 rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(59,130,246,0.05)] relative overflow-hidden">
                <h3 className="text-[#3b82f6] text-[10px] uppercase tracking-widest font-bold mb-3 flex items-center gap-2">📱 Telegram Alert Link</h3>
                
                {hasSavedTelegram ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6]">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <p className="text-white font-bold tracking-widest text-sm">TELEGRAM SECURELY LINKED</p>
                    <p className="text-slate-400 text-xs text-center px-4">Your Telegram ID is permanently locked for security. To modify this, please contact support or reset your master password.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-400 text-xs mb-4">Send <span className="font-mono text-white">/start</span> or <span className="font-mono text-white">/myid</span> to <a href="https://t.me/PTM_PRIME_bot" target="_blank" rel="noopener noreferrer" className="text-[#3b82f6] hover:underline font-bold">@PTM_PRIME_bot</a> to get your Chat ID.</p>
                    <div className="flex flex-col gap-4">
                      {!telegramOtpSent ? (
                        <>
                          <input type="text" placeholder="Telegram Chat ID" value={telegramId} onChange={e=>setTelegramId(e.target.value)} className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl px-4 py-3 text-slate-300 outline-none font-mono focus:border-[#3b82f6]" />
                          <button onClick={handleRequestTelegramOtp} className="border border-[#3b82f6] text-[#3b82f6] font-bold py-3 rounded-xl uppercase tracking-widest text-[10px] hover:bg-[#3b82f6]/10 transition-all">Request Verification Code</button>
                        </>
                      ) : (
                        <>
                          <input type="text" placeholder="Enter 6-Digit Telegram OTP" value={telegramOtp} onChange={e=>setTelegramOtp(e.target.value)} className="w-full bg-[#0B0B0E] border border-[#3b82f6] rounded-xl px-4 py-3 text-white outline-none font-mono focus:border-[#3b82f6] text-center tracking-widest" />
                          <button onClick={handleVerifyTelegram} className="bg-gradient-to-r from-[#3b82f6] to-blue-400 text-[#0B0B0E] font-bold py-3 rounded-xl uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">Confirm & Link Telegram</button>
                        </>
                      )}
                    </div>
                  </>
                )}
             </div>

             <div className="bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
               <h3 className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-6">Change Master Password</h3>
               <form onSubmit={changePassword} className="flex flex-col gap-4">
                 <input type="password" placeholder="Current Password" value={curPwd} onChange={e=>setCurPwd(e.target.value)} required className="w-full bg-[#0B0B0E] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-[#FFD700] outline-none focus:border-[#FFD700] font-medium" />
                 <input type="password" placeholder="New Password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} required className="w-full bg-[#0B0B0E] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-[#FFD700] outline-none focus:border-[#FFD700] font-medium" />
                 <input type="password" placeholder="Confirm New Password" value={confPwd} onChange={e=>setConfPwd(e.target.value)} required className="w-full bg-[#0B0B0E] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-[#FFD700] outline-none focus:border-[#FFD700] font-medium" />
                 
                 <button type="submit" className="mt-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">Change Master Password</button>
               </form>
             </div>
          </div>
        )}

         {activeTab === 'money' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-xl font-serif text-[#FFD700] tracking-widest border-b border-[#D4AF37]/20 pb-4 flex items-center gap-3"><Banknote className="w-6 h-6"/> MONEY MANAGEMENT VAULT</h2>
             
             <div className="bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
               <h3 className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-4">Masaniello Active Limits (Live Enforced)</h3>
               <div className="grid grid-cols-2 gap-4 mb-6">
                 <div>
                   <label className="block text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-2">Base Stake ($)</label>
                   <input type="number" value={initialStake} onChange={e => setInitialStake(Number(e.target.value))} className="w-full bg-[#0B0B0E] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-[#FFD700] outline-none focus:border-[#FFD700]" />
                 </div>
                 <div>
                   <label className="block text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-2">Daily Target Profit ($)</label>
                   <input type="number" value={targetProfit} onChange={e => setTargetProfit(Number(e.target.value))} className="w-full bg-[#0B0B0E] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-green-400 outline-none focus:border-green-400" />
                 </div>
                 <div>
                   <label className="block text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-2">Daily Max Loss ($)</label>
                   <input type="number" value={stopLoss} onChange={e => setStopLoss(Number(e.target.value))} className="w-full bg-[#0B0B0E] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-red-500 outline-none focus:border-red-500" />
                 </div>
                 <div>
                   <label className="block text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-2">Recovery Multiplier</label>
                   <input type="number" step="0.1" value={multiplier} onChange={e => setMultiplier(Number(e.target.value))} className="w-full bg-[#0B0B0E] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-[#FFD700] outline-none focus:border-[#FFD700]" />
                 </div>
                  <div className="col-span-1 mt-2">
                    <label className="block text-green-400 text-[10px] uppercase tracking-widest font-bold mb-2">Win Sleep (Sec)</label>
                    <input type="number" value={winCooldown} onChange={e => setWinCooldown(Number(e.target.value))} placeholder="e.g. 2" className="w-full bg-[#0B0B0E] border border-green-500/30 rounded-xl px-4 py-3 text-green-400 outline-none focus:border-green-400" />
                  </div>
                  <div className="col-span-1 mt-2">
                    <label className="block text-red-400 text-[10px] uppercase tracking-widest font-bold mb-2">Loss Sleep (Sec)</label>
                    <input type="number" value={lossCooldown} onChange={e => setLossCooldown(Number(e.target.value))} placeholder="e.g. 30" className="w-full bg-[#0B0B0E] border border-red-500/30 rounded-xl px-4 py-3 text-red-400 outline-none focus:border-red-400" />
                  </div>
                </div>
               
               <button onClick={handleSaveLogic} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold py-3 rounded-xl uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/> LOCK LIMITS & SAVE</button>
             </div>

             <div className="bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
               <h3 className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-4">30-Day Compounding Projection</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 <StatBox title="Starting Balance" value={`$${(accountBalance || 0).toFixed(2)}`} color="text-white" glow={false} />
                 <StatBox title="Daily Expected" value={`$${targetProfit.toFixed(2)}`} color="text-green-400" glow={false} />
                 <StatBox title="Risk Allowed" value={`$${stopLoss.toFixed(2)}`} color="text-red-400" glow={false} />
                 <StatBox title="Projected Month" value={`$${((accountBalance || 0) + (targetProfit * 30)).toFixed(2)}`} color="text-[#FFD700]" glow={true} />
               </div>
               <div className="text-center text-slate-400 text-sm py-8 border border-slate-700/50 rounded-xl bg-black/20">
                 Projection assumes hitting target profit every day. Results may vary.
               </div>
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
               <h2 className="text-xl font-serif text-[#FFD700] tracking-widest flex items-center gap-3"><History className="w-6 h-6"/> TRADE HISTORY</h2>
               <div className="flex flex-col sm:flex-row gap-4 items-end">
                 <div className="flex flex-col gap-1">
                   <label className="text-[9px] text-[#C5A059] font-bold uppercase tracking-widest">Analysis View</label>
                   <select value={historyView} onChange={e => setHistoryView(e.target.value as any)} className="bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] rounded-xl px-3 py-2 text-xs outline-none">
                     <option value="detailed">Detailed Trades (Single Day)</option>
                     <option value="hourly">Hourly Summary (Single Day)</option>
                     <option value="daily">Daily Summary (Single Month)</option>
                     <option value="monthly">Monthly Summary (Single Year)</option>
                     <option value="yearly">Yearly Summary (All Time)</option>
                   </select>
                 </div>
                 {historyView !== 'yearly' && (
                   <div className="flex flex-col gap-1">
                     <label className="text-[9px] text-[#C5A059] font-bold uppercase tracking-widest">Select Context</label>
                     <input 
                       type={historyView === 'monthly' ? 'number' : historyView === 'daily' ? 'month' : 'date'}
                       value={historyView === 'monthly' ? new Date(historyDateContext).getFullYear() : historyView === 'daily' ? historyDateContext.substring(0,7) : historyDateContext}
                       onChange={e => {
                         if(historyView === 'monthly') setHistoryDateContext(`${e.target.value}-01-01`);
                         else if(historyView === 'daily') setHistoryDateContext(`${e.target.value}-01`);
                         else setHistoryDateContext(e.target.value);
                       }}
                       min={historyView === 'monthly' ? "2020" : undefined}
                       max={historyView === 'monthly' ? "2050" : undefined}
                       className="bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] rounded-xl px-3 py-2 text-xs outline-none" 
                     />
                   </div>
                 )}
                 <button onClick={fetchHistory} className="px-4 py-2 h-[34px] border border-[#D4AF37] text-[#FFD700] rounded-xl text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10 flex items-center justify-center">Refresh Data</button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatBox title="Net Profit" value={`${historyProfit >= 0 ? '+' : ''}$${historyProfit.toFixed(2)}`} color={historyProfit >= 0 ? "text-green-400" : "text-red-500"} icon={<Target className="w-4 h-4"/>} glow={historyProfit > 0} />
                <StatBox title="Total Trades" value={historyTotal.toString()} color="text-white" icon={<Activity className="w-4 h-4"/>} />
                <StatBox title="Win Rate" value={`${historyWinRate}%`} color={parseFloat(historyWinRate) > 60 ? "text-[#FFD700]" : "text-slate-300"} icon={<TrendingUp className="w-4 h-4"/>} />
                <div className="bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-2xl p-5 flex items-center gap-4 backdrop-blur-md">
                   <div style={{
                     width: '60px', height: '60px', borderRadius: '50%',
                     background: `conic-gradient(#22c55e 0% ${historyWinRate}%, #ef4444 ${historyWinRate}% 100%)`
                   }} className="shadow-[0_0_15px_rgba(0,0,0,0.5)]"></div>
                   <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-green-400 font-bold tracking-widest uppercase">{historyWins} WINS</span>
                     <span className="text-[10px] text-red-500 font-bold tracking-widest uppercase">{historyLosses} LOSSES</span>
                   </div>
                </div>
             </div>
             
             <div className="bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[600px]">
                 <thead>
                   {historyView === 'detailed' ? (
                     <tr className="border-b border-[#D4AF37]/20 text-[#C5A059] text-[10px] uppercase tracking-widest">
                       <th className="py-4 font-bold">Time</th>
                       <th className="py-4 font-bold">Market</th>
                       <th className="py-4 font-bold">Type</th>
                       <th className="py-4 font-bold text-right">Stake</th>
                       <th className="py-4 font-bold text-right">Profit</th>
                       <th className="py-4 font-bold text-center">Status</th>
                     </tr>
                   ) : (
                     <tr className="border-b border-[#D4AF37]/20 text-[#C5A059] text-[10px] uppercase tracking-widest">
                       <th className="py-4 font-bold">Group / Timeframe</th>
                       <th className="py-4 font-bold text-center">Total Trades</th>
                       <th className="py-4 font-bold text-center">Win Rate</th>
                       <th className="py-4 font-bold text-center">W / L</th>
                       <th className="py-4 font-bold text-right">Net Profit</th>
                     </tr>
                   )}
                 </thead>
                 <tbody className="text-sm font-mono text-slate-300">
                   {processedHistory.data.length === 0 ? (
                     <tr><td colSpan={6} className="py-8 text-center text-slate-500">No data available for the selected view.</td></tr>
                   ) : (
                     historyView === 'detailed' ? (
                       (processedHistory.data as any[]).map((t, i) => (
                         <tr key={i} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                           <td className="py-3">{new Date(t.timestamp + (t.timestamp.endsWith('Z') ? '' : 'Z')).toLocaleTimeString()}</td>
                           <td className="py-3">{t.symbol}</td>
                           <td className={`py-3 font-bold ${t.contract_type === 'CALL' ? 'text-green-400' : 'text-red-400'}`}>{t.contract_type}</td>
                           <td className="py-3 text-right">${t.stake.toFixed(2)}</td>
                           <td className={`py-3 text-right font-bold ${t.profit >= 0 ? 'text-green-400' : 'text-red-500'}`}>{t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}</td>
                           <td className="py-3 text-center">
                             <span className={`px-2 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${t.status === 'WIN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>{t.status}</span>
                           </td>
                         </tr>
                       ))
                     ) : (
                       (processedHistory.data as any[]).map((g, i) => {
                         const rate = g.total > 0 ? ((g.wins / g.total) * 100).toFixed(1) : '0.0';
                         return (
                           <tr key={i} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                             <td className="py-3 text-[#D4AF37] font-bold">{g.label}</td>
                             <td className="py-3 text-center">{g.total}</td>
                             <td className="py-3 text-center font-bold text-slate-400">{rate}%</td>
                             <td className="py-3 text-center">
                               <span className="text-green-400">{g.wins}</span> / <span className="text-red-500">{g.losses}</span>
                             </td>
                             <td className={`py-3 text-right font-bold ${g.profit >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                               {g.profit >= 0 ? '+' : ''}${g.profit.toFixed(2)}
                             </td>
                           </tr>
                         );
                       })
                     )
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </main>

      {/* Upgraded Bottom Navigation */}
      <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
        <div className="max-w-md mx-auto bg-[#121216]/90 backdrop-blur-2xl border border-[#D4AF37]/30 rounded-2xl px-2 py-3 flex justify-around items-center shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
          {[
            { id: 'trade', icon: Activity, label: 'Terminal' },
            { id: 'strategies', icon: Target, label: 'Logic' },
            { id: 'money', icon: Banknote, label: 'MM Vault' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'settings', icon: ShieldAlert, label: 'Vault' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1.5 w-20 py-2 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'text-[#FFD700] bg-[#D4AF37]/10' : 'text-[#C5A059]/50 hover:text-[#C5A059] hover:bg-white/5'}`}>
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : ''}`} />
              <span className="text-[9px] uppercase tracking-widest font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Custom Toast Notifications */}
      <AnimatePresence>
        {toast.message && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.3 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
              toast.type === 'success' ? 'bg-[#0B0B0E]/90 border-[#D4AF37]/40 text-[#FFD700]' : 'bg-[#0B0B0E]/90 border-red-500/40 text-red-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" /> : <ShieldAlert className="w-5 h-5 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
            <span className="font-bold tracking-wider text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
