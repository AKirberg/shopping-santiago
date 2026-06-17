import { useState } from "react";
import { MapPin, Menu, ShoppingBag, X } from "lucide-react";

const navItems = [
  ["Recomendador", "#quiz"],
  ["Rutas", "#rutas"],
  ["Malls", "#malls"],
  ["Comparar", "#comparar"],
  ["Consejos", "#consejos"]
];

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-[#f8faf6]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
            <ShoppingBag size={18} />
          </span>
          <span>
            <span className="block text-sm font-extrabold leading-tight">Shopping Santiago</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-ink/45">
              <MapPin size={11} /> Guía para turistas
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-bold text-ink/60 md:flex">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className="transition hover:text-leaf">{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a className="primary-button hidden py-2.5 text-xs sm:inline-flex" href="#quiz">Elegir mall</a>
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
