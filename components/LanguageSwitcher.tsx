"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useState } from "react";
import { languages, type Language } from "@/lib/i18n";

export default function LanguageSwitcher({ currentLang }: { currentLang: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (lang: Language) => {
    // Remove current language from pathname and add new one
    const pathWithoutLang = pathname.replace(/^\/(nl|en|fr)/, '') || '/';
    const newPath = `/${lang}${pathWithoutLang}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors text-sm font-medium"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{currentLang}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white shadow-lg ring-1 ring-gray-200 z-50">
            <div className="py-1">
              {(Object.keys(languages) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => switchLanguage(lang)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    currentLang === lang
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {languages[lang]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
