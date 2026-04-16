import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, AlertCircle, Users, GraduationCap, Briefcase } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState(null);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await register(name, email, password, role);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-2.5">
            <div className="bg-[#8b5cf6] p-2 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">EduLearn</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-bold text-[#8b5cf6] border-2 border-[#8b5cf6] rounded-xl hover:bg-violet-50 transition-colors"
            >
              Login
            </Link>
            <button className="px-5 py-2 text-sm font-bold text-white bg-[#8b5cf6] rounded-xl shadow-sm shadow-violet-300 cursor-default">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────── */}
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-violet-50 via-sky-50/40 to-teal-50/30 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* background blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* Header — light gradient */}
            <div className="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] px-8 py-7 text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-white/30 p-3 rounded-2xl backdrop-blur-sm">
                  <GraduationCap className="h-8 w-8 text-white" strokeWidth={1.8} />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-white">Create an Account</h1>
              <p className="text-white/80 text-sm mt-1 font-medium">Choose the account type that fits you best</p>
            </div>

            {/* Tab switch */}
            <div className="flex border-b border-slate-100 bg-slate-50">
              <Link to="/login" className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 text-center transition-colors">
                Login
              </Link>
              <button className="flex-1 py-3 text-sm font-bold text-[#6d28d9] border-b-2 border-[#8b5cf6] bg-white">
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="px-8 py-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 p-3 rounded-2xl flex items-center text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
                </div>
              )}

              {/* Role selector */}
              <div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'student', label: 'Student', icon: BookOpen },
                    { val: 'teacher', label: 'Teacher', icon: Users },
                    { val: 'business', label: 'Business', icon: Briefcase },
                  ].map(({ val, label, icon: Icon }) => (
                    <label
                      key={val}
                      className={`cursor-pointer rounded-2xl px-4 py-3.5 border-2 flex flex-col items-center gap-1.5 text-sm font-bold transition-all duration-200 ${role === val
                          ? 'bg-violet-50 border-[#8b5cf6] text-[#6d28d9]'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-violet-200 hover:bg-violet-50/30'
                        }`}
                    >
                      <input type="radio" className="sr-only" name="role" value={val} checked={role === val} onChange={() => setRole(val)} />
                      <Icon className={`h-5 w-5 ${role === val ? 'text-[#8b5cf6]' : 'text-slate-400'}`} strokeWidth={1.8} />
                      {label}
                    </label>
                  ))}
                </div>
                {role === 'business' && (
                  <p className="mt-3 rounded-2xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-medium text-slate-600">
                    Business accounts are guided to the meeting join flow after sign in.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Full Name</label>
                <input
                  type="text" required
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300/40 focus:border-violet-400 focus:bg-white transition-all"
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email address</label>
                <input
                  type="email" required
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300/40 focus:border-violet-400 focus:bg-white transition-all"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Password</label>
                <input
                  type="password" required
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-2xl placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300/40 focus:border-violet-400 focus:bg-white transition-all"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a secure password"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] hover:from-[#7c3aed] hover:to-[#8b5cf6] text-white font-bold rounded-2xl shadow-sm shadow-violet-300 transition-all active:scale-[0.98]"
              >
                Create Account
              </button>

              <p className="text-center text-sm text-slate-500 pt-1">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-[#8b5cf6] hover:text-[#6d28d9]">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-[#8b5cf6] p-1.5 rounded-lg"><BookOpen className="h-4 w-4 text-white" /></div>
          <span className="text-white font-bold">EduLearn</span>
        </div>
        <p>© {new Date().getFullYear()} EduLearn. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Register;
