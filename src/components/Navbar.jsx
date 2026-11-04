import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Menu, X, LayoutDashboard, Video, ClipboardCheck, Users,
  FlaskConical, ShieldCheck, Building2, CalendarCheck, Calendar,
  Mail, Star, Clock, Stethoscope, ChevronLeft, ChevronRight, DollarSign,
  Sparkles, HeartPulse, HelpCircle, Info, ExternalLink, ArrowRight,
  LogIn, PhoneCall
} from 'lucide-react';
import toast from 'react-hot-toast';
import medicalLogo from '../assets/sign.jpeg';
import useSuperAdminBadges from '../hooks/useSuperAdminBadges';
import useAdminBadges from '../hooks/useAdminBadges';
import ProfileDropdown from './ProfileDropdown';

// ─── NavBadge ──────────────────────────────────────────────────
function NavBadge({ count, className = '', active = false }) {
  if (!count) return null;
  return (
    <span
      title={`${count} new`}
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full
        text-[10px] font-black leading-none transition-all shadow-xs shrink-0 ${
          active
            ? 'bg-white text-blue-700 ring-2 ring-white/60'
            : 'bg-rose-500 text-white ring-2 ring-white shadow-rose-500/30 animate-pulse'
        } ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Navbar() {
  const { scrollYProgress } = useScroll();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navScrollRef = useRef(null);
  const [canScrollNavLeft, setCanScrollNavLeft] = useState(false);
  const [canScrollNavRight, setCanScrollNavRight] = useState(false);

  const publicScrollRef = useRef(null);
  const [canScrollPublicLeft, setCanScrollPublicLeft] = useState(false);
  const [canScrollPublicRight, setCanScrollPublicRight] = useState(false);

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';

  const { badges: superBadges } = useSuperAdminBadges(isSuperAdmin);
  const { badges: adminBadges } = useAdminBadges(isAdmin);

  // ─── Scroll shadow ──────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Auth listener ──────────────────────────────────────────
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('user_subscription_updated', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('user_subscription_updated', checkAuth);
    };
  }, []);

  // ─── Navbar Horizontal Scroll Listeners & Actions ─────────
  const updateNavScrollState = () => {
    if (!navScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
    setCanScrollNavLeft(scrollLeft > 6);
    setCanScrollNavRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  const updatePublicScrollState = () => {
    if (!publicScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = publicScrollRef.current;
    setCanScrollPublicLeft(scrollLeft > 6);
    setCanScrollPublicRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    updateNavScrollState();
    updatePublicScrollState();
    const el = navScrollRef.current;
    const pEl = publicScrollRef.current;

    if (el) el.addEventListener('scroll', updateNavScrollState, { passive: true });
    if (pEl) pEl.addEventListener('scroll', updatePublicScrollState, { passive: true });

    const handleResize = () => {
      updateNavScrollState();
      updatePublicScrollState();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      if (el) el.removeEventListener('scroll', updateNavScrollState);
      if (pEl) pEl.removeEventListener('scroll', updatePublicScrollState);
      window.removeEventListener('resize', handleResize);
    };
  }, [location.pathname, user?.role]);


  const scrollNav = (direction) => {
    if (!navScrollRef.current) return;
    navScrollRef.current.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth'
    });
  };

  const scrollPublic = (direction) => {
    if (!publicScrollRef.current) return;
    publicScrollRef.current.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth'
    });
  };

  const handleNavWheel = (e) => {
    if (!navScrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && navScrollRef.current.scrollWidth > navScrollRef.current.clientWidth) {
      e.preventDefault();
      navScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handlePublicWheel = (e) => {
    if (!publicScrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && publicScrollRef.current.scrollWidth > publicScrollRef.current.clientWidth) {
      e.preventDefault();
      publicScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'superadmin') return '/superadmin';
    if (user.role === 'admin') return '/admin';
    return '/dashboard';
  };

  const isDashboardRoute = () => {
    if (!user) return false;
    if (user.role === 'superadmin') return location.pathname.startsWith('/superadmin');
    if (user.role === 'admin') return location.pathname.startsWith('/admin');
    return location.pathname.startsWith('/dashboard');
  };

  const getRoleLinks = () => {
    if (!user) return [];

    if (user.role === 'superadmin') {
      return [
        { name: 'Overview', to: '/superadmin', icon: LayoutDashboard },
        { name: 'Demo Bookings', to: '/superadmin/demos', badge: 'demos', icon: Video },
        { name: 'Registrations', to: '/superadmin/registrations', badge: 'registrations', icon: ClipboardCheck },
        { name: 'Users', to: '/superadmin/users', icon: Users },
        { name: 'Lab Catalog', to: '/superadmin/services', icon: FlaskConical },
        { name: 'Manage Admin', to: '/superadmin/manage-admin', icon: ShieldCheck },
        { name: 'Manage Hospitals', to: '/superadmin/manage-hospitals', icon: Building2 },
        { name: 'Appointments', to: '/superadmin/appointments', badge: 'appointments', icon: CalendarCheck },
        { name: 'Lab Bookings', to: '/superadmin/appointments?tab=lab', icon: FlaskConical },
        { name: 'Refunds & Settlements', to: '/superadmin/appointments?tab=refunds', icon: DollarSign },
        { name: 'Calendar', to: '/superadmin/calendar', icon: Calendar },
        { name: 'Contacts', to: '/superadmin/contacts', badge: 'contacts', icon: Mail }
      ];
    }

    if (user.role === 'admin') {
      return [
        { name: 'Overview', to: '/admin', icon: LayoutDashboard },
        { name: 'Appointments', to: '/admin/appointments', badge: 'appointments', icon: CalendarCheck },
        { name: 'Lab Bookings', to: '/admin/appointments?tab=lab', icon: FlaskConical },
        { name: 'Refunds & Settlements', to: '/admin/appointments?tab=refunds', icon: DollarSign },
        { name: 'Calendar', to: '/admin/calendar', icon: Calendar },
        { name: 'Timings', to: '/admin/timings', icon: Clock },
        { name: 'Feedbacks', to: '/admin/appointment-feedback', badge: 'feedback', icon: Star }
      ];
    }

    return [
      { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
      { name: 'Lab Catalog', to: '/dashboard/services', icon: FlaskConical },
      { name: 'Book Consult', to: '/dashboard/book-appointment', icon: Stethoscope },
      { name: 'Appointments', to: '/dashboard/my-appointments', icon: CalendarCheck },
      { name: 'Lab Bookings', to: '/dashboard/my-appointments?tab=lab', icon: FlaskConical },
      { name: 'Refunds & Settlements', to: '/dashboard/my-appointments?tab=refunds', icon: DollarSign },
      { name: 'Explore Hospitals', to: '/dashboard/explore-hospitals', icon: Building2 },
      { name: 'Feedback & Reviews', to: '/dashboard/feedbacks', icon: Star }
    ];
  };

  const isTabActive = (to) => {
    if (to.includes('?tab=refunds')) {
      return (
        (location.pathname === '/superadmin/appointments' ||
          location.pathname === '/admin/appointments' ||
          location.pathname === '/dashboard/my-appointments') &&
        location.search.includes('tab=refunds')
      );
    }
    if (to.includes('?tab=lab')) {
      return (
        (location.pathname === '/superadmin/appointments' ||
          location.pathname === '/admin/appointments' ||
          location.pathname === '/dashboard/my-appointments') &&
        location.search.includes('tab=lab')
      );
    }
    if (to.includes('?tab=doctor')) {
      return (
        location.pathname === '/dashboard/my-appointments' &&
        location.search.includes('tab=doctor')
      );
    }
    if (to === '/superadmin/appointments') {
      return (
        location.pathname === '/superadmin/appointments' &&
        !location.search.includes('tab=lab') &&
        !location.search.includes('tab=refunds') &&
        !location.search.includes('tab=doctor')
      );
    }
    if (to === '/admin/appointments') {
      return (
        location.pathname === '/admin/appointments' &&
        !location.search.includes('tab=lab') &&
        !location.search.includes('tab=refunds') &&
        !location.search.includes('tab=doctor')
      );
    }
    if (to === '/dashboard/my-appointments') {
      return (
        location.pathname === '/dashboard/my-appointments' &&
        !location.search.includes('tab=lab') &&
        !location.search.includes('tab=refunds') &&
        !location.search.includes('tab=doctor')
      );
    }
    if (to === '/superadmin') {
      return location.pathname === '/superadmin' || location.pathname === '/superadmin/overview';
    }
    if (to === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/overview';
    }
    if (to === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/overview';
    }
    return location.pathname === to;
  };

  const dashboardLinks = getRoleLinks();
  const showDashboardNav = !!user && isDashboardRoute();
  const logoRedirect = user ? getDashboardLink() : '/';

  const publicLinks = [
    { name: 'Features', id: 'features', icon: Sparkles },
    { name: 'Specialties', id: 'specialties', icon: HeartPulse },
    { name: 'Top Doctors', id: 'doctors', icon: Users },
    { name: 'Hospitals', id: 'hospitals', icon: Building2 },
    { name: 'Lab Tests', id: 'lab-tests', icon: FlaskConical },
    { name: 'How It Works', id: 'how-it-works', icon: Clock },
    { name: 'About', id: 'about', icon: Info },
    { name: 'FAQ', id: 'faq', icon: HelpCircle },
    { name: 'Feedback', id: 'feedback', icon: Star },
    { name: 'Contact', route: '/contact', icon: PhoneCall },
    { name: 'Book Appointment', route: '/appointment', highlight: true, icon: CalendarCheck },
    { name: 'Book a Demo', id: 'book-demo', cta: true, icon: Video }
  ];

  const handleNav = (link) => {
    setIsOpen(false);
    if (link.route) {
      navigate(link.route);
      return;
    }
    if (location.pathname === '/') {
      const el = document.getElementById(link.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', `/#${link.id}`);
      }
    } else {
      navigate(`/#${link.id}`);
    }
  };

  const activeBadges = isSuperAdmin ? superBadges : (isAdmin ? adminBadges : {});

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(15,23,42,0.08)] border-b border-slate-200/80'
            : 'bg-white/85 backdrop-blur-md border-b border-slate-100/90'
        }`}
      >
        {/* Scroll Progress Bar with gentle glow */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 origin-left z-50 pointer-events-none shadow-[0_0_10px_rgba(37,99,235,0.4)]"
          style={{ scaleX: scrollYProgress }}
        />

        <div className="max-w-[1780px] mx-auto px-3 sm:px-5 lg:px-7">
          <div className="flex justify-between items-center min-h-[64px] sm:min-h-[72px] py-2 gap-2 sm:gap-4">
            
            {/* ── Brand Logo & Live Portal Indicator ── */}
            <div className="flex-shrink-0 flex items-center gap-3 min-w-0">
              <Link
                to={logoRedirect}
                className="flex items-center gap-2.5 min-w-0 group cursor-pointer select-none"
              >
                <div className="relative flex items-center justify-center p-1 rounded-xl bg-gradient-to-tr from-blue-50 to-slate-100 border border-slate-200/70 shadow-2xs group-hover:border-blue-300 transition-colors">
                  <img
                    src={medicalLogo}
                    alt="Medpark logo"
                    className="h-7 sm:h-8 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="flex items-center">
                  <span className="font-extrabold text-base sm:text-xl lg:text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 bg-clip-text text-transparent truncate">
                    MEDPARK
                  </span>
                  <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-black text-[9px] sm:text-[11px] shadow-2xs">
                    ✚
                  </span>
                </div>
              </Link>

              {/* Role portal status badge */}
              {isSuperAdmin && (
                <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Super Admin</span>
                </div>
              )}

              {isAdmin && (
                <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hospital Admin</span>
                </div>
              )}

              {user && !isSuperAdmin && !isAdmin && (
                <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Patient Portal</span>
                </div>
              )}
            </div>

            {/* ── Desktop Navigation ── */}
            <nav className="hidden md:flex items-center justify-end gap-2 lg:gap-3 font-medium text-xs lg:text-sm text-gray-600 min-w-0 flex-1 ml-3">
              
              {/* Public Navigation Container */}
              {!showDashboardNav && (
                <div className="relative flex items-center min-w-0 flex-1 max-w-full group/publicNav">
                  {/* Left edge fade */}
                  {canScrollPublicLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-20" />
                  )}

                  {canScrollPublicLeft && (
                    <button
                      type="button"
                      onClick={() => scrollPublic('left')}
                      title="Scroll navigation left"
                      aria-label="Scroll left"
                      className="absolute -left-1 z-30 h-7 w-7 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  <div
                    ref={publicScrollRef}
                    onWheel={handlePublicWheel}
                    className="flex items-center gap-1.5 lg:gap-2 overflow-x-auto no-scrollbar overscroll-x-contain scroll-smooth whitespace-nowrap py-1 px-1 flex-1 min-w-0 justify-end"
                  >
                    {publicLinks.map((link) => {
                      if (link.cta) {
                        return (
                          <button
                            key={link.name}
                            onClick={() => handleNav(link)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/35 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>{link.name}</span>
                          </button>
                        );
                      }

                      if (link.highlight) {
                        return (
                          <button
                            key={link.name}
                            onClick={() => handleNav(link)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold text-blue-700 bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/90 shadow-2xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
                          >
                            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>{link.name}</span>
                          </button>
                        );
                      }

                      const Icon = link.icon;
                      return (
                        <button
                          key={link.name}
                          onClick={() => handleNav(link)}
                          className="inline-flex items-center gap-1.5 transition-all duration-200 text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 cursor-pointer py-1.5 px-3 rounded-lg text-xs lg:text-sm shrink-0 whitespace-nowrap font-medium"
                        >
                          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />}
                          <span>{link.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right edge fade */}
                  {canScrollPublicRight && (
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-20" />
                  )}

                  {canScrollPublicRight && (
                    <button
                      type="button"
                      onClick={() => scrollPublic('right')}
                      title="Scroll navigation right"
                      aria-label="Scroll right"
                      className="absolute -right-1 z-30 h-7 w-7 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Dashboard Navigation Container */}
              {showDashboardNav ? (
                <>
                  <div className="relative flex items-center min-w-0 flex-1 max-w-full group/nav">
                    {/* Left edge fade */}
                    {canScrollNavLeft && (
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-20" />
                    )}

                    {canScrollNavLeft && (
                      <button
                        type="button"
                        onClick={() => scrollNav('left')}
                        title="Scroll navigation left"
                        aria-label="Scroll left"
                        className="absolute -left-1 z-30 h-7 w-7 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}

                    <div
                      ref={navScrollRef}
                      onWheel={handleNavWheel}
                      className="flex items-center gap-1 lg:gap-1.5 overflow-x-auto no-scrollbar overscroll-x-contain scroll-smooth whitespace-nowrap py-1 px-1 flex-1 min-w-0"
                    >
                      {dashboardLinks.map((link) => {
                        const active = isTabActive(link.to);
                        const Icon = link.icon;
                        const badgeCount = link.badge ? activeBadges[link.badge] : 0;
                        return (
                          <Link
                            key={link.name}
                            to={link.to}
                            className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 z-10 ${
                              active
                                ? 'text-white font-bold'
                                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100/80'
                            }`}
                          >
                            {active && (
                              <motion.div
                                layoutId="navbarActivePill"
                                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xs -z-10"
                              />
                            )}
                            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                            <span>{link.name}</span>
                            <NavBadge count={badgeCount} active={active} />
                          </Link>
                        );
                      })}
                    </div>

                    {/* Right edge fade */}
                    {canScrollNavRight && (
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-20" />
                    )}

                    {canScrollNavRight && (
                      <button
                        type="button"
                        onClick={() => scrollNav('right')}
                        title="Scroll navigation right"
                        aria-label="Scroll right"
                        className="absolute -right-1 z-30 h-7 w-7 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Actions & Profile in Dashboard mode */}
                  <div className="flex items-center gap-2 ml-1.5 pl-3 border-l border-slate-200/90 shrink-0">
                    <Link
                      to="/"
                      title="View public website"
                      className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 border border-transparent hover:border-blue-200/70 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Website</span>
                    </Link>
                    <ProfileDropdown user={user} onLogout={handleLogout} />
                  </div>
                </>
              ) : user ? (
                /* User logged in, but browsing public pages */
                <div className="flex items-center gap-2.5 ml-2 shrink-0">
                  <Link
                    to={getDashboardLink()}
                    className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 transition-all font-semibold px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl text-xs lg:text-sm border border-blue-200/80 shadow-2xs hover:scale-[1.02] active:scale-95"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <ProfileDropdown user={user} onLogout={handleLogout} />
                </div>
              ) : (
                /* Public Visitor (Not logged in) */
                <Link
                  to="/login"
                  className="ml-2 inline-flex items-center gap-1.5 justify-center px-4.5 py-2 rounded-xl shadow-xs text-xs lg:text-sm font-semibold text-white bg-slate-900 hover:bg-blue-900 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )}
            </nav>

            {/* ── Mobile Right Actions (Profile & Hamburger) ── */}
            <div className="md:hidden flex items-center gap-2 shrink-0">
              {user && <ProfileDropdown user={user} onLogout={handleLogout} />}
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation"
                aria-expanded={isOpen}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 text-slate-800 shadow-2xs hover:border-blue-400 hover:text-blue-600 transition-all focus:outline-none cursor-pointer active:scale-95"
              >
                {isOpen ? <X size={20} className="text-slate-800" /> : <Menu size={20} className="text-slate-800" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer & Backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            {/* Drawer Sheet */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative mx-3 mt-20 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden max-h-[82vh] flex flex-col"
            >
              {/* Drawer Content */}
              <div className="p-4 space-y-3 overflow-y-auto">
                
                {/* User Card when logged in */}
                {user && (
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-100 hover:border-blue-300 transition-all group"
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-base uppercase shadow-sm group-hover:scale-105 transition-transform shrink-0">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-slate-900 truncate text-sm group-hover:text-blue-700 transition-colors">
                          {user?.name}
                        </p>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 px-2.5 py-0.5 rounded-full capitalize shrink-0 border border-blue-200/60">
                          {user?.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {user?.hospital || user?.email}
                      </p>
                    </div>
                  </Link>
                )}

                {/* Dashboard Navigation Items */}
                {showDashboardNav ? (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Dashboard Navigation
                    </div>
                    {dashboardLinks.map((link) => {
                      const Icon = link.icon;
                      const badgeCount = link.badge ? activeBadges[link.badge] : 0;
                      const active = isTabActive(link.to);
                      return (
                        <Link
                          key={link.name}
                          to={link.to}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                            active
                              ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm'
                              : 'text-slate-700 hover:text-blue-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {Icon && <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />}
                            {link.name}
                          </span>
                          <NavBadge count={badgeCount} active={active} />
                        </Link>
                      );
                    })}

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                      <Link
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                        <span>Visit Public Website</span>
                      </Link>

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogIn className="w-4 h-4 text-rose-500 rotate-180" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Public Navigation Items */
                  <div className="space-y-1">
                    {user && (
                      <NavLink
                        to={getDashboardLink()}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-50/80 border border-blue-200/80 mb-2 shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-blue-600" />
                          <span>Go to Dashboard</span>
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </NavLink>
                    )}

                    <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Explore Medpark
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                      {publicLinks.map((link) => {
                        if (link.cta || link.highlight) return null;
                        const Icon = link.icon;
                        return (
                          <button
                            key={link.name}
                            onClick={() => handleNav(link)}
                            className="flex items-center gap-2.5 w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition cursor-pointer"
                          >
                            {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                            <span>{link.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Action buttons inside drawer */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <button
                        onClick={() => handleNav({ route: '/appointment' })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-2xs"
                      >
                        <CalendarCheck className="w-4 h-4 text-blue-600" />
                        <span>Book Appointment</span>
                      </button>

                      <button
                        onClick={() => handleNav({ id: 'book-demo' })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>Book a Live Demo</span>
                      </button>

                      {!user ? (
                        <Link
                          to="/login"
                          onClick={() => setIsOpen(false)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-blue-900 transition-all shadow-xs"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Login to Portal</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <LogIn className="w-4 h-4 text-rose-500 rotate-180" />
                          <span>Logout</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Support Hotline pill in mobile drawer */}
                <div className="pt-2">
                  <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-500 text-xs font-medium">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    <span>24/7 Helpline: 1800-MEDPARK</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}