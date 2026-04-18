import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { ADMIN_EMAIL } from '../../constants/admin';
import { ArrowLeft, CheckCircle2, LogOut, ShieldCheck, XCircle } from 'lucide-react';

const AdminAdvertisementsPage = () => {
  const navigate = useNavigate();
  const { token, user, logout } = useContext(AuthContext);

  const [statusFilter, setStatusFilter] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const res = await axios.get(`http://localhost:5000/api/advertisements/admin/requests${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error('Error fetching admin advertisement requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleAction = async (requestId, action) => {
    try {
      setWorkingId(requestId);
      await axios.patch(
        `http://localhost:5000/api/advertisements/admin/requests/${requestId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
    } catch (error) {
      console.error(`Error trying to ${action} request:`, error);
      alert(error.response?.data?.message || 'Action failed');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-slate-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher')}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-white font-bold text-lg leading-none">Admin Advertisement Panel</p>
                <p className="text-slate-300 text-xs mt-1">Admin: {ADMIN_EMAIL}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-slate-300 text-sm font-medium">{user?.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-100 hover:text-white hover:bg-slate-700 text-sm font-semibold"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h1 className="text-2xl font-bold text-slate-800">Advertisement Requests</h1>
            <div className="flex items-center gap-2">
              {['pending', 'approved', 'rejected', 'all'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize ${statusFilter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-slate-500 text-sm">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-slate-500 text-sm">No requests found for this filter.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{req.title}</h3>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-1">
                        By {req.teacher_name} ({req.teacher_email})
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize w-fit ${req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : req.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                      >
                        {req.status}
                      </span>
                      {req.payment_status === 'completed' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold w-fit bg-blue-100 text-blue-700">
                          Payment Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-3">{req.description}</p>

                  <div className="text-xs text-slate-500 font-medium mb-3">
                    Submitted: {new Date(req.created_at).toLocaleString()}
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(req.id, 'approve')}
                        disabled={workingId === req.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:bg-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'reject')}
                        disabled={workingId === req.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm disabled:bg-rose-400"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminAdvertisementsPage;
