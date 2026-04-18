import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { BookOpen, Search, LogOut, CheckCircle, Menu, PlayCircle, HelpCircle, Video, ClipboardCheck, Clock, MessageSquareText, PhoneCall, Home, User, Bell, ArrowRight, X, GraduationCap, LayoutDashboard } from 'lucide-react';
import AdvertisementCarousel from '../../components/AdvertisementCarousel';
import lmsLogo from '../../assets/lms_logo.png';

const StudentDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [approvedAds, setApprovedAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);

  const sidebarLinks = [
    { label: 'Dashboard',      icon: LayoutDashboard,   action: () => { setSidebarOpen(false); navigate('/student'); } },
    { label: 'My Classes',     icon: GraduationCap,     action: () => { setSidebarOpen(false); setActiveTab('enrolled'); } },
    { label: 'Live Class',     icon: PlayCircle,        color: 'text-rose-500',    bg: 'bg-rose-50',    action: () => { setSidebarOpen(false); navigate('/student/feature/live-class'); } },
    { label: 'Study Material', icon: BookOpen,          color: 'text-blue-500',    bg: 'bg-blue-50',    action: () => { setSidebarOpen(false); navigate('/student/feature/study-material'); } },
    { label: 'Ask Doubt',      icon: HelpCircle,        color: 'text-amber-500',   bg: 'bg-amber-50',   action: () => { setSidebarOpen(false); navigate('/student/feature/ask-doubt'); } },
    { label: 'Recording',      icon: Video,             color: 'text-red-500',     bg: 'bg-red-50',     action: () => { setSidebarOpen(false); navigate('/student/feature/recording'); } },
    { label: 'Assignment',     icon: ClipboardCheck,    color: 'text-purple-500',  bg: 'bg-purple-50',  action: () => { setSidebarOpen(false); navigate('/student/feature/assignment'); } },
    { label: 'Smart Test',     icon: Clock,             color: 'text-emerald-500', bg: 'bg-emerald-50', action: () => { setSidebarOpen(false); navigate('/student/feature/smart-test'); } },
    { label: 'Chat',           icon: MessageSquareText, color: 'text-blue-600',    bg: 'bg-blue-50',    action: () => { setSidebarOpen(false); navigate('/student/feature/chat'); } },
    { label: 'Support',        icon: PhoneCall,         color: 'text-fuchsia-500', bg: 'bg-fuchsia-50', action: () => { setSidebarOpen(false); navigate('/student/feature/support'); } },
  ];

  useEffect(() => {
    fetchEnrolledClasses();
    fetchAllClasses();
    fetchApprovedAds();
  }, []);

  const fetchEnrolledClasses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/classes/student/my-classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrolledClasses(res.data.classes);
    } catch (error) {
      console.error('Error fetching enrolled classes', error);
    }
  };

  const fetchAllClasses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/classes/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllClasses(res.data.classes);
    } catch (error) {
      console.error('Error fetching all classes', error);
    }
  };

  const fetchApprovedAds = async () => {
    try {
      setAdsLoading(true);
      const res = await axios.get('http://localhost:5000/api/advertisements/approved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovedAds(res.data.advertisements || []);
    } catch (error) {
      console.error('Error fetching approved advertisements', error);
      setApprovedAds([]);
    } finally {
      setAdsLoading(false);
    }
  };

  const handleEnroll = async (classId) => {
    try {
      await axios.post('http://localhost:5000/api/classes/enroll', { class_id: classId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEnrolledClasses();
      setActiveTab('enrolled');
    } catch (error) {
      alert(error.response?.data?.message || 'Error enrolling');
    }
  };

  const enrolledIds = enrolledClasses.map(c => c.id);
  const filteredAllClasses = allClasses.filter(c => c.class_name.toLowerCase().includes(search.toLowerCase()));

  const features = [
    { title: 'Live Class',     icon: PlayCircle,        bgColor: 'bg-rose-100',    iconColor: 'text-rose-500',    badge: 'LIVE', path: 'live-class' },
    { title: 'Study Material', icon: BookOpen,          bgColor: 'bg-blue-100',    iconColor: 'text-blue-500',    path: 'study-material' },
    { title: 'Ask Doubt',      icon: HelpCircle,        bgColor: 'bg-amber-100',   iconColor: 'text-amber-500',   path: 'ask-doubt' },
    { title: 'Recording',      icon: Video,             bgColor: 'bg-red-100',     iconColor: 'text-red-500',     path: 'recording' },
    { title: 'Assignment',     icon: ClipboardCheck,    bgColor: 'bg-purple-100',  iconColor: 'text-purple-500',  path: 'assignment' },
    { title: 'Smart Test',     icon: Clock,             bgColor: 'bg-emerald-100', iconColor: 'text-emerald-500', path: 'smart-test' },
    { title: 'Chat',           icon: MessageSquareText, bgColor: 'bg-blue-50',     iconColor: 'text-blue-600',    path: 'chat' },
    { title: 'Support',        icon: PhoneCall,         bgColor: 'bg-fuchsia-100', iconColor: 'text-fuchsia-500', path: 'support' }
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-24 font-sans relative">
      {/* Top Header */}
      <header
        className={`px-4 py-3 sm:px-6 sticky top-0 z-10 rounded-b-2xl sm:rounded-none transition-all duration-300 ${
          scrolled
            ? 'bg-white/70 backdrop-blur-md shadow-md border-b border-white/40'
            : 'bg-white shadow-sm border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 cursor-pointer">
                <span className="font-bold text-slate-800 text-lg leading-tight">Welcome back</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{user?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => alert('Search feature coming soon!')} className="p-2 text-slate-600 hover:bg-slate-100 active:scale-95 rounded-full transition-all hidden sm:block">
              <Search className="h-5 w-5" />
            </button>
            <button onClick={() => alert('Notifications coming soon!')} className="p-2 text-slate-600 hover:bg-slate-100 active:scale-95 rounded-full transition-all relative">
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              <Bell className="h-5 w-5" />
            </button>
            <button onClick={logout} className="p-2 text-slate-600 hover:text-red-500 hover:bg-slate-100 rounded-full transition-colors flex items-center ml-2">
              <LogOut className="h-5 w-5 sm:mr-1" />
              <span className="text-sm font-medium hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        <AdvertisementCarousel
          key={`ad-carousel-${approvedAds.length}`}
          slides={approvedAds}
          loading={adsLoading}
          autoPlayInterval={3500}
        />

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {features.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(`/student/feature/${item.path}`)}
              className={`${item.bgColor} rounded-[24px] p-5 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative`}
            >
              {item.badge && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
              <div className="h-16 w-16 mb-2 flex items-center justify-center rounded-full bg-white/40">
                <item.icon className={`h-8 w-8 ${item.iconColor}`} strokeWidth={1.5} />
              </div>
              <span className={`font-bold text-sm tracking-tight ${item.iconColor.replace('text-', 'text-').replace('400', '700').replace('500', '700')} text-center mt-1`}>
                {item.title}
              </span>
            </div>
          ))}
        </div>

        {/* Progress & Live Classes Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Quick Progress Widget */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 tracking-tight">Your Progress</h2>
            <div className="flex items-center justify-center py-4">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="64" cy="64" r="56" fill="transparent" stroke="#4f46e5" strokeWidth="12" strokeDasharray="351.8" strokeDashoffset="87.9" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-bold text-slate-800">75%</span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Completed</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between px-2 text-sm">
              <div className="text-center">
                <span className="block font-bold text-slate-800 text-lg">12</span>
                <span className="text-xs text-slate-500 font-medium">Assignments</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-slate-800 text-lg">4</span>
                <span className="text-xs text-slate-500 font-medium">Pending</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-slate-800 text-lg">85%</span>
                <span className="text-xs text-slate-500 font-medium">Attendance</span>
              </div>
            </div>
          </div>

          {/* Live Classes */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Enrolled Classes</h2>
              <button onClick={() => setActiveTab('discover')} className="text-indigo-600 text-sm font-bold hover:text-indigo-700">View All</button>
            </div>
            <div className="bg-white rounded-[24px] border border-slate-200 p-2 shadow-sm">
              {enrolledClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <BookOpen className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">No enrolled classes right now.</p>
                  <button onClick={() => setActiveTab('discover')} className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                    Find Classes
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {enrolledClasses.slice(0, 3).map(cls => (
                    <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[20px] bg-white hover:bg-slate-50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="bg-indigo-100 h-12 w-12 flex items-center justify-center rounded-xl text-indigo-600">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight">{cls.class_name}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">By {cls.teacher_name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/student/class/${cls.id}`)}
                        className="w-full sm:w-auto flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors active:scale-95"
                      >
                        Access <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* All Classes Discover Section */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Discover Classes</h2>
            <div className="relative hidden sm:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white shadow-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAllClasses.length === 0 && <p className="text-slate-500 col-span-3 py-4">No classes found.</p>}
            {filteredAllClasses.map(cls => {
              const isEnrolled = enrolledIds.includes(cls.id);
              return (
                <div key={cls.id} className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{cls.class_name}</h3>
                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-2 mt-1">{cls.teacher_name}</p>
                    <p className="text-sm text-slate-500 line-clamp-2">{cls.description}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    {isEnrolled ? (
                      <button disabled className="w-full py-2.5 bg-slate-50 text-slate-400 rounded-xl font-bold flex items-center justify-center border border-slate-100">
                        <CheckCircle className="h-4 w-4 mr-2" /> Enrolled
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(cls.id)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl font-bold transition-colors active:scale-[0.98]"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 sm:hidden">
        <div className="flex justify-around items-center p-3">
          <button className="flex flex-col items-center justify-center w-16 text-indigo-600">
            <div className="bg-indigo-50 p-2 rounded-2xl mb-1"><Home className="h-5 w-5" /></div>
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center w-16 text-slate-400 hover:text-slate-600">
            <div className="p-2 rounded-2xl mb-1"><User className="h-5 w-5" /></div>
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </div>

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
        {/* Sidebar Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-5 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <img src={lmsLogo} alt="LMS Logo" className="h-9 w-9 rounded-full object-cover" />
              <span className="text-white font-bold text-lg">EduLearn</span>
            </div>
            <p className="text-indigo-100 text-sm font-medium">{user?.name}</p>
            <span className="inline-block mt-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Student</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white/70 hover:text-white bg-white/10 rounded-full p-1.5 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sidebarLinks.map((link, i) => {
            const Icon = link.icon;
            const isDivider = i === 2; // divider before feature links
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
                  <div className={`h-9 w-9 flex items-center justify-center rounded-xl flex-shrink-0 ${
                    link.bg ? link.bg : 'bg-indigo-50'
                  }`}>
                    <Icon className={`h-5 w-5 ${link.color || 'text-indigo-600'}`} strokeWidth={1.8} />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm">{link.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 px-3 py-4">
          <button
            onClick={() => { setSidebarOpen(false); logout(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
          >
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
