import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Menu, X, LayoutDashboard, Video, ClipboardCheck, Users,
  FlaskConical, ShieldCheck, Building2, CalendarCheck, Calendar,
  Mail, Star, Clock, Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import medicalLogo from '../assets/sign.jpeg';
import useSuperAdminBadges from '../hooks/useSuperAdminBadges';
import useAdminBadges from '../hooks/useAdminBadges';
import ProfileDropdown from './ProfileDropdown';

// ─── NavBadge ──────────────────────────────────────────────────
function NavBadge({ count, className = '' }) {
  if (!count) return null;
  return (
    <span
      title={`${count} new`}
      className={`inline-flex items-center justify-center min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 rounded-full
        bg-red-600 text-white text-[9px] sm:text-[10px] font-black leading-none shadow-xs ring-2 ring-white
        animate-pulse ${className}`}
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

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';

  const { badges: superBadges } = useSuperAdminBadges(isSuperAdmin);
  const { badges: adminBadges } = useAdminBadges(isAdmin);

  // ─── Scroll shadow ──────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
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

  // ─── Close mobile menu on route change ────────────────────
  useEffect(() => {
    if (isOpen) setIsOpen(false);
  }, [location.pathname]);

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
        { name: 'Calendar', to: '/superadmin/calendar', icon: Calendar },
        { name: 'Contacts', to: '/superadmin/contacts', badge: 'contacts', icon: Mail }
      ];
    }

    if (user.role === 'admin') {
      return [
        { name: 'Overview', to: '/admin', icon: LayoutDashboard },
        { name: 'Appointments', to: '/admin/appointments', badge: 'appointments', icon: CalendarCheck },
        { name: 'Calendar', to: '/admin/calendar', icon: Calendar },
        { name: 'Timings', to: '/admin/timings', icon: Clock },
        { name: 'Feedback', to: '/admin/appointment-feedback', badge: 'feedback', icon: Star }
      ];
    }

    return [
      { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
      { name: 'Explore Hospitals', to: '/dashboard/explore-hospitals', icon: Building2 },
      { name: 'Lab & Diagnostics', to: '/dashboard/services', icon: FlaskConical },
      { name: 'Book Appointment', to: '/dashboard/book-appointment', icon: Stethoscope },
      { name: 'My Appointments', to: '/dashboard/my-appointments', icon: CalendarCheck },
      { name: 'Reviews', to: '/dashboard/feedbacks', icon: Star }
    ];
  };

  const dashboardLinks = getRoleLinks();
  const showDashboardNav = !!user && isDashboardRoute();
  const logoRedirect = user ? getDashboardLink() : '/';

  const publicLinks = [
    { name: 'Features', id: 'features' },
    { name: 'Specialties', id: 'specialties' },
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'About', id: 'about' },
    { name: 'FAQ', id: 'faq' },
    { name: 'Feedback', id: 'feedback' },
    { name: 'Contact', route: '/contact' },
    { name: 'Book Appointment', route: '/appointment' },
    { name: 'Book a Demo', id: 'book-demo', cta: true }
  ];

  const handleNav = (link) => {
    setIsOpen(false);
    if (link.route) { navigate(link.route); return; }
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
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? 'shadow-md border-transparent' : 'border-b border-gray-100'
      }`}
    >
      {/* Scroll Progress Bar (Lower baseline) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 origin-left z-50 pointer-events-none shadow-xs"
        style={{ scaleX: scrollYProgress }}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-[64px] sm:min-h-[72px] py-2 gap-2 sm:gap-4">
          {/* Logo & Role Portal Badge */}
          <div className="flex-shrink-0 flex items-center gap-2.5 min-w-0">
            <Link to={logoRedirect} className="flex items-center gap-2 min-w-0 group">
              <img
                src={medicalLogo}
                alt="Medpark logo"
                className="h-8 sm:h-9 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-extrabold text-base sm:text-xl lg:text-2xl tracking-tight text-gray-900 truncate">
                MEDPARK
                <span className="text-red-500 text-xs sm:text-sm align-top ml-0.5 sm:ml-1">✚</span>
              </span>
            </Link>
            {isSuperAdmin && (
              <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                🛡️ Super Admin
              </span>
            )}
            {isAdmin && (
              <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                🏥 Hospital Admin
              </span>
            )}
            {user && !isSuperAdmin && !isAdmin && (
              <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                👤 Patient Portal
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-end gap-2 lg:gap-3 font-medium text-xs lg:text-sm text-gray-600 min-w-0 flex-1 ml-3">
            {!showDashboardNav && (
              <div className="flex items-center gap-1.5 lg:gap-2">
                {publicLinks.map((link) =>
                  link.cta ? (
                    <button
                      key={link.name}
                      onClick={() => handleNav(link)}
                      className="inline-flex items-center justify-center px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-semibold text-white bg-medical-blue hover:bg-medical-dark transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer shrink-0"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <button
                      key={link.name}
                      onClick={() => handleNav(link)}
                      className="transition-colors hover:text-medical-blue cursor-pointer py-1 px-2.5 rounded-lg text-xs lg:text-sm hover:bg-blue-50/50"
                    >
                      {link.name}
                    </button>
                  )
                )}
              </div>
            )}

            {showDashboardNav ? (
              <>
                <div className="flex items-center gap-1 lg:gap-1.5 overflow-x-auto no-scrollbar overscroll-x-contain scroll-smooth whitespace-nowrap py-1 px-1">
                  {dashboardLinks.map((link) => {
                    const Icon = link.icon;
                    const badgeCount = link.badge ? activeBadges[link.badge] : 0;
                    return (
                      <NavLink
                        key={link.name}
                        to={link.to}
                        className={({ isActive }) =>
                          `relative inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 z-10 ${
                            isActive
                              ? 'text-white font-bold'
                              : 'text-slate-600 hover:text-medical-blue hover:bg-slate-100/60'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <motion.div
                                layoutId="navbarActivePill"
                                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                                className="absolute inset-0 bg-medical-blue rounded-xl shadow-xs -z-10"
                              />
                            )}
                            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                            <span>{link.name}</span>
                            {badgeCount > 0 && (
                              <span
                                className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black rounded-full leading-tight transition-colors ${
                                  isActive ? 'bg-white text-blue-700' : 'bg-rose-500 text-white shadow-2xs'
                                }`}
                              >
                                {badgeCount > 99 ? '99+' : badgeCount}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 ml-1.5 pl-3 border-l border-slate-200/90 shrink-0">
                  <ProfileDropdown user={user} onLogout={handleLogout} />
                </div>
              </>
            ) : user ? (
              <div className="flex items-center gap-3 ml-2 shrink-0">
                <ProfileDropdown user={user} onLogout={handleLogout} />
                <Link
                  to={getDashboardLink()}
                  className="text-medical-blue hover:text-medical-dark transition-colors font-semibold px-3 py-1.5 bg-blue-50/80 rounded-xl text-xs lg:text-sm border border-blue-100"
                >
                  Dashboard →
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 inline-flex items-center justify-center px-5 py-2 border border-transparent rounded-xl shadow-2xs text-xs lg:text-sm font-medium text-white bg-medical-dark hover:bg-medical-blue transition-all active:scale-95 shrink-0"
              >
                Login →
              </Link>
            )}
          </nav>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-2 shrink-0">
            {user && <ProfileDropdown user={user} onLogout={handleLogout} />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-800 shadow-2xs hover:border-medical-blue hover:text-medical-blue transition-colors focus:outline-none cursor-pointer"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-2 flex flex-col max-h-[85vh] overflow-y-auto">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-gradient-to-r from-blue-50/90 to-slate-50 border border-blue-100/90 mb-2 hover:border-medical-blue/40 transition-all group"
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-medical-dark to-medical-blue text-white font-bold uppercase shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-gray-900 truncate text-sm group-hover:text-medical-blue transition-colors">
                          {user?.name}
                        </p>
                        <span className="text-[10px] font-bold text-medical-blue bg-blue-100/80 px-2 py-0.5 rounded-full capitalize shrink-0">
                          {user?.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {user?.hospital || user?.email}
                      </p>
                    </div>
                  </Link>

                  {showDashboardNav ? (
                    <>
                      {dashboardLinks.map((link) => {
                        const Icon = link.icon;
                        const badgeCount = link.badge ? activeBadges[link.badge] : 0;
                        return (
                          <NavLink
                            key={link.name}
                            to={link.to}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                                isActive
                                  ? 'text-medical-blue bg-blue-50/80 font-bold'
                                  : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
                              }`
                            }
                          >
                            <span className="flex items-center gap-2.5">
                              {Icon && <Icon className="w-4 h-4 text-slate-500" />}
                              {link.name}
                            </span>
                            {badgeCount > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 bg-rose-500 text-white text-xs font-black rounded-full shadow-2xs">
                                {badgeCount > 99 ? '99+' : badgeCount}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full text-left block px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to={getDashboardLink()}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `block px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                            isActive
                              ? 'text-medical-blue bg-blue-50/80 font-semibold'
                              : 'text-medical-blue bg-blue-50/30 hover:bg-blue-50'
                          }`
                        }
                      >
                        Dashboard
                      </NavLink>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full text-left block px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {publicLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => handleNav(link)}
                      className={`block w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                        link.cta
                          ? 'text-white bg-medical-blue hover:bg-medical-dark text-center shadow-xs font-semibold mt-1'
                          : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
                      }`}
                    >
                      {link.name}
                    </button>
                  ))}
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="mt-2 block w-full text-center px-4 py-3 border border-transparent rounded-xl shadow-xs text-sm font-medium text-white bg-medical-dark hover:bg-medical-blue transition-colors"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}