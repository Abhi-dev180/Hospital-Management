// frontend/src/components/SlotSelector.jsx
import { useState, useEffect } from 'react';
import API_URL from '../config/api';

export default function SlotSelector({ date, hospitalId, selectedTime, onSelectTime }) {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!date) return;
    (async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(
          `${API_URL}/api/appointments/booked-slots?date=${date}&hospitalId=${hospitalId || ''}`
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.bookedSlots)) {
          setBookedSlots(data.bookedSlots);
        } else {
          setBookedSlots([]);
        }
      } catch (e) {
        console.error('Could not fetch booked slots:', e);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [date, hospitalId]);

  const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

  const isPastSlot = (slot) => {
    if (!date) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) return true;
    if (date === todayStr) {
      const now = new Date();
      const minValid = new Date(now.getTime() + 60 * 60 * 1000);
      const [h, m] = slot.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      return slotDate < minValid;
    }
    return false;
  };

  return (
    <div className="mt-1">
      <span className="text-xs font-semibold text-gray-500 block mb-1">
        Available Slots {loadingSlots ? '(checking calendar...)' : ''}:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {slots.map((slot) => {
          const isPast = isPastSlot(slot);
          const isBooked = (bookedSlots && bookedSlots.includes(slot)) || isPast;
          const isSelected = selectedTime === slot;
          return (
            <button
              key={slot}
              type="button"
              disabled={isBooked}
              onClick={() => onSelectTime(slot)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                isPast
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through opacity-50'
                  : isBooked
                  ? 'bg-red-100 text-red-400 border-red-200 cursor-not-allowed line-through'
                  : isSelected
                  ? 'bg-medical-blue text-white border-medical-blue shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-medical-blue'
              }`}
              title={isPast ? 'Slot has already passed' : isBooked ? 'Slot not available (Already booked)' : 'Click to select slot'}
            >
              {slot} {isPast ? '(Past)' : isBooked ? '(Booked)' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}