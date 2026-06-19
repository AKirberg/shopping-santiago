import { useMemo, useState } from "react";
import { AlertTriangle, ChevronRight, Clock, Plane, ShoppingBag, X, Zap } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

function parseMinHours(str) {
  if (!str) return 99;
  const match = str.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 99;
}

function fmt(hours) {
  if (hours <= 0) return "0h";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h ${m}min`;
}

export default function LastMinutePanel({ flightTime, setFlightTime, availableHours, malls, onSelectMall }) {
  const [showInput, setShowInput] = useState(false);
  const { t } = useLanguage();
  const lm = t.lastMinute;
  const ft = t.flightTimer;

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
    late:  { bar: "border-coral/20 bg-coral/5",  badge: "bg-coral text-white",      icon: <AlertTriangle size={15} />, timeColor: "text-coral",  ctaBorder: "border-coral/35 bg-coral/8 text-coral hover:bg-coral hover:text-white" },
    tight: { bar: "border-gold/20 bg-gold/5",    badge: "bg-gold text-white",        icon: <Zap size={15} />,          timeColor: "text-gold",   ctaBorder: "border-gold/35 bg-gold/8 text-gold hover:bg-gold hover:text-white" },
    ok:    { bar: "border-leaf/20 bg-leaf/5",    badge: "bg-leaf text-white",        icon: <Clock size={15} />,        timeColor: "text-leaf",   ctaBorder: "border-leaf/35 bg-leaf/8 text-leaf hover:bg-leaf hover:text-white" },
    good:  { bar: "border-leaf/20 bg-leaf/5",    badge: "bg-leaf text-white",        icon: <ShoppingBag size={15} />, timeColor: "text-leaf",   ctaBorder: "border-leaf/35 bg-leaf/8 text-leaf hover:bg-leaf hover:text-white" },
  };

  const inputVisible = showInput || !!flightTime;

  function handleRemove() {
    setFlightTime("");
    setShowInput(false);
  }

  /* ── Empty / no flight time entered ── */
  if (status === null && !inputVisible) {
    return (
      <div className="border-b border-ink/8 bg-[#fafaf8]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-ink/15 px-5 py-4">
            <span className="flex items-center gap-2 text-xs font-extrabold text-ink/35">
              <ShoppingBag size={13} />
              {lm.title}
            </span>
            <p className="text-xs font-medium text-ink/40">{lm.emptyHint}</p>
            <button
              onClick={() => setShowInput(true)}
              className="ml-auto flex items-center gap-1.5 rounded-xl border border-leaf/30 bg-leaf/8 px-3 py-1.5 text-xs font-extrabold text-leaf transition hover:bg-leaf hover:text-white"
            >
              <Plane size={12} />
              {lm.enterFlightCta}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Input revealed (no time set yet) ── */
  if (status === null && inputVisible) {
    return (
      <div className="border-b border-ink/8 bg-[#fafaf8]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-leaf/25 bg-white px-5 py-4 shadow-sm">
            <span className="flex items-center gap-2 text-xs font-extrabold text-ink/40">
              <ShoppingBag size={13} />
              {lm.title}
            </span>
            <div className="flex items-center gap-2 ml-2">
              <Plane size={14} className="text-leaf shrink-0" />
              <span className="text-xs font-extrabold text-ink/50">{ft.label}</span>
              <input
                type="time"
                value={flightTime}
                onChange={e => setFlightTime(e.target.value)}
                autoFocus
                className="rounded-xl border border-ink/12 bg-[#f8faf6] px-3 py-1.5 text-xs font-bold text-ink outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/15"
              />
            </div>
            <p className="text-xs text-ink/35">{ft.hint}</p>
            <button
              onClick={handleRemove}
              className="ml-auto flex items-center gap-1 text-xs font-bold text-ink/30 transition hover:text-ink/60"
            >
              <X size={12} /> {ft.remove}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active: flight time entered ── */
  const th = themes[status];
  return (
    <div className={`border-b ${th.bar}`}>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${th.badge}`}>
            {th.icon}
            {lm.title}
          </span>
          <p className="text-xs text-ink/55 font-medium">{lm.subtitle[status]}</p>

          {/* Time display */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className={`font-display text-3xl font-extrabold tabular-nums ${th.timeColor}`}>
                {availableHours > 0 ? fmt(availableHours) : "0h"}
              </span>
              <span className="text-xs font-bold text-ink/40">{lm.forShopping}</span>
            </div>
            {/* Inline flight time edit */}
            <div className="flex items-center gap-1.5 rounded-xl border border-ink/12 bg-white/70 px-2.5 py-1">
              <Plane size={11} className="text-ink/35" />
              <input
                type="time"
                value={flightTime}
                onChange={e => setFlightTime(e.target.value)}
                className="w-20 bg-transparent text-xs font-bold text-ink outline-none"
              />
              <button onClick={handleRemove} className="text-ink/25 hover:text-ink/60 transition">
                <X size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Late message */}
        {status === "late" && (
          <p className="mb-3 rounded-2xl border border-coral/20 bg-white px-4 py-3 text-sm font-semibold text-coral/80">
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
                    <p className="truncate text-xs font-extrabold text-ink leading-tight">{mall.name}</p>
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
              onClick={() => document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" })}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-extrabold transition ${th.ctaBorder}`}
            >
              {lm.cta}
              <ChevronRight size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
