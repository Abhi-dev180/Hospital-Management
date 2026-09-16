import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Video, ClipboardCheck, Users,
  FlaskConical, ShieldCheck, Building2, CalendarCheck, Calendar,
  Mail, Star, Clock, DollarSign, Stethoscope, ChevronLeft, ChevronRight
} from 'lucide-react';
import useSuperAdminBadges from '../hooks/useSuperAdminBadges';
import useAdminBadges from '../hooks/useAdminBadges';

const ROLE_TABS = {
  superadmin: [
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
  ],
  admin: [
    { name: 'Overview', to: '/admin', icon: LayoutDashboard },
    { name: 'Appointments', to: '/admin/appointments', badge: 'appointments', icon: CalendarCheck },
    { name: 'Lab Bookings', to: '/admin/appointments?tab=lab', icon: FlaskConical },
    { name: 'Refunds & Settlements', to: '/admin/appointments?tab=refunds', icon: DollarSign },
    { name: 'Calendar', to: '/admin/calendar', icon: Calendar },
    { name: 'Timings', to: '/admin/timings', icon: Clock },
    { name: 'Feedbacks', to: '/admin/appointment-feedback', badge: 'feedback', icon: Star }
  ],
  user: [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Lab Catalog', to: '/dashboard/services', icon: FlaskConical },
    { name: 'Book Consult', to: '/dashboard/book-appointment', icon: Stethoscope },
    { name: 'Doctor Appointments', to: '/dashboard/my-appointments?tab=doctor', icon: CalendarCheck },
    { name: 'Lab Bookings', to: '/dashboard/my-appointments?tab=lab', icon: FlaskConical },
    { name: 'Refunds & Settlements', to: '/dashboard/my-appointments?tab=refunds', icon: DollarSign },
    { name: 'Explore Hospitals', to: '/dashboard/explore-hospitals', icon: Building2 },
    { name: 'Feedback & Reviews', to: '/dashboard/feedbacks', icon: Star }
  ]
};

export default function DashboardTabs({ role }) {
  const tabs = ROLE_TABS[role] || [];
  const location = useLocation();
  const tabsScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin';
  const { badges: superBadges } = useSuperAdminBadges(isSuperAdmin);
  const { badges: adminBadges } = useAdminBadges(isAdmin);
  const badges = isSuperAdmin ? superBadges : (isAdmin ? adminBadges : {});

  const updateScrollState = () => {
    if (!tabsScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsScrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    updateScrollState();
    const el = tabsScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [tabs, location.pathname]);

  const scrollTabs = (direction) => {
    if (!tabsScrollRef.current) return;
    tabsScrollRef.current.scrollBy({
      left: direction === 'left' ? -260 : 260,
      behavior: 'smooth'
    });
  };

  const handleTabsWheel = (e) => {
    if (!tabsScrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && tabsScrollRef.current.scrollWidth > tabsScrollRef.current.clientWidth) {
      e.preventDefault();
      tabsScrollRef.current.scrollLeft += e.deltaY;
    }
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
        (location.search.includes('tab=doctor') ||
          (!location.search.includes('tab=lab') &&
            !location.search.includes('tab=refunds') &&
            !location.search.includes('tab=all')))
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

  return (
    <div className="mb-6 w-full relative group/tabs">
      {/* Left Scroll Chevron */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollTabs('left')}
          title="Scroll Left"
          aria-label="Scroll sub-navigation left"
          className="absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-30 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white shadow-xl border border-slate-200 text-slate-700 hover:text-medical-blue hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Horizontal Scrollable Tabs Strip */}
      <div
        ref={tabsScrollRef}
        onWheel={handleTabsWheel}
        className="w-full overflow-x-auto no-scrollbar overscroll-x-contain scroll-smooth py-1"
      >
        <motion.nav
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          aria-label="Dashboard sub-navigation"
          className="inline-flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs sm:shadow-sm whitespace-nowrap min-w-full"
        >
          {tabs.map((tab) => {
            const active = isTabActive(tab.to);
            const Icon = tab.icon;
            const badgeCount = tab.badge ? badges[tab.badge] : 0;
            return (
              <Link
                key={tab.name}
                to={tab.to}
                className={`relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 z-10 ${
                  active
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 hover:text-medical-blue hover:bg-slate-100/80 active:scale-95'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId={`activeTabPill-${role}`}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-medical-blue rounded-xl sm:rounded-2xl shadow-md shadow-blue-500/25 -z-10"
                  />
                )}
                {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform" />}
                <span className="whitespace-nowrap">{tab.name}</span>
                {badgeCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full leading-tight transition-colors shrink-0 ${
                      active ? 'bg-white text-medical-blue' : 'bg-rose-500 text-white shadow-2xs'
                    }`}
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </motion.nav>
      </div>

      {/* Right Scroll Chevron */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollTabs('right')}
          title="Scroll Right"
          aria-label="Scroll sub-navigation right"
          className="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-30 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white shadow-xl border border-slate-200 text-slate-700 hover:text-medical-blue hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
}
