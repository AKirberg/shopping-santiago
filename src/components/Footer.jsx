import { useState } from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import PrivacyPolicy from "./PrivacyPolicy";

const PRIVACY_LABEL = { es: "Política de privacidad", en: "Privacy policy", pt: "Política de privacidade" };

const HUB_LINKS = [
  { href: "/malls/", label: "Malls" },
  { href: "/outlets/", label: "Outlets" },
  { href: "/rutas/", label: "Rutas" },
  { href: "/guias/", label: "Guías" },
  { href: "/comparar/", label: "Comparar" },
];

function Footer() {
  const { t, locale } = useLanguage();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const lang = locale === "pt" ? "pt" : locale === "en" ? "en" : "es";

  return (
    <>
      <footer className="border-t border-ink/8 bg-[#f8faf6]">
        {/* Hub links */}
        <div className="border-b border-ink/6">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-4 py-4 sm:px-6 lg:px-8">
            {HUB_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-xs font-semibold text-ink/45 transition hover:text-leaf hover:underline underline-offset-2"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <MapPin size={15} className="text-ink/35" />
            <p className="text-sm font-bold text-ink/45">{t.footer.text}</p>
          </div>
          <button
            onClick={() => setShowPrivacy(true)}
            className="self-start rounded-xl px-3 py-2.5 text-xs font-semibold text-ink/35 underline-offset-2 transition hover:text-leaf hover:underline sm:self-auto"
          >
            {PRIVACY_LABEL[lang]}
          </button>
        </div>
      </footer>

      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
    </>
  );
}

export default Footer;
