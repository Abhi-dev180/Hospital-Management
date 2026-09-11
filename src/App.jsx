import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GlobalLoader from "./components/GlobalLoader";
import ProfilePage from "./pages/profile/ProfilePage";
import FeedbackPage from "./pages/Feedback/FeedbackPage";        // wrapper that renders PublicFeedbackForm
import PublicFeedbackForm from "./components/portal/PublicFeedbackForm";
import ScrollToTop from "./components/ScrollToTop";
import FloatingScrollTop from "./components/FloatingScrollTop";
import PlanExpiredModal from "./components/PlanExpiredModal";
import useStripeSessionVerifier from "./hooks/useStripeSessionVerifier";

// ─── Lazy imports ───────────────────────────────────────────────
const Home = lazy(() => import("./pages/QuickPages/Home"));
const PortalHome = lazy(() => import("./pages/portal/PortalHome"));
const SchedulePage = lazy(() => import("./pages/portal/SchedulePage"));
const TokenFeedbackPage = lazy(() => import("./pages/portal/FeedbackPage")); // ✅ renamed
const RegisterPage = lazy(() => import("./pages/portal/RegisterPage"));
const BookAppointmentPage = lazy(() => import("./pages/portal/BookAppointmentPage"));
const SuperAdminDemos = lazy(() => import("./pages/superadmin/SuperAdminDemos"));
const SuperAdminRegistrations = lazy(() => import("./pages/superadmin/SuperAdminRegistrations"));
const SuperAdminUsers = lazy(() => import("./pages/superadmin/SuperAdminUsers"));
const SuperAdminContacts = lazy(() => import("./pages/superadmin/SuperAdminContacts"));
const SuperAdminCalendar = lazy(() => import("./pages/superadmin/SuperAdminCalendar"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar"));
const Login = lazy(() => import("./pages/Login"));
const UserDashboard = lazy(() => import("./pages/user/UserDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/SuperAdminDashboard"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminTimings = lazy(() => import("./pages/admin/AdminTimings"));
const AdminTranscriptions = lazy(() => import("./pages/admin/AdminTranscriptions"));
const SuperAdminManageAdmin = lazy(() => import("./pages/superadmin/SuperAdminManageAdmin"));
const SuperAdminManageHospitals = lazy(() => import("./pages/superadmin/SuperAdminManageHospitals"));
const SuperAdminManageServices = lazy(() => import("./pages/superadmin/SuperAdminManageServices"));
const SuperAdminAppointments = lazy(() => import("./pages/superadmin/SuperAdminAppointments"));
const UserBookAppointment = lazy(() => import("./pages/user/UserBookAppointment"));
const UserServices = lazy(() => import("./pages/user/UserServices"));
const UserMyAppointments = lazy(() => import("./pages/user/UserMyAppointments"));
const UserExploreHospitals = lazy(() => import("./pages/user/UserExploreHospitals"));
const UserFeedbacks = lazy(() => import("./pages/user/UserFeedbacks"));
const CentreOfExcellence = lazy(() => import("./pages/QuickPages/CentreOfExcellence"));
const Contact = lazy(() => import("./pages/QuickPages/Contact"));
const Doctors = lazy(() => import("./pages/QuickPages/Doctors"));
const Hospitals = lazy(() => import("./pages/QuickPages/Hospitals"));
const HospitalProfile = lazy(() => import("./pages/QuickPages/HospitalProfile"));
const PricingPage = lazy(() => import("./pages/stripe/PricingPage"));
const RenewPage = lazy(() => import("./pages/stripe/RenewPage"));
const AdminAppointments = lazy(() => import("./pages/admin/AdminAppointments"));
const AdminAppointmentFeedback = lazy(() => import("./pages/admin/AdminAppointmentFeedback"));

function AppRoutes() {
  useStripeSessionVerifier();

  return (
    <Suspense fallback={<GlobalLoader />}>
      <Routes>
        {/* ─── Public & Portal ─────────────────────────────── */}
        <Route path="/" element={<PortalHome />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/renew/:token" element={<RenewPage />} />
        <Route path="/how-it-works" element={<Navigate to="/#how-it-works" replace />} />
        <Route path="/about" element={<Navigate to="/#about" replace />} />
        <Route path="/book-demo" element={<Navigate to="/#book-demo" replace />} />
        <Route path="/appointment" element={<BookAppointmentPage />} />
        <Route path="/schedule/:token" element={<SchedulePage />} />
        <Route path="/register/:token" element={<RegisterPage />} />
        <Route path="/medpark" element={<Home />} />
        <Route path="/excellence" element={<CentreOfExcellence />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/hospitals/:id" element={<HospitalProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/feedback/:token" element={<TokenFeedbackPage />} />

        {/* ─── User Portal ────────────────────────────────── */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/dashboard/services" element={<UserServices />} />
        <Route path="/dashboard/explore-hospitals" element={<UserExploreHospitals />} />
        <Route path="/dashboard/book-appointment" element={<UserBookAppointment />} />
        <Route path="/dashboard/my-appointments" element={<UserMyAppointments />} />
        <Route path="/user/my-appointments" element={<Navigate to="/dashboard/my-appointments" replace />} />
        <Route path="/dashboard/feedbacks" element={<UserFeedbacks />} />

        {/* ─── Super Admin Dashboard ───────────────────────── */}
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/demos" element={<SuperAdminDemos />} />
        <Route path="/superadmin/registrations" element={<SuperAdminRegistrations />} />
        <Route path="/superadmin/users" element={<SuperAdminUsers />} />
        <Route path="/superadmin/services" element={<SuperAdminManageServices />} />
        <Route path="/superadmin/contacts" element={<SuperAdminContacts />} />
        <Route path="/superadmin/calendar" element={<SuperAdminCalendar />} />
        <Route path="/superadmin/manage-admin" element={<SuperAdminManageAdmin />} />
        <Route path="/superadmin/manage-hospitals" element={<SuperAdminManageHospitals />} />
        <Route path="/superadmin/appointments" element={<SuperAdminAppointments />} />

        {/* ─── Hospital Admin Dashboard ─────────────────────── */}
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/timings" element={<AdminTimings />} />
        <Route path="/admin/appointment-feedback" element={<AdminAppointmentFeedback />} />
        <Route path="/admin/transcriptions" element={<AdminTranscriptions />} />

        {/* ─── Profile ────────────────────────────────────── */}
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function AppContent() {
  const [expiredUser, setExpiredUser] = useState(null);

  useEffect(() => {
    const checkUserExpiry = () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          const isExplicitlyActive = u?.isExpired === false || u?.subscription_status === 'active' || u?.plan_status === 'active';

          const rawExp = u?.planEnd || u?.plan_end || u?.subscription?.expiry_date || u?.expiryDate;
          const expTime = rawExp ? new Date(rawExp).getTime() : 0;
          const now = Date.now();

          // If plan is explicitly active and has a valid future expiry (or no past expiry), do NOT show expiry modal
          if (isExplicitlyActive && (!expTime || expTime > now)) {
            setExpiredUser(null);
            return;
          }

          // Show modal only if user is explicitly expired or date is past
          const isExp = u?.isExpired === true || (expTime > 0 && expTime < now);
          if (isExp) setExpiredUser(u);
          else setExpiredUser(null);
        } else {
          setExpiredUser(null);
        }
      } catch (e) {
        setExpiredUser(null);
      }
    };

    checkUserExpiry();
    window.addEventListener('storage', checkUserExpiry);
    window.addEventListener('user_subscription_updated', checkUserExpiry);
    return () => {
      window.removeEventListener('storage', checkUserExpiry);
      window.removeEventListener('user_subscription_updated', checkUserExpiry);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Toaster
        position="top-right"
        containerStyle={{ marginTop: "3rem" }}
        toastOptions={{
          duration: 2000,
          style: {
            padding: "10px 10px",
            borderRadius: "12px",
            fontSize: "14px",
            maxWidth: "260px",
            width: "auto",
            whiteSpace: "normal",
            wordBreak: "break-word",
          },
        }}
      />

      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
        <FloatingScrollTop />
      </div>

      <PlanExpiredModal
        isOpen={Boolean(expiredUser)}
        onClose={() => setExpiredUser(null)}
        subscription={expiredUser?.subscription}
        user={expiredUser}
      />
    </Router>
  );
}

function App() {
  return <AppContent />;
}

export default App;