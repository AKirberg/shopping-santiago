import { useLanguage } from "../i18n/LanguageContext";

const MAP = {
  minLng: -70.665, maxLng: -70.643,
  minLat: -33.446, maxLat: -33.429,
  w: 700, h: 400,
};

function px(lat, lng) {
  const x = (lng - MAP.minLng) / (MAP.maxLng - MAP.minLng) * MAP.w;
  const y = (MAP.maxLat - lat) / (MAP.maxLat - MAP.minLat) * MAP.h;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

const ZONE_COLOR = {
  "plaza-de-armas":    "#3d7a5a",
  "huerfanos-ahumada": "#b8860b",
  "bandera-monjitas":  "#c44d3b",
  "santa-lucia":       "#1a3a5c",
  "meiggs":            "#4b5563",
  "mercado-central":   "#0e7490",
};

const EW_STREETS = [
  { lat: -33.4310, label: "Río Mapocho", ped: false },
  { lat: -33.4358, label: "Catedral",    ped: false },
  { lat: -33.4368, label: "Compañía",    ped: false },
  { lat: -33.4384, label: "Huérfanos",   ped: true  },
  { lat: -33.4393, label: "Moneda",      ped: false },
  { lat: -33.4415, label: "Alameda",     ped: false },
];

const NS_STREETS = [
  { lng: -70.6595, label: "Teatinos",    ped: false },
  { lng: -70.6555, label: "Morandé",     ped: false },
  { lng: -70.6538, label: "Bandera",     ped: false },
  { lng: -70.6515, label: "Ahumada",     ped: true  },
  { lng: -70.6490, label: "Estado",      ped: false },
  { lng: -70.6470, label: "San Antonio", ped: false },
];

const PLAZA_DE_ARMAS = { lat: -33.4375, lng: -70.6510, wLng: 0.0016, hLat: 0.0014 };

export default function GalleriesMap({ galleries, selectedId, onSelect }) {
  const { t } = useLanguage();
  const gl = t.galleries;

  const plazaPos = px(PLAZA_DE_ARMAS.lat, PLAZA_DE_ARMAS.lng);
  const plazaW = (PLAZA_DE_ARMAS.wLng / (MAP.maxLng - MAP.minLng)) * MAP.w;
  const plazaH = (PLAZA_DE_ARMAS.hLat / (MAP.maxLat - MAP.minLat)) * MAP.h;

  return (
    <div className="rounded-2xl border border-ink/8 bg-white overflow-hidden shadow-card">
      <div className="px-5 py-3.5 border-b border-ink/6 flex items-center justify-between">
        <div>
          <p className="eyebrow text-xs">{gl.mapTitle}</p>
          <p className="text-xs text-ink/45 mt-0.5">{gl.mapHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ZONE_COLOR).map(([zone, color]) => (
            <span key={zone} className="flex items-center gap-1.5 text-xs font-semibold text-ink/60">
              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              {gl.zones[zone]}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${MAP.w} ${MAP.h}`}
          width="100%"
          style={{ minWidth: 360, maxWidth: 700, display: "block", margin: "0 auto" }}
          aria-label="Mapa de galerías del centro de Santiago"
        >
          <rect width={MAP.w} height={MAP.h} fill="#f5f7f4" />

          {EW_STREETS.map(({ lat, label, ped }) => {
            const y = px(lat, MAP.minLng).y;
            return (
              <g key={label}>
                <line
                  x1={0} y1={y} x2={MAP.w} y2={y}
                  stroke={ped ? "#3d7a5a" : "#c8cfc4"}
                  strokeWidth={ped ? 4 : 1.5}
                  strokeDasharray={ped ? "" : ""}
                  opacity={ped ? 0.5 : 0.8}
                />
                <text x={4} y={y - 3} fontSize={9} fill="#9aa89a" fontFamily="sans-serif">
                  {label}
                </text>
              </g>
            );
          })}

          {NS_STREETS.map(({ lng, label, ped }) => {
            const x = px(MAP.minLat, lng).x;
            return (
              <g key={label}>
                <line
                  x1={x} y1={0} x2={x} y2={MAP.h}
                  stroke={ped ? "#3d7a5a" : "#c8cfc4"}
                  strokeWidth={ped ? 4 : 1.5}
                  opacity={ped ? 0.5 : 0.8}
                />
                <text
                  x={x} y={MAP.h - 4}
                  fontSize={9} fill="#9aa89a"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  {label}
                </text>
              </g>
            );
          })}

          <rect
            x={plazaPos.x - plazaW / 2}
            y={plazaPos.y - plazaH / 2}
            width={plazaW}
            height={plazaH}
            fill="#3d7a5a"
            opacity={0.15}
            rx={3}
          />
          <text
            x={plazaPos.x}
            y={plazaPos.y + 3}
            fontSize={8}
            fill="#3d7a5a"
            fontFamily="sans-serif"
            textAnchor="middle"
            fontWeight="bold"
          >
            Plaza de Armas
          </text>

          {galleries.map((g, i) => {
            const pos = px(g.lat, g.lng);
            const color = ZONE_COLOR[g.zone] || "#666";
            const isSelected = g.id === selectedId;
            return (
              <g key={g.id} onClick={() => onSelect(g.id)} style={{ cursor: "pointer" }}>
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isSelected ? 15 : 12}
                  fill={color}
                  opacity={isSelected ? 1 : 0.85}
                  stroke="white"
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ transition: "r 0.15s, opacity 0.15s" }}
                />
                <text
                  x={pos.x} y={pos.y + 4}
                  fontSize={10}
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                  pointerEvents="none"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}

          <g transform={`translate(${MAP.w - 32}, 20)`}>
            <polygon points="0,-10 4,0 0,-4 -4,0" fill="#3d7a5a" />
            <text x={0} y={10} fontSize={9} textAnchor="middle" fill="#3d7a5a" fontFamily="sans-serif" fontWeight="bold">N</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
