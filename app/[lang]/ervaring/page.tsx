import ExperienceCard from "@/components/ExperienceCard";
import { getTranslations, type Language } from "@/lib/i18n";

export function generateMetadata({ params }: { params: { lang: Language } }) {
  const t = getTranslations(params.lang);
  return {
    title: params.lang === 'nl' ? "Ervaring - Thias Consultancy" : params.lang === 'en' ? "Experience - Thias Consultancy" : "Expérience - Thias Consultancy",
    description: params.lang === 'nl'
      ? "Ontdek de ervaring en expertise van Thias Consultancy in ServiceNow en IT Service Management."
      : params.lang === 'en'
      ? "Discover the experience and expertise of Thias Consultancy in ServiceNow and IT Service Management."
      : "Découvrez l'expérience et l'expertise de Thias Consultancy dans ServiceNow et la gestion des services informatiques.",
  };
}

export default function ErvaringPage({ params }: { params: { lang: Language } }) {
  const t = getTranslations(params.lang);

  const experiences = [
    {
      title: params.lang === 'nl' ? "Freelance Consultant" : params.lang === 'en' ? "Freelance Consultant" : "Consultant Freelance",
      company: "Devoteam",
      location: params.lang === 'nl' ? "België" : params.lang === 'en' ? "Belgium" : "Belgique",
      period: params.lang === 'nl' ? "November 2025 - Heden" : params.lang === 'en' ? "November 2025 - Present" : "Novembre 2025 - Présent",
      description: [
        params.lang === 'nl'
          ? "Freelance ServiceNow consultant gespecialiseerd in platform optimalisatie en integratie ontwikkeling."
          : params.lang === 'en'
          ? "Freelance ServiceNow consultant specialized in platform optimization and integration development."
          : "Consultant ServiceNow freelance spécialisé dans l'optimisation de plateforme et le développement d'intégrations.",
        params.lang === 'nl'
          ? "Huidige opdracht bij Belgische netbeheerder: focus op optimaliseren van de huidige ServiceNow instance, SOAP integraties en verdere ontwikkeling van het platform."
          : params.lang === 'en'
          ? "Current assignment at Belgian grid operator: focus on optimizing the current ServiceNow instance, SOAP integrations and further platform development."
          : "Mission actuelle chez un gestionnaire de réseau belge : focus sur l'optimisation de l'instance ServiceNow actuelle, les intégrations SOAP et le développement ultérieur de la plateforme.",
        params.lang === 'nl'
          ? "Strategische verbetering van bestaande implementaties en uitbreiding van platform functionaliteit."
          : params.lang === 'en'
          ? "Strategic improvement of existing implementations and expansion of platform functionality."
          : "Amélioration stratégique des implémentations existantes et expansion de la fonctionnalité de la plateforme."
      ],
      achievements: [
        params.lang === 'nl' ? "Optimalisatie van ServiceNow instance bij Belgische netbeheerder" : params.lang === 'en' ? "Optimization of ServiceNow instance at Belgian grid operator" : "Optimisation de l'instance ServiceNow chez le gestionnaire de réseau belge",
        params.lang === 'nl' ? "Ontwikkeling en onderhoud van SOAP integraties" : params.lang === 'en' ? "Development and maintenance of SOAP integrations" : "Développement et maintenance des intégrations SOAP",
        params.lang === 'nl' ? "Platform ontwikkeling en uitbreiding van functionaliteit" : params.lang === 'en' ? "Platform development and expansion of functionality" : "Développement de plateforme et expansion de la fonctionnalité"
      ],
    },
    {
      title: params.lang === 'nl' ? "Technical Consultant / Functional Consultant" : params.lang === 'en' ? "Technical Consultant / Functional Consultant" : "Consultant Technique / Consultant Fonctionnel",
      company: "Qinexo",
      location: params.lang === 'nl' ? "Brugge Regio, België" : params.lang === 'en' ? "Bruges Region, Belgium" : "Région de Bruges, Belgique",
      period: params.lang === 'nl' ? "Oktober 2023 - Oktober 2025" : params.lang === 'en' ? "October 2023 - October 2025" : "Octobre 2023 - Octobre 2025",
      description: [
        params.lang === 'nl'
          ? "Als Functional Consultant verzamelde en analyseerde ik business requirements van stakeholders en vertaalde deze naar functionele specificaties."
          : params.lang === 'en'
          ? "As a Functional Consultant, I gathered and analyzed business requirements from stakeholders and translated them into functional specifications."
          : "En tant que Consultant Fonctionnel, j'ai recueilli et analysé les exigences métier des parties prenantes et les ai traduites en spécifications fonctionnelles.",
        params.lang === 'nl'
          ? "Ik creëerde user stories en functionele designs voor ServiceNow modules, waarbij ik zorgde voor afstemming met best practices en platform mogelijkheden."
          : params.lang === 'en'
          ? "I created user stories and functional designs for ServiceNow modules, ensuring alignment with best practices and platform capabilities."
          : "J'ai créé des user stories et des designs fonctionnels pour les modules ServiceNow, en veillant à l'alignement avec les meilleures pratiques et les capacités de la plateforme.",
        params.lang === 'nl'
          ? "Ik werkte nauw samen met developers om accurate implementatie van functionele requirements te waarborgen en ondersteunde bij system testing, UAT en go-lives."
          : params.lang === 'en'
          ? "I worked closely with developers to ensure accurate implementation of functional requirements and supported system testing, UAT and go-lives."
          : "J'ai travaillé en étroite collaboration avec les développeurs pour garantir une implémentation précise des exigences fonctionnelles et j'ai soutenu les tests système, l'UAT et les go-lives."
      ],
      achievements: [
        params.lang === 'nl' ? "Lead consultant CSM/ITSM implementatie voor Nederlandse IT MSP met complexe integratie van 40+ externe ITSM tools" : params.lang === 'en' ? "Lead consultant CSM/ITSM implementation for Dutch IT MSP with complex integration of 40+ external ITSM tools" : "Consultant principal implémentation CSM/ITSM pour MSP IT néerlandais avec intégration complexe de plus de 40 outils ITSM externes",
        params.lang === 'nl' ? "Lead consultant ITSM implementatie voor Belgisch recyclingbedrijf met integraties naar Jira en MS Intune" : params.lang === 'en' ? "Lead consultant ITSM implementation for Belgian recycling company with integrations to Jira and MS Intune" : "Consultant principal implémentation ITSM pour entreprise de recyclage belge avec intégrations vers Jira et MS Intune",
        params.lang === 'nl' ? "Functional analyst rol: definiëren van functionele requirements en ondersteuning bij user acceptance testing" : params.lang === 'en' ? "Functional analyst role: defining functional requirements and supporting user acceptance testing" : "Rôle d'analyste fonctionnel : définition des exigences fonctionnelles et soutien aux tests d'acceptation utilisateur"
      ],
    },
    {
      title: params.lang === 'nl' ? "Technical Consultant Specialist" : params.lang === 'en' ? "Technical Consultant Specialist" : "Consultant Technique Spécialiste",
      company: "Plat4Mation",
      location: params.lang === 'nl' ? "België" : params.lang === 'en' ? "Belgium" : "Belgique",
      period: params.lang === 'nl' ? "Februari 2022 - Augustus 2023" : params.lang === 'en' ? "February 2022 - August 2023" : "Février 2022 - Août 2023",
      description: [
        params.lang === 'nl'
          ? "Ontwikkeling en configuratie van business requirements in ServiceNow via Flow Designer, Business Rules, Client Scripts en Script Includes volgens ServiceNow best practices."
          : params.lang === 'en'
          ? "Development and configuration of business requirements in ServiceNow via Flow Designer, Business Rules, Client Scripts and Script Includes following ServiceNow best practices."
          : "Développement et configuration des exigences métier dans ServiceNow via Flow Designer, Business Rules, Client Scripts et Script Includes selon les meilleures pratiques ServiceNow.",
        params.lang === 'nl'
          ? "Ontwikkeling van inbound/outbound integraties met externe systemen via Integration Hub, REST/SOAP messages en script actions."
          : params.lang === 'en'
          ? "Development of inbound/outbound integrations with external systems via Integration Hub, REST/SOAP messages and script actions."
          : "Développement d'intégrations entrantes/sortantes avec des systèmes externes via Integration Hub, messages REST/SOAP et actions de script.",
        params.lang === 'nl'
          ? "Technical lead rol: ondersteuning van junior/medior collega's en bewaking van ServiceNow best practices."
          : params.lang === 'en'
          ? "Technical lead role: supporting junior/medior colleagues and monitoring ServiceNow best practices."
          : "Rôle de lead technique : soutien des collègues juniors/médians et surveillance des meilleures pratiques ServiceNow."
      ],
      achievements: [
        params.lang === 'nl' ? "HRSD POC voor Europese Commissie" : params.lang === 'en' ? "HRSD POC for European Commission" : "POC HRSD pour la Commission européenne",
        params.lang === 'nl' ? "PPM project voor Delen Private Bank met integratie naar SD Worx" : params.lang === 'en' ? "PPM project for Delen Private Bank with integration to SD Worx" : "Projet PPM pour Delen Private Bank avec intégration vers SD Worx",
        params.lang === 'nl' ? "Custom applicaties voor IMEC" : params.lang === 'en' ? "Custom applications for IMEC" : "Applications sur mesure pour IMEC",
        params.lang === 'nl' ? "ServiceNow integraties met Salesforce en SAP SF voor BARCO" : params.lang === 'en' ? "ServiceNow integrations with Salesforce and SAP SF for BARCO" : "Intégrations ServiceNow avec Salesforce et SAP SF pour BARCO",
        params.lang === 'nl' ? "Technical Lead voor digital workflow project bij Brussels Airport Company" : params.lang === 'en' ? "Technical Lead for digital workflow project at Brussels Airport Company" : "Lead technique pour le projet de workflow numérique chez Brussels Airport Company"
      ],
    },
    {
      title: params.lang === 'nl' ? "Project Consultant" : params.lang === 'en' ? "Project Consultant" : "Consultant Projet",
      company: "TriFinance",
      location: params.lang === 'nl' ? "België" : params.lang === 'en' ? "Belgium" : "Belgique",
      period: params.lang === 'nl' ? "December 2021 - Februari 2022" : params.lang === 'en' ? "December 2021 - February 2022" : "Décembre 2021 - Février 2022",
      description: [
        params.lang === 'nl'
          ? "Implementatie van CSM/ITSM/FSM projecten voor klanten."
          : params.lang === 'en'
          ? "Implementation of CSM/ITSM/FSM projects for customers."
          : "Implémentation de projets CSM/ITSM/FSM pour les clients.",
        params.lang === 'nl'
          ? "Aanbevelen van oplossingen aangepast aan functionele behoeften en technische omgeving van de klant op basis van het ServiceNow platform."
          : params.lang === 'en'
          ? "Recommending solutions adapted to functional needs and technical environment of the client based on the ServiceNow platform."
          : "Recommandation de solutions adaptées aux besoins fonctionnels et à l'environnement technique du client basées sur la plateforme ServiceNow.",
        params.lang === 'nl'
          ? "Deelnemen aan het opstellen van projectdocumentatie (architectuur bestanden, technische specificaties), configuratie/ontwikkeling en testing van oplossingen."
          : params.lang === 'en'
          ? "Participating in drafting project documentation (architecture files, technical specifications), configuration/development and testing of solutions."
          : "Participation à la rédaction de la documentation de projet (fichiers d'architecture, spécifications techniques), configuration/développement et test des solutions."
      ],
      achievements: [
        params.lang === 'nl' ? "Succesvolle implementatie van CSM/ITSM/FSM projecten" : params.lang === 'en' ? "Successful implementation of CSM/ITSM/FSM projects" : "Implémentation réussie de projets CSM/ITSM/FSM",
        params.lang === 'nl' ? "Projectdocumentatie en technische specificaties opstellen" : params.lang === 'en' ? "Drafting project documentation and technical specifications" : "Rédaction de la documentation de projet et des spécifications techniques"
      ],
    },
    {
      title: params.lang === 'nl' ? "ServiceNow Admin/Developer" : params.lang === 'en' ? "ServiceNow Admin/Developer" : "Administrateur/Développeur ServiceNow",
      company: "HouseofHR",
      location: params.lang === 'nl' ? "België" : params.lang === 'en' ? "Belgium" : "Belgique",
      period: params.lang === 'nl' ? "December 2006 - December 2021" : params.lang === 'en' ? "December 2006 - December 2021" : "Décembre 2006 - Décembre 2021",
      description: [
        params.lang === 'nl'
          ? "ServiceNow implementatie: definiëren van project stakeholders, scopes en requirements. Leiding geven aan project meetings en coördineren van projectactiviteiten."
          : params.lang === 'en'
          ? "ServiceNow implementation: defining project stakeholders, scopes and requirements. Leading project meetings and coordinating project activities."
          : "Implémentation ServiceNow : définition des parties prenantes, des portées et des exigences du projet. Direction des réunions de projet et coordination des activités du projet.",
        params.lang === 'nl'
          ? "Interne ServiceNow consultant voor andere business units."
          : params.lang === 'en'
          ? "Internal ServiceNow consultant for other business units."
          : "Consultant ServiceNow interne pour d'autres unités commerciales.",
        params.lang === 'nl'
          ? "Ontwikkeling in ITSM, FSM, Facility Management, CSM en custom integraties (Azure, Jira, MS Intune)."
          : params.lang === 'en'
          ? "Development in ITSM, FSM, Facility Management, CSM and custom integrations (Azure, Jira, MS Intune)."
          : "Développement dans ITSM, FSM, Facility Management, CSM et intégrations sur mesure (Azure, Jira, MS Intune).",
        params.lang === 'nl'
          ? "First Line Helpdesk Manager (2017): Management van First line support team (5 FTE's), maandelijkse reporting en KPI Dashboard design in Power BI."
          : params.lang === 'en'
          ? "First Line Helpdesk Manager (2017): Management of First line support team (5 FTE's), monthly reporting and KPI Dashboard design in Power BI."
          : "Gestionnaire Helpdesk First Line (2017) : Gestion de l'équipe de support First Line (5 ETP), reporting mensuel et conception de tableau de bord KPI dans Power BI.",
        params.lang === 'nl'
          ? "IT Support Manager (2011-2016): Management van IT support team (5 FTE's), implementatie nieuwe IT service desk tool, automatisering van IT processen."
          : params.lang === 'en'
          ? "IT Support Manager (2011-2016): Management of IT support team (5 FTE's), implementation of new IT service desk tool, automation of IT processes."
          : "Gestionnaire Support IT (2011-2016) : Gestion de l'équipe de support IT (5 ETP), implémentation d'un nouvel outil de service desk IT, automatisation des processus IT.",
        params.lang === 'nl'
          ? "IT Advisor (2006-2011): IT support voor 800 medewerkers in internationale omgeving, beheer van Citrix, Exchange, backup en print servers, Avaya IP-Tel systeem."
          : params.lang === 'en'
          ? "IT Advisor (2006-2011): IT support for 800 employees in international environment, management of Citrix, Exchange, backup and print servers, Avaya IP-Tel system."
          : "Conseiller IT (2006-2011) : Support IT pour 800 employés dans un environnement international, gestion de Citrix, Exchange, serveurs de sauvegarde et d'impression, système Avaya IP-Tel."
      ],
      achievements: [
        params.lang === 'nl' ? "Meer dan 15 jaar ervaring met ServiceNow platform" : params.lang === 'en' ? "More than 15 years of experience with ServiceNow platform" : "Plus de 15 ans d'expérience avec la plateforme ServiceNow",
        params.lang === 'nl' ? "Succesvolle implementaties van ITSM, FSM, CSM en custom applicaties" : params.lang === 'en' ? "Successful implementations of ITSM, FSM, CSM and custom applications" : "Implémentations réussies d'ITSM, FSM, CSM et d'applications sur mesure",
        params.lang === 'nl' ? "Management ervaring met teams van 5 FTE's" : params.lang === 'en' ? "Management experience with teams of 5 FTE's" : "Expérience de gestion avec des équipes de 5 ETP",
        params.lang === 'nl' ? "Ontwikkeling van custom integraties met Azure, Jira en MS Intune" : params.lang === 'en' ? "Development of custom integrations with Azure, Jira and MS Intune" : "Développement d'intégrations sur mesure avec Azure, Jira et MS Intune"
      ],
    },
  ];

  const certifications = [
    {
      title: params.lang === 'nl' ? "ServiceNow Certified Implementation Specialist - Hardware Asset Management" : params.lang === 'en' ? "ServiceNow Certified Implementation Specialist - Hardware Asset Management" : "ServiceNow Certified Implementation Specialist - Hardware Asset Management",
      issuer: "ServiceNow",
      date: params.lang === 'nl' ? "Sep 2024" : params.lang === 'en' ? "Sep 2024" : "Sep 2024",
    },
    {
      title: params.lang === 'nl' ? "ServiceNow Certified Implementation Specialist - Field Service Management" : params.lang === 'en' ? "ServiceNow Certified Implementation Specialist - Field Service Management" : "ServiceNow Certified Implementation Specialist - Field Service Management",
      issuer: "ServiceNow",
      date: params.lang === 'nl' ? "Mar 2023" : params.lang === 'en' ? "Mar 2023" : "Mar 2023",
    },
    {
      title: params.lang === 'nl' ? "ServiceNow Certified System Administrator (CSA)" : params.lang === 'en' ? "ServiceNow Certified System Administrator (CSA)" : "ServiceNow Certified System Administrator (CSA)",
      issuer: "ServiceNow",
      date: params.lang === 'nl' ? "Sep 2018 - Huidig (meerdere Delta certificeringen)" : params.lang === 'en' ? "Sep 2018 - Current (multiple Delta certifications)" : "Sep 2018 - Actuel (plusieurs certifications Delta)",
    },
    {
      title: params.lang === 'nl' ? "ServiceNow Certified Implementation Specialist - ITSM (CIS-ITSM)" : params.lang === 'en' ? "ServiceNow Certified Implementation Specialist - ITSM (CIS-ITSM)" : "ServiceNow Certified Implementation Specialist - ITSM (CIS-ITSM)",
      issuer: "ServiceNow",
      date: "",
    },
    {
      title: params.lang === 'nl' ? "ServiceNow Certified Implementation Specialist - CSM (CIS-CSM)" : params.lang === 'en' ? "ServiceNow Certified Implementation Specialist - CSM (CIS-CSM)" : "ServiceNow Certified Implementation Specialist - CSM (CIS-CSM)",
      issuer: "ServiceNow",
      date: "",
    },
    {
      title: params.lang === 'nl' ? "ServiceNow Platform Subscription Model" : params.lang === 'en' ? "ServiceNow Platform Subscription Model" : "ServiceNow Platform Subscription Model",
      issuer: params.lang === 'nl' ? "ServiceNow Micro-Certification" : params.lang === 'en' ? "ServiceNow Micro-Certification" : "ServiceNow Micro-Certification",
      date: params.lang === 'nl' ? "Apr 2019" : params.lang === 'en' ? "Apr 2019" : "Avr 2019",
    },
    {
      title: params.lang === 'nl' ? "ITIL Foundation V3" : params.lang === 'en' ? "ITIL Foundation V3" : "ITIL Foundation V3",
      issuer: "EXIN",
      date: params.lang === 'nl' ? "May 2009" : params.lang === 'en' ? "May 2009" : "Mai 2009",
    },
    {
      title: params.lang === 'nl' ? "ServiceDesk Manager" : params.lang === 'en' ? "ServiceDesk Manager" : "ServiceDesk Manager",
      issuer: params.lang === 'nl' ? "IIR Nederland" : params.lang === 'en' ? "IIR Netherlands" : "IIR Pays-Bas",
      date: "",
    },
    {
      title: params.lang === 'nl' ? "Coaching, Managing and Leading" : params.lang === 'en' ? "Coaching, Managing and Leading" : "Coaching, Gestion et Leadership",
      issuer: "Krauthammer",
      date: "",
    },
    {
      title: params.lang === 'nl' ? "People Management" : params.lang === 'en' ? "People Management" : "Gestion des Personnes",
      issuer: params.lang === 'nl' ? "Koen Van den Brandt" : params.lang === 'en' ? "Koen Van den Brandt" : "Koen Van den Brandt",
      date: "",
    },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="relative isolate overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-primary-50/50 via-earth-50/30 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {t.experience.title}
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              {t.experience.subtitle}
            </p>
            <p className="mt-4 text-lg leading-8 text-gray-500">
              {t.experience.subtitle2}
            </p>
          </div>
        </div>
      </div>

      {/* Experience Timeline */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none">
            {experiences.map((experience, index) => (
              <ExperienceCard
                key={index}
                title={experience.title}
                company={experience.company}
                location={experience.location}
                period={experience.period}
                description={experience.description}
                achievements={experience.achievements}
                lang={params.lang}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-sage-50 to-earth-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t.experience.certifications}
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {t.experience.certificationsSubtitle}
            </p>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none">
            {certifications.map((cert, index) => (
              <div key={index} className="rounded-xl bg-white p-6 ring-1 ring-gray-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {cert.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {cert.issuer}{cert.date ? ` • ${cert.date}` : ''}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <a
              href="https://www.linkedin.com/in/mathiasvdd/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              {t.experience.viewLinkedIn}
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
