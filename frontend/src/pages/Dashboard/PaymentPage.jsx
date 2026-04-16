import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft, CheckCircle, Copy, Smartphone,
  Shield, Lock, Zap, PlayCircle, BookOpen,
  HelpCircle, Video, ClipboardCheck, Clock,
  MessageSquareText, PhoneCall, Crown
} from 'lucide-react';

const FEATURE_META = {
  feature_live_class:      { label: 'Live Class',      icon: PlayCircle },
  feature_study_material:  { label: 'Study Material',  icon: BookOpen },
  feature_ask_doubt:       { label: 'Ask Doubt',       icon: HelpCircle },
  feature_recording:       { label: 'Recording',       icon: Video },
  feature_assignment:      { label: 'Assignment',      icon: ClipboardCheck },
  feature_smart_test:      { label: 'Smart Test',      icon: Clock },
  feature_chat:            { label: 'Chat',            icon: MessageSquareText },
  feature_support:         { label: 'Support',         icon: PhoneCall },
};

const DUMMY_UPI_ID = 'lms-demo@ybl';

const PaymentPage = () => {
  const { classId, planId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [plan, setPlan] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [payMethod, setPayMethod] = useState('qr'); // 'qr' | 'upi'
  const [txnId, setTxnId] = useState('');
  const [txnError, setTxnError] = useState('');
  const [step, setStep] = useState('pay'); // 'pay' | 'verifying' | 'done'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [clsRes, plansRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/classes/${classId}`, { headers }),
        axios.get(`http://localhost:5000/api/plans/class/${classId}`, { headers }),
      ]);
      setClassInfo(clsRes.data.class);
      const found = plansRes.data.plans.find(p => String(p.id) === String(planId));
      setPlan(found || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(DUMMY_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (!txnId.trim()) { setTxnError('Enter your UPI Transaction ID to proceed'); return; }
    if (txnId.trim().length < 6) { setTxnError('Transaction ID is too short'); return; }
    setStep('verifying');
    await new Promise(r => setTimeout(r, 2500));
    try {
      await axios.post('http://localhost:5000/api/plans/subscribe',
        { plan_id: parseInt(planId), class_id: parseInt(classId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep('done');
    } catch (err) {
      setStep('pay');
      setTxnError(err.response?.data?.message || 'Verification failed. Try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <p className="text-slate-600 font-bold text-lg">Plan not found.</p>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  const included = Object.entries(FEATURE_META).filter(([key]) => !!plan[key]);

  /* ── SUCCESS SCREEN ── */
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-sm w-full">
          <div className="bg-emerald-100 p-5 rounded-full inline-flex mb-5">
            <CheckCircle className="h-14 w-14 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Payment Verified!</h1>
          <p className="text-slate-500 mb-2">You're now enrolled in</p>
          <p className="text-indigo-700 font-bold text-lg mb-1">{classInfo?.class_name}</p>
          <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full mb-6">
            <Crown className="h-4 w-4 text-indigo-500" />
            <span className="text-indigo-700 font-bold text-sm">{plan.name} Plan</span>
          </div>
          <div className="space-y-2 text-left mb-7 bg-slate-50 rounded-2xl p-4">
            {included.map(([key, meta]) => {
              const Icon = meta.icon;
              return (
                <div key={key} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                  {meta.label}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate(`/student/class/${classId}`)}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-colors"
          >
            Access My Class →
          </button>
        </div>
      </div>
    );
  }

  /* ── VERIFYING SCREEN ── */
  if (step === 'verifying') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Verifying Payment</h2>
          <p className="text-slate-500 text-sm">Confirming your transaction with the bank...</p>
          <div className="flex justify-center gap-1.5 mt-5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN PAYMENT PAGE ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-slate-800 leading-tight">Complete Payment</h1>
            <p className="text-xs text-slate-500">{classInfo?.class_name}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full">
            <Lock className="h-3.5 w-3.5" /> 100% Secure
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT: Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Plan summary card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-5 py-4">
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-0.5">Your Plan</p>
                <h2 className="text-2xl font-extrabold text-white">{plan.name}</h2>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Plan Amount</span>
                  <span className="font-bold text-slate-800">₹{parseFloat(plan.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">GST (0%)</span>
                  <span className="font-bold text-slate-800">₹0</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="text-2xl font-extrabold text-indigo-600">₹{parseFloat(plan.price).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Included features */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wide">What's Included</h3>
              <div className="space-y-2">
                {included.map(([key, meta]) => {
                  const Icon = meta.icon;
                  return (
                    <div key={key} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                      <span className="font-medium">{meta.label}</span>
                    </div>
                  );
                })}
                {included.length === 0 && <p className="text-slate-400 text-sm">No features selected</p>}
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, label: 'Secure Payment' },
                { icon: Lock, label: 'Encrypted' },
                { icon: Zap, label: 'Instant Access' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-200">
                  <Icon className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-500 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Payment Methods */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg">Choose Payment Method</h3>
              </div>

              {/* Method Tabs */}
              <div className="flex border-b border-slate-100">
                {[
                  { key: 'qr', label: 'Scan QR Code', icon: Smartphone },
                  { key: 'upi', label: 'UPI ID', icon: Copy },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setPayMethod(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold border-b-2 transition-colors ${payMethod === tab.key
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    <tab.icon className="h-4 w-4" /> {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* QR Method */}
                {payMethod === 'qr' && (
                  <div className="flex flex-col items-center">
                    <p className="text-slate-500 text-sm mb-5 text-center">Open GPay, PhonePe, Paytm or any UPI app and scan</p>
                    <div className="relative">
                      <div className="absolute -inset-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl opacity-20 blur-lg"></div>
                      <div className="relative border-4 border-white shadow-xl rounded-2xl overflow-hidden">
                        <img src="/upi_qr.png" alt="UPI QR Code" className="w-52 h-52 object-contain" />
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-full max-w-xs">
                      <span className="flex-1 font-mono text-sm font-bold text-slate-700">{DUMMY_UPI_ID}</span>
                      <button onClick={copyUpi} className="text-indigo-500 hover:text-indigo-700 transition-colors">
                        {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Pay exactly <span className="font-bold text-slate-600">₹{parseFloat(plan.price).toLocaleString()}</span></p>
                  </div>
                )}

                {/* UPI ID Method */}
                {payMethod === 'upi' && (
                  <div>
                    <p className="text-slate-500 text-sm mb-4">Copy this UPI ID and pay via any UPI app</p>
                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 mb-4">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">UPI ID</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-800 text-lg">{DUMMY_UPI_ID}</span>
                        <button onClick={copyUpi} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                          {copied ? <><CheckCircle className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay', 'Others'].map(app => (
                        <div key={app} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
                          <p className="text-xs font-bold text-slate-600">{app}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transaction ID (always visible below method) */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Enter UPI Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-3">After completing payment, enter the 12-digit transaction ID from your UPI app</p>
                  <input
                    type="text"
                    placeholder="e.g. 407812345678"
                    value={txnId}
                    onChange={e => { setTxnId(e.target.value); setTxnError(''); }}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl bg-slate-50 outline-none font-mono text-slate-800 text-sm transition-colors"
                  />
                  {txnError && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                      ⚠ {txnError}
                    </p>
                  )}
                </div>

                {/* Demo notice */}
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-start gap-2">
                  <span className="text-amber-500 text-lg leading-none">ⓘ</span>
                  <p className="text-xs text-amber-700 font-medium">This is a <strong>demo payment</strong>. No real money is charged. Enter any 6+ digit ID to proceed.</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3.5 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerify}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-sm shadow-indigo-200 transition-colors active:scale-[0.98]"
                  >
                    Verify & Enroll →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
