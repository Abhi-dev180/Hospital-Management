import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

// Address autocomplete using OpenStreetMap Nominatim (free, no API key).
// Debounced; shows suggestions; clicking one fills the field with the full address.
// cityOnly: when a result is picked, fill just the city/town name instead of the full address.
export default function AddressAutocomplete({ value, onChange, placeholder = 'Search address…', cityOnly = false }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const onDocClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const search = (q) => {
    clearTimeout(timer.current);
    if (!q || q.trim().length < 3) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch { setResults([]); } finally { setLoading(false); }
    }, 400);
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    search(v);
  };

  const pick = (r) => {
    const a = r.address || {};
    const val = cityOnly
      ? (a.city || a.town || a.village || a.municipality || a.county || a.state || r.display_name.split(',')[0])
      : r.display_name;
    setQuery(val);
    onChange(val);
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-xl focus:ring-medical-blue focus:border-medical-blue outline-none text-sm bg-white text-gray-900 placeholder:text-gray-400"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onClick={() => pick(r)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 text-medical-blue shrink-0 mt-0.5" />
                <span className="text-gray-700">{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
