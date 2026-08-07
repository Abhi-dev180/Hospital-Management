// import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useState, useEffect } from 'react';
// import { Menu, X } from 'lucide-react';
// import toast from 'react-hot-toast';
// import medicalLogo from '../assets/sign.png';
// import useSuperAdminBadges from '../hooks/useSuperAdminBadges';

// // Small red counter shown at the top-right of a nav item.
// function NavBadge({ count, className = '' }) {
//   if (!count) return null;
//   return (
//     <span
//       title={`${count} new`}
//       className={`inline-flex items-center justify-center min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 rounded-full
//         bg-red-600 text-white text-[9px] sm:text-[10px] font-black leading-none shadow-xs ring-2 ring-white
//         animate-pulse ${className}`}
//     >
//       {count > 99 ? '99+' : count}
//     </span>
//   );
// }

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [scrolled, setScrolled] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Live counters for the superadmin tabs — only polled for superadmins.
//   const { badges } = useSuperAdminBadges(user?.role === 'superadmin');

//   // Handle scroll shadow effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     const checkAuth = () => {
//       const userData = localStorage.getItem('user');
//       setUser(userData ? JSON.parse(userData) : null);
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
//         { name: 'Demo Bookings', to: '/superadmin/demos', badge: 'demos' },
//         { name: 'Registrations', to: '/superadmin/registrations', badge: 'registrations' },
//         { name: 'Manage Admin', to: '/superadmin/manage-admin' },
//         { name: 'Manage Hospitals', to: '/superadmin/manage-hospitals' },
//         { name: 'Appointments', to: '/superadmin/appointments' },
//         { name: 'Calendar', to: '/superadmin/calendar' },
//         { name: 'Contacts', to: '/superadmin/contacts', badge: 'contacts' }
//       ];
//     }

//     if (user.role === 'admin') {
//       return [
//         { name: 'Overview', to: '/admin' },
//         { name: 'Appointments', to: '/admin/appointments' },
//         { name: 'Calendar', to: '/admin/calendar' },
//         { name: 'Timings', to: '/admin/timings' },
//         { name: 'Feedback', to: '/admin/appointment-feedback' }
//       ];
//     }

//     return [
//       { name: 'Overview', to: '/dashboard' },
//       { name: 'Book Appointment', to: '/dashboard/book-appointment' },
//       { name: 'My Appointments', to: '/dashboard/my-appointments' }
//     ];
//   };

//   const dashboardLinks = getRoleLinks();
//   const showDashboardNav = !!user && isDashboardRoute();
//   const logoRedirect = user ? getDashboardLink() : '/';

//   const publicLinks = [
//     { name: 'Features', id: 'features' },
//     { name: 'Specialties', id: 'specialties' },
//     { name: 'How It Works', id: 'how-it-works' },
//     { name: 'About', id: 'about' },
//     { name: 'FAQ', id: 'faq' },
//     { name: 'Feedback', id: 'feedback' },
//     { name: 'Contact', route: '/contact' },
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
//     <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-md border-transparent' : 'border-b border-gray-100'}`}>
//       <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
//         {/* Flexible container that adjusts height when items wrap to second line */}
//         <div className="flex justify-between items-center min-h-[64px] sm:min-h-[80px] py-2 gap-2 sm:gap-4">
          
//           {/* Logo Section */}
//           <div className="flex-shrink-0 flex items-center min-w-0">
//             <Link to={logoRedirect} className="flex items-center gap-2 min-w-0 group">
//               <img
//                 src={medicalLogo}
//                 alt="Medpark logo"
//                 className="h-8 sm:h-10 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
//               />
//               <span className="font-extrabold text-base sm:text-xl lg:text-2xl tracking-tight text-gray-900 truncate">
//                 MEDPARK
//                 <span className="text-red-500 text-xs sm:text-sm align-top ml-0.5 sm:ml-1">✚</span>
//               </span>
//             </Link>
//           </div>

