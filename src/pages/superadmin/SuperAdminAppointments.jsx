
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarPlus,
  Mail,
  Phone,
  Filter,
  Eye,
  Trash2,
  FileText,
  Check,
  AlertCircle,
  PawPrint,
  Calendar,
  Clock,
  MessageSquare,
  Stethoscope,
  Hospital,
  User,
  TestTube,
  Droplet,
  Activity,
  Sparkles,
  ClipboardList,
  RotateCcw,
  Receipt,
  CreditCard,
  BadgePercent
} from "lucide-react";
import toast from "react-hot-toast";
import API_URL from "../../config/api";
import DashboardLayout from "../../components/DashboardLayout";
import DashboardTabs from "../../components/DashboardTabs";
import Pagination from "../../components/Pagination";
import SlotSelector from "../../components/SlotSelector";
import { TableSkeleton } from "../../components/Loader";

const PER_PAGE = 6;
const STATUSES = [
  "Pending",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
  "Rescheduled",
];

const statusColors = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-purple-50 text-purple-700 border-purple-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  Rescheduled: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalPanel = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.95, y: 12, transition: { duration: 0.15 } },
};

export default function SuperAdminAppointments() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab"); // 'all' | 'doctor' | 'lab' | 'refunds'
  const initialType =
    tabParam === "doctor"
      ? "consult"
      : tabParam === "lab"
      ? "test"
      : tabParam === "refunds"
      ? "refunds"
      : "all";
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [tabCounts, setTabCounts] = useState({ total: 0, doctor: 0, lab: 0, refunds: 0 });

  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // ─── Detail Modal ───────────────────────────────────────────
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // ─── Reschedule ─────────────────────────────────────────────
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [saving, setSaving] = useState(false);

  // ─── Book Modal ─────────────────────────────────────────────
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookForm, setBookForm] = useState({
    patientName: "",
    patientPhone: "",
    email: "",
    hospitalId: "",
    date: "",
    time: "",
    petName: "",
    species: "",
    description: "",
    appointmentType: "Consult",
  });
  const [bookErrors, setBookErrors] = useState({});
  const [hospitals, setHospitals] = useState([]);

  // ─── Feedback Modal ─────────────────────────────────────────
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAppt, setFeedbackAppt] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(u);
    if (parsed.role !== "superadmin") {
      navigate("/");
      return;
    }
    setUser(parsed);
    fetchHospitals();
    fetchTabCounts();
  }, [navigate]);

  useEffect(() => {
    if (tabParam === "doctor") {
      setTypeFilter("consult");
    } else if (tabParam === "lab") {
      setTypeFilter("test");
    } else if (tabParam === "refunds") {
      setTypeFilter("refunds");
    } else {
      setTypeFilter("all");
    }
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    if (newTab === "doctor") {
      setTypeFilter("consult");
      setSearchParams({ tab: "doctor" });
    } else if (newTab === "lab") {
      setTypeFilter("test");
      setSearchParams({ tab: "lab" });
    } else if (newTab === "refunds") {
      setTypeFilter("refunds");
      setSearchParams({ tab: "refunds" });
    } else {
      setTypeFilter("all");
      setSearchParams({});
    }
    setPage(1);
  };

  const fetchTabCounts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/stats/overview`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setTabCounts({
        total: data.bookings?.total ?? 0,
        doctor: data.bookings?.consultations?.total ?? 0,
        lab: data.bookings?.labTests?.total ?? 0,
        refunds: data.refunds?.totalCount ?? 0
      });
    } catch {}
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchTabCounts();
    }
  }, [user, page, statusFilter, typeFilter, debouncedSearch]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: PER_PAGE,
        status: statusFilter,
        type: typeFilter,
        search: debouncedSearch
      });
      const res = await fetch(`${API_URL}/api/appointments?${queryParams.toString()}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok)
        return toast.error(data.message || "Failed to load appointments");
      const list = Array.isArray(data.appointments) ? data.appointments : (Array.isArray(data) ? data : []);
      setAppointments(list);
      setTotal(typeof data.total === 'number' ? data.total : list.length);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      const data = await res.json();
      setHospitals(Array.isArray(data) ? data : data.hospitals || []);
    } catch {
      setHospitals([]);
    }
  };

  // ─── View Details ───────────────────────────────────────────
  const openDetail = (appt) => {
    setSelectedAppt(appt);
    setShowDetailModal(true);
  };

  // ─── Reschedule ─────────────────────────────────────────────
  const openReschedule = () => {
    if (!selectedAppt) return;
    setRescheduleForm({
      date: selectedAppt.date || "",
      time: selectedAppt.time || "",
    });
    setShowRescheduleModal(true);
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleForm.date || !rescheduleForm.time) {
      return toast.error("Please select a new date and time");
    }
    setSaving(true);
    try {
      const res = await fetch(
        `${API_URL}/api/appointments/${selectedAppt.id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            date: rescheduleForm.date,
            time: rescheduleForm.time,
            status: "Rescheduled",
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Reschedule failed");
      toast.success("Appointment rescheduled");
      setShowRescheduleModal(false);
      setShowDetailModal(false);
      fetchAppointments();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Complete ──────────────────────────────────────────────
  const handleComplete = async () => {
    if (!selectedAppt) return;
    if (!confirm(`Mark "${selectedAppt.patientName}" as Completed?`)) return;
    try {
      const res = await fetch(
        `${API_URL}/api/appointments/${selectedAppt.id}/status`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ status: "Completed" }),
        },
      );
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Failed to complete");
      toast.success("Appointment completed");
      setShowDetailModal(false);
      fetchAppointments();
    } catch {
      toast.error("Network error");
    }
  };

  // ─── Cancel ─────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!selectedAppt) return;
    if (!confirm(`Cancel appointment for "${selectedAppt.patientName}"?`))
      return;
    try {
      const res = await fetch(
        `${API_URL}/api/appointments/${selectedAppt.id}/status`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ status: "Cancelled" }),
        },
      );
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Failed to cancel");
      toast.success("Appointment cancelled");
      setShowDetailModal(false);
      fetchAppointments();
    } catch {
      toast.error("Network error");
    }
  };

  // ─── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedAppt) return;
    if (
      !confirm(
        `Permanently delete appointment for "${selectedAppt.patientName}"?`,
      )
    )
      return;

    const targetId = selectedAppt.id;
    const targetNum = selectedAppt.appointment_number;
    setShowDetailModal(false);
    setAppointments((prev) =>
      prev.filter(
        (a) =>
          String(a.id) !== String(targetId) &&
          String(a.appointment_number) !== String(targetNum) &&
          String(a.appointment_number) !== String(targetId)
      )
    );
    setTotal((prev) => Math.max(0, prev - 1));

    try {
      const res = await fetch(
        `${API_URL}/api/appointments/${targetId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        fetchAppointments();
        return toast.error(data.message || "Failed to delete");
      }
      toast.success("Appointment deleted successfully");
      fetchAppointments();
      fetchTabCounts();
    } catch {
      fetchAppointments();
      toast.error("Network error");
    }
  };

  // ─── Quick Delete ───────────────────────────────────────────
  const handleQuickDelete = async (appt) => {
    if (!confirm(`Permanently delete appointment for "${appt.patientName}"?`))
      return;

    const targetId = appt.id;
    const targetNum = appt.appointment_number;
    setAppointments((prev) =>
      prev.filter(
        (a) =>
          String(a.id) !== String(targetId) &&
          String(a.appointment_number) !== String(targetNum) &&
          String(a.appointment_number) !== String(targetId)
      )
    );
    setTotal((prev) => Math.max(0, prev - 1));

    try {
      const res = await fetch(`${API_URL}/api/appointments/${targetId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        fetchAppointments();
        return toast.error(data.message || "Failed to delete");
      }
      toast.success("Appointment deleted successfully");
      fetchAppointments();
      fetchTabCounts();
    } catch {
      fetchAppointments();
      toast.error("Network error");
    }
  };

  // ─── Feedback ───────────────────────────────────────────────
  const openFeedback = (appt) => {
    setFeedbackAppt(appt);
    setFeedbackText("");
    setShowFeedbackModal(true);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return toast.error("Please enter feedback");
    setFeedbackSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/appointment-feedbacks`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          patientName: feedbackAppt.patientName,
          petName: feedbackAppt.petName,
          appointmentType: feedbackAppt.appointmentType,
          date: feedbackAppt.date,
          time: feedbackAppt.time,
          feedbackStatus: "Published",
          feedbackGiven: true,
          feedbackText: feedbackText,
          callAttempted: false,
          callPicked: false,
          appointmentId: feedbackAppt.id,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        return toast.error(data.message || "Failed to save feedback");
      toast.success("Feedback added");
      setShowFeedbackModal(false);
      fetchAppointments();
    } catch {
      toast.error("Network error");
    } finally {
      setFeedbackSaving(false);
    }
  };

  // ─── Book Modal ─────────────────────────────────────────────
  const openBookModal = () => {
    setBookForm({
      patientName: "",
      patientPhone: "",
      email: "",
      hospitalId: "",
      date: "",
      time: "",
      petName: "",
      species: "",
      description: "",
      appointmentType: "Consult",
    });
    setBookErrors({});
    setShowBookModal(true);
  };

  const validateBookForm = () => {
    const errors = {};
    if (!bookForm.patientName.trim())
      errors.patientName = "Patient name is required";
    if (!bookForm.patientPhone.trim())
      errors.patientPhone = "Mobile number is required";
    else if (!/^\d{10}$/.test(bookForm.patientPhone.trim()))
      errors.patientPhone = "Enter a valid 10-digit mobile number";
    if (!bookForm.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookForm.email.trim()))
      errors.email = "Please enter a valid email address";
    if (!bookForm.hospitalId) errors.hospitalId = "Please select a hospital";
    if (!bookForm.date) errors.date = "Date is required";
    if (!bookForm.time) errors.time = "Time is required";
    setBookErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitBook = async (e) => {
    e.preventDefault();
    if (!validateBookForm())
      return toast.error("Please fix the booking fields");
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Could not book appointment");
        return;
      }
      toast.success("Appointment booked successfully");
      setShowBookModal(false);
      fetchAppointments();
    } catch (err) {
      console.error("SuperAdmin book appointment failed:", err);
      toast.error("Network error while booking");
    } finally {
      setSaving(false);
    }
  };

  // Server-side pagination, status filtering, and debounced search are used instead of client-side filtering

  return (
    <DashboardLayout
      title="Super Admin Dashboard"
      subtitle="System-wide overview and management."
      user={user}
      showHeader={false}
    >
      <DashboardTabs role="superadmin" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="w-full "
      >
      <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100">
        
        {/* ─── Master Section Tabs ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/70">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                typeFilter === "all"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <ClipboardList size={16} />
              <span>All Bookings</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  typeFilter === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 text-slate-700"
                }`}
              >
                {tabCounts.total || total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("doctor")}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                typeFilter === "consult"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Stethoscope size={16} />
              <span>Doctor Appointments</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  typeFilter === "consult"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 text-slate-700"
                }`}
              >
                {tabCounts.doctor || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("lab")}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                typeFilter === "test"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-500/20 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <TestTube size={16} />
              <span>Lab Test Appointments</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  typeFilter === "test"
                    ? "bg-white/20 text-white"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {tabCounts.lab || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("refunds")}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                typeFilter === "refunds"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <RotateCcw size={16} />
              <span>Refunds &amp; Settlements</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  typeFilter === "refunds"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {tabCounts.refunds || 0}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {typeFilter === "test" ? (
              <Link
                to="/superadmin/services"
                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs"
              >
                <Sparkles size={14} /> Manage Lab Catalog
              </Link>
            ) : typeFilter === "refunds" ? (
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-bold">
                <Receipt size={14} /> 10% Fee Deductions Active
              </div>
            ) : (
              <button
                onClick={openBookModal}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all duration-200"
              >
                <CalendarPlus size={16} /> Book Appointment
              </button>
            )}
          </div>
        </div>

        {/* ─── Section Header & Filter Controls ───────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {typeFilter === "test" && <TestTube className="text-rose-600" size={24} />}
              {typeFilter === "consult" && <Stethoscope className="text-blue-600" size={24} />}
              {typeFilter === "refunds" && <RotateCcw className="text-emerald-600" size={24} />}
              {typeFilter === "all" && <ClipboardList className="text-slate-700" size={24} />}
              {typeFilter === "test"
                ? "Lab Test Appointments"
                : typeFilter === "consult"
                ? "Doctor Appointments"
                : typeFilter === "refunds"
                ? "System Refunds & Settlements"
                : "All System Appointments"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {typeFilter === "test"
                ? "Showing diagnostic orders, animal lab tests, and sample collections booked by users."
                : typeFilter === "consult"
                ? "Showing patient doctor consultations booked from the main website portal and user dashboard."
                : typeFilter === "refunds"
                ? "Showing all cancelled bookings with processed Stripe / Razorpay refunds and 10% fee deductions."
                : "Combined master view of all doctor consultations and lab diagnostic bookings."}
              {" "}
              <span className="text-blue-600 font-bold">
                ({appointments.length} showing of {total} total)
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  typeFilter === "test"
                    ? "Search test, patient, pet..."
                    : typeFilter === "refunds"
                    ? "Search refund ID, patient, reason..."
                    : "Search patient, doctor, pet..."
                }
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="relative flex items-center">
              <Filter
                className="absolute left-3.5 text-slate-400 pointer-events-none"
                size={15}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 text-sm bg-slate-50/80 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 appearance-none"
              >
                <option value="all">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                fetchAppointments();
                fetchTabCounts();
              }}
              className="p-2.5 border border-slate-200/80 rounded-2xl text-slate-600 hover:bg-slate-50 active:bg-slate-100 hover:border-slate-300 flex items-center justify-center transition shrink-0"
              title="Refresh Appointments"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* ─── Table ───────────────────────────────────────────── */}
        {loading ? (
          <TableSkeleton rows={6} cols={typeFilter === "test" ? 11 : 10} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/70 shadow-xs">
            <table className="w-full text-left border-collapse min-w-[1200px] text-sm">
              <thead>
                {typeFilter === "test" ? (
                  <tr className="bg-rose-50/70 text-rose-800 text-xs font-bold uppercase tracking-wider border-b border-rose-200/80">
                    <th className="py-3.5 px-3">Order #</th>
                    <th className="py-3.5 px-3">Patient Details</th>
                    <th className="py-3.5 px-3">Pet Details</th>
                    <th className="py-3.5 px-3">Diagnostic Test</th>
                    <th className="py-3.5 px-3">Sample Required</th>
                    <th className="py-3.5 px-3">Turnaround</th>
                    <th className="py-3.5 px-3">Fee</th>
                    <th className="py-3.5 px-3">Hospital</th>
                    <th className="py-3.5 px-3">Schedule</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3 text-right">Action</th>
                  </tr>
                ) : typeFilter === "refunds" ? (
                  <tr className="bg-emerald-50/80 text-emerald-900 text-xs font-bold uppercase tracking-wider border-b border-emerald-200/80">
                    <th className="py-3.5 px-3">APP # &amp; REF ID</th>
                    <th className="py-3.5 px-3">Patient &amp; Contact</th>
                    <th className="py-3.5 px-3">Service / Test</th>
                    <th className="py-3.5 px-3">Hospital</th>
                    <th className="py-3.5 px-3">Paid Amount</th>
                    <th className="py-3.5 px-3">10% Fee Retained</th>
                    <th className="py-3.5 px-3">Net Refund</th>
                    <th className="py-3.5 px-3">Cancellation Reason</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3 text-right">Action</th>
                  </tr>
                ) : typeFilter === "consult" ? (
                  <tr className="bg-blue-50/70 text-blue-800 text-xs font-bold uppercase tracking-wider border-b border-blue-200/80">
                    <th className="py-3.5 px-3">APP #</th>
                    <th className="py-3.5 px-3">Patient Details</th>
                    <th className="py-3.5 px-3">Pet Name</th>
                    <th className="py-3.5 px-3">Doctor / Reason</th>
                    <th className="py-3.5 px-3">Hospital</th>
                    <th className="py-3.5 px-3">Schedule</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Feedback</th>
                    <th className="py-3.5 px-3">Call Status</th>
                    <th className="py-3.5 px-3 text-right">Action</th>
                  </tr>
                ) : (
                  <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3.5 px-3">APP #</th>
                    <th className="py-3.5 px-3">Patient Details</th>
                    <th className="py-3.5 px-3">Pet Name</th>
                    <th className="py-3.5 px-3">Type</th>
                    <th className="py-3.5 px-3">Schedule</th>
                    <th className="py-3.5 px-3">Hospital</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Feedback</th>
                    <th className="py-3.5 px-3">Call Status</th>
                    <th className="py-3.5 px-3 text-right">Action</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {appointments.map((a, idx) => {
                  const isLab = a.appointmentType === "Lab Test" || Boolean(a.serviceName);

                  if (typeFilter === "refunds") {
                    const paidAmt = Number(a.paymentAmount || a.servicePrice || 0);
                    const feeAmt = Number(a.cancellationFee || (paidAmt * 0.10) || 0);
                    const netRefund = Number(a.refundAmount || (paidAmt - feeAmt) || 0);
                    const isRazorpay = String(a.paymentMethod || '').toLowerCase().includes('razorpay') ||
                                      (a.paymentId && String(a.paymentId).startsWith('pay_'));

                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-emerald-50/40 transition-colors group"
                      >
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-extrabold text-slate-900 text-xs">
                              #{a.appointment_number}
                            </span>
                            {a.refundId ? (
                              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200/80 w-fit">
                                {a.refundId}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No Ref ID</span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">
                              Via {isRazorpay ? "Razorpay" : "Stripe"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{a.patientName}</span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              {a.patientPhone && <span>{a.patientPhone}</span>}
                              {a.email && <span className="truncate max-w-[130px]">{a.email}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs">
                              {isLab ? (a.serviceName || "Diagnostic Test") : (a.doctorName ? `Dr. ${a.doctorName}` : "Consultation")}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Scheduled: {a.date} ({a.time})
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600 font-medium">
                          {a.hospital || "—"}
                        </td>
                        <td className="py-3.5 px-3 text-xs font-bold text-slate-800">
                          ₹{paidAmt}
                        </td>
                        <td className="py-3.5 px-3 text-xs font-bold text-amber-700">
                          -₹{feeAmt}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-block text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200">
                            ₹{netRefund}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 max-w-[160px]">
                          <p className="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded-lg line-clamp-2">
                            {a.cancellationReason || "Cancelled"}
                          </p>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            a.refundStatus === "Refunded" || netRefund > 0
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-slate-200 text-slate-700"
                          }`}>
                            <CheckCircle2 size={11} />
                            {a.refundStatus || (netRefund > 0 ? "Refunded" : "No Refund")}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDetail(a)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 transition"
                              title="View Settlement Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleQuickDelete(a)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"
                              title="Delete Record"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }

                  if (typeFilter === "test") {
                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-rose-50/40 transition-colors group"
                      >
                        <td className="py-3.5 px-3 font-extrabold text-rose-950">
                          <div>#{a.appointment_number}</div>
                          {(a.paymentId || a.stripe_session_id || a.paymentMethod) && (
                            <div className="text-[10px] text-slate-500 font-normal mt-1">
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <CreditCard size={10} /> {a.paymentMethod || 'Paid'}
                              </span>
                              <span className="block font-mono text-[9px] text-slate-400 truncate max-w-[120px] mt-0.5" title={a.paymentId || a.stripe_session_id}>
                                Txn: {a.paymentId || a.stripe_session_id}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{a.patientName}</span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              {a.patientPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={11} /> {a.patientPhone}
                                </span>
                              )}
                              {a.email && (
                                <span className="flex items-center gap-1">
                                  <Mail size={11} /> {a.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <PawPrint size={13} className="text-slate-400" />
                              {a.petName || "—"}
                            </span>
                            {a.species && (
                              <span className="text-xs text-slate-400 ml-4">
                                {a.species} {a.breed ? `(${a.breed})` : ""}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-xs">
                              {a.serviceName || a.reason || "Diagnostic Lab Test"}
                            </span>
                            {a.serviceCategory && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-md w-fit mt-0.5">
                                <TestTube size={10} className="text-rose-600" />
                                {a.serviceCategory}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <Droplet size={11} className="text-rose-500" />
                            {a.sampleType || "Specimen"}
                          </span>
                          {a.fastingRequired && (
                            <span className="block text-[10px] text-amber-700 font-bold mt-0.5">
                              ⚡ Fasting Req
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600 font-medium">
                          {a.turnaroundTime || "Same Day"}
                        </td>
                        <td className="py-3.5 px-3 text-xs font-extrabold text-slate-900">
                          ₹{a.servicePrice || a.paymentAmount || 500}
                        </td>
                        <td className="py-3.5 px-3 text-xs font-medium text-slate-700">
                          {a.hospital || "—"}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-blue-700">{a.date || "—"}</span>
                            <span className="text-xs font-medium text-blue-600">{a.time || "—"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={a.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                const res = await fetch(`${API_URL}/api/appointments/${a.id}/status`, {
                                  method: "PUT",
                                  headers: authHeaders(),
                                  body: JSON.stringify({ status: newStatus }),
                                });
                                const data = await res.json();
                                if (res.ok) {
                                  toast.success(`Status updated to ${newStatus}`);
                                  fetchAppointments();
                                } else {
                                  toast.error(data.message || "Failed to update status");
                                }
                              } catch {
                                toast.error("Network error");
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer outline-none transition ${statusColors[a.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDetail(a)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleQuickDelete(a)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }

                  if (typeFilter === "consult") {
                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="py-3.5 px-3 font-bold text-slate-800">
                          <div>#{a.appointment_number}</div>
                          {(a.paymentId || a.stripe_session_id || a.paymentMethod) && (
                            <div className="text-[10px] text-slate-500 font-normal mt-1">
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <CreditCard size={10} /> {a.paymentMethod || 'Paid'}
                              </span>
                              <span className="block font-mono text-[9px] text-slate-400 truncate max-w-[120px] mt-0.5" title={a.paymentId || a.stripe_session_id}>
                                Txn: {a.paymentId || a.stripe_session_id}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{a.patientName}</span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              {a.patientPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={11} /> {a.patientPhone}
                                </span>
                              )}
                              {a.email && (
                                <span className="flex items-center gap-1">
                                  <Mail size={11} /> {a.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{a.petName || "—"}</span>
                            {a.species && <span className="text-xs text-slate-400">{a.species}</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-xs">
                              {a.doctorName || "Assigned Doctor"}
                            </span>
                            {a.reason && (
                              <span className="text-xs text-slate-400 truncate max-w-[170px] mt-0.5">
                                {a.reason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-xs font-medium text-slate-700">
                          {a.hospital || "—"}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-blue-700">{a.date || "—"}</span>
                            <span className="text-xs font-medium text-blue-600">{a.time || "—"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={a.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                const res = await fetch(`${API_URL}/api/appointments/${a.id}/status`, {
                                  method: "PUT",
                                  headers: authHeaders(),
                                  body: JSON.stringify({ status: newStatus }),
                                });
                                const data = await res.json();
                                if (res.ok) {
                                  toast.success(`Status updated to ${newStatus}`);
                                  fetchAppointments();
                                } else {
                                  toast.error(data.message || "Failed to update status");
                                }
                              } catch {
                                toast.error("Network error");
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer outline-none transition ${statusColors[a.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-3">
                          {a.feedback ? (
                            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                              <Check size={12} /> Given
                            </span>
                          ) : (
                            <button
                              onClick={() => openFeedback(a)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              <FileText size={12} /> Add Feedback
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          {a.callStatus === "called" ? (
                            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                              <Check size={12} /> Called
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <AlertCircle size={12} /> Not called
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDetail(a)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleQuickDelete(a)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }

                  // Default 'all' row
                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        <div>#{a.appointment_number}</div>
                        {(a.paymentId || a.stripe_session_id || a.paymentMethod) && (
                          <div className="text-[10px] text-slate-500 font-normal mt-1">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <CreditCard size={10} /> {a.paymentMethod || 'Paid'}
                            </span>
                            <span className="block font-mono text-[9px] text-slate-400 truncate max-w-[120px] mt-0.5" title={a.paymentId || a.stripe_session_id}>
                              Txn: {a.paymentId || a.stripe_session_id}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{a.patientName}</span>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {a.patientPhone && (
                              <span className="flex items-center gap-1">
                                <Phone size={11} /> {a.patientPhone}
                              </span>
                            )}
                            {a.email && (
                              <span className="flex items-center gap-1">
                                <Mail size={11} /> {a.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">{a.petName || "—"}</span>
                          {a.species && <span className="text-xs text-slate-400">{a.species}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        {isLab ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg text-xs font-bold w-fit">
                              <TestTube size={11} className="text-rose-600" />
                              {a.serviceCategory || "Lab Test"}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[170px] mt-0.5">
                              {a.serviceName || a.reason || "Diagnostic Test"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-lg text-xs font-semibold w-fit">
                              <Stethoscope size={11} className="text-blue-600" />
                              {a.appointmentType || "Consult"}
                            </span>
                            {a.doctorName && (
                              <span className="text-[11px] text-slate-500 truncate max-w-[150px] mt-0.5">
                                {a.doctorName}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-blue-700">{a.date || "—"}</span>
                          <span className="text-xs font-medium text-blue-600">{a.time || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-xs font-medium text-slate-700">
                        {a.hospital || "—"}
                      </td>
                      <td className="py-3.5 px-3">
                        <select
                          value={a.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              const res = await fetch(`${API_URL}/api/appointments/${a.id}/status`, {
                                method: "PUT",
                                headers: authHeaders(),
                                body: JSON.stringify({ status: newStatus }),
                              });
                              const data = await res.json();
                              if (res.ok) {
                                toast.success(`Status updated to ${newStatus}`);
                                fetchAppointments();
                              } else {
                                toast.error(data.message || "Failed to update status");
                              }
                            } catch {
                              toast.error("Network error");
                            }
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer outline-none transition ${statusColors[a.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-3">
                        {a.feedback ? (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <Check size={12} /> Given
                          </span>
                        ) : (
                          <button
                            onClick={() => openFeedback(a)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <FileText size={12} /> Add Feedback
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {a.callStatus === "called" ? (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <Check size={12} /> Called
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <AlertCircle size={12} /> Not called
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(a)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleQuickDelete(a)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}

                {appointments.length === 0 && (
                  <tr>
                    <td
                      colSpan={typeFilter === "test" ? 11 : 10}
                      className="py-12 text-center text-slate-400 font-medium italic"
                    >
                      {search || statusFilter !== "all"
                        ? "No appointments matching the search/filter criteria."
                        : typeFilter === "test"
                        ? "No lab test appointments found."
                        : "No appointments found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

          <div className="mt-6">
            <Pagination
              page={page}
              total={total}
              perPage={PER_PAGE}
              onChange={setPage}
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Detail Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showDetailModal && selectedAppt && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-100"
            >
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <User size={20} className="text-blue-500" />
                    {selectedAppt.patientName}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Appointment #{selectedAppt.appointment_number}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Lab Test Notice Banner */}
              {(selectedAppt.serviceName || selectedAppt.appointmentType === "Lab Test") && (
                <div className="mb-5 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-start gap-3">
                  <TestTube className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1 w-full">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-rose-900 text-sm">
                          {selectedAppt.serviceName || "Diagnostic Test"}
                        </span>
                        <span className="bg-rose-200/80 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {selectedAppt.serviceCategory || "Lab Diagnostic Test"}
                        </span>
                      </div>
                      {selectedAppt.servicePrice && (
                        <span className="font-extrabold text-rose-950 text-sm">
                          ₹{selectedAppt.servicePrice}
                        </span>
                      )}
                    </div>
                    {selectedAppt.sampleType && (
                      <p className="text-rose-800">
                        <strong>Required Sample:</strong> {selectedAppt.sampleType}
                      </p>
                    )}
                    {selectedAppt.turnaroundTime && (
                      <p className="text-rose-800">
                        <strong>Turnaround Time:</strong> {selectedAppt.turnaroundTime}
                      </p>
                    )}
                    {selectedAppt.fastingRequired && (
                      <p className="text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg font-semibold mt-1">
                        ⚡ {selectedAppt.fastingDetails || "Fasting required before sample collection."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-2">
                  <Phone size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.patientPhone || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Email
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Hospital size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Hospital
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.hospital || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Date
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.date || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Time
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.time || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <PawPrint size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Pet
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.petName || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <PawPrint size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Species
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.species || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <PawPrint size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Sex
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.sex || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <PawPrint size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Breed
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.breed || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <Stethoscope size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Appointment Type
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.appointmentType || "Consult"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MessageSquare size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Reason
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedAppt.reason || "No reason provided"}
                    </p>
                  </div>
                </div>

                {/* 💳 Payment & Stripe Transaction Details */}
                <div className="sm:col-span-2 p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-blue-600" />
                      <span className="font-bold text-slate-800 text-sm">Payment &amp; Transaction Details</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      String(selectedAppt.paymentStatus).toLowerCase() === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {selectedAppt.paymentStatus || 'Paid'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Amount Paid</p>
                      <p className="text-sm font-extrabold text-slate-900">
                        ₹{selectedAppt.paymentAmount || selectedAppt.servicePrice || 500}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</p>
                      <p className="text-xs font-semibold text-slate-800">
                        {selectedAppt.paymentMethod || 'Stripe Card / Online Gateway'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Gateway Transaction / Payment ID</p>
                      <p className="text-xs font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 select-all break-all mt-0.5">
                        {selectedAppt.paymentId || selectedAppt.stripe_session_id || `ST_${selectedAppt.id}`}
                      </p>
                    </div>
                    {selectedAppt.stripe_session_id && selectedAppt.stripe_session_id !== selectedAppt.paymentId && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Stripe Checkout Session ID</p>
                        <p className="text-xs font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 select-all break-all mt-0.5">
                          {selectedAppt.stripe_session_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAppt.status === "Cancelled" && (
                  <div className="sm:col-span-2 p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs space-y-1">
                    <p className="font-extrabold text-rose-900">🚫 Cancellation & Refund Record</p>
                    {selectedAppt.cancellationReason && (
                      <p className="text-rose-800">
                        <strong>Reason:</strong> {selectedAppt.cancellationReason}
                      </p>
                    )}
                    {Number(selectedAppt.refundAmount) > 0 && (
                      <p className="text-emerald-800 font-bold">
                        Net Refund: ₹{Number(selectedAppt.refundAmount).toFixed(2)} (10% Fee: ₹{Number(selectedAppt.cancellationFee || 0).toFixed(2)}) • {selectedAppt.refundStatus || "Refunded"}
                      </p>
                    )}
                    {selectedAppt.refundId && (
                      <p className="text-slate-600 font-mono text-[11px]">
                        Stripe/Ref ID: {selectedAppt.refundId}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-start gap-2 sm:col-span-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Status
                    </p>
                    <select
                      value={selectedAppt.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          const res = await fetch(`${API_URL}/api/appointments/${selectedAppt.id}/status`, {
                            method: "PUT",
                            headers: authHeaders(),
                            body: JSON.stringify({ status: newStatus }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            toast.success(`Status updated to ${newStatus}`);
                            setSelectedAppt((prev) => prev ? { ...prev, status: newStatus } : null);
                            fetchAppointments();
                          } else {
                            toast.error(data.message || "Failed to update status");
                          }
                        } catch {
                          toast.error("Network error");
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer outline-none transition ${statusColors[selectedAppt.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                {selectedAppt.status !== "Completed" &&
                  selectedAppt.status !== "Cancelled" && (
                    <>
                      <button
                        onClick={openReschedule}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                      >
                        <CalendarClock size={16} /> Reschedule
                      </button>
                      <button
                        onClick={handleComplete}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                      >
                        <CheckCircle2 size={16} /> Complete
                      </button>
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                    </>
                  )}
                {(selectedAppt.status === "Cancelled" ||
                  selectedAppt.status === "Completed") && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Reschedule Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showRescheduleModal && selectedAppt && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Reschedule
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedAppt.patientName}
                  </p>
                </div>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={submitReschedule} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    New Date *
                  </label>
                  <input
                    type="date"
                    value={rescheduleForm.date}
                    onChange={(e) =>
                      setRescheduleForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
                    <span>New Time Slot *</span>
                    {rescheduleForm.time && (
                      <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Selected: {rescheduleForm.time}
                      </span>
                    )}
                  </label>
                  <div className="mt-1 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <SlotSelector
                      date={rescheduleForm.date}
                      hospitalId={selectedAppt?.hospitalId}
                      selectedTime={rescheduleForm.time || '10:00'}
                      onSelectTime={(slot) =>
                        setRescheduleForm((f) => ({ ...f, time: slot }))
                      }
                      showClock={true}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(false)}
                    className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-xl font-semibold shadow-md shadow-amber-500/20 disabled:opacity-60 hover:bg-amber-700 transition"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <CalendarClock className="w-4 h-4" />
                    )}
                    {saving ? "Saving…" : "Reschedule"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Feedback Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showFeedbackModal && feedbackAppt && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowFeedbackModal(false)}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Add Feedback
                  </h3>
                  <p className="text-sm text-slate-500">
                    {feedbackAppt.patientName} – #
                    {feedbackAppt.appointment_number}
                  </p>
                </div>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={submitFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Feedback *
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    placeholder="Write your feedback here..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackSaving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 disabled:opacity-60 hover:bg-blue-700 transition"
                  >
                    {feedbackSaving ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {feedbackSaving ? "Saving…" : "Add Feedback"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Book Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showBookModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowBookModal(false)}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Book New Appointment
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Create a direct booking on behalf of a patient.
                  </p>
                </div>
                <button
                  onClick={() => setShowBookModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={submitBook} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Select Hospital *
                    </label>
                    <select
                      value={bookForm.hospitalId}
                      onChange={(e) =>
                        setBookForm((f) => ({
                          ...f,
                          hospitalId: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    >
                      <option value="">Choose hospital</option>
                      {hospitals.map((h) => (
                        <option key={h.id} value={String(h.id)}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                    {bookErrors.hospitalId && (
                      <p className="mt-1.5 text-xs text-rose-600 font-medium">
                        {bookErrors.hospitalId}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={bookForm.patientName}
                      onChange={(e) =>
                        setBookForm((f) => ({
                          ...f,
                          patientName: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                    {bookErrors.patientName && (
                      <p className="mt-1.5 text-xs text-rose-600 font-medium">
                        {bookErrors.patientName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={bookForm.patientPhone}
                      onChange={(e) =>
                        setBookForm((f) => ({
                          ...f,
                          patientPhone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      placeholder="10-digit number"
                    />
                    {bookErrors.patientPhone && (
                      <p className="mt-1.5 text-xs text-rose-600 font-medium">
                        {bookErrors.patientPhone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={bookForm.email}
                      onChange={(e) =>
                        setBookForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      placeholder="Required"
                    />
                    {bookErrors.email && (
                      <p className="mt-1.5 text-xs text-rose-600 font-medium">
                        {bookErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={bookForm.date}
                      onChange={(e) =>
                        setBookForm((f) => ({ ...f, date: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                    {bookErrors.date && (
                      <p className="mt-1.5 text-xs text-rose-600 font-medium">
                        {bookErrors.date}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
                      <span>Time Slot *</span>
                      {bookForm.time && (
                        <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          Selected: {bookForm.time}
                        </span>
                      )}
                    </label>
                    <div className="mt-1 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
                      <SlotSelector
                        date={bookForm.date}
                        hospitalId={bookForm.hospitalId}
                        selectedTime={bookForm.time || '10:00'}
                        onSelectTime={(slot) =>
                          setBookForm((f) => ({ ...f, time: slot }))
                        }
                        showClock={true}
                      />
                    </div>
                    {bookErrors.time && (
                      <p className="mt-1.5 text-xs text-rose-600 font-medium">
                        {bookErrors.time}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Pet Name
                    </label>
                    <input
                      type="text"
                      value={bookForm.petName}
                      onChange={(e) =>
                        setBookForm((f) => ({ ...f, petName: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Species
                    </label>
                    <input
                      type="text"
                      value={bookForm.species}
                      onChange={(e) =>
                        setBookForm((f) => ({ ...f, species: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Description
                    </label>
                    <textarea
                      value={bookForm.description}
                      onChange={(e) =>
                        setBookForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      placeholder="Optional booking notes"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 disabled:opacity-60 hover:bg-blue-700 transition"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <CalendarPlus className="w-4 h-4" />
                    )}
                    {saving ? "Booking…" : "Book Appointment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
