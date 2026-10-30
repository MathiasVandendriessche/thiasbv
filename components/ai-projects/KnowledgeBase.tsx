import { Library } from "lucide-react";
import type { AiProjectsContent } from "@/lib/ai-projects";

interface KnowledgeBaseProps {
  knowledge: AiProjectsContent["knowledge"];
}

export default function KnowledgeBase({ knowledge }: KnowledgeBaseProps) {
  return (
    <section
      aria-labelledby="knowledge-heading"
      className="relative overflow-hidden rounded-2xl bg-gray-900 p-6 sm:p-8 text-white shadow-xl"
    >
      <div
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-500/30 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr] lg:items-center">
        <div>
          <h3 id="knowledge-heading" className="flex items-center gap-2 text-xl font-bold">
            <Library className="h-5 w-5 text-primary-300" aria-hidden="true" />
            {knowledge.title}
          </h3>
          <p className="mt-3 leading-7 text-gray-300">{knowledge.text}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {knowledge.topics.map((topic) => (
              <li
                key={topic}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-100 ring-1 ring-white/15"
              >
                {topic}
              </li>
            ))}
          </ul>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {knowledge.stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <dt className="text-xs uppercase tracking-wider text-gray-400">{stat.label}</dt>
              <dd className="mt-0.5 text-2xl font-bold text-primary-200">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
