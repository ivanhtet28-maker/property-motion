import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  duration: string;
  image?: string;
}

const templates: VideoTemplate[] = [
  {
    id: "modern-luxe",
    name: "Modern Luxe",
    description: "4-5 sec intro",
    duration: "Sleek & contemporary",
  },
  {
    id: "just-listed",
    name: "Just Listed",
    description: "3-4 sec intro",
    duration: "Cinematic opening",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "2-3 sec intro",
    duration: "Clean aesthetic",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "5-6 sec intro",
    duration: "Dynamic cameras",
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "4-5 sec intro",
    duration: "Gold accents",
  },
  {
    id: "real-estate-pro",
    name: "Real Estate Pro",
    description: "3-4 sec intro",
    duration: "Professional",
  },
];

interface VideoTemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

export function VideoTemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: VideoTemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium flex items-center gap-2">
          🎬 Video Template Style
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Choose how your video will look
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={cn(
              "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:border-primary/50",
              selectedTemplate === template.id
                ? "border-primary bg-primary/5"
                : "border-border bg-secondary/30 hover:bg-secondary/50"
            )}
          >
            {/* Checkmark overlay */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}

            {/* Template preview placeholder */}
            <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 mb-2 flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>

            {/* Template info */}
            <span className="text-sm font-medium text-foreground">
              {template.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {template.description}
            </span>
            <span className="text-xs text-primary/70 mt-0.5">
              {template.duration}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
