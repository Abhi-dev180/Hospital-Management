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

  const slots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="mt-1">
      <span className="text-xs font-semibold text-gray-500 block mb-1">
        Available Slots {loadingSlots ? '(checking Google Calendar...)' : ''}:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {slots.map((slot) => {
          const isBooked = bookedSlots.includes(slot);
          const isSelected = selectedTime === slot;
          return (
            <button
              key={slot}
              type="button"
              disabled={isBooked}
              onClick={() => onSelectTime(slot)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                isBooked
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                  : isSelected
                  ? 'bg-medical-blue text-white border-medical-blue shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-medical-blue'
              }`}
              title={isBooked ? 'Slot not available (Already booked)' : 'Click to select slot'}
            >
              {slot} {isBooked ? '(Booked)' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}