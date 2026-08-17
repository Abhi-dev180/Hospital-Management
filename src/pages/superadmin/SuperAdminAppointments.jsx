
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  }, [navigate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, page, statusFilter, debouncedSearch]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: PER_PAGE,
        status: statusFilter,
        search: debouncedSearch
      });
      const res = await fetch(`${API_URL}/api/appointments?${queryParams.toString()}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok)
        return toast.error(data.message || "Failed to load appointments");
      setAppointments(data.appointments || []);
      setTotal(data.total || 0);
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
    try {
      const res = await fetch(
        `${API_URL}/api/appointments/${selectedAppt.id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Failed to delete");
      toast.success("Appointment deleted");
      setShowDetailModal(false);
      fetchAppointments();
    } catch {
      toast.error("Network error");
    }
  };

  // ─── Quick Delete ───────────────────────────────────────────
  const handleQuickDelete = async (appt) => {
    if (!confirm(`Permanently delete appointment for "${appt.patientName}"?`))
      return;
    try {
      const res = await fetch(`${API_URL}/api/appointments/${appt.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Failed to delete");
      toast.success("Appointment deleted");
      fetchAppointments();
    } catch {
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
<div className="bg-white/80 backdrop-blur-xl p-3 sm:p-2 lg:p-5 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100">          {/* ─── Header ─────────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                All Appointments
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Showing{" "}
                <span className="text-blue-600 font-bold">
                  {appointments.length}
                </span>{" "}
                of {total} total entries
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
                  placeholder="Search patient, pet, hospital..."
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
                onClick={fetchAppointments}
                className="p-2.5 border border-slate-200/80 rounded-2xl text-slate-600 hover:bg-slate-50 active:bg-slate-100 hover:border-slate-300 flex items-center justify-center transition shrink-0"
                title="Refresh Appointments"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* ─── Table ───────────────────────────────────────────── */}
          {loading ? (
            <TableSkeleton rows={6} cols={9} />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/70 shadow-xs">
              <table className="w-full text-left border-collapse min-w-[1200px] text-sm">
                <thead>
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
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {appointments.map((a, idx) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        #{a.appointment_number}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {a.patientName}
                          </span>
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
                          <span className="font-medium text-slate-700">
                            {a.petName || "—"}
                          </span>
                          {a.species && (
                            <span className="text-xs text-slate-400">
                              {a.species}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                          {a.appointmentType || "Consult"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-blue-700">
                            {a.date || "—"}
                          </span>
                          <span className="text-xs font-medium text-blue-600">
                            {a.time || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-xs font-medium text-slate-700">
                          {a.hospital || "—"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[a.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}
                        >
                          {a.status}
                        </span>
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
                  ))}

                  {appointments.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-12 text-center text-slate-400 font-medium italic"
                      >
                        No appointments matching the search criteria.
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
                <div className="flex items-start gap-2 sm:col-span-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusColors[selectedAppt.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}
                    >
                      {selectedAppt.status}
                    </span>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    New Time *
                  </label>
                  <input
                    type="time"
                    value={rescheduleForm.time}
                    onChange={(e) =>
                      setRescheduleForm((f) => ({ ...f, time: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    required
                  />
                  {rescheduleForm.date && selectedAppt?.hospitalId && (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                      <SlotSelector
                        date={rescheduleForm.date}
                        hospitalId={selectedAppt.hospitalId}
                        selectedTime={rescheduleForm.time}
                        onSelectTime={(slot) =>
                          setRescheduleForm((f) => ({ ...f, time: slot }))
                        }
                      />
                    </div>
                  )}
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={bookForm.time}
                      onChange={(e) =>
                        setBookForm((f) => ({ ...f, time: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                    {bookErrors.time && (
                      <p className="mt-1.5 text-xs text-rose-600 font-medium">
                        {bookErrors.time}
                      </p>
                    )}
                    {bookForm.date && bookForm.hospitalId && (
                      <div className="mt-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                        <SlotSelector
                          date={bookForm.date}
                          hospitalId={bookForm.hospitalId}
                          selectedTime={bookForm.time}
                          onSelectTime={(slot) =>
                            setBookForm((f) => ({ ...f, time: slot }))
                          }
                        />
                      </div>
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
