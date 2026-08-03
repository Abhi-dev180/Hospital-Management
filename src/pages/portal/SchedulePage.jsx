
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Loader2, CheckCircle2, Video, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../../config/api';
import PortalCardPage from '../../components/portal/PortalCardPage';

export default function SchedulePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activeDay, setActiveDay] = useState('');
  const [booking2, setBooking2] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/schedule/${token}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Invalid scheduling link');
        return;
      }

      setBooking(data.booking);
      setSlots(data.slots || []);

      if (data.alreadyScheduled || data.booking?.status === 'scheduled') {
        setConfirmed({
          scheduledAt: data.scheduledAt || data.booking?.scheduledAt,
          meetingLink: data.meetingLink || data.booking?.meetingLink
        });
      }
    } catch {
      setError('Could not load scheduling information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const days = useMemo(() => {
    const map = {};
    for (const s of slots) {
      const key = new Date(s.iso).toDateString();
      (map[key] ||= []).push(s);
    }
    return map;
  }, [slots]);

  const dayKeys = Object.keys(days);

  useEffect(() => {
    if (dayKeys.length && !activeDay) setActiveDay(dayKeys[0]);
  }, [dayKeys, activeDay]);

  const pickSlot = async (iso) => {
    setBooking2(iso);
    try {
      const res = await fetch(`${API_URL}/api/schedule/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: iso })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Could not book that slot');
        if (res.status === 409) load();
        return;
      }
      setConfirmed(data.booking);
      toast.success('Demo scheduled! 🎉');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setBooking2('');
    }
  };

  if (loading) {
    return (
      <PortalCardPage>
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-medical-blue" />
        </div>
      </PortalCardPage>
    );
  }

  if (error) {
    return (
      <PortalCardPage>
        <div className="text-center py-8">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-medical-dark">{error}</h1>
          <p className="text-gray-500 mt-2">This link may have expired. Please contact us for a new one.</p>
        </div>
      </PortalCardPage>
    );
  }

  if (confirmed) {
    const when = confirmed.scheduledAt
      ? new Date(confirmed.scheduledAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
      : 'Confirmed';

    return (
      <PortalCardPage>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-5" />
          <h1 className="text-2xl font-extrabold text-medical-dark">You're booked! 🎉</h1>
          <p className="text-gray-600 mt-3">
            Your demo for <strong>{booking?.hospitalName}</strong> is scheduled for:
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-medical-dark font-semibold px-5 py-3 rounded-xl">
            <CalendarClock className="w-5 h-5 text-medical-blue" /> {when}
          </div>
          {confirmed.meetingLink && (
            <div className="mt-6">
              <a
                href={confirmed.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-md inline-flex items-center gap-2"
              >
                <Video className="w-4 h-4" /> Join the meeting
              </a>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">A confirmation email with the meeting link is on its way.</p>
        </motion.div>
      </PortalCardPage>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] portal-bg py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 text-medical-blue flex items-center justify-center">
            <CalendarClock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-medical-dark">Pick your demo time</h1>
          <p className="text-gray-500 mt-2">Choose a slot that works for {booking?.hospitalName || 'you'}.</p>
        </div>

        <div className="card-lg p-5 sm:p-7">
          <div className="flex items-center justify-center gap-5 mb-5 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-green-600">
              <span className="w-3 h-3 rounded-full bg-green-500" /> Available
            </span>
            <span className="inline-flex items-center gap-1.5 text-red-500">
              <span className="w-3 h-3 rounded-full bg-red-400" /> Booked
            </span>
          </div>

          {dayKeys.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No slots available right now — please check back soon.</p>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
                {dayKeys.map((k) => {
                  const d = new Date(k);
                  const active = k === activeDay;
                  const freeCount = days[k].filter((s) => !s.taken).length;

                  return (
                    <button
                      key={k}
                      onClick={() => setActiveDay(k)}
                      className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold border transition text-center ${
                        active
                          ? 'bg-medical-blue text-white border-medical-blue'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-medical-blue'
                      }`}
                    >
                      <div>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-xs opacity-80">
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${active ? 'text-blue-100' : 'text-green-600'}`}>
                        {freeCount} free
                      </div>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDay}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-4"
                >
                  {(days[activeDay] || []).map((s) => {
                    const label = new Date(s.iso).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    });
                    const isBusy = booking2 === s.iso;

                    if (s.taken) {
                      return (
                        <div
                          key={s.iso}
                          className="flex items-center justify-center py-3 rounded-xl border border-red-200 bg-red-50 text-red-400 text-sm font-semibold line-through cursor-not-allowed select-none"
                        >
                          {label}
                        </div>
                      );
                    }

                    return (
                      <motion.button
                        key={s.iso}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={!!booking2}
                        onClick={() => pickSlot(s.iso)}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-green-200 bg-green-50 text-green-700 text-sm font-bold hover:bg-green-500 hover:text-white hover:border-green-500 disabled:opacity-50 transition-colors"
                      >
                        {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : label}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}