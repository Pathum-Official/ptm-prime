"use client";
import { API_URL, WS_URL } from '../config';


import { useState, useEffect, useRef } from "react";
import { Users, ShieldAlert, Zap, Plus, LogOut, Activity, CheckCircle2, AlertTriangle, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/Logo";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Data State
  const [activeTab, setActiveTab] = useState<'users'|'support'>('users');
  const [stats, setStats] = useState({ total_users: 0, active_trading_engines: 0, inactive_trading_engines: 0, leads_count: 0, system_uptime: "Loading...", critical_flags: 0 });
  const [clients, setClients] = useState<any[]>([]);
  
  // Support State
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [packageType, setPackageType] = useState("Elite");
  const [duration, setDuration] = useState(30);
  const [telegramId, setTelegramId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Broadcast State
  const [broadcastTarget, setBroadcastTarget] = useState("ALL");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  
  // Custom Toast State
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'|null}>({message: "", type: null});
  const showToast = (msg: string, type: 'success'|'error') => {
    setToast({message: msg, type});
    setTimeout(() => setToast({message: "", type: null}), 4000);
  };
  
  // Custom Confirm State
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, isDangerous: boolean}>({
    isOpen: false, title: "", message: "", onConfirm: () => {}, isDangerous: false
  });
  const showConfirm = (title: string, message: string, onConfirm: () => void, isDangerous = false) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, isDangerous });
  };

  const fetchData = async () => {
    try {
      const statRes = await fetch(`${API_URL}/api/v1/admin/stats`, { credentials: "omit" }); // Next.js middleware relies on browser cookies, but fetch within same localhost port 3000 -> 8000 needs credentials. Wait, since we fetch from client to 8000, we MUST send credentials: "include" to pass the cookie.
      // We will actually just use the fetch below with credentials.
    } catch (e) {}
  };
  
  const fetchLive = async () => {
    try {
      const authRes = await fetch(`${API_URL}/api/v1/users/me`, { credentials: "include" });
      if (!authRes.ok) {
        router.push("/");
        return;
      }
      const userData = await authRes.json();
      if (!userData.is_admin) {
        router.push("/dashboard");
        return;
      }
      setIsAuthenticated(true);
      
      const statRes = await fetch(`${API_URL}/api/v1/admin/stats`, { credentials: "include" });
      if (statRes.ok) setStats(await statRes.json());
      
      const userRes = await fetch(`${API_URL}/api/v1/admin/users`, { credentials: "include" });
      if (userRes.ok) setClients(await userRes.json());

      const ticketRes = await fetch(`${API_URL}/api/v1/support/admin/tickets`, { credentials: "include" });
      if (ticketRes.ok) setTickets(await ticketRes.json());
    } catch (e) {
      console.error("Failed to load admin data");
    }
  };

  useEffect(() => {
    fetchLive();
    const int = setInterval(fetchLive, 5000);
    return () => clearInterval(int);
  }, []);

  const loadTicketMessages = async (ticket: any) => {
    setSelectedTicket(ticket);
    try {
      const res = await fetch(`${API_URL}/api/v1/support/tickets/${ticket.id}/messages`, { credentials: "include" });
      if (res.ok) {
        setTicketMessages(await res.json());
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch(e) {}
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/support/admin/tickets/${selectedTicket.id}/reply`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ content: replyText })
      });
      if (res.ok) {
        setReplyText("");
        await loadTicketMessages(selectedTicket);
      }
    } catch(e) {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/create`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, temporary_password: tempPassword, package_type: packageType, subscription_duration_days: duration, telegram_id: telegramId, whatsapp_number: whatsapp }),
        credentials: "include"
      });
      if (res.ok) { 
        setShowModal(false); 
        setFullName(""); setEmail(""); setTempPassword(""); setTelegramId(""); setWhatsapp("");
        showToast("User provisioned successfully", "success");
        fetchLive(); 
      } else { 
        const err = await res.json();
        showToast("Failed to create user: " + err.detail, "error"); 
      }
    } catch (e) { showToast("API error", "error"); }
    finally { setIsLoading(false); }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${selectedUser.id}`, {
        method: "PUT", headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password: tempPassword || null, telegram_id: telegramId, whatsapp_number: whatsapp }),
        credentials: "include"
      });
      if (res.ok) { 
        setShowEditModal(false); 
        showToast("User details updated", "success");
        fetchLive(); 
      } else showToast("Failed to edit user", "error");
    } catch (e) { showToast("API error", "error"); }
    finally { setIsLoading(false); }
  };
  
  const openEditModal = (client: any) => {
    setSelectedUser(client);
    setFullName(client.full_name);
    setEmail(client.email);
    setTelegramId(client.telegram_id || "");
    setWhatsapp(client.whatsapp_number || "");
    setTempPassword("");
    setShowEditModal(true);
  };

  const handleBanToggle = (userId: number, isBanned: boolean) => {
    showConfirm(
      isBanned ? "Reactivate User" : "Suspend User",
      `Are you sure you want to ${isBanned ? 'unban' : 'ban'} this user?`,
      async () => {
        setConfirmDialog(prev => ({...prev, isOpen: false}));
        try {
          await fetch(`${API_URL}/api/v1/admin/users/${userId}/${isBanned ? 'unban' : 'ban'}`, { method: "POST", credentials: "include", headers: {"ngrok-skip-browser-warning": "true"} });
          showToast(`User ${isBanned ? 'reactivated' : 'banned'} successfully`, "success");
          fetchLive();
        } catch (e) { showToast("Action failed", "error"); }
      },
      !isBanned
    );
  };

  const handleStopEngine = (userId: number) => {
    showConfirm(
      "Halt Engine",
      "Are you sure you want to forcibly stop this user's trading engine?",
      async () => {
        setConfirmDialog(prev => ({...prev, isOpen: false}));
        try {
          await fetch(`${API_URL}/api/v1/admin/users/${userId}/stop-engine`, { method: "POST", credentials: "include", headers: {"ngrok-skip-browser-warning": "true"} });
          showToast("Engine stopped successfully", "success");
          fetchLive();
        } catch (e) { showToast("Action failed", "error"); }
      },
      true
    );
  };

  const handleEmergencyStop = () => {
    showConfirm(
      "SYSTEM EMERGENCY OVERRIDE",
      "⚠️ WARNING: This will immediately HALT all active trading engines across the system! Proceed?",
      async () => {
        setConfirmDialog(prev => ({...prev, isOpen: false}));
        try {
          await fetch(`${API_URL}/api/v1/admin/system/emergency-stop`, { method: "POST", credentials: "include", headers: {"ngrok-skip-browser-warning": "true"} });
          showToast("Emergency Stop Executed. All engines halted.", "success");
          fetchLive();
        } catch (e) { showToast("Action failed", "error"); }
      },
      true
    );
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage) return showToast("Message cannot be empty", "error");
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/system/broadcast`, {
        method: "POST", headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" },
        body: JSON.stringify({ target: broadcastTarget, message: broadcastMessage }),
        credentials: "include"
      });
      if (res.ok) {
        showToast("Broadcast sent successfully!", "success");
        setBroadcastMessage("");
      } else {
        showToast("Broadcast failed to send", "error");
      }
    } catch (e) { showToast("Broadcast API unreachable", "error"); }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, { method: "POST", credentials: "include", headers: {"ngrok-skip-browser-warning": "true"} });
      window.location.href = "/";
    } catch(e) { window.location.href = "/"; }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-[#C5A059] font-sans">
      <nav className="border-b border-[#D4AF37]/20 bg-[#121216]/80 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"><Logo /></div>
            <span className="text-xl font-serif tracking-[0.2em] text-[#FFD700] font-bold">SUPERVISION</span>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#FFD700]' : 'border-slate-700 text-slate-400 hover:text-white'}`}>Users</button>
            <button onClick={() => setActiveTab('support')} className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'support' ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#FFD700]' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
              <MessageCircle className="w-3 h-3" /> Inbox {tickets.length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
            <Link href="/dashboard" className="px-4 py-2 rounded-full border border-[#D4AF37]/50 text-xs font-bold text-[#FFD700] hover:bg-[#D4AF37]/10 uppercase tracking-widest transition-all">App View</Link>
            <button onClick={handleLogout} className="px-4 py-2 rounded-full border border-red-500/50 text-xs font-bold text-red-500 hover:bg-red-500/10 uppercase tracking-widest flex items-center gap-2 transition-all"><LogOut className="w-3 h-3" /> Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {activeTab === 'users' && (
          <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Elite Members", val: stats.total_users, icon: Users },
            { label: "Active Engines", val: stats.active_trading_engines, icon: Zap },
            { label: "System Uptime", val: stats.system_uptime, icon: Activity },
            { label: "Critical Flags", val: stats.critical_flags, icon: ShieldAlert, alert: true },
          ].map((m, i) => (
            <div key={i} className="p-6 rounded-3xl bg-[rgba(18,18,22,0.85)] backdrop-blur-md border border-[rgba(212,175,55,0.25)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><m.icon className="w-20 h-20" /></div>
              <m.icon className={`w-6 h-6 mb-4 ${m.alert ? 'text-red-500' : 'text-[#D4AF37]'}`} />
              <p className="text-[#C5A059] text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{m.label}</p>
              <h3 className="text-4xl font-serif text-[#FFD700]">{m.val}</h3>
            </div>
          ))}
        </div>

        <div className="bg-[rgba(18,18,22,0.85)] backdrop-blur-md border border-[rgba(212,175,55,0.25)] rounded-3xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="flex justify-between items-center mb-8 border-b border-[#D4AF37]/20 pb-6">
            <h2 className="text-lg font-serif tracking-[0.2em] text-[#FFD700] font-bold">CLIENT ROSTER</h2>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37] text-[#FFD700] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"><Plus className="w-4 h-4"/> Provision User</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold bg-[#D4AF37]/5">
                <th className="py-4 px-6 rounded-l-xl">Identity</th><th className="py-4 px-6">Tier Expiry</th><th className="py-4 px-6">Engine State</th><th className="py-4 px-6 text-right rounded-r-xl">Overrides</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className={`border-b border-[#D4AF37]/10 text-sm hover:bg-[#1a1a1f] transition-colors group ${client.is_banned ? 'opacity-50' : ''}`}>
                  <td className="py-5 px-6 font-mono group-hover:text-white transition-colors">
                    <div className="text-[#FFD700] font-bold">{client.full_name}</div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{client.email}</div>
                    {(client.whatsapp_number || client.telegram_id) && (
                      <div className="text-[9px] text-slate-500 mt-1">WA: {client.whatsapp_number || 'N/A'} | TG: {client.telegram_id || 'N/A'}</div>
                    )}
                  </td>
                  <td className="py-5 px-6 text-[#C5A059] font-medium">{client.tier}</td>
                  <td className="py-5 px-6">
                    {client.is_banned ? (
                      <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(220,38,38,0.2)]">Banned</span>
                    ) : client.engine_state === "TRADING" ? (
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)]">Trading (ON)</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)]">Paused (OFF)</span>
                    )}
                  </td>
                  <td className="py-5 px-6 text-right flex gap-3 justify-end items-center h-full">
                    <button onClick={() => openEditModal(client)} className="text-[#3b82f6] hover:text-blue-400 font-bold text-[10px] uppercase tracking-widest">Edit</button>
                    {!client.is_banned && client.engine_state === "TRADING" && (
                      <button onClick={() => handleStopEngine(client.id)} className="text-amber-500 hover:text-amber-400 font-bold text-[10px] uppercase tracking-widest">Halt</button>
                    )}
                    <button onClick={() => handleBanToggle(client.id, client.is_banned)} className={`${client.is_banned ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'} font-bold text-[10px] uppercase tracking-widest`}>
                      {client.is_banned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-[#C5A059]">No clients found in database.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="bg-[rgba(18,18,22,0.85)] backdrop-blur-md border border-[rgba(212,175,55,0.25)] rounded-3xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
            <h2 className="text-lg font-serif tracking-[0.2em] text-[#FFD700] font-bold mb-6">GLOBAL SYSTEM BROADCAST</h2>
            <div className="flex flex-col gap-4">
              <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)} className="w-full bg-[#0B0B0E] border border-[#D4AF37]/20 py-3 px-5 rounded-xl text-[#FFD700] focus:border-[#D4AF37] outline-none font-medium text-xs">
                <option value="ALL">All Registered Users ({stats.total_users})</option>
                <option value="ACTIVE">Active (Trading) Users Only ({stats.active_trading_engines})</option>
                <option value="INACTIVE">Inactive/Banned Users Only ({stats.inactive_trading_engines})</option>
                <option value="LEADS">All Bot Visitors / Marketing ({stats.leads_count})</option>
              </select>
              <textarea placeholder="Type your Markdown announcement here... (e.g. **Bold**, _Italic_)" value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} rows={5} className="w-full bg-[#0B0B0E] border border-[#D4AF37]/20 py-3 px-5 rounded-xl text-[#FFD700] focus:border-[#D4AF37] outline-none placeholder-[#D4AF37]/40 font-medium text-xs resize-none" />
              <button onClick={handleBroadcast} className="bg-gradient-to-r from-[#3b82f6] to-blue-400 text-[#0B0B0E] py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">Dispatch Telegram Broadcast</button>
            </div>
          </div>
          
          <div className="bg-[rgba(18,18,22,0.85)] backdrop-blur-md border border-red-500/20 rounded-3xl p-8 shadow-[0_15px_40px_rgba(220,38,38,0.1)] flex flex-col justify-center items-center text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
            <h2 className="text-xl font-serif tracking-[0.2em] text-red-500 font-bold mb-2">SYSTEM EMERGENCY OVERRIDE</h2>
            <p className="text-slate-400 text-xs mb-8 max-w-xs">Instantly halts all active trading engines and dispatches an emergency maintenance alert to all affected users.</p>
            <button onClick={handleEmergencyStop} className="w-full bg-red-500/10 border border-red-500 text-red-500 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-red-500 hover:text-white hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all">INITIATE EMERGENCY STOP</button>
          </div>
        </div>
        </>
        )}

        {activeTab === 'support' && (
          <div className="bg-[rgba(18,18,22,0.85)] backdrop-blur-md border border-[rgba(212,175,55,0.25)] rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex overflow-hidden h-[600px]">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-[#D4AF37]/20 bg-[#0B0B0E]/50 flex flex-col">
              <div className="p-4 border-b border-[#D4AF37]/20 text-[#FFD700] font-bold font-serif tracking-widest uppercase">Support Inbox</div>
              <div className="flex-1 overflow-y-auto p-2">
                {tickets.map(t => (
                  <button key={t.id} onClick={() => loadTicketMessages(t)} className={`w-full text-left p-4 rounded-xl mb-2 transition-colors ${selectedTicket?.id === t.id ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50' : 'hover:bg-white/5 border border-transparent'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-white truncate">{t.name}</span>
                      <span className="text-[10px] text-[#C5A059]">{new Date(t.created_at + (t.created_at.endsWith('Z') ? '' : 'Z')).toLocaleTimeString('en-LK', {timeZone: 'Asia/Colombo', hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{t.email}</div>
                  </button>
                ))}
                {tickets.length === 0 && <div className="text-center text-slate-500 text-xs mt-10">No active tickets.</div>}
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-[#121216]/50">
              {selectedTicket ? (
                <>
                  <div className="p-4 border-b border-[#D4AF37]/20 flex justify-between items-center">
                    <div>
                      <h3 className="text-[#FFD700] font-bold text-sm uppercase tracking-widest">{selectedTicket.name}</h3>
                      <p className="text-[10px] text-slate-400">{selectedTicket.email} {selectedTicket.phone && `| ${selectedTicket.phone}`}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {ticketMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col max-w-[70%] ${msg.sender === 'admin' ? 'self-end' : 'self-start'}`}>
                        <div className={`p-4 rounded-2xl text-sm ${msg.sender === 'admin' ? 'bg-[#D4AF37] text-black rounded-tr-sm' : 'bg-slate-800 text-white rounded-tl-sm border border-slate-700'}`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1 self-end">{new Date(msg.created_at + (msg.created_at.endsWith('Z') ? '' : 'Z')).toLocaleTimeString('en-LK', {timeZone: 'Asia/Colombo', hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={handleReplyTicket} className="p-4 border-t border-[#D4AF37]/20 bg-[#0B0B0E] flex gap-2">
                    <input type="text" value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Type a reply to the user..." className="flex-1 bg-[#121216] border border-slate-700 rounded-full px-6 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                    <button type="submit" className="w-12 h-12 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shrink-0"><Send className="w-5 h-5 ml-1" /></button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm uppercase tracking-widest">Select a ticket to view chat</div>
              )}
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-[#121216] border border-[#D4AF37]/30 p-10 rounded-[2rem] w-full max-w-md shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#FFD700]"></div>
              <h3 className="text-xl font-serif tracking-[0.2em] text-[#FFD700] mb-8 font-bold">PROVISION ACCESS</h3>
              <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full bg-[#0B0B0E] border border-[#D4AF37]/20 py-3 px-5 rounded-xl text-[#FFD700] focus:border-[#D4AF37] outline-none placeholder-[#D4AF37]/40 font-medium text-sm" />
                <input type="email" placeholder="Client Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#0B0B0E] border border-[#D4AF37]/20 py-3 px-5 rounded-xl text-[#FFD700] focus:border-[#D4AF37] outline-none placeholder-[#D4AF37]/40 font-medium text-sm" />
                <input type="text" placeholder="WhatsApp Number" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-[#0B0B0E] border border-[#D4AF37]/20 py-3 px-5 rounded-xl text-[#FFD700] focus:border-[#D4AF37] outline-none placeholder-[#D4AF37]/40 font-medium text-sm" />
                <input type="text" placeholder="Telegram Chat ID" value={telegramId} onChange={e => setTelegramId(e.target.value)} className="w-full bg-[#0B0B0E] border border-[#D4AF37]/20 py-3 px-5 rounded-xl text-[#FFD700] focus:border-[#D4AF37] outline-none placeholder-[#D4AF37]/40 font-medium text-sm" />
                <input type="text" placeholder="Temporary Passkey" value={tempPassword} onChange={e => setTempPassword(e.target.value)} required className="w-full bg-[#0B0B0E] border border-[#D4AF37]/20 py-3 px-5 rounded-xl text-[#FFD700] focus:border-[#D4AF37] outline-none placeholder-[#D4AF37]/40 font-medium text-sm" />
                <select value={packageType} onChange={e => setPackageType(e.target.value)} className="w-full bg-[#0B0B0E] border border-[#D4AF37]/20 py-3 px-5 rounded-xl text-[#FFD700] focus:border-[#D4AF37] outline-none font-medium text-sm">
                  <option value="Standard">Standard Tier</option>
                  <option value="Elite">Elite Tier</option>
                </select>
                <input type="number" placeholder="Duration (Days)" value={duration} onChange={e => setDuration(Number(e.target.value))} required className="w-full bg-[#0B0B0E] border border-[#D4AF37]/20 py-3 px-5 rounded-xl text-[#FFD700] focus:border-[#D4AF37] outline-none placeholder-[#D4AF37]/40 font-medium text-sm" />
                
                <div className="flex gap-4 mt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-[#C5A059]/40 text-[#C5A059] py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37]/10 transition-colors">Abort</button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0B0B0E] py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50">Grant Authorization</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-[#121216] border border-[#3b82f6]/30 p-10 rounded-[2rem] w-full max-w-md shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3b82f6] to-blue-400"></div>
              <h3 className="text-xl font-serif tracking-[0.2em] text-[#3b82f6] mb-8 font-bold">EDIT CLIENT RECORD</h3>
              <form onSubmit={handleEditUser} className="flex flex-col gap-4">
                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full bg-[#0B0B0E] border border-[#3b82f6]/20 py-3 px-5 rounded-xl text-white focus:border-[#3b82f6] outline-none font-medium text-sm" />
                <input type="email" placeholder="Client Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#0B0B0E] border border-[#3b82f6]/20 py-3 px-5 rounded-xl text-white focus:border-[#3b82f6] outline-none font-medium text-sm" />
                <input type="text" placeholder="WhatsApp Number" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-[#0B0B0E] border border-[#3b82f6]/20 py-3 px-5 rounded-xl text-white focus:border-[#3b82f6] outline-none font-medium text-sm" />
                <input type="text" placeholder="Telegram Chat ID" value={telegramId} onChange={e => setTelegramId(e.target.value)} className="w-full bg-[#0B0B0E] border border-[#3b82f6]/20 py-3 px-5 rounded-xl text-white focus:border-[#3b82f6] outline-none font-medium text-sm" />
                <input type="text" placeholder="New Password (Optional)" value={tempPassword} onChange={e => setTempPassword(e.target.value)} className="w-full bg-[#0B0B0E] border border-[#3b82f6]/20 py-3 px-5 rounded-xl text-white focus:border-[#3b82f6] outline-none font-medium text-sm" />
                
                <div className="flex gap-4 mt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 border border-slate-600 text-slate-400 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-[#3b82f6] to-blue-400 text-[#0B0B0E] py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Confirm Dialog */}
        <AnimatePresence>
          {confirmDialog.isOpen && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-[#121216] border p-8 rounded-[2rem] w-full max-w-md relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ${confirmDialog.isDangerous ? 'border-red-500/30' : 'border-[#3b82f6]/30'}`}
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${confirmDialog.isDangerous ? 'from-red-500 to-red-400' : 'from-[#3b82f6] to-blue-400'}`}></div>
                <div className="flex items-center gap-4 mb-6">
                  {confirmDialog.isDangerous ? <ShieldAlert className="w-8 h-8 text-red-500" /> : <AlertTriangle className="w-8 h-8 text-[#3b82f6]" />}
                  <h3 className={`text-lg font-serif tracking-[0.2em] font-bold ${confirmDialog.isDangerous ? 'text-red-500' : 'text-[#3b82f6]'}`}>{confirmDialog.title}</h3>
                </div>
                <p className="text-slate-300 text-sm mb-8 leading-relaxed font-medium">{confirmDialog.message}</p>
                <div className="flex gap-4">
                  <button onClick={() => setConfirmDialog(prev => ({...prev, isOpen: false}))} className="flex-1 border border-slate-600 text-slate-400 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors">Cancel</button>
                  <button onClick={confirmDialog.onConfirm} className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] text-white transition-all ${confirmDialog.isDangerous ? 'bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-[#3b82f6] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'}`}>Confirm Action</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Custom Toast Notifications */}
        <AnimatePresence>
          {toast.message && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.3 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
                toast.type === 'success' ? 'bg-[#0B0B0E]/90 border-[#D4AF37]/40 text-[#FFD700]' : 'bg-[#0B0B0E]/90 border-red-500/40 text-red-500'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" /> : <ShieldAlert className="w-5 h-5 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
              <span className="font-bold tracking-wider text-sm">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
