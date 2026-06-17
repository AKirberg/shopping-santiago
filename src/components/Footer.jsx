import { MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-ink/8 bg-[#f8faf6]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <MapPin size={15} className="text-ink/35" />
          <p className="text-sm font-bold text-ink/45">Shopping Santiago · Guía MVP editable desde JSON</p>
        </div>
        <p className="text-xs font-semibold text-ink/35">Próximo: portugués · mapa · rutas desde hoteles</p>
      </div>
    </footer>
  );
}

export default Footer;
