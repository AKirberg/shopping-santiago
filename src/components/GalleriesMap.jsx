import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "../i18n/LanguageContext";

const ZONE_COLOR = {
  "plaza-de-armas":    "#3d7a5a",
  "huerfanos-ahumada": "#b8860b",
  "bandera-monjitas":  "#c44d3b",
  "santa-lucia":       "#1a3a5c",
  "meiggs":            "#4b5563",
  "mercado-central":   "#0e7490",
};

function makeIcon(color, number) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 10 16 24 16 24s16-14 16-24C32 7.16 24.84 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="16" r="11" fill="white" opacity="0.9"/>
      <text x="16" y="20.5" text-anchor="middle" font-size="11" font-weight="800" font-family="system-ui,sans-serif" fill="${color}">${number}</text>
    </svg>`;
  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
  });
}

export default function GalleriesMap({ galleries, selectedId, onSelect }) {
  const { t, lang } = useLanguage();
  const gl = t.galleries;
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (instanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-33.4383, -70.6515],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    galleries.forEach((g, i) => {
      const color = ZONE_COLOR[g.zone] || "#666";
      const icon = makeIcon(color, i + 1);
      const desc = g.description?.[lang] || g.description?.es || "";

      const marker = L.marker([g.lat, g.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:180px;font-family:system-ui,sans-serif">
            <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.05em">${gl.zones[g.zone] || g.zone}</p>
            <h3 style="margin:0 0 4px;font-size:14px;font-weight:800;line-height:1.2">${g.name}</h3>
            <p style="margin:0 0 6px;font-size:11px;color:#555;line-height:1.4">${desc.slice(0, 90)}…</p>
            <p style="margin:0;font-size:10px;color:#888">🕐 ${g.openHours}</p>
          </div>`,
          { maxWidth: 240 }
        )
        .on("click", () => onSelect(g.id));

      markersRef.current[g.id] = marker;
    });

    instanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      instanceRef.current = null;
      markersRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!instanceRef.current) return;
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (id === selectedId) {
        marker.openPopup();
        instanceRef.current.setView(marker.getLatLng(), 16, { animate: true });
      }
    });
  }, [selectedId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/8 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/6 bg-white px-5 py-3.5">
        <div>
          <p className="eyebrow text-xs">{gl.mapTitle}</p>
          <p className="mt-0.5 text-xs text-ink/45">{gl.mapHint}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {Object.entries(ZONE_COLOR).map(([zone, color]) => (
            <span key={zone} className="flex items-center gap-1.5 text-xs font-semibold text-ink/60">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: color }} />
              {gl.zones[zone]}
            </span>
          ))}
        </div>
      </div>
      <div ref={mapRef} style={{ height: 420, width: "100%" }} />
    </div>
  );
}
