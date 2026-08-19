// @refresh reset
import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

function initialLanguage() {
  const queryLanguage = new URLSearchParams(window.location.search).get("lang");
  if (queryLanguage === "pt" || queryLanguage === "pt-BR") return "pt";
  if (queryLanguage === "en") return "en";
  if (queryLanguage === "es") return "es";

  try {
    const savedLanguage = localStorage.getItem("ss-lang");
    if (savedLanguage && translations[savedLanguage]) return savedLanguage;
  } catch {}

  const browserLanguage = navigator.language?.toLowerCase() || "";
  if (browserLanguage.startsWith("pt")) return "pt";
  if (browserLanguage.startsWith("en")) return "en";
  return "es";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang === "en" ? "en" : "es-CL";
  }, [lang]);

  function setLang(l) {
    setLangState(l);
    try { localStorage.setItem("ss-lang", l); } catch {}

    const url = new URL(window.location.href);
    if (l === "es") url.searchParams.delete("lang");
    else url.searchParams.set("lang", l);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
