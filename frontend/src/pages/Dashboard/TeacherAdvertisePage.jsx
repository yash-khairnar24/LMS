import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle2, Clock3, LogOut, Megaphone, Send, XCircle, CreditCard } from 'lucide-react';

const statusUi = {
  pending: {
    label: 'Pending Approval',
    className: 'bg-amber-100 text-amber-700',
    icon: Clock3
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle2
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-rose-100 text-rose-700',
    icon: XCircle
  }
};

const TeacherAdvertisePage = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('Learn More');
  const [buttonLink, setButtonLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await axios.get('http://localhost:5000/api/advertisements/requests/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error('Error fetching advertisement requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setMessage('Title and description are required.');
      return;
    }
    // Instead of submitting directly, show the payment modal
    setShowPaymentModal(true);
  };

  const processPaymentAndSubmit = async () => {
    setSubmitting(true);
    setMessage('');
    setShowPaymentModal(false);

    try {
      await axios.post(
        'http://localhost:5000/api/advertisements/requests',
        {
          title: title.trim(),
          description: description.trim(),
          button_text: buttonText.trim() || 'Learn More',
          button_link: buttonLink.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle('');
      setDescription('');
      setButtonText('Learn More');
      setButtonLink('');
      setMessage('Advertisement request sent to admin for approval.');
      fetchRequests();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit advertisement request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-indigo-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher')}
              className="p-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-white" />
              <div>
                <p className="text-white font-bold text-lg leading-none">Teacher Advertisements</p>
                <p className="text-indigo-100 text-xs mt-1">Welcome, {user?.name}</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-indigo-50 hover:text-white hover:bg-indigo-500 text-sm font-semibold"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Create Advertisement</h1>
          <p className="text-slate-500 text-sm mb-6">
            Submit your advertisement request. Admin must approve before students can see it.
          </p>

          {message && (
            <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 text-sm font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Special Test Series Starts This Weekend"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                placeholder="Write the full advertisement students should see."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Button Text</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Learn More"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Button Link (optional)</label>
                <input
                  type="url"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold"
            >
              <CreditCard className="h-4 w-4" /> {submitting ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">My Advertisement Requests</h2>

          {loadingRequests ? (
            <p className="text-slate-500 text-sm">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-slate-500 text-sm">No requests submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const ui = statusUi[req.status] || statusUi.pending;
                const StatusIcon = ui.icon;

                return (
                  <div key={req.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-slate-800">{req.title}</h3>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${ui.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {ui.label}
                        </span>
                        {req.payment_status === 'completed' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold w-fit bg-blue-100 text-blue-700">
                            Payment Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{req.description}</p>
                    <div className="text-xs text-slate-500 font-medium">
                      Submitted: {new Date(req.created_at).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Payment Required</h3>
            <p className="text-slate-500 text-sm mb-6">
              To submit this advertisement for admin approval, a fee of <span className="font-bold text-slate-800">₹500</span> is required.
            </p>
            
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 flex flex-col items-center">
              <img src="/upi_qr.png" alt="UPI QR" className="w-32 h-32 rounded-xl mb-3 shadow-sm border border-slate-200 object-cover" />
              <p className="text-xs text-slate-500">Scan QR or pay to Admin UPI</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processPaymentAndSubmit}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/30"
              >
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAdvertisePage;
