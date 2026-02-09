import { Phone, Mail, MapPin, Linkedin } from "lucide-react";
import { getTranslations, type Language } from "@/lib/i18n";

export function generateMetadata({ params }: { params: { lang: Language } }) {
  const t = getTranslations(params.lang);
  return {
    title: params.lang === 'nl' ? "Contact - Thias Consultancy" : params.lang === 'en' ? "Contact - Thias Consultancy" : "Contact - Thias Consultancy",
    description: params.lang === 'nl'
      ? "Neem contact op met Thias Consultancy voor al jouw ServiceNow vragen en projecten."
      : params.lang === 'en'
      ? "Contact Thias Consultancy for all your ServiceNow questions and projects."
      : "Contactez Thias Consultancy pour toutes vos questions et projets ServiceNow.",
  };
}

export default function ContactPage({ params }: { params: { lang: Language } }) {
  const t = getTranslations(params.lang);
  const location = params.lang === 'nl' ? "Brugge Regio, België" : params.lang === 'en' ? "Bruges Region, Belgium" : "Région de Bruges, Belgique";

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="relative isolate overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-primary-50/50 via-earth-50/30 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {t.contact.title}
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              {t.contact.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">
                  {t.contact.contactInfo}
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  {t.contact.contactSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="group flex items-start gap-4 rounded-xl bg-white p-6 ring-1 ring-gray-200/50 hover:ring-primary-200 hover:shadow-md transition-all duration-200">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 group-hover:from-primary-600 group-hover:to-primary-500 transition-all duration-200">
                    <Phone className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t.contact.phone}
                    </h3>
                    <a
                      href="tel:+32485119256"
                      className="mt-2 block text-gray-600 hover:text-primary-600 transition-colors font-medium"
                    >
                      +32 485 11 92 56
                    </a>
                  </div>
                </div>

                <div className="group flex items-start gap-4 rounded-xl bg-white p-6 ring-1 ring-gray-200/50 hover:ring-primary-200 hover:shadow-md transition-all duration-200">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 group-hover:from-primary-600 group-hover:to-primary-500 transition-all duration-200">
                    <Mail className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t.contact.email}
                    </h3>
                    <a
                      href="mailto:m@thiasbv.com"
                      className="mt-2 block text-gray-600 hover:text-primary-600 transition-colors font-medium"
                    >
                      m@thiasbv.com
                    </a>
                  </div>
                </div>

                <div className="group flex items-start gap-4 rounded-xl bg-white p-6 ring-1 ring-gray-200/50 hover:ring-primary-200 hover:shadow-md transition-all duration-200">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 group-hover:from-primary-600 group-hover:to-primary-500 transition-all duration-200">
                    <MapPin className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t.contact.location}
                    </h3>
                    <p className="mt-2 text-gray-600 font-medium">{location}</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 rounded-xl bg-white p-6 ring-1 ring-gray-200/50 hover:ring-primary-200 hover:shadow-md transition-all duration-200">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 group-hover:from-primary-600 group-hover:to-primary-500 transition-all duration-200">
                    <Linkedin className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t.contact.linkedin}
                    </h3>
                    <a
                      href="https://www.linkedin.com/in/mathiasvdd/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-gray-600 hover:text-primary-600 transition-colors font-medium"
                    >
                      {t.contact.linkedinText}
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-primary-50 to-white p-6 ring-1 ring-primary-100 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.contact.availability}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t.contact.availabilityText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
