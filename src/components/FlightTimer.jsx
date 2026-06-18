import { AlertTriangle, Plane, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

function FlightTimer({ flightTime, setFlightTime, availableHours }) {
  const { t } = useLanguage();
  const ft = t.flightTimer;

  const status =
    availableHours === null ? null
    : availableHours <= 0   ? "late"
    : availableHours < 1.5  ? "tight"
    : availableHours < 3    ? "ok"
    : "good";

  const statusStyles = {
    late:  "bg-coral/12 text-coral",
    tight: "bg-gold/15 text-gold",
    ok:    "bg-gold/12 text-gold",
    good:  "bg-leaf/12 text-leaf",
  };

  const statusLabel = {
    late:  ft.late,
    tight: `~${fmt(availableHours)} ${ft.tight}`,
    ok:    `~${fmt(availableHours)} ${ft.ok}`,
    good:  `~${fmt(availableHours)} ${ft.good}`,
  };

  return (
    <div className="border-b border-ink/8 bg-[#fafaf8]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Plane size={14} className="shrink-0 text-leaf" />
        <span className="text-xs font-extrabold text-ink/50">{ft.label}</span>
        <input
          type="time"
          value={flightTime}
          onChange={e => setFlightTime(e.target.value)}
          className="rounded-xl border border-ink/12 bg-white px-3 py-1.5 text-xs font-bold text-ink outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/15"
        />
        {status && (
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${statusStyles[status]}`}>
            {(status === "late" || status === "tight") && <AlertTriangle size={12} />}
            {statusLabel[status]}
          </span>
        )}
        {!flightTime && (
          <span className="text-xs text-ink/35">{ft.hint}</span>
        )}
        {flightTime && (
          <button
            onClick={() => setFlightTime("")}
            className="ml-auto flex items-center gap-1 text-xs font-bold text-ink/35 transition hover:text-ink/60"
            aria-label={ft.remove}
          >
            <X size={13} /> {ft.remove}
          </button>
        )}
      </div>
    </div>
  );
}

function fmt(hours) {
  if (hours <= 0) return "0h";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h ${m}min`;
}

export default FlightTimer;
