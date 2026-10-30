import type { Language } from "@/lib/i18n";

export interface AiProject {
  id: string;
  title: string;
  tagline: string;
  description: string[];
  highlights: string[];
  tags: string[];
  /** Overrides the page-wide highlights heading for this project. */
  highlightsLabel?: string;
}

export interface AiSkill {
  name: string;
  text: string;
}

export interface KnowledgeStat {
  value: string;
  label: string;
}

export interface FlowNode {
  label: string;
  detail: string;
}

export interface AiProjectsContent {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  badge: string;
  title: string;
  intro: string;
  highlightsLabel: string;
  projects: {
    servicenow: AiProject;
    coach: AiProject;
    energy: AiProject;
    securescan: AiProject;
  };
  nova: {
    badge: string;
    title: string;
    text: string;
    points: string[];
  };
  energyDiagram: {
    inputsTitle: string;
    inputs: FlowNode[];
    engine: string;
    engineSub: string;
    outputsTitle: string;
    outputs: FlowNode[];
    caption: string;
  };
  knowledge: {
    title: string;
    text: string;
    stats: KnowledgeStat[];
    topics: string[];
  };
  skills: {
    title: string;
    intro: string;
    items: AiSkill[];
  };
  diagram: {
    story: string;
    coordinator: string;
    coordinatorSub: string;
    checkpoint: string;
    team: string;
    delivered: string;
    deliveredItems: string[];
    caption: string;
  };
  screenshotAlt: string;
  screenshotCaption: string;
  cta: {
    title: string;
    text: string;
    button: string;
  };
}

const SPECIALISTS_EN = [
  "Business Analyst",
  "Functional Analyst",
  "Technical Architect",
  "Platform Architect",
  "Enterprise Architect",
  "Developer",
  "Tester",
  "Project Manager",
  "Documentation",
];

export const specialists = SPECIALISTS_EN;

