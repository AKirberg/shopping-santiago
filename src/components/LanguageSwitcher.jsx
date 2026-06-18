import { useLanguage } from "../i18n/LanguageContext";

const LANGS = [
  { code: "es", flag: "🇨🇱", label: "ES" },
  { code: "pt", flag: "🇧🇷", label: "PT" },
  { code: "en", flag: "🇺🇸", label: "EN" },
];

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-0.5">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-extrabold transition ${
            lang === code
              ? "bg-white/15 text-white"
              : "text-white/45 hover:bg-white/10 hover:text-white/80"
          }`}
          aria-label={label}
          title={label}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
