import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  ArrowLeft, PlayCircle, BookOpen, HelpCircle, Video,
  ClipboardCheck, Clock, MessageSquareText, PhoneCall,
  CheckCircle, Send, Search, Download, Upload,
  FileText, ChevronRight, ThumbsUp, Filter, X, Bell, Star,
  Wifi, Link2, ArrowRight
} from 'lucide-react';

// ── Dummy Data ────────────────────────────────────────────────────────────────
const DUMMY = {
  'live-class': {
    title: 'Live Class', icon: PlayCircle, bg: 'from-rose-500 to-pink-600',
    sessions: [
      { id: 1, title: 'Advanced Mathematics – Chapter 7', teacher: 'Prof. R. Sharma', subject: 'Mathematics', time: 'Live Now', students: 142, isLive: true },
      { id: 2, title: 'English Literature – Shakespeare', teacher: 'Ms. Priya Nair', subject: 'English', time: 'In 30 min', students: 89, isLive: false },
      { id: 3, title: 'Physics – Wave Optics', teacher: 'Dr. A. Mehta', subject: 'Physics', time: 'Tomorrow 10:00 AM', students: 67, isLive: false },
      { id: 4, title: 'Chemistry – Organic Reactions', teacher: 'Mr. S. Kumar', subject: 'Chemistry', time: 'Tomorrow 2:00 PM', students: 95, isLive: false },
    ],
  },
  'study-material': {
    title: 'Study Material', icon: BookOpen, bg: 'from-blue-500 to-indigo-600',
    materials: [
      { id: 1, title: 'Mathematics – Calculus Notes', type: 'PDF', size: '2.4 MB', subject: 'Mathematics', teacher: 'Prof. R. Sharma', pages: 42, downloads: 348 },
      { id: 2, title: 'English Grammar Workbook', type: 'PDF', size: '1.8 MB', subject: 'English', teacher: 'Ms. Priya Nair', pages: 60, downloads: 212 },
      { id: 3, title: 'Physics – Optics Lab Manual', type: 'PDF', size: '3.1 MB', subject: 'Physics', teacher: 'Dr. A. Mehta', pages: 28, downloads: 189 },
      { id: 4, title: 'Chemistry Formula Sheet', type: 'PDF', size: '0.9 MB', subject: 'Chemistry', teacher: 'Mr. S. Kumar', pages: 8, downloads: 520 },
      { id: 5, title: 'History – Ancient Civilizations', type: 'DOC', size: '1.2 MB', subject: 'History', teacher: 'Mrs. D. Patel', pages: 35, downloads: 94 },
    ],
  },
  'ask-doubt': {
    title: 'Ask Doubt', icon: HelpCircle, bg: 'from-amber-400 to-orange-500',
    doubts: [
      { id: 1, question: 'How do I solve integration by parts when both functions are trigonometric?', subject: 'Mathematics', student: 'Rahul M.', time: '2h ago', answers: 3, likes: 12, answered: true },
      { id: 2, question: 'What is the difference between refraction and diffraction of light?', subject: 'Physics', student: 'Sneha K.', time: '4h ago', answers: 2, likes: 8, answered: true },
      { id: 3, question: 'Can you explain the SN1 vs SN2 mechanism with examples?', subject: 'Chemistry', student: 'Arjun T.', time: '1d ago', answers: 1, likes: 5, answered: false },
      { id: 4, question: 'What are the themes in Hamlet and how do they reflect Elizabethan society?', subject: 'English', student: 'Pooja R.', time: '1d ago', answers: 0, likes: 2, answered: false },
    ],
  },
  'recording': {
    title: 'Recording', icon: Video, bg: 'from-red-500 to-rose-600',
    recordings: [
      { id: 1, title: 'Mathematics – Integration Techniques', teacher: 'Prof. R. Sharma', date: '9 Apr 2026', duration: '1h 23m', views: 234, subject: 'Mathematics' },
      { id: 2, title: 'English – Essay Writing Workshop', teacher: 'Ms. Priya Nair', date: '8 Apr 2026', duration: '52m', views: 145, subject: 'English' },
      { id: 3, title: 'Physics – Light & Wave Theory', teacher: 'Dr. A. Mehta', date: '7 Apr 2026', duration: '1h 10m', views: 198, subject: 'Physics' },
      { id: 4, title: 'Chemistry – Organic Chemistry Intro', teacher: 'Mr. S. Kumar', date: '5 Apr 2026', duration: '45m', views: 312, subject: 'Chemistry' },
      { id: 5, title: 'Mathematics – Limits & Continuity', teacher: 'Prof. R. Sharma', date: '3 Apr 2026', duration: '1h 5m', views: 421, subject: 'Mathematics' },
    ],
  },
  'assignment': {
    title: 'Assignment', icon: ClipboardCheck, bg: 'from-purple-500 to-violet-600',
    assignments: [
      { id: 1, title: 'Mathematics Problem Set – Chapter 7', subject: 'Mathematics', teacher: 'Prof. R. Sharma', due: 'Apr 12, 2026', status: 'pending', marks: '20', submitted: false },
      { id: 2, title: 'English Essay – Modern Literature', subject: 'English', teacher: 'Ms. Priya Nair', due: 'Apr 11, 2026', status: 'submitted', marks: '15', submitted: true, score: '13/15' },
      { id: 3, title: 'Physics Lab Report – Optics', subject: 'Physics', teacher: 'Dr. A. Mehta', due: 'Apr 15, 2026', status: 'pending', marks: '25', submitted: false },
      { id: 4, title: 'Chemistry – Organic Reactions Summary', subject: 'Chemistry', teacher: 'Mr. S. Kumar', due: 'Apr 8, 2026', status: 'overdue', marks: '10', submitted: false },
      { id: 5, title: 'History – Ancient Civilizations Essay', subject: 'History', teacher: 'Mrs. D. Patel', due: 'Apr 3, 2026', status: 'submitted', marks: '20', submitted: true, score: '18/20' },
    ],
  },
  'smart-test': {
    title: 'Smart Test', icon: Clock, bg: 'from-emerald-500 to-teal-600',
    tests: [
      { id: 1, title: 'Mathematics – Unit 3 Quiz', subject: 'Mathematics', questions: 20, duration: '30 min', status: 'available', score: null, attempts: 0 },
      { id: 2, title: 'Physics MCQ Test', subject: 'Physics', questions: 30, duration: '45 min', status: 'completed', score: '24/30', attempts: 1 },
      { id: 3, title: 'English Grammar Test', subject: 'English', questions: 25, duration: '25 min', status: 'completed', score: '21/25', attempts: 2 },
      { id: 4, title: 'Chemistry – Periodic Table Quiz', subject: 'Chemistry', questions: 15, duration: '20 min', status: 'available', score: null, attempts: 0 },
      { id: 5, title: 'History – Ancient Era Test', subject: 'History', questions: 20, duration: '30 min', status: 'locked', score: null, attempts: 0 },
    ],
  },
  'chat': {
    title: 'Chat', icon: MessageSquareText, bg: 'from-blue-600 to-cyan-500',
    conversations: [
      { id: 1, name: 'Prof. R. Sharma', role: 'Teacher', last: 'The assignment deadline has been extended.', time: '10:30 AM', unread: 2, avatar: 'RS' },
      { id: 2, name: 'Mathematics Batch 2026', role: 'Group', last: 'Rahul: Can someone share the notes?', time: '9:15 AM', unread: 5, avatar: 'MB' },
      { id: 3, name: 'Ms. Priya Nair', role: 'Teacher', last: 'Great essay! Minor corrections shared.', time: 'Yesterday', unread: 0, avatar: 'PN' },
      { id: 4, name: 'Study Group – Physics', role: 'Group', last: "Sneha: Let's meet online at 8 PM", time: 'Yesterday', unread: 0, avatar: 'SP' },
      { id: 5, name: 'Dr. A. Mehta', role: 'Teacher', last: 'Lab report submission confirmed.', time: 'Mon', unread: 0, avatar: 'AM' },
    ],
  },
  'support': {
    title: 'Support', icon: PhoneCall, bg: 'from-fuchsia-500 to-purple-600',
    tickets: [
      { id: 'TKT-001', issue: 'Unable to join live class session', status: 'resolved', priority: 'high', date: 'Apr 9, 2026' },
      { id: 'TKT-002', issue: 'Study material PDF not loading properly', status: 'in-progress', priority: 'medium', date: 'Apr 8, 2026' },
      { id: 'TKT-003', issue: 'Assignment submitted but shows pending', status: 'open', priority: 'high', date: 'Apr 7, 2026' },
    ],
    faqs: [
      { q: 'How do I join a live class?', a: 'Go to Live Class section and click "Join Now" on any active session. You need a valid subscription plan that includes Live Class feature.' },
      { q: 'Can I download study materials?', a: 'Yes, click the Download button on any study material card. PDFs are downloaded instantly to your device.' },
      { q: 'How to submit an assignment?', a: 'Open the Assignment section, select the assignment, upload your file and click Submit before the deadline.' },
      { q: 'My recording is not playing?', a: 'Check your internet connection and try refreshing. If issue persists, raise a support ticket.' },
    ],
  },
};

