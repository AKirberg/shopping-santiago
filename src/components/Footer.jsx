import { MapPin } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-ink/8 bg-[#f8faf6]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <MapPin size={15} className="text-ink/35" />
          <p className="text-sm font-bold text-ink/45">{t.footer.text}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
