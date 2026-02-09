import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations, type Language } from "@/lib/i18n";

export default function Hero({ lang = 'nl' }: { lang?: Language }) {
  const t = getTranslations(lang);
  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* Gradient overlay with 2026 colors - Digital Lavender & Earth tones */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 via-earth-200 to-sage-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-16 sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 bg-white/80 backdrop-blur-sm">
              <span className="font-semibold text-primary-600">
                {t.hero.badge}
              </span>
              <span className="mx-2">•</span>
              <span>{t.hero.subtitle}</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
              <span className="block">{t.hero.title}</span>
              <span className="block mt-2 text-primary-600">{t.hero.titleHighlight}</span>
            </h1>
            
            <p className="mt-6 text-xl leading-8 text-gray-600 sm:text-2xl max-w-3xl mx-auto">
              {t.hero.description}
            </p>
            
            <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              {t.hero.description2}
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link
                href={`/${lang}/diensten`}
                className="group rounded-lg bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/50 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-700/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200 flex items-center gap-2"
              >
                {t.hero.cta1}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="group rounded-lg bg-white px-8 py-4 text-base font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200"
              >
                {t.hero.cta2}
              </Link>
            </div>
          </div>

          {/* Stats or highlights */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{t.hero.stats.independent}</div>
              <div className="mt-2 text-sm font-medium text-gray-900">{t.hero.stats.independentLabel}</div>
              <div className="mt-1 text-xs text-gray-500">{t.hero.stats.independentSub}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{t.hero.stats.pragmatic}</div>
              <div className="mt-2 text-sm font-medium text-gray-900">{t.hero.stats.pragmaticLabel}</div>
              <div className="mt-1 text-xs text-gray-500">{t.hero.stats.pragmaticSub}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{t.hero.stats.experience}</div>
              <div className="mt-2 text-sm font-medium text-gray-900">{t.hero.stats.experienceLabel}</div>
              <div className="mt-1 text-xs text-gray-500">{t.hero.stats.experienceSub}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
