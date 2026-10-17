"use client";
import { API_URL, WS_URL } from '../config';


import { useState, useEffect, useMemo } from "react";
import { Activity, ShieldAlert, Target, TrendingUp, Wallet, Power, Settings, LogOut, ChevronDown, ChevronUp, CheckCircle2, History, Banknote, Cpu, Flame, Zap, RefreshCw, Trash2, Sliders, Crown, Sparkles, Bot, Lock, Clock, Calculator, ShieldCheck, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'trade' | 'strategies' | 'settings' | 'money' | 'history' | 'analytics'>('trade');
  
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
  const [initialStake, setInitialStake] = useState(0.35);
  const [targetProfit, setTargetProfit] = useState(10);
  const [stopLoss, setStopLoss] = useState(60);
  const [multiplier, setMultiplier] = useState(2.25);
  const [cooldownPeriod, setCooldownPeriod] = useState(0);
  const [winCooldown, setWinCooldown] = useState(0);
  const [lossCooldown, setLossCooldown] = useState(0);
  const [maxMartingaleSteps, setMaxMartingaleSteps] = useState(3);
  const [circuitBreakerPause, setCircuitBreakerPause] = useState(15);
  const [dcaPayoutRate, setDcaPayoutRate] = useState<number>(0.92);

    
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

  // Dynamic DCA / Martingale Recovery Matrix Calculation
  const dcaTableData = useMemo(() => {
    const baseStake = Math.max(0.35, Number(initialStake) || 0.35);
    const mult = Math.max(1.0, Number(multiplier) || 2.25);
    const totalSteps = Math.min(15, Math.max(1, Number(maxMartingaleSteps) || 1));
    const payout = Number(dcaPayoutRate) || 0.92;
    const balance = Number(accountBalance) || 10000;
    const userStopLoss = Number(stopLoss) || 50;

    const steps = [];
    let accumulatedLoss = 0;
    let prevStake = baseStake;

    for (let i = 1; i <= totalSteps; i++) {
      let stepStake = baseStake;
      if (i === 1) {
        stepStake = baseStake;
      } else {
        const targetProfitVal = baseStake * payout;
        const requiredStake = (accumulatedLoss + targetProfitVal) / payout;
        const standardStake = prevStake * mult;
        stepStake = Math.round(Math.max(standardStake, requiredStake) * 100) / 100;
      }

      const totalSpent = Math.round((accumulatedLoss + stepStake) * 100) / 100;
      const grossWin = Math.round((stepStake * payout) * 100) / 100;
      const grossPayout = Math.round((stepStake + grossWin) * 100) / 100;
      const netProfit = Math.round((grossWin - accumulatedLoss) * 100) / 100;
      const portfolioRiskPct = balance > 0 ? ((totalSpent / balance) * 100) : 0;
      const isCircuitBreaker = i === totalSteps;

      steps.push({
        step: i,
        label: i === 1 ? "Step 1 (Base Entry)" : (isCircuitBreaker ? `Step ${i} (Circuit Breaker Max)` : `Step ${i} (DCA Recovery ${i - 1})`),
        stake: stepStake,
        cumulativeSpent: totalSpent,
        grossWin,
        grossPayout,
        netProfit,
        portfolioRiskPct,
        isCircuitBreaker
      });

      prevStake = stepStake;
      accumulatedLoss = totalSpent;
    }

    const totalCycleCapital = steps.length > 0 ? steps[steps.length - 1].cumulativeSpent : 0;
    const isWithinDailyStopLoss = totalCycleCapital <= userStopLoss;
    const bufferRemaining = Math.round((userStopLoss - totalCycleCapital) * 100) / 100;
    const maxNetProfit = steps.length > 0 ? steps[steps.length - 1].netProfit : 0;
    const cycleRiskPercent = balance > 0 ? ((totalCycleCapital / balance) * 100) : 0;

    return {
      steps,
      totalCycleCapital,
      isWithinDailyStopLoss,
      bufferRemaining,
      maxNetProfit,
      cycleRiskPercent
    };
  }, [initialStake, multiplier, maxMartingaleSteps, dcaPayoutRate, accountBalance, stopLoss]);

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
  const [strategyCore, setStrategyCore] = useState("low_vol_rsi_bb");
  const [activeSymbol, setActiveSymbol] = useState("R_25");
  const [tickDuration, setTickDuration] = useState(5);
  const [accountType, setAccountType] = useState("demo");

  // Strategy Matrix Lab State
  const [matrixData, setMatrixData] = useState<any>(null);
  const [matrixFilterStrategy, setMatrixFilterStrategy] = useState<string>("all");
  const [matrixFilterSymbol, setMatrixFilterSymbol] = useState<string>("all");
  const [matrixSortBy, setMatrixSortBy] = useState<'ai_score' | 'win_rate' | 'loss_streak' | 'trades' | 'profit'>('ai_score');
  const [isFetchingMatrix, setIsFetchingMatrix] = useState(false);
  const [evaluationTicks, setEvaluationTicks] = useState<number>(0);
  const [matrixTimeframe, setMatrixTimeframe] = useState<'all' | '5m' | '15m' | '1h'>('all');
  const [isSettingTicks, setIsSettingTicks] = useState(false);
  const [aiAutoPilot, setAiAutoPilot] = useState<boolean>(false);
  const [isConsultingAi, setIsConsultingAi] = useState<boolean>(false);

  const handleSetEvaluationTicks = async (ticks: number) => {
    try {
      setIsSettingTicks(true);
      const res = await fetch(`${API_URL}/api/v1/analytics/set-ticks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include",
        body: JSON.stringify({ ticks })
      });
      if (res.ok) {
        setEvaluationTicks(ticks);
        showToast(ticks === 0 ? "Forward Evaluation switched to All Horizons (1-10 Ticks)!" : `Forward Evaluation switched to ${ticks} Ticks!`, "success");
        playTTS(ticks === 0 ? "Evaluation horizon set to all horizons." : `Evaluation horizon set to ${ticks} ticks.`);
        fetchMatrixData();
      }
    } catch(e) {
      showToast("Failed to change evaluation ticks", "error");
    } finally {
      setIsSettingTicks(false);
    }
  };

  const handleResetLab = async () => {
    if (!confirm("Are you sure you want to reset all simulation stats back to 0?")) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/analytics/reset`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include"
      });
      if (res.ok) {
        showToast("Matrix Lab reset to zero! Gathering fresh live data...", "success");
        playTTS("Simulation matrix reset to zero.");
        fetchMatrixData();
      }
    } catch(e) {
      showToast("Failed to reset Matrix Lab", "error");
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to delete all past trade history records from the database?")) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/analytics/clear-history`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include"
      });
      if (res.ok) {
        showToast("All old trade history wiped cleanly from database!", "success");
        playTTS("Trade history cleared.");
        fetchHistory();
      }
    } catch(e) {
      showToast("Failed to clear trade history", "error");
    }
  };

  const fetchMatrixData = async (targetTick?: number, targetTimeframe?: string) => {
    try {
      setIsFetchingMatrix(true);
      const t = targetTick !== undefined ? targetTick : evaluationTicks;
      const tf = targetTimeframe !== undefined ? targetTimeframe : matrixTimeframe;
      const res = await fetch(`${API_URL}/api/v1/analytics/matrix?tick=${t}&timeframe=${tf}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (res.ok) {
        const data = await res.json();
        setMatrixData(data);
      }
    } catch (e) {
    } finally {
      setIsFetchingMatrix(false);
    }
  };

  const handleSelectTick = (ticks: number) => {
    setEvaluationTicks(ticks);
    fetchMatrixData(ticks, matrixTimeframe);
    fetch(`${API_URL}/api/v1/analytics/set-ticks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      credentials: "include",
      body: JSON.stringify({ ticks })
    }).catch(() => {});
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchMatrixData(evaluationTicks, matrixTimeframe);
      const interval = setInterval(() => fetchMatrixData(evaluationTicks, matrixTimeframe), 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, evaluationTicks, matrixTimeframe]);

  const handleToggleAiAutoPilot = async (enabled: boolean) => {
    try {
      setAiAutoPilot(enabled);
      const res = await fetch(`${API_URL}/api/v1/analytics/ai-autopilot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include",
        body: JSON.stringify({ enabled })
      });
      if (res.ok) {
        const resData = await res.json();
        if (enabled && resData.edge) {
          if (resData.edge.strategy) setStrategyCore(resData.edge.strategy);
          if (resData.edge.symbol) setActiveSymbol(resData.edge.symbol);
          if (resData.edge.ticks) setTickDuration(resData.edge.ticks);
          if (resData.edge.martingale) setMaxMartingaleSteps(resData.edge.martingale);
        }
        showToast(enabled ? "🤖 AI Autonomous Trading Engaged! Controls locked." : "AI Autonomous Trading Disabled (Manual Mode)", "success");
        playTTS(enabled ? "A I Autonomous Trading activated. Bot is now auto-executing the top live edge. Manual controls locked." : "A I Autonomous mode disabled. Manual mode active.");
      } else {
        setAiAutoPilot(!enabled);
        showToast("Failed to update AI Auto-Pilot status", "error");
      }
    } catch(e) {
      setAiAutoPilot(!enabled);
      showToast("Error toggling AI Auto-Pilot", "error");
    }
  };

  const handleConsultNeuralAi = async () => {
    try {
      setIsConsultingAi(true);
      showToast("Consulting PTM Quantum AI Brain across all 64 setups...", "success");
      playTTS("Consulting Quantum AI Brain for best live edge.");
      const res = await fetch(`${API_URL}/api/v1/analytics/ai-consult?tick=${evaluationTicks}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ai_analysis) {
          setMatrixData((prev: any) => ({
            ...prev,
            ai_analysis: data.ai_analysis,
            summary: {
              ...(prev?.summary || {}),
              ai_edge: data.ai_analysis
            }
          }));
          showToast(`🤖 PTM Neural AI verified: ${data.ai_analysis.best_strategy_name} (${data.ai_analysis.best_symbol})!`, "success");
          playTTS(`Neural AI selected ${data.ai_analysis.best_strategy_name} on ${data.ai_analysis.best_symbol}`);
        }
      } else {
        showToast("Neural AI consultation busy. Retrying failover pool...", "error");
      }
    } catch(e) {
      showToast("Failed to consult Neural AI", "error");
    } finally {
      setIsConsultingAi(false);
    }
  };

  const handleDeployLabStrategy = async (strategyCoreToDeploy: string, symbolToDeploy: string, recommendedMartingale: number, optimalTick?: number) => {
    try {
      const deployTick = optimalTick || (evaluationTicks === 0 ? 5 : evaluationTicks);
      setStrategyCore(strategyCoreToDeploy);
      setActiveSymbol(symbolToDeploy);
      setTickDuration(deployTick);

      const res = await fetch(`${API_URL}/api/v1/analytics/deploy`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          strategy_core: strategyCoreToDeploy,
          active_symbol: symbolToDeploy,
          tick_duration: deployTick
        })
      });
      if (res.ok) {
        showToast(`Deployed ${strategyCoreToDeploy} on ${symbolToDeploy} (${deployTick} Ticks)!`, "success");
        playTTS(`Strategy deployed. Configured for ${symbolToDeploy} at ${deployTick} ticks.`);
      } else {
        showToast("Failed to deploy strategy to live bot.", "error");
      }
    } catch (e) {
      showToast("API unreachable", "error");
    }
  };

  const filteredLeaderboard = (matrixData?.leaderboard || [])
    .filter((item: any) => {
      if (matrixFilterStrategy !== "all" && item.strategy !== matrixFilterStrategy) return false;
      if (matrixFilterSymbol !== "all" && item.symbol !== matrixFilterSymbol) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      if (matrixSortBy === 'ai_score') return (b.ai_score || 0) - (a.ai_score || 0);
      if (matrixSortBy === 'win_rate') return b.win_rate - a.win_rate;
      if (matrixSortBy === 'loss_streak') return a.max_loss_streak - b.max_loss_streak;
      if (matrixSortBy === 'trades') return b.total_trades - a.total_trades;
      if (matrixSortBy === 'profit') return (b.simulated_pnl || 0) - (a.simulated_pnl || 0);
      return 0;
    });

  const aiAnalysis = matrixData?.ai_analysis || matrixData?.summary?.ai_edge;
  const bestSetup = matrixData?.summary?.best_setup || (filteredLeaderboard.length > 0 ? filteredLeaderboard[0] : null);
  const currentBestEdge = aiAnalysis && aiAnalysis.best_strategy ? {
    strategy: aiAnalysis.best_strategy,
    strategy_name: aiAnalysis.best_strategy_name || bestSetup?.strategy_name,
    symbol: aiAnalysis.best_symbol,
    symbol_name: aiAnalysis.best_symbol_name || bestSetup?.symbol_name,
    best_tick: aiAnalysis.optimal_ticks || bestSetup?.tick || bestSetup?.best_tick || (evaluationTicks === 0 ? 5 : evaluationTicks),
    recommended_martingale: aiAnalysis.safe_martingale_steps || bestSetup?.recommended_martingale || 2,
    ai_score: aiAnalysis.ai_confidence_score || bestSetup?.ai_score || 75.0,
    market_regime: aiAnalysis.market_regime || "Statistical Edge",
    reasoning: aiAnalysis.reasoning || "Evaluated across win rate consistency, verified sample size, minimal loss streaks, and active signal momentum.",
    ai_model: aiAnalysis.ai_model || "PTM Neural Quantum AI",
    win_rate: bestSetup?.win_rate || 0,
    wins: bestSetup?.wins || 0,
    losses: bestSetup?.losses || 0,
    loss_streaks_formatted: bestSetup?.loss_streaks_formatted || "1L(1x)",
    win_streaks_formatted: bestSetup?.win_streaks_formatted || "1W(1x)",
    loss_streak_dist: bestSetup?.loss_streak_dist || [],
    win_streak_dist: bestSetup?.win_streak_dist || [],
    max_loss_streak: bestSetup?.max_loss_streak || 0,
    best_tick_win_rate: bestSetup?.best_tick_win_rate || bestSetup?.win_rate || 0,
    total_trades: bestSetup?.total_trades || 0
  } : bestSetup;

  // Dynamically synchronize active strategy parameters to Current Best Live Edge when AI Auto-Pilot is engaged
  useEffect(() => {
    if (aiAutoPilot && currentBestEdge) {
      const targetStrat = currentBestEdge.strategy === 'apex' ? 'apex_momentum' : currentBestEdge.strategy;
      if (targetStrat && targetStrat !== strategyCore) {
        setStrategyCore(targetStrat);
      }
      if (currentBestEdge.symbol && currentBestEdge.symbol !== activeSymbol) {
        setActiveSymbol(currentBestEdge.symbol);
      }
      const targetTicks = currentBestEdge.best_tick || currentBestEdge.optimal_ticks;
      if (targetTicks && targetTicks !== tickDuration) {
        setTickDuration(targetTicks);
      }
    }
  }, [aiAutoPilot, currentBestEdge]);

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
    // Instant cache hydration from localStorage to prevent any reset flicker
    try {
      const cached = localStorage.getItem("ptm_logic_settings");
      if (cached) {
        const c = JSON.parse(cached);
        if (c.active_strategy) setStrategy(c.active_strategy);
        if (c.strategy_core) setStrategyCore(c.strategy_core);
        if (c.active_symbol) setActiveSymbol(c.active_symbol);
        if (c.tick_duration !== undefined) setTickDuration(c.tick_duration);
        if (c.stake_amount !== undefined) {
          setInitialStake(c.stake_amount);
          setCurrentStake(c.stake_amount);
        }
        if (c.take_profit !== undefined) setTargetProfit(c.take_profit);
        if (c.stop_loss !== undefined) setStopLoss(c.stop_loss);
        if (c.martingale_multiplier !== undefined) setMultiplier(c.martingale_multiplier);
        if (c.cooldown_period !== undefined) setCooldownPeriod(c.cooldown_period);
        if (c.win_cooldown !== undefined) setWinCooldown(c.win_cooldown);
        if (c.loss_cooldown !== undefined) setLossCooldown(c.loss_cooldown);
        if (c.max_martingale_steps !== undefined && c.max_martingale_steps !== null) setMaxMartingaleSteps(Number(c.max_martingale_steps));
        if (c.circuit_breaker_pause !== undefined && c.circuit_breaker_pause !== null) setCircuitBreakerPause(Number(c.circuit_breaker_pause));
      }
    } catch (e) {}

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
            if (data.logic.active_strategy) setStrategy(data.logic.active_strategy);
            if (data.logic.strategy_core) setStrategyCore(data.logic.strategy_core);
            if (data.logic.active_symbol) setActiveSymbol(data.logic.active_symbol);
            if (data.logic.tick_duration !== undefined) setTickDuration(data.logic.tick_duration);
            if (data.logic.stake_amount !== undefined) {
              setInitialStake(data.logic.stake_amount);
              setCurrentStake(data.logic.stake_amount);
            }
            if (data.logic.take_profit !== undefined) setTargetProfit(data.logic.take_profit);
            if (data.logic.stop_loss !== undefined) setStopLoss(data.logic.stop_loss);
            if (data.logic.martingale_multiplier !== undefined) setMultiplier(data.logic.martingale_multiplier);
            if (data.logic.cooldown_period !== undefined) setCooldownPeriod(data.logic.cooldown_period || 0);
            if (data.logic.win_cooldown !== undefined) setWinCooldown(data.logic.win_cooldown || 0);
            if (data.logic.loss_cooldown !== undefined) setLossCooldown(data.logic.loss_cooldown || 0);
            if (data.logic.max_martingale_steps !== undefined && data.logic.max_martingale_steps !== null) setMaxMartingaleSteps(Number(data.logic.max_martingale_steps));
            if (data.logic.circuit_breaker_pause !== undefined && data.logic.circuit_breaker_pause !== null) setCircuitBreakerPause(Number(data.logic.circuit_breaker_pause));
            if (data.logic.ai_auto_pilot !== undefined) {
              const isAuto = Boolean(data.logic.ai_auto_pilot);
              setAiAutoPilot(isAuto);
              if (isAuto) {
                fetchMatrixData();
              }
            }

            // Persist authoritative database settings to local cache
            localStorage.setItem("ptm_logic_settings", JSON.stringify(data.logic));
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
      const payload = {
        active_strategy: strategy,
        strategy_core: strategyCore,
        active_symbol: activeSymbol,
        tick_duration: tickDuration,
        stake_amount: initialStake,
        take_profit: targetProfit,
        stop_loss: stopLoss,
        martingale_multiplier: multiplier,
        cooldown_period: cooldownPeriod,
        win_cooldown: winCooldown,
        loss_cooldown: lossCooldown,
        max_martingale_steps: Number(maxMartingaleSteps) >= 0 ? Number(maxMartingaleSteps) : 0,
        circuit_breaker_pause: Number(circuitBreakerPause) >= 0 ? Number(circuitBreakerPause) : 0,
        ai_auto_pilot: aiAutoPilot
      };
      localStorage.setItem("ptm_logic_settings", JSON.stringify(payload));
      const res = await fetch(`${API_URL}/api/v1/users/settings/logic`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(payload)
      });
      if (res.ok) { 
        showToast("Settings locked & saved to database!", "success"); 
        playTTS("Money management logic securely locked and saved."); 
      }
      else { 
        showToast("Failed to save logic.", "error"); 
        playTTS("Failed to save configuration."); 
      }
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
      if (data.type === 'ai_autopilot_sync') {
        if (data.strategy_core) setStrategyCore(data.strategy_core);
        if (data.active_symbol) setActiveSymbol(data.active_symbol);
        if (data.tick_duration) setTickDuration(data.tick_duration);
        // Note: maxMartingaleSteps is user's personal MM risk limit and is NEVER overwritten by AI
        showToast(data.message || `AI Auto-Pilot adapted edge to ${data.strategy_name || data.strategy_core} on ${data.active_symbol}!`, "success");
        if (voiceEnabled) {
          playTTS(`AI Auto-Pilot adapted edge to ${data.strategy_name || data.strategy_core} at ${data.tick_duration} ticks.`);
        }
      }
      if (data.type === 'tick') {
        setLiveTick(data.value);
        if (data.balance !== undefined && data.balance !== 0) setAccountBalance(data.balance);
      }
      if (data.type === 'status_update') {
        if (data.pnl !== undefined) setPnl(data.pnl);
        if (data.win_rate !== undefined) setWinRate(data.win_rate);
        if (data.current_stake !== undefined) setCurrentStake(data.current_stake);
        if (data.latest_signal !== undefined) setLatestSignal(data.latest_signal);
        if (aiAutoPilot && data.strategy_core) setStrategyCore(data.strategy_core);
        if (aiAutoPilot && data.active_symbol) setActiveSymbol(data.active_symbol);
        if (aiAutoPilot && data.tick_duration) setTickDuration(data.tick_duration);
      }
      if (data.type === 'trade_result') {
        setPnl(p => p + data.profit);
        if (data.current_stake !== undefined) setCurrentStake(data.current_stake);
        if (data.latest_signal !== undefined) setLatestSignal(data.latest_signal);
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
      if (data.type === 'log' || data.type === 'alert' || data.type === 'trade_proposal' || data.type === 'account_info' || data.type === 'status') {
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
      if (!isRunning) {
        localStorage.setItem("ptm_logic_settings", JSON.stringify({
          active_strategy: strategy,
          strategy_core: aiAutoPilot && currentBestEdge?.strategy ? (currentBestEdge.strategy === 'apex' ? 'apex_momentum' : currentBestEdge.strategy) : strategyCore,
          active_symbol: aiAutoPilot && currentBestEdge?.symbol ? currentBestEdge.symbol : activeSymbol,
          tick_duration: aiAutoPilot && currentBestEdge?.best_tick ? currentBestEdge.best_tick : tickDuration,
          stake_amount: initialStake,
          take_profit: targetProfit,
          stop_loss: stopLoss,
          martingale_multiplier: multiplier,
          cooldown_period: cooldownPeriod,
          win_cooldown: winCooldown,
          loss_cooldown: lossCooldown,
          max_martingale_steps: maxMartingaleSteps,
          circuit_breaker_pause: circuitBreakerPause
        }));
      }
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
          active_symbol: activeSymbol,
          tick_duration: tickDuration,
          max_martingale_steps: maxMartingaleSteps,
          circuit_breaker_pause: circuitBreakerPause,
          account_type: accountType,
          ai_auto_pilot: aiAutoPilot
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
              <StatBox title={`Index (${activeSymbol.replace('1HZ', '').replace('V', 'V(1s)')})`} value={liveTick ? liveTick.toFixed(3) : '...'} color={isRunning ? 'text-white' : 'text-slate-600'} icon={<Activity className={`w-4 h-4 ${isRunning ? 'animate-pulse text-[#D4AF37]' : 'text-slate-600'}`} />} glow={isRunning} />
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
            
            {/* AI Autonomous Trading Engine (Auto-Pilot) Card */}
            <div className={`p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
              aiAutoPilot 
                ? 'bg-gradient-to-r from-emerald-950/40 via-[#121216] to-[#D4AF37]/10 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                : 'bg-[rgba(18,18,22,0.85)] border-[#D4AF37]/25 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            }`}>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                     <div className={`p-3 rounded-2xl shrink-0 transition-colors ${
                       aiAutoPilot 
                         ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.6)]' 
                         : 'bg-black/50 border border-slate-700 text-slate-400'
                     }`}>
                        <Cpu className="w-6 h-6 animate-pulse" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 flex-wrap">
                           <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                             🤖 AI Autonomous Trading Engine (Auto-Pilot)
                           </h3>
                           <span className={`text-[9px] font-sans font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                             aiAutoPilot 
                               ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                               : 'bg-slate-800 text-slate-400 border-slate-700'
                           }`}>
                              {aiAutoPilot ? 'LIVE AUTONOMOUS ACTIVE' : 'MANUAL MODE'}
                           </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-2xl">
                          When enabled, PTM Neural AI Brain continuously evaluates real-time market regimes across all 64 setups and automatically adapts the bot's strategy, symbol, tick duration, and safe martingale steps for maximum statistical win-rate.
                        </p>
                        {aiAutoPilot && (
                           <div className="mt-3 flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl w-fit">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span>Auto-syncing to PTM Neural AI's Current Best Live Edge</span>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                     <span className="text-xs font-bold font-mono uppercase text-[#C5A059]">
                       {aiAutoPilot ? 'AI Active' : 'Manual'}
                     </span>
                     <button
                        onClick={() => handleToggleAiAutoPilot(!aiAutoPilot)}
                        className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 border ${
                           aiAutoPilot 
                             ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                             : 'bg-slate-800 border-slate-700'
                        }`}
                        title="Toggle AI Autonomous Auto-Pilot"
                     >
                        <motion.div 
                           className="bg-white w-6 h-6 rounded-full shadow-md"
                           animate={{ x: aiAutoPilot ? 24 : 0 }}
                           transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                     </button>
                  </div>
               </div>
            </div>
            
            {aiAutoPilot && (
               <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center gap-3 backdrop-blur-md animate-in fade-in">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Lock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                       Manual Controls Locked by AI Autonomous Auto-Pilot
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                       The live trading engine is autonomously executing the AI Brain's top statistical edge. Strategy, Market, and Ticks dynamically adapt in real-time. Toggle Auto-Pilot OFF above if you wish to configure manually.
                    </p>
                  </div>
               </div>
            )}

            <div className={`p-6 rounded-3xl backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all ${
               aiAutoPilot ? 'bg-emerald-950/20 border border-emerald-500/30' : 'bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)]'
            }`}>
              <div className="flex items-center justify-between mb-4">
                 <label className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold">Active Strategy Core</label>
                 {aiAutoPilot && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                       <Lock className="w-2.5 h-2.5"/> AI Controlled
                    </span>
                 )}
              </div>
              <select 
                disabled={aiAutoPilot}
                value={aiAutoPilot && currentBestEdge?.strategy ? (currentBestEdge.strategy === 'apex' ? 'apex_momentum' : currentBestEdge.strategy) : strategyCore} 
                onChange={e => { setStrategyCore(e.target.value); playTTS("Strategy core selected."); }} 
                className={`w-full rounded-xl px-4 py-3 outline-none transition-all ${
                   aiAutoPilot 
                     ? 'bg-black/50 border border-emerald-500/30 text-emerald-400 font-mono text-xs cursor-not-allowed opacity-80' 
                     : 'bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] focus:border-[#FFD700] cursor-pointer'
                }`}
              >
                <option value="trend_momentum_rider">Directional Trend Surge (Multi-Harmonic Flow Alignment)</option>
                <option value="apex_momentum">Apex Kinetic Impulse (High-Frequency Velocity Physics)</option>
                <option value="rubber_band">Rubber-Band Elastic Scalp (High-Sigma Mean Reversion)</option>
                <option value="vietnam_smart_scan">Institutional Trend Matrix (Multi-Factor Liquidity Scan)</option>
                <option value="low_vol_rsi_bb">Low-Vol Tactical Reversal (Statistical Envelope Squeeze)</option>
                <option value="pure_rsi_14">Harmonic Boundary Oscillator (Multi-Phase Boundary Flow)</option>
                <option value="macd_kinetic_impulse">Kinetic Momentum Pulse (Multi-Frequency Acceleration)</option>
                <option value="heikin_ashi_pulse">Synthetic Micro-Wave Scalp (Noise-Filtered Wave Continuation)</option>
                <option value="breakout_box_scalper">Dynamic Breakout Scalper (Liquidity Compression Expansion)</option>
                <option value="contrarian_liquidity_fade">Contrarian Liquidity Fade (False Breakout Absorption)</option>
                <option value="quantum_tick_velocity">Quantum Tick Velocity (High-Entropy Micro Burst)</option>
                <option value="defensive_standby">🛡️ Defensive Capital Preservation (Tactical Sideline Standby)</option>
              </select>
            </div>

            <div className={`p-6 rounded-3xl backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] mt-4 transition-all ${
               aiAutoPilot ? 'bg-emerald-950/20 border border-emerald-500/30' : 'bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)]'
            }`}>
              <div className="flex items-center justify-between mb-4">
                 <label className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold">Target Volatility Index (Market)</label>
                 {aiAutoPilot && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                       <Lock className="w-2.5 h-2.5"/> AI Controlled
                    </span>
                 )}
              </div>
              <select 
                disabled={aiAutoPilot}
                value={aiAutoPilot && currentBestEdge?.symbol ? currentBestEdge.symbol : activeSymbol} 
                onChange={e => { setActiveSymbol(e.target.value); playTTS("Target market selected."); }} 
                className={`w-full rounded-xl px-4 py-3 outline-none transition-all ${
                   aiAutoPilot 
                     ? 'bg-black/50 border border-emerald-500/30 text-emerald-400 font-mono text-xs cursor-not-allowed opacity-80' 
                     : 'bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] focus:border-[#FFD700] cursor-pointer'
                }`}
              >
                <option value="1HZ10V">Volatility 10 (1s) Index (Low Volatility)</option>
                <option value="1HZ25V">Volatility 25 (1s) Index</option>
                <option value="1HZ50V">Volatility 50 (1s) Index</option>
                <option value="1HZ75V">Volatility 75 (1s) Index</option>
                <option value="1HZ100V">Volatility 100 (1s) Index (High Volatility)</option>
                <option value="R_10">Volatility 10 Index</option>
                <option value="R_25">Volatility 25 Index</option>
                <option value="R_50">Volatility 50 Index</option>
                <option value="R_75">Volatility 75 Index</option>
                <option value="R_100">Volatility 100 Index</option>
              </select>
            </div>

            <div className={`p-6 rounded-3xl backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] mt-4 transition-all ${
               aiAutoPilot ? 'bg-emerald-950/20 border border-emerald-500/30' : 'bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)]'
            }`}>
              <div className="flex items-center justify-between mb-4">
                 <label className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold">Trade Duration (Ticks)</label>
                 {aiAutoPilot && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                       <Lock className="w-2.5 h-2.5"/> AI Controlled
                    </span>
                 )}
              </div>
              <select 
                disabled={aiAutoPilot}
                value={aiAutoPilot && currentBestEdge?.best_tick ? currentBestEdge.best_tick : tickDuration} 
                onChange={e => { setTickDuration(Number(e.target.value)); playTTS("Trade duration updated."); }} 
                className={`w-full rounded-xl px-4 py-3 outline-none transition-all ${
                   aiAutoPilot 
                     ? 'bg-black/50 border border-emerald-500/30 text-emerald-400 font-mono text-xs cursor-not-allowed opacity-80' 
                     : 'bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] focus:border-[#FFD700] cursor-pointer'
                }`}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1} Tick{i+1 !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            
            <p className="text-slate-400 text-xs mt-2">
              Note: Base Stake, Target Profit, Stop Loss, and Martingale settings have been securely migrated to the <strong className="text-[#D4AF37]">MM Vault</strong>.
            </p>
            
            <button 
              onClick={handleSaveLogic} 
              disabled={aiAutoPilot}
              className={`mt-4 font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                 aiAutoPilot 
                   ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60' 
                   : 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer'
              }`}
            >
              {aiAutoPilot ? <Lock className="w-4 h-4"/> : <CheckCircle2 className="w-4 h-4"/>} 
              {aiAutoPilot ? 'LOCKED BY AI AUTONOMOUS AUTO-PILOT' : 'SAVE LOGIC CONFIGURATION'}
            </button>
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

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-1">
                    <label className="block text-red-400 text-[10px] uppercase tracking-widest font-bold mb-2">Max Losses (Circuit Breaker)</label>
                    <input type="number" min="0" value={maxMartingaleSteps} onChange={e => setMaxMartingaleSteps(Number(e.target.value))} placeholder="0 (flat stake) or 1-10" className="w-full bg-[#0B0B0E] border border-red-500/30 rounded-xl px-4 py-3 text-red-400 outline-none focus:border-red-400 font-mono" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-2">Pause Duration (Mins)</label>
                    <input type="number" min="0" value={circuitBreakerPause} onChange={e => setCircuitBreakerPause(Number(e.target.value))} placeholder="0 (no pause) or minutes" className="w-full bg-[#0B0B0E] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-[#FFD700] outline-none focus:border-[#FFD700] font-mono" />
                  </div>
                </div>
               
               <button onClick={handleSaveLogic} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] font-bold py-3 rounded-xl uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/> LOCK LIMITS & SAVE</button>
             </div>

              {/* DCA RECOVERY MATRIX & EXPOSURE CALCULATOR */}
              <div className="bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#D4AF37]/20 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-[#FFD700]" />
                      <h3 className="text-sm md:text-base font-serif text-[#FFD700] uppercase tracking-widest font-bold">
                        Dynamic DCA & Martingale Exposure Matrix
                      </h3>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                      Real-time mathematical breakdown of capital requirements, broker fees, and net recovery yields
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-bold">Broker Payout:</span>
                    <div className="flex bg-[#0B0B0E] p-1 rounded-xl border border-[#D4AF37]/30">
                      {[0.90, 0.92, 0.95].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setDcaPayoutRate(rate)}
                          className={`px-3 py-1 text-[11px] font-mono rounded-lg transition-all ${
                            dcaPayoutRate === rate
                              ? "bg-[#D4AF37] text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {(rate * 100).toFixed(0)}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4 Stat Pillars */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#0B0B0E]/80 border border-[#D4AF37]/20 rounded-2xl p-4">
                    <div className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold mb-1">Max DCA Cycle Exposure</div>
                    <div className="text-lg md:text-xl font-mono font-bold text-red-400">${dcaTableData.totalCycleCapital.toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500 mt-1">Full sequence capital required</div>
                  </div>

                  <div className="bg-[#0B0B0E]/80 border border-[#D4AF37]/20 rounded-2xl p-4">
                    <div className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold mb-1">Net Recovery Profit</div>
                    <div className="text-lg md:text-xl font-mono font-bold text-emerald-400">+${dcaTableData.maxNetProfit.toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500 mt-1">Net win on final step recovery</div>
                  </div>

                  <div className="bg-[#0B0B0E]/80 border border-[#D4AF37]/20 rounded-2xl p-4">
                    <div className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold mb-1">Portfolio Risk Ratio</div>
                    <div className="text-lg md:text-xl font-mono font-bold text-[#FFD700]">{dcaTableData.cycleRiskPercent.toFixed(2)}%</div>
                    <div className="text-[9px] text-slate-500 mt-1">Of total account balance</div>
                  </div>

                  <div className="bg-[#0B0B0E]/80 border border-[#D4AF37]/20 rounded-2xl p-4">
                    <div className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold mb-1">Stop-Loss Alignment</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {dcaTableData.isWithinDailyStopLoss ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs md:text-sm font-bold text-emerald-400 uppercase tracking-wider">Safe Buffer</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-xs md:text-sm font-bold text-amber-400 uppercase tracking-wider">Exceeds Limit</span>
                        </>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1">
                      {dcaTableData.isWithinDailyStopLoss 
                        ? `+$${dcaTableData.bufferRemaining.toFixed(2)} daily cushion` 
                        : `Exceeds daily SL by $${Math.abs(dcaTableData.bufferRemaining).toFixed(2)}`}
                    </div>
                  </div>
                </div>

                {/* DCA Sequence Table */}
                <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0E]/60 mb-6">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20 bg-[#0B0B0E] text-[10px] text-[#C5A059] uppercase tracking-wider font-sans">
                        <th className="py-3 px-4">DCA Step</th>
                        <th className="py-3 px-4 text-right">Step Stake ($)</th>
                        <th className="py-3 px-4 text-right">Total Spent ($)</th>
                        <th className="py-3 px-4 text-right">Gross Return ($)</th>
                        <th className="py-3 px-4 text-right">Net Recovery ($)</th>
                        <th className="py-3 px-4 text-right">Balance Risk (%)</th>
                        <th className="py-3 px-4 text-center">Protocol Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4AF37]/10">
                      {dcaTableData.steps.map((row) => (
                        <tr 
                          key={row.step} 
                          className={`hover:bg-[#FFD700]/5 transition-colors ${
                            row.isCircuitBreaker ? "bg-red-950/20" : ""
                          }`}
                        >
                          <td className="py-3 px-4 flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              row.step === 1 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                                : row.isCircuitBreaker
                                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                : "bg-[#D4AF37]/20 text-[#FFD700] border border-[#D4AF37]/40"
                            }`}>
                              {row.step}
                            </span>
                            <span className="font-sans font-medium text-slate-200">
                              {row.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-white">
                            ${row.stake.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-red-400">
                            ${row.cumulativeSpent.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-300">
                            ${row.grossPayout.toFixed(2)}
                            <span className="text-[9px] text-slate-500 block font-sans">
                              (+$${row.grossWin.toFixed(2)} win)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400">
                            +${row.netProfit.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-300">
                            {row.portfolioRiskPct.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            {row.step === 1 ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Primary Alpha Entry
                              </span>
                            ) : row.isCircuitBreaker ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                                Circuit Breaker Cap
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase bg-[#D4AF37]/10 text-[#FFD700] border border-[#D4AF37]/30">
                                Yield Recovery L{row.step - 1}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Institutional Logic Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
                  <div className="p-4 rounded-xl border border-[#D4AF37]/15 bg-[#0B0B0E]/50">
                    <div className="flex items-center gap-2 text-[#FFD700] font-bold text-[10px] uppercase tracking-wider mb-1.5">
                      <Target className="w-3.5 h-3.5" />
                      Daily Target Profit (${targetProfit.toFixed(2)}) & Stop-Loss (${stopLoss.toFixed(2)})
                    </div>
                    <p className="leading-relaxed text-[11px] text-slate-400">
                      <strong>Daily Max Loss</strong> is your hard 24-hour portfolio stop-loss floor. If total daily losses hit ${stopLoss.toFixed(2)}, all trading immediately suspends to protect balance. <strong>Daily Target Profit</strong> (${targetProfit.toFixed(2)}) locks in daily gains once achieved.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-[#D4AF37]/15 bg-[#0B0B0E]/50">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-wider mb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Deterministic Recovery Guarantee
                    </div>
                    <p className="leading-relaxed text-[11px] text-slate-400">
                      Every step stake is mathematically calibrated against broker fees ({(dcaPayoutRate * 100).toFixed(0)}% payout). Winning at <em>any</em> recovery step completely recuperates 100% of prior losses in the sequence plus returns clean net profit to your equity.
                    </p>
                  </div>
                </div>
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
                   <select value={historyView} onChange={e => setHistoryView(e.target.value as any)} className="bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] rounded-xl px-3 py-2 text-xs outline-none [color-scheme:dark] cursor-pointer">
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
                 <button onClick={fetchHistory} className="px-4 py-2 h-[34px] border border-[#D4AF37] text-[#FFD700] rounded-xl text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10 flex items-center justify-center transition-all cursor-pointer">Refresh Data</button>
                  <button onClick={handleClearHistory} className="px-3 py-2 h-[34px] border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer" title="Wipe all trade records to start fresh">
                    <Trash2 className="w-3.5 h-3.5"/> Wipe History
                  </button>
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
      
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Header */}
             <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-4 gap-4">
                <div>
                   <h2 className="text-xl font-serif text-[#FFD700] tracking-widest flex items-center gap-3">
                     <Cpu className="w-6 h-6 text-[#FFD700] animate-pulse"/> STRATEGY MATRIX & FORWARD SIMULATION LAB
                   </h2>
                   <p className="text-xs text-slate-400 mt-1">
                     Multi-market forward paper simulation (Zero balance risk). Evaluating live ticks {evaluationTicks === 0 ? 'across all 10 horizons (1 to 10 Ticks)' : `${evaluationTicks} steps ahead`}.
                   </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                   <div className="flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/30 px-3 py-1.5 rounded-full">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                     <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Forward Sim Live</span>
                   </div>
                   <button 
                     onClick={() => fetchMatrixData(evaluationTicks)}
                     disabled={isFetchingMatrix}
                     className="px-3 py-1.5 border border-[#D4AF37] text-[#FFD700] rounded-xl text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10 flex items-center gap-1.5 transition-all cursor-pointer"
                   >
                     <RefreshCw className={`w-3.5 h-3.5 ${isFetchingMatrix ? 'animate-spin' : ''}`}/> Sync
                   </button>
                   <button 
                     onClick={handleResetLab} 
                     className="px-3 py-1.5 border border-red-500/40 text-red-400 rounded-xl text-xs uppercase tracking-widest hover:bg-red-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
                     title="Reset all simulation counters to pure zero"
                   >
                     <Trash2 className="w-3.5 h-3.5"/> Reset Lab (Zero)
                   </button>
                </div>
             </div>



             {/* Top Stat Boxes */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox 
                  title="Lab Win Rate" 
                  value={`${matrixData?.summary?.overall_win_rate || '---'}%`} 
                  color="text-[#FFD700]" 
                  icon={<TrendingUp className="w-4 h-4"/>} 
                  glow={true} 
                />
                <StatBox 
                  title="Top Winning Strategy" 
                  value={<span className="text-xs font-sans font-bold text-green-400 truncate block">{matrixData?.summary?.top_strategy || 'Analyzing...'}</span>} 
                  color="text-green-400" 
                  icon={<Flame className="w-4 h-4 text-orange-400"/>} 
                />
                <StatBox 
                  title="Safest Martingale Index" 
                  value={<span className="text-xs font-sans font-bold text-blue-400 truncate block">{matrixData?.summary?.safest_strategy || 'Analyzing...'}</span>} 
                  color="text-blue-400" 
                  icon={<ShieldAlert className="w-4 h-4 text-blue-400"/>} 
                />
                <StatBox 
                  title="Simulated Signals Evaluated" 
                  value={matrixData?.summary?.total_simulations?.toString() || '---'} 
                  color="text-white" 
                  icon={<Zap className="w-4 h-4 text-yellow-400"/>} 
                />
             </div>

             {/* AI Optimal Setup Recommendation / Current Best Live Edge */}
              <div className="bg-gradient-to-br from-[rgba(212,175,55,0.18)] via-[rgba(18,18,22,0.96)] to-[rgba(34,197,94,0.12)] border-2 border-[#D4AF37]/45 rounded-3xl p-6 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-6 relative overflow-hidden">
                 {/* Background Accent Glow */}
                 <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
                 <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                 {/* Top Header Bar */}
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4AF37]/20 pb-4 relative z-10">
                    <div className="flex items-center gap-2.5 flex-wrap">
                       <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38728] text-[#0B0B0E] shadow-[0_0_15px_rgba(212,175,55,0.5)] shrink-0">
                          <Crown className="w-5 h-5 drop-shadow-md"/>
                       </div>
                       <span className="text-[11px] font-sans font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40">
                         👑 CURRENT BEST LIVE EDGE
                       </span>
                       <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                         🤖 {currentBestEdge?.ai_model || 'PTM Neural Quantum AI'}
                       </span>
                       {currentBestEdge?.market_regime && (
                         <span className="text-[10px] font-sans font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                           ⚡ {currentBestEdge.market_regime}
                         </span>
                       )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                       <div className="bg-black/60 border border-[#D4AF37]/35 rounded-xl px-3 py-1.5 text-center">
                          <div className="text-[8px] text-slate-400 uppercase tracking-widest">AI Confidence</div>
                          <div className="text-sm font-mono font-extrabold text-[#FFD700]">
                            {currentBestEdge?.ai_score?.toFixed(1) || '---'}/100
                          </div>
                       </div>
                       <button
                         onClick={handleConsultNeuralAi}
                         disabled={isConsultingAi}
                         className="px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-black/60 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFD700] transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                         title="Force fresh Neural AI quantitative evaluation"
                       >
                         <Sparkles className={`w-3.5 h-3.5 ${isConsultingAi ? 'animate-spin text-[#FFD700]' : 'text-yellow-400'}`} />
                         <span>{isConsultingAi ? 'AI THINKING...' : 'AI CONSULT'}</span>
                       </button>
                    </div>
                 </div>

                 {/* Middle: Spacious Strategy Title & Reasoning */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                    <div className="lg:col-span-7 flex flex-col gap-2">
                       <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold text-white tracking-wide leading-snug">
                          {currentBestEdge?.strategy_name || "Evaluating Live Market Physics..."}
                       </h3>
                       <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-[#FFD700] bg-black/40 px-2.5 py-1 rounded-lg border border-[#D4AF37]/25">
                            Target Market: {currentBestEdge?.symbol_name || currentBestEdge?.symbol} ({currentBestEdge?.symbol})
                          </span>
                       </div>
                       <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                          {currentBestEdge?.reasoning || `Evaluated across verified sample size (${currentBestEdge?.total_trades || 0} tests), win rate consistency, minimal loss streak protection, and active signal momentum.`}
                       </p>
                    </div>

                    {/* Deploy Button Box */}
                    <div className="lg:col-span-5 flex flex-col justify-center gap-2">
                       <button
                         onClick={() => currentBestEdge && handleDeployLabStrategy(currentBestEdge.strategy, currentBestEdge.symbol, currentBestEdge.recommended_martingale, currentBestEdge.best_tick)}
                         disabled={!currentBestEdge || (strategyCore === currentBestEdge.strategy && activeSymbol === currentBestEdge.symbol)}
                         className={`w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(212,175,55,0.4)] ${
                           (strategyCore === currentBestEdge?.strategy && activeSymbol === currentBestEdge?.symbol)
                             ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 shadow-none'
                             : 'bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#E5C158] text-[#0B0B0E] hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                         }`}
                       >
                         <Zap className="w-4 h-4 fill-current"/>
                         {(strategyCore === currentBestEdge?.strategy && activeSymbol === currentBestEdge?.symbol)
                           ? 'CURRENTLY ACTIVE IN BOT'
                           : '⚡ AUTO-DEPLOY BEST SETUP NOW'}
                       </button>

                       {aiAutoPilot ? (
                          <div className="flex items-center justify-center gap-2 py-1 px-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                             <span>AUTONOMOUS MODE: Live Bot is actively executing this edge</span>
                          </div>
                       ) : (
                          <div className="text-center text-[10px] text-slate-400">
                             Click to deploy this optimal edge directly into your active bot settings
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Bottom: 4 Sleek Quantitative Metric Pillars */}
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                    <div className="bg-black/60 border border-[#D4AF37]/30 rounded-2xl p-3.5 text-center shadow-inner">
                       <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Win Rate</div>
                       <div className="text-xl sm:text-2xl font-mono font-extrabold text-green-400 mt-1">{currentBestEdge?.win_rate || 0}%</div>
                       <div className="text-[9px] text-slate-500 font-mono mt-0.5">{currentBestEdge?.wins || 0}W / {currentBestEdge?.losses || 0}L</div>
                    </div>
                    <div className="bg-black/60 border border-[#D4AF37]/30 rounded-2xl p-3.5 text-center shadow-inner">
                       <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Optimal Horizon</div>
                       <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#FFD700] mt-1">{currentBestEdge?.best_tick || (evaluationTicks === 0 ? 5 : evaluationTicks)} Ticks</div>
                       <div className="text-[9px] text-green-400 font-mono mt-0.5">{currentBestEdge?.best_tick_win_rate || currentBestEdge?.win_rate || 0}% Sweet Spot</div>
                    </div>
                    <div className="bg-black/60 border border-[#D4AF37]/30 rounded-2xl p-3.5 text-center shadow-inner">
                       <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Peak Loss Run</div>
                       <div className="text-xl sm:text-2xl font-mono font-extrabold text-yellow-400 mt-1">{currentBestEdge?.max_loss_streak || 0}L</div>
                       <div className="text-[9px] text-slate-400 font-mono mt-0.5">Hit {currentBestEdge?.max_loss_streak_count || 1} time(s)</div>
                    </div>
                    <div className="bg-black/60 border border-[#D4AF37]/30 rounded-2xl p-3.5 text-center shadow-inner">
                       <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Typical Loss Cluster</div>
                       <div className="text-xl sm:text-2xl font-mono font-extrabold text-blue-400 mt-1">{currentBestEdge?.dominant_loss_streak || 1}L</div>
                       <div className="text-[9px] text-slate-400 font-mono mt-0.5">Frequency: {currentBestEdge?.dominant_loss_streak_count || 0} event(s)</div>
                    </div>
                 </div>

                  {/* Empirical Streak Spectrum Distribution */}
                  <div className="mt-3 bg-black/60 border border-[#D4AF37]/25 rounded-2xl p-3 relative z-10 flex flex-col gap-2 shadow-inner">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-red-400"/> Loss Spectrum:
                           </span>
                           <span className="font-mono text-xs font-semibold text-slate-200 bg-red-950/30 border border-red-500/30 px-2.5 py-0.5 rounded-lg">
                              {currentBestEdge?.loss_streaks_formatted || '1L(1x)'}
                           </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-green-400 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-400"/> Win Spectrum:
                           </span>
                           <span className="font-mono text-xs font-semibold text-green-300 bg-green-950/30 border border-green-500/30 px-2.5 py-0.5 rounded-lg">
                              {currentBestEdge?.win_streaks_formatted || '1W(1x)'}
                           </span>
                        </div>
                     </div>
                  </div>
              </div>

              {/* Filter & Search Bar */}
             <div className="bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-2xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                   <div className="flex flex-col gap-1">
                     <label className="text-[9px] text-[#C5A059] font-bold uppercase tracking-widest">Filter Strategy</label>
                     <select 
                       value={matrixFilterStrategy} 
                       onChange={e => setMatrixFilterStrategy(e.target.value)} 
                       className="bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] rounded-xl px-3 py-1.5 text-xs outline-none"
                     >
                        <option value="all">All Strategies</option>
                        <option value="trend_momentum_rider">Directional Trend Surge</option>
                        <option value="low_vol_rsi_bb">Low-Vol Tactical Reversal</option>
                        <option value="pure_rsi_14">Harmonic Boundary Oscillator</option>
                        <option value="vietnam_smart_scan">Institutional Trend Matrix</option>
                        <option value="apex_momentum">Apex Kinetic Impulse</option>
                        <option value="rubber_band">Rubber-Band Elastic Scalp</option>
                        <option value="macd_kinetic_impulse">Kinetic Momentum Pulse</option>
                        <option value="heikin_ashi_pulse">Synthetic Micro-Wave Scalp</option>
                        <option value="breakout_box_scalper">Dynamic Breakout Scalper</option>
                        <option value="contrarian_liquidity_fade">Contrarian Liquidity Fade</option>
                        <option value="quantum_tick_velocity">Quantum Tick Velocity</option>
                        <option value="defensive_standby">Defensive Capital Preservation</option>
                     </select>
                   </div>

                   <div className="flex flex-col gap-1">
                     <label className="text-[9px] text-[#C5A059] font-bold uppercase tracking-widest">Filter Market</label>
                     <select 
                       value={matrixFilterSymbol} 
                       onChange={e => setMatrixFilterSymbol(e.target.value)} 
                       className="bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] rounded-xl px-3 py-1.5 text-xs outline-none"
                     >
                        <option value="all">All Markets</option>
                        <option value="R_25">Volatility 25 Index</option>
                        <option value="1HZ10V">Volatility 10 (1s) Index</option>
                        <option value="1HZ100V">Volatility 100 (1s) Index</option>
                        <option value="R_100">Volatility 100 Index</option>
                        <option value="R_10">Volatility 10 Index</option>
                        <option value="1HZ25V">Volatility 25 (1s) Index</option>
                        <option value="1HZ50V">Volatility 50 (1s) Index</option>
                        <option value="1HZ75V">Volatility 75 (1s) Index</option>
                     </select>
                   </div>

                   <div className="flex flex-col gap-1">
                     <label className="text-[9px] text-[#C5A059] font-bold uppercase tracking-widest">Filter Horizon</label>
                     <select 
                       value={evaluationTicks} 
                       onChange={e => handleSelectTick(Number(e.target.value))} 
                       className="bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer"
                     >
                        <option value={0}>🌐 All Horizons (1 to 10 Ticks - Full Universe)</option>
                        <option value={1}>1 Tick (Ultra Scalp)</option>
                        <option value={2}>2 Ticks</option>
                        <option value={3}>3 Ticks (High Freq)</option>
                        <option value={4}>4 Ticks</option>
                        <option value={5}>5 Ticks (Golden Standard)</option>
                        <option value={6}>6 Ticks</option>
                        <option value={7}>7 Ticks (Trend Rider)</option>
                        <option value={8}>8 Ticks</option>
                        <option value={9}>9 Ticks</option>
                        <option value={10}>10 Ticks (Micro Trend)</option>
                     </select>
                   </div>

                   <div className="flex flex-col gap-1">
                     <label className="text-[9px] text-[#C5A059] font-bold uppercase tracking-widest flex items-center gap-1">
                       <Clock className="w-2.5 h-2.5 text-[#D4AF37]"/> Timeframe
                     </label>
                     <select 
                       value={matrixTimeframe} 
                       onChange={e => {
                         const tf = e.target.value as any;
                         setMatrixTimeframe(tf);
                         fetchMatrixData(evaluationTicks, tf);
                       }} 
                       className="bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer"
                     >
                        <option value="all">🌐 All-Time Session</option>
                        <option value="5m">⚡ Last 5 Mins (Fast Scalp)</option>
                        <option value="15m">📊 Last 15 Mins (Cycle)</option>
                        <option value="1h">📈 Last 1 Hour (Macro)</option>
                     </select>
                   </div>

                   <div className="flex flex-col gap-1">
                     <label className="text-[9px] text-[#C5A059] font-bold uppercase tracking-widest">Sort By</label>
                     <select 
                       value={matrixSortBy} 
                       onChange={e => setMatrixSortBy(e.target.value as any)} 
                       className="bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer"
                     >
                        <option value="ai_score">AI Confidence Score (Best Real Setup)</option>
                        <option value="win_rate">Highest Win Rate %</option>
                        <option value="trades">Most Tested Trades (Highest Frequency)</option>
                        <option value="loss_streak">Lowest Max Loss Streak (Safest)</option>
                        <option value="profit">Highest Simulated PnL ($)</option>
                     </select>
                   </div>
                </div>

                <div className="text-[10px] text-[#C5A059] font-mono">
                   Showing {filteredLeaderboard.length} Strategy/Market Matrix Pairs
                </div>
             </div>

             {/* Strategy Performance Leaderboard */}
             {/* Mobile Responsive Strategy Cards (< 768px) */}
             <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredLeaderboard.length === 0 ? (
                  <div className="bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-2xl p-6 text-center text-slate-500 text-xs">
                    No strategy pairs matching current filter.
                  </div>
                ) : (
                  filteredLeaderboard.map((item: any, i: number) => {
                    const isCurrentActive = (strategyCore === item.strategy && activeSymbol === item.symbol);
                    return (
                      <div key={i} className="bg-[rgba(18,18,22,0.92)] border border-[rgba(212,175,55,0.25)] rounded-2xl p-4 flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white text-xs">{item.strategy_name}</span>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/30">
                                {item.badge}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                {item.tick}T
                              </span>
                              {isCurrentActive && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/40">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#C5A059] mt-0.5 font-semibold">{item.symbol_name} ({item.symbol})</div>
                            <div className="text-[9px] text-slate-400">{item.strategy_type}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-base ${item.win_rate >= 65 ? 'text-green-400' : item.win_rate >= 55 ? 'text-[#FFD700]' : 'text-slate-400'}`}>
                              {item.win_rate}%
                            </div>
                            <div className="text-[8px] text-slate-400 uppercase tracking-wider">Win Rate</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-black/40 border border-slate-800/80 rounded-xl p-2.5 text-center">
                          <div>
                            <div className="text-[8px] text-slate-400 uppercase">Simulated W/L</div>
                            <div className="text-xs font-mono font-bold mt-0.5">
                              <span className="text-green-400">{item.wins}</span> / <span className="text-red-400">{item.losses}</span>
                            </div>
                            <div className="text-[8px] text-slate-500">({item.total_trades} tests)</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-400 uppercase">Peak Loss Run</div>
                            <div className={`text-[10px] font-mono font-bold mt-0.5 px-1.5 py-0.5 rounded inline-block ${
                              item.max_loss_streak <= 2 ? 'text-green-400 bg-green-500/15 border border-green-500/30' :
                              item.max_loss_streak <= 3 ? 'text-yellow-400 bg-yellow-500/15 border border-yellow-500/30' :
                              'text-red-400 bg-red-500/15 border border-red-500/30'
                            }`}>
                              {item.max_loss_streak}L ({item.max_loss_streak_count || 1}x)
                            </div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-400 uppercase">Typical Cluster</div>
                            <div className="text-xs font-mono font-bold text-[#FFD700] mt-0.5">
                              {item.dominant_loss_streak || 1}L ({item.dominant_loss_streak_count || 0}x)
                            </div>
                          </div>
                        </div>

                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(item.win_rate, 100)}%` }} 
                            className={`h-full ${item.win_rate >= 65 ? 'bg-green-500' : item.win_rate >= 55 ? 'bg-[#FFD700]' : 'bg-red-500'}`}
                          />
                        </div>

                        {/* Sweet Spot Optimal Tick Insight */}
                        <div className="flex items-center justify-between gap-2 text-[10px] bg-black/40 px-3 py-1.5 rounded-xl border border-[#D4AF37]/20">
                          <div className="flex items-center gap-1.5 text-[#FFD700] font-bold">
                            <Target className="w-3.5 h-3.5 text-[#FFD700]"/>
                            <span>Optimal Sweet Spot: {item.best_tick} Ticks</span>
                          </div>
                          <span className="text-green-400 font-mono font-bold">{item.best_tick_win_rate}% WR</span>
                        </div>

                        <button 
                          onClick={() => handleDeployLabStrategy(item.strategy, item.symbol, item.recommended_martingale, item.tick || item.best_tick)}
                          disabled={isCurrentActive}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            isCurrentActive 
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] active:scale-95 cursor-pointer font-bold'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5"/> {isCurrentActive ? 'CURRENTLY ACTIVE IN BOT' : `DEPLOY (${item.tick || item.best_tick}T)`}
                        </button>
                      </div>
                    );
                  })
                )}
             </div>

             {/* Desktop Leaderboard Table (>= 768px) */}
             <div className="hidden md:block bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                   <thead>
                     <tr className="border-b border-[#D4AF37]/20 text-[#C5A059] text-[10px] uppercase tracking-widest">
                       <th className="py-4 font-bold">Strategy & Market</th>
                       <th className="py-4 font-bold text-center">Type</th>
                       <th className="py-4 font-bold text-center">Win Rate</th>
                       <th className="py-4 font-bold text-center">Simulated W/L</th>
                       <th className="py-4 font-bold text-center">Max Loss Streak</th>
                       <th className="py-4 font-bold text-center">Loss Run Profile</th>
                       <th className="py-4 font-bold text-right">Quick Deploy</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm font-mono text-slate-300">
                     {filteredLeaderboard.length === 0 ? (
                       <tr><td colSpan={7} className="py-8 text-center text-slate-500">No strategy pairs matching current filter.</td></tr>
                     ) : (
                       filteredLeaderboard.map((item: any, i: number) => {
                         const isCurrentActive = (strategyCore === item.strategy && activeSymbol === item.symbol);
                         return (
                           <tr key={i} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                             <td className="py-3.5">
                               <div className="flex flex-col">
                                 <div className="flex items-center gap-2">
                                   <span className="font-bold text-white text-xs">{item.strategy_name}</span>
                                   <span className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/30">
                                     {item.badge}
                                   </span>
                                   <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                     {item.tick}T
                                   </span>
                                   {isCurrentActive && (
                                     <span className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/40">
                                       LIVE IN BOT
                                     </span>
                                   )}
                                 </div>
                                 <div className="flex items-center gap-2 mt-0.5">
                                   <span className="text-[10px] text-[#C5A059] font-sans font-semibold">{item.symbol_name} ({item.symbol})</span>
                                   <span className="px-1.5 py-0.2 rounded text-[8px] font-sans font-bold bg-[#FFD700]/10 border border-[#FFD700]/25 text-[#FFD700] flex items-center gap-1">
                                     <Target className="w-2.5 h-2.5"/> Best: {item.best_tick}T ({item.best_tick_win_rate}%)
                                   </span>
                                 </div>
                                </div>
                             </td>
                             <td className="py-3.5 text-center text-[10px] font-sans text-slate-400">
                               {item.strategy_type}
                             </td>
                             <td className="py-3.5 text-center">
                               <div className="flex flex-col items-center gap-1">
                                 <span className={`font-bold text-xs ${item.win_rate >= 65 ? 'text-green-400' : item.win_rate >= 55 ? 'text-[#FFD700]' : 'text-slate-400'}`}>
                                   {item.win_rate}%
                                 </span>
                                 <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                   <div 
                                     style={{ width: `${Math.min(item.win_rate, 100)}%` }} 
                                     className={`h-full ${item.win_rate >= 65 ? 'bg-green-500' : item.win_rate >= 55 ? 'bg-[#FFD700]' : 'bg-red-500'}`}
                                   />
                                 </div>
                               </div>
                             </td>
                             <td className="py-3.5 text-center text-xs">
                               <span className="text-green-400 font-bold">{item.wins}</span> / <span className="text-red-400">{item.losses}</span>
                               <span className="text-slate-500 text-[10px] block font-sans font-normal">({item.total_trades} tests)</span>
                             </td>
                             <td className="py-3.5 text-center">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                                 item.max_loss_streak <= 2 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                 item.max_loss_streak <= 3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                 'bg-red-500/20 text-red-400 border border-red-500/30'
                               }`}>
                                 {item.max_loss_streak} Losses Max
                               </span>
                             </td>
                             <td className="py-3.5 text-center">
                               <div className="flex flex-col items-center gap-1">
                                 <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                   <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                     item.max_loss_streak <= 2 ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
                                     item.max_loss_streak <= 3 ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' :
                                     'bg-red-500/15 text-red-400 border border-red-500/30'
                                   }`}>
                                     Peak: {item.max_loss_streak}L ({item.max_loss_streak_count || 1}x)
                                   </span>
                                   {item.max_win_streak > 0 && (
                                     <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-500/15 text-green-400 border border-green-500/30">
                                       Peak: {item.max_win_streak}W
                                     </span>
                                   )}
                                 </div>
                                 <div className="text-[9px] text-slate-300 font-mono tracking-tight max-w-[220px] truncate" title={`Loss: ${item.loss_streaks_formatted || 'None'} | Win: ${item.win_streaks_formatted || 'None'}`}>
                                   {item.loss_streaks_formatted || '1L(1x)'}
                                 </div>
                               </div>
                             </td>
                             <td className="py-3.5 text-right">
                               <button 
                                 onClick={() => handleDeployLabStrategy(item.strategy, item.symbol, item.recommended_martingale, item.tick || item.best_tick)}
                                 disabled={isCurrentActive}
                                 className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ml-auto ${
                                   isCurrentActive 
                                     ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                     : 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] active:scale-95 cursor-pointer'
                                 }`}
                               >
                                 <Zap className="w-3 h-3"/> {isCurrentActive ? 'ACTIVE' : `DEPLOY (${item.tick || item.best_tick}T)`}
                               </button>
                             </td>
                           </tr>
                         );
                       })
                      )}
                    </tbody>
                </table>
             </div>

             {/* Live Forward Simulation Feed */}
             <div className="bg-[rgba(18,18,22,0.85)] border border-[rgba(212,175,55,0.25)] rounded-3xl p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                   <h3 className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                     <Activity className="w-4 h-4 text-green-400 animate-pulse"/> Live Forward Simulation Stream (Real-Time 5-Tick Outcomes)
                   </h3>
                   <span className="text-[10px] text-slate-500 font-mono">5-Tick Forward Evaluator</span>
                </div>

                <div className="max-h-72 overflow-y-auto font-mono text-xs flex flex-col gap-2">
                   {(!matrixData?.recent_feed || matrixData.recent_feed.length === 0) ? (
                     <div className="py-8 text-center text-slate-600 uppercase tracking-widest">
                       Listening to public tick stream... evaluating forward outcomes...
                     </div>
                   ) : (
                     matrixData.recent_feed.map((feed: any, idx: number) => (
                       <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-slate-800/80 hover:border-[#D4AF37]/30 transition-all">
                          <div className="flex items-center gap-3">
                             <span className="text-slate-500 text-[10px]">[{feed.timestamp}]</span>
                             <span className="text-white font-bold">{feed.strategy_name}</span>
                             <span className="text-[#C5A059] text-[11px] font-sans">({feed.symbol})</span>
                             <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${feed.contract_type === 'CALL' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                               {feed.contract_type}
                             </span>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                             <span className="text-slate-400 text-[11px]">
                               Entry: {feed.entry_price.toFixed(3)} → Exit: {feed.exit_price.toFixed(3)}
                             </span>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${feed.status === 'WIN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                               {feed.status}
                             </span>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>
        )}

        <Footer className="pb-28" />
      </main>

            {/* Upgraded Bottom Navigation */}
      <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-50 px-2 sm:px-4 pointer-events-none">
        <div className="pointer-events-auto max-w-full sm:max-w-xl mx-auto bg-[#121216]/95 backdrop-blur-2xl border border-[#D4AF37]/35 rounded-2xl px-1.5 sm:px-3 py-1 sm:py-2 flex justify-between items-center shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
          {[
            { id: 'trade', icon: Activity, label: 'Terminal' },
            { id: 'strategies', icon: Target, label: 'Logic' },
            { id: 'money', icon: Banknote, label: 'MM Vault' },
            { id: 'analytics', icon: Cpu, label: 'Matrix Lab' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'settings', icon: ShieldAlert, label: 'Vault' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 py-1 sm:py-1.5 rounded-xl transition-all duration-300 cursor-pointer min-w-0 ${
                activeTab === tab.id 
                  ? 'text-[#FFD700] bg-[#D4AF37]/15 shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
                  : 'text-[#C5A059]/60 hover:text-[#C5A059] hover:bg-white/5'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]' : ''}`} />
              <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wider font-bold truncate max-w-full px-0.5">{tab.label}</span>
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
