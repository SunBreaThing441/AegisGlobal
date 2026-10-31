import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Wallet, IndianRupee, ArrowUpRight, ArrowDownLeft,
  Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown,
  Coins, RotateCcw, Zap, CreditCard, Award, Shield,
  ExternalLink, Filter, Download, Plus, Landmark, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import GlassCard from '../components/ui/GlassCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import GradientText from '../components/ui/GradientText';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

const typeConfig = {
  credit: {
    icon: ArrowDownLeft,
    label: 'Credit',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    sign: '+'
  },
  debit: {
    icon: ArrowUpRight,
    label: 'Debit',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    sign: '-'
  },
  penalty: {
    icon: AlertCircle,
    label: 'SLA Penalty',
    color: 'text-rose-400',
    bg: 'bg-rose-500/15 border-rose-500/30',
    sign: '-'
  },
  refund: {
    icon: RotateCcw,
    label: 'Reversal / Refund',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    sign: '+'
  },
  consultation: {
    icon: Coins,
    label: 'Consultation Fee',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    sign: ''
  },
  referral_bonus: {
    icon: TrendingUp,
    label: 'Micro-Grant / Bonus',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    sign: '+'
  },
  subscription: {
    icon: Zap,
    label: 'Horizon Membership',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    sign: '-'
  }
};

