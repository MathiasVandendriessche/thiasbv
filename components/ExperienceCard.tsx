import { Calendar, MapPin, Briefcase } from "lucide-react";
import { getTranslations, type Language } from "@/lib/i18n";

interface ExperienceCardProps {
  title: string;
  company: string;
  location?: string;
  period: string;
  description: string | string[];
  achievements?: string[];
  lang?: Language;
}

export default function ExperienceCard({
  title,
  company,
  location,
  period,
  description,
  achievements,
  lang = 'nl',
}: ExperienceCardProps) {
  const t = getTranslations(lang);
  const descriptionArray = Array.isArray(description) ? description : [description];

  return (
    <div className="relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5">
      
      <div className="relative">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-primary-600 font-semibold">
                <Briefcase className="h-4 w-4" />
                <span>{company}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{period}</span>
              </div>
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          {descriptionArray.map((desc, index) => (
            <p key={index} className="text-gray-600 leading-relaxed text-[15px]">
              {desc}
            </p>
          ))}
        </div>

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              {(t.experience as any).achievements || 'Belangrijkste prestaties:'}
            </h4>
            <ul className="space-y-1.5">
              {achievements.map((achievement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-primary-500 mt-1.5">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
    </div>
  );
}
