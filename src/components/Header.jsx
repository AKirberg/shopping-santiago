import { useState } from "react";
import { MapPin, Menu, ShoppingBag } from "lucide-react";

function Header() {
  const [open, setOpen] = useState(false);
  const navItems = [
    ["Recomendador", "#quiz"],
    ["Rutas", "#rutas"],
    ["Galerías", "#galerias"],
    ["Malls", "#malls"],
    ["Comparar", "#comparar"],
    ["Consejos", "#consejos"]
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-[#f8faf6]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white">
            <ShoppingBag size={21} />
          </span>
          <span>
            <span className="block text-base font-extrabold">Shopping Santiago</span>
            <span className="flex items-center gap-1 text-xs font-bold text-ink/55">
              <MapPin size={13} /> Guia de compras para turistas
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-extrabold text-ink/70 md:flex">
          {navItems.map(([label, href]) => <a key={href} className="hover:text-leaf" href={href}>{label}</a>)}
        </nav>
        <a className="primary-button hidden sm:inline-flex" href="#quiz">Elegir mall</a>
        <button className="icon-button md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
          <Menu size={20} />
        </button>
      </div>
      {open && (
        <nav className="border-t border-ink/10 bg-white px-4 py-3 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-extrabold text-ink/70 hover:bg-mist hover:text-leaf">
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
