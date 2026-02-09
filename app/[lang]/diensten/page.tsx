import ServiceCard from "@/components/ServiceCard";
import {
  Settings,
  Zap,
  Target,
  Users,
  BarChart3,
  Shield,
  Sparkles,
} from "lucide-react";
import { getTranslations, type Language } from "@/lib/i18n";
import Link from "next/link";

export function generateMetadata({ params }: { params: { lang: Language } }) {
  const t = getTranslations(params.lang);
  return {
    title: params.lang === 'nl' ? "Diensten - Thias Consultancy" : params.lang === 'en' ? "Services - Thias Consultancy" : "Services - Thias Consultancy",
    description: params.lang === 'nl' 
      ? "Ontdek onze volledige range aan ServiceNow diensten: implementatie, procesoptimalisatie, training en meer."
      : params.lang === 'en'
      ? "Discover our full range of ServiceNow services: implementation, process optimization, training and more."
      : "Découvrez notre gamme complète de services ServiceNow : implémentation, optimisation des processus, formation et plus encore.",
  };
}

export default function DienstenPage({ params }: { params: { lang: Language } }) {
  const t = getTranslations(params.lang);

  const services = [
    {
      title: params.lang === 'nl' ? "AI & Now Assist Implementatie" : params.lang === 'en' ? "AI & Now Assist Implementation" : "Implémentation IA & Now Assist",
      description: params.lang === 'nl'
        ? "Implementatie en optimalisatie van ServiceNow AI capabilities, inclusief Now Assist voor Virtual Agent, AI Agents en Agentic Workflows. ServiceNow ondersteunt integratie met eigen LLM's en externe AI providers, waardoor je volledige controle hebt over je AI-oplossingen."
        : params.lang === 'en'
        ? "Implementation and optimization of ServiceNow AI capabilities, including Now Assist for Virtual Agent, AI Agents and Agentic Workflows. ServiceNow supports integration with your own LLMs and external AI providers, giving you full control over your AI solutions."
        : "Implémentation et optimisation des capacités IA de ServiceNow, y compris Now Assist pour Virtual Agent, AI Agents et Agentic Workflows. ServiceNow prend en charge l'intégration avec vos propres LLM et fournisseurs d'IA externes, vous donnant un contrôle total sur vos solutions IA.",
      icon: Sparkles,
    },
    {
      title: params.lang === 'nl' ? "ServiceNow Implementatie" : params.lang === 'en' ? "ServiceNow Implementation" : "Implémentation ServiceNow",
      description: params.lang === 'nl'
        ? "Volledige implementatie van ServiceNow platformen, afgestemd op jouw specifieke bedrijfsbehoeften. Van initiële planning tot succesvolle deployment, wij zorgen ervoor dat jouw ServiceNow omgeving perfect aansluit bij jouw organisatie."
        : params.lang === 'en'
        ? "Full implementation of ServiceNow platforms, tailored to your specific business needs. From initial planning to successful deployment, we ensure your ServiceNow environment perfectly aligns with your organization."
        : "Implémentation complète des plateformes ServiceNow, adaptée à vos besoins commerciaux spécifiques. De la planification initiale au déploiement réussi, nous veillons à ce que votre environnement ServiceNow s'aligne parfaitement avec votre organisation.",
      icon: Settings,
    },
    {
      title: params.lang === 'nl' ? "Procesoptimalisatie" : params.lang === 'en' ? "Process Optimization" : "Optimisation des Processus",
      description: params.lang === 'nl'
        ? "Analyse en optimalisatie van bedrijfsprocessen met behulp van ServiceNow tools en best practices. We identificeren knelpunten en implementeren efficiënte workflows die tijd en kosten besparen."
        : params.lang === 'en'
        ? "Analysis and optimization of business processes using ServiceNow tools and best practices. We identify bottlenecks and implement efficient workflows that save time and costs."
        : "Analyse et optimisation des processus métier à l'aide des outils ServiceNow et des meilleures pratiques. Nous identifions les goulots d'étranglement et mettons en œuvre des workflows efficaces qui font gagner du temps et de l'argent.",
      icon: Zap,
    },
    {
      title: params.lang === 'nl' ? "Strategisch Advies" : params.lang === 'en' ? "Strategic Advice" : "Conseil Stratégique",
      description: params.lang === 'nl'
        ? "Deskundig advies over hoe ServiceNow jouw organisatie kan helpen groeien en efficiënter werken. We helpen je bij het maken van strategische beslissingen die jouw business doelen ondersteunen."
        : params.lang === 'en'
        ? "Expert advice on how ServiceNow can help your organization grow and work more efficiently. We help you make strategic decisions that support your business goals."
        : "Conseil d'expert sur la façon dont ServiceNow peut aider votre organisation à croître et à travailler plus efficacement. Nous vous aidons à prendre des décisions stratégiques qui soutiennent vos objectifs commerciaux.",
      icon: Target,
    },
    {
      title: params.lang === 'nl' ? "Training & Begeleiding" : params.lang === 'en' ? "Training & Guidance" : "Formation & Accompagnement",
      description: params.lang === 'nl'
        ? "Uitgebreide trainingen en begeleiding voor jouw team om het maximale uit ServiceNow te halen. Van basisgebruik tot geavanceerde configuratie, we zorgen ervoor dat jouw team zelfstandig kan werken."
        : params.lang === 'en'
        ? "Comprehensive training and guidance for your team to get the most out of ServiceNow. From basic usage to advanced configuration, we ensure your team can work independently."
        : "Formation et accompagnement complets pour votre équipe pour tirer le meilleur parti de ServiceNow. De l'utilisation de base à la configuration avancée, nous veillons à ce que votre équipe puisse travailler de manière indépendante.",
      icon: Users,
    },
    {
      title: params.lang === 'nl' ? "Custom Development" : params.lang === 'en' ? "Custom Development" : "Développement Sur Mesure",
      description: params.lang === 'nl'
        ? "Ontwikkeling van op maat gemaakte oplossingen binnen het ServiceNow platform. We bouwen applicaties en integraties die perfect aansluiten bij jouw unieke bedrijfsprocessen."
        : params.lang === 'en'
        ? "Development of customized solutions within the ServiceNow platform. We build applications and integrations that perfectly align with your unique business processes."
        : "Développement de solutions sur mesure dans la plateforme ServiceNow. Nous construisons des applications et des intégrations qui s'alignent parfaitement avec vos processus métier uniques.",
      icon: BarChart3,
    },
    {
      title: params.lang === 'nl' ? "Onderhoud & Support" : params.lang === 'en' ? "Maintenance & Support" : "Maintenance & Support",
      description: params.lang === 'nl'
        ? "Continue ondersteuning en onderhoud om ervoor te zorgen dat jouw ServiceNow omgeving optimaal blijft presteren. We zorgen voor updates, monitoring en snelle respons op eventuele problemen."
        : params.lang === 'en'
        ? "Continuous support and maintenance to ensure your ServiceNow environment continues to perform optimally. We provide updates, monitoring and quick response to any issues."
        : "Support et maintenance continus pour garantir que votre environnement ServiceNow continue de fonctionner de manière optimale. Nous fournissons des mises à jour, une surveillance et une réponse rapide à tout problème.",
      icon: Shield,
    },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="relative isolate overflow-hidden bg-white">
        {/* Decorative background elements */}
        <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-primary-50/50 via-earth-50/30 to-transparent" />
        <div className="absolute inset-x-0 top-0 -z-10 h-full">
          <div className="absolute left-[calc(50%-4rem)] top-0 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
            <div className="aspect-[1108/632] w-[69rem] bg-gradient-to-r from-primary-200/20 via-earth-200/20 to-sage-200/20 opacity-20" style={{ clipPath: 'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)' }} />
          </div>
          <div className="absolute right-[calc(50%-4rem)] top-0 -z-10 transform-gpu blur-3xl sm:right-[calc(50%-18rem)] lg:right-48 lg:top-[calc(50%-30rem)] xl:right-[calc(50%-24rem)]">
            <div className="aspect-[1108/632] w-[69rem] bg-gradient-to-r from-sage-200/20 via-primary-200/20 to-earth-200/20 opacity-20" style={{ clipPath: 'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)' }} />
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative rounded-full px-5 py-2 text-sm leading-6 text-gray-600 ring-2 ring-primary-200/50 hover:ring-primary-300 bg-gradient-to-r from-primary-50 to-earth-50 backdrop-blur-sm shadow-sm">
                <span className="font-semibold text-primary-700">
                  {params.lang === 'nl' ? 'ServiceNow Expertise' : params.lang === 'en' ? 'ServiceNow Expertise' : 'Expertise ServiceNow'}
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t.services.title}
            </h1>
            <p className="mt-4 text-lg leading-7 text-gray-600">
              {params.lang === 'nl' 
                ? "Alles wat je nodig hebt om het maximale uit ServiceNow te halen."
                : params.lang === 'en'
                ? "Everything you need to get the most out of ServiceNow."
                : "Tout ce dont vous avez besoin pour tirer le meilleur parti de ServiceNow."}
            </p>
            <p className="mt-3 text-base leading-7 text-gray-500">
              {params.lang === 'nl'
                ? "Van strategisch advies tot volledige implementatie en ondersteuning."
                : params.lang === 'en'
                ? "From strategic advice to full implementation and support."
                : "Du conseil stratégique à l'implémentation complète et au support."}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Feature Section */}
      <section className="py-8 sm:py-10 bg-gradient-to-b from-white via-earth-50/30 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-50 via-earth-50 to-sage-50 ring-2 ring-primary-100/50 shadow-lg">
              <div className="flex -space-x-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 ring-3 ring-white shadow-md"></div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-earth-500 to-earth-600 ring-3 ring-white shadow-md"></div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sage-500 to-sage-600 ring-3 ring-white shadow-md"></div>
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <span className="text-base font-bold text-gray-800">
                {params.lang === 'nl' ? '20+ jaar ervaring' : params.lang === 'en' ? '20+ years experience' : '20+ ans d\'expérience'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8 sm:py-12 relative">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-full">
            <div className="absolute left-[max(50%,25rem)] top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-primary-50/10 to-transparent" />
          </div>
          <svg className="absolute left-[max(50%,25rem)] top-0 h-full w-1/2 opacity-30" aria-hidden="true">
            <defs>
              <pattern id="grid-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="1.5" fill="currentColor" className="text-primary-300" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {services.map((service, index) => (
              <div key={service.title} className="relative">
                {/* Decorative number badge - larger and more prominent */}
                <div className="absolute -left-3 -top-3 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white font-bold text-xl shadow-xl ring-4 ring-white transform group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>
                <ServiceCard
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-earth-700 py-16 sm:py-20">
        {/* Decorative elements - more prominent */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 right-0 transform-gpu blur-3xl">
            <div className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-primary-400 via-earth-400 to-sage-400 opacity-30" />
          </div>
          <div className="absolute -bottom-32 left-0 transform-gpu blur-3xl">
            <div className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-earth-500 via-primary-500 to-sage-500 opacity-30" />
          </div>
          {/* Grid pattern overlay - more visible */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px]" />
          {/* Additional gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t.services.cta.title}
            </h2>
            <p className="mt-4 text-lg leading-7 text-primary-100">
              {t.services.cta.subtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${params.lang}/contact`}
                className="rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary-600 shadow-xl shadow-white/30 hover:bg-gray-50 hover:shadow-2xl hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
              >
                {t.services.cta.button}
              </Link>
              <a
                href="tel:+32485119256"
                className="rounded-lg bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white ring-2 ring-inset ring-white/30 hover:bg-white/20 hover:ring-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
              >
                {t.services.cta.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
