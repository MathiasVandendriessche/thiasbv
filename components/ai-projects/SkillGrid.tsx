import { Sparkles } from "lucide-react";
import type { AiProjectsContent } from "@/lib/ai-projects";

interface SkillGridProps {
  skills: AiProjectsContent["skills"];
}

export default function SkillGrid({ skills }: SkillGridProps) {
  return (
    <section aria-labelledby="skills-heading" className="rounded-2xl bg-earth-50/60 p-6 sm:p-8 ring-1 ring-earth-100">
      <div className="max-w-2xl">
        <h3 id="skills-heading" className="text-xl font-bold text-gray-900">
          {skills.title}
        </h3>
        <p className="mt-1 text-gray-600">{skills.intro}</p>
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.items.map((skill) => (
          <li
            key={skill.name}
            className="rounded-xl bg-white p-5 ring-1 ring-gray-200/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-primary-200"
          >
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              <Sparkles className="h-4 w-4 flex-shrink-0 text-primary-500" aria-hidden="true" />
              {skill.name}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600">{skill.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
