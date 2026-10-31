import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, User, Send, X, Plus, Search, MessageSquare, MoreVertical,
  Edit2, Pin, Trash2, Check, Copy, Menu, Sparkles, Lock, ArrowDown,
  AlertTriangle, HeartPulse, Stethoscope, Award, Zap, Apple, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SUGGESTED_PROMPTS = [
  'What are common cold & influenza remedies?',
  'Explain clinical blood pressure readings (120/80)',
  'UNESCO dietary guidelines for diabetes management',
  'How to prepare for a cardiovascular consultation',
  'Emergency triage warning signs for chest tightness',
  'PM Jan Aushadhi generic paracetamol options'
];

export const AIHealthAssistant = ({ isOpen, onClose, isPremium = false, user }) => {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5, isPremium: false, remaining: 5 });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      fetchUsage();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ai/conversations`, getHeaders());
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.warn('Failed to fetch conversations:', error);
    }
  };

  const fetchUsage = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ai/usage`, getHeaders());
      if (res.data) {
        setUsage(res.data);
      }
    } catch (error) {
      console.warn('Failed to fetch usage stats:', error);
    }
  };

  const loadConversation = async (conv) => {
    setActiveConversation(conv);
    try {
      const res = await axios.get(`${API_URL}/api/ai/conversations/${conv.id || conv._id}`, getHeaders());
      setMessages(Array.isArray(res.data) ? res.data : []);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Could not load chat messages.');
    }
  };

  const createNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSend = async (text = input) => {
    const messageToSend = text.trim();
    if (!messageToSend) return;

    if (!isPremium && usage.remaining !== undefined && usage.remaining <= 0) {
      toast.warning('Daily free query quota reached. Upgrade to Horizon Elite for unlimited AI access.');
      return;
    }

    let currentConvId = activeConversation?.id || activeConversation?._id || null;

    const userMessage = {
      role: 'user',
      content: messageToSend,
      id: Date.now().toString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/ai/chat`,
        { message: messageToSend, conversationId: currentConvId },
        getHeaders()
      );

      const aiMessage = {
        role: 'assistant',
        content: res.data.reply || 'Clinical response completed.',
        id: (Date.now() + 1).toString()
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Update usage from response
      if (res.data.usage) {
        setUsage((prev) => ({
          ...prev,
          used: res.data.usage.used,
          limit: res.data.usage.limit,
          isPremium: res.data.usage.isPremium,
          remaining: typeof res.data.usage.limit === 'number' ? Math.max(0, res.data.usage.limit - res.data.usage.used) : 999
        }));
      }

      // If a new conversation was created on the fly
      if (res.data.conversationId && (!activeConversation || activeConversation.id !== res.data.conversationId)) {
        const newConv = {
          id: res.data.conversationId,
          title: res.data.title || messageToSend.substring(0, 30),
          isPinned: false
        };
        setActiveConversation(newConv);
        setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      if (error.response?.status === 429) {
        const quotaData = error.response.data;
        setUsage((prev) => ({
          ...prev,
          used: quotaData.used || 5,
          limit: quotaData.limit || 5,
          remaining: 0
        }));
        toast.error('Daily message limit reached. Upgrade for unlimited AI consultations.');
      } else {
        const errMsg = error.response?.data?.error || 'AI engine is calibrating. Please retry.';
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/api/ai/conversations/${id}`, getHeaders());
      setConversations((prev) => prev.filter((c) => (c.id || c._id) !== id));
      if (activeConversation && (activeConversation.id === id || activeConversation._id === id)) {
        setActiveConversation(null);
        setMessages([]);
      }
      setMenuOpenId(null);
      toast.success('Conversation removed.');
    } catch (err) {
      toast.error('Failed to delete conversation.');
    }
  };

  const togglePin = async (conv, e) => {
    e.stopPropagation();
    const id = conv.id || conv._id;
    try {
      await axios.put(`${API_URL}/api/ai/conversations/${id}/pin`, {}, getHeaders());
      setConversations((prev) =>
        prev.map((c) => ((c.id || c._id) === id ? { ...c, isPinned: !c.isPinned } : c))
      );
      setMenuOpenId(null);
    } catch (err) {
      toast.error('Failed to pin conversation.');
    }
  };

  const renameConversation = async (id, newTitle) => {
    if (!newTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await axios.put(`${API_URL}/api/ai/conversations/${id}`, { title: newTitle }, getHeaders());
      setConversations((prev) =>
        prev.map((c) => ((c.id || c._id) === id ? { ...c, title: newTitle } : c))
      );
      setEditingId(null);
    } catch (err) {
      toast.error('Failed to rename conversation.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    setShowScrollBottom(!bottom && e.target.scrollTop > 0);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Clinical guidance copied to clipboard.');
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pinnedConvs = filteredConversations.filter((c) => c.isPinned);
  const recentConvs = filteredConversations.filter((c) => !c.isPinned);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#050814]/70 backdrop-blur-md"
        />

        {/* Cyber Drawer Viewport */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative w-full md:w-[72%] lg:w-[60%] xl:w-[50%] h-full bg-[#0A0F24] border-l border-cyan-500/30 shadow-2xl flex flex-col md:flex-row overflow-hidden text-[var(--text-primary)]"
        >
          {/* Sidebar */}
          <div
            className={`${
              sidebarOpen ? 'w-full md:w-[280px]' : 'w-0'
            } flex-shrink-0 border-r border-[var(--border-subtle)] flex flex-col transition-all duration-300 overflow-hidden bg-[#070B1E]`}
          >
            {/* New Chat Button */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2">
              <button
                onClick={createNewChat}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl gradient-primary text-white font-bold text-xs uppercase tracking-wider shadow-glow-cyan hover:brightness-110 transition-all"
              >
                <Plus className="h-4 w-4" /> New Session
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[var(--border-subtle)]">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Filter sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input w-full pl-9 pr-3 py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-none">
              {pinnedConvs.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 px-2 mb-1">
                    Pinned Consults
                  </h4>
                  {pinnedConvs.map((conv) => (
                    <ConversationItem
                      key={conv.id || conv._id}
                      conv={conv}
                      active={activeConversation}
                      onClick={() => loadConversation(conv)}
                      onMenuToggle={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                      }}
                      menuOpen={menuOpenId === conv.id}
                      onPin={(e) => togglePin(conv, e)}
                      onDelete={(e) => deleteConversation(conv.id, e)}
                      editing={editingId === conv.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      onStartEdit={(e) => {
                        e.stopPropagation();
                        setEditingId(conv.id);
                        setEditTitle(conv.title);
                        setMenuOpenId(null);
                      }}
                      onSaveEdit={() => renameConversation(conv.id, editTitle)}
                    />
                  ))}
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-2 mb-1">
                  Recent Sessions
                </h4>
                {recentConvs.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] px-2 py-4 text-center">
                    No active sessions recorded
                  </p>
                ) : (
                  recentConvs.map((conv) => (
                    <ConversationItem
                      key={conv.id || conv._id}
                      conv={conv}
                      active={activeConversation}
                      onClick={() => loadConversation(conv)}
                      onMenuToggle={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                      }}
                      menuOpen={menuOpenId === conv.id}
                      onPin={(e) => togglePin(conv, e)}
                      onDelete={(e) => deleteConversation(conv.id, e)}
                      editing={editingId === conv.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      onStartEdit={(e) => {
                        e.stopPropagation();
                        setEditingId(conv.id);
                        setEditTitle(conv.title);
                        setMenuOpenId(null);
                      }}
                      onSaveEdit={() => renameConversation(conv.id, editTitle)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Quota Progress */}
            <div className="p-3 border-t border-[var(--border-subtle)] bg-[#050814]/70">
              <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                <span className="text-[var(--text-muted)]">Daily Free Limit:</span>
                <span className="font-bold text-cyan-400">
                  {isPremium ? 'Unlimited' : `${usage.used} / ${usage.limit}`}
                </span>
              </div>
              {!isPremium && (
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-[#0077D4] transition-all duration-300"
                    style={{ width: `${Math.min(100, ((usage.used || 0) / (usage.limit || 5)) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Viewport */}
          <div className="flex-1 flex flex-col relative h-full bg-[#0A0F24]">
            {/* Top Bar */}
            <div className="h-16 border-b border-[var(--border-subtle)] flex items-center justify-between px-4 bg-[#070B1E]/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-xl glass text-[var(--text-muted)] hover:text-white"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                )}
                <div>
                  <h3 className="font-display font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                    <Bot className="h-4 w-4 text-cyan-400" />
                    <span>{activeConversation ? activeConversation.title : 'Gemini 2.0 Health Assistant'}</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    UNESCO Horizon Triage Node • Online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-none"
            >
              {!activeConversation && messages.length === 0 ? (
                /* Welcome Screen with Suggested Prompts */
                <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center px-4 py-8">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-glow-cyan">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[var(--text-primary)] mb-1">
                    UNESCO Horizon Clinical Triage
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-md">
                    Powered by Gemini 2.0. Receive clinical preliminary triage, Indian generic medicine guidance (PM Jan Aushadhi), and dietary advice.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="text-left p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all text-xs text-[var(--text-secondary)] hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  const text = msg.content || '';
                  const hasEmergencyWarning =
                    !isUser &&
                    (text.includes('🚨') ||
                      text.toLowerCase().includes('emergency') ||
                      text.toLowerCase().includes('urgent medical notice') ||
                      text.toLowerCase().includes('chest pain'));
                  const hasDietaryGuidance =
                    !isUser &&
                    (text.toLowerCase().includes('diet') ||
                      text.toLowerCase().includes('nutrition') ||
                      text.toLowerCase().includes('lifestyle'));
                  const hasDoctorRecommendation =
                    !isUser &&
                    (text.toLowerCase().includes('doctor') ||
                      text.toLowerCase().includes('physician') ||
                      text.toLowerCase().includes('specialist'));

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id || index}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full group`}
                    >
                      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0 mt-1">
                          {isUser ? (
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center text-xs font-bold font-mono">
                              {user?.fullName?.charAt(0) || 'P'}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white shadow-glow-cyan">
                              <Bot className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        {/* Bubble */}
                        <div className="space-y-2">
                          <div
                            className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isUser
                                ? 'gradient-primary text-white shadow-glow-cyan rounded-tr-none'
                                : 'bg-[#0E1535] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none shadow-md'
                            }`}
                          >
                            {isUser ? (
                              <p className="whitespace-pre-wrap">{text}</p>
                            ) : (
                              <div className="prose prose-invert prose-xs max-w-none space-y-2 text-xs">
                                <ReactMarkdown
                                  components={{
                                    strong: ({ node, ...props }) => (
                                      <strong className="font-bold text-cyan-300" {...props} />
                                    ),
                                    p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-1" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-1" {...props} />,
                                    li: ({ node, ...props }) => <li className="my-0.5" {...props} />
                                  }}
                                >
                                  {text}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>

                          {/* Contextual Clinical Alert Chips */}
                          {!isUser && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {hasEmergencyWarning && (
                                <button
                                  onClick={() => {
                                    onClose();
                                    navigate('/doctors?specialty=Emergency+Medicine');
                                  }}
                                  className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-glow-emergency flex items-center gap-1.5 animate-pulse"
                                >
                                  <Zap className="h-3 w-3 fill-white" />
                                  10-Min SLA Emergency SOS
                                </button>
                              )}

                              {hasDietaryGuidance && (
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <Apple className="h-3 w-3" />
                                  UNESCO Nutrition Guide
                                </span>
                              )}

                              {hasDoctorRecommendation && (
                                <button
                                  onClick={() => {
                                    onClose();
                                    navigate('/doctors');
                                  }}
                                  className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider glass border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-1 transition-colors"
                                >
                                  <Stethoscope className="h-3 w-3 text-cyan-400" />
                                  Find Specialist
                                </button>
                              )}

                              <button
                                onClick={() => copyToClipboard(text)}
                                className="ml-auto text-[10px] text-[var(--text-muted)] hover:text-white flex items-center gap-1"
                              >
                                <Copy className="h-3 w-3" /> Copy
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {loading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white shadow-glow-cyan">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#0E1535] border border-[var(--border-subtle)] flex items-center gap-2 text-xs text-cyan-400 font-mono">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <span>Synthesizing clinical response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Form */}
            <div className="p-3.5 border-t border-[var(--border-subtle)] bg-[#070B1E]">
              {!isPremium && usage.remaining !== undefined && usage.remaining <= 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                  <p className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                    <Lock className="h-3.5 w-3.5" /> Daily Query Limit Reached
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Upgrade to Horizon Elite for unlimited 24/7 AI consultations.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about symptoms, generics (Jan Aushadhi), vitals..."
                    className="glass-input flex-1 text-xs py-2.5 px-3.5"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2.5 gradient-primary rounded-xl text-white shadow-glow-cyan disabled:opacity-50 hover:brightness-110 transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const ConversationItem = ({
  conv,
  active,
  onClick,
  onMenuToggle,
  menuOpen,
  onPin,
  onDelete,
  editing,
  editTitle,
  setEditTitle,
  onStartEdit,
  onSaveEdit
}) => {
  const isActive = active && (active.id === conv.id || active._id === conv._id);

  return (
    <div
      onClick={onClick}
      className={`relative group flex items-center p-2.5 my-0.5 rounded-xl cursor-pointer transition-colors text-xs ${
        isActive
          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
          : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-white'
      }`}
    >
      <MessageSquare className={`h-3.5 w-3.5 mr-2 shrink-0 ${isActive ? 'text-cyan-400' : 'text-[var(--text-muted)]'}`} />

      <div className="flex-1 overflow-hidden">
        {editing ? (
          <input
            autoFocus
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={onSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
            className="w-full bg-transparent border-b border-cyan-400 focus:outline-none text-xs text-white"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate block font-medium">{conv.title || 'Session'}</span>
        )}
      </div>

      <button
        onClick={onMenuToggle}
        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-white"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>

      {/* Menu */}
      {menuOpen && (
        <div
          className="absolute right-4 top-8 w-32 bg-[#070B1E] rounded-xl shadow-xl border border-cyan-500/30 z-50 overflow-hidden py-1 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onPin}
            className="w-full flex items-center px-3 py-1.5 text-[var(--text-secondary)] hover:bg-white/10"
          >
            <Pin className="h-3 w-3 mr-2" /> {conv.isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            onClick={onStartEdit}
            className="w-full flex items-center px-3 py-1.5 text-[var(--text-secondary)] hover:bg-white/10"
          >
            <Edit2 className="h-3 w-3 mr-2" /> Rename
          </button>
          <button
            onClick={onDelete}
            className="w-full flex items-center px-3 py-1.5 text-rose-400 hover:bg-rose-500/10"
          >
            <Trash2 className="h-3 w-3 mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default AIHealthAssistant;
