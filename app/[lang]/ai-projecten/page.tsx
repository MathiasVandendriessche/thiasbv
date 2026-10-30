import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AgentFlowDiagram from "@/components/ai-projects/AgentFlowDiagram";
import ProjectShowcase from "@/components/ai-projects/ProjectShowcase";
import EnergyFlowDiagram from "@/components/ai-projects/EnergyFlowDiagram";
import KnowledgeBase from "@/components/ai-projects/KnowledgeBase";
import NovaPanel from "@/components/ai-projects/NovaPanel";
import QuickCheck from "@/components/ai-projects/QuickCheck";
import SkillGrid from "@/components/ai-projects/SkillGrid";
import { getAiProjectsContent } from "@/lib/ai-projects";
import type { Language } from "@/lib/i18n";
import { getQuickCheckCopy } from "@/lib/quick-check/copy";

interface PageProps {
  params: Promise<{ lang: Language }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  const c = getAiProjectsContent(lang);
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    keywords: c.keywords,
    alternates: {
      canonical: `https://www.thiasbv.com/${lang}/ai-projecten`,
    },
  };
}

export default async function AiProjectenPage({ params }: PageProps) {
  const { lang } = await params;
  const c = getAiProjectsContent(lang);

  const sportScreenshot = (
    <figure>
      <div className="overflow-hidden rounded-2xl bg-gray-900 p-2 shadow-2xl ring-1 ring-gray-900/10">
        <Image
          src="/ai-projecten/sportbord.jpg"
          alt={c.screenshotAlt}
          width={1388}
          height={813}
          className="h-auto w-full rounded-xl"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
      <figcaption className="mt-3 text-center text-sm text-gray-500">{c.screenshotCaption}</figcaption>
    </figure>
  );

  return (
    <div className="bg-white">
      <section aria-labelledby="ai-projects-heading" className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 via-earth-200 to-sage-200 opacity-30 sm:w-[72rem]" />
        </div>
        <div className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-20 lg:px-8">
          <p className="inline-block rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-primary-600 ring-1 ring-gray-900/10">
            {c.badge}
          </p>
          <h1 id="ai-projects-heading" className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {c.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">{c.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="space-y-12">
          <ProjectShowcase
            project={c.projects.servicenow}
            highlightsLabel={c.highlightsLabel}
            media={<AgentFlowDiagram labels={c.diagram} />}
          />
          <KnowledgeBase knowledge={c.knowledge} />
          <SkillGrid skills={c.skills} />
          <NovaPanel nova={c.nova} />
        </div>
        <ProjectShowcase
          project={c.projects.coach}
          highlightsLabel={c.highlightsLabel}
          media={sportScreenshot}
          reversed
        />
        <ProjectShowcase
          project={c.projects.energy}
          highlightsLabel={c.highlightsLabel}
          media={<EnergyFlowDiagram labels={c.energyDiagram} />}
        />
        <ProjectShowcase
          project={c.projects.securescan}
          highlightsLabel={c.highlightsLabel}
          media={<QuickCheck lang={lang} copy={getQuickCheckCopy(lang)} />}
          reversed
        />
      </div>

      <section className="bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{c.cta.title}</h2>
          <p className="mt-4 text-lg leading-8 text-primary-100">{c.cta.text}</p>
          <Link
            href={`/${lang}/contact`}
            className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-primary-700 shadow-lg transition-all duration-200 hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {c.cta.button}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
