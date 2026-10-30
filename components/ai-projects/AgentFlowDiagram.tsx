import { ArrowDown, CheckCircle2, FileText, Workflow } from "lucide-react";
import { specialists, type AiProjectsContent } from "@/lib/ai-projects";

interface AgentFlowDiagramProps {
  labels: AiProjectsContent["diagram"];
}

function FlowArrow() {
  return (
    <div className="flex justify-center py-1.5 text-primary-400" aria-hidden="true">
      <ArrowDown className="h-5 w-5" />
    </div>
  );
}

export default function AgentFlowDiagram({ labels }: AgentFlowDiagramProps) {
  return (
    <figure className="rounded-2xl bg-gradient-to-br from-primary-50 via-white to-sage-50 p-5 sm:p-6 ring-1 ring-primary-100 shadow-lg">
      <div className="mx-auto flex w-fit items-center gap-3 rounded-xl bg-white px-4 py-2.5 ring-1 ring-gray-200 shadow-sm">
        <FileText className="h-5 w-5 text-earth-500" aria-hidden="true" />
        <p className="font-semibold text-gray-900">{labels.story}</p>
      </div>

      <FlowArrow />

      <div className="rounded-xl bg-white p-4 sm:p-5 ring-1 ring-primary-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary-600" aria-hidden="true" />
            <p className="font-semibold text-gray-900">{labels.coordinator}</p>
            <p className="text-sm text-gray-500">· {labels.coordinatorSub}</p>
          </div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-2.5 py-1 text-xs font-medium text-sage-800">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.checkpoint}
          </p>
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{labels.team}</p>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {specialists.map((name) => (
            <li
              key={name}
              className="rounded-lg bg-primary-50 px-2 py-1.5 text-center text-xs font-medium text-primary-800 ring-1 ring-primary-100"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>

      <FlowArrow />

      <div className="rounded-xl bg-primary-600 px-4 py-3 text-white shadow-md shadow-primary-600/30">
        <p className="text-center font-semibold">{labels.delivered}</p>
        <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-primary-50">
          {labels.deliveredItems.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-4 text-center text-sm text-gray-500">{labels.caption}</figcaption>
    </figure>
  );
}
