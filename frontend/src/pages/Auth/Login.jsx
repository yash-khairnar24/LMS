import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen, AlertCircle, X, PlayCircle, ClipboardCheck,
  MessageSquareText, Clock, Users, CheckCircle,
  GraduationCap, Video, Wifi
} from 'lucide-react';

/* ── floating stat card ─────────────────────────────────────── */
const FloatCard = ({ className, children }) => (
  <div className={`absolute bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 z-20 animate-bounce ${className}`}>
    {children}
  </div>
);

/* ── feature card ───────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, color, bg, title, desc }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all">
    <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
      <Icon className={`h-6 w-6 ${color}`} strokeWidth={1.8} />
    </div>
    <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await login(email, password);
    if (result.success) {
      navigate(redirectTo);
    } else {
      setError(result.message);
    }
  };

  const features = [
    { icon: PlayCircle, color: 'text-rose-400', bg: 'bg-rose-50', title: 'Live Classes', desc: 'Join interactive live sessions with your teachers in real-time.' },
    { icon: BookOpen, color: 'text-sky-400', bg: 'bg-sky-50', title: 'Study Material', desc: 'Access notes, PDFs, and resources anytime, anywhere.' },
    { icon: ClipboardCheck, color: 'text-violet-400', bg: 'bg-violet-50', title: 'Assignments', desc: 'Submit and track your assignments with ease.' },
    { icon: Clock, color: 'text-teal-400', bg: 'bg-teal-50', title: 'Smart Tests', desc: 'Attempt quizzes and get instant score analysis.' },
    { icon: MessageSquareText, color: 'text-cyan-400', bg: 'bg-cyan-50', title: 'Doubt Solving', desc: 'Ask doubts and get answers from your teachers instantly.' },
    { icon: Video, color: 'text-pink-400', bg: 'bg-pink-50', title: 'Recordings', desc: 'Re-watch recorded class sessions at your own pace.' },
  ];

  const teacherPoints = [
    'Conduct Unlimited Live Classes',
    'Create Custom Test Series',
    'Develop Study Material',
    'Manage Assignments',
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-violet-400 p-2 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">EduLearn</span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <a href="#features" className="hover:text-violet-500 transition-colors">Features</a>
            <a href="#stats" className="hover:text-violet-500 transition-colors">About</a>
            <a href="#why" className="hover:text-violet-500 transition-colors">Why Us</a>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {/* Join meeting link */}
            <Link
              to="/join"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-emerald-600 border-2 border-emerald-400 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              <Wifi className="h-4 w-4" /> Join Meeting
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2 text-sm font-bold text-violet-500 border-2 border-violet-400 rounded-xl hover:bg-violet-50 transition-colors"
            >
              Login
            </button>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-bold text-white bg-violet-400 rounded-xl hover:bg-violet-500 transition-colors shadow-sm shadow-violet-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#fdf6f0] via-[#f8f0ff] to-[#eef4ff] overflow-hidden" style={{ minHeight: '88vh' }}>

        {/* Decorative zigzag left */}
        <div className="absolute left-6 top-1/3 hidden lg:flex flex-col gap-1 opacity-40">
          {[0,1,2].map(i => (
            <svg key={i} width="24" height="10" viewBox="0 0 24 10"><path d="M0 5 L6 0 L12 5 L18 0 L24 5" stroke="#8b5cf6" strokeWidth="2" fill="none"/></svg>
          ))}
        </div>
        {/* Decorative plus center-top */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 hidden lg:block opacity-30">
          <svg width="28" height="28" viewBox="0 0 28 28"><line x1="14" y1="0" x2="14" y2="28" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/><line x1="0" y1="14" x2="28" y2="14" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/></svg>
        </div>
        {/* Decorative drops */}
        <div className="absolute top-1/4 right-[44%] hidden lg:flex flex-wrap gap-1 w-12 opacity-40">
          {[...Array(9)].map((_,i) => <div key={i} className="w-1.5 h-2.5 bg-sky-400 rounded-full" />)}
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-0 items-center" style={{ minHeight: '88vh' }}>

          {/* Left text */}
          <div className="relative z-10 py-16">
            <p className="text-slate-500 text-sm font-semibold mb-3">10L+ Users trust us</p>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-[1.15] mb-4">
              Best Online<br />
              <span className="text-[#8b5cf6]">Classroom</span> Platform
            </h1>
            <div className="flex">
              <div className="w-1 h-14 bg-amber-300 rounded-full mr-4 mt-1 flex-shrink-0" />
              <p className="text-slate-500 text-base leading-relaxed max-w-sm">
                EduLearn is World's Online Classroom Platform specially designed for{' '}
                <span className="text-[#8b5cf6] font-semibold">teachers</span> and{' '}
                <span className="text-[#8b5cf6] font-semibold">students</span>.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors shadow-lg text-sm"
              >
                Get Started
              </button>
              <a
                href="#features"
                onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-8 py-3.5 border-2 border-slate-300 text-slate-700 font-bold rounded-2xl hover:border-[#8b5cf6] hover:text-[#8b5cf6] transition-colors text-sm cursor-pointer"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right — hero image matching educateapp.in */}
          <div className="relative hidden lg:block" style={{ height: '88vh' }}>

            {/* Dark purple geometric rounded rectangle behind student */}
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2"
              style={{
                width: '340px',
                height: '440px',
                background: 'linear-gradient(145deg, #4c1d95, #3730a3)',
                borderRadius: '60% 40% 40% 60% / 50% 50% 50% 50%',
                zIndex: 0,
              }}
            />

            {/* Student image — rounded corners */}
            <div style={{ position: 'absolute', bottom: 0, right: '30px', height: '82%', width: 'auto', zIndex: 10, borderRadius: '24px', overflow: 'hidden' }}>
              <img
                src="https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/page/search-creative-images/cta/student-laptop-choose-dell-scp-2800.png?fmt=png-alpha&wid=900&hei=600"
                alt="Student with laptop"
                style={{ height: '100%', width: 'auto', objectFit: 'contain', display: 'block' }}
                className="drop-shadow-2xl"
              />
            </div>

            {/* LIVE CLASS badge — top right */}
            <div className="absolute top-12 right-4 bg-white rounded-2xl shadow-2xl px-4 py-3 z-30 flex items-center gap-3" style={{ minWidth: '130px' }}>
              <div className="bg-red-100 p-2.5 rounded-xl flex-shrink-0">
                <PlayCircle className="h-5 w-5 text-red-500 fill-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Now</p>
                <p className="text-sm font-extrabold text-slate-800 leading-none">LIVE CLASS</p>
              </div>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </div>

            {/* Score and Solution card — top left of image */}
            <div className="absolute z-30 bg-white rounded-2xl shadow-2xl p-4" style={{ top: '12%', left: '-20px', minWidth: '200px' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-extrabold text-violet-600">Q</span>
                </div>
                <p className="text-sm font-extrabold text-slate-800">Score and Solution</p>
              </div>
              {/* Donut chart mockup */}
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="5"/>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="5" strokeDasharray="88 12" strokeLinecap="round"/>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-slate-700">9/10</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <span>9 Correct</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <X className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                    <span>1 Incorrect</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="text-violet-400 font-bold text-sm leading-none">↗</span>
                    <span>0 Unattempted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support badge — bottom right */}
            <div className="absolute bottom-10 right-2 z-30 bg-[#8b5cf6] rounded-2xl shadow-xl px-5 py-3 flex items-center gap-2.5">
              <MessageSquareText className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-sm font-bold text-white">Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY STATS ──────────────────────────────── */}
      <section id="stats" className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Trusted by institutions, Educators, and Students across 135 countries
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="bg-violet-400 rounded-3xl p-10 text-center shadow-xl shadow-violet-100 min-w-[220px]">
              <p className="text-4xl font-extrabold text-white">10,00,000+</p>
              <p className="text-violet-100 text-sm font-semibold mt-2">Happy Teachers &amp; Students</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────── */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Top Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Our Product</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">
              EduLearn is a comprehensive solution that simplifies learning and teaching from anywhere in the world.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────── */}
      <section id="why" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-14">
            Why Choose <span className="text-violet-400">EduLearn</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-violet-50 rounded-3xl p-10">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Teach</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-6 leading-tight">
                Teach Your<br />Student Online
              </h3>
              <ul className="space-y-4">
                {teacherPoints.map((pt, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="h-5 w-5 text-violet-400 flex-shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 rounded-3xl p-10">
              <span className="text-violet-400 font-bold text-xs uppercase tracking-widest">Learn</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-6 leading-tight">
                Learn From<br />Best Teachers
              </h3>
              <ul className="space-y-4">
                {['Access Live Classes Anytime', 'Take Smart Tests & Quizzes', 'Download Study Material', 'Chat with Teachers Directly'].map((pt, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-violet-400 to-sky-400 py-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <GraduationCap className="h-12 w-12 text-white mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to start learning?</h2>
          <p className="text-white/80 mb-8 text-lg">Join 10 lakh+ students and teachers on EduLearn today.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3.5 bg-white text-violet-500 font-bold rounded-2xl hover:bg-violet-50 transition-colors shadow-lg"
            >
              Login Now
            </button>
            <Link
              to="/register"
              className="px-8 py-3.5 border-2 border-white/60 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── SITEMAP / LINKS SECTION ───────────────────────── */}
      <section style={{ background: '#faf7f2' }} className="py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Column 1 — Top Features */}
            <div>
              <h4 className="text-slate-800 font-extrabold text-sm uppercase tracking-widest mb-5 pb-2 border-b border-slate-200">Top Features</h4>
              <ul className="space-y-2.5">
                {[
                  'Classroom Fees Management',
                  'Best Teaching App for Teachers',
                  'Online Classroom Management',
                  'Online Teaching Platforms for Teachers',
                  'Best Classroom Management Software for Teachers',
                  'Empower Your Teaching with AI: Study Material & Test Creation',
                  'Best Fee Management System for Schools and Institutes',
                  'Best Free Online Whiteboard App for Teaching',
                  'Best Online Teaching Platform',
                  'Top Online Teaching Tools | Enhance Your Virtual Classroom Experience',
                  'Classroom App for Teachers: A Game Changer in Online Teaching',
                  'Classroom Management',
                ].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-500 text-sm hover:text-violet-600 transition-colors leading-snug block">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 — Courses */}
            <div>
              <h4 className="text-slate-800 font-extrabold text-sm uppercase tracking-widest mb-5 pb-2 border-b border-slate-200">Courses</h4>
              <ul className="space-y-2.5">
                {[
                  'CBSE', 'ICSE', 'CAT', 'IAS', 'JEE', 'NEET',
                  'Commerce', 'JEE Main', 'NCERT', 'JEE Advanced',
                  'Commerce Education', 'Maths and Science Tutoring',
                  'Banking', 'Language', 'Coding',
                ].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-500 text-sm hover:text-violet-600 transition-colors leading-snug block">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Exams */}
            <div>
              <h4 className="text-slate-800 font-extrabold text-sm uppercase tracking-widest mb-5 pb-2 border-b border-slate-200">Exams</h4>
              <ul className="space-y-2.5">
                {[
                  'CBSE Exams', 'School Exams', 'Board Exams',
                  'GATE 2024', 'IAS Exam', 'JEE Main Exam',
                  'NEET Exam', 'Bank Exam', 'Government Exams',
                  'Education News',
                ].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-500 text-sm hover:text-violet-600 transition-colors leading-snug block">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Exam Preparation */}
            <div>
              <h4 className="text-slate-800 font-extrabold text-sm uppercase tracking-widest mb-5 pb-2 border-b border-slate-200">Exam Preparation</h4>
              <ul className="space-y-2.5">
                {[
                  'CAT Prep', 'IAS Prep', 'Maths', 'Physics', 'Chemistry',
                  'Biology', 'JEE Prep', 'JEE Advanced Prep', 'NEET Prep',
                  'Maths Problem Solving', 'Physics Conceptual Learning',
                  'Chemistry Interactive Tutorial', 'Biology Exam Questions',
                  'Study Schedule', 'Subject-Specific Prep',
                ].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-500 text-sm hover:text-violet-600 transition-colors leading-snug block">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-violet-400 p-1.5 rounded-lg"><BookOpen className="h-4 w-4 text-white" /></div>
          <span className="text-white font-bold">EduLearn</span>
        </div>
        <p>© {new Date().getFullYear()} EduLearn. All rights reserved.</p>
      </footer>

      {/* ── LOGIN MODAL ───────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal header — light gradient */}
            <div className="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/30 p-2 rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-xl">Welcome Back!</h3>
                  <p className="text-white/80 text-xs font-medium">Sign in to continue learning</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white bg-white/20 rounded-full p-1.5 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab switch */}
            <div className="flex border-b border-slate-100 bg-slate-50">
              <button className="flex-1 py-3 text-sm font-bold text-[#6d28d9] border-b-2 border-[#8b5cf6] bg-white">
                Login
              </button>
              <Link to="/register" className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 text-center transition-colors">
                Sign Up
              </Link>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="px-8 py-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 p-3 rounded-2xl flex items-center text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email address</label>
                <input
                  type="email" required
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300/40 focus:border-violet-400 focus:bg-white transition-all"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-600">Password</label>
                  <a href="#" className="text-xs font-semibold text-[#8b5cf6] hover:text-[#6d28d9]">Forgot password?</a>
                </div>
                <input
                  type="password" required
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300/40 focus:border-violet-400 focus:bg-white transition-all"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] hover:from-[#7c3aed] hover:to-[#8b5cf6] text-white font-bold rounded-2xl shadow-sm shadow-violet-300 transition-all active:scale-[0.98] mt-2"
              >
                Sign in securely
              </button>
              <p className="text-center text-sm text-slate-500 pt-1">
                New to EduLearn?{' '}
                <Link to="/register" className="font-bold text-[#8b5cf6] hover:text-[#6d28d9]">Create an account</Link>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
