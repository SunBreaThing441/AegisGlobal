import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Check, Crown, Loader2, X, Sparkles, Zap, Shield, Bot, Heart, Clock, Star, Video, ChevronDown, ArrowRight, Gift } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import ParticleBackground from '../components/ui/ParticleBackground';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const Subscribe = () => {
  const { user, isPremium } = useContext(AuthContext);
  const [loading, setLoading] = useState(null); // 'monthly' | 'annual' | null
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [subscription, setSubscription] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (isPremium) {
      const fetchSub = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${backendUrl}/api/payment/subscription-status`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSubscription(res.data);
        } catch (err) { /* no active subscription */ }
      };
      fetchSub();
    }
  }, [isPremium, backendUrl]);

  const handleCheckout = async (planType) => {
    setLoading(planType);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/api/payment/create-checkout-session`,
        { planType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to create payment session");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not initiate payment");
    } finally { setLoading(null); }
  };

  const features = [
    { icon: Bot, title: 'AI Health Assistant', desc: 'Unlimited AI-powered consultations with medical context', free: '5/day', premium: 'Unlimited' },
    { icon: Zap, title: 'Priority Emergency', desc: 'Skip the queue for emergency appointments', free: false, premium: true },
    { icon: Crown, title: 'VIP Doctor Badge', desc: 'Doctors see your premium status for prioritized care', free: false, premium: true },
    { icon: Video, title: 'Priority Video', desc: 'Priority access to video consultations', free: false, premium: true },
    { icon: Gift, title: 'Referral Rewards', desc: 'Earn ₹200 for every friend who upgrades', free: false, premium: true },
    { icon: Star, title: 'Premium Theme', desc: 'Exclusive gold luxury healthcare experience', free: false, premium: true },
    { icon: Heart, title: 'Health Insights', desc: 'AI-generated health summaries and analytics', free: false, premium: true },
    { icon: Shield, title: 'Premium Support', desc: '24/7 priority customer support', free: 'Email', premium: '24/7 Priority' },
  ];

  const faqs = [
    { q: 'What happens when I subscribe?', a: 'Your account is instantly upgraded. The entire app transforms with a premium gold theme, and you get unlimited AI health consultations, priority scheduling, and VIP status visible to all doctors.' },
    { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time from your Premium Perks page. You\'ll retain access until the end of your billing period.' },
    { q: 'Is the AI assistant a real doctor?', a: 'No. The AI Health Assistant provides general health guidance, lifestyle tips, and medication information. It always recommends consulting an AegisGlobal doctor for formal diagnosis.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards through our secure Stripe payment gateway. All transactions are encrypted and PCI-compliant.' },
    { q: 'Will I lose my data if I cancel?', a: 'No. All your appointments, prescriptions, medical records, and AI conversation history are retained even after cancellation.' },
  ];

  // If user is already premium, show subscription management
  if (isPremium) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg premium-glow">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">
              You're <span className="premium-gradient-text">Premium</span>
            </h1>
            <p className="text-[var(--text-muted)] mt-2">Manage your subscription and billing</p>
          </motion.div>

          <GlassCard hover={false} padding="lg" className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Current Plan</p>
                <h3 className="text-xl font-display font-bold text-amber-500">{subscription?.plan_type === 'annual' ? 'Elite Annual' : 'Elite Monthly'}</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
            </div>
            {subscription?.expires_at && (
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Next billing date</span>
                  <span className="font-semibold text-[var(--text-primary)]">{new Date(subscription.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            )}
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <Link to="/premium-perks">
              <GlassCard className="text-center">
                <Gift className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">Referrals & Perks</p>
              </GlassCard>
            </Link>
            <Link to="/premium-perks">
              <GlassCard className="text-center">
                <Clock className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">Billing History</p>
              </GlassCard>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleBackground particleCount={30} color="amber" speed={0.2} />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl">
              <Crown className="h-10 w-10 text-white" />
            </motion.div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Sparkles className="h-3 w-3" /> Premium Healthcare
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-[var(--text-primary)] mb-4">
              Upgrade to <br /><span className="premium-gradient-text">AegisGlobal Horizon Premium</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto">
              Unlock AI-powered health insights, priority scheduling, and an exclusive luxury experience.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-10">
            <div className="glass-card inline-flex p-1 gap-1 !rounded-xl">
              <button onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                Monthly
              </button>
              <button onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                Annual <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">Save 17%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
            {/* Basic */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard hover={false} padding="lg" className="h-full flex flex-col">
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-[var(--text-muted)]" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-1">Standard</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-bold text-[var(--text-primary)]">Free</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-2">Essential healthcare features</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.slice(0, 5).map(f => (
                    <li key={f.title} className={`flex items-center gap-3 text-sm ${f.free ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)] opacity-40'}`}>
                      {f.free ? <Check className="h-4 w-4 text-cyan-500 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
                      <span>{f.title}</span>
                      {typeof f.free === 'string' && <span className="ml-auto text-xs text-[var(--text-muted)]">{f.free}</span>}
                    </li>
                  ))}
                </ul>
                <button disabled className="w-full py-3.5 rounded-xl font-semibold glass border border-[var(--border-primary)] text-[var(--text-muted)] cursor-not-allowed">
                  Current Plan
                </button>
              </GlassCard>
            </motion.div>

            {/* Premium */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="p-0.5 rounded-2xl bg-gradient-to-b from-amber-500/60 via-amber-500/20 to-amber-500/60 h-full premium-glow">
                <GlassCard hover={false} padding="lg" className="h-full flex flex-col !rounded-[0.9rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                    ✨ Recommended
                  </div>
                  <div className="absolute inset-0 premium-shimmer pointer-events-none" />

                  <div className="mb-6 relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-amber-500 mb-1">Elite Premium</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display font-bold text-[var(--text-primary)]">
                        {billingCycle === 'annual' ? '₹15,999' : '₹1,599'}
                      </span>
                      <span className="text-sm text-[var(--text-muted)]">/ {billingCycle === 'annual' ? 'year' : 'month'}</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-xs text-emerald-500 font-semibold mt-1">That's ₹1,333/mo — save ₹3,189/year</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1 relative">
                    {features.map(f => (
                      <li key={f.title} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                        <Check className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>{f.title}</span>
                        {typeof f.premium === 'string' && <span className="ml-auto text-xs text-amber-500 font-semibold">{f.premium}</span>}
                      </li>
                    ))}
                  </ul>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleCheckout(billingCycle)}
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg disabled:opacity-50 flex justify-center items-center gap-2 relative">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                      <Zap className="h-4 w-4 fill-white" /> Upgrade to Premium
                    </>}
                  </motion.button>
                </GlassCard>
              </div>
            </motion.div>
          </div>

          {/* Feature Comparison Table */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-display font-bold text-center text-[var(--text-primary)] mb-8">
              Feature <GradientText gradient="accent">Comparison</GradientText>
            </h2>
            <GlassCard hover={false} padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-primary)]">
                      <th className="text-left p-4 text-sm font-semibold text-[var(--text-muted)]">Feature</th>
                      <th className="text-center p-4 text-sm font-semibold text-[var(--text-muted)]">Standard</th>
                      <th className="text-center p-4 text-sm font-semibold text-amber-500">Premium ✨</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((f, i) => (
                      <tr key={f.title} className={i < features.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <f.icon className="h-4 w-4 text-[var(--text-muted)]" />
                            <div>
                              <p className="text-sm font-semibold text-[var(--text-primary)]">{f.title}</p>
                              <p className="text-xs text-[var(--text-muted)]">{f.desc}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center p-4">
                          {typeof f.free === 'string' ? (
                            <span className="text-xs font-semibold text-[var(--text-muted)]">{f.free}</span>
                          ) : f.free ? (
                            <Check className="h-4 w-4 text-cyan-500 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-[var(--text-muted)] opacity-30 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-4">
                          {typeof f.premium === 'string' ? (
                            <span className="text-xs font-bold text-amber-500">{f.premium}</span>
                          ) : (
                            <Check className="h-4 w-4 text-amber-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-display font-bold text-center text-[var(--text-primary)] mb-8">
              Frequently Asked <GradientText gradient="primary">Questions</GradientText>
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <GlassCard key={i} hover={false} padding="none" className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-semibold text-[var(--text-primary)] pr-4">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-[var(--text-muted)] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5 text-sm text-[var(--text-muted)] leading-relaxed">{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center pb-10">
            <p className="text-[var(--text-muted)] text-sm mb-4">Join thousands of patients who've upgraded their healthcare experience</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleCheckout(billingCycle)}
              disabled={loading}
              className="px-10 py-4 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg inline-flex items-center gap-2">
              <Crown className="h-5 w-5" /> Start Premium Today <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;