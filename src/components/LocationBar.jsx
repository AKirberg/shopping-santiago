import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Clock, Crosshair, MapPin, Navigation, Search, X } from "lucide-react";
import { haversineKm } from "../utils/scoring";
import { useLanguage } from "../i18n/LanguageContext";
import { localizeMall } from "../i18n/mallContent";
import { loadGoogleMaps } from "../utils/googleMaps";

const HISTORY_KEY = "ss-addr-history";
const HISTORY_MAX = 5;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}
function saveToHistory(entry) {
  try {
    const prev = loadHistory().filter(h => h.label !== entry.label);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...prev].slice(0, HISTORY_MAX)));
  } catch { /* noop */ }
}

function useAddressSuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  // Preload SDK on mount
  useEffect(() => { loadGoogleMaps().catch(() => {}); }, []);

  useEffect(() => {
    if (!query || query.length < 3) { setSuggestions([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const maps = await loadGoogleMaps();
        const { suggestions: preds } =
          await maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            includedRegionCodes: ["cl"],
            locationBias: new maps.LatLng(-33.45, -70.65),
          });
        setSuggestions(
          preds.map(s => ({
            label: s.placePrediction.text.toString(),
            placeId: s.placePrediction.placeId,
            prediction: s.placePrediction,
          }))
        );
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  return { suggestions, loading };
}

export default function LocationBar({ address, setAddress, userCoords, setUserCoords, malls = [] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(address || "");
  const [history, setHistory] = useState(loadHistory);
  const [focusedMall, setFocusedMall] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const inputRef = useRef(null);
  const { t } = useLanguage();
  const lb = t.locationBar;
  const { suggestions, loading } = useAddressSuggestions(draft);

  /* Sync draft when address is cleared externally */
  useEffect(() => { if (!address) setDraft(""); }, [address]);

  /* Scroll lock while modal is open */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  /* Auto-focus input when modal opens */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const nearbyMalls = useMemo(() => {
    if (!userCoords) return [];
    return malls
      .filter(m => m.lat && m.lng)
      .map(m => ({
        ...m,
        distanceKm: Math.round(haversineKm(userCoords.lat, userCoords.lng, m.lat, m.lng) * 10) / 10,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);
  }, [userCoords, malls]);

  function handleDraftChange(e) {
    setDraft(e.target.value);
    setUserCoords(null);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && suggestions.length > 0) selectSuggestion(suggestions[0]);
    if (e.key === "Escape") closeModal();
  }

  async function selectSuggestion(s) {
    setAddress(s.label);
    setDraft(s.label);
    // History items already have coords
    if (s.lat && s.lng) {
      setUserCoords({ lat: s.lat, lng: s.lng });
      saveToHistory(s);
      setHistory(loadHistory());
      return;
    }
    // New Places API: use toPlace() + fetchFields()
    if (s.prediction) {
      try {
        const place = s.prediction.toPlace();
        await place.fetchFields({ fields: ["location"] });
        const lat = place.location.lat();
        const lng = place.location.lng();
        setUserCoords({ lat, lng });
        saveToHistory({ label: s.label, lat, lng });
        setHistory(loadHistory());
      } catch { /* accept label without coords */ }
      return;
    }
    // Fallback for history items with placeId only
    if (s.placeId) {
      try {
        const maps = await loadGoogleMaps();
        const geocoder = new maps.Geocoder();
        geocoder.geocode({ placeId: s.placeId }, (results, status) => {
          if (status === "OK" && results[0]) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            setUserCoords({ lat, lng });
            saveToHistory({ label: s.label, lat, lng });
            setHistory(loadHistory());
          }
        });
      } catch { /* no coords */ }
    }
  }

  function clearLocation() {
    setAddress("");
    setDraft("");
    setUserCoords(null);
  }

  function closeModal() {
    setOpen(false);
    setFocusedMall(null);
    /* If no coords selected, revert draft to last confirmed address */
    if (!userCoords) setDraft(address || "");
  }

  function scrollToQuiz() {
    closeModal();
    setTimeout(() => document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" }), 200);
  }

  async function handleGPS() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserCoords({ lat, lng });
        // Reverse-geocode via Google Geocoder
        try {
          const maps = await loadGoogleMaps();
          const geocoder = new maps.Geocoder();
          geocoder.geocode(
            { location: { lat, lng }, language: "es" },
            (results, status) => {
              const label =
                status === "OK" && results[0]
                  ? results[0].formatted_address
                  : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              setAddress(label);
              setDraft(label);
              saveToHistory({ label, lat, lng });
              setHistory(loadHistory());
            }
          );
        } catch {
          setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setDraft(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(err.code === 1 ? lb.gpsDenied : lb.gpsError);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }

  const showHistory = draft.length === 0 && history.length > 0;
  const showSuggestions = draft.length >= 3 && suggestions.length > 0;

  const shortAddress = address
    ? address.split(",").slice(0, 2).join(",").trim()
    : null;

  /* ── Sticky trigger bar ── */
  return (
    <>
      <div className="sticky top-0 sm:top-16 z-30 border-b border-ink/8 bg-white/98 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">

          {/* Trigger button — whole row is clickable */}
          <button
            onClick={() => setOpen(true)}
            className={`flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition min-w-0 ${
              userCoords
                ? "border-leaf/40 bg-leaf/6 hover:bg-leaf/10"
                : "border-leaf/30 bg-leaf/5 hover:border-leaf/50 hover:bg-leaf/9"
            }`}
          >
            <MapPin
              size={15}
              className={`shrink-0 transition-colors ${userCoords ? "text-leaf" : "text-leaf/60"}`}
            />
            {shortAddress ? (
              <span className="flex-1 truncate text-sm font-semibold text-ink/80 min-w-0">
                {shortAddress}
              </span>
            ) : (
              <span className="flex-1 truncate text-sm font-semibold text-ink/45">
                {lb.placeholder}
              </span>
            )}
            {userCoords ? (
              <span className="shrink-0 flex items-center gap-1 rounded-full bg-leaf px-2.5 py-1 text-[10px] font-extrabold text-white">
                <Navigation size={9} /> {lb.active}
              </span>
            ) : (
              <span className="shrink-0 flex items-center gap-1.5 rounded-xl bg-leaf px-3 py-1.5 text-xs font-extrabold text-white whitespace-nowrap">
                <Search size={11} /> {lb.label}
              </span>
            )}
          </button>

          {/* GPS quick button — visible when no location yet */}
          {!userCoords && (
            <button
              onClick={handleGPS}
              disabled={gpsLoading}
              className={`shrink-0 flex items-center justify-center h-10 w-10 rounded-full border transition ${
                gpsLoading
                  ? "border-leaf/20 bg-leaf/5 text-leaf/40 cursor-wait"
                  : "border-leaf/30 bg-leaf/6 text-leaf hover:bg-leaf hover:text-white hover:border-leaf"
              }`}
              aria-label={lb.gpsBtn}
              title={lb.gpsBtn}
            >
              {gpsLoading
                ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-leaf/30 border-t-leaf" />
                : <Crosshair size={15} />
              }
            </button>
          )}

          {/* Clear badge — only when location is active */}
          {userCoords && (
            <button
              onClick={clearLocation}
              className="shrink-0 p-2 text-ink/30 hover:text-ink/60 transition"
              aria-label="Borrar ubicación"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col sm:flex-row sm:items-center sm:justify-center"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

          {/* Card — flex column, capped at 90dvh, nunca desborda */}
          <div className="relative flex-1 sm:flex-none w-full sm:max-w-lg sm:mx-4 sm:rounded-3xl sm:max-h-[90dvh] bg-white shadow-2xl flex flex-col overflow-hidden">

            {/* Header — fijo arriba */}
            <div className="shrink-0 flex items-center justify-between border-b border-ink/6 px-5 py-4">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-leaf" />
                <span className="text-sm font-extrabold text-ink">{lb.label}</span>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-ink/30 hover:text-ink/70 transition rounded-xl hover:bg-ink/5"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search input — fijo bajo el header */}
            <div className="shrink-0 px-5 pt-4 pb-3 space-y-2.5">
              <div className="flex items-center gap-2.5 rounded-2xl border border-ink/12 bg-ink/3 px-3.5 py-3 focus-within:border-leaf focus-within:bg-white focus-within:ring-2 focus-within:ring-leaf/12 transition">
                <Search size={14} className="shrink-0 text-ink/35" />
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={handleDraftChange}
                  onKeyDown={handleKeyDown}
                  placeholder={lb.placeholder}
                  className="flex-1 bg-transparent text-sm font-medium text-ink placeholder-ink/35 outline-none"
                  autoComplete="off"
                />
                {loading && (
                  <span className="shrink-0 h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/15 border-t-leaf" />
                )}
                {draft.length > 0 && (
                  <button
                    onMouseDown={e => { e.preventDefault(); setDraft(""); setUserCoords(null); }}
                    className="shrink-0 text-ink/30 hover:text-ink/60 transition"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* GPS button */}
              <button
                onClick={handleGPS}
                disabled={gpsLoading}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-extrabold transition ${
                  gpsLoading
                    ? "border-leaf/20 bg-leaf/5 text-leaf/50 cursor-wait"
                    : "border-leaf/35 bg-leaf/8 text-leaf hover:bg-leaf hover:text-white hover:border-leaf"
                }`}
              >
                {gpsLoading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-leaf/30 border-t-leaf" />
                ) : (
                  <Crosshair size={13} />
                )}
                {gpsLoading ? lb.gpsLoading : lb.gpsBtn}
              </button>

              {/* GPS error message */}
              {gpsError && (
                <p className="text-center text-[11px] font-semibold text-coral/80">{gpsError}</p>
              )}
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">

              {/* Results list */}
              {(showSuggestions || showHistory) && (
                <ul className="border-t border-ink/6">
                  {showHistory && history.map((h, i) => (
                    <li key={i}>
                      <button
                        onMouseDown={e => { e.preventDefault(); selectSuggestion(h); }}
                        className="flex w-full items-start gap-3 px-5 py-3 text-left hover:bg-leaf/5 transition-colors"
                      >
                        <Clock size={13} className="mt-0.5 shrink-0 text-ink/30" />
                        <span className="text-ink/70 leading-snug text-xs">{h.label}</span>
                      </button>
                    </li>
                  ))}
                  {showSuggestions && suggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        onMouseDown={e => { e.preventDefault(); selectSuggestion(s); }}
                        className="flex w-full items-start gap-3 px-5 py-3 text-left hover:bg-leaf/5 transition-colors"
                      >
                        <MapPin size={13} className="mt-0.5 shrink-0 text-ink/35" />
                        <span className="text-ink/80 leading-snug text-xs">{s.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Nearby malls — list OR detail */}
              {userCoords && nearbyMalls.length > 0 && (
                <div className="border-t border-ink/6 px-5 py-4">
                  {focusedMall ? (
                    <MallDetail
                      mall={focusedMall}
                      userCoords={userCoords}
                      lb={lb}
                      onBack={() => setFocusedMall(null)}
                      onQuiz={scrollToQuiz}
                    />
                  ) : (
                    <>
                      <p className="mb-3 text-[10px] font-extrabold uppercase tracking-widest text-leaf/70">
                        {lb.nearbyTitle}
                      </p>
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {nearbyMalls.map((mall, i) => {
                          const isNearest = i === 0;
                          return (
                            <button
                              key={mall.id}
                              onClick={() => setFocusedMall(mall)}
                              className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${
                                isNearest
                                  ? "border-leaf/40 bg-leaf/6 hover:bg-leaf/12 col-span-full sm:col-span-2"
                                  : "border-ink/8 bg-ink/2 hover:border-leaf/30 hover:bg-leaf/4"
                              }`}
                            >
                              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold text-white ${
                                isNearest ? "bg-leaf" : "bg-ink/20"
                              }`}>{i + 1}</span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-extrabold text-ink leading-tight">{mall.name}</p>
                                <p className="text-[10px] font-semibold text-ink/45 mt-0.5">
                                  {mall.commune}
                                  <span className="ml-1.5 font-bold text-leaf">{mall.distanceKm} {lb.distLabel}</span>
                                </p>
                              </div>
                              <ChevronRight size={13} className="shrink-0 text-ink/25" />
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={scrollToQuiz}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-ink/3 px-4 py-2.5 text-xs font-extrabold text-ink/50 transition hover:border-ink/20 hover:bg-ink/6 hover:text-ink/70"
                      >
                        🔍 {lb.advancedSearch}
                      </button>
                      <button
                        onClick={scrollToQuiz}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-leaf/35 bg-leaf/8 px-4 py-3 text-sm font-extrabold text-leaf transition hover:bg-leaf hover:text-white"
                      >
                        {lb.quizCta} <ChevronRight size={15} />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!showSuggestions && !showHistory && !userCoords && (
                <div className="px-5 pb-5 pt-1">
                  <p className="text-xs text-ink/35 text-center">{lb.hint}</p>
                </div>
              )}

            </div>{/* fin scroll */}
          </div>
        </div>
      )}
    </>
  );
}

/* ── Mini ficha de mall dentro del modal ── */
function MallDetail({ mall, userCoords, lb, onBack, onQuiz }) {
  const { lang } = useLanguage();
  const lm = localizeMall(mall, lang);
  const mapsUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${mall.lat},${mall.lng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mall.mapsQuery || mall.name + " Santiago")}`;

  const typeIcons = { metro: "🚇", tourist: "🌍", outlet: "🏷️", premium: "💎", family: "👨‍👩‍👧", quick: "⚡", food: "🍽️" };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-3 flex items-center gap-1.5 text-xs font-extrabold text-ink/40 hover:text-ink/70 transition"
      >
        <ChevronRight size={12} className="rotate-180" /> {lb.nearbyTitle}
      </button>

      {/* Image */}
      {mall.imageUrl && (
        <div className="mb-3 h-32 w-full overflow-hidden rounded-2xl bg-ink/5">
          <img
            src={mall.imageUrl}
            alt={mall.name}
            className="h-full w-full object-cover"
            onError={e => { e.target.style.display = "none"; }}
          />
        </div>
      )}

      {/* Header row */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold text-ink leading-tight">{mall.name}</h3>
          <p className="mt-0.5 text-xs font-semibold text-ink/45">
            {mall.commune}
            {mall.distanceKm && (
              <span className="ml-1.5 font-bold text-leaf">{mall.distanceKm} {lb.distLabel}</span>
            )}
          </p>
        </div>
        {lm.recommendedTime && (
          <span className="shrink-0 rounded-xl border border-ink/10 bg-ink/3 px-2.5 py-1 text-[10px] font-extrabold text-ink/50">
            ⏱ {lm.recommendedTime}
          </span>
        )}
      </div>

      {/* Description */}
      {lm.description && (
        <p className="mb-3 text-xs leading-relaxed text-ink/60">{lm.description}</p>
      )}

      {/* Best for tags */}
      {lm.bestFor?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {lm.bestFor.map((tag, i) => (
            <span key={i} className="rounded-full bg-leaf/8 px-2.5 py-1 text-[10px] font-extrabold text-leaf">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Type badges */}
      {mall.type?.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {mall.type.filter(t => typeIcons[t]).map(t => (
            <span key={t} className="rounded-full border border-ink/8 bg-ink/3 px-2 py-0.5 text-[10px] font-bold text-ink/50">
              {typeIcons[t]}
            </span>
          ))}
          {mall.transport?.metro && (
            <span className="rounded-full border border-leaf/20 bg-leaf/6 px-2.5 py-0.5 text-[10px] font-extrabold text-leaf">
              🚇 Metro
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-leaf/90 active:scale-[0.98]"
      >
        {lb.goNow}
      </a>
      <button
        onClick={onQuiz}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-ink/3 px-4 py-2.5 text-xs font-extrabold text-ink/50 transition hover:bg-ink/6 hover:text-ink/70"
      >
        🔍 {lb.advancedSearch}
      </button>
    </div>
  );
}
