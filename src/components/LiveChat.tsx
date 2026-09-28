"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Mail, Phone } from "lucide-react";

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [initialMsg, setInitialMsg] = useState("");
  
  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing ticket on mount and start polling
  useEffect(() => {
    const savedId = localStorage.getItem("ptm_ticket_id");
    if (savedId && !ticketId) {
      setTicketId(parseInt(savedId));
    }
  }, []);

  useEffect(() => {
    if (ticketId) {
      fetchMessages(ticketId);
      const interval = setInterval(() => {
        fetchMessages(ticketId);
      }, 3000); // 3 seconds for near-instant feel
      return () => clearInterval(interval);
    }
  }, [ticketId]);

  const fetchMessages = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/support/tickets/${id}/messages`);
      if (res.ok) setMessages(await res.json());
    } catch(e) {}
  };

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, initial_message: initialMsg })
      });
      const data = await res.json();
      if (res.ok) {
        setTicketId(data.id);
        localStorage.setItem("ptm_ticket_id", data.id.toString());
        await fetchMessages(data.id);
      }
    } catch(e) {}
    finally { setIsSubmitting(false); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !ticketId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply })
      });
      if (res.ok) {
        setReply("");
        await fetchMessages(ticketId);
      }
    } catch(e) {}
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center text-[#0B0B0E] shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] h-[500px] max-h-[80vh] bg-[#121216]/95 backdrop-blur-xl border border-[#D4AF37]/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] p-4 flex items-center justify-between text-[#0B0B0E]">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-bold tracking-widest uppercase text-sm">Live Support</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded transition-colors"><X className="w-5 h-5" /></button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0B0B0E]/50">
            {!ticketId ? (
              // Registration Form
              <div className="flex flex-col gap-4 animate-in fade-in">
                <p className="text-[#C5A059] text-xs font-bold uppercase tracking-widest text-center mb-2">Welcome! How can we help?</p>
                <form onSubmit={startChat} className="flex flex-col gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-[#D4AF37]/50" />
                    <input type="text" placeholder="Your Name" value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:border-[#D4AF37] outline-none" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-[#D4AF37]/50" />
                    <input type="email" placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:border-[#D4AF37] outline-none" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-[#D4AF37]/50" />
                    <input type="tel" placeholder="Phone (Optional)" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-[#0B0B0E] border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:border-[#D4AF37] outline-none" />
                  </div>
                  <textarea placeholder="How can we help you today?" value={initialMsg} onChange={e=>setInitialMsg(e.target.value)} required className="w-full h-24 bg-[#0B0B0E] border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-[#D4AF37] outline-none resize-none"></textarea>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl uppercase tracking-widest text-xs mt-2 hover:bg-[#FFD700] transition-colors">Start Chat</button>
                </form>
              </div>
            ) : (
              // Chat Messages
              <>
                <div className="text-center text-xs text-slate-500 my-2">Chat started</div>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                    <div className={`p-3 rounded-2xl text-sm shadow-md ${msg.sender === 'user' ? 'bg-[#D4AF37] text-black rounded-tr-sm' : 'bg-slate-800 text-white rounded-tl-sm border border-slate-700'}`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1 self-end">{new Date(msg.created_at + (msg.created_at.endsWith('Z') ? '' : 'Z')).toLocaleTimeString('en-LK', {timeZone: 'Asia/Colombo', hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Footer Input */}
          {ticketId && (
            <form onSubmit={sendMessage} className="p-3 bg-[#121216] border-t border-[#D4AF37]/20 flex gap-2">
              <input type="text" value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type a message..." className="flex-1 bg-[#0B0B0E] border border-slate-700 rounded-full px-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
              <button type="submit" className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-black hover:bg-[#FFD700] shrink-0"><Send className="w-4 h-4 ml-1" /></button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
