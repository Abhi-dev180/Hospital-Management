
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GlobalLoader from './components/GlobalLoader';

const Home = lazy(() => import('./pages/quick pages/Home'));
const PortalHome = lazy(() => import('./pages/portal/PortalHome'));
const SchedulePage = lazy(() => import('./pages/portal/SchedulePage'));
const FeedbackPage = lazy(() => import('./pages/portal/FeedbackPage'));
const RegisterPage = lazy(() => import('./pages/portal/RegisterPage'));
const BookAppointmentPage = lazy(() => import('./pages/portal/BookAppointmentPage'));
const SuperAdminDemos = lazy(() => import('./pages/superadmin/SuperAdminDemos'));
const SuperAdminRegistrations = lazy(() => import('./pages/superadmin/SuperAdminRegistrations'));
const SuperAdminUsers = lazy(() => import('./pages/superadmin/SuperAdminUsers'));
const SuperAdminContacts = lazy(() => import('./pages/superadmin/SuperAdminContacts'));
const SuperAdminCalendar = lazy(() => import('./pages/superadmin/SuperAdminCalendar'));
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'));
const Login = lazy(() => import('./pages/Login'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminTimings = lazy(() => import('./pages/admin/AdminTimings'));
const AdminTranscriptions = lazy(() => import('./pages/admin/AdminTranscriptions'));
const SuperAdminManageAdmin = lazy(() => import('./pages/superadmin/SuperAdminManageAdmin'));
const SuperAdminManageHospitals = lazy(() => import('./pages/superadmin/SuperAdminManageHospitals'));
const SuperAdminAppointments = lazy(() => import('./pages/superadmin/SuperAdminAppointments'));
const UserBookAppointment = lazy(() => import('./pages/user/UserBookAppointment'));
const UserMyAppointments = lazy(() => import('./pages/user/UserMyAppointments'));
const CentreOfExcellence = lazy(() => import('./pages/quick pages/CentreOfExcellence'));
const Contact = lazy(() => import('./pages/quick pages/Contact'));
const Doctors = lazy(() => import('./pages/quick pages/Doctors'));
const Hospitals = lazy(() => import('./pages/quick pages/Hospitals'));
const HospitalProfile = lazy(() => import('./pages/quick pages/HospitalProfile'));
const PricingPage = lazy(() => import('./pages/stripe/PricingPage'));
const RenewPage = lazy(() => import('./pages/stripe/RenewPage'));

// Separate components for admin:
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments')); 
const AdminAppointmentFeedback = lazy(() => import('./pages/admin/AdminAppointmentFeedback'));
function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        containerStyle={{ marginTop: '3rem' }}
        toastOptions={{
          duration: 2000,
          style: {
            padding: '10px 10px',
            borderRadius: '12px',
            fontSize: '14px',
            maxWidth: '260px',
            width: 'auto',
            whiteSpace: 'normal',
            wordBreak: 'break-word'
          }
        }}
      />

      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          {/*  Now using the attractive GlobalLoader */}
          <Suspense fallback={<GlobalLoader />}>
            <Routes>
              <Route path="/" element={<PortalHome />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/renew/:token" element={<RenewPage />} />
              <Route path="/how-it-works" element={<Navigate to="/#how-it-works" replace />} />
              <Route path="/about" element={<Navigate to="/#about" replace />} />
              <Route path="/book-demo" element={<Navigate to="/#book-demo" replace />} />
              <Route path="/appointment" element={<BookAppointmentPage />} />
              <Route path="/schedule/:token" element={<SchedulePage />} />
              <Route path="/feedback/:token" element={<FeedbackPage />} />
              <Route path="/register/:token" element={<RegisterPage />} />
              <Route path="/medpark" element={<Home />} />
              <Route path="/excellence" element={<CentreOfExcellence />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/hospitals/:id" element={<HospitalProfile />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />

              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/book-appointment" element={<UserBookAppointment />} />
              <Route path="/dashboard/book-appointment" element={<UserBookAppointment />} />
              <Route path="/dashboard/my-appointments" element={<UserMyAppointments />} />

              <Route path="/superadmin" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/manage-admin" element={<SuperAdminManageAdmin />} />
              <Route path="/superadmin/manage-hospitals" element={<SuperAdminManageHospitals />} />
              <Route path="/superadmin/appointments" element={<SuperAdminAppointments />} />
              <Route path="/superadmin/demos" element={<SuperAdminDemos />} />
              <Route path="/superadmin/registrations" element={<SuperAdminRegistrations />} />
              <Route path="/superadmin/users" element={<SuperAdminUsers />} />
              <Route path="/superadmin/contacts" element={<SuperAdminContacts />} />
              <Route path="/superadmin/calendar" element={<SuperAdminCalendar />} />

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="appointments" element={<AdminAppointments />} />
                <Route path="calendar" element={<AdminCalendar />} />
                <Route path="appointment-feedback" element={<AdminAppointmentFeedback />} />
                <Route path="timings" element={<AdminTimings />} />
                <Route path="transcriptions" element={<AdminTranscriptions />} />
              </Route>
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;