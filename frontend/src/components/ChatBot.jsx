import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bot, Sparkles, Zap, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIHealthAssistant from './AIHealthAssistant';

export const Chatbot = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const isPremium = Boolean(user.is_premium);

  return (
    <>
      {/* AI Panel Viewport */}
      <AIHealthAssistant
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isPremium={isPremium}
        user={user}
      />

      {/* Floating Futuristic Trigger */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-14 w-14 rounded-2xl gradient-primary text-white shadow-glow-cyan flex items-center justify-center transition-all group"
          title="UNESCO Horizon AI Triage Assistant"
        >
          {/* Animated Glow Aura */}
          <div className="absolute inset-0 rounded-2xl bg-cyan-400 opacity-20 blur-md group-hover:opacity-40 transition-opacity animate-pulse" />

          {/* Icon */}
          <Bot className="h-6 w-6 relative z-10 text-white" />

          {/* Active Online Beacon */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0A0F24]" />
          </span>

          {/* Micro Tooltip */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl glass border border-cyan-500/30 text-xs font-bold text-white whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            UNESCO AI Triage
          </span>
        </motion.button>
      </div>
    </>
  );
};

export default Chatbot;
