import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function ServiceCard({
  title,
  description,
  icon: Icon,
}: ServiceCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 sm:p-7 shadow-md ring-1 ring-gray-200/50 hover:shadow-2xl hover:ring-primary-300 transition-all duration-300 hover:-translate-y-2">
      {/* Background gradient on hover - more intense */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-earth-50/0 to-sage-50/0 group-hover:from-primary-50/60 group-hover:via-earth-50/30 group-hover:to-sage-50/20 transition-all duration-300" />
      
      {/* Decorative corner elements - larger and more visible */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl" />
      <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-earth-200/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl" />
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-sage-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
      
      {/* Top border accent - thicker */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 via-earth-500 to-sage-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg shadow-primary-500/50" />
      
      <div className="relative">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 group-hover:from-primary-600 group-hover:to-primary-500 transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-3">
            <Icon className="h-8 w-8 text-primary-600 group-hover:text-white transition-all duration-300 relative z-10 group-hover:scale-110" />
            {/* Icon glow effect - more intense */}
            <div className="absolute inset-0 rounded-xl bg-primary-400/30 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-xl ring-2 ring-primary-300/0 group-hover:ring-primary-300/50 transition-all duration-300 group-hover:scale-125" />
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
              {title}
            </h3>
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed text-[15px] relative z-10">{description}</p>
      </div>
      
      {/* Bottom decorative line - thicker */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent group-hover:via-primary-300 group-hover:h-1 transition-all duration-300" />
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full group-hover:animate-shimmer transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2" />
      </div>
    </div>
  );
}
