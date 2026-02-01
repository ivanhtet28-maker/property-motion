import { useState } from "react";
import { ChevronDown, Settings, Mic, Music, Palette, Play, SkipForward, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { VideoTemplateSelector } from "./VideoTemplateSelector";
import { AgentPhotoUpload } from "./AgentPhotoUpload";

export interface AgentInfo {
  photo: string | null;
  name: string;
  phone: string;
  email: string;
}

export interface CustomizationSettings {
  includeVoiceover: boolean;
  voiceType: string;
  musicStyle: string;
  musicTrack: string;
  colorScheme: string;
  logoUrl: string | null;
  selectedTemplate: string;
  agentInfo: AgentInfo;
}

const voiceOptions = [
  "Australian Male",
  "Australian Female",
  "British Male",
  "British Female",
  "American Male",
  "American Female",
];

const musicStyles = [
  "Cinematic & Epic",
  "Modern & Chill",
  "Upbeat & Energetic",
  "Classical Elegance",
  "Ambient Relaxing",
];

const musicTracks: Record<string, string[]> = {
  "Cinematic & Epic": ["Horizon - Epic Journey", "Summit - Orchestral Rise", "Vast - Dramatic Sweep"],
  "Modern & Chill": ["Asteroid - Modern & Chill", "Waves - Lo-fi Beats", "Sunset - Acoustic Vibes"],
  "Upbeat & Energetic": ["Pulse - Dance Pop", "Drive - Electronic", "Spark - Indie Rock"],
  "Classical Elegance": ["Nocturne - Piano Solo", "Adagio - String Quartet", "Grace - Chamber Music"],
  "Ambient Relaxing": ["Drift - Ambient Tones", "Serenity - Nature Sounds", "Flow - Meditation"],
};

const colorSchemes = [
  { id: "purple", name: "Purple", color: "#6D28D9" },
  { id: "blue", name: "Blue", color: "#0066FF" },
  { id: "teal", name: "Teal", color: "#06B6D4" },
  { id: "green", name: "Green", color: "#10B981" },
  { id: "orange", name: "Orange", color: "#F97316" },
  { id: "pink", name: "Pink", color: "#EC4899" },
];

interface CustomizationSectionProps {
  settings: CustomizationSettings;
  onChange: (settings: CustomizationSettings) => void;
}

export function CustomizationSection({ settings, onChange }: CustomizationSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTracks = musicTracks[settings.musicStyle] || [];

  return (
    <section className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Customize Details</h2>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4 space-y-6">
          {/* Video Template Selection */}
          <div className="p-4 bg-secondary/30 rounded-xl">
            <VideoTemplateSelector
              selectedTemplate={settings.selectedTemplate}
              onSelectTemplate={(templateId) =>
                onChange({ ...settings, selectedTemplate: templateId })
              }
            />
          </div>

          {/* Voiceover Section */}
          <div className="space-y-4 p-4 bg-secondary/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Include Voiceover</Label>
              </div>
              <Switch
                checked={settings.includeVoiceover}
                onCheckedChange={(checked) =>
                  onChange({ ...settings, includeVoiceover: checked })
                }
              />
            </div>

            {settings.includeVoiceover && (
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Voice Type</Label>
                  <Select
                    value={settings.voiceType}
                    onValueChange={(value) => onChange({ ...settings, voiceType: value })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map((voice) => (
                        <SelectItem key={voice} value={voice}>
                          {voice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Play className="w-3 h-3" />
                  Preview Voice Sample
                </Button>
              </div>
            )}
          </div>

          {/* Music Section */}
          <div className="space-y-4 p-4 bg-secondary/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Background Music</Label>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Music Style</Label>
                <Select
                  value={settings.musicStyle}
                  onValueChange={(value) =>
                    onChange({
                      ...settings,
                      musicStyle: value,
                      musicTrack: musicTracks[value]?.[0] || "",
                    })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {musicStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Track</Label>
                <Select
                  value={settings.musicTrack}
                  onValueChange={(value) => onChange({ ...settings, musicTrack: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentTracks.map((track) => (
                      <SelectItem key={track} value={track}>
                        {track}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <Play className={`w-3 h-3 ${isPlaying ? "text-primary" : ""}`} />
                  {isPlaying ? "Playing..." : "Play"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const currentIndex = currentTracks.indexOf(settings.musicTrack);
                    const nextIndex = (currentIndex + 1) % currentTracks.length;
                    onChange({ ...settings, musicTrack: currentTracks[nextIndex] });
                  }}
                >
                  <SkipForward className="w-3 h-3" />
                  Next Track
                </Button>
              </div>
            </div>
          </div>

          {/* Branding Section */}
          <div className="space-y-4 p-4 bg-secondary/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Branding</Label>
              </div>
              <span className="text-xs text-muted-foreground">Save as default</span>
            </div>

            {/* Agent Photo & Details */}
            <AgentPhotoUpload
              agentInfo={settings.agentInfo}
              onChange={(agentInfo) => onChange({ ...settings, agentInfo })}
            />

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Logo</Label>
              <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all">
                <input type="file" accept="image/*" className="hidden" />
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload Logo</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Color Scheme</Label>
              <div className="flex gap-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => onChange({ ...settings, colorScheme: scheme.id })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      settings.colorScheme === scheme.id
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: scheme.color }}
                    title={scheme.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
