import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

// A static card: it is not a link, so it does not lift, glow or shimmer on hover.
export default function ServiceCard({
  title,
  description,
  icon: Icon,
}: ServiceCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
        <Icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-xl font-semibold leading-snug tracking-tight text-gray-900">
        {title}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}