//           {/* Desktop & Laptop Navigation — Enables multi-line flex wrapping */}
//           <nav className="hidden md:flex flex-wrap items-center justify-end gap-x-4 gap-y-2 font-medium text-xs lg:text-sm text-gray-600 min-w-0 py-1">
//             {!showDashboardNav &&
//               publicLinks.map((link) =>
//                 link.cta ? (
//                   <button
//                     key={link.name}
//                     onClick={() => handleNav(link)}
//                     className="inline-flex items-center justify-center px-3.5 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-semibold text-white bg-medical-blue hover:bg-medical-dark transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer shrink-0"
//                   >
//                     {link.name}
//                   </button>
//                 ) : (
//                   <button
//                     key={link.name}
//                     onClick={() => handleNav(link)}
//                     className="transition-colors hover:text-medical-blue cursor-pointer py-1"
//                   >
//                     {link.name}
//                   </button>
//                 )
//               )}

//             {showDashboardNav ? (
//               <>
//                 {/* Dashboard Tab Links — Wraps smoothly onto a new line if screen is narrow */}
//                 <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 lg:gap-x-5">
//                   {dashboardLinks.map((link) => (
//                     <NavLink
//                       key={link.name}
//                       to={link.to}
//                       className={({ isActive }) =>
//                         `relative transition-colors py-1 px-1 ${
//                           isActive ? 'text-medical-blue font-semibold border-b-2 border-medical-blue' : 'hover:text-medical-blue'
//                         }`
//                       }
//                     >
//                       {link.name}
//                       {link.badge && (
//                         <NavBadge count={badges[link.badge]} className="absolute -top-2 -right-3" />
//                       )}
//                     </NavLink>
//                   ))}
//                 </div>

//                 {/* Profile & Logout Group */}
//                 <div className="flex items-center gap-2 lg:gap-3 ml-1 lg:ml-3 pl-2 lg:pl-4 border-l border-gray-200 shrink-0">
//                   <div className="inline-flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-medical-blue/10 text-medical-blue font-bold text-xs lg:text-sm uppercase shrink-0 border border-medical-blue/20">
//                     {user?.name?.charAt(0) || 'U'}
//                   </div>

//                   <div className="hidden xl:flex flex-col text-xs lg:text-sm text-gray-700 leading-tight">
//                     <span className="font-semibold text-gray-900 max-w-[100px] truncate">{user?.name}</span>
//                     <span className="text-[10px] lg:text-xs text-gray-500 capitalize tracking-wide">{user?.role}</span>
//                   </div>

//                   <button
//                     onClick={handleLogout}
//                     className="inline-flex items-center justify-center px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 rounded-lg shadow-2xs text-xs lg:text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               </>
//             ) : user ? (
//               <div className="flex items-center gap-2 lg:gap-3 ml-2 shrink-0">
//                 <div className="inline-flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-medical-blue/10 text-medical-blue font-bold text-xs lg:text-sm uppercase shrink-0 border border-medical-blue/20">
//                   {user?.name?.charAt(0) || 'U'}
//                 </div>

//                 <div className="hidden lg:flex flex-col text-xs lg:text-sm text-gray-700 leading-tight">
//                   <span className="font-semibold text-gray-900 max-w-[100px] truncate">{user?.name}</span>
//                   <span className="text-[10px] lg:text-xs text-gray-500 capitalize tracking-wide">{user?.role}</span>
//                 </div>

//                 <Link
//                   to={getDashboardLink()}
//                   className="text-medical-blue hover:text-medical-dark transition-colors font-semibold px-2.5 py-1.5 lg:px-3 lg:py-2 bg-blue-50/50 rounded-lg text-xs lg:text-sm"
//                 >
//                   Dashboard
//                 </Link>

//                 <button
//                   onClick={handleLogout}
//                   className="inline-flex items-center justify-center px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 rounded-lg shadow-2xs text-xs lg:text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
//                 >
//                   Logout
//                 </button>
//               </div>
//             ) : (
//               <Link
//                 to="/login"
//                 className="ml-2 inline-flex items-center justify-center px-4 py-2 lg:px-6 lg:py-2.5 border border-transparent rounded-lg shadow-2xs text-xs lg:text-sm font-medium text-white bg-medical-dark hover:bg-medical-blue transition-all active:scale-95 shrink-0"
//               >
//                 Login →
//               </Link>
//             )}
//           </nav>

