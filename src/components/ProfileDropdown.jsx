
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    onLogout?.();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="relative flex items-center gap-2" ref={ref}>
      {/* Profile Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-medical-blue/10 text-medical-blue hover:bg-medical-blue/20 transition-colors border border-medical-blue/20 focus:outline-none focus:ring-2 focus:ring-medical-blue/30"
        title="Profile"
      >
        <User className="w-5 h-5" />
      </button>

      {/* Logout Icon */}
      <button
        onClick={handleLogout}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-200"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-medical-blue flex items-center justify-center text-white font-bold text-sm uppercase shrink-0">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {user.role}
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-medical-blue transition-colors"
          >
            <Settings className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      )}
    </div>
  );
}