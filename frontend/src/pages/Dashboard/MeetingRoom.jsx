import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, Wifi, WifiOff, Copy, CheckCircle, Link2 } from 'lucide-react';

const MeetingRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inMeeting, setInMeeting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState(0);

  const formatRoleLabel = (value) => {
    if (!value) return 'Participant';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const meetingTitle = meeting?.title || 'Live Meeting';
  const meetingContextName =
    meeting?.class_name || meeting?.group_name || meeting?.meeting_type || 'General Meeting';
  const meetingHostName =
    meeting?.teacher_name || meeting?.host_name || meeting?.organizer_name || 'Host';
  const roomScope = meeting?.class_id || meeting?.id || 'room';

  const verifyCode = useCallback(async (meetingCode) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/plans/meetings/join',
        { meeting_code: meetingCode.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeeting(res.data.meeting);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired meeting code');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (code) {
      verifyCode(code);
    }
  }, [code, verifyCode]);

  const shareableLink = `${window.location.origin}/meeting/${code?.toUpperCase()}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoinMeeting = async () => {
    try {
      if (meeting?.meeting_type === 'business' && meeting?.id) {
        await axios.post(
          `http://localhost:5000/api/plans/business/meetings/${meeting.id}/join`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      // Do not block meeting entry if analytics tracking fails.
      console.error('Business meeting join tracking failed:', err);
    } finally {
      setInMeeting(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="h-20 w-20 rounded-full bg-indigo-600/30 flex items-center justify-center mx-auto animate-pulse">
              <Wifi className="h-10 w-10 text-indigo-400" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/40 animate-ping" />
          </div>
          <p className="text-white font-bold text-xl">Connecting to meeting…</p>
          <p className="text-indigo-300 text-sm mt-2">Verifying code <span className="font-mono font-bold text-indigo-200">{code?.toUpperCase()}</span></p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="bg-red-100 p-5 rounded-full inline-flex mb-5">
            <WifiOff className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Meeting Not Found</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (inMeeting) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-800/80 backdrop-blur border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 h-2.5 w-2.5 rounded-full animate-pulse" />
            <div>
              <p className="text-white font-bold text-sm leading-tight">{meetingTitle}</p>{/*
              <p className="text-slate-400 text-xs">{meeting.class_name} • by {meeting.teacher_name}</p>
            */}<p className="text-slate-400 text-xs">{meetingContextName} - hosted by {meetingHostName}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-slate-700 text-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold">
              <Wifi className="h-3.5 w-3.5" />
              {participants + 1} in room
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
            >
              {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Link2 className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Share Link'}
            </button>
            <button
              onClick={() => { setInMeeting(false); navigate(-1); }}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
            >
              Leave
            </button>
          </div>
        </div>

        {/* Jitsi iframe */}
        <div className="flex-1">
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={`lms-${meeting.meeting_code}-${roomScope}`}
            configOverwrite={{
              startWithAudioMuted: true,
              disableModeratorIndicator: false,
              enableEmailInStats: false,
              prejoinPageEnabled: false,
              disableDeepLinking: true,
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
              SHOW_CHROME_EXTENSION_BANNER: false,
            }}
            userInfo={{
              displayName: user?.name || 'Participant',
              email: user?.email || '',
            }}
            onApiReady={(api) => {
              api.addListener('participantJoined', () => setParticipants(p => p + 1));
              api.addListener('participantLeft', () => setParticipants(p => Math.max(0, p - 1)));
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = 'calc(100vh - 56px)';
              iframeRef.style.width = '100%';
            }}
          />
        </div>
      </div>
    );
  }

  // Lobby / pre-join screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium text-sm">Go back</span>
        </button>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-7">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-emerald-400 h-3 w-3 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Live Meeting</span>
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight">{meetingTitle}</h1>
            <p className="text-indigo-200 text-sm mt-1">{meetingContextName}</p>
            <p className="text-indigo-300 text-xs mt-0.5">Hosted by <span className="font-bold text-white">{meetingHostName}</span></p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-5">
            {/* Meeting code */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Meeting Code</p>
                <p className="font-mono font-bold text-white text-2xl tracking-[0.25em]">{meeting.meeting_code}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={copyLink} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors">
                  {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>

            {/* Shareable link */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Share this link with anyone</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 overflow-hidden">
                  <p className="text-indigo-200 text-xs font-mono truncate">{shareableLink}</p>
                </div>
                <button
                  onClick={copyLink}
                  className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl transition-colors"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-emerald-300" /> : <Link2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Joining as */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(user?.name?.charAt(0) || 'P').toUpperCase()}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{user?.name || 'Participant'}</p>
                <p className="text-slate-400 text-xs">{formatRoleLabel(user?.role)}</p>
              </div>
            </div>

            {/* Join button */}
            <button
              onClick={handleJoinMeeting}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <Wifi className="h-5 w-5" />
              Join Meeting Now
            </button>

            <p className="text-center text-slate-500 text-xs">
              By joining you agree to our terms. Your video & audio may be shared with all participants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
