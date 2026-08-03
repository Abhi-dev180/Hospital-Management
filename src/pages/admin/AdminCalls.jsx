import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PhoneCall } from 'lucide-react';
import API_URL from '../../config/api';
import { ListSkeleton } from '../../components/Loader';

export default function AdminCalls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/calls`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.ok ? await res.json() : [];
        setCalls(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load calls');
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
        <PhoneCall className="w-6 h-6 text-blue-600" />
        Calls
      </h3>

      <div className="space-y-4">
        {loading ? (
          <ListSkeleton rows={3} />
        ) : calls.length === 0 ? (
          <p className="text-gray-500">No calls logged yet.</p>
        ) : (
          calls.map((call) => (
            <div key={call.id} className="border border-gray-200 rounded-xl p-4">
              <p className="font-bold text-medical-dark">{call.patientName}</p>
              <p className="text-sm text-gray-600">Phone: {call.patientPhone}</p>
              <p className="text-sm text-gray-600">Status: {call.status || 'Completed'}</p>
              {call.notes && <p className="text-sm text-gray-500 mt-1">{call.notes}</p>}
              <p className="text-xs text-gray-400 mt-2">
                {call.createdAt ? new Date(call.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}