//           {/* Mobile Menu Toggle */}
//           <div className="md:hidden flex items-center shrink-0">
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               aria-label="Toggle navigation"
//               className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-800 shadow-2xs hover:border-medical-blue hover:text-medical-blue transition-colors focus:outline-none cursor-pointer"
//             >
//               {isOpen ? <X size={20} /> : <Menu size={20} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Drawer Menu */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             transition={{ duration: 0.25, ease: 'easeInOut' }}
//             className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
//           >
//             <div className="px-4 pt-3 pb-6 space-y-2 flex flex-col max-h-[85vh] overflow-y-auto">
//               {user ? (
//                 <>
//                   <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 border border-gray-100 mb-1">
//                     <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-medical-blue text-white font-bold uppercase shrink-0 shadow-2xs">
//                       {user?.name?.charAt(0) || 'U'}
//                     </div>
//                     <div className="min-w-0">
//                       <p className="font-semibold text-gray-900 truncate text-sm">{user?.name}</p>
//                       <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
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
//                             `flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
//                               isActive
//                                 ? 'text-medical-blue bg-blue-50/80 font-semibold'
//                                 : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
//                             }`
//                           }
//                         >
//                           <span>{link.name}</span>
//                           {link.badge && <NavBadge count={badges[link.badge]} />}
//                         </NavLink>
//                       ))}

//                       <button
//                         onClick={() => {
//                           handleLogout();
//                           setIsOpen(false);
//                         }}
//                         className="w-full text-left block px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
//                           `block px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
//                             isActive
//                               ? 'text-medical-blue bg-blue-50/80 font-semibold'
//                               : 'text-medical-blue bg-blue-50/30 hover:bg-blue-50'
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
//                         className="w-full text-left block px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
//                       className={`block w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
//                         link.cta
//                           ? 'text-white bg-medical-blue hover:bg-medical-dark text-center shadow-xs font-semibold mt-1'
//                           : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
//                       }`}
//                     >
//                       {link.name}
//                     </button>
//                   ))}

//                   <Link
//                     to="/login"
//                     onClick={() => setIsOpen(false)}
//                     className="mt-2 block w-full text-center px-4 py-3 border border-transparent rounded-xl shadow-xs text-sm font-medium text-white bg-medical-dark hover:bg-medical-blue transition-colors"
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



// import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useState, useEffect } from 'react';
// import { Menu, X } from 'lucide-react';
// import toast from 'react-hot-toast';
// import medicalLogo from '../assets/sign.png';
// import useSuperAdminBadges from '../hooks/useSuperAdminBadges';
// import useAdminBadges from '../hooks/useAdminBadges'; // ✅ Import Admin hook

// // Small red counter shown at the top-right of a nav item.
// function NavBadge({ count, className = '' }) {
//   if (!count) return null;
//   return (
//     <span
//       title={`${count} new`}
//       className={`inline-flex items-center justify-center min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 rounded-full
//         bg-red-600 text-white text-[9px] sm:text-[10px] font-black leading-none shadow-xs ring-2 ring-white
//         animate-pulse ${className}`}
//     >
//       {count > 99 ? '99+' : count}
//     </span>
//   );
// }

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [scrolled, setScrolled] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Fetch badges based on role
//   const isSuperAdmin = user?.role === 'superadmin';
//   const isAdmin = user?.role === 'admin';
  
//   const { badges: superBadges } = useSuperAdminBadges(isSuperAdmin);
//   const { badges: adminBadges } = useAdminBadges(isAdmin);

//   // Handle scroll shadow effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     const checkAuth = () => {
//       const userData = localStorage.getItem('user');
//       setUser(userData ? JSON.parse(userData) : null);
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
//         { name: 'Demo Bookings', to: '/superadmin/demos', badge: 'demos' },
//         { name: 'Registrations', to: '/superadmin/registrations', badge: 'registrations' },
//         { name: 'Manage Admin', to: '/superadmin/manage-admin' },
//         { name: 'Manage Hospitals', to: '/superadmin/manage-hospitals' },
//         { name: 'Appointments', to: '/superadmin/appointments' },
//         { name: 'Calendar', to: '/superadmin/calendar' },
//         { name: 'Contacts', to: '/superadmin/contacts', badge: 'contacts' }
//       ];
//     }

//     if (user.role === 'admin') {
//       return [
//         { name: 'Overview', to: '/admin' },
//         { name: 'Appointments', to: '/admin/appointments', badge: 'appointments' }, // ✅ Badge set here
//         { name: 'Calendar', to: '/admin/calendar' },
//         { name: 'Timings', to: '/admin/timings' },
//         { name: 'Feedback', to: '/admin/appointment-feedback', badge: 'feedback' } // ✅ Badge set here
//       ];
//     }

