import { getTranslations, type Language } from "@/lib/i18n";

export function generateMetadata({ params }: { params: { lang: Language } }) {
  const t = getTranslations(params.lang);
  return {
    title: params.lang === 'nl' ? "Privacybeleid & Cookiebeleid - Thias Consultancy" : params.lang === 'en' ? "Privacy Policy & Cookie Policy - Thias Consultancy" : "Politique de Confidentialité & Politique des Cookies - Thias Consultancy",
    description: params.lang === 'nl'
      ? "Privacybeleid en cookiebeleid van Thias Consultancy."
      : params.lang === 'en'
      ? "Privacy policy and cookie policy of Thias Consultancy."
      : "Politique de confidentialité et politique des cookies de Thias Consultancy.",
  };
}

export default function PrivacyPage({ params }: { params: { lang: Language } }) {
  const t = getTranslations(params.lang);
  const dateFormatter = new Intl.DateTimeFormat(
    params.lang === 'nl' ? 'nl-NL' : params.lang === 'en' ? 'en-US' : 'fr-FR',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="relative isolate overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-primary-50/50 via-earth-50/30 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t.privacy.title}
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {t.privacy.lastUpdated}: {dateFormatter.format(new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              {t.privacy.privacyTitle}
            </h2>
            <p className="text-gray-700 mb-4">
              {t.privacy.privacyIntro}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.dataCollection}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.dataCollectionText}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{params.lang === 'nl' ? 'Naam' : params.lang === 'en' ? 'Name' : 'Nom'}</li>
              <li>{params.lang === 'nl' ? 'E-mailadres' : params.lang === 'en' ? 'Email address' : 'Adresse e-mail'}</li>
              <li>{params.lang === 'nl' ? 'Telefoonnummer (optioneel)' : params.lang === 'en' ? 'Phone number (optional)' : 'Numéro de téléphone (optionnel)'}</li>
              <li>{params.lang === 'nl' ? 'Bericht' : params.lang === 'en' ? 'Message' : 'Message'}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.dataUse}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.dataUseText}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{params.lang === 'nl' ? 'Het beantwoorden van uw vragen en verzoeken' : params.lang === 'en' ? 'Answering your questions and requests' : 'Répondre à vos questions et demandes'}</li>
              <li>{params.lang === 'nl' ? 'Het opnemen van contact met u over onze diensten' : params.lang === 'en' ? 'Contacting you about our services' : 'Vous contacter concernant nos services'}</li>
              <li>{params.lang === 'nl' ? 'Het verbeteren van onze dienstverlening' : params.lang === 'en' ? 'Improving our services' : 'Améliorer nos services'}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.dataProtection}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.dataProtectionText}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.yourRights}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.yourRightsText}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{params.lang === 'nl' ? 'Toegang te krijgen tot uw persoonlijke gegevens' : params.lang === 'en' ? 'Access your personal data' : 'Accéder à vos données personnelles'}</li>
              <li>{params.lang === 'nl' ? 'Uw gegevens te corrigeren of te verwijderen' : params.lang === 'en' ? 'Correct or delete your data' : 'Corriger ou supprimer vos données'}</li>
              <li>{params.lang === 'nl' ? 'Bezwaar te maken tegen de verwerking van uw gegevens' : params.lang === 'en' ? 'Object to the processing of your data' : 'Vous opposer au traitement de vos données'}</li>
              <li>{params.lang === 'nl' ? 'Uw gegevens te exporteren' : params.lang === 'en' ? 'Export your data' : 'Exporter vos données'}</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
              {t.privacy.cookiesTitle}
            </h2>
            <p className="text-gray-700 mb-4">
              {t.privacy.cookiesIntro}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.whatAreCookies}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.whatAreCookiesText}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.cookieTypes}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.cookieTypesText}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>
                <strong>{params.lang === 'nl' ? 'Essentiële cookies:' : params.lang === 'en' ? 'Essential cookies:' : 'Cookies essentiels :'}</strong>{' '}
                {params.lang === 'nl' ? 'Deze cookies zijn noodzakelijk voor het functioneren van de website en kunnen niet worden uitgeschakeld.' : params.lang === 'en' ? 'These cookies are necessary for the website to function and cannot be disabled.' : 'Ces cookies sont nécessaires au fonctionnement du site web et ne peuvent pas être désactivés.'}
              </li>
              <li>
                <strong>{params.lang === 'nl' ? 'Functionele cookies:' : params.lang === 'en' ? 'Functional cookies:' : 'Cookies fonctionnels :'}</strong>{' '}
                {params.lang === 'nl' ? 'Deze cookies stellen de website in staat om verbeterde functionaliteit en personalisatie te bieden.' : params.lang === 'en' ? 'These cookies enable the website to provide enhanced functionality and personalization.' : 'Ces cookies permettent au site web de fournir une fonctionnalité améliorée et une personnalisation.'}
              </li>
              <li>
                <strong>{params.lang === 'nl' ? 'Analytische cookies:' : params.lang === 'en' ? 'Analytical cookies:' : 'Cookies analytiques :'}</strong>{' '}
                {params.lang === 'nl' ? 'Deze cookies helpen ons te begrijpen hoe bezoekers de website gebruiken door informatie anoniem te verzamelen.' : params.lang === 'en' ? 'These cookies help us understand how visitors use the website by collecting information anonymously.' : 'Ces cookies nous aident à comprendre comment les visiteurs utilisent le site web en collectant des informations de manière anonyme.'}
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.cookieSettings}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.cookieSettingsText}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.contactTitle}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.contactText}
            </p>
            <ul className="list-none text-gray-700 mb-4 space-y-2">
              <li>
                {params.lang === 'nl' ? 'E-mail:' : params.lang === 'en' ? 'Email:' : 'E-mail :'}{' '}
                <a href="mailto:m@thiasbv.com" className="text-primary-600 hover:text-primary-700">m@thiasbv.com</a>
              </li>
              <li>
                {params.lang === 'nl' ? 'Telefoon:' : params.lang === 'en' ? 'Phone:' : 'Téléphone :'}{' '}
                <a href="tel:+32485119256" className="text-primary-600 hover:text-primary-700">+32 485 11 92 56</a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
