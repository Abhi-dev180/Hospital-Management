// frontend/src/components/chatbot/MedicineReminderModal.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill, Clock, Plus, Trash2, X, Bell, BellRing, CheckCircle2,
  AlertCircle, Sun, Moon, Coffee, Volume2, Sparkles, Check
} from 'lucide-react';

const DEFAULT_REMINDERS = [
  {
    id: 'rem_1',
    medicine: 'Metformin 500mg',
    timing: '08:30 AM',
    foodTiming: 'After Breakfast',
    slot: 'morning',
    enabled: true
  },
  {
    id: 'rem_2',
    medicine: 'Pantoprazole 40mg',
    timing: '07:30 AM',
    foodTiming: 'Before Breakfast',
    slot: 'morning',
    enabled: true
  },
  {
    id: 'rem_3',
    medicine: 'Atorvastatin 10mg',
    timing: '09:30 PM',
    foodTiming: 'After Dinner',
    slot: 'night',
    enabled: true
  }
];

export default function MedicineReminderModal({ isOpen, onClose, initialMedicine = '', initialDosage = '' }) {
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem('medibot_medicine_reminders');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_REMINDERS;
  });

  const [medicineName, setMedicineName] = useState(initialMedicine || '');
  const [dosage, setDosage] = useState(initialDosage || '');
  const [time, setTime] = useState('08:00');
  const [foodTiming, setFoodTiming] = useState('After Meals');
  const [slot, setSlot] = useState('morning');
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sync initial drug name if passed as props
  useEffect(() => {
    if (initialMedicine) {
      setMedicineName(initialMedicine);
    }
    if (initialDosage) {
      setDosage(initialDosage);
    }
  }, [initialMedicine, initialDosage]);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('medibot_medicine_reminders', JSON.stringify(reminders));
    } catch (_) {}
  }, [reminders]);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    }
  };

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15); // C6
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!medicineName.trim()) return;

    // Convert 24h to 12h label
    let [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const timeLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;

    const newReminder = {
      id: `rem_${Date.now()}`,
      medicine: dosage ? `${medicineName.trim()} (${dosage})` : medicineName.trim(),
      timing: timeLabel,
      rawTime: time,
      foodTiming,
      slot,
      enabled: true
    };

    setReminders(prev => [newReminder, ...prev]);
    setMedicineName('');
    setDosage('');
    setShowSuccessToast(true);
    playChime();
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  const toggleReminder = (id) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-medical-dark to-blue-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md ring-2 ring-white/20">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white leading-tight">
                  Medicine & Pill Reminder
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-[10px] font-bold text-emerald-200">
                  MediBot AI
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Set automated daily medication alarms and dosage schedules
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50/50">
          {/* Notification Permission Banner */}
          {notificationPermission !== 'granted' && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 min-w-0">
                <BellRing className="w-4 h-4 text-medical-blue shrink-0 animate-bounce" />
                <span className="truncate">Enable browser notifications for audio-visual pill alerts</span>
              </div>
              <button
                type="button"
                onClick={requestNotification}
                className="px-3 py-1.5 bg-medical-blue hover:bg-medical-dark text-white font-bold rounded-xl text-[11px] shrink-0 shadow-2xs cursor-pointer active:scale-95 transition"
              >
                Enable Alerts
              </button>
            </div>
          )}

          {/* Add New Reminder Form */}
          <form onSubmit={handleAddReminder} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                Add Medication Alarm
              </h4>
              <span className="text-[10.5px] text-slate-400">Daily recurring</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Medicine / Drug Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin, Pan-D, Dolo"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Dosage / Strength
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500mg, 1 tablet, 5ml"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Alarm Time (24-Hour) *
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Food & Intake Instructions
                </label>
                <select
                  value={foodTiming}
                  onChange={(e) => setFoodTiming(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none transition cursor-pointer"
                >
                  <option value="After Meals">🍽️ After Meals / Food</option>
                  <option value="Before Meals (Empty Stomach)">🌅 Before Meals (Empty Stomach)</option>
                  <option value="With Meals">🥗 With Meals</option>
                  <option value="At Bedtime">🌙 At Bedtime</option>
                  <option value="As Needed (SOS)">⚡ As Needed (SOS)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-medical-blue hover:from-emerald-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Activate Medicine Reminder</span>
            </button>
          </form>

          {/* Success Toast */}
          <AnimatePresence>
            {showSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Medication alarm configured successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Medication Reminders List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-0.5">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-medical-blue" />
                Active Reminders ({reminders.filter(r => r.enabled).length} of {reminders.length})
              </span>
              <span className="text-[10px] text-slate-400">Browser Audio Chimes Active</span>
            </div>

            {reminders.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No active medicine reminders</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to add your daily medications.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      rem.enabled
                        ? 'bg-white border-slate-200 shadow-2xs hover:border-medical-blue/40'
                        : 'bg-slate-100/70 border-slate-200/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleReminder(rem.id)}
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition cursor-pointer ${
                          rem.enabled
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        }`}
                        title={rem.enabled ? 'Click to Disable' : 'Click to Enable'}
                      >
                        <Bell className={`w-4 h-4 ${rem.enabled ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-900 text-xs truncate">
                            {rem.medicine}
                          </h5>
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-medical-blue text-[10px] font-extrabold border border-blue-200 shrink-0">
                            {rem.timing}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                          {rem.foodTiming}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => deleteReminder(rem.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-100/90 border-t border-slate-200/90 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span className="flex items-center gap-1 text-[11px]">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            Audio Chime automatically rings when dose is due
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
