import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, X, Building2, Globe } from 'lucide-react';

// Address & City Autocomplete using OpenStreetMap Nominatim
export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Search address…',
  cityOnly = false,
  className = ''
}) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const search = (q) => {
    clearTimeout(timer.current);
    if (!q || q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'Hospital-Management-App/1.0'
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(data);
          setOpen(data.length > 0);
          setActiveIndex(-1);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    search(v);
  };

  const parsePickedLocation = (r) => {
    const a = r.address || {};
    if (cityOnly) {
      // 1. Identify primary city / town / district / place name
      const primaryName =
        r.name ||
        a.city ||
        a.town ||
        a.village ||
        a.state_district ||
        a.district ||
        a.municipality ||
        a.suburb ||
        a.county ||
        (r.display_name ? r.display_name.split(',')[0].trim() : '');

      // 2. Identify state / province
      const stateName = a.state || a.state_code || a.region || '';

      // If both exist and differ, format as "City, State" (e.g. "Moga, Punjab")
      if (primaryName && stateName && primaryName.toLowerCase() !== stateName.toLowerCase()) {
        return `${primaryName}, ${stateName}`;
      }
      return primaryName || stateName || (r.display_name ? r.display_name.split(',')[0].trim() : '');
    }

    // Full exact address
    return r.display_name || r.name || '';
  };

  const pick = (r) => {
    const val = parsePickedLocation(r);
    setQuery(val);
    onChange(val);
    setResults([]);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setResults([]);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < results.length) {
      e.preventDefault();
      pick(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const getPrimaryLabel = (r) => {
    const a = r.address || {};
    return (
      r.name ||
      a.city ||
      a.town ||
      a.village ||
      a.state_district ||
      a.suburb ||
      (r.display_name ? r.display_name.split(',')[0].trim() : 'Location')
    );
  };

  const getSecondaryLabel = (r) => {
    if (!r.display_name) return '';
    const parts = r.display_name.split(',').map((s) => s.trim());
    if (parts.length > 1) {
      return parts.slice(1).join(', ');
    }
    return r.display_name;
  };

  const getTypeBadge = (r) => {
    const t = r.type || r.class || '';
    if (t === 'city' || t === 'town' || t === 'village' || t === 'municipality') return 'City';
    if (t === 'administrative' || t === 'state_district') return 'District / Region';
    if (t === 'hospital' || t === 'clinic' || t === 'doctors') return 'Hospital';
    if (t === 'suburb' || t === 'neighbourhood') return 'Locality';
    return null;
  };

  return (
    <div className={`relative ${className}`} ref={boxRef}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3.5 text-medical-blue w-4 h-4 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue/20 focus:border-medical-blue outline-none text-sm bg-white text-gray-900 placeholder:text-gray-400 transition shadow-sm"
        />
        {loading ? (
          <Loader2 className="absolute right-3 text-medical-blue w-4 h-4 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto divide-y divide-gray-100 animate-in fade-in slide-in-from-top-1 duration-150">
          {results.map((r, index) => {
            const primary = getPrimaryLabel(r);
            const secondary = getSecondaryLabel(r);
            const badge = getTypeBadge(r);
            const isActive = index === activeIndex;

            return (
              <li key={r.place_id || index}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex items-start gap-3 transition ${
                    isActive ? 'bg-blue-50 text-medical-blue' : 'hover:bg-blue-50/70 text-gray-700'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-blue-50 text-medical-blue shrink-0 mt-0.5">
                    {badge === 'Hospital' ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">{primary}</span>
                      {badge && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 tracking-wider shrink-0">
                          {badge}
                        </span>
                      )}
                    </div>
                    {secondary && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{secondary}</p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
