import type { ReactNode } from "react";
import { Check } from "lucide-react";
import type { AiProject } from "@/lib/ai-projects";

interface ProjectShowcaseProps {
  project: AiProject;
  highlightsLabel: string;
  media: ReactNode;
  reversed?: boolean;
}

export default function ProjectShowcase({
  project,
  highlightsLabel,
  media,
  reversed = false,
}: ProjectShowcaseProps) {
  const headingId = `${project.id}-heading`;

  return (
    <article
      id={project.id}
      aria-labelledby={headingId}
      className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 scroll-mt-24"
    >
      <div className={reversed ? "lg:order-2" : undefined}>{media}</div>

      <div className={reversed ? "lg:order-1" : undefined}>
        <ul className="flex flex-wrap gap-2" aria-label="Tags">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100"
            >
              {tag}
            </li>
          ))}
        </ul>

        <h2 id={headingId} className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {project.title}
        </h2>
        <p className="mt-2 text-lg font-medium text-primary-600">{project.tagline}</p>

        <div className="mt-5 space-y-4 text-base leading-7 text-gray-600">
          {project.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-gray-900">
          {project.highlightsLabel ?? highlightsLabel}
        </h3>
        <ul className="mt-3 space-y-2.5">
          {project.highlights.map((item) => (
            <li key={item} className="flex gap-3 text-gray-700">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sage-100">
                <Check className="h-3.5 w-3.5 text-sage-700" aria-hidden="true" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
