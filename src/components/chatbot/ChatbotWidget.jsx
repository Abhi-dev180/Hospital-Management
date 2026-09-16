// frontend/src/components/chatbot/ChatbotWidget.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Bot, User, Sparkles, ChevronDown, ChevronUp,
  Maximize2, Minimize2, Trash2, Calendar, Stethoscope, TestTube2,
  PhoneCall, ShieldAlert, ArrowRight, ExternalLink, RefreshCw,
  Building2, CreditCard, CheckCircle2, Clock, FileText, Volume2, VolumeX, QrCode, MapPin, Copy, Check
} from 'lucide-react';
import API_URL from '../../config/api';
import AppointmentPaymentModal from '../AppointmentPaymentModal';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingBookingDetails, setPendingBookingDetails] = useState(null);
  const [showAllHospitalsMap, setShowAllHospitalsMap] = useState({});
  const [showAllServicesMap, setShowAllServicesMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);
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
  const [chatContext, setChatContext] = useState(() => {
    try {
      const saved = sessionStorage.getItem('medibot_context');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {};
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Save conversation in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('medibot_messages', JSON.stringify(messages));
    } catch (_) {}
  }, [messages]);

  // Save context in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('medibot_context', JSON.stringify(chatContext));
    } catch (_) {}
  }, [chatContext]);

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

  const handleSend = async (userText, paymentInfo = null) => {
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
          context: chatContext,
          paymentInfo: paymentInfo || undefined,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.context !== undefined) {
          setChatContext(data.context || {});
        }
        const botMsg = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          intent: data.intent,
          quickReplies: data.quickReplies || [],
          appointment: data.appointment || null,
          paymentDetails: data.paymentDetails || null,
          nextOptions: data.nextOptions || null,
          services: data.services || null,
          availableSlots: data.availableSlots || null,
          hospitals: data.hospitals || null,
          action: data.action || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
        playChime();
        if (!isOpen) setHasUnread(true);

        if (data.action && data.action.type === 'open_payment_modal' && data.action.bookingData) {
          setPendingBookingDetails(data.action.bookingData);
        }
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

  const handlePaymentSuccess = (paymentResult) => {
    setPaymentModalOpen(false);
    const payNote = `✅ Payment Completed (${paymentResult.paymentMethod} - ID: ${paymentResult.paymentId})`;
    handleSend(payNote, {
      paymentId: paymentResult.paymentId,
      paymentMethod: paymentResult.paymentMethod,
      paymentAmount: paymentResult.amount
    });
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
    setChatContext({});
    setPendingBookingDetails(null);
    setShowAllHospitalsMap({});
    setShowAllServicesMap({});
    setCopiedId(null);
    sessionStorage.removeItem('medibot_messages');
    sessionStorage.removeItem('medibot_context');
  };

  const handleActionClick = (action) => {
    if (!action) return;
    if (action.type === 'open_payment_modal') {
      if (action.bookingData) {
        setPendingBookingDetails(action.bookingData);
      }
      setPaymentModalOpen(true);
      return;
    }
    if (action.type === 'download_invoice' || action.actionType === 'download_invoice') {
      const apptId = action.appointmentId || action.id || action.appointmentNumber;
      const url = action.url || `/api/appointments/${apptId}/invoice`;
      window.open(url.startsWith('http') ? url : `${API_URL}${url}`, '_blank');
      return;
    }
    if (action.type === 'emergency_call') {
      window.location.href = `tel:${action.phone || '18004191234'}`;
      return;
    }
    if (action.actionType === 'message') {
      handleSend(action.text || action.label);
      return;
    }
    if (action.url) {
      if (action.url.startsWith('/api/')) {
        window.open(`${API_URL}${action.url}`, '_blank');
      } else {
        navigate(action.url);
        if (window.innerWidth < 640) setIsOpen(false);
      }
    }
  };

  const handleQuickReplyClick = (qr, msg) => {
    const lowerQr = qr.toLowerCase();
    if (
      (lowerQr.includes('pay online') || lowerQr.includes('upi qr') || lowerQr.includes('instant upi')) &&
      (msg?.action?.bookingData || pendingBookingDetails)
    ) {
      setPendingBookingDetails(msg?.action?.bookingData || pendingBookingDetails);
      setPaymentModalOpen(true);
      return;
    }
    if (lowerQr.includes('download invoice') && (msg?.appointment?.id || msg?.paymentDetails?.appointmentId)) {
      const id = msg?.appointment?.id || msg?.paymentDetails?.appointmentId;
      window.open(`${API_URL}/api/appointments/${id}/invoice`, '_blank');
      return;
    }
    handleSend(qr);
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
    <>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] font-sans">
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
                className="group flex items-center gap-2 sm:gap-2.5 bg-gradient-to-tr from-slate-900 via-medical-dark to-medical-blue text-white p-2.5 sm:pl-3.5 sm:pr-4 sm:py-3 rounded-full shadow-2xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-white ring-1 ring-white/30 shadow-inner">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 group-hover:rotate-12 transition-transform" />
                  </div>
                  <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 flex items-center justify-center">
                    <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-white animate-ping" />
                  </span>
                </div>

                <div className="hidden xs:flex flex-col text-left">
                  <span className="text-xs font-black tracking-wide text-white leading-tight flex items-center gap-1">
                    MediBot AI
                  </span>
                  <span className="text-[10px] text-blue-200 font-medium leading-tight">
                    24/7 Assistant
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
              className={`fixed z-[9999] origin-bottom-right transition-all duration-200 flex flex-col bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden ${
                isExpanded
                  ? 'inset-x-2 bottom-2 top-12 sm:top-auto sm:inset-auto sm:bottom-6 sm:right-6 w-auto sm:w-[640px] lg:w-[700px] h-[calc(100dvh-3.5rem)] sm:h-[84vh] sm:max-h-[820px]'
                  : 'inset-x-2 bottom-2 top-12 sm:top-auto sm:inset-auto sm:bottom-6 sm:right-6 w-auto sm:w-[430px] md:w-[450px] h-[calc(100dvh-3.5rem)] sm:h-[640px] sm:max-h-[82vh]'
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

                          {/* ─── Interactive Hospital Directory / Selection List ─── */}
                          {msg.hospitals && msg.hospitals.length > 0 && (
                            <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                <span className="flex items-center gap-1 text-slate-800">
                                  <Building2 className="w-3.5 h-3.5 text-medical-blue" />
                                  Accredited Hospitals ({msg.hospitals.length})
                                </span>
                                <span className="text-[9.5px] text-slate-400">Select branch below</span>
                              </div>

                              <div className="space-y-1.5">
                                {(showAllHospitalsMap[msg.id] ? msg.hospitals : msg.hospitals.slice(0, 3)).map((h, hIdx) => (
                                  <div
                                    key={hIdx}
                                    className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-200/90 hover:border-medical-blue/40 transition group"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <h5 className="font-bold text-slate-900 text-xs truncate flex items-center gap-1">
                                          <Building2 className="w-3 h-3 text-medical-blue shrink-0" />
                                          {h.name}
                                        </h5>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                          {h.location || h.city || 'Metro City'}
                                        </p>
                                      </div>
                                      <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 text-[9px] font-bold border border-emerald-200">
                                        {h.emergency || '24/7 ICU'}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-200/60 text-[10px]">
                                      <span className="text-slate-500 font-medium">🛏️ {h.beds || '350+ Beds'}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleSend(h.name)}
                                        className="px-2.5 py-1 rounded-lg bg-medical-blue hover:bg-medical-dark text-white font-bold text-[10.5px] transition shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                                      >
                                        <span>Select Hospital</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* See More / Show Less Toggle Button */}
                              {msg.hospitals.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllHospitalsMap(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                  className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-medical-blue font-bold text-xs transition border border-blue-200/80 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  {showAllHospitalsMap[msg.id] ? (
                                    <>
                                      <span>Show Fewer Hospitals</span>
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </>
                                  ) : (
                                    <>
                                      <span>See More Hospitals ({msg.hospitals.length - 3} more)</span>
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}

                          {/* ─── Interactive Available Time Slot Grid (Booked Slots Excluded) ─── */}
                          {msg.availableSlots && msg.availableSlots.length > 0 && (
                            <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                <span className="flex items-center gap-1 text-slate-800">
                                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                  Available Time Slots ({msg.availableSlots.length})
                                </span>
                                <span className="text-[9.5px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                  🟢 Open Only
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                {msg.availableSlots.map((slot, sIdx) => {
                                  const label = typeof slot === 'object' ? (slot.label || slot.time24) : slot;
                                  return (
                                    <button
                                      key={sIdx}
                                      type="button"
                                      onClick={() => handleSend(label)}
                                      className="p-2 rounded-xl bg-slate-50/90 hover:bg-emerald-50/80 text-slate-800 hover:text-emerald-900 border border-slate-200/90 hover:border-emerald-400 font-bold text-[11px] transition shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 group"
                                    >
                                      <Clock className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                                      <span>{label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* ─── Interactive Diagnostic Lab Tests Directory ─── */}
                          {msg.services && msg.services.length > 0 && (
                            <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                <span className="flex items-center gap-1 text-slate-800">
                                  <TestTube2 className="w-3.5 h-3.5 text-purple-600" />
                                  Diagnostic Tests & Packages ({msg.services.length})
                                </span>
                                <span className="text-[9.5px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-200">
                                  🧪 Quick Book
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {(showAllServicesMap[msg.id] ? msg.services : msg.services.slice(0, 3)).map((srv, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-purple-50/40 border border-slate-200/90 hover:border-purple-300 transition group"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <h5 className="font-bold text-slate-900 text-xs truncate flex items-center gap-1">
                                          <TestTube2 className="w-3 h-3 text-purple-600 shrink-0" />
                                          {srv.name}
                                        </h5>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                          ⏱️ {srv.turnaround} • 🍽️ {srv.fasting}
                                        </p>
                                      </div>
                                      <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-extrabold border border-purple-200">
                                        ₹{srv.price}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-200/60 text-[10px]">
                                      <span className="text-slate-400 font-medium">{srv.category || 'Diagnostic Lab'}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleSend(`Book ${srv.name}`)}
                                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-[10.5px] transition shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                                      >
                                        <span>Book Lab Test</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* See More / Show Less Toggle Button */}
                              {msg.services.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllServicesMap(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                  className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 font-bold text-xs transition border border-purple-200/80 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  {showAllServicesMap[msg.id] ? (
                                    <>
                                      <span>Show Fewer Tests</span>
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </>
                                  ) : (
                                    <>
                                      <span>See More Lab Tests ({msg.services.length - 3} more)</span>
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}

                          {/* ─── Interactive Appointment & Payment Details Card ─── */}
                          {msg.appointment && (
                            <div className="mt-3 p-3 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50/40 border border-slate-200/90 shadow-2xs space-y-2.5 text-slate-800">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 truncate">
                                    Booking Ref #{msg.appointment.appointment_number || msg.appointment.id}
                                  </span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide shrink-0 ${
                                  msg.appointment.status === 'Confirmed' || String(msg.appointment.paymentStatus).toLowerCase().includes('paid')
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : msg.appointment.status === 'Cancelled'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {String(msg.appointment.paymentStatus).toLowerCase() === 'paid' ? '🟢 PAID' : msg.appointment.status}
                                </span>
                              </div>

                              {/* Payment & Appointment Details Grid */}
                              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                                <div>
                                  <span className="text-slate-400 block text-[9.5px]">Patient Name</span>
                                  <span className="font-bold text-slate-900 truncate block">{msg.appointment.patientName}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9.5px]">Hospital Branch</span>
                                  <span className="font-bold text-slate-900 truncate block">{msg.appointment.hospital}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9.5px]">Scheduled Slot</span>
                                  <span className="font-bold text-medical-blue truncate block">
                                    {msg.appointment.date} @ {msg.appointment.time}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9.5px]">Amount Paid</span>
                                  <span className="font-extrabold text-emerald-600 truncate block">
                                    ₹{msg.appointment.paymentAmount || 500} ({msg.appointment.paymentStatus || 'Paid'})
                                  </span>
                                </div>

                                {msg.appointment.paymentMethod && (
                                  <div className="col-span-2">
                                    <span className="text-slate-400 block text-[9.5px]">Payment Method</span>
                                    <span className="font-semibold text-slate-700 truncate block">
                                      {msg.appointment.paymentMethod}
                                    </span>
                                  </div>
                                )}

                                {msg.appointment.paymentId && (
                                  <div className="col-span-2 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <span className="text-slate-400 block text-[9.5px]">Transaction / Payment ID</span>
                                      <code className="font-mono font-bold text-slate-800 text-[10.5px] truncate block">
                                        {msg.appointment.paymentId}
                                      </code>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(msg.appointment.paymentId);
                                        setCopiedId(msg.appointment.paymentId);
                                        setTimeout(() => setCopiedId(null), 2000);
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                                      title="Copy Transaction ID"
                                    >
                                      {copiedId === msg.appointment.paymentId ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          <span className="text-emerald-700 font-bold">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 text-slate-500" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* ─── Next Action Options ─── */}
                              <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-600 px-0.5">
                                  <span>👉 Next Steps for Your Visit:</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleActionClick({ type: 'download_invoice', appointmentId: msg.appointment.id })}
                                    className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-[11px] transition shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Download Invoice (PDF)</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigate(`/dashboard/my-appointments?id=${msg.appointment.id}`);
                                      if (window.innerWidth < 640) setIsOpen(false);
                                    }}
                                    className="p-2 bg-medical-blue hover:bg-medical-dark text-white rounded-xl font-bold text-[11px] transition shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Open in Portal</span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSend('What documents do I need to bring for my appointment?')}
                                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-medical-blue border border-slate-200/80 text-[10.5px] font-medium transition cursor-pointer flex items-center gap-1"
                                  >
                                    <span>📋 Documents to Bring</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSend('What are the hospital visiting hours?')}
                                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-medical-blue border border-slate-200/80 text-[10.5px] font-medium transition cursor-pointer flex items-center gap-1"
                                  >
                                    <span>🕒 Visiting Hours</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSend('Book another appointment')}
                                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-medical-blue border border-slate-200/80 text-[10.5px] font-medium transition cursor-pointer flex items-center gap-1"
                                  >
                                    <span>🩺 Book Another</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Interactive Direct Action Button */}
                          {msg.action && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => handleActionClick(msg.action)}
                                className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer ${
                                  msg.action.type === 'open_payment_modal'
                                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-medical-blue hover:from-emerald-700 hover:to-blue-700 ring-2 ring-emerald-400/40 animate-pulse'
                                    : 'bg-gradient-to-r from-medical-dark to-medical-blue hover:from-blue-900 hover:to-medical-blue'
                                }`}
                              >
                                {msg.action.type === 'open_payment_modal' ? (
                                  <CreditCard className="w-4 h-4 text-amber-300" />
                                ) : null}
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
                              onClick={() => handleQuickReplyClick(qr, msg)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer shrink-0 ${
                                qr.includes('Pay Online') || qr.includes('Instant UPI')
                                  ? 'bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-800 border border-emerald-300 hover:border-emerald-500 font-bold'
                                  : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-medical-blue border border-slate-200 hover:border-medical-blue/40'
                              }`}
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

      {/* ─── In-Chat Payment Gateway Modal (Stripe / Razorpay / Free UPI QR) ─── */}
      <AppointmentPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        bookingDetails={pendingBookingDetails}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}

