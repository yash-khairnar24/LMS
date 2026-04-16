import React, { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Wifi, ArrowRight, Book } from 'lucide-react';

/**
 * Public page at /join or /join/:code
 * - If user is already logged in, redirects straight to /meeting/:code
 * - Otherwise shows a form so attendees can continue after signing in
 */
const JoinMeeting = () => {
  const { code: paramCode } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [code, setCode] = useState(paramCode?.toUpperCase() || '');
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || trimmed.length < 4) {
      setError('Please enter a valid meeting code.');
      return;
    }
    if (!token) {
      // Not logged in → send to login first, then redirect back
      navigate(`/login?redirect=/meeting/${trimmed}`);
      return;
    }
    navigate(`/meeting/${trimmed}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/10 px-5 py-3 rounded-2xl">
            <Book className="h-6 w-6 text-indigo-300" />
            <span className="text-white font-bold text-lg">EduLearn LMS</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-7 text-center">
            <div className="bg-white/20 p-4 rounded-full inline-flex mb-3">
              <Wifi className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Join a Live Meeting</h1>
            <p className="text-indigo-200 text-sm mt-1">Enter the code shared by your teacher, trainer, or host</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleJoin} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                  Meeting Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                  placeholder="e.g. AB12CD34"
                  maxLength={20}
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-500 font-mono text-xl text-center tracking-[0.25em] px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all uppercase"
                />
                {error && <p className="text-red-400 text-xs mt-2 text-center font-medium">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Join Now <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="text-slate-400 text-sm">
                Meeting organizers can share this page or a direct meeting link with attendees.{/*
                  Go to Teacher Dashboard →
              */}</p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          You must be logged in to join. If you are not logged in, you will be redirected to sign in first.
        </p>
      </div>
    </div>
  );
};

export default JoinMeeting;
