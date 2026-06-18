import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, MapPin, Sparkles, X } from "lucide-react";
import { getRecommendations } from "../utils/scoring";
import { useLanguage } from "../i18n/LanguageContext";

const initialAnswers = {
  zone: "Providencia",
  category: "ropa",
  time: "3-4 horas",
  transport: "Metro",
  withKids: "No",
  goal: "variedad",
};

function useAddressSuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: `${query}, Santiago, Chile`,
          format: "json",
          countrycodes: "cl",
          limit: "6",
          viewbox: "-71.1,-33.75,-70.35,-33.1",
          bounded: "1",
          "accept-language": "es",
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          headers: { "Accept-Language": "es" },
        });
        const data = await res.json();
        setSuggestions(data.map(d => ({
          label: d.display_name.split(",").slice(0, 3).join(", "),
          full: d.display_name,
        })));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  return { suggestions, loading };
}

function RecommendationQuiz({ malls, onSelect }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [customAddress, setCustomAddress] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const { t } = useLanguage();
  const q = t.quiz;
  const { suggestions, loading } = useAddressSuggestions(customAddress);
  const recommendations = useMemo(() => getRecommendations(malls, answers).slice(0, 4), [answers, malls]);

  function set(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  function handleAddressChange(e) {
    const val = e.target.value;
    setCustomAddress(val);
    setShowDropdown(true);
    if (val.trim()) {
      setAnswers(prev => ({ ...prev, zone: val.trim() }));
    }
  }

  function selectSuggestion(label) {
    setCustomAddress(label);
    setAnswers(prev => ({ ...prev, zone: label }));
    setShowDropdown(false);
  }

  function clearAddress() {
    setCustomAddress("");
    setShowDropdown(false);
    setAnswers(prev => ({ ...prev, zone: "Providencia" }));
    inputRef.current?.focus();
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const zoneField = q.fields.find(f => f.key === "zone");
  const otherFields = q.fields.filter(f => f.key !== "zone");
  const zoneIsCustom = customAddress.trim() && answers.zone === customAddress.trim();

  return (
    <section id="quiz" className="bg-white">
      <div className="section-shell">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">{q.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">{q.title}</h2>
          <p className="mt-3 text-sm leading-6 text-ink/55">{q.subtitle}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-6">
            {/* Zone field — pills + address autocomplete */}
            {zoneField && (
              <div>
                <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-ink/45">{zoneField.label}</p>
                <div className="flex flex-wrap gap-2">
                  {zoneField.options.map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => { set("zone", v); setCustomAddress(""); setShowDropdown(false); }}
                      className={answers.zone === v && !zoneIsCustom ? "quiz-pill-active" : "quiz-pill"}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {/* Address input with autocomplete */}
                <div className="relative mt-3">
                  <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
                    zoneIsCustom
                      ? "border-leaf bg-leaf/5"
                      : "border-ink/12 bg-ink/3 focus-within:border-ink/30"
                  }`}>
                    <MapPin size={14} className={zoneIsCustom ? "text-leaf shrink-0" : "text-ink/35 shrink-0"} />
                    <input
                      ref={inputRef}
                      type="text"
                      value={customAddress}
                      onChange={handleAddressChange}
                      onFocus={() => customAddress.length >= 3 && setShowDropdown(true)}
                      placeholder={zoneField.addressPlaceholder}
                      className="w-full bg-transparent text-sm text-ink placeholder-ink/35 outline-none"
                      autoComplete="off"
                    />
                    {customAddress && (
                      <button onClick={clearAddress} className="shrink-0 text-ink/30 hover:text-ink/60">
                        <X size={13} />
                      </button>
                    )}
                    {loading && (
                      <span className="shrink-0 h-3 w-3 animate-spin rounded-full border-2 border-ink/20 border-t-ink/60" />
                    )}
                  </div>

                  {/* Suggestions dropdown */}
                  {showDropdown && suggestions.length > 0 && (
                    <ul
                      ref={dropdownRef}
                      className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-card"
                    >
                      {suggestions.map((s, i) => (
                        <li key={i}>
                          <button
                            onMouseDown={e => { e.preventDefault(); selectSuggestion(s.label); }}
                            className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-leaf/6 transition-colors"
                          >
                            <MapPin size={13} className="mt-0.5 shrink-0 text-ink/35" />
                            <span className="text-ink/80 leading-snug">{s.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* All other fields */}
            {otherFields.map(({ key, label, options }) => (
              <div key={key}>
                <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-ink/45">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {options.map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => set(key, v)}
                      className={answers[key] === v ? "quiz-pill-active" : "quiz-pill"}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf text-white">
                <Sparkles size={17} />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink/40">{q.resultsLabel}</p>
                <p className="text-sm font-extrabold">{q.resultsSubLabel}</p>
              </div>
            </div>

            <div className="grid gap-3">
              {recommendations.map((mall, index) => (
                <button
                  key={mall.id}
                  onClick={() => onSelect(mall)}
                  className="group rounded-2xl border border-ink/8 bg-[#f8faf6] p-4 text-left transition hover:border-leaf/30 hover:bg-white hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${
                        index === 0 ? "bg-leaf" : "bg-ink/25"
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-extrabold leading-tight">{mall.name}</p>
                        <p className="mt-0.5 text-xs font-semibold text-ink/45">{mall.commune} · {mall.recommendedTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-extrabold text-white">
                        {mall.recommendationScore}
                      </span>
                      <ArrowRight size={14} className="text-ink/25 transition group-hover:text-leaf" />
                    </div>
                  </div>
                  {mall.reasons?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {mall.reasons.slice(0, 3).map(r => (
                        <span key={r} className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-xs font-bold text-ink/55">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RecommendationQuiz;
