import { ArrowDown, Cpu } from "lucide-react";
import type { AiProjectsContent, FlowNode } from "@/lib/ai-projects";

interface EnergyFlowDiagramProps {
  labels: AiProjectsContent["energyDiagram"];
}

interface NodeListProps {
  title: string;
  nodes: FlowNode[];
  tone: "input" | "output";
}

function NodeList({ title, nodes, tone }: NodeListProps) {
  const nodeClass =
    tone === "input"
      ? "bg-white ring-earth-200 text-gray-900"
      : "bg-sage-50 ring-sage-200 text-sage-900";

  return (
    <div>
      <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">{title}</p>
      <ul className={`mt-2 grid gap-2 ${nodes.length > 3 ? "grid-cols-2" : "grid-cols-3"}`}>
        {nodes.map((node) => (
          <li key={node.label} className={`rounded-lg px-3 py-2 text-center ring-1 shadow-sm ${nodeClass}`}>
            <p className="text-sm font-semibold">{node.label}</p>
            <p className="text-xs text-gray-500">{node.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex justify-center py-2 text-accent-yellow" aria-hidden="true">
      <ArrowDown className="h-5 w-5" />
    </div>
  );
}

export default function EnergyFlowDiagram({ labels }: EnergyFlowDiagramProps) {
  return (
    <figure className="rounded-2xl bg-gradient-to-br from-earth-50 via-white to-sage-50 p-5 sm:p-6 ring-1 ring-earth-100 shadow-lg">
      <NodeList title={labels.inputsTitle} nodes={labels.inputs} tone="input" />
      <FlowArrow />
      <div className="mx-auto flex w-fit items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 text-white shadow-md">
        <Cpu className="h-5 w-5 text-accent-yellow" aria-hidden="true" />
        <p className="font-semibold">{labels.engine}</p>
        <p className="text-sm text-gray-400">{labels.engineSub}</p>
      </div>
      <FlowArrow />
      <NodeList title={labels.outputsTitle} nodes={labels.outputs} tone="output" />
      <figcaption className="mt-4 text-center text-sm text-gray-500">{labels.caption}</figcaption>
    </figure>
  );
}
