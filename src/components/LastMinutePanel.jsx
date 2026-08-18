import { useMemo, useState } from "react";
import { AlertTriangle, ChevronRight, MapPin, Plane, ShoppingBag, X, Zap, Clock } from "lucide-react";
import { fmtMin } from "../utils/timeCalc";
import { useLanguage } from "../i18n/LanguageContext";

function parseMinHours(str) {
  if (!str) return 99;
  const match = str.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 99;
}

function fmtHrs(hours) {
  if (!hours || hours <= 0) return "0h";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h ${m}min`;
}

const AIRPORT_OPTIONS = [30, 45, 60, 90];

export default function LastMinutePanel({
  flightTime, setFlightTime,
  timeBreakdown, minutesToAirport, setMinutesToAirport,
  flightType, setFlightType,
  malls, onSelectMall,
  autoOpen = false,
  onClose,
  address,
  onOpenAddress,
}) {
  const [showInput, setShowInput] = useState(autoOpen);
  const [rawTime, setRawTime] = useState(flightTime || "");
  const { t } = useLanguage();
  const lm = t.lastMinute;
  const ft = t.flightTimer;

  function handleTimeChange(e) {
    let v = e.target.value.replace(/[^\d:]/g, "");
    if (v.length === 2 && !v.includes(":") && e.nativeEvent.inputType !== "deleteContentBackward") {
      v = v + ":";
    }
    if (v.length > 5) v = v.slice(0, 5);
    setRawTime(v);
    if (/^\d{2}:\d{2}$/.test(v)) {
      const [h, m] = v.split(":").map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) setFlightTime(v);
    } else {
      setFlightTime("");
    }
  }

  function handleRemove() {
    setFlightTime("");
    setRawTime("");
    setShowInput(false);
  }

  const bd = timeBreakdown;
  const availableHours = bd?.availableHours ?? null;

  const status =
    availableHours === null ? null
    : availableHours <= 0   ? "late"
    : availableHours < 1.5  ? "tight"
    : availableHours < 3    ? "ok"
    : "good";

  const eligibleMalls = useMemo(() => {
    if (!availableHours || availableHours <= 0) return [];
    return malls
      .filter(m => parseMinHours(m.recommendedTime) <= Math.max(availableHours, 0.5) + 0.5)
      .sort((a, b) => parseMinHours(a.recommendedTime) - parseMinHours(b.recommendedTime))
      .slice(0, status === "tight" ? 3 : 4);
  }, [availableHours, malls, status]);

  const themes = {
    late:  { bar: "border-coral/20 bg-coral/5",  badge: "bg-coral text-white",    icon: <AlertTriangle size={14} />, timeColor: "text-coral",  ctaCls: "border-coral/35 bg-coral/8 text-coral hover:bg-coral hover:text-white" },
    tight: { bar: "border-gold/20 bg-gold/5",    badge: "bg-gold text-white",      icon: <Zap size={14} />,           timeColor: "text-gold",   ctaCls: "border-gold/35 bg-gold/8 text-gold hover:bg-gold hover:text-white" },
    ok:    { bar: "border-leaf/20 bg-leaf/5",    badge: "bg-leaf text-white",      icon: <Clock size={14} />,         timeColor: "text-leaf",   ctaCls: "border-leaf/35 bg-leaf/8 text-leaf hover:bg-leaf hover:text-white" },
    good:  { bar: "border-leaf/20 bg-leaf/5",    badge: "bg-leaf text-white",      icon: <ShoppingBag size={14} />,   timeColor: "text-leaf",   ctaCls: "border-leaf/35 bg-leaf/8 text-leaf hover:bg-leaf hover:text-white" },
  };

  const inputVisible = showInput || !!flightTime;

  /* ── Location header (only in modal/autoOpen mode) ── */
  function LocationHeader() {
    if (!autoOpen) return null;
    if (address) {
      return (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-ink/8 bg-white/70 px-3 py-2">
          <MapPin size={12} className="shrink-0 text-leaf" />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink/60">{address}</span>
        </div>
      );
    }
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-dashed border-ink/15 bg-white/50 px-3 py-2">
        <MapPin size={12} className="shrink-0 text-ink/30" />
        <span className="flex-1 text-xs font-medium text-ink/40">Agrega tu ubicación para calcular la distancia al mall</span>
        {onOpenAddress && (
          <button
            onClick={onOpenAddress}
            className="shrink-0 rounded-lg border border-leaf/25 bg-leaf/8 px-2.5 py-1 text-[10px] font-extrabold text-leaf transition hover:bg-leaf hover:text-white"
          >
            Agregar
          </button>
        )}
      </div>
    );
  }

  /* ── Shared: flight-type + airport-travel selectors ── */
  function ConfigRow() {
    return (
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {/* Flight type */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-ink/40">{lm.flightTypeLabel}</span>
          <div className="flex gap-1">
            {[["international", lm.flightTypeIntl], ["domestic", lm.flightTypeDomestic]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFlightType(key)}
                className={`rounded-full px-3 py-2 text-xs font-extrabold transition ${
                  flightType === key ? "bg-ink text-white" : "border border-ink/12 text-ink/45 hover:border-ink/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Travel to airport */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-ink/40">{lm.toAirportLabel}</span>
          <div className="flex gap-1">
            {AIRPORT_OPTIONS.map(min => (
              <button
                key={min}
                onClick={() => setMinutesToAirport(min)}
                className={`rounded-full px-3 py-2 text-xs font-extrabold transition ${
                  minutesToAirport === min ? "bg-ink text-white" : "border border-ink/12 text-ink/45 hover:border-ink/30"
                }`}
              >
                {lm.toAirportOptions[String(min)]}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── State 1: no flight time, input not shown ── */
  if (!inputVisible) {
    return (
      <div className="border-b border-ink/8 bg-[#fafaf8]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-coral/50 bg-coral/3 px-5 py-4">
            <span className="flex items-center gap-2 text-xs font-extrabold text-coral">
              <ShoppingBag size={13} /> {lm.title}
            </span>
            <p className="text-xs font-medium text-ink/40">{lm.emptyHint}</p>
            <button
              onClick={() => setShowInput(true)}
              className="ml-auto flex items-center gap-1.5 rounded-xl border border-leaf/30 bg-leaf/8 px-4 py-2.5 text-xs font-extrabold text-leaf transition hover:bg-leaf hover:text-white"
            >
              <Plane size={12} /> {lm.enterFlightCta}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── State 2: input shown, no time set yet ── */
  if (status === null) {
    return (
      <div className="border-b border-ink/8 bg-[#fafaf8]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <LocationHeader />
          <div className="rounded-2xl border border-coral/40 bg-coral/3 px-5 py-4 shadow-sm">
            {/* Config row: type + airport travel FIRST */}
            <div className="mb-4 pb-3 border-b border-ink/6">
              <ConfigRow />
            </div>
            {/* Hour input row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-xs font-extrabold text-ink/40">
                <ShoppingBag size={13} /> {lm.title}
              </span>
              <div className="flex items-center gap-2 ml-2">
                <Plane size={13} className="text-leaf shrink-0" />
                <span className="text-xs font-extrabold text-ink/50">{ft.label}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={rawTime}
                  onChange={handleTimeChange}
                  placeholder="20:30"
                  autoFocus
                  maxLength={5}
                  className="w-20 rounded-xl border border-ink/12 bg-[#f8faf6] px-3 py-1.5 text-xs font-bold text-ink outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/15"
                />
              </div>
              <p className="text-xs text-ink/35 hidden sm:block">{ft.hint}</p>
              <button onClick={handleRemove} className="ml-auto p-2 text-ink/30 hover:text-ink/60 transition">
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── State 3: flight time active, show full breakdown ── */
  const th = themes[status];
  const airportBufferMin = bd?.airportBufferMin ?? 240;

  return (
    <div className={`border-b border-l-4 border-l-coral ${th.bar}`}>
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <LocationHeader />

        {/* Top row: badge + subtitle + time + edit input */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${th.badge}`}>
            {th.icon} {lm.title}
          </span>
          <p className="text-xs font-medium text-ink/55">{lm.subtitle[status]}</p>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className={`font-display text-3xl font-extrabold tabular-nums leading-none ${th.timeColor}`}>
                {fmtHrs(availableHours)}
              </span>
              <span className="text-xs font-bold text-ink/40">{lm.forShopping}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-ink/12 bg-white/80 px-2.5 py-1">
              <Plane size={10} className="text-ink/35" />
              <input
                type="text"
                inputMode="numeric"
                value={rawTime}
                onChange={handleTimeChange}
                placeholder="20:30"
                maxLength={5}
                className="w-[4rem] bg-transparent text-xs font-bold text-ink outline-none"
              />
              <button onClick={handleRemove} className="p-1.5 text-ink/25 hover:text-ink/60 transition">
                <X size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Time breakdown timeline */}
        <div className="mb-4 rounded-2xl border border-ink/8 bg-white px-5 py-4">

          {/* Config row at the TOP — type + airport travel */}
          <div className="mb-4 pb-3 border-b border-ink/6">
            <ConfigRow />
          </div>

          {/* Timeline steps */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <TimeStep
              icon="🚇"
              label={lm.breakdown.travelToMall}
              duration={fmtMin(bd.travelToMallMin)}
              color="text-ink/50"
            />
            <TimeStep
              icon="🛍"
              label={lm.breakdown.shopping}
              duration={fmtHrs(availableHours)}
              color={th.timeColor}
              bold
              deadline={bd.mustLeaveMallTime ? `${lm.breakdown.leaveMall} ${bd.mustLeaveMallTime}` : null}
            />
            <TimeStep
              icon="🚕"
              label={lm.breakdown.travelToAirport}
              duration={fmtMin(minutesToAirport)}
              color="text-ink/50"
              deadline={bd.mustArriveAirportTime ? `${lm.breakdown.arriveAirport} ${bd.mustArriveAirportTime}` : null}
            />
            <TimeStep
              icon="✈️"
              label={`${lm.breakdown.checkin} · ${lm.breakdown.boarding}`}
              duration={fmtMin(airportBufferMin)}
              color="text-ink/50"
              deadline={`${lm.breakdown.departure} ${bd.departureTime}`}
            />
          </div>
        </div>

        {/* Late message */}
        {status === "late" && (
          <p className="mb-4 rounded-2xl border border-coral/20 bg-white px-4 py-3 text-sm font-semibold text-coral/80">
            {lm.lateMessage}
          </p>
        )}

        {/* Mall suggestions */}
        {eligibleMalls.length > 0 && (
          <>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {eligibleMalls.map(mall => (
                <button
                  key={mall.id}
                  onClick={() => onSelectMall(mall)}
                  className="group flex items-center gap-3 rounded-2xl border border-ink/8 bg-white px-4 py-3 text-left shadow-sm transition hover:border-leaf/30 hover:shadow-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-ink leading-tight">{mall.name}</p>
                    <p className="text-[10px] font-semibold text-ink/45 mt-0.5">
                      {mall.commune}
                      <span className={`ml-1.5 font-bold ${th.timeColor}`}>{mall.recommendedTime}</span>
                    </p>
                  </div>
                  <ChevronRight size={13} className="shrink-0 text-ink/20 transition group-hover:text-leaf" />
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                onClose?.();
                setTimeout(() => document.getElementById("malls")?.scrollIntoView({ behavior: "smooth" }), 150);
              }}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-extrabold transition ${th.ctaCls}`}
            >
              {lm.cta} <ChevronRight size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function TimeStep({ icon, label, duration, color, bold, deadline }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-base leading-none">{icon}</span>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-ink/35">{label}</p>
        <p className={`text-sm font-extrabold ${color} ${bold ? "text-base" : ""}`}>{duration}</p>
        {deadline && <p className="text-xs font-bold text-ink/40 mt-0.5">{deadline}</p>}
      </div>
    </div>
  );
}
