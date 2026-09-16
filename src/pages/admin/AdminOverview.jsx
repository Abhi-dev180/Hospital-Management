import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import DashboardTabs from '../../components/DashboardTabs';
import {
  PhoneCall,
  MessageSquare,
  FileText,
  Activity,
  ClipboardList,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  RotateCcw,
  Receipt,
  CreditCard,
  TestTube,
  Stethoscope,
  ArrowRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { StatSkeleton, SectionLoader } from '../../components/Loader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

export default function AdminOverview() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [calls, setCalls] = useState([]);
  const [transcriptions, setTranscriptions] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast.error('Admin not logged in');
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [
        appointmentsRes,
        feedbacksRes,
        callsRes,
        transcriptionsRes,
        hospitalsRes
      ] = await Promise.all([
        fetch(`${API_URL}/api/appointments`, { headers }),
        fetch(`${API_URL}/api/appointment-feedbacks`, { headers }),
        fetch(`${API_URL}/api/calls`, { headers }),
        fetch(`${API_URL}/api/calls/transcriptions`, { headers }),
        fetch(`${API_URL}/api/hospitals`)
      ]);

      const appointmentsData = appointmentsRes.ok ? await appointmentsRes.json() : [];
      const feedbacksData = feedbacksRes.ok ? await feedbacksRes.json() : [];
      const callsData = callsRes.ok ? await callsRes.json() : [];
      const transcriptionsData = transcriptionsRes.ok ? await transcriptionsRes.json() : [];
      const hospitalsData = hospitalsRes.ok ? await hospitalsRes.json() : [];

      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setFeedbacks(Array.isArray(feedbacksData) ? feedbacksData : []);
      setCalls(Array.isArray(callsData) ? callsData : []);
      setTranscriptions(Array.isArray(transcriptionsData) ? transcriptionsData : []);
      setHospitals(Array.isArray(hospitalsData) ? hospitalsData : []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Segment appointments
  const doctorAppointments = useMemo(() => {
    return appointments.filter(a => a.appointmentType !== 'Lab Test' && !a.serviceName);
  }, [appointments]);

  const labAppointments = useMemo(() => {
    return appointments.filter(a => a.appointmentType === 'Lab Test' || Boolean(a.serviceName));
  }, [appointments]);

  const refundedAppointments = useMemo(() => {
    return appointments.filter(a => a.status === 'Cancelled' || (a.refundAmount && a.refundAmount > 0) || a.refundStatus === 'Refunded');
  }, [appointments]);

  const totalRefundAmount = useMemo(() => {
    return refundedAppointments.reduce((sum, a) => sum + (Number(a.refundAmount) || 0), 0);
  }, [refundedAppointments]);

  const stats = useMemo(
    () => [
      {
        title: 'Doctor Visits',
        value: doctorAppointments.length,
        sub: 'Consultation Bookings',
        icon: Stethoscope,
        color: 'from-blue-500 to-indigo-600',
        iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        iconText: 'text-white',
        to: '/admin/appointments?tab=doctor'
      },
      {
        title: 'Lab & Diagnostic Tests',
        value: labAppointments.length,
        sub: 'Diagnostic investigations',
        icon: TestTube,
        color: 'from-rose-500 to-pink-600',
        iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
        iconText: 'text-white',
        to: '/admin/appointments?tab=lab'
      },
      {
        title: 'Refunds & Settlements',
        value: refundedAppointments.length,
        sub: `₹${totalRefundAmount.toLocaleString()} net refunded`,
        icon: RotateCcw,
        color: 'from-emerald-500 to-teal-600',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
        iconText: 'text-white',
        to: '/admin/appointments?tab=refunds'
      },
      {
        title: 'Patient Feedbacks',
        value: feedbacks.length,
        sub: 'Reviews & Ratings',
        icon: MessageSquare,
        color: 'from-amber-500 to-orange-600',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        iconText: 'text-white',
        to: '/admin/feedbacks'
      }
    ],
    [doctorAppointments.length, labAppointments.length, refundedAppointments.length, totalRefundAmount, feedbacks.length]
  );

  const appointmentStatusCount = useMemo(() => {
    return {
      Pending: appointments.filter((a) => a.status === 'Pending').length,
      Confirmed: appointments.filter((a) => a.status === 'Confirmed').length,
      'In Progress': appointments.filter((a) => a.status === 'In Progress').length,
      Completed: appointments.filter((a) => a.status === 'Completed').length,
      Cancelled: appointments.filter((a) => a.status === 'Cancelled').length
    };
  }, [appointments]);

  const monthlyTrendData = useMemo(() => {
    const monthMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    appointments.forEach((app) => {
      const date = new Date(app.createdAt || app.date);
      if (!Number.isNaN(date.getTime())) {
        counts[date.getMonth()] += 1;
      }
    });

    return {
      labels: monthMap,
      datasets: [
        {
          label: 'Appointments',
          data: counts,
          fill: true,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7
        }
      ]
    };
  }, [appointments]);

  const activityBarData = useMemo(() => {
    return {
      labels: ['Calls', 'Feedbacks', 'Transcriptions', 'Appointments'],
      datasets: [
        {
          label: 'Total Records',
          data: [calls.length, feedbacks.length, transcriptions.length, appointments.length],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderRadius: 12,
          borderSkipped: false,
          hoverBackgroundColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(139, 92, 246, 1)'
          ]
        }
      ]
    };
  }, [calls.length, feedbacks.length, transcriptions.length, appointments.length]);

  const appointmentStatusData = useMemo(() => {
    return {
      labels: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
      datasets: [
        {
          label: 'Appointments',
          data: [
            appointmentStatusCount.Pending,
            appointmentStatusCount.Confirmed,
            appointmentStatusCount['In Progress'],
            appointmentStatusCount.Completed,
            appointmentStatusCount.Cancelled
          ],
          backgroundColor: ['#facc15', '#3b82f6', '#a855f7', '#22c55e', '#ef4444'],
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 8
        }
      ]
    };
  }, [appointmentStatusCount]);

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: '600'
          }
        }
      }
    }
  };

  const lineChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: {
            weight: '600'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const barChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: false
      },
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: {
            weight: '600'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            weight: '600'
          }
        }
      }
    }
  };

  const doughnutOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: false
      }
    },
    cutout: '65%'
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 py-3 sm:py-4 px-2 sm:px-3 md:px-4 lg:px-5">
        <div className="w-full max-w-[1720px] mx-auto space-y-4">
          <DashboardTabs role="admin" />
          <div className="space-y-4">
            <StatSkeleton count={4} />
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <SectionLoader label="Loading dashboard…" sub="Pulling your hospital's latest activity" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 py-3 sm:py-4 px-2 sm:px-3 md:px-4 lg:px-5">
      <div className="w-full max-w-[1720px] mx-auto space-y-4">
        <DashboardTabs role="admin" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-4"
      >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Dashboard Overview
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Your hospital's performance at a glance
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className={`bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-100 overflow-hidden relative`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-bl-full`} />
              
              <div className="flex items-center justify-between gap-4 relative z-10">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    {item.title}
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
                    {item.value}
                  </p>
                </div>

                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${item.iconBg} ${item.iconText}`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-100 xl:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Appointments Trend
              </h3>
              <p className="text-xs text-slate-500">Monthly appointment activity</p>
            </div>
          </div>
          <div className="relative h-[280px] sm:h-[320px]">
            <Line data={monthlyTrendData} options={lineChartOptions} />
          </div>
        </motion.div>

        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-md">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Status Breakdown
              </h3>
              <p className="text-xs text-slate-500">Appointment distribution</p>
            </div>
          </div>
          <div className="relative h-[280px] sm:h-[320px]">
            <Doughnut data={appointmentStatusData} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-100 xl:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Activity Comparison
              </h3>
              <p className="text-xs text-slate-500">Cross-module performance</p>
            </div>
          </div>
          <div className="relative h-[280px] sm:h-[320px]">
            <Bar data={activityBarData} options={barChartOptions} />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 shadow-lg border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Quick Summary
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Pending
              </span>
              <span className="text-lg font-bold text-amber-400">{appointmentStatusCount.Pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Confirmed
              </span>
              <span className="text-lg font-bold text-blue-400">{appointmentStatusCount.Confirmed}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4" /> In Progress
              </span>
              <span className="text-lg font-bold text-purple-400">{appointmentStatusCount['In Progress']}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Completed
              </span>
              <span className="text-lg font-bold text-green-400">{appointmentStatusCount.Completed}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Cancelled
              </span>
              <span className="text-lg font-bold text-red-400">{appointmentStatusCount.Cancelled}</span>
            </div>
            
            <div className="pt-4 mt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Hospital
                </span>
                <span className="text-sm font-bold text-white">{user?.hospital || 'Not assigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Total Hospitals
                </span>
                <span className="text-sm font-bold text-white">{hospitals.length}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
      </div>
    </div>
  );
}