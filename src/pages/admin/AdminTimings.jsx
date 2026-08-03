import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Clock3 } from 'lucide-react';
import API_URL from '../../config/api';
import { SectionLoader } from '../../components/Loader';

export default function AdminTimings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timingsForm, setTimingsForm] = useState({
    timings: '',
    emergency: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const loadTimings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/hospitals`);
        const hospitalsData = res.ok ? await res.json() : [];
        const ownHospital = (Array.isArray(hospitalsData) ? hospitalsData : []).find(
          (h) => h.id === parsedUser?.hospitalId
        );
        if (ownHospital) {
          setTimingsForm({
            timings: ownHospital.timings || '',
            emergency: ownHospital.emergency || ''
          });
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load hospital timings');
      } finally {
        setLoading(false);
      }
    };

    loadTimings();
  }, []);

  const handleTimingsUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/api/hospitals/admin/update-timings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(timingsForm)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Hospital timings updated');
      } else {
        toast.error(data.message || 'Failed to update timings');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong while updating timings');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
        <Clock3 className="w-6 h-6 text-medical-blue" />
        Update Hospital Timings
      </h3>

      {loading ? (
        <SectionLoader label="Loading your timings…" sub="Fetching the current schedule" minHeight="min-h-[220px]" />
      ) : (
      <form onSubmit={handleTimingsUpdate} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Hospital Timings
          </label>
          <input
            type="text"
            value={timingsForm.timings}
            onChange={(e) =>
              setTimingsForm((prev) => ({
                ...prev,
                timings: e.target.value
              }))
            }
            placeholder="Mon - Sat • 8:00 AM - 8:00 PM"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Emergency Availability
          </label>
          <input
            type="text"
            value={timingsForm.emergency}
            onChange={(e) =>
              setTimingsForm((prev) => ({
                ...prev,
                emergency: e.target.value
              }))
            }
            placeholder="24/7 Emergency Available"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-blue"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-medical-blue hover:bg-medical-dark text-white px-6 py-3 rounded-xl font-bold transition"
        >
          Save Timings
        </button>
      </form>
      )}
    </div>
  );
}