//     return [
//       { name: 'Overview', to: '/dashboard' },
//       { name: 'Book Appointment', to: '/dashboard/book-appointment' },
//       { name: 'My Appointments', to: '/dashboard/my-appointments' }
//     ];
//   };

//   const dashboardLinks = getRoleLinks();
//   const showDashboardNav = !!user && isDashboardRoute();
//   const logoRedirect = user ? getDashboardLink() : '/';

//   const publicLinks = [
//     { name: 'Features', id: 'features' },
//     { name: 'Specialties', id: 'specialties' },
//     { name: 'How It Works', id: 'how-it-works' },
//     { name: 'About', id: 'about' },
//     { name: 'FAQ', id: 'faq' },
//     { name: 'Feedback', id: 'feedback' },
//     { name: 'Contact', route: '/contact' },
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

//   // Determine which badge object to use based on role
//   const activeBadges = isSuperAdmin ? superBadges : (isAdmin ? adminBadges : {});

//   // Handle clicking a badge link to reset the count
//   const handleBadgeLinkClick = () => {
//     setIsOpen(false);
//     // Note: The reset logic is handled automatically by the hook's useEffect
//     // when the pathname changes, so we don't need to call anything manually here.
//   };

//   return (
//     <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-md border-transparent' : 'border-b border-gray-100'}`}>
//       <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
//         <div className="flex justify-between items-center min-h-[64px] sm:min-h-[80px] py-2 gap-2 sm:gap-4">
          
//           {/* Logo Section */}
//           <div className="flex-shrink-0 flex items-center min-w-0">
//             <Link to={logoRedirect} className="flex items-center gap-2 min-w-0 group">
//               <img
//                 src={medicalLogo}
//                 alt="Medpark logo"
//                 className="h-8 sm:h-10 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
//               />
//               <span className="font-extrabold text-base sm:text-xl lg:text-2xl tracking-tight text-gray-900 truncate">
//                 MEDPARK
//                 <span className="text-red-500 text-xs sm:text-sm align-top ml-0.5 sm:ml-1">✚</span>
//               </span>
//             </Link>
//           </div>

//           {/* Desktop & Laptop Navigation */}
//           <nav className="hidden md:flex flex-wrap items-center justify-end gap-x-4 gap-y-2 font-medium text-xs lg:text-sm text-gray-600 min-w-0 py-1">
//             {!showDashboardNav &&
//               publicLinks.map((link) =>
//                 link.cta ? (
//                   <button
//                     key={link.name}
//                     onClick={() => handleNav(link)}
//                     className="inline-flex items-center justify-center px-3.5 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-semibold text-white bg-medical-blue hover:bg-medical-dark transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer shrink-0"
//                   >
//                     {link.name}
//                   </button>
//                 ) : (
//                   <button
//                     key={link.name}
//                     onClick={() => handleNav(link)}
//                     className="transition-colors hover:text-medical-blue cursor-pointer py-1"
//                   >
//                     {link.name}
//                   </button>
//                 )
//               )}

//             {showDashboardNav ? (
//               <>
//                 {/* Dashboard Tab Links */}
//                 <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 lg:gap-x-5">
//                   {dashboardLinks.map((link) => (
//                     <NavLink
//                       key={link.name}
//                       to={link.to}
//                       onClick={handleBadgeLinkClick} 
//                       className={({ isActive }) =>
//                         `relative transition-colors py-1 px-1 ${
//                           isActive ? 'text-medical-blue font-semibold border-b-2 border-medical-blue' : 'hover:text-medical-blue'
//                         }`
//                       }
//                     >
//                       {link.name}
//                       {/* Display badge if the role's badge object has this key */}
//                       {link.badge && (
//                         <NavBadge count={activeBadges[link.badge]} className="absolute -top-2 -right-3" />
//                       )}
//                     </NavLink>
//                   ))}
//                 </div>

