with open('c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = """  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all'|'today'|'week'|'month'>('today');

  const filteredHistory = tradeHistory.filter(t => {
    if (historyFilter === 'all') return true;
    const d = new Date(t.timestamp + (t.timestamp.endsWith('Z') ? '' : 'Z'));
    const now = new Date();
    if (historyFilter === 'today') return d.toDateString() === now.toDateString();
    if (historyFilter === 'week') return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 7;
    if (historyFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });

  const historyWins = filteredHistory.filter(t => t.status === 'WIN').length;
  const historyLosses = filteredHistory.filter(t => t.status === 'LOSS').length;
  const historyTotal = historyWins + historyLosses;
  const historyWinRate = historyTotal > 0 ? ((historyWins / historyTotal) * 100).toFixed(1) : '0.0';
  const historyProfit = filteredHistory.reduce((acc, t) => acc + t.profit, 0);"""

replace1 = """  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
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
  const historyWinRate = historyTotal > 0 ? ((historyWins / historyTotal) * 100).toFixed(1) : '0.0';"""

if target1 in content:
    content = content.replace(target1, replace1)

target2 = """               <div className="flex gap-2">
                 <select value={historyFilter} onChange={e => setHistoryFilter(e.target.value as any)} className="bg-[#0B0B0E] border border-[#D4AF37]/30 text-[#FFD700] rounded-xl px-3 py-2 text-xs outline-none">
                   <option value="today">Today</option>
                   <option value="week">Past 7 Days</option>
                   <option value="month">This Month</option>
                   <option value="all">All Time</option>
                 </select>
                 <button onClick={fetchHistory} className="px-4 py-2 border border-[#D4AF37] text-[#FFD700] rounded-xl text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10">Refresh</button>
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
                   <tr className="border-b border-[#D4AF37]/20 text-[#C5A059] text-[10px] uppercase tracking-widest">
                     <th className="py-4 font-bold">Time</th>
                     <th className="py-4 font-bold">Market</th>
                     <th className="py-4 font-bold">Type</th>
                     <th className="py-4 font-bold text-right">Stake</th>
                     <th className="py-4 font-bold text-right">Profit</th>
                     <th className="py-4 font-bold text-center">Status</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm font-mono text-slate-300">
                   {filteredHistory.length === 0 ? (
                     <tr><td colSpan={6} className="py-8 text-center text-slate-500">No trades match the selected filter.</td></tr>
                   ) : (
                     filteredHistory.map((t, i) => (
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
                   )}
                 </tbody>
               </table>
             </div>"""

replace2 = """               <div className="flex flex-col sm:flex-row gap-4 items-end">
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
             </div>"""

if target2 in content:
    content = content.replace(target2, replace2)

with open('c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('History updated successfully')
