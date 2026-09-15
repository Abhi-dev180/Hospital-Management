// frontend/src/components/chatbot/ChatbotWidget.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Bot, User, Sparkles, ChevronDown,
  Maximize2, Minimize2, Trash2, Calendar, Stethoscope, TestTube2,
  PhoneCall, ShieldAlert, ArrowRight, ExternalLink, RefreshCw,
  Building2, CreditCard, CheckCircle2, Clock, FileText, Volume2, VolumeX
} from 'lucide-react';
import API_URL from '../../config/api';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('medibot_messages');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'welcome_1',
        sender: 'bot',
        text: `👋 **Hello! I am MediBot, your 24/7 Hospital & Medical Assistant.**\n\nHow can I assist you today? You can ask me to book appointments, track an existing booking, check diagnostic test fasting rules, vaccination schedules, health packages, doctor fees, or get emergency help!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          '🩺 Book Doctor Appointment',
          '🧪 Lab Tests & Fasting Rules',
          '💎 Full Body Health Checkup',
          '💉 Vaccination Schedules',
          '🌸 Maternity & Delivery',
          '🏠 Home Blood Collection',
          '👴 Senior Citizen Care',
          '💰 Doctor Consultation Fees',
          '🛡️ Insurance & Cashless TPA',
          '🔍 Track My Appointment',
          '🚨 Emergency Helplines'
        ]
      }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Save conversation in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('medibot_messages', JSON.stringify(messages));
    } catch (_) {}
  }, [messages]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
      setHasUnread(false);
    }
  }, [isOpen]);

  // Play subtle feedback chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  };

  const handleSend = async (userText) => {
    const query = (userText || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();
      if (res.ok) {
        const botMsg = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          intent: data.intent,
          quickReplies: data.quickReplies || [],
          appointment: data.appointment || null,
          services: data.services || null,
          action: data.action || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
        playChime();
        if (!isOpen) setHasUnread(true);
      } else {
        throw new Error(data.message || 'Failed to get answer');
      }
    } catch (err) {
      console.error('[Chatbot] Send error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: `⚠️ I'm having a brief connection delay. You can try asking again or explore our direct options below:`,
          quickReplies: ['Book Doctor Appointment', 'Track My Appointment', 'Emergency Helplines'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const welcome = [
      {
        id: `welcome_${Date.now()}`,
        sender: 'bot',
        text: `🧹 **Chat history cleared.**\n\nHow can I help you today? Feel free to ask about doctors, available appointment slots, lab tests, or hospital information!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          '🩺 Book Doctor Appointment',
          '🧪 Lab Tests & Pricing',
          '🔍 Track My Appointment',
          '🚨 Emergency Helplines'
        ]
      }
    ];
    setMessages(welcome);
    sessionStorage.removeItem('medibot_messages');
  };

  const handleActionClick = (action) => {
    if (!action) return;
    if (action.type === 'emergency_call') {
      window.location.href = `tel:${action.phone || '18004191234'}`;
      return;
    }
    if (action.url) {
      navigate(action.url);
      if (window.innerWidth < 640) setIsOpen(false);
    }
  };

  // Helper to format basic markdown (bold, lists, code, quotes)
  const formatMarkdown = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Header ###
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 text-sm mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Header **
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={idx} className="font-bold text-slate-800 text-xs mt-1 mb-1">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      // Blockquote >
      if (line.startsWith('> ')) {
        return (
          <div key={idx} className="my-1.5 p-2 rounded-lg bg-blue-50/80 border-l-2 border-medical-blue text-[11px] text-slate-700 italic">
            {renderInlineSpans(line.replace('> ', ''))}
          </div>
        );
      }
      // Bullet list *
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 my-0.5 leading-snug">
            <span className="text-medical-blue mt-0.5">•</span>
            <span>{renderInlineSpans(line.trim().slice(2))}</span>
          </div>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line.trim())) {
        const num = line.trim().match(/^(\d+)\.\s/)[1];
        const rest = line.trim().replace(/^\d+\.\s/, '');
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 my-0.5 leading-snug">
            <span className="font-bold text-medical-blue text-[11px] min-w-[14px]">{num}.</span>
            <span>{renderInlineSpans(rest)}</span>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-xs text-slate-700 my-0.5 leading-relaxed">
          {renderInlineSpans(line)}
        </p>
      );
    });
  };

  const renderInlineSpans = (textStr) => {
    if (!textStr) return '';
    // Replace **bold**, `code`, [link](url)
    const parts = [];
    let remaining = textStr;
    let keyIndex = 0;

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/);
      if (boldMatch) {
        if (boldMatch[1]) parts.push(<span key={keyIndex++}>{boldMatch[1]}</span>);
        parts.push(<strong key={keyIndex++} className="font-bold text-slate-900">{boldMatch[2]}</strong>);
        remaining = boldMatch[3];
        continue;
      }
      // Code `code`
      const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/);
      if (codeMatch) {
        if (codeMatch[1]) parts.push(<span key={keyIndex++}>{codeMatch[1]}</span>);
        parts.push(
          <code key={keyIndex++} className="bg-slate-100 text-medical-dark px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200">
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
        continue;
      }
      // Markdown link [text](url)
      const linkMatch = remaining.match(/^(.*?)\[(.+?)\]\((.+?)\)(.*)$/);
      if (linkMatch) {
        if (linkMatch[1]) parts.push(<span key={keyIndex++}>{linkMatch[1]}</span>);
        parts.push(
          <button
            key={keyIndex++}
            type="button"
            onClick={() => {
              if (linkMatch[3].startsWith('/')) navigate(linkMatch[3]);
              else window.open(linkMatch[3], '_blank');
            }}
            className="text-medical-blue font-bold hover:underline cursor-pointer inline-flex items-center gap-0.5"
          >
            {linkMatch[2]}
          </button>
        );
        remaining = linkMatch[4];
        continue;
      }

      parts.push(<span key={keyIndex++}>{remaining}</span>);
      break;
    }

    return parts;
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans">
      {/* ─── Floating Chat Trigger Launcher ─────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative"
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              title="Chat with MediBot 24/7 AI Assistant"
              className="group flex items-center gap-2.5 bg-gradient-to-tr from-slate-900 via-medical-dark to-medical-blue text-white pl-3.5 pr-4 py-3 rounded-full shadow-2xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <div className="h-9 w-9 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-white ring-1 ring-white/30 shadow-inner">
                  <Bot className="w-5 h-5 text-blue-200 group-hover:rotate-12 transition-transform" />
                </div>
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                </span>
              </div>

              <div className="flex flex-col text-left">
                <span className="text-xs font-black tracking-wide text-white leading-tight flex items-center gap-1">
                  MediBot AI
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </span>
                <span className="text-[10px] text-blue-200 font-medium leading-tight">
                  24/7 Online Assistant
                </span>
              </div>
            </button>

            {hasUnread && (
              <span className="absolute -top-1.5 -left-1.5 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md animate-bounce ring-2 ring-white">
                New
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Animated Chatbot Window ────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`flex flex-col bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transition-all duration-200 ${
              isExpanded
                ? 'w-[94vw] sm:w-[620px] h-[86vh] max-h-[800px]'
                : 'w-[92vw] sm:w-[410px] h-[78vh] max-h-[640px]'
            }`}
          >
            {/* ─── Chatbot Header ─────────────────────────────────── */}
            <div className="bg-gradient-to-r from-slate-950 via-medical-dark to-blue-950 text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md relative">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-medical-blue to-indigo-500 flex items-center justify-center text-white shadow-md ring-2 ring-white/30">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base text-white truncate leading-tight">
                      MediBot Assistant
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-md bg-blue-500/25 border border-blue-400/30 text-[9px] font-bold text-blue-200 uppercase tracking-wider">
                      AI 24/7
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200/80 truncate mt-0.5">
                    Instant Booking, Reports & Hospital Help
                  </p>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-1 shrink-0 text-slate-300">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer"
                  title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </button>
                <button
                  type="button"
                  onClick={clearChat}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden sm:inline-flex p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer"
                  title={isExpanded ? 'Collapse Window' : 'Expand Window'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition cursor-pointer"
                  title="Close Chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ─── Message Stream ─────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/60">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[88%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="shrink-0 mb-1">
                        {isUser ? (
                          <div className="h-6 w-6 rounded-full bg-medical-dark text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-medical-blue to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs shadow-2xs ${
                          isUser
                            ? 'bg-gradient-to-tr from-medical-dark to-medical-blue text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                        }`}
                      >
                        {isUser ? (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          formatMarkdown(msg.text)
                        )}

                        {/* Interactive Appointment Card */}
                        {msg.appointment && (
                          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-2 text-slate-800">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Booking Ref #{msg.appointment.appointment_number || msg.appointment.id}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                msg.appointment.status === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : msg.appointment.status === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {msg.appointment.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                              <div>
                                <span className="text-slate-400 block text-[9.5px]">Patient</span>
                                <span className="font-bold text-slate-800 truncate block">{msg.appointment.patientName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9.5px]">Hospital</span>
                                <span className="font-bold text-slate-800 truncate block">{msg.appointment.hospital}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9.5px]">Slot Date & Time</span>
                                <span className="font-bold text-medical-blue truncate block">
                                  {msg.appointment.date} @ {msg.appointment.time}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9.5px]">Payment Status</span>
                                <span className="font-bold text-emerald-600 truncate block">
                                  {msg.appointment.paymentStatus || 'Paid'} (₹{msg.appointment.paymentAmount || 500})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/dashboard/my-appointments?id=${msg.appointment.id}`);
                                  setIsOpen(false);
                                }}
                                className="flex-1 py-1.5 px-2 bg-medical-blue hover:bg-medical-dark text-white rounded-lg font-bold text-[11px] transition text-center cursor-pointer inline-flex items-center justify-center gap-1"
                              >
                                <FileText className="w-3 h-3" /> View In Portal
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Interactive Direct Action Button */}
                        {msg.action && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleActionClick(msg.action)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-medical-dark to-medical-blue hover:from-blue-900 hover:to-medical-blue text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                            >
                              <span>{msg.action.label || (msg.action.type === 'emergency_call' ? '🚨 Call Emergency Now' : '👉 Proceed / Open Page')}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[9.5px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>

                    {/* Quick Reply Chips (Only for latest bot message) */}
                    {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2 max-w-full">
                        {msg.quickReplies.map((qr, qIdx) => (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => handleSend(qr)}
                            className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-medical-blue border border-slate-200 hover:border-medical-blue/40 text-[11px] font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer shrink-0"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Animation */}
              {loading && (
                <div className="flex items-end gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-medical-blue to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/90 rounded-bl-xs shadow-2xs flex items-center gap-1.5 text-slate-500">
                    <span className="text-[11px] font-medium mr-1 text-slate-400">MediBot is typing</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-medical-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-medical-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-medical-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ─── Chat Input Bar ─────────────────────────────────── */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2.5 sm:p-3 bg-white border-t border-slate-200/90 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask MediBot... (e.g. 'Book doctor', '#1042', 'Lab tests')"
                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-medical-blue/40 focus:ring-2 focus:ring-medical-blue/20 outline-none transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-9 w-9 rounded-xl bg-medical-dark hover:bg-medical-blue disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs shrink-0 cursor-pointer active:scale-95"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