//                 {/* Profile & Logout Group */}
//                 <div className="flex items-center gap-2 lg:gap-3 ml-1 lg:ml-3 pl-2 lg:pl-4 border-l border-gray-200 shrink-0">
//                   <div className="inline-flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-medical-blue/10 text-medical-blue font-bold text-xs lg:text-sm uppercase shrink-0 border border-medical-blue/20">
//                     {user?.name?.charAt(0) || 'U'}
//                   </div>

//                   <div className="hidden xl:flex flex-col text-xs lg:text-sm text-gray-700 leading-tight">
//                     <span className="font-semibold text-gray-900 max-w-[100px] truncate">{user?.name}</span>
//                     <span className="text-[10px] lg:text-xs text-gray-500 capitalize tracking-wide">{user?.role}</span>
//                   </div>

//                   <button
//                     onClick={handleLogout}
//                     className="inline-flex items-center justify-center px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 rounded-lg shadow-2xs text-xs lg:text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               </>
//             ) : user ? (
//               <div className="flex items-center gap-2 lg:gap-3 ml-2 shrink-0">
//                 <div className="inline-flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-medical-blue/10 text-medical-blue font-bold text-xs lg:text-sm uppercase shrink-0 border border-medical-blue/20">
//                   {user?.name?.charAt(0) || 'U'}
//                 </div>

//                 <div className="hidden lg:flex flex-col text-xs lg:text-sm text-gray-700 leading-tight">
//                   <span className="font-semibold text-gray-900 max-w-[100px] truncate">{user?.name}</span>
//                   <span className="text-[10px] lg:text-xs text-gray-500 capitalize tracking-wide">{user?.role}</span>
//                 </div>

//                 <Link
//                   to={getDashboardLink()}
//                   className="text-medical-blue hover:text-medical-dark transition-colors font-semibold px-2.5 py-1.5 lg:px-3 lg:py-2 bg-blue-50/50 rounded-lg text-xs lg:text-sm"
//                 >
//                   Dashboard
//                 </Link>

//                 <button
//                   onClick={handleLogout}
//                   className="inline-flex items-center justify-center px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 rounded-lg shadow-2xs text-xs lg:text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
//                 >
//                   Logout
//                 </button>
//               </div>
//             ) : (
//               <Link
//                 to="/login"
//                 className="ml-2 inline-flex items-center justify-center px-4 py-2 lg:px-6 lg:py-2.5 border border-transparent rounded-lg shadow-2xs text-xs lg:text-sm font-medium text-white bg-medical-dark hover:bg-medical-blue transition-all active:scale-95 shrink-0"
//               >
//                 Login →
//               </Link>
//             )}
//           </nav>

//           {/* Mobile Menu Toggle */}
//           <div className="md:hidden flex items-center shrink-0">
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               aria-label="Toggle navigation"
//               className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-800 shadow-2xs hover:border-medical-blue hover:text-medical-blue transition-colors focus:outline-none cursor-pointer"
//             >
//               {isOpen ? <X size={20} /> : <Menu size={20} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Drawer Menu */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             transition={{ duration: 0.25, ease: 'easeInOut' }}
//             className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
//           >
//             <div className="px-4 pt-3 pb-6 space-y-2 flex flex-col max-h-[85vh] overflow-y-auto">
//               {user ? (
//                 <>
//                   <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 border border-gray-100 mb-1">
//                     <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-medical-blue text-white font-bold uppercase shrink-0 shadow-2xs">
//                       {user?.name?.charAt(0) || 'U'}
//                     </div>
//                     <div className="min-w-0">
//                       <p className="font-semibold text-gray-900 truncate text-sm">{user?.name}</p>
//                       <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
//                     </div>
//                   </div>

//                   {showDashboardNav ? (
//                     <>
//                       {dashboardLinks.map((link) => (
//                         <NavLink
//                           key={link.name}
//                           to={link.to}
//                           onClick={handleBadgeLinkClick} 
//                           className={({ isActive }) =>
//                             `flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
//                               isActive
//                                 ? 'text-medical-blue bg-blue-50/80 font-semibold'
//                                 : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
//                             }`
//                           }
//                         >
//                           <span>{link.name}</span>
//                           {link.badge && <NavBadge count={activeBadges[link.badge]} />}
//                         </NavLink>
//                       ))}

