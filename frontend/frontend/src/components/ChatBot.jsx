import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiMessageCircle, FiUser } from 'react-icons/fi';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SUGGESTED = [
  'What products do you sell?',
  'Check my order status',
  'Do you have any discounts?',
  'How to place a bulk order?',
];

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.div key={i} className="w-2 h-2 rounded-full bg-[var(--primary)]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
    ))}
  </div>
);

const ChatBot = () => {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm Mitchell's AI Assistant. How can I help you today?`,
      time: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Update greeting when user changes
  useEffect(() => {
    if (user?.name) {
      setMessages([{
        role: 'assistant',
        content: `Hi ${user.name.split(' ')[0]}! 👋 I'm Mitchell's AI Assistant. How can I help you today?`,
        time: new Date()
      }]);
    }
  }, [user?.name]);

  if (!isAuthenticated) return null;

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, time: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build history (exclude greeting)
      const history = newMessages.slice(1, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await chatAPI.send({ message: msg, history });
      const reply = res.data.reply || "Sorry, I couldn't process that. Please try again.";

      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: new Date() }]);
      if (!open) setUnread(u => u + 1);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again or contact us at za314944@gmail.com",
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[998] flex flex-col shadow-2xl"
            style={{ width: 'min(380px, calc(100vw - 2rem))', height: 'min(580px, calc(100vh - 120px))', borderRadius: '24px', overflow: 'hidden' }}
          >
            {/* Header */}
            <div className="shrink-0 px-5 py-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #2d4a3d 100%)' }}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <img src="/mitchells-logo.png" alt="M" className="w-7 h-7 object-contain rounded-full"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <span className="text-white font-black text-sm hidden">M</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm leading-none">Mitchell's Assistant</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-white/70 text-[10px]">Online · Powered by Groq AI</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
                <FiX size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[var(--bg-cream)]">

              {/* Suggested questions — always visible at top */}
              <div className="space-y-2 mb-2">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest text-center">Quick Questions</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTED.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all shadow-sm disabled:opacity-50">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black shadow-sm mt-1 ${
                    msg.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-white border border-gray-100'
                  }`}>
                    {msg.role === 'user'
                      ? (user?.name?.charAt(0)?.toUpperCase() || <FiUser size={12} />)
                      : <img src="/mitchells-logo.png" alt="M" className="w-5 h-5 object-contain rounded-full"
                          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                    }
                    <span className="hidden text-[var(--primary)] text-[10px] font-black">M</span>
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[var(--primary)] text-white rounded-tr-sm'
                        : 'bg-white text-[var(--text-dark)] rounded-tl-sm border border-gray-100'
                    }`}>
                      {msg.role === 'assistant'
                        ? msg.content
                            .replace(/\*\*(.*?)\*\*/g, '$1')  // remove **bold**
                            .replace(/\*(.*?)\*/g, '$1')        // remove *italic*
                            .replace(/#{1,6}\s/g, '')           // remove headings
                            .split('\n')
                            .map((line, li) => (
                              <span key={li} className="block">
                                {line || <>&nbsp;</>}
                              </span>
                            ))
                        : msg.content
                      }
                    </div>
                    <p className="text-[9px] text-gray-400 px-1">{formatTime(msg.time)}</p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white border border-gray-100 shrink-0 flex items-center justify-center mt-1">
                    <img src="/mitchells-logo.png" alt="M" className="w-5 h-5 object-contain rounded-full"
                      onError={e => { e.target.style.display='none'; }} />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 px-3 py-3 bg-white border-t border-gray-100">
              <div className="flex items-end gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-[var(--primary)]/40 transition-all">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent text-sm outline-none resize-none text-[var(--text-dark)] placeholder-gray-400 max-h-24 py-1"
                  style={{ lineHeight: '1.4' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[var(--primary-dark)] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-0.5">
                  <FiSend size={14} />
                </button>
              </div>
              <p className="text-[9px] text-gray-600 text-center mt-1.5">Powered by Groq AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all"
        style={{ background: open ? '#2d4a3d' : 'linear-gradient(135deg, var(--primary) 0%, #2d4a3d 100%)' }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FiX size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <FiMessageCircle size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {unread > 0 && !open && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unread}
          </motion.span>
        )}
      </motion.button>
    </>
  );
};

export default ChatBot;
