import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, ArrowUpRight, History, Gift, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const EliteWallet = () => {
  const [data, setData] = useState({ wallet_balance: 0, referral_count: 0 });
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/users/wallet`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) { console.error("Wallet error"); }
    };
    fetchWallet();
  }, [backendUrl]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden group"
    >
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>

      <div className="bg-slate-900 border border-yellow-500/20 rounded-[2rem] p-8 shadow-2xl">
        <div className="flex justify-between items-start mb-8">
          <div className="bg-yellow-500/10 p-3 rounded-2xl">
            <Wallet className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-yellow-500/50 uppercase tracking-[0.2em]">AegisGlobal Credits</span>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-1">
              <Sparkles className="h-3 w-3" /> Secure
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Available Balance</p>
          <h2 className="text-5xl font-serif font-bold text-white flex items-baseline gap-2">
            <span className="text-2xl text-yellow-500">₹</span>
            {data.wallet_balance.toLocaleString('en-IN')}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-yellow-600/10">
            Use Credits <ArrowUpRight className="h-3 w-3" />
          </button>
          <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-xs transition-all">
            <History className="h-3 w-3" /> History
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-slate-500" />
                <span className="text-xs text-slate-500">Referrals: <span className="text-white font-bold">{data.referral_count}</span></span>
            </div>
            <p className="text-[9px] text-slate-600 italic">1 Credit = ₹1.00</p>
        </div>
      </div>
    </motion.div>
  );
};

export default EliteWallet;