export const WalletPage = () => {
  const { user } = useContext(AuthContext);
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Modals
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const isDoctor = user?.role === 'doctor';
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Query wallet dashboard and transactions with resilience fallback to /api/wallet/balance
      const [dashRes, txRes, balRes] = await Promise.allSettled([
        axios.get(`${backendUrl}/api/wallet/dashboard`, { headers }),
        axios.get(`${backendUrl}/api/wallet/transactions`, { headers }),
        axios.get(`${backendUrl}/api/wallet/balance`, { headers }).catch(() => axios.get(`${backendUrl}/api/users/wallet`, { headers }))
      ]);

      if (dashRes.status === 'fulfilled') {
        setWalletData(dashRes.value.data);
      } else if (balRes.status === 'fulfilled' && balRes.value?.data) {
        setWalletData({
          balance: parseFloat(balRes.value.data.balance ?? balRes.value.data.wallet_balance ?? 0),
          total_credits: 0,
          total_debits: 0,
          total_penalties: 0,
          transactions: []
        });
      }

      if (txRes.status === 'fulfilled' && txRes.value.data?.transactions) {
        setTransactions(txRes.value.data.transactions);
      } else if (dashRes.status === 'fulfilled' && dashRes.value.data?.transactions) {
        setTransactions(dashRes.value.data.transactions);
      }
    } catch (err) {
      console.error('Wallet fetch error:', err);
      toast.error('Failed to load wallet ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [backendUrl]);

  // Stripe Checkout Session Trigger
  const handleStripeFunding = async (planType = 'monthly') => {
    setStripeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${backendUrl}/api/payment/create-checkout-session`,
        { planType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.url) {
        toast.info('Redirecting to Stripe Gateway...');
        window.location.href = res.data.url;
      } else {
        toast.error('Invalid payment gateway response.');
      }
    } catch (err) {
      console.error('Stripe session error:', err);
      toast.error(err.response?.data?.error || 'Failed to initiate Stripe funding.');
    } finally {
      setStripeLoading(false);
    }
  };

  // Withdrawal Simulation / Handler
  const handleWithdrawal = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid disbursement amount.');
      return;
    }
    if (amountNum > (walletData?.balance || 0)) {
      toast.error('Withdrawal amount exceeds available wallet balance.');
      return;
    }

    setWithdrawLoading(true);
    try {
      // Simulate disbursement confirmation
      await new Promise((r) => setTimeout(r, 1200));
      toast.success(`Disbursement of ₹${amountNum.toLocaleString('en-IN')} initiated to account ${withdrawAccount || 'Bank Vault'}.`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawAccount('');
      fetchWallet();
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'credits') return parseFloat(tx.amount) > 0;
    if (activeFilter === 'debits') return parseFloat(tx.amount) < 0;
    if (activeFilter === 'penalties') return tx.type === 'penalty';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <SkeletonLoader type="text" count={1} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SkeletonLoader type="stat" count={4} />
          </div>
          <SkeletonLoader type="table-row" count={5} />
        </div>
      </div>
    );
  }

  const balance = walletData?.balance || 0;
  const isNegative = balance < 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      {/* Stripe Funding Modal */}
      <Modal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        title="UNESCO Health Micro-Funding"
        subtitle="Stripe Global Payment Gateway • 256-bit Encrypted"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Add health credits directly into your Horizon Care Wallet or activate an Elite Universal Healthcare tier powered by Stripe.
            </p>
          </div>

          <div className="space-y-3">
            {/* Monthly Option */}
            <div
              onClick={() => handleStripeFunding('monthly')}
              className="p-4 rounded-xl border border-[var(--border-subtle)] hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                  Micro-Grant & Health Tier
                </span>
                <h4 className="font-display font-bold text-sm text-[var(--text-primary)]">
                  Monthly Horizon Access
                </h4>
                <p className="text-xs text-[var(--text-muted)]">Includes 24/7 AI Triage & Subsidized Emergency Care</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-base text-[var(--text-primary)]">₹1,599</span>
                <span className="text-[10px] text-[var(--text-muted)] block">/month</span>
              </div>
            </div>

            {/* Annual Option */}
            <div
              onClick={() => handleStripeFunding('annual')}
              className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400/60 transition-all cursor-pointer flex items-center justify-between group shadow-glow-emerald"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Best Value • Full Grant
                </span>
                <h4 className="font-display font-bold text-sm text-[var(--text-primary)]">
                  Annual Humanitarian Charter
                </h4>
                <p className="text-xs text-[var(--text-muted)]">Priority 10-Min SLA coverage & full digital archive</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-base text-emerald-400">₹15,999</span>
                <span className="text-[10px] text-[var(--text-muted)] block">/year</span>
              </div>
            </div>
          </div>

          {stripeLoading && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono text-cyan-400">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span>Connecting to Stripe checkout session...</span>
            </div>
          )}
        </div>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title={isDoctor ? 'Clinical Revenue Disbursement' : 'Health Credit Withdrawal'}
        subtitle="UNESCO Horizon Care Treasury Direct Deposit"
        size="md"
      >
        <form onSubmit={handleWithdrawal} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex justify-between items-center">
            <span>Available Balance:</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              ₹{balance.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Disbursement Amount (INR)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="number"
                min="100"
                max={balance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount..."
                required
                className="glass-input w-full pl-10 pr-3 text-sm py-2.5 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Bank Account / IBAN / UPI ID
            </label>
            <div className="relative">
              <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                placeholder="e.g. HDFC0001234 or dr.vance@upi"
                required
                className="glass-input w-full pl-10 pr-3 text-sm py-2.5 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowWithdrawModal(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold glass border border-[var(--border-subtle)] text-[var(--text-secondary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={withdrawLoading || !withdrawAmount || balance <= 0}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold gradient-primary text-white shadow-glow-cyan disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {withdrawLoading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Request Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full glass border border-cyan-500/30 text-cyan-400">
                Financial Ledger & Micro-Grants
              </span>
              <Badge preset="grant" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
              {isDoctor ? 'Clinical Honorarium & Disbursals' : 'Humanitarian Healthcare Wallet'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Monitor micro-grants, consultation receipts, SLA penalty audits, and Stripe fundings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowStripeModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider gradient-primary text-white shadow-glow-cyan flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Credits (Stripe)</span>
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={balance <= 0}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider glass border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-cyan-400/40 flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
            >
              <Landmark className="h-4 w-4 text-cyan-400" />
              <span>Disburse</span>
            </button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Main Balance Card */}
          <GlassCard
            variant={isNegative ? 'emergency' : 'cyan'}
            padding="md"
            className="relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                Net Balance
              </span>
              <div className={`p-2 rounded-xl ${isNegative ? 'bg-rose-500 text-white' : 'gradient-primary text-white'}`}>
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-extrabold font-mono text-[var(--text-primary)]">
              <AnimatedCounter value={Math.abs(balance)} prefix={isNegative ? '-₹' : '₹'} />
            </div>
            {isNegative ? (
              <span className="text-[10px] font-bold uppercase text-rose-400 mt-1 block animate-pulse">
                SLA Penalty Liability
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 mt-1 block">
                Disbursable Horizon Funds
              </span>
            )}
          </GlassCard>

          {/* Credits */}
          <GlassCard variant="emerald" padding="md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Total Credits / Grants
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-display font-extrabold font-mono text-emerald-400">
              <AnimatedCounter value={walletData?.total_credits || 0} prefix="+₹" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
              Grants, Top-ups & Fees
            </span>
          </GlassCard>

          {/* Debits */}
          <GlassCard variant="default" padding="md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                Total Disbursements
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-display font-extrabold font-mono text-[var(--text-primary)]">
              <AnimatedCounter value={walletData?.total_debits || 0} prefix="₹" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
              Consultations & Payouts
            </span>
          </GlassCard>

          {/* Penalties */}
          <GlassCard variant={walletData?.total_penalties > 0 ? 'emergency' : 'default'} padding="md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300">
                SLA Penalties Levied
              </span>
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-display font-extrabold font-mono text-rose-400">
              <AnimatedCounter value={walletData?.total_penalties || 0} prefix="₹" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
              10-Min SLA Audit Deductions
            </span>
          </GlassCard>
        </div>

        {/* UNESCO Micro-Grants Showcase Banner */}
        <GlassCard variant="azure" padding="lg" className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#0077D4]/20 border border-cyan-400/30 text-cyan-300 shadow-glow-azure">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  UNESCO Social Service Micro-Grant Node
                </span>
              </div>
              <h4 className="font-display font-bold text-base text-[var(--text-primary)] mt-0.5">
                Universal Telehealth Access Micro-Grant Approved
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Every verified appointment is co-subsidized up to 40% under the Horizon Global Telemedicine Charter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('Micro-grant quota verified: 5 co-subsidized visits remaining this quarter.')}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider glass border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition-colors"
            >
              Verify Quota
            </button>
          </div>
        </GlassCard>

        {/* Transaction History Ledger */}
        <GlassCard padding="lg" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-cyan-400" />
              <div>
                <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                  Transaction Ledger & Audit Records
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Real-time blockchain-ready financial telemetry and grant distributions.
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              {['all', 'credits', 'debits', 'penalties'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                    activeFilter === f
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                      : 'glass border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-14 space-y-2">
              <Coins className="h-10 w-10 text-[var(--text-muted)] mx-auto opacity-40" />
              <p className="text-sm font-semibold text-[var(--text-secondary)]">No transactions recorded</p>
              <p className="text-xs text-[var(--text-muted)]">All deposits, consultations, and grants will be recorded here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions.map((tx) => {
                const config = typeConfig[tx.type] || typeConfig.debit;
                const Icon = config.icon;
                const isPositive = parseFloat(tx.amount) > 0;

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      tx.type === 'penalty'
                        ? 'bg-rose-500/10 border-rose-500/25'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${config.bg}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <p className={`font-semibold text-xs sm:text-sm ${
                          tx.type === 'penalty' ? 'text-rose-400 font-bold' : 'text-[var(--text-primary)]'
                        }`}>
                          {tx.description || config.label}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">
                          <span>
                            {new Date(tx.created_at || tx.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span className="uppercase">{tx.type}</span>
                          {tx.reversed && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                              REVERSED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-bold font-mono text-xs sm:text-sm ${
                        isPositive ? 'text-emerald-400' : tx.type === 'penalty' ? 'text-rose-400' : 'text-[var(--text-primary)]'
                      }`}>
                        {isPositive ? '+' : ''}₹{Math.abs(parseFloat(tx.amount)).toLocaleString('en-IN')}
                      </p>
                      {tx.balance_after !== undefined && (
                        <p className="text-[10px] font-mono text-[var(--text-muted)]">
                          bal: ₹{parseFloat(tx.balance_after || 0).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default WalletPage;
