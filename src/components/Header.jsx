import { useState } from "react";
import { MapPin, Menu, ShoppingBag, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../i18n/LanguageContext";

function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const nav = t.header.nav;
  const navItems = [
    [nav.quiz, "#quiz"],
    [nav.routes, "#rutas"],
    [nav.galleries, "#galerias"],
    [nav.malls, "#malls"],
    [nav.compare, "#comparar"],
    [nav.tips, "#consejos"],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-[#f8faf6]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="hidden items-center rounded-xl bg-ink px-2 py-1.5 sm:flex">
            <LanguageSwitcher />
          </div>
          <a href="#inicio" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
              <ShoppingBag size={18} />
            </span>
            <span>
              <span className="block text-sm font-extrabold leading-tight">Shopeando</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-ink/45">
                <MapPin size={11} /> {t.header.subtitle}
              </span>
            </span>
          </a>
        </div>

        <nav className="hidden items-center gap-7 text-sm font-bold text-ink/60 md:flex">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className="transition hover:text-leaf">{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a className="primary-button hidden py-2.5 text-xs sm:inline-flex" href="#quiz">{t.header.cta}</a>
          <button
            className="icon-button h-9 w-9 md:hidden"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ink/8 bg-white/95 backdrop-blur-xl px-4 py-3 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            <div className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 mb-1">
              <LanguageSwitcher />
            </div>
            {navItems.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-mist hover:text-leaf"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;