const content: Record<Language, AiProjectsContent> = {
  nl: {
    metaTitle: "AI-projecten - AI-agents in de praktijk | Thias Consultancy",
    metaDescription:
      "Hoe Thias Consultancy AI-agents zelf bouwt en gebruikt: een ServiceNow-agentteam dat stories autonoom oplevert, een persoonlijke AI-coach en een energiemanager.",
    keywords: ["AI-agents", "AI freelance België", "ServiceNow AI", "multi-agent", "AI consultant België"],
    badge: "AI in de praktijk",
    title: "AI-projecten",
    intro:
      "Ik bouw AI-agents en gebruik ze elke dag, in mijn werk en daarbuiten. Hieronder projecten die tonen hoe agents werk overnemen en efficiënter maken.",
    highlightsLabel: "Wat de agents doen",
    projects: {
      servicenow: {
        id: "servicenow-agents",
        title: "ServiceNow-agentteam",
        tagline: "Van story tot oplevering, door een team van AI-agents.",
        description: [
          "Een team van gespecialiseerde AI-agents dat ServiceNow-stories uitwerkt zoals een echt projectteam: een coördinator verdeelt het werk over analisten, architecten, een developer, een tester en documentatie.",
          "Er is één controlemoment: de acceptatiecriteria. Daarna werkt het team zelfstandig verder, van architectuurkeuze tot bouw, test en documentatie.",
        ],
        highlights: [
          "Analyseert de story en controleert de bestaande configuratie op de instance",
          "Kiest een technische aanpak en toetst die aan platform-governance",
          "Bouwt in een eigen update set en test elke stap meteen",
          "Levert documentatie, release note en testinstructies op",
        ],
        tags: ["Multi-agent", "ServiceNow", "Claude", "Autonoom"],
      },
      energy: {
        id: "energiemanager",
        title: "Energiemanager",
        tagline: "Zonnepanelen, thuisbatterij en laadpaal, gestuurd op de stroomprijs.",
        description: [
          "Met een AI-agent als Belgische energiespecialist ontwierp ik de sturing van mijn zonnepanelen, thuisbatterij en laadpaal in Home Assistant, op basis van het dynamische tarief.",
          "De sturing kijkt elk uur naar de stroomprijs en de zonvoorspelling, en beslist zelf waar de energie naartoe gaat.",
        ],
        highlights: [
          "Vermijdt automatisch de duurste uren van de dag",
          "Laadt de auto met zonne-overschot, zonder de batterij tekort te doen",
          "Zorgt dat de batterij vol is tegen zonsondergang, mee met het weer",
          "Stopt de injectie bij negatieve stroomprijzen",
          "Schakelt in de winter over op een apart profiel",
        ],
        tags: ["Agents", "Home Assistant", "Dynamisch tarief", "Zonne-energie"],
      },
      coach: {
        id: "ai-coach",
        title: "AI-coach",
        tagline: "Een persoonlijke coach die nooit slaapt.",
        description: [
          "Voor mijn eigen training bouwde ik een systeem van agents rond mijn Garmin-gegevens: lopen, fietsen en algemene vorm. Ook het dashboard zelf is door AI gebouwd.",
          "Elke training wordt automatisch geanalyseerd. Op basis van vorm, herstel, voeding en doel stelt de coach de volgende trainingen voor.",
        ],
        highlights: [
          "Dashboard volledig door AI gebouwd",
          "Analyseert elke training: tempo, hartslag en hartslagdrift",
          "Stelt trainingen voor en zet ze klaar op het horloge",
          "Houdt bij wat je eet en hoeveel kcal je nog nodig hebt",
          "Volgt vorm, herstel en slaagkans op het doel",
        ],
        tags: ["Agents", "Garmin", "Dashboard", "Voeding"],
      },
      securescan: {
        id: "securescan",
        title: "SecureScan",
        tagline: "Een geautomatiseerde webpentest, met een rapport dat je zonder IT-kennis leest.",
        description: [
          "SecureScan is mijn eigen product: een geautomatiseerde pentest voor websites. 23 modules testen onder meer het certificaat, de beveiligingsheaders, cookies, e-mailbeveiliging, verouderde software en gelekte gegevens.",
          "Het resultaat is een Nederlandstalig rapport voor KMO's: wat er mis is, hoe ernstig het is en wat je eraan doet. Een volledige scan gebeurt altijd met schriftelijke toestemming, want een site scannen zonder toestemming mag niet.",
        ],
        highlightsLabel: "Wat de scan doet",
        highlights: [
          "Test je website met 23 modules, van certificaat tot verouderde software",
          "Zet de bevindingen om in een helder rapport, gerangschikt op ernst",
          "Legt per probleem uit wat je eraan kunt doen",
          "Scant alleen met schriftelijke toestemming van de eigenaar",
        ],
        tags: ["Node.js", "23 modules", "Rapport voor KMO's", "Webbeveiliging"],
      },
    },
    nova: {
      badge: "In ontwikkeling",
      title: "NOVA: het agentteam, installeerbaar bij jou",
      text: "Ik verpak het agentteam als NOVA: één installatie die de agents, de skills, de kennisbank en een eigen ServiceNow-koppeling in de Claude-omgeving van een klant zet. Zonder klantgegevens van anderen en met veiligheid ingebouwd.",
      points: [
        "Agents, skills en kennisbank in één pakket",
        "Eigen ServiceNow-koppeling met meer dan 240 acties",
        "Productie standaard alleen-lezen",
        "Wachtwoorden in de sleutelhanger, aanmelden per consultant",
      ],
    },
    energyDiagram: {
      inputsTitle: "Wat binnenkomt",
      inputs: [
        { label: "Stroomprijs", detail: "per uur" },
        { label: "Zonvoorspelling", detail: "rest van de dag" },
        { label: "Batterij", detail: "laadniveau" },
      ],
      engine: "Sturing",
      engineSub: "Home Assistant",
      outputsTitle: "Wat gestuurd wordt",
      outputs: [
        { label: "Thuisbatterij", detail: "laden of ontladen" },
        { label: "Laadpaal", detail: "op overschot" },
        { label: "Airco", detail: "met de rest" },
        { label: "Omvormer", detail: "injectie aan of uit" },
      ],
      caption: "Elk uur opnieuw beslist.",
    },
    knowledge: {
      title: "Een kennisbank die maanden gevoed is",
      text: "De agents werken niet op algemene AI-kennis alleen. Sinds april 2026 bouw ik een eigen kennisbank op met ervaring uit echte projecten: architectuurpatronen, integraties, standaarden en lessen uit wat misliep. Elke specialist heeft daarnaast een eigen geheugen dat na elke story aangevuld wordt.",
      stats: [
        { value: "350+", label: "kennisdocumenten" },
        { value: "Sinds april 2026", label: "dagelijks aangevuld" },
        { value: "9", label: "specialisten met eigen geheugen" },
      ],
      topics: ["Architectuurpatronen", "Integraties", "Best practices", "Governance", "Lessons learned", "ITSM & CMDB", "HRSD", "GRC"],
    },
    skills: {
      title: "Zelfgebouwde skills",
      intro: "Herbruikbare vaardigheden die de agents inzetten. Elke skill doet één taak van begin tot eind.",
      items: [
        { name: "Story naar specificatie", text: "Werkt een story uit tot een volledige specificatie, met Word-document, ticketcommentaar en release note." },
        { name: "Business case naar backlog", text: "Zet een business case om in een functionele analyse met epics, stories en acceptatiecriteria." },
        { name: "Flow builder", text: "Zet business rules, workflows en scripts om naar Flow Designer, met een bouwblad per stap." },
        { name: "Code review", text: "Toetst custom code op een instance aan de best practices van ServiceNow." },
        { name: "Update set gap-analyse", text: "Vergelijkt update sets tussen DEV, TEST, UAT en PROD en toont wat nog niet gepromoot is." },
        { name: "Release-voorbereiding", text: "Controleert de releasescope, spoort ontbrekende update sets op en levert het releasedocument." },
      ],
    },
    diagram: {
      story: "Story",
      coordinator: "Coordinator",
      coordinatorSub: "verdeelt het werk",
      checkpoint: "Eén controlemoment: acceptatiecriteria",
      team: "Specialisten",
      delivered: "Opgeleverd",
      deliveredItems: ["Update set", "Geteste bouw", "Documentatie", "Release note"],
      caption: "Hoe een story door het agentteam loopt.",
    },
    screenshotAlt: "Screenshot van het sportbord met de training van vandaag, vorm en voeding",
    screenshotCaption: "Het sportbord: door AI gebouwd, door agents gevuld.",
    cta: {
      title: "AI-agents voor jouw organisatie?",
      text: "Benieuwd wat agents in jouw ServiceNow-omgeving of processen kunnen overnemen? Laten we erover praten.",
      button: "Neem contact op",
    },
  },
  en: {
    metaTitle: "AI projects - AI agents in practice | Thias Consultancy",
    metaDescription:
      "How Thias Consultancy builds and uses AI agents: a ServiceNow agent team that delivers stories autonomously, a personal AI coach and an energy manager.",
    keywords: ["AI agents", "AI freelance Belgium", "ServiceNow AI", "multi-agent", "AI consultant Belgium"],
    badge: "AI in practice",
    title: "AI projects",
    intro:
      "I build AI agents and use them every day, at work and beyond. Below are projects that show how agents take over work and make it more efficient.",
    highlightsLabel: "What the agents do",
    projects: {
      servicenow: {
        id: "servicenow-agents",
        title: "ServiceNow agent team",
        tagline: "From story to delivery, by a team of AI agents.",
        description: [
          "A team of specialised AI agents that works out ServiceNow stories like a real project team: a coordinator divides the work across analysts, architects, a developer, a tester and documentation.",
          "There is one checkpoint: the acceptance criteria. After that the team works on its own, from architecture choice to build, test and documentation.",
        ],
        highlights: [
          "Analyses the story and checks the existing configuration on the instance",
          "Chooses a technical approach and checks it against platform governance",
          "Builds in its own update set and tests every step right away",
          "Delivers documentation, release note and test instructions",
        ],
        tags: ["Multi-agent", "ServiceNow", "Claude", "Autonomous"],
      },
      energy: {
        id: "energy-manager",
        title: "Energy manager",
        tagline: "Solar panels, home battery and EV charger, steered by the electricity price.",
        description: [
          "Together with an AI agent acting as a Belgian energy specialist, I designed the control of my solar panels, home battery and EV charger in Home Assistant, based on the dynamic tariff.",
          "Every hour the control looks at the electricity price and the solar forecast, and decides by itself where the energy goes.",
        ],
        highlights: [
          "Automatically avoids the most expensive hours of the day",
          "Charges the car with solar surplus, without short-changing the battery",
          "Makes sure the battery is full by sunset, adapting to the weather",
          "Stops feeding into the grid when prices turn negative",
          "Switches to a separate profile in winter",
        ],
        tags: ["Agents", "Home Assistant", "Dynamic tariff", "Solar energy"],
      },
      coach: {
        id: "ai-coach",
        title: "AI coach",
        tagline: "A personal coach that never sleeps.",
        description: [
          "For my own training I built a system of agents around my Garmin data: running, cycling and overall fitness. The dashboard itself was built by AI as well.",
          "Every workout is analysed automatically. Based on fitness, recovery, nutrition and goal, the coach proposes the next workouts.",
        ],
        highlights: [
          "Dashboard built entirely by AI",
          "Analyses every workout: pace, heart rate and heart-rate drift",
          "Proposes workouts and sends them to the watch",
          "Tracks what you eat and how many kcal you still need",
          "Follows fitness, recovery and the chance of reaching the goal",
        ],
        tags: ["Agents", "Garmin", "Dashboard", "Nutrition"],
      },
      securescan: {
        id: "securescan",
        title: "SecureScan",
        tagline: "An automated web pentest, with a report you can read without IT knowledge.",
        description: [
          "SecureScan is my own product: an automated penetration test for websites. 23 modules test, among other things, the certificate, security headers, cookies, email security, outdated software and leaked data.",
          "The result is a report in Dutch written for SMEs: what is wrong, how serious it is and what to do about it. A full scan always happens with written consent, because scanning a site without permission is not allowed.",
        ],
        highlightsLabel: "What the scan does",
        highlights: [
          "Tests your website with 23 modules, from certificate to outdated software",
          "Turns the findings into a clear report, ranked by severity",
          "Explains for every issue what you can do about it",
          "Only scans with the owner's written consent",
        ],
        tags: ["Node.js", "23 modules", "Report for SMEs", "Web security"],
      },
    },
    nova: {
      badge: "In development",
      title: "NOVA: the agent team, installable at your organisation",
      text: "I'm packaging the agent team as NOVA: one installation that puts the agents, the skills, the knowledge base and a dedicated ServiceNow connector into a client's Claude environment. Free of other clients' data, with security built in.",
      points: [
        "Agents, skills and knowledge base in one package",
        "Dedicated ServiceNow connector with over 240 actions",
        "Production read-only by default",
        "Passwords in the keychain, sign-in per consultant",
      ],
    },
    energyDiagram: {
      inputsTitle: "What comes in",
      inputs: [
        { label: "Electricity price", detail: "per hour" },
        { label: "Solar forecast", detail: "rest of the day" },
        { label: "Battery", detail: "charge level" },
      ],
      engine: "Control",
      engineSub: "Home Assistant",
      outputsTitle: "What gets steered",
      outputs: [
        { label: "Home battery", detail: "charge or discharge" },
        { label: "EV charger", detail: "on surplus" },
        { label: "Air conditioning", detail: "with the rest" },
        { label: "Inverter", detail: "grid feed on or off" },
      ],
      caption: "Decided again every hour.",
    },
    knowledge: {
      title: "A knowledge base fed for months",
      text: "The agents don't rely on generic AI knowledge alone. Since April 2026 I've been building a dedicated knowledge base from real project experience: architecture patterns, integrations, standards and lessons from what went wrong. On top of that, each specialist has its own memory that grows after every story.",
      stats: [
        { value: "350+", label: "knowledge documents" },
        { value: "Since April 2026", label: "updated daily" },
        { value: "9", label: "specialists with their own memory" },
      ],
      topics: ["Architecture patterns", "Integrations", "Best practices", "Governance", "Lessons learned", "ITSM & CMDB", "HRSD", "GRC"],
    },
    skills: {
      title: "Custom-built skills",
      intro: "Reusable capabilities the agents put to work. Each skill does one job from start to finish.",
      items: [
        { name: "Story to specification", text: "Works out a story into a full specification, with Word document, ticket comment and release note." },
        { name: "Business case to backlog", text: "Turns a business case into a functional analysis with epics, stories and acceptance criteria." },
        { name: "Flow builder", text: "Converts business rules, workflows and scripts to Flow Designer, with a build sheet per step." },
        { name: "Code review", text: "Checks custom code on an instance against ServiceNow best practices." },
        { name: "Update set gap analysis", text: "Compares update sets across DEV, TEST, UAT and PROD and shows what has not been promoted yet." },
        { name: "Release preparation", text: "Verifies the release scope, finds missing update sets and delivers the release document." },
      ],
    },
    diagram: {
      story: "Story",
      coordinator: "Coordinator",
      coordinatorSub: "divides the work",
      checkpoint: "One checkpoint: acceptance criteria",
      team: "Specialists",
      delivered: "Delivered",
      deliveredItems: ["Update set", "Tested build", "Documentation", "Release note"],
      caption: "How a story flows through the agent team.",
    },
    screenshotAlt: "Screenshot of the sports dashboard with today's workout, fitness and nutrition",
    screenshotCaption: "The sports dashboard: built by AI, filled by agents.",
    cta: {
      title: "AI agents for your organisation?",
      text: "Curious what agents could take over in your ServiceNow environment or processes? Let's talk.",
      button: "Get in touch",
    },
  },
  fr: {
    metaTitle: "Projets IA - Agents IA en pratique | Thias Consultancy",
    metaDescription:
      "Comment Thias Consultancy construit et utilise des agents IA : une équipe d'agents ServiceNow qui livre des stories de façon autonome, un coach IA personnel et un gestionnaire d'énergie.",
    keywords: ["agents IA", "IA freelance Belgique", "ServiceNow IA", "multi-agent", "consultant IA Belgique"],
    badge: "L'IA en pratique",
    title: "Projets IA",
    intro:
      "Je construis des agents IA et je les utilise chaque jour, au travail et ailleurs. Voici des projets qui montrent comment des agents reprennent du travail et le rendent plus efficace.",
    highlightsLabel: "Ce que font les agents",
    projects: {
      servicenow: {
        id: "servicenow-agents",
        title: "Équipe d'agents ServiceNow",
        tagline: "De la story à la livraison, par une équipe d'agents IA.",
        description: [
          "Une équipe d'agents IA spécialisés qui traite les stories ServiceNow comme une vraie équipe projet : un coordinateur répartit le travail entre analystes, architectes, un développeur, un testeur et la documentation.",
          "Il n'y a qu'un seul point de contrôle : les critères d'acceptation. Ensuite, l'équipe travaille de façon autonome, du choix d'architecture au développement, aux tests et à la documentation.",
        ],
        highlights: [
          "Analyse la story et vérifie la configuration existante sur l'instance",
          "Choisit une approche technique et la confronte à la gouvernance de la plateforme",
          "Développe dans son propre update set et teste chaque étape immédiatement",
          "Livre la documentation, la release note et les instructions de test",
        ],
        tags: ["Multi-agent", "ServiceNow", "Claude", "Autonome"],
      },
      energy: {
        id: "gestionnaire-energie",
        title: "Gestionnaire d'énergie",
        tagline: "Panneaux solaires, batterie domestique et borne de recharge, pilotés selon le prix de l'électricité.",
        description: [
          "Avec un agent IA spécialisé dans l'énergie en Belgique, j'ai conçu le pilotage de mes panneaux solaires, de ma batterie domestique et de ma borne de recharge dans Home Assistant, sur la base du tarif dynamique.",
          "Chaque heure, le pilotage regarde le prix de l'électricité et la prévision solaire, et décide lui-même où va l'énergie.",
        ],
        highlights: [
          "Évite automatiquement les heures les plus chères de la journée",
          "Recharge la voiture avec le surplus solaire, sans pénaliser la batterie",
          "Veille à ce que la batterie soit pleine au coucher du soleil, selon la météo",
          "Arrête l'injection lorsque les prix deviennent négatifs",
          "Passe à un profil séparé en hiver",
        ],
        tags: ["Agents", "Home Assistant", "Tarif dynamique", "Énergie solaire"],
      },
      coach: {
        id: "coach-ia",
        title: "Coach IA",
        tagline: "Un coach personnel qui ne dort jamais.",
        description: [
          "Pour mes propres entraînements, j'ai construit un système d'agents autour de mes données Garmin : course, vélo et forme générale. Le tableau de bord lui-même a aussi été construit par l'IA.",
          "Chaque entraînement est analysé automatiquement. Selon la forme, la récupération, l'alimentation et l'objectif, le coach propose les prochains entraînements.",
        ],
        highlights: [
          "Tableau de bord entièrement construit par l'IA",
          "Analyse chaque entraînement : allure, fréquence cardiaque et dérive cardiaque",
          "Propose des entraînements et les envoie vers la montre",
          "Suit ce que vous mangez et combien de kcal il vous reste",
          "Suit la forme, la récupération et les chances d'atteindre l'objectif",
        ],
        tags: ["Agents", "Garmin", "Tableau de bord", "Alimentation"],
      },
      securescan: {
        id: "securescan",
        title: "SecureScan",
        tagline: "Un pentest web automatisé, avec un rapport lisible sans connaissances informatiques.",
        description: [
          "SecureScan est mon propre produit : un test d'intrusion automatisé pour sites web. 23 modules testent notamment le certificat, les en-têtes de sécurité, les cookies, la sécurité e-mail, les logiciels obsolètes et les données exposées.",
          "Le résultat est un rapport en néerlandais conçu pour les PME : ce qui ne va pas, la gravité et ce qu'il faut faire. Un scan complet se fait toujours avec un accord écrit, car scanner un site sans autorisation est interdit.",
        ],
        highlightsLabel: "Ce que fait le scan",
        highlights: [
          "Teste votre site avec 23 modules, du certificat aux logiciels obsolètes",
          "Transforme les constats en un rapport clair, classé par gravité",
          "Explique pour chaque problème ce que vous pouvez faire",
          "Ne scanne qu'avec l'accord écrit du propriétaire",
        ],
        tags: ["Node.js", "23 modules", "Rapport pour PME", "Sécurité web"],
      },
    },
    nova: {
      badge: "En développement",
      title: "NOVA : l'équipe d'agents, installable chez vous",
      text: "Je conditionne l'équipe d'agents sous le nom NOVA : une seule installation qui place les agents, les skills, la base de connaissances et un connecteur ServiceNow dédié dans l'environnement Claude d'un client. Sans données d'autres clients, avec la sécurité intégrée.",
      points: [
        "Agents, skills et base de connaissances en un seul paquet",
        "Connecteur ServiceNow dédié avec plus de 240 actions",
        "Production en lecture seule par défaut",
        "Mots de passe dans le trousseau, connexion par consultant",
      ],
    },
    energyDiagram: {
      inputsTitle: "Ce qui entre",
      inputs: [
        { label: "Prix de l'électricité", detail: "par heure" },
        { label: "Prévision solaire", detail: "reste de la journée" },
        { label: "Batterie", detail: "niveau de charge" },
      ],
      engine: "Pilotage",
      engineSub: "Home Assistant",
      outputsTitle: "Ce qui est piloté",
      outputs: [
        { label: "Batterie domestique", detail: "charge ou décharge" },
        { label: "Borne de recharge", detail: "sur le surplus" },
        { label: "Climatisation", detail: "avec le reste" },
        { label: "Onduleur", detail: "injection oui ou non" },
      ],
      caption: "Décidé à nouveau chaque heure.",
    },
    knowledge: {
      title: "Une base de connaissances alimentée depuis des mois",
      text: "Les agents ne s'appuient pas uniquement sur des connaissances IA générales. Depuis avril 2026, je construis une base de connaissances propre à partir de projets réels : patterns d'architecture, intégrations, standards et leçons tirées de ce qui a mal tourné. Chaque spécialiste dispose en plus de sa propre mémoire, enrichie après chaque story.",
      stats: [
        { value: "350+", label: "documents de connaissance" },
        { value: "Depuis avril 2026", label: "enrichie chaque jour" },
        { value: "9", label: "spécialistes avec leur propre mémoire" },
      ],
      topics: ["Patterns d'architecture", "Intégrations", "Bonnes pratiques", "Gouvernance", "Lessons learned", "ITSM & CMDB", "HRSD", "GRC"],
    },
    skills: {
      title: "Skills développées sur mesure",
      intro: "Des compétences réutilisables que les agents mettent en œuvre. Chaque skill accomplit une tâche du début à la fin.",
      items: [
        { name: "De la story à la spécification", text: "Transforme une story en spécification complète, avec document Word, commentaire de ticket et release note." },
        { name: "Du business case au backlog", text: "Transforme un business case en analyse fonctionnelle avec epics, stories et critères d'acceptation." },
        { name: "Flow builder", text: "Convertit business rules, workflows et scripts vers Flow Designer, avec une fiche de construction par étape." },
        { name: "Code review", text: "Vérifie le code personnalisé d'une instance selon les bonnes pratiques ServiceNow." },
        { name: "Analyse des écarts d'update sets", text: "Compare les update sets entre DEV, TEST, UAT et PROD et montre ce qui n'a pas encore été promu." },
        { name: "Préparation de release", text: "Vérifie le périmètre de la release, repère les update sets manquants et livre le document de release." },
      ],
    },
    diagram: {
      story: "Story",
      coordinator: "Coordinateur",
      coordinatorSub: "répartit le travail",
      checkpoint: "Un seul contrôle : critères d'acceptation",
      team: "Spécialistes",
      delivered: "Livré",
      deliveredItems: ["Update set", "Développement testé", "Documentation", "Release note"],
      caption: "Le parcours d'une story à travers l'équipe d'agents.",
    },
    screenshotAlt: "Capture d'écran du tableau de bord sportif avec l'entraînement du jour, la forme et l'alimentation",
    screenshotCaption: "Le tableau de bord sportif : construit par l'IA, alimenté par des agents.",
    cta: {
      title: "Des agents IA pour votre organisation ?",
      text: "Curieux de savoir ce que des agents pourraient reprendre dans votre environnement ServiceNow ou vos processus ? Parlons-en.",
      button: "Contactez-nous",
    },
  },
};

export function getAiProjectsContent(lang: Language): AiProjectsContent {
  return content[lang] ?? content.nl;
}
