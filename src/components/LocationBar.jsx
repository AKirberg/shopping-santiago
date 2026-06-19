import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

function useAddressSuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!query || query.length < 3) { setSuggestions([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: `${query}, Santiago, Chile`,
          format: "json", countrycodes: "cl", limit: "6",
          viewbox: "-71.1,-33.75,-70.35,-33.1", bounded: "1",
          "accept-language": "es",
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          headers: { "Accept-Language": "es" },
        });
        const data = await res.json();
        setSuggestions(data.map(d => ({
          label: d.display_name.split(",").slice(0, 3).join(", "),
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
        })));
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  return { suggestions, loading };
}

function LocationBar({ address, setAddress, userCoords, setUserCoords }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const { t } = useLanguage();
  const lb = t.locationBar;
  const { suggestions, loading } = useAddressSuggestions(address);

  function handleChange(e) {
    setAddress(e.target.value);
    setUserCoords(null);
    setShowDropdown(true);
  }

  function selectSuggestion(s) {
    setAddress(s.label);
    setUserCoords({ lat: s.lat, lng: s.lng });
    setShowDropdown(false);
  }

  function clear() {
    setAddress("");
    setUserCoords(null);
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`border-b border-ink/8 transition-colors ${userCoords ? "bg-leaf/4" : "bg-white"}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <MapPin size={14} className={`shrink-0 transition-colors ${userCoords ? "text-leaf" : "text-ink/40"}`} />
        <span className="shrink-0 text-xs font-extrabold text-ink/50">{lb.label}</span>

        <div className="relative w-full max-w-xs sm:w-auto">
          <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-colors ${
            userCoords
              ? "border-leaf bg-white shadow-sm"
              : "border-ink/12 bg-ink/3 focus-within:border-ink/30 focus-within:bg-white"
          }`}>
            <input
              ref={inputRef}
              type="text"
              value={address}
              onChange={handleChange}
              onFocus={() => address.length >= 3 && setShowDropdown(true)}
              placeholder={lb.placeholder}
              className="w-full bg-transparent text-xs font-medium text-ink placeholder-ink/35 outline-none min-w-[180px]"
              autoComplete="off"
            />
            {address && (
              <button onClick={clear} className="shrink-0 text-ink/30 hover:text-ink/60 transition-colors">
                <X size={12} />
              </button>
            )}
            {loading && (
              <span className="shrink-0 h-3 w-3 animate-spin rounded-full border-2 border-ink/20 border-t-leaf" />
            )}
          </div>

          {showDropdown && suggestions.length > 0 && (
            <ul
              ref={dropdownRef}
              className="absolute left-0 top-full z-50 mt-1 min-w-[260px] overflow-hidden rounded-xl border border-ink/10 bg-white shadow-card"
            >
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    onMouseDown={e => { e.preventDefault(); selectSuggestion(s); }}
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-xs hover:bg-leaf/6 transition-colors"
                  >
                    <MapPin size={12} className="mt-0.5 shrink-0 text-ink/35" />
                    <span className="text-ink/80 leading-snug">{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {userCoords ? (
          <span className="flex items-center gap-1.5 rounded-full bg-leaf px-3 py-1 text-xs font-extrabold text-white">
            <Navigation size={11} />
            {lb.active}
          </span>
        ) : (
          <span className="text-xs text-ink/35 hidden sm:inline">{lb.hint}</span>
        )}
      </div>
    </div>
  );
}

export default LocationBar;
