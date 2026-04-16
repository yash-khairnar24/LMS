import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import {
  PlayCircle, BookOpen, HelpCircle, Video, ClipboardCheck,
  Clock, MessageSquareText, PhoneCall, CheckCircle, ArrowLeft,
  Sparkles, Lock, Crown, Zap, Users, Star, ChevronRight,
  Wifi, Shield
} from 'lucide-react';

const FEATURE_META = {
  feature_live_class:     { label: 'Live Class',     icon: PlayCircle,        color: 'text-rose-500',    bg: 'bg-rose-50',    ring: 'ring-rose-200'    },
  feature_study_material: { label: 'Study Material', icon: BookOpen,          color: 'text-blue-500',    bg: 'bg-blue-50',    ring: 'ring-blue-200'    },
  feature_ask_doubt:      { label: 'Ask Doubt',      icon: HelpCircle,        color: 'text-amber-500',   bg: 'bg-amber-50',   ring: 'ring-amber-200'   },
  feature_recording:      { label: 'Recording',      icon: Video,             color: 'text-red-500',     bg: 'bg-red-50',     ring: 'ring-red-200'     },
  feature_assignment:     { label: 'Assignment',     icon: ClipboardCheck,    color: 'text-purple-500',  bg: 'bg-purple-50',  ring: 'ring-purple-200'  },
  feature_smart_test:     { label: 'Smart Test',     icon: Clock,             color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  feature_chat:           { label: 'Chat',           icon: MessageSquareText, color: 'text-sky-500',     bg: 'bg-sky-50',     ring: 'ring-sky-200'     },
  feature_support:        { label: 'Support',        icon: PhoneCall,         color: 'text-fuchsia-500', bg: 'bg-fuchsia-50', ring: 'ring-fuchsia-200' },
};

const PLAN_GLOWS = [
  { shadow: '0 0 45px 10px rgba(99,102,241,0.3)',  border: '#6366f1', gradient: 'from-indigo-500 to-indigo-600'   },
  { shadow: '0 0 45px 10px rgba(168,85,247,0.3)',  border: '#a855f7', gradient: 'from-purple-500 to-purple-600'   },
  { shadow: '0 0 45px 10px rgba(236,72,153,0.3)',  border: '#ec4899', gradient: 'from-pink-500 to-pink-600'       },
  { shadow: '0 0 45px 10px rgba(16,185,129,0.3)',  border: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
  { shadow: '0 0 45px 10px rgba(245,158,11,0.3)',  border: '#f59e0b', gradient: 'from-amber-500 to-amber-600'     },
];

// ── Plan Card ────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, index, isPopular, onSelect }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const glow = PLAN_GLOWS[index % PLAN_GLOWS.length];

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: hovered || isPopular ? glow.border : '#e2e8f0',
        boxShadow: hovered ? glow.shadow : isPopular ? `0 0 30px 5px ${glow.border}40` : '0 1px 3px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-8px) scale(1.015)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="bg-white rounded-3xl flex flex-col cursor-pointer"
    >
      {/* Mouse spotlight */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: mousePos.x - 100,
            top: mousePos.y - 100,
            width: 200, height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glow.border}18 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Popular banner */}
      {isPopular && (
        <div
          className={`bg-gradient-to-r ${glow.gradient} text-white text-center text-xs font-bold py-2.5 tracking-widest uppercase flex items-center justify-center gap-2 relative z-10`}
        >
          <Star className="h-3.5 w-3.5 fill-white" /> Most Popular
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col relative z-10">
        {/* Plan name */}
        <h3 className="text-lg font-bold text-slate-800 mb-1">{plan.name}</h3>

        {/* Price */}
        <div className="mt-1 mb-5">
          {plan.price == 0 ? (
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-emerald-600">Free</span>
            </div>
          ) : (
            <div className="flex items-end gap-1">
              <span className="text-sm font-bold text-slate-400 mb-2">₹</span>
              <span className="text-4xl font-extrabold text-slate-800">
                {parseFloat(plan.price).toLocaleString()}
              </span>
            </div>
          )}
          <p className="text-xs text-slate-400 font-medium mt-0.5">One-time payment · Lifetime access</p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100 mb-4" />

        {/* Features */}
        <div className="space-y-2.5 flex-1">
          {Object.entries(FEATURE_META).map(([key, meta]) => {
            const Icon = meta.icon;
            const included = !!plan[key];
            return (
              <div key={key} className={`flex items-center gap-2.5 text-sm ${included ? 'text-slate-700' : 'text-slate-300'}`}>
                <div className={`w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full ${included ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {included
                    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    : <Lock className="h-3 w-3 text-slate-300" />
                  }
                </div>
                <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${included ? meta.color : 'text-slate-300'}`} strokeWidth={1.8} />
                <span className={`${included ? 'font-medium' : 'line-through decoration-slate-200'}`}>{meta.label}</span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={() => onSelect(plan)}
          style={isPopular || hovered ? { background: `linear-gradient(135deg, ${glow.border}, ${glow.border}cc)` } : {}}
          className={`mt-6 w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${
            isPopular || hovered
              ? 'text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {plan.price == 0 ? (
            <><Zap className="h-4 w-4" /> Get Free Access</>
          ) : (
            <>Pay ₹{parseFloat(plan.price).toLocaleString()} <ChevronRight className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ClassPlanView = () => {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [classInfo, setClassInfo] = useState(null);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const [meetingCode, setMeetingCode] = useState('');
  const [joinResult, setJoinResult] = useState(null);
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadAll();
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [classId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [clsRes, plansRes, subRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/classes/${classId}`, { headers }),
        axios.get(`http://localhost:5000/api/plans/class/${classId}`, { headers }),
        axios.get(`http://localhost:5000/api/plans/my-subscription/${classId}`, { headers }),
      ]);
      setClassInfo(clsRes.data.class);
      setPlans(plansRes.data.plans);
      setSubscription(subRes.data.subscription);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFreeEnroll = async (plan) => {
    try {
      await axios.post('http://localhost:5000/api/plans/subscribe',
        { plan_id: plan.id, class_id: parseInt(classId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleSelectPlan = (plan) => {
    if (plan.price == 0) { handleFreeEnroll(plan); }
    else { navigate(`/student/class/${classId}/pay/${plan.id}`); }
  };

  const handleJoinCode = async () => {
    if (!meetingCode.trim()) return;
    setJoining(true); setJoinError(''); setJoinResult(null);
    try {
      const res = await axios.post('http://localhost:5000/api/plans/meetings/join',
        { meeting_code: meetingCode.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoinResult(res.data.meeting);
    } catch (err) { setJoinError(err.response?.data?.message || 'Invalid code.'); }
    finally { setJoining(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">Loading class details…</p>
        </div>
      </div>
    );
  }

  const sub = subscription;
  const hasSubscription = !!sub;
  const popularIdx = Math.floor(plans.length / 2);

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(160deg, #f8faff 0%, #f1f4ff 50%, #faf5ff 100%)' }}>

      {/* ── Sticky Glassmorphism Back Bar ────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-md py-3'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 px-4 py-2 rounded-xl ${
              scrolled
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-white/90 hover:text-white hover:bg-white/15'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          {scrolled && classInfo && (
            <span className="text-slate-700 font-bold text-sm truncate max-w-xs hidden sm:block">
              {classInfo.class_name}
            </span>
          )}

          {hasSubscription && (
            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
              scrolled ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-white/20 text-white backdrop-blur-sm'
            }`}>
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              {sub.plan_name}
            </div>
          )}
        </div>
      </div>

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden pt-16"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
          minHeight: '280px',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-40px] left-[-40px] w-56 h-56 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a5b4fc 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 60%)' }} />

        {/* Mesh grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,1) 30px, rgba(255,255,255,1) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,1) 30px, rgba(255,255,255,1) 31px)',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 pb-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-medium mb-6">
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span>Classes</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-bold">{classInfo?.class_name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-4 border border-white/20">
                <BookOpen className="h-3 w-3" />
                Online Course
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
                {classInfo?.class_name}
              </h1>

              <div className="flex items-center gap-3 flex-wrap mt-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-indigo-100 text-sm font-medium">By <span className="text-white font-bold">{classInfo?.teacher_name}</span></span>
                </div>
                <span className="text-white/30">•</span>
                <div className="flex items-center gap-1 text-indigo-100 text-sm">
                  <Shield className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-emerald-300 font-semibold">Verified</span>
                </div>
              </div>
            </div>

            {hasSubscription && (
              <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 flex items-center gap-3">
                <div className="bg-amber-400/20 p-2.5 rounded-xl">
                  <Crown className="h-6 w-6 text-amber-300" />
                </div>
                <div>
                  <p className="text-indigo-100 text-xs font-medium">Active Plan</p>
                  <p className="text-white font-extrabold text-lg leading-tight">{sub.plan_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full" style={{ display: 'block', fill: '#f8faff' }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </div>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── JOIN BY CODE ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-indigo-50 p-2.5 rounded-xl">
              <Wifi className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Join a Live Session</h2>
              <p className="text-slate-400 text-xs font-medium">Enter the meeting code your teacher shared</p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  maxLength={20}
                  placeholder="ENTER MEETING CODE  (e.g. AB12CD34)"
                  value={meetingCode}
                  onChange={e => { setMeetingCode(e.target.value.toUpperCase()); setJoinError(''); setJoinResult(null); }}
                  onKeyDown={e => e.key === 'Enter' && handleJoinCode()}
                  className="w-full px-5 py-3.5 border border-slate-200 hover:border-indigo-300 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono tracking-widest text-slate-700 uppercase placeholder:text-slate-300 placeholder:text-sm placeholder:tracking-wider transition-all"
                />
              </div>
              <button
                onClick={handleJoinCode}
                disabled={joining || !meetingCode.trim()}
                className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-2xl font-bold transition-all duration-200 active:scale-95 shadow-sm shadow-indigo-200 whitespace-nowrap flex items-center gap-2"
              >
                {joining ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Joining…</>
                ) : (
                  <>Join <ChevronRight className="h-4 w-4" /></>
                )}
              </button>
            </div>

            {joinError && (
              <div className="mt-3 flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                <span className="text-red-400">⚠</span> {joinError}
              </div>
            )}

            {joinResult && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                  <div className="bg-emerald-100 p-1.5 rounded-full">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  Joined successfully!
                </div>
                <p className="text-slate-700 text-sm"><span className="font-bold">Session:</span> {joinResult.title}</p>
                <p className="text-slate-500 text-sm mt-0.5"><span className="font-bold">Class:</span> {joinResult.class_name} &bull; {joinResult.teacher_name}</p>
                <p className="text-xs text-slate-400 mt-2 font-mono font-bold">{joinResult.meeting_code}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── FEATURES / PLANS ─────────────────────────────────────────────── */}
        {hasSubscription ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">Your Unlocked Features</h2>
                <p className="text-slate-400 text-sm mt-0.5">Included in your <span className="text-indigo-600 font-bold">{sub.plan_name}</span> plan</p>
              </div>
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Active
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(FEATURE_META).map(([key, meta]) => {
                const Icon = meta.icon;
                const enabled = !!sub[key];
                return (
                  <div
                    key={key}
                    className={`rounded-2xl p-5 flex flex-col items-center text-center transition-all border-2 ${
                      enabled
                        ? `${meta.bg} border-transparent hover:shadow-md hover:-translate-y-1`
                        : 'bg-slate-50 border-slate-100 opacity-50'
                    }`}
                  >
                    <div className={`h-12 w-12 flex items-center justify-center rounded-2xl mb-3 ${enabled ? 'bg-white shadow-sm' : 'bg-white/60'}`}>
                      <Icon className={`h-6 w-6 ${enabled ? meta.color : 'text-slate-300'}`} strokeWidth={1.5} />
                    </div>
                    <span className={`text-xs font-bold ${enabled ? 'text-slate-700' : 'text-slate-400'}`}>{meta.label}</span>
                    <span className={`text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded-full ${enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {enabled ? '✓ Included' : '✗ Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── PLAN CARDS ─────────────────────────────────────────────────── */
          <div>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-bold px-4 py-2 rounded-full mb-4 border border-indigo-100">
                <Sparkles className="h-3.5 w-3.5" /> Choose Your Plan
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800">Unlock Full Access</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                Hover over a plan to see it glow ✨ — pick what fits your learning journey
              </p>
            </div>

            {plans.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-14 text-center shadow-sm">
                <div className="bg-slate-50 rounded-full p-5 inline-flex mb-4">
                  <Sparkles className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-slate-500 font-semibold">No plans available yet.</p>
                <p className="text-slate-400 text-sm mt-1">Check back later or contact your teacher.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan, i) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    index={i}
                    isPopular={i === popularIdx}
                    onSelect={handleSelectPlan}
                  />
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs font-medium">
              {[
                { icon: Shield,       text: 'Secure Payment'      },
                { icon: Zap,          text: 'Instant Access'       },
                { icon: CheckCircle,  text: 'No Hidden Fees'       },
                { icon: Crown,        text: 'Lifetime Access'      },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-slate-300" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassPlanView;
