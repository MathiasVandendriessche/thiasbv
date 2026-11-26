"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { languages, type Language } from "@/lib/i18n";

export default function LanguageSwitcher({ currentLang }: { currentLang: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close on outside press or Escape. Listening on pointerdown keeps the
  // rest of the page responsive: no invisible overlay swallowing the first tap.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const switchLanguage = (lang: Language) => {
    // Remove current language from pathname and add new one
    const pathWithoutLang = pathname.replace(/^\/(nl|en|fr)/, '') || '/';
    const newPath = `/${lang}${pathWithoutLang}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="btn flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-900/5 hover:text-primary-700"
        aria-label="Select language"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="uppercase">{currentLang}</span>
      </button>

      {/* Grows out of the button that opened it: origin sits at the trigger */}
      <div
        data-open={isOpen}
        inert={!isOpen}
        className="popover absolute left-0 z-50 mt-2 w-40 origin-top-left rounded-xl bg-white p-1 shadow-xl shadow-gray-900/10 ring-1 ring-gray-900/5 md:left-auto md:right-0 md:origin-top-right"
      >
        {(Object.keys(languages) as Language[]).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => switchLanguage(lang)}
            aria-current={currentLang === lang ? "true" : undefined}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 active:bg-gray-200 ${
              currentLang === lang
                ? 'bg-primary-50 font-semibold text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {languages[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}
