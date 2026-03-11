import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getTranslations, type Language } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const seoContent = {
  nl: {
    title: "AI en ServiceNow Freelance Consultant België | Thias Consultancy",
    description: "AI freelance België en ServiceNow freelance België. Freelance consultant gespecialiseerd in AI, ServiceNow en IT servicemanagement. Doelgerichte consultancy met meer dan 20 jaar ervaring. Implementatie, optimalisatie en integraties in België.",
    ogDescription: "AI freelance België & ServiceNow freelance België. Freelance consultant voor AI en ServiceNow implementatie met meer dan 20 jaar ervaring.",
    keywords: [
      "AI freelance België",
      "ServiceNow freelance België",
      "AI freelance consultant België",
      "ServiceNow freelance consultant België",
      "AI freelance",
      "ServiceNow freelance",
      "ServiceNow freelance consultant",
      "freelance ServiceNow",
      "ServiceNow consultant België",
      "ITSM België",
      "AI implementatie België",
    ],
  },
  en: {
    title: "AI & ServiceNow Freelance Consultant Belgium | Thias Consultancy",
    description: "AI freelance Belgium and ServiceNow freelance Belgium. Freelance consultant specializing in AI, ServiceNow and IT service management. Goal-oriented consultancy with over 20 years of experience. Implementation, optimization and integrations in Belgium.",
    ogDescription: "AI freelance Belgium & ServiceNow freelance Belgium. Freelance consultant for AI and ServiceNow implementation with over 20 years of experience.",
    keywords: [
      "AI freelance Belgium",
      "ServiceNow freelance Belgium",
      "AI freelance consultant Belgium",
      "ServiceNow freelance consultant Belgium",
      "AI freelance",
      "ServiceNow freelance",
      "ServiceNow freelance consultant",
      "freelance ServiceNow",
      "ServiceNow consultant Belgium",
      "ITSM Belgium",
      "AI implementation Belgium",
    ],
  },
  fr: {
    title: "IA & ServiceNow Freelance Consultant Belgique | Thias Consultancy",
    description: "IA freelance Belgique et ServiceNow freelance Belgique. Consultant freelance spécialisé en IA, ServiceNow et gestion des services IT. Conseil orienté résultats avec plus de 20 ans d'expérience. Implémentation, optimisation et intégrations en Belgique.",
    ogDescription: "IA freelance Belgique & ServiceNow freelance Belgique. Consultant freelance pour implémentation IA et ServiceNow avec plus de 20 ans d'expérience.",
    keywords: [
      "IA freelance Belgique",
      "ServiceNow freelance Belgique",
      "IA freelance consultant Belgique",
      "ServiceNow freelance consultant Belgique",
      "IA freelance",
      "ServiceNow freelance",
      "consultant ServiceNow freelance",
      "ServiceNow consultant Belgique",
      "ITSM Belgique",
      "implémentation IA Belgique",
    ],
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const typedLang = (lang in seoContent ? lang : 'nl') as keyof typeof seoContent;
  const seo = seoContent[typedLang];
  
  const metadata: Metadata = {
    title: seo.title,
    description: seo.description,
    keywords: [...seo.keywords],
    authors: [{ name: "Mathias Vandendriessche", url: "https://www.linkedin.com/in/mathiasvdd/" }],
    openGraph: {
      title: seo.title,
      description: seo.ogDescription,
      type: "website",
      locale: typedLang === 'nl' ? 'nl_NL' : typedLang === 'fr' ? 'fr_BE' : 'en_US',
      url: `https://www.thiasbv.com/${typedLang}`,
    },
    alternates: {
      canonical: `https://www.thiasbv.com/${typedLang}`,
      languages: {
        'nl': 'https://www.thiasbv.com/nl',
        'en': 'https://www.thiasbv.com/en',
        'fr': 'https://www.thiasbv.com/fr',
      },
    },
    icons: {
      icon: "/icon.svg",
    },
  };

  return metadata;
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const typedLang = lang as Language;
  return (
    <html lang={typedLang} className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "Thias Consultancy",
              "description": "AI freelance Belgium and ServiceNow freelance Belgium. Freelance consultant specializing in AI, ServiceNow and IT service management.",
              "url": "https://www.thiasbv.com",
              "logo": "https://www.thiasbv.com/icon.svg",
              "keywords": "AI freelance Belgium, ServiceNow freelance Belgium, AI freelance België, ServiceNow freelance België, IA freelance Belgique, ServiceNow freelance Belgique",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+32-485-11-92-56",
                "contactType": "customer service",
                "email": "m@thiasbv.com",
                "areaServed": "BE",
                "availableLanguage": ["nl", "en", "fr"]
              },
              "founder": {
                "@type": "Person",
                "name": "Mathias Vandendriessche",
                "url": "https://www.linkedin.com/in/mathiasvdd/"
              },
              "serviceType": ["ServiceNow Consulting", "AI Consulting", "IT Service Management"],
              "areaServed": {
                "@type": "Country",
                "name": "Belgium"
              }
            }),
          }}
        />
      </head>
      <body>
        <Header lang={typedLang} />
        <main className="min-h-screen">{children}</main>
        <Footer lang={typedLang} />
      </body>
    </html>
  );
}
