import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import {
  PhoneCall,
  MessageSquare,
  FileText,
  Activity,
  ClipboardList,
  TrendingUp,
  BarChart3,
  PieChart
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

  const stats = useMemo(
    () => [
      {
        title: 'Total Calls',
        value: calls.length,
        icon: PhoneCall,
        color: 'border-blue-500',
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600'
      },
      {
        title: 'Total Feedbacks',
        value: feedbacks.length,
        icon: MessageSquare,
        color: 'border-green-500',
        iconBg: 'bg-green-100',
        iconText: 'text-green-600'
      },
      {
        title: 'Transcriptions',
        value: transcriptions.length,
        icon: FileText,
        color: 'border-red-500',
        iconBg: 'bg-red-100',
        iconText: 'text-red-600'
      },
      {
        title: 'Appointments',
        value: appointments.length,
        icon: ClipboardList,
        color: 'border-purple-500',
        iconBg: 'bg-purple-100',
        iconText: 'text-purple-600'
      }
    ],
    [calls.length, feedbacks.length, transcriptions.length, appointments.length]
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
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb'
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
          backgroundColor: ['#3b82f6', '#22c55e', '#ef4444', '#8b5cf6'],
          borderRadius: 10
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
          borderWidth: 0
        }
      ]
    };
  }, [appointmentStatusCount]);

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  const lineChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: 'Monthly Appointment Trend'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const barChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: 'Dashboard Activity Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const doughnutOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: 'Appointment Status Distribution'
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <StatSkeleton count={4} />
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <SectionLoader label="Loading dashboard…" sub="Pulling your hospital’s latest activity" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-medical-dark">
          Dashboard Overview
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl p-4 sm:p-5 md:p-6 shadow border-b-4 ${item.color}`}
              >
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      {item.title}
                    </p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-medical-dark mt-2">
                      {item.value}
                    </p>
                  </div>

                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconText}`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow xl:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-medical-dark">
              Appointments Trend
            </h3>
          </div>
          <div className="relative h-[260px] sm:h-[300px] md:h-[340px] lg:h-[360px]">
            <Line data={monthlyTrendData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-600" />
            <h3 className="text-base sm:text-lg font-bold text-medical-dark">
              Status Breakdown
            </h3>
          </div>
          <div className="relative h-[260px] sm:h-[300px] md:h-[340px] lg:h-[360px]">
            <Doughnut data={appointmentStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow xl:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-bold text-medical-dark">
              Activity Comparison
            </h3>
          </div>
          <div className="relative h-[260px] sm:h-[300px] md:h-[340px] lg:h-[360px]">
            <Bar data={activityBarData} options={barChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-medical-blue" />
            <h3 className="text-lg sm:text-xl font-bold text-medical-dark">
              Quick Summary
            </h3>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <p>Pending Appointments: <span className="font-bold text-amber-600">{appointmentStatusCount.Pending}</span></p>
            <p>Confirmed Appointments: <span className="font-bold text-blue-600">{appointmentStatusCount.Confirmed}</span></p>
            <p>In Progress: <span className="font-bold text-purple-600">{appointmentStatusCount['In Progress']}</span></p>
            <p>Completed Appointments: <span className="font-bold text-green-600">{appointmentStatusCount.Completed}</span></p>
            <p>Cancelled Appointments: <span className="font-bold text-red-600">{appointmentStatusCount.Cancelled}</span></p>
            <p>Managed Hospital: <span className="font-bold">{user?.hospital || 'Not assigned'}</span></p>
            <p>Total Hospitals: <span className="font-bold">{hospitals.length}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}