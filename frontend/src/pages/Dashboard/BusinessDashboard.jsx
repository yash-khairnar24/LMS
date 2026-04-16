import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Copy,
  LogOut,
  Plus,
  ToggleLeft,
  ToggleRight,
  Video,
  Wifi
} from 'lucide-react';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [error, setError] = useState('');

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/plans/business/meetings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(res.data.meetings || []);
    } catch (err) {
      console.error('Error loading business meetings:', err);
      setError(err.response?.data?.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      setError('');
      await axios.post(
        'http://localhost:5000/api/plans/business/meetings',
        { title: title.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setShowCreateForm(false);
      await loadMeetings();
    } catch (err) {
      console.error('Error creating business meeting:', err);
      setError(err.response?.data?.message || 'Failed to create meeting');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleMeeting = async (meetingId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/plans/business/meetings/${meetingId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadMeetings();
    } catch (err) {
      console.error('Error toggling business meeting:', err);
      setError(err.response?.data?.message || 'Failed to update meeting status');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalJoinedPeople = meetings.reduce((sum, meeting) => sum + Number(meeting.joined_count || 0), 0);
  const liveMeetingsCount = meetings.filter((meeting) => !!meeting.is_active).length;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-slate-800 font-bold text-lg leading-tight">Business Live Meetings</h1>
              <p className="text-slate-500 text-xs">Welcome, {user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/join')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            >
              <Wifi className="h-4 w-4" />
              Join by Code
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs uppercase tracking-widest font-bold">Meeting Control</p>
              <h2 className="text-white text-3xl font-extrabold leading-tight">Live Sessions</h2>
              <p className="text-indigo-100 text-sm mt-1">Generate meeting code and share with participants</p>
            </div>
            <button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {showCreateForm ? 'Close' : 'Create Session'}
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Total Sessions</p>
                <p className="text-slate-800 text-2xl font-extrabold mt-1">{meetings.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-wide">Live Sessions</p>
                <p className="text-emerald-800 text-2xl font-extrabold mt-1">{liveMeetingsCount}</p>
              </div>
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                <p className="text-indigo-700 text-xs font-bold uppercase tracking-wide">People Joined</p>
                <p className="text-indigo-800 text-2xl font-extrabold mt-1">{totalJoinedPeople}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            {showCreateForm && (
              <form
                onSubmit={handleCreateMeeting}
                className="mb-5 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-end"
              >
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wide">
                    Session Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Client Discussion / Demo Session"
                    className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold"
                >
                  {creating ? 'Creating...' : 'Generate Code'}
                </button>
              </form>
            )}

            {loading ? (
              <p className="text-slate-500 text-sm">Loading meetings...</p>
            ) : meetings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                <Video className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium">No sessions created yet.</p>
                <p className="text-slate-400 text-sm mt-1">Click "Create Session" to generate your first meeting code.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      meeting.is_active ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            meeting.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          {meeting.is_active ? 'LIVE' : 'ENDED'}
                        </span>
                        <h3 className="font-bold text-slate-800">{meeting.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(meeting.created_at).toLocaleString()}</p>
                      <p className="text-xs font-semibold text-indigo-600 mt-1">
                        Joined by {Number(meeting.joined_count || 0)} people
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                        <span className="font-mono font-bold text-slate-800 tracking-widest text-sm">
                          {meeting.meeting_code}
                        </span>
                        <button
                          onClick={() => copyCode(meeting.meeting_code)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === meeting.meeting_code ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => navigate(`/meeting/${meeting.meeting_code}`)}
                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-sm font-bold"
                      >
                        Join Now <ArrowRight className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleToggleMeeting(meeting.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          meeting.is_active ? 'text-emerald-600 hover:bg-emerald-100' : 'text-slate-500 hover:bg-slate-200'
                        }`}
                        title={meeting.is_active ? 'End session' : 'Reactivate session'}
                      >
                        {meeting.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default BusinessDashboard;
