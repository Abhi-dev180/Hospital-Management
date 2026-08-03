// import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useState, useEffect } from 'react';
// import { Menu, X } from 'lucide-react';
// import toast from 'react-hot-toast';
// import medicalLogo from '../assets/sign.png';

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const checkAuth = () => {
//       const userData = localStorage.getItem('user');
//       if (userData) {
//         setUser(JSON.parse(userData));
//       } else {
//         setUser(null);
//       }
//     };

//     checkAuth();
//     window.addEventListener('storage', checkAuth);

//     return () => window.removeEventListener('storage', checkAuth);
//   }, []);

//   useEffect(() => {
//     if (isOpen) setIsOpen(false);
//   }, [location.pathname]);

//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     setUser(null);
//     toast.success('Logged out successfully');
//     navigate('/');
//   };

//   const getDashboardLink = () => {
//     if (!user) return '/';
//     if (user.role === 'superadmin') return '/superadmin';
//     if (user.role === 'admin') return '/admin';
//     return '/dashboard';
//   };

//   const isDashboardRoute = () => {
//     if (!user) return false;
//     if (user.role === 'superadmin') return location.pathname.startsWith('/superadmin');
//     if (user.role === 'admin') return location.pathname.startsWith('/admin');
//     return location.pathname.startsWith('/dashboard');
//   };

//   const getRoleLinks = () => {
//     if (!user) return [];

//     if (user.role === 'superadmin') {
//       return [
//         { name: 'Overview', to: '/superadmin' },
//         { name: 'Demo Bookings', to: '/superadmin/demos' },
//         { name: 'Manage Admin', to: '/superadmin/manage-admin' },
//         { name: 'Manage Hospitals', to: '/superadmin/manage-hospitals' },
//         { name: 'Appointments', to: '/superadmin/appointments' }
//       ];
//     }

//    if (user.role === 'admin') {
//   return [
//     { name: 'Overview', to: '/admin' },
//     { name: 'Appointments', to: '/admin/appointments' },
//     { name: 'Timings', to: '/admin/timings' },
//     { name: 'Feedback', to: '/admin/appointment-feedback' },
//     { name: 'Transcriptions', to: '/admin/transcriptions' }
//   ];
// }

//     return [
//       { name: 'Overview', to: '/dashboard' },
//       { name: 'Book Appointment', to: '/dashboard/book-appointment' },
//       { name: 'My Appointments', to: '/dashboard/my-appointments' }
//     ];
//   };

//   const dashboardLinks = getRoleLinks();
//   const showDashboardNav = !!user && isDashboardRoute();
//   const logoRedirect = user ? getDashboardLink() : '/';

//   // Single-page portal: every public link scrolls to a section on the home page.
//   const publicLinks = [
//     { name: 'Features', id: 'features' },
//     { name: 'Specialties', id: 'specialties' },
//     { name: 'How It Works', id: 'how-it-works' },
//     { name: 'About', id: 'about' },
//     { name: 'FAQ', id: 'faq' },
//     { name: 'Feedback', id: 'feedback' },            // ← new
//     { name: 'Book Appointment', route: '/appointment' },
//     { name: 'Book a Demo', id: 'book-demo', cta: true }
//   ];

//   const handleNav = (link) => {
//     setIsOpen(false);
//     if (link.route) { navigate(link.route); return; }
//     if (location.pathname === '/') {
//       const el = document.getElementById(link.id);
//       if (el) {
//         el.scrollIntoView({ behavior: 'smooth' });
//         window.history.replaceState(null, '', `/#${link.id}`);
//       }
//     } else {
//       navigate(`/#${link.id}`);
//     }
//   };

//   return (
//     <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16 sm:h-20 gap-3">
//           <div className="flex-shrink-0 flex items-center min-w-0">
//             <Link to={logoRedirect} className="flex items-center gap-2 sm:gap-3 min-w-0">
//               <img
//                 src={medicalLogo}
//                 alt="Medpark logo"
//                 className="h-9 sm:h-11 w-auto object-contain shrink-0"
//               />
//               <span className="font-bold text-lg sm:text-2xl tracking-tight text-medical-dark truncate">
//                 MEDPARK
//                 <span className="text-red-500 text-xs sm:text-sm align-top ml-1">✚</span>
//               </span>
//             </Link>
//           </div>

//           <nav className="hidden md:flex items-center gap-5 lg:gap-6 font-medium text-sm text-gray-700">
//             {!showDashboardNav &&
//               publicLinks.map((link) =>
//                 link.cta ? (
//                   <button
//                     key={link.name}
//                     onClick={() => handleNav(link)}
//                     className="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold text-white bg-medical-blue hover:bg-medical-dark transition-colors whitespace-nowrap"
//                   >
//                     {link.name}
//                   </button>
//                 ) : (
//                   <button
//                     key={link.name}
//                     onClick={() => handleNav(link)}
//                     className="transition-colors hover:text-medical-blue cursor-pointer"
//                   >
//                     {link.name}
//                   </button>
//                 )
//               )}

//             {showDashboardNav ? (
//               <>
//                 <div className="flex items-center gap-4 lg:gap-5">
//                   {dashboardLinks.map((link) => (
//                     <NavLink
//                       key={link.name}
//                       to={link.to}
//                       className={({ isActive }) =>
//                         `transition-colors whitespace-nowrap ${
//                           isActive ? 'text-medical-blue font-semibold' : 'hover:text-medical-blue'
//                         }`
//                       }
//                     >
//                       {link.name}
//                     </NavLink>
//                   ))}
//                 </div>

//                 <div className="flex items-center gap-3 ml-2 lg:ml-4 pl-3 lg:pl-4 border-l border-gray-200">
//                   <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-medical-blue text-white font-semibold uppercase shrink-0">
//                     {user?.name?.charAt(0) || 'U'}
//                   </div>

//                   <div className="hidden xl:flex flex-col text-sm text-gray-700 leading-tight">
//                     <span className="font-semibold">{user?.name}</span>
//                     <span className="text-gray-500 capitalize">{user?.role}</span>
//                   </div>

//                   <button
//                     onClick={handleLogout}
//                     className="inline-flex items-center justify-center px-4 py-2 border border-medical-dark rounded-md shadow-sm text-sm font-medium text-medical-dark hover:bg-medical-dark hover:text-white transition-colors"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               </>
//             ) : user ? (
//               <div className="flex items-center gap-3 ml-4">
//                 <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-medical-blue text-white font-semibold uppercase shrink-0">
//                   {user?.name?.charAt(0) || 'U'}
//                 </div>

//                 <div className="hidden lg:flex flex-col text-sm text-gray-700 leading-tight">
//                   <span className="font-semibold">{user?.name}</span>
//                   <span className="text-gray-500 capitalize">{user?.role}</span>
//                 </div>

//                 <Link
//                   to={getDashboardLink()}
//                   className="text-medical-blue hover:text-medical-dark transition-colors font-semibold whitespace-nowrap"
//                 >
//                   Dashboard
//                 </Link>

//                 <button
//                   onClick={handleLogout}
//                   className="inline-flex items-center justify-center px-4 py-2 border border-medical-dark rounded-md shadow-sm text-sm font-medium text-medical-dark hover:bg-medical-dark hover:text-white transition-colors"
//                 >
//                   Logout
//                 </button>
//               </div>
//             ) : (
//               <Link
//                 to="/login"
//                 className="ml-4 inline-flex items-center justify-center px-5 lg:px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-medical-dark hover:bg-medical-blue transition-colors whitespace-nowrap"
//               >
//                 Login →
//               </Link>
//             )}
//           </nav>

//           <div className="md:hidden flex items-center">
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               aria-label="Toggle navigation"
//               className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-gray-200 bg-medical-light text-medical-dark shadow-sm hover:border-medical-blue hover:text-medical-blue transition-colors focus:outline-none focus:ring-2 focus:ring-medical-blue"
//             >
//               {isOpen ? <X size={22} /> : <Menu size={22} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
//           >
//             <div className="px-4 pt-3 pb-6 space-y-2 flex flex-col">
//               {user ? (
//                 <>
//                   <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-2">
//                     <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-medical-blue text-white font-semibold uppercase shrink-0">
//                       {user?.name?.charAt(0) || 'U'}
//                     </div>
//                     <div className="min-w-0">
//                       <p className="font-semibold text-medical-dark truncate">{user?.name}</p>
//                       <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
//                     </div>
//                   </div>

//                   {showDashboardNav ? (
//                     <>
//                       {dashboardLinks.map((link) => (
//                         <NavLink
//                           key={link.name}
//                           to={link.to}
//                           onClick={() => setIsOpen(false)}
//                           className={({ isActive }) =>
//                             `block px-3 py-3 rounded-md text-base font-medium transition ${
//                               isActive
//                                 ? 'text-medical-blue bg-blue-50'
//                                 : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
//                             }`
//                           }
//                         >
//                           {link.name}
//                         </NavLink>
//                       ))}

//                       <button
//                         onClick={() => {
//                           handleLogout();
//                           setIsOpen(false);
//                         }}
//                         className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
//                       >
//                         Logout
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <NavLink
//                         to={getDashboardLink()}
//                         onClick={() => setIsOpen(false)}
//                         className={({ isActive }) =>
//                           `block px-3 py-3 rounded-md text-base font-medium transition ${
//                             isActive
//                               ? 'text-medical-blue bg-blue-50'
//                               : 'text-medical-blue hover:bg-gray-50'
//                           }`
//                         }
//                       >
//                         Dashboard
//                       </NavLink>

//                       <button
//                         onClick={() => {
//                           handleLogout();
//                           setIsOpen(false);
//                         }}
//                         className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
//                       >
//                         Logout
//                       </button>
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   {publicLinks.map((link) => (
//                     <button
//                       key={link.name}
//                       onClick={() => handleNav(link)}
//                       className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium transition ${
//                         link.cta
//                           ? 'text-white bg-medical-blue hover:bg-medical-dark'
//                           : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
//                       }`}
//                     >
//                       {link.name}
//                     </button>
//                   ))}

//                   <Link
//                     to="/login"
//                     onClick={() => setIsOpen(false)}
//                     className="mt-4 block w-full text-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-medical-dark hover:bg-medical-blue transition-colors"
//                   >
//                     Login
//                   </Link>
//                 </>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </header>
//   );
// }

import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import medicalLogo from '../assets/sign.png';
import useSuperAdminBadges from '../hooks/useSuperAdminBadges';

// Small red counter shown at the top-right of a nav item.
function NavBadge({ count, className = '' }) {
  if (!count) return null;
  return (
    <span
      title={`${count} new`}
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full
        bg-red-600 text-white text-[10px] font-black leading-none shadow-sm ring-2 ring-white
        animate-pulse ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Live counters for the superadmin tabs — only polled for superadmins.
  const { badges } = useSuperAdminBadges(user?.role === 'superadmin');

  // Handle scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => window.removeEventListener('storage', checkAuth);
  }, []);

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
        { name: 'Overview', to: '/superadmin' },
        { name: 'Demo Bookings', to: '/superadmin/demos', badge: 'demos' },
        { name: 'Registrations', to: '/superadmin/registrations', badge: 'registrations' },
        { name: 'Manage Admin', to: '/superadmin/manage-admin' },
        { name: 'Manage Hospitals', to: '/superadmin/manage-hospitals' },
        { name: 'Appointments', to: '/superadmin/appointments' },
        { name: 'Calendar', to: '/superadmin/calendar' },
        { name: 'Contacts', to: '/superadmin/contacts', badge: 'contacts' }
      ];
    }

    if (user.role === 'admin') {
      return [
        { name: 'Overview', to: '/admin' },
        { name: 'Appointments', to: '/admin/appointments' },
        { name: 'Calendar', to: '/admin/calendar' },
        { name: 'Timings', to: '/admin/timings' },
        { name: 'Feedback', to: '/admin/appointment-feedback' },
        { name: 'Transcriptions', to: '/admin/transcriptions' }
      ];
    }

    return [
      { name: 'Overview', to: '/dashboard' },
      { name: 'Book Appointment', to: '/dashboard/book-appointment' },
      { name: 'My Appointments', to: '/dashboard/my-appointments' }
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

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-md border-transparent' : 'border-b border-gray-100'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-3">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center min-w-0">
            <Link to={logoRedirect} className="flex items-center gap-2.5 sm:gap-3 min-w-0 group">
              <img
                src={medicalLogo}
                alt="Medpark logo"
                className="h-9 sm:h-11 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-gray-900 truncate">
                MEDPARK
                <span className="text-red-500 text-xs sm:text-sm align-top ml-1">✚</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 font-medium text-sm text-gray-600">
            {!showDashboardNav &&
              publicLinks.map((link) =>
                link.cta ? (
                  <button
                    key={link.name}
                    onClick={() => handleNav(link)}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-medical-blue hover:bg-medical-dark transition-all shadow-sm hover:shadow active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    {link.name}
                  </button>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => handleNav(link)}
                    className="transition-colors hover:text-medical-blue cursor-pointer py-1"
                  >
                    {link.name}
                  </button>
                )
              )}

            {showDashboardNav ? (
              <>
                <div className="flex items-center gap-4 lg:gap-5">
                  {dashboardLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.to}
                      className={({ isActive }) =>
                        `relative transition-colors whitespace-nowrap py-1 ${
                          isActive ? 'text-medical-blue font-semibold border-b-2 border-medical-blue' : 'hover:text-medical-blue'
                        }`
                      }
                    >
                      {link.name}
                      {link.badge && (
                        <NavBadge count={badges[link.badge]} className="absolute -top-2.5 -right-3.5" />
                      )}
                    </NavLink>
                  ))}
                </div>

                <div className="flex items-center gap-3 ml-2 lg:ml-4 pl-3 lg:pl-4 border-l border-gray-200">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-medical-blue/10 text-medical-blue font-bold uppercase shrink-0 border border-medical-blue/20">
                    {user?.name?.charAt(0) || 'U'}
                  </div>

                  <div className="hidden xl:flex flex-col text-sm text-gray-700 leading-tight">
                    <span className="font-semibold text-gray-900">{user?.name}</span>
                    <span className="text-xs text-gray-500 capitalize tracking-wide">{user?.role}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-xs text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : user ? (
              <div className="flex items-center gap-3 ml-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-medical-blue/10 text-medical-blue font-bold uppercase shrink-0 border border-medical-blue/20">
                  {user?.name?.charAt(0) || 'U'}
                </div>

                <div className="hidden lg:flex flex-col text-sm text-gray-700 leading-tight">
                  <span className="font-semibold text-gray-900">{user?.name}</span>
                  <span className="text-xs text-gray-500 capitalize tracking-wide">{user?.role}</span>
                </div>

                <Link
                  to={getDashboardLink()}
                  className="text-medical-blue hover:text-medical-dark transition-colors font-semibold whitespace-nowrap px-3 py-2 bg-blue-50/50 rounded-lg"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-xs text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-4 inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-medical-dark hover:bg-medical-blue transition-all active:scale-95 whitespace-nowrap"
              >
                Login →
              </Link>
            )}
          </nav>

          {/* Mobile Menu Trigger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-800 shadow-2xs hover:border-medical-blue hover:text-medical-blue transition-colors focus:outline-none focus:ring-2 focus:ring-medical-blue cursor-pointer"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-2.5 flex flex-col max-h-[80vh] overflow-y-auto">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3.5 rounded-xl bg-gray-50 border border-gray-100 mb-2">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-medical-blue text-white font-bold uppercase shrink-0 shadow-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>

                  {showDashboardNav ? (
                    <>
                      {dashboardLinks.map((link) => (
                        <NavLink
                          key={link.name}
                          to={link.to}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-base font-medium transition ${
                              isActive
                                ? 'text-medical-blue bg-blue-50/80 font-semibold'
                                : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
                            }`
                          }
                        >
                          <span>{link.name}</span>
                          {link.badge && <NavBadge count={badges[link.badge]} />}
                        </NavLink>
                      ))}

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full text-left block px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
                          `block px-4 py-3 rounded-xl text-base font-medium transition ${
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
                        className="w-full text-left block px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
                      className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition cursor-pointer ${
                        link.cta
                          ? 'text-white bg-medical-blue hover:bg-medical-dark text-center shadow-sm font-semibold'
                          : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
                      }`}
                    >
                      {link.name}
                    </button>
                  ))}

                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="mt-2 block w-full text-center px-6 py-3.5 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-medical-dark hover:bg-medical-blue transition-colors"
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