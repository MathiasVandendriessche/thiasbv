import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import ExperienceCard from "@/components/ExperienceCard";
import {
  Settings,
  Zap,
  Target,
  Users,
  BarChart3,
  Shield,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations, type Language } from "@/lib/i18n";

export default function Home({ params }: { params: { lang: Language } }) {
  const t = getTranslations(params.lang);

  const services = [
    {
      title: params.lang === 'nl' ? "AI & Now Assist Implementatie" : params.lang === 'en' ? "AI & Now Assist Implementation" : "Implémentation IA & Now Assist",
      description: params.lang === 'nl' 
        ? "Implementatie van ServiceNow AI capabilities zoals Now Assist voor Virtual Agent, AI Agents en Agentic Workflows. ServiceNow ondersteunt integratie met eigen LLM's en externe AI providers voor volledige controle over je AI-oplossingen."
        : params.lang === 'en'
        ? "Implementation of ServiceNow AI capabilities such as Now Assist for Virtual Agent, AI Agents and Agentic Workflows. ServiceNow supports integration with your own LLMs and external AI providers for full control over your AI solutions."
        : "Implémentation des capacités IA de ServiceNow telles que Now Assist pour Virtual Agent, AI Agents et Agentic Workflows. ServiceNow prend en charge l'intégration avec vos propres LLM et fournisseurs d'IA externes pour un contrôle total sur vos solutions IA.",
      icon: Sparkles,
    },
    {
      title: params.lang === 'nl' ? "ServiceNow Implementatie" : params.lang === 'en' ? "ServiceNow Implementation" : "Implémentation ServiceNow",
      description: params.lang === 'nl' 
        ? "Volledige implementatie van ServiceNow platformen, afgestemd op jouw specifieke bedrijfsbehoeften."
        : params.lang === 'en'
        ? "Full implementation of ServiceNow platforms, tailored to your specific business needs."
        : "Implémentation complète des plateformes ServiceNow, adaptée à vos besoins commerciaux spécifiques.",
      icon: Settings,
    },
    {
      title: params.lang === 'nl' ? "Procesoptimalisatie" : params.lang === 'en' ? "Process Optimization" : "Optimisation des Processus",
      description: params.lang === 'nl'
        ? "Analyse en optimalisatie van bedrijfsprocessen met behulp van ServiceNow tools en best practices."
        : params.lang === 'en'
        ? "Analysis and optimization of business processes using ServiceNow tools and best practices."
        : "Analyse et optimisation des processus métier à l'aide des outils ServiceNow et des meilleures pratiques.",
      icon: Zap,
    },
    {
      title: params.lang === 'nl' ? "Strategisch Advies" : params.lang === 'en' ? "Strategic Advice" : "Conseil Stratégique",
      description: params.lang === 'nl'
        ? "Deskundig advies over hoe ServiceNow jouw organisatie kan helpen groeien en efficiënter werken."
        : params.lang === 'en'
        ? "Expert advice on how ServiceNow can help your organization grow and work more efficiently."
        : "Conseil d'expert sur la façon dont ServiceNow peut aider votre organisation à croître et à travailler plus efficacement.",
      icon: Target,
    },
    {
      title: params.lang === 'nl' ? "Training & Begeleiding" : params.lang === 'en' ? "Training & Guidance" : "Formation & Accompagnement",
      description: params.lang === 'nl'
        ? "Uitgebreide trainingen en begeleiding voor jouw team om het maximale uit ServiceNow te halen."
        : params.lang === 'en'
        ? "Comprehensive training and guidance for your team to get the most out of ServiceNow."
        : "Formation et accompagnement complets pour votre équipe pour tirer le meilleur parti de ServiceNow.",
      icon: Users,
    },
    {
      title: params.lang === 'nl' ? "Custom Development" : params.lang === 'en' ? "Custom Development" : "Développement Sur Mesure",
      description: params.lang === 'nl'
        ? "Ontwikkeling van op maat gemaakte oplossingen binnen het ServiceNow platform."
        : params.lang === 'en'
        ? "Development of customized solutions within the ServiceNow platform."
        : "Développement de solutions sur mesure dans la plateforme ServiceNow.",
      icon: BarChart3,
    },
    {
      title: params.lang === 'nl' ? "Onderhoud & Support" : params.lang === 'en' ? "Maintenance & Support" : "Maintenance & Support",
      description: params.lang === 'nl'
        ? "Continue ondersteuning en onderhoud om ervoor te zorgen dat jouw ServiceNow omgeving optimaal blijft presteren."
        : params.lang === 'en'
        ? "Continuous support and maintenance to ensure your ServiceNow environment continues to perform optimally."
        : "Support et maintenance continus pour garantir que votre environnement ServiceNow continue de fonctionner de manière optimale.",
      icon: Shield,
    },
  ];

  const values = [
    {
      title: t.why.independent.title,
      description: t.why.independent.description,
      icon: CheckCircle2,
    },
    {
      title: t.why.pragmatic.title,
      description: t.why.pragmatic.description,
      icon: TrendingUp,
    },
    {
      title: t.why.expertise.title,
      description: t.why.expertise.description,
      icon: Lightbulb,
    },
  ];

  return (
    <>
      <Hero lang={params.lang} />

      {/* Experience & IT Service Management Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-earth-50/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl bg-gradient-to-br from-primary-50/50 via-earth-50/30 to-sage-50/20 p-6 sm:p-8 ring-1 ring-gray-200/50">
              <p className="text-lg sm:text-xl leading-8 text-gray-700 text-center">
                {t.experience.itExperience}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t.why.title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {t.why.subtitle}
            </p>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200/50 hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 mb-4">
                  <value.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-1">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-earth-50/30 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t.experience.title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {t.experience.subtitle}
            </p>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none">
            <ExperienceCard
              title={params.lang === 'nl' ? "Freelance Consultant" : params.lang === 'en' ? "Freelance Consultant" : "Consultant Freelance"}
              company="Devoteam"
              location={params.lang === 'nl' ? "België" : params.lang === 'en' ? "Belgium" : "Belgique"}
              period={params.lang === 'nl' ? "November 2025 - Heden" : params.lang === 'en' ? "November 2025 - Present" : "Novembre 2025 - Présent"}
              description={[
                params.lang === 'nl' 
                  ? "Freelance ServiceNow consultant gespecialiseerd in platform optimalisatie en integratie ontwikkeling."
                  : params.lang === 'en'
                  ? "Freelance ServiceNow consultant specialized in platform optimization and integration development."
                  : "Consultant ServiceNow freelance spécialisé dans l'optimisation de plateforme et le développement d'intégrations.",
                params.lang === 'nl'
                  ? "Huidige opdracht bij Belgische netbeheerder: focus op optimaliseren van de huidige ServiceNow instance, SOAP integraties en verdere ontwikkeling van het platform."
                  : params.lang === 'en'
                  ? "Current assignment at Belgian grid operator: focus on optimizing the current ServiceNow instance, SOAP integrations and further platform development."
                  : "Mission actuelle chez un gestionnaire de réseau belge : focus sur l'optimisation de l'instance ServiceNow actuelle, les intégrations SOAP et le développement ultérieur de la plateforme."
              ]}
              achievements={[
                params.lang === 'nl' ? "Optimalisatie van ServiceNow instance bij Belgische netbeheerder" : params.lang === 'en' ? "Optimization of ServiceNow instance at Belgian grid operator" : "Optimisation de l'instance ServiceNow chez le gestionnaire de réseau belge",
                params.lang === 'nl' ? "Ontwikkeling en onderhoud van SOAP integraties" : params.lang === 'en' ? "Development and maintenance of SOAP integrations" : "Développement et maintenance des intégrations SOAP",
                params.lang === 'nl' ? "Platform ontwikkeling en uitbreiding van functionaliteit" : params.lang === 'en' ? "Platform development and expansion of functionality" : "Développement de plateforme et expansion de la fonctionnalité"
              ]}
              lang={params.lang}
            />
            <ExperienceCard
              title={params.lang === 'nl' ? "Technical Consultant / Functional Consultant" : params.lang === 'en' ? "Technical Consultant / Functional Consultant" : "Consultant Technique / Consultant Fonctionnel"}
              company="Qinexo"
              location={params.lang === 'nl' ? "Brugge Regio, België" : params.lang === 'en' ? "Bruges Region, Belgium" : "Région de Bruges, Belgique"}
              period={params.lang === 'nl' ? "Oktober 2023 - Oktober 2025" : params.lang === 'en' ? "October 2023 - October 2025" : "Octobre 2023 - Octobre 2025"}
              description={[
                params.lang === 'nl'
                  ? "Als Functional Consultant verzamelde en analyseerde ik business requirements van stakeholders en vertaalde deze naar functionele specificaties."
                  : params.lang === 'en'
                  ? "As a Functional Consultant, I gathered and analyzed business requirements from stakeholders and translated them into functional specifications."
                  : "En tant que Consultant Fonctionnel, j'ai recueilli et analysé les exigences métier des parties prenantes et les ai traduites en spécifications fonctionnelles.",
                params.lang === 'nl'
                  ? "Ik creëerde user stories en functionele designs voor ServiceNow modules met focus op best practices."
                  : params.lang === 'en'
                  ? "I created user stories and functional designs for ServiceNow modules with a focus on best practices."
                  : "J'ai créé des user stories et des designs fonctionnels pour les modules ServiceNow en me concentrant sur les meilleures pratiques."
              ]}
              achievements={[
                params.lang === 'nl' ? "Lead consultant CSM/ITSM implementatie voor Nederlandse IT MSP" : params.lang === 'en' ? "Lead consultant CSM/ITSM implementation for Dutch IT MSP" : "Consultant principal implémentation CSM/ITSM pour MSP IT néerlandais",
                params.lang === 'nl' ? "Lead consultant ITSM implementatie voor Belgisch recyclingbedrijf" : params.lang === 'en' ? "Lead consultant ITSM implementation for Belgian recycling company" : "Consultant principal implémentation ITSM pour entreprise de recyclage belge",
                params.lang === 'nl' ? "Functional analyst rol met focus op requirements en UAT" : params.lang === 'en' ? "Functional analyst role focusing on requirements and UAT" : "Rôle d'analyste fonctionnel axé sur les exigences et l'UAT"
              ]}
              lang={params.lang}
            />
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t.services.title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {t.services.subtitle}
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 sm:mt-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <ServiceCard
                key={service.title}
                title={service.title}
                description={service.description}
                icon={service.icon}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={`/${params.lang}/diensten`}
              className="group inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-all duration-200"
            >
              {t.services.viewAll}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-earth-700 py-12 sm:py-16">
        <div className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl">
          <div className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-primary-400 via-earth-400 to-sage-400 opacity-20" />
        </div>
        <div className="absolute -bottom-24 left-0 -z-10 transform-gpu blur-3xl">
          <div className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-earth-500 via-primary-500 to-sage-500 opacity-20" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t.cta.title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-primary-100">
              {t.cta.subtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${params.lang}/contact`}
                className="rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary-600 shadow-lg shadow-white/20 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
              >
                {t.cta.button}
              </Link>
              <a
                href="tel:+32485119256"
                className="rounded-lg bg-white/10 px-8 py-4 text-base font-semibold text-white ring-1 ring-inset ring-white/20 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
              >
                {t.cta.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
