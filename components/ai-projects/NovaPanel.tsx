import { PackageCheck, ShieldCheck } from "lucide-react";
import type { AiProjectsContent } from "@/lib/ai-projects";

interface NovaPanelProps {
  nova: AiProjectsContent["nova"];
}

export default function NovaPanel({ nova }: NovaPanelProps) {
  return (
    <section
      aria-labelledby="nova-heading"
      className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 sm:p-8 text-white shadow-xl shadow-primary-700/20"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-accent-yellow/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-900">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gray-900 motion-reduce:animate-none" aria-hidden="true" />
            {nova.badge}
          </p>
          <h3 id="nova-heading" className="mt-4 flex items-center gap-2 text-2xl font-bold">
            <PackageCheck className="h-6 w-6 text-primary-200" aria-hidden="true" />
            {nova.title}
          </h3>
          <p className="mt-3 leading-7 text-primary-100">{nova.text}</p>
        </div>
        <ul className="space-y-2.5">
          {nova.points.map((point) => (
            <li key={point} className="flex gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm ring-1 ring-white/15">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-primary-200" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