const SAMPLE_QUESTIONS = [
  { q: 'What is the value of π (pi) up to 5 decimal places?', options: ['3.14159', '3.14152', '3.14169', '3.14199'], ans: 0 },
  { q: 'Who wrote the play "Hamlet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], ans: 1 },
  { q: 'What is the speed of light in vacuum?', options: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], ans: 0 },
  { q: 'H₂O is the chemical formula for?', options: ['Hydrogen Peroxide', 'Hydrochloric acid', 'Water', 'Sodium Hydroxide'], ans: 2 },
];

// ─────────────────────────────────────────────────────────────────────────────
const FeatureView = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { token } = React.useContext(AuthContext);

  const [dynamicData, setDynamicData] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchDynamicData = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        if (type === 'live-class') endpoint = '/api/features/live-classes';
        else if (type === 'study-material') endpoint = '/api/features/study-materials';
        else if (type === 'recording') endpoint = '/api/features/recordings';
        else if (type === 'assignment') endpoint = '/api/features/assignments';
        
        if (endpoint) {
          const res = await axios.get(`http://localhost:5000${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (type === 'live-class') setDynamicData({ ...DUMMY[type], sessions: res.data.sessions });
          else if (type === 'study-material') setDynamicData({ ...DUMMY[type], materials: res.data.materials });
          else if (type === 'recording') setDynamicData({ ...DUMMY[type], recordings: res.data.recordings });
          else if (type === 'assignment') setDynamicData({ ...DUMMY[type], assignments: res.data.assignments });
        } else {
          setDynamicData(DUMMY[type]);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic data', err);
        setDynamicData(DUMMY[type]); // fallback to dummy on error
      } finally {
        setLoading(false);
      }
    };
    fetchDynamicData();
  }, [type, token]);

  const data = dynamicData || DUMMY[type];

  // Ask Doubt
  const [doubtText, setDoubtText]       = useState('');
  const [doubtSubject, setDoubtSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [doubtList, setDoubtList]       = useState(data?.doubts || []);
  const [doubtPosted, setDoubtPosted]   = useState(false);
  const [likedDoubts, setLikedDoubts]   = useState(new Set());

  // Assignment
  const [submitted, setSubmitted]         = useState(new Set(data?.assignments?.filter(a => a.submitted).map(a => a.id) || []));
  const [showSubmitModal, setShowSubmitModal] = useState(null); // assignment object

  // Smart Test
  const [activeTest, setActiveTest]     = useState(null);
  const [answers, setAnswers]           = useState({});
  const [testDone, setTestDone]         = useState(false);
  const [showResult, setShowResult]     = useState(null);

  // Chat
  const [activeChat, setActiveChat]     = useState(null);
  const [chatMsg, setChatMsg]           = useState('');
  const [chatHistory, setChatHistory]   = useState({});

  // Support
  const [ticketList, setTicketList]     = useState(data?.tickets || []);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketIssue, setTicketIssue]   = useState('');
  const [openFaq, setOpenFaq]           = useState(null);
  const [ticketPosted, setTicketPosted] = useState(false);

  // Live class reminders
  const [reminders, setReminders]       = useState(new Set());
  // Downloads
  const [downloaded, setDownloaded]     = useState(new Set());

  // Join by code (Live Class)
  const [joinCode, setJoinCode]         = useState('');
  const [joinError, setJoinError]       = useState('');

  // ── Handlers ──────────────────────────────────────────────────────────────
  const effectiveSubject = doubtSubject === 'other' ? customSubject : doubtSubject;

  const handleAskDoubt = () => {
    if (!doubtText.trim()) { alert('Please enter your question.'); return; }
    if (!effectiveSubject.trim() || effectiveSubject === 'other') { alert('Please select or type a subject.'); return; }
    setDoubtList(prev => [{
      id: Date.now(), question: doubtText.trim(), subject: effectiveSubject,
      student: 'You', time: 'Just now', answers: 0, likes: 0, answered: false,
    }, ...prev]);
    setDoubtText(''); setDoubtSubject(''); setCustomSubject('');
    setDoubtPosted(true); setTimeout(() => setDoubtPosted(false), 3000);
  };

  const toggleLike = (id) => setLikedDoubts(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const handleSubmitAssignment = (a) => {
    setSubmitted(prev => new Set([...prev, a.id]));
    setShowSubmitModal(null);
  };

  const handleStartTest = (test) => {
    setActiveTest(test); setAnswers({}); setTestDone(false);
  };

  const calcScore = () => {
    let correct = 0;
    SAMPLE_QUESTIONS.forEach((q, i) => { if (answers[i] === q.ans) correct++; });
    return correct;
  };

  const handleSendMsg = () => {
    if (!chatMsg.trim() || !activeChat) return;
    const key = activeChat.id;
    setChatHistory(prev => ({
      ...prev,
      [key]: [...(prev[key] || [{ from: 'other', text: activeChat.last }]), { from: 'me', text: chatMsg.trim() }]
    }));
    setChatMsg('');
    setTimeout(() => {
      setChatHistory(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), { from: 'other', text: "Thanks! I'll get back to you shortly. 😊" }]
      }));
    }, 1500);
  };

  const handleRaiseTicket = () => {
    if (!ticketIssue.trim()) { alert('Please describe your issue.'); return; }
    const newTicket = {
      id: `TKT-00${ticketList.length + 4}`,
      issue: ticketIssue.trim(),
      status: 'open', priority: 'medium',
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setTicketList(prev => [newTicket, ...prev]);
    setTicketIssue(''); setShowTicketForm(false);
    setTicketPosted(true); setTimeout(() => setTicketPosted(false), 3000);
  };

  if (loading && !dynamicData) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
      <p className="text-slate-600 font-bold text-lg">Feature not found.</p>
      <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">Go Back</button>
    </div>
  );

  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-[#f7f8fc] font-sans">
      {/* Header */}
      <div className={`bg-gradient-to-r ${data.bg} text-white px-4 py-5 sm:px-8 sticky top-0 z-10 shadow-md`}>
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="bg-white/20 p-2 rounded-xl"><Icon className="h-6 w-6" /></div>
          <h1 className="text-xl font-bold">{data.title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ── LIVE CLASS ── */}
        {type === 'live-class' && (
          <div className="space-y-6">

            {/* ─ Join by Code panel ─ */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Wifi className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg leading-tight">Join a Live Session</h2>
                    <p className="text-indigo-200 text-xs">Enter the code shared by your teacher</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                    placeholder="e.g. AB12CD34"
                    maxLength={20}
                    className="flex-1 bg-white/20 border border-white/30 text-white placeholder-white/50 font-mono font-bold text-lg text-center tracking-widest px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 transition-all uppercase"
                  />
                  <button
                    onClick={() => {
                      const code = joinCode.trim().toUpperCase();
                      if (!code || code.length < 4) { setJoinError('Enter a valid code'); return; }
                      navigate(`/meeting/${code}`);
                    }}
                    className="flex-shrink-0 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    <ArrowRight className="h-5 w-5" />
                    <span className="hidden sm:block">Join</span>
                  </button>
                </div>
                {joinError && <p className="text-red-300 text-xs mt-2 font-medium">{joinError}</p>}
              </div>
            </div>

            {/* ─ Upcoming sessions list ─ */}
            <div>
              <h2 className="font-bold text-slate-800 text-lg mb-3">Upcoming &amp; Live Sessions</h2>
              <div className="space-y-4">
                {data.sessions.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl ${s.isLive ? 'bg-red-100' : 'bg-slate-100'}`}>
                        <PlayCircle className={`h-6 w-6 ${s.isLive ? 'text-red-500' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {s.isLive && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>}
                          <h3 className="font-bold text-slate-800">{s.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500">{s.teacher} • <span className="text-indigo-500 font-medium">{s.subject}</span></p>
                        <p className="text-xs text-slate-400 mt-0.5">🕐 {s.time} • 👥 {s.students} students</p>
                      </div>
                    </div>
                    {s.isLive ? (
                      <button
                        onClick={() => {
                          const code = prompt('Enter the meeting code provided by your teacher:');
                          if (code?.trim()) navigate(`/meeting/${code.trim().toUpperCase()}`);
                        }}
                        className="flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors flex items-center gap-2">
                        <Wifi className="h-4 w-4" /> Join Now
                      </button>
                    ) : reminders.has(s.id) ? (
                      <button onClick={() => setReminders(prev => { const n = new Set(prev); n.delete(s.id); return n; })}
                        className="flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-100 text-emerald-700 transition-colors">
                        <Bell className="h-4 w-4" /> Reminder Set ✓
                      </button>
                    ) : (
                      <button onClick={() => setReminders(prev => new Set([...prev, s.id]))}
                        className="flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
                        <Bell className="h-4 w-4" /> Set Reminder
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STUDY MATERIAL ── */}
        {type === 'study-material' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg">All Materials</h2>
              <div className="relative">
                <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-400" />
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
            <div className="space-y-3">
              {data.materials.map(m => (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="bg-blue-100 h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm">{m.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{m.teacher} • {m.subject} • {m.pages} pages • {m.size}</p>
                    <p className="text-xs text-slate-400 mt-0.5">⬇ {downloaded.has(m.id) ? m.downloads + 1 : m.downloads} downloads</p>
                  </div>
                  <button
                    onClick={() => setDownloaded(prev => new Set([...prev, m.id]))}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${downloaded.has(m.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}>
                    {downloaded.has(m.id) ? <><CheckCircle className="h-4 w-4" /> Downloaded</> : <><Download className="h-4 w-4" /> Download</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ASK DOUBT ── */}
        {type === 'ask-doubt' && (
          <div>
            {doubtPosted && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 flex items-center gap-3 text-emerald-700 font-bold text-sm">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                Your doubt has been posted! A teacher will respond soon.
              </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
              <h3 className="font-bold text-slate-800 mb-3">Post Your Doubt</h3>
              <textarea rows={3} placeholder="Type your question here..."
                value={doubtText} onChange={e => setDoubtText(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-amber-400 resize-none mb-3" />
              <div className="flex items-end gap-3">
                <div className="flex-1 flex flex-col gap-2">
                  <select value={doubtSubject} onChange={e => { setDoubtSubject(e.target.value); setCustomSubject(''); }}
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-amber-400 w-full">
                    <option value="">Select Subject *</option>
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>English</option>
                    <option>History</option>
                    <option value="other">Other (type below)</option>
                  </select>
                  {doubtSubject === 'other' && (
                    <input type="text" placeholder="Type your subject name..." value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)} autoFocus
                      className="border border-amber-300 rounded-xl px-3 py-2.5 text-sm bg-amber-50 outline-none focus:ring-2 focus:ring-amber-400 w-full" />
                  )}
                </div>
                <button onClick={handleAskDoubt}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-amber-200 flex-shrink-0">
                  Ask Now
                </button>
              </div>
            </div>

            <h2 className="font-bold text-slate-800 text-lg mb-3">Recent Doubts ({doubtList.length})</h2>
            <div className="space-y-4">
              {doubtList.map(d => (
                <div key={d.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${d.student === 'You' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{d.question}</p>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${d.answered ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {d.answered ? '✓ Answered' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    <span className="font-bold text-indigo-500">{d.subject}</span> • by {d.student} • {d.time}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <button onClick={() => toggleLike(d.id)}
                      className={`flex items-center gap-1 transition-colors ${likedDoubts.has(d.id) ? 'text-amber-500 font-bold' : 'hover:text-amber-500'}`}>
                      <ThumbsUp className="h-3.5 w-3.5" /> {d.likes + (likedDoubts.has(d.id) ? 1 : 0)}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageSquareText className="h-3.5 w-3.5" /> {d.answers} answers
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RECORDING ── */}
        {type === 'recording' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg">Recorded Classes</h2>
              <button className="flex items-center gap-1.5 text-sm text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50"><Filter className="h-4 w-4" /> Filter</button>
            </div>
            <div className="space-y-3">
              {data.recordings.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
                  <div className="relative bg-red-100 h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-xl group-hover:bg-red-500 transition-colors">
                    <PlayCircle className="h-7 w-7 text-red-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{r.teacher} • {r.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5">📅 {r.date} • ⏱ {r.duration} • 👁 {r.views} views</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-red-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ASSIGNMENT ── */}
        {type === 'assignment' && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Total', count: data.assignments.length, color: 'bg-purple-50 text-purple-700' },
                { label: 'Submitted', count: submitted.size, color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Pending', count: data.assignments.length - submitted.size, color: 'bg-amber-50 text-amber-700' },
              ].map(stat => (
                <div key={stat.label} className={`rounded-2xl p-4 text-center ${stat.color}`}>
                  <p className="text-2xl font-extrabold">{stat.count}</p>
                  <p className="text-xs font-bold uppercase tracking-wide mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {data.assignments.map(a => {
                const isDone = submitted.has(a.id);
                return (
                  <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{a.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{a.teacher} • <span className="text-indigo-500 font-medium">{a.subject}</span></p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-700' : a.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                        {isDone ? '✓ Submitted' : a.status === 'overdue' ? '✗ Overdue' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400">Due: <span className="font-bold text-slate-600">{a.due}</span> • Max: <span className="font-bold">{a.marks} marks</span>
                        {a.score && !isDone && <span className="ml-2 text-emerald-600 font-bold">Score: {a.score}</span>}
                        {isDone && <span className="ml-2 text-emerald-600 font-bold">✓ Submitted</span>}
                      </p>
                      {!isDone && (
                        <button onClick={() => a.status !== 'overdue' && setShowSubmitModal(a)}
                          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${a.status === 'overdue' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                          <Upload className="h-3.5 w-3.5" /> Submit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SMART TEST ── */}
        {type === 'smart-test' && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Available', count: data.tests.filter(t => t.status === 'available').length, color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Completed', count: data.tests.filter(t => t.status === 'completed').length, color: 'bg-blue-50 text-blue-700' },
                { label: 'Locked', count: data.tests.filter(t => t.status === 'locked').length, color: 'bg-slate-100 text-slate-600' },
              ].map(stat => (
                <div key={stat.label} className={`rounded-2xl p-4 text-center ${stat.color}`}>
                  <p className="text-2xl font-extrabold">{stat.count}</p>
                  <p className="text-xs font-bold uppercase tracking-wide mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {data.tests.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl ${t.status === 'available' ? 'bg-emerald-100' : t.status === 'completed' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                      <Clock className={`h-6 w-6 ${t.status === 'available' ? 'text-emerald-500' : t.status === 'completed' ? 'text-blue-500' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{t.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{t.subject} • {t.questions} questions • ⏱ {t.duration}</p>
                      {t.score && <p className="text-xs text-emerald-600 font-bold mt-0.5">Score: {t.score} — Attempts: {t.attempts}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => t.status === 'available' && handleStartTest(t)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${t.status === 'available' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : t.status === 'completed' ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                    {t.status === 'available' ? 'Start Test' : t.status === 'completed' ? 'View Result' : '🔒 Locked'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHAT ── */}
        {type === 'chat' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-[70vh]">
            <div className="sm:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-y-auto">
              <div className="p-3 border-b border-slate-100">
                <div className="relative"><input type="text" placeholder="Search..." className="w-full border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-sm bg-slate-50 outline-none" /><Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" /></div>
              </div>
              {data.conversations.map(c => (
                <button key={c.id} onClick={() => setActiveChat(c)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${activeChat?.id === c.id ? 'bg-indigo-50' : ''}`}>
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center"><span className="font-bold text-slate-800 text-sm">{c.name}</span><span className="text-[10px] text-slate-400">{c.time}</span></div>
                    <p className="text-xs text-slate-500 truncate">{chatHistory[c.id]?.at(-1)?.text || c.last}</p>
                    <span className="text-[10px] text-slate-400">{c.role}</span>
                  </div>
                  {c.unread > 0 && <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{c.unread}</span>}
                </button>
              ))}
            </div>

            <div className="sm:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              {activeChat ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                    <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">{activeChat.avatar}</div>
                    <div><p className="font-bold text-slate-800 text-sm">{activeChat.name}</p><p className="text-xs text-emerald-500 font-medium">● Online</p></div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="flex justify-start"><div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-2 text-sm text-slate-800 max-w-[75%]">{activeChat.last}</div></div>
                    {(chatHistory[activeChat.id] || []).map((msg, i) => (
                      <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-2xl px-4 py-2 text-sm max-w-[75%] ${msg.from === 'me' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>{msg.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-100 flex gap-2">
                    <input type="text" placeholder="Type a message..." value={chatMsg}
                      onChange={e => setChatMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMsg()}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-400" />
                    <button onClick={handleSendMsg} className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"><Send className="h-5 w-5" /></button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center flex-col text-slate-400 gap-3">
                  <MessageSquareText className="h-12 w-12 opacity-30" />
                  <p className="font-medium text-sm">Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SUPPORT ── */}
        {type === 'support' && (
          <div className="space-y-6">
            {ticketPosted && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 flex items-center gap-3 text-emerald-700 font-bold text-sm">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                Your ticket has been submitted! We'll respond within 24 hours.
              </div>
            )}
            <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-2xl p-6 text-white">
              <h2 className="font-bold text-lg mb-1">Need Help?</h2>
              <p className="text-fuchsia-100 text-sm mb-4">Our support team is available 24/7 to assist you.</p>
              <button onClick={() => setShowTicketForm(true)} className="bg-white text-fuchsia-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-fuchsia-50 transition-colors">
                + Raise a Ticket
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-3">My Tickets ({ticketList.length})</h3>
              <div className="space-y-3">
                {ticketList.map(t => (
                  <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400 font-mono mb-1">{t.id}</p>
                      <p className="font-semibold text-slate-800 text-sm">{t.issue}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${t.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : t.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{t.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-3">Frequently Asked Questions</h3>
              <div className="space-y-2">
                {data.faqs.map((faq, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                      <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                      <ChevronRight className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                    </button>
                    {openFaq === i && <div className="px-5 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3">{faq.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Assignment Submit Modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Submit Assignment</h3>
              <button onClick={() => setShowSubmitModal(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-slate-600 mb-4 font-medium">{showSubmitModal.title}</p>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center mb-4 hover:border-purple-400 transition-colors cursor-pointer bg-slate-50">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">Click to upload file</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleSubmitAssignment(showSubmitModal)} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors">Submit Now</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Smart Test Modal ── */}
      {activeTest && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div><p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Smart Test</p><h3 className="text-white font-bold">{activeTest.title}</h3></div>
              <button onClick={() => setActiveTest(null)} className="text-white/70 hover:text-white bg-white/10 rounded-full p-1.5"><X className="h-5 w-5" /></button>
            </div>
            {!testDone ? (
              <div className="p-6 space-y-5">
                {SAMPLE_QUESTIONS.map((q, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4">
                    <p className="font-bold text-slate-800 text-sm mb-3">Q{i + 1}. {q.q}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, j) => (
                        <button key={j} onClick={() => setAnswers(prev => ({ ...prev, [i]: j }))}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border-2 ${answers[i] === j ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                          {String.fromCharCode(65 + j)}. {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setTestDone(true)}
                  disabled={Object.keys(answers).length < SAMPLE_QUESTIONS.length}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition-colors">
                  {Object.keys(answers).length < SAMPLE_QUESTIONS.length
                    ? `Answer all questions (${Object.keys(answers).length}/${SAMPLE_QUESTIONS.length})`
                    : 'Submit Test'}
                </button>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="bg-emerald-100 p-5 rounded-full inline-flex mb-4"><CheckCircle className="h-12 w-12 text-emerald-500" /></div>
                <h3 className="text-2xl font-extrabold text-slate-800">{calcScore()}/{SAMPLE_QUESTIONS.length}</h3>
                <p className="text-slate-500 mb-2 text-sm">Questions answered correctly</p>
                <div className="flex justify-center gap-1 mb-5">
                  {[...Array(SAMPLE_QUESTIONS.length)].map((_, i) => (
                    <div key={i} className={`h-2 w-8 rounded-full ${answers[i] === SAMPLE_QUESTIONS[i].ans ? 'bg-emerald-400' : 'bg-red-300'}`} />
                  ))}
                </div>
                <p className="text-lg font-bold text-slate-700 mb-1">
                  {calcScore() === SAMPLE_QUESTIONS.length ? '🏆 Perfect Score!' : calcScore() >= SAMPLE_QUESTIONS.length / 2 ? '✅ Good Job!' : '📚 Keep Practicing!'}
                </p>
                <button onClick={() => setActiveTest(null)} className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Raise Ticket Modal ── */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Raise a Support Ticket</h3>
              <button onClick={() => setShowTicketForm(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <textarea rows={4} placeholder="Describe your issue in detail..."
              value={ticketIssue} onChange={e => setTicketIssue(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-fuchsia-400 resize-none mb-3" />
            <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none mb-4">
              <option>Technical Issue</option>
              <option>Payment & Billing</option>
              <option>Class / Teacher</option>
              <option>Account</option>
              <option>Other</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowTicketForm(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleRaiseTicket} className="flex-1 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-bold text-sm transition-colors">Submit Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureView;