//                       <button
//                         onClick={() => {
//                           handleLogout();
//                           setIsOpen(false);
//                         }}
//                         className="w-full text-left block px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
//                           `block px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
//                             isActive
//                               ? 'text-medical-blue bg-blue-50/80 font-semibold'
//                               : 'text-medical-blue bg-blue-50/30 hover:bg-blue-50'
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
//                         className="w-full text-left block px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
//                       className={`block w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
//                         link.cta
//                           ? 'text-white bg-medical-blue hover:bg-medical-dark text-center shadow-xs font-semibold mt-1'
//                           : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
//                       }`}
//                     >
//                       {link.name}
//                     </button>
//                   ))}

//                   <Link
//                     to="/login"
//                     onClick={() => setIsOpen(false)}
//                     className="mt-2 block w-full text-center px-4 py-3 border border-transparent rounded-xl shadow-xs text-sm font-medium text-white bg-medical-dark hover:bg-medical-blue transition-colors"
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
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // ─── Close mobile menu on route change ──────────────────────
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
        { name: 'Appointments', to: '/admin/appointments', badge: 'appointments' },
        { name: 'Calendar', to: '/admin/calendar' },
        { name: 'Timings', to: '/admin/timings' },
        { name: 'Feedback', to: '/admin/appointment-feedback', badge: 'feedback' }
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

  const activeBadges = isSuperAdmin ? superBadges : (isAdmin ? adminBadges : {});

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? 'shadow-md border-transparent' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-[64px] sm:min-h-[80px] py-2 gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center min-w-0">
            <Link to={logoRedirect} className="flex items-center gap-2 min-w-0 group">
              <img
                src={medicalLogo}
                alt="Medpark logo"
                className="h-8 sm:h-10 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-extrabold text-base sm:text-xl lg:text-2xl tracking-tight text-gray-900 truncate">
                MEDPARK
                <span className="text-red-500 text-xs sm:text-sm align-top ml-0.5 sm:ml-1">✚</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-wrap items-center justify-end gap-x-4 gap-y-2 font-medium text-xs lg:text-sm text-gray-600 min-w-0 py-1">
            {!showDashboardNav &&
              publicLinks.map((link) =>
                link.cta ? (
                  <button
                    key={link.name}
                    onClick={() => handleNav(link)}
                    className="inline-flex items-center justify-center px-3.5 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-semibold text-white bg-medical-blue hover:bg-medical-dark transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer shrink-0"
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
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 lg:gap-x-5">
                  {dashboardLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.to}
                      className={({ isActive }) =>
                        `relative transition-colors py-1 px-1 ${
                          isActive
                            ? 'text-medical-blue font-semibold border-b-2 border-medical-blue'
                            : 'hover:text-medical-blue'
                        }`
                      }
                    >
                      {link.name}
                      {link.badge && (
                        <NavBadge count={activeBadges[link.badge]} className="absolute -top-2 -right-3" />
                      )}
                    </NavLink>
                  ))}
                </div>

                <div className="flex items-center gap-3 ml-1 lg:ml-3 pl-2 lg:pl-4 border-l border-gray-200 shrink-0">
                  <ProfileDropdown user={user} onLogout={handleLogout} />
                </div>
              </>
            ) : user ? (
              <div className="flex items-center gap-3 ml-2 shrink-0">
                <ProfileDropdown user={user} onLogout={handleLogout} />
                <Link
                  to={getDashboardLink()}
                  className="text-medical-blue hover:text-medical-dark transition-colors font-semibold px-2.5 py-1.5 lg:px-3 lg:py-2 bg-blue-50/50 rounded-lg text-xs lg:text-sm"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 inline-flex items-center justify-center px-4 py-2 lg:px-6 lg:py-2.5 border border-transparent rounded-lg shadow-2xs text-xs lg:text-sm font-medium text-white bg-medical-dark hover:bg-medical-blue transition-all active:scale-95 shrink-0"
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
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 border border-gray-100 mb-1">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-medical-blue text-white font-bold uppercase shadow-2xs">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">{user?.name}</p>
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
                            `flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                              isActive
                                ? 'text-medical-blue bg-blue-50/80 font-semibold'
                                : 'text-gray-700 hover:text-medical-blue hover:bg-gray-50'
                            }`
                          }
                        >
                          <span>{link.name}</span>
                          {link.badge && <NavBadge count={activeBadges[link.badge]} />}
                        </NavLink>
                      ))}
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