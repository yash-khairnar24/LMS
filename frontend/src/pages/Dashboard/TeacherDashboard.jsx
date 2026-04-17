import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import {
  Plus, Book, Users, LogOut, PlayCircle, BookOpen, Bell,
  Calendar, MoreVertical, LayoutGrid, Clock, UsersRound,
  X, Pencil, Trash2, ArrowRight, AlertTriangle,
  CheckCircle, Video, HelpCircle, ClipboardCheck,
  MessageSquareText, PhoneCall, Wifi, Copy, ToggleLeft, ToggleRight,
  Menu, LayoutDashboard, GraduationCap, Megaphone, ShieldCheck
} from 'lucide-react';

const FEATURES = [
  { key: 'feature_live_class', label: 'Live Class', icon: PlayCircle },
  { key: 'feature_study_material', label: 'Study Material', icon: BookOpen },
  { key: 'feature_ask_doubt', label: 'Ask Doubt', icon: HelpCircle },
  { key: 'feature_recording', label: 'Recording', icon: Video },
  { key: 'feature_assignment', label: 'Assignment', icon: ClipboardCheck },
  { key: 'feature_smart_test', label: 'Smart Test', icon: Clock },
  { key: 'feature_chat', label: 'Chat', icon: MessageSquareText },
  { key: 'feature_support', label: 'Support', icon: PhoneCall },
];

const TeacherDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Quick Actions Global State
  const [showQuickMeeting, setShowQuickMeeting] = useState(false);
  const [showQuickMaterial, setShowQuickMaterial] = useState(false);
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [quickClassId, setQuickClassId] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickFile, setQuickFile] = useState(null);
  const [quickDate, setQuickDate] = useState('');
  const [quickMarks, setQuickMarks] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Teacher Panel State
  const [teacherPanel, setTeacherPanel] = useState(null); // null | 'materials' | 'assignments' | 'smarttest'
  const [teacherMaterials, setTeacherMaterials] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [smartTestResults, setSmartTestResults] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);

  const openTeacherPanel = async (type) => {
    setSidebarOpen(false);
    setTeacherPanel(type);
    setPanelLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (type === 'materials') {
        const res = await axios.get('http://localhost:5000/api/features/teacher/materials', { headers });
        setTeacherMaterials(res.data.materials);
      } else if (type === 'assignments') {
        const res = await axios.get('http://localhost:5000/api/features/teacher/assignments', { headers });
        setTeacherAssignments(res.data.assignments);
      } else if (type === 'smarttest') {
        const res = await axios.get('http://localhost:5000/api/features/teacher/smart-test', { headers });
        setSmartTestResults(res.data.results);
      }
    } catch (err) { console.error(err); }
    finally { setPanelLoading(false); }
  };

  const sidebarLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, bg: 'bg-indigo-50', color: 'text-indigo-600', action: () => setSidebarOpen(false) },
    { label: 'My Classes', icon: GraduationCap, bg: 'bg-purple-50', color: 'text-purple-600', action: () => setSidebarOpen(false) },
    { label: 'Live Sessions', icon: PlayCircle, bg: 'bg-rose-50', color: 'text-rose-500', action: () => setSidebarOpen(false) },
    { label: 'Study Material', icon: BookOpen, bg: 'bg-blue-50', color: 'text-blue-500', action: () => openTeacherPanel('materials') },
    { label: 'Assignments', icon: ClipboardCheck, bg: 'bg-purple-50', color: 'text-purple-500', action: () => openTeacherPanel('assignments') },
    { label: 'Smart Test', icon: Clock, bg: 'bg-emerald-50', color: 'text-emerald-500', action: () => openTeacherPanel('smarttest') },
    { label: 'Advertisements', icon: Megaphone, bg: 'bg-amber-50', color: 'text-amber-500', action: () => { setSidebarOpen(false); navigate('/teacher/advertisements'); } },
    ...(user?.isAdmin ? [{
      label: 'Admin Approvals',
      icon: ShieldCheck,
      bg: 'bg-slate-100',
      color: 'text-slate-700',
      action: () => { setSidebarOpen(false); navigate('/admin/advertisements'); }
    }] : []),
    { label: 'Chat', icon: MessageSquareText, bg: 'bg-blue-50', color: 'text-blue-600', action: () => setSidebarOpen(false) },
    { label: 'Schedule', icon: Calendar, bg: 'bg-slate-100', color: 'text-slate-600', action: () => setSidebarOpen(false) },
    { label: 'Support', icon: PhoneCall, bg: 'bg-fuchsia-50', color: 'text-fuchsia-500', action: () => setSidebarOpen(false) },
  ];

  // Edit / Delete state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingClass, setDeletingClass] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Class Management (Enter) state
  const [showClassMgmt, setShowClassMgmt] = useState(false);
  const [mgmtClass, setMgmtClass] = useState(null);
  const [mgmtTab, setMgmtTab] = useState('plans'); // 'plans' | 'meetings'

  // Plans state
  const [plans, setPlans] = useState([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState({ name: '', price: '', ...Object.fromEntries(FEATURES.map(f => [f.key, false])) });
  const [planFormLoading, setPlanFormLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Meetings state
  const [meetings, setMeetings] = useState([]);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchClasses();
    const handler = () => setActiveDropdown(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/classes/teacher/my-classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data.classes);
    } catch (err) { console.error(err); }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/classes',
        { class_name: newClassName, description: newClassDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateModal(false); setNewClassName(''); setNewClassDesc('');
      fetchClasses();
    } catch (err) { console.error(err); }
  };

  const openEditModal = (cls) => {
    setEditingClass(cls); setEditName(cls.class_name);
    setEditDesc(cls.description || ''); setEditError('');
    setShowEditModal(true); setActiveDropdown(null);
  };

  const handleEditClass = async (e) => {
    e.preventDefault(); setEditLoading(true); setEditError('');
    try {
      await axios.put(`http://localhost:5000/api/classes/${editingClass.id}`,
        { class_name: editName, description: editDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false); fetchClasses();
    } catch (err) { setEditError(err.response?.data?.message || 'Failed to update'); }
    finally { setEditLoading(false); }
  };

  const openDeleteConfirm = (cls) => {
    setDeletingClass(cls); setShowDeleteConfirm(true); setActiveDropdown(null);
  };

  const handleDeleteClass = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/classes/${deletingClass.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowDeleteConfirm(false); fetchClasses();
    } catch (err) { console.error(err); }
    finally { setDeleteLoading(false); }
  };

  // ── Class Management (Enter) ─────────────────────────────────────
  const openClassMgmt = async (cls) => {
    setMgmtClass(cls); setMgmtTab('plans');
    setShowClassMgmt(true);
    await Promise.all([loadPlans(cls.id), loadMeetings(cls.id)]);
  };

  const loadPlans = async (classId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/plans/class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlans(res.data.plans);
    } catch (err) { console.error(err); }
  };

  const loadMeetings = async (classId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/plans/meetings/class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetings(res.data.meetings);
    } catch (err) { console.error(err); }
  };

  // Plans CRUD
  const openNewPlanForm = () => {
    setEditingPlan(null);
    setPlanForm({ name: '', price: '', ...Object.fromEntries(FEATURES.map(f => [f.key, false])), feature_support: true });
    setShowPlanForm(true);
  };

  const openEditPlanForm = (plan) => {
    setEditingPlan(plan);
    setPlanForm({ name: plan.name, price: plan.price, ...Object.fromEntries(FEATURES.map(f => [f.key, !!plan[f.key]])) });
    setShowPlanForm(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault(); setPlanFormLoading(true);
    try {
      const body = { ...planForm, price: parseFloat(planForm.price) || 0 };
      if (editingPlan) {
        await axios.put(`http://localhost:5000/api/plans/${editingPlan.id}`, body,
          { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`http://localhost:5000/api/plans/class/${mgmtClass.id}`, body,
          { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowPlanForm(false);
      await loadPlans(mgmtClass.id);
    } catch (err) { console.error(err); }
    finally { setPlanFormLoading(false); }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/plans/${planId}`,
        { headers: { Authorization: `Bearer ${token}` } });
      await loadPlans(mgmtClass.id);
    } catch (err) { console.error(err); }
  };

  // Meetings
  const handleCreateMeeting = async (e) => {
    e.preventDefault(); setMeetingLoading(true);
    try {
      await axios.post('http://localhost:5000/api/plans/meetings',
        { class_id: mgmtClass.id, title: meetingTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetingTitle(''); setShowMeetingForm(false);
      await loadMeetings(mgmtClass.id);
    } catch (err) { console.error(err); }
    finally { setMeetingLoading(false); }
  };

  const handleToggleMeeting = async (meetingId) => {
    try {
      await axios.patch(`http://localhost:5000/api/plans/meetings/${meetingId}/toggle`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      await loadMeetings(mgmtClass.id);
    } catch (err) { console.error(err); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const dashboardFeatures = [
    { title: 'Start Meeting', icon: PlayCircle, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', action: () => { setQuickClassId(''); setQuickTitle(''); setShowQuickMeeting(true); } },
    { title: 'Upload Material', icon: BookOpen, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', action: () => { setQuickClassId(''); setQuickTitle(''); setQuickFile(null); setShowQuickMaterial(true); } },
    { title: 'Add Advertise', icon: Bell, bgColor: 'bg-amber-100', iconColor: 'text-amber-600', action: () => navigate('/teacher/advertisements') },
    { title: 'Schedule Class', icon: Calendar, bgColor: 'bg-rose-100', iconColor: 'text-rose-600', action: () => { setQuickClassId(''); setQuickTitle(''); setQuickDate(''); setQuickMarks(''); setShowQuickSchedule(true); } }
  ];

  // Quick Action Handlers
  const handleQuickMeeting = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/plans/meetings', { class_id: quickClassId, title: quickTitle }, { headers: { Authorization: `Bearer ${token}` } });
      setShowQuickMeeting(false);
      alert('Meeting created successfully!');
    } catch (err) { console.error(err); alert('Failed to create meeting'); }
  };

  const handleQuickMaterial = async (e) => {
    e.preventDefault();
    if (!quickFile) return alert('Please select a file');
    const formData = new FormData();
    formData.append('class_id', quickClassId);
    formData.append('title', quickTitle);
    formData.append('file', quickFile);
    try {
      await axios.post('http://localhost:5000/api/features/materials', formData, { headers: { Authorization: `Bearer ${token}` } });
      setShowQuickMaterial(false);
      alert('Material uploaded successfully!');
    } catch (err) { console.error(err); alert('Failed to upload material'); }
  };

  const handleQuickSchedule = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/features/assignments', { class_id: quickClassId, title: quickTitle, due_date: quickDate, max_marks: quickMarks }, { headers: { Authorization: `Bearer ${token}` } });
      setShowQuickSchedule(false);
      alert('Assignment created successfully!');
    } catch (err) { console.error(err); alert('Failed to create assignment'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-10" onClick={() => setActiveDropdown(null)}>
      <nav
        className={`sticky top-0 z-20 transition-all duration-300 ${scrolled
            ? 'bg-indigo-600/70 backdrop-blur-md shadow-lg border-b border-indigo-400/40'
            : 'bg-indigo-600 shadow-lg'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="p-2 text-white/80 hover:text-white hover:bg-indigo-700 rounded-xl transition-colors">
                <Menu className="h-6 w-6" />
              </button>
              <Book className="h-7 w-7 text-white" />
              <span className="font-bold text-white text-xl">LMS Teacher Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-indigo-100 hidden sm:block font-medium">Welcome, {user?.name}</span>
              <button onClick={logout} className="p-2 text-indigo-100 hover:text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center">
                <LogOut className="h-5 w-5 sm:mr-1" />
                <span className="hidden sm:block font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="bg-blue-100 p-4 rounded-xl"><LayoutGrid className="h-8 w-8 text-blue-600" /></div>
            <div><p className="text-slate-500 font-medium text-sm">Active Classes</p><h2 className="text-3xl font-bold text-slate-800">{classes.length}</h2></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="bg-emerald-100 p-4 rounded-xl"><UsersRound className="h-8 w-8 text-emerald-600" /></div>
            <div><p className="text-slate-500 font-medium text-sm">Total Students</p><h2 className="text-3xl font-bold text-slate-800">{classes.reduce((s, c) => s + (parseInt(c.student_count) || 0), 0)}</h2></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="bg-purple-100 p-4 rounded-xl"><Clock className="h-8 w-8 text-purple-600" /></div>
            <div><p className="text-slate-500 font-medium text-sm">Live Sessions</p><h2 className="text-3xl font-bold text-slate-800">3</h2></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardFeatures.map((item, i) => (
              <button key={i} onClick={item.action} className={`${item.bgColor} rounded-2xl p-6 flex flex-col items-center justify-center hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                <div className="h-14 w-14 mb-3 flex items-center justify-center rounded-full bg-white/50">
                  <item.icon className={`h-7 w-7 ${item.iconColor}`} />
                </div>
                <span className={`font-bold text-[15px] ${item.iconColor.replace('600', '800')}`}>{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Classes Header */}
        <div className="flex justify-between items-center mb-6 px-1">
          <h1 className="text-2xl font-bold text-slate-800">Your Classes</h1>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors active:scale-95">
            <Plus className="h-5 w-5 mr-1.5" /> Create Class
          </button>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-sm border border-slate-200 py-20">
            <Book className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No classes yet</h3>
            <p className="text-slate-500 mt-2 font-medium">Get started by creating a new class.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 overflow-visible shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 h-28 p-6 flex justify-between items-start rounded-t-2xl relative overflow-visible">
                  <div className="absolute top-[-20px] right-[-20px] bg-white/10 h-24 w-24 rounded-full blur-xl"></div>
                  <div className="z-10">
                    <h3 className="text-xl font-bold text-white leading-tight max-w-[200px] truncate">{cls.class_name}</h3>
                    <p className="text-indigo-100 text-xs mt-1 font-medium">{new Date(cls.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="relative z-10">
                    <button onClick={(e) => toggleDropdown(e, cls.id)} className="text-white hover:bg-white/20 p-1 rounded-full transition-colors">
                      <MoreVertical className="h-6 w-6" />
                    </button>
                    {activeDropdown === cls.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEditModal(cls)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2">
                          <Pencil className="h-4 w-4 text-indigo-500" /> Edit Class
                        </button>
                        <hr className="my-1 border-slate-100" />
                        <button onClick={() => openDeleteConfirm(cls)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2">
                          <Trash2 className="h-4 w-4" /> Delete Class
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-slate-600 text-sm mb-6 flex-1">{cls.description}</p>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center text-slate-500 text-xs font-bold">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{cls.student_count || 0} Students</span>
                    </div>
                    <button onClick={() => openClassMgmt(cls)} className="flex items-center gap-1.5 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors active:scale-95">
                      Manage <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ══ Create Class Modal ══ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Create New Class</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-800"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateClass} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Class Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Advanced Mathematics" value={newClassName} onChange={e => setNewClassName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                <textarea className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-28 resize-none" placeholder="What will your students learn?" value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Edit Class Modal ══ */}
      {showEditModal && editingClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Edit Class</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-800"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleEditClass} className="p-6 space-y-5">
              {editError && <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm">{editError}</div>}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Class Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                <textarea className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-28 resize-none" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={editLoading} className="px-5 py-2.5 bg-indigo-600 disabled:bg-indigo-400 text-white rounded-xl font-bold">{editLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Delete Confirmation ══ */}
      {showDeleteConfirm && deletingClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
            <div className="bg-red-100 p-4 rounded-full inline-flex mb-4"><AlertTriangle className="h-8 w-8 text-red-500" /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Class?</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to delete <span className="font-bold text-slate-700">"{deletingClass.class_name}"</span>? This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">Cancel</button>
              <button onClick={handleDeleteClass} disabled={deleteLoading} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-bold">{deleteLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CLASS MANAGEMENT MODAL (Plans + Meetings) ══ */}
      {showClassMgmt && mgmtClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-t-2xl flex justify-between items-start">
              <div>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Managing Class</p>
                <h2 className="text-2xl font-bold text-white">{mgmtClass.class_name}</h2>
                <p className="text-indigo-100 text-sm mt-1">{mgmtClass.student_count || 0} students enrolled</p>
              </div>
              <button onClick={() => setShowClassMgmt(false)} className="text-white/70 hover:text-white bg-white/20 rounded-full p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              {[
                { key: 'plans', label: 'Plans & Pricing', icon: CheckCircle },
                { key: 'meetings', label: 'Live Sessions', icon: Wifi }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setMgmtTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors ${mgmtTab === tab.key ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* ── PLANS TAB ── */}
              {mgmtTab === 'plans' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Plans for this class</h3>
                    <button onClick={openNewPlanForm} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold">
                      <Plus className="h-4 w-4" /> Add Plan
                    </button>
                  </div>

                  {plans.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-500 font-medium">No plans yet. Create one so students can subscribe!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {plans.map(plan => (
                        <div key={plan.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <span className="font-bold text-slate-800 text-lg">{plan.name}</span>
                              <span className="ml-3 text-indigo-600 font-bold">{plan.price == 0 ? 'Free' : `₹${parseFloat(plan.price).toLocaleString()}`}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => openEditPlanForm(plan)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil className="h-4 w-4" /></button>
                              <button onClick={() => handleDeletePlan(plan.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {FEATURES.map(f => (
                              <span key={f.key} className={`text-xs px-2.5 py-1 rounded-full font-bold ${plan[f.key] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400 line-through'}`}>
                                {f.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Plan Form */}
                  {showPlanForm && (
                    <div className="mt-5 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5">
                      <h4 className="font-bold text-indigo-800 mb-4">{editingPlan ? 'Edit Plan' : 'New Plan'}</h4>
                      <form onSubmit={handleSavePlan} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 mb-1 block">Plan Name</label>
                            <input required type="text" placeholder="e.g. Basic, Standard" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400 text-sm" value={planForm.name} onChange={e => setPlanForm(p => ({ ...p, name: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 mb-1 block">Price (₹) — 0 for free</label>
                            <input type="number" min="0" placeholder="0" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400 text-sm" value={planForm.price} onChange={e => setPlanForm(p => ({ ...p, price: e.target.value }))} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 mb-2 block">Included Features</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {FEATURES.map(f => {
                              const Icon = f.icon;
                              const enabled = !!planForm[f.key];
                              return (
                                <button
                                  key={f.key}
                                  type="button"
                                  onClick={() => setPlanForm(p => ({ ...p, [f.key]: !p[f.key] }))}
                                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${enabled ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                                >
                                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                                  {f.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <button type="button" onClick={() => setShowPlanForm(false)} className="px-4 py-2 text-slate-600 hover:bg-white rounded-xl font-bold text-sm">Cancel</button>
                          <button type="submit" disabled={planFormLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm disabled:bg-indigo-400">
                            {planFormLoading ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* ── MEETINGS TAB ── */}
              {mgmtTab === 'meetings' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Live Sessions</h3>
                    <button onClick={() => setShowMeetingForm(!showMeetingForm)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold">
                      <Plus className="h-4 w-4" /> Create Session
                    </button>
                  </div>

                  {showMeetingForm && (
                    <form onSubmit={handleCreateMeeting} className="mb-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-600 mb-1 block">Session Title</label>
                        <input required type="text" placeholder="e.g. Chapter 5 - Live Revision" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400 text-sm" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} />
                      </div>
                      <button type="submit" disabled={meetingLoading} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm disabled:bg-indigo-400 whitespace-nowrap">
                        {meetingLoading ? 'Creating...' : 'Generate Code'}
                      </button>
                      <button type="button" onClick={() => setShowMeetingForm(false)} className="px-3 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl"><X className="h-4 w-4" /></button>
                    </form>
                  )}

                  {meetings.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <Wifi className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 font-medium">No sessions yet. Create one to get a shareable code.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meetings.map(m => (
                        <div key={m.id} className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between ${m.is_active ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                                {m.is_active ? '● LIVE' : '◉ ENDED'}
                              </span>
                              <span className="font-bold text-slate-800">{m.title}</span>
                            </div>
                            <p className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                              <span className="font-mono font-bold text-slate-800 tracking-widest text-sm">{m.meeting_code}</span>
                              <button onClick={() => copyCode(m.meeting_code)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                {copiedCode === m.meeting_code ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                            <button onClick={() => handleToggleMeeting(m.id)} title={m.is_active ? 'End session' : 'Reactivate'} className={`p-2 rounded-xl transition-colors ${m.is_active ? 'text-emerald-600 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-200'}`}>
                              {m.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      )
      {/* ══ Teacher Panel Modal ══ */}
      {teacherPanel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6">
            {/* Header */}
            <div className={`p-6 rounded-t-2xl flex justify-between items-center ${
              teacherPanel === 'materials' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
              teacherPanel === 'assignments' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
              'bg-gradient-to-r from-emerald-600 to-teal-600'
            }`}>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-0.5">Teacher View</p>
                <h2 className="text-2xl font-bold text-white">
                  {teacherPanel === 'materials' && '📚 Study Materials'}
                  {teacherPanel === 'assignments' && '📋 Assignments'}
                  {teacherPanel === 'smarttest' && '🎯 Smart Test Results'}
                </h2>
              </div>
              <button onClick={() => setTeacherPanel(null)} className="text-white/70 hover:text-white bg-white/20 rounded-full p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {panelLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-slate-500 font-medium">Loading...</p>
                </div>
              ) : (
                <>
                  {/* ── STUDY MATERIALS ── */}
                  {teacherPanel === 'materials' && (
                    <div>
                      {teacherMaterials.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 font-medium">No materials uploaded yet. Use "Upload Material" from Quick Actions!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {teacherMaterials.map(m => (
                            <div key={m.id} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl p-4">
                              <div className="flex items-center gap-4">
                                <div className="bg-blue-600 text-white rounded-xl p-3">
                                  <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800">{m.title}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{m.class_name} · {new Date(m.created_at).toLocaleDateString()}</p>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">{m.file_type || 'File'}</span>
                                </div>
                              </div>
                              <a href={`http://localhost:5000${m.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-xl transition-colors">
                                Download ↓
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── ASSIGNMENTS ── */}
                  {teacherPanel === 'assignments' && (
                    <div>
                      {teacherAssignments.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <ClipboardCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 font-medium">No assignments created yet. Use "Schedule Class" from Quick Actions!</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="text-left px-5 py-3 font-bold text-slate-600">Title</th>
                                <th className="text-left px-5 py-3 font-bold text-slate-600">Class</th>
                                <th className="text-left px-5 py-3 font-bold text-slate-600">Due Date</th>
                                <th className="text-center px-5 py-3 font-bold text-slate-600">Max Marks</th>
                                <th className="text-center px-5 py-3 font-bold text-slate-600">Submissions</th>
                                <th className="text-left px-5 py-3 font-bold text-slate-600">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teacherAssignments.map(a => {
                                const overdue = new Date(a.due_date) < new Date();
                                return (
                                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 font-semibold text-slate-800">{a.title}</td>
                                    <td className="px-5 py-3 text-slate-600">{a.class_name}</td>
                                    <td className="px-5 py-3 text-slate-600">{new Date(a.due_date).toLocaleDateString()}</td>
                                    <td className="px-5 py-3 text-center font-bold text-slate-800">{a.max_marks}</td>
                                    <td className="px-5 py-3 text-center">
                                      <span className="bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full text-xs">{a.submission_count}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${overdue ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {overdue ? 'Overdue' : 'Active'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── SMART TEST RESULTS ── */}
                  {teacherPanel === 'smarttest' && (
                    <div>
                      {smartTestResults.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 font-medium">No graded submissions yet. Grade student assignments to see scores here.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="text-left px-5 py-3 font-bold text-slate-600">Student</th>
                                <th className="text-left px-5 py-3 font-bold text-slate-600">Assignment</th>
                                <th className="text-left px-5 py-3 font-bold text-slate-600">Class</th>
                                <th className="text-center px-5 py-3 font-bold text-slate-600">Score</th>
                                <th className="text-center px-5 py-3 font-bold text-slate-600">Percentage</th>
                                <th className="text-left px-5 py-3 font-bold text-slate-600">Submitted</th>
                              </tr>
                            </thead>
                            <tbody>
                              {smartTestResults.map((r, i) => {
                                const pct = r.max_marks ? Math.round((r.score / r.max_marks) * 100) : 0;
                                return (
                                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 font-semibold text-slate-800">{r.student_name}</td>
                                    <td className="px-5 py-3 text-slate-600">{r.assignment_title}</td>
                                    <td className="px-5 py-3 text-slate-600">{r.class_name}</td>
                                    <td className="px-5 py-3 text-center font-bold text-slate-800">{r.score}/{r.max_marks}</td>
                                    <td className="px-5 py-3 text-center">
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pct >= 75 ? 'bg-emerald-100 text-emerald-700' : pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                                        {pct}%
                                      </span>
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">{new Date(r.submitted_at).toLocaleDateString()}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ Quick Actions Global Modals ══ */}

      {/* Start Meeting Modal */}
      {showQuickMeeting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Start Meeting</h3>
              <button onClick={() => setShowQuickMeeting(false)} className="text-slate-400 hover:text-slate-800"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleQuickMeeting} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Class</label>
                <select required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={quickClassId} onChange={e => setQuickClassId(e.target.value)}>
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Meeting Topic</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={quickTitle} onChange={e => setQuickTitle(e.target.value)} />
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">Generate Code</button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Material Modal */}
      {showQuickMaterial && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Upload Material</h3>
              <button onClick={() => setShowQuickMaterial(false)} className="text-slate-400 hover:text-slate-800"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleQuickMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Class</label>
                <select required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={quickClassId} onChange={e => setQuickClassId(e.target.value)}>
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Title</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={quickTitle} onChange={e => setQuickTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">File</label>
                <input required type="file" className="w-full" onChange={e => setQuickFile(e.target.files[0])} />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">Upload</button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Class Modal */}
      {showQuickSchedule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Schedule Assignment</h3>
              <button onClick={() => setShowQuickSchedule(false)} className="text-slate-400 hover:text-slate-800"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleQuickSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Class</label>
                <select required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={quickClassId} onChange={e => setQuickClassId(e.target.value)}>
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Assignment Title</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={quickTitle} onChange={e => setQuickTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Due Date</label>
                  <input required type="datetime-local" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={quickDate} onChange={e => setQuickDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Max Marks</label>
                  <input required type="number" min="1" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={quickMarks} onChange={e => setQuickMarks(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold">Schedule Assignment</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar Drawer ── */}
      <div
        className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col"
        style={{
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-5 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-white/20 p-1.5 rounded-lg"><Book className="h-5 w-5 text-white" /></div>
              <span className="text-white font-bold text-lg">EduLearn</span>
            </div>
            <p className="text-indigo-100 text-sm font-medium">{user?.name}</p>
            <span className="inline-block mt-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Teacher</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white/70 hover:text-white bg-white/10 rounded-full p-1.5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sidebarLinks.map((link, i) => {
            const Icon = link.icon;
            const isDivider = i === 2;
            return (
              <React.Fragment key={link.label}>
                {isDivider && (
                  <div className="my-3 px-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Features</p>
                  </div>
                )}
                <button
                  onClick={link.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left mb-0.5"
                >
                  <div className={`h-9 w-9 flex items-center justify-center rounded-xl flex-shrink-0 ${link.bg}`}>
                    <Icon className={`h-5 w-5 ${link.color}`} strokeWidth={1.8} />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm">{link.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 px-3 py-4">
          <button
            onClick={() => { setSidebarOpen(false); logout(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
          >
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50"><LogOut className="h-5 w-5" /></div>
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
