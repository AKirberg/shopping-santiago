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

function fmtH(hours) {
  if (!hours || hours <= 0) return "0min";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
function fmtMin(min) {
  if (!min || min <= 0) return "0min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export default function LocationBar({ address, setAddress, userCoords, setUserCoords, malls = [], flightTime, availableHours, timeBreakdown, onOpenFlight, forceOpen, onForceOpenHandled }) {
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

  /* Open modal when triggered externally (e.g. from LastMinutePanel) */
  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      onForceOpenHandled?.();
    }
  }, [forceOpen]);

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

        // Reverse-geocode: Google Geocoder first, Nominatim as fallback
        let label = null;

        // 1. Try Google Geocoder (street_number + route + locality)
        try {
          const maps = await loadGoogleMaps();
          label = await new Promise((resolve) => {
            const geocoder = new maps.Geocoder();
            geocoder.geocode({ location: { lat, lng }, language: "es" }, (results, status) => {
              if (status !== "OK" || !results[0]) { resolve(null); return; }
              const comps = results[0].address_components;
              const get = (type) => comps.find(c => c.types.includes(type))?.long_name ?? "";
              const number = get("street_number");
              const street = get("route");
              const commune = get("locality") || get("sublocality") || get("administrative_area_level_3");
              const parts = [street && number ? `${street} ${number}` : street || number, commune].filter(Boolean);
              resolve(parts.length ? parts.join(", ") : results[0].formatted_address);
            });
          });
        } catch { /* fall through to Nominatim */ }

        // 2. Fallback: Nominatim
        if (!label) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
              { headers: { "Accept-Language": "es" } }
            );
            const data = await res.json();
            const a = data.address || {};
            const street = a.road || a.pedestrian || a.footway || "";
            const number = a.house_number || "";
            const commune = a.city || a.town || a.village || a.suburb || "";
            const parts = [street && number ? `${street} ${number}` : street, commune].filter(Boolean);
            label = parts.length ? parts.join(", ") : data.display_name;
          } catch { /* fall through */ }
        }

        if (!label) label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        setAddress(label);
        setDraft(label);
        saveToHistory({ label, lat, lng });
        setHistory(loadHistory());
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
      <div className="sticky top-0 sm:top-[64px] z-30 border-b border-ink/8 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">


          {/* GPS quick button — visible when no location yet */}
          {!userCoords && (
            <button
              onClick={handleGPS}
              disabled={gpsLoading}
              className={`shrink-0 flex items-center justify-center gap-1.5 h-10 rounded-2xl border px-3 text-[11px] font-extrabold whitespace-nowrap transition ${
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
              <span>{gpsLoading ? lb.gpsLoading : lb.gpsBtn}</span>
            </button>
          )}

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

        {/* ── Fila de vuelo activo — dentro del mismo sticky ── */}
        {flightTime && onOpenFlight && timeBreakdown && (
          <button
            onClick={onOpenFlight}
            className={`w-full flex items-center gap-2 border-t border-ink/6 px-4 sm:px-6 lg:px-8 py-2 text-left transition overflow-x-auto ${
              availableHours <= 0  ? "bg-coral/8 hover:bg-coral/12" :
              availableHours < 1.5 ? "bg-gold/8 hover:bg-gold/12"  :
                                     "bg-leaf/6 hover:bg-leaf/10"
            }`}
          >
            {/* Vuelo */}
            <span className="shrink-0 flex items-center gap-1.5">
              <span className="text-sm">✈️</span>
              <span className="text-xs font-extrabold text-ink/55">Vuelo {flightTime}</span>
            </span>

            <span className="shrink-0 text-ink/20 text-xs">·</span>

            {/* Traslado al mall */}
            <span className="shrink-0 flex items-center gap-1 text-[11px] text-ink/40 font-semibold">
              🚇 <span>{fmtMin(timeBreakdown.travelToMallMin)}</span>
            </span>

            <span className="shrink-0 text-ink/20 text-[10px]">→</span>

            {/* Compras — resaltado */}
            <span className={`shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-extrabold ${
              availableHours <= 0  ? "bg-coral text-white" :
              availableHours < 1.5 ? "bg-gold text-white"  :
                                     "bg-leaf text-white"
            }`}>
              🛍 {availableHours <= 0 ? "Sin tiempo" : fmtH(availableHours) + " compras"}
            </span>

            <span className="shrink-0 text-ink/20 text-[10px]">→</span>

            {/* Traslado al aeropuerto */}
            <span className="shrink-0 flex items-center gap-1 text-[11px] text-ink/40 font-semibold">
              🚕 <span>{fmtMin(timeBreakdown.minutesToAirport ?? 45)}</span>
            </span>

            <span className="shrink-0 text-ink/20 text-[10px]">→</span>

            {/* Llegada aeropuerto */}
            {timeBreakdown.mustArriveAirportTime && (
              <span className="shrink-0 flex items-center gap-1 text-[11px] text-ink/40 font-semibold">
                🛫 <span>{timeBreakdown.mustArriveAirportTime}</span>
              </span>
            )}

            <span className="ml-auto shrink-0 text-[10px] font-bold text-ink/30 pl-2">Editar →</span>
          </button>
        )}
      </div>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pb-[22vh]"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

          {/* Card — flex column, capped at 90dvh, nunca desborda */}
          <div className="relative w-full max-w-lg mx-4 rounded-3xl max-h-[90dvh] bg-white shadow-2xl flex flex-col overflow-hidden">

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

              {/* GPS button — solo cuando no hay ubicación */}
              {!userCoords && (
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
              )}

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
                      <div className="flex flex-col gap-2">
                        {nearbyMalls.map((mall, i) => {
                          const isNearest = i === 0;
                          return (
                            <button
                              key={mall.id}
                              onClick={() => setFocusedMall(mall)}
                              className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${
                                isNearest
                                  ? "border-leaf/40 bg-leaf/6 hover:bg-leaf/12"
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

              {/* Volver — al fondo */}
              <div className="px-5 pb-5 pt-3">
                <button
                  onClick={closeModal}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/12 bg-ink/3 px-4 py-3 text-sm font-extrabold text-ink/50 transition hover:bg-ink/6 hover:text-ink/70"
                >
                  Volver
                </button>
              </div>

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
    </div>
  );
}
