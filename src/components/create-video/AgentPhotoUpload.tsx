import { useState, useRef } from "react";
import { Upload, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AgentInfo {
  photo: string | null;
  name: string;
  phone: string;
  email: string;
}

interface AgentPhotoUploadProps {
  agentInfo: AgentInfo;
  onChange: (info: AgentInfo) => void;
}

export function AgentPhotoUpload({ agentInfo, onChange }: AgentPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePhotoSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      onChange({ ...agentInfo, photo: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handlePhotoSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoSelect(file);
  };

  const removePhoto = () => {
    onChange({ ...agentInfo, photo: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Agent Photo & Details</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
        {/* Left Column - Photo Upload */}
        <div
          className={`relative aspect-square rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
            isDragging
              ? "border-primary bg-primary/10"
              : agentInfo.photo
              ? "border-primary/50"
              : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {agentInfo.photo ? (
            <>
              <img
                src={agentInfo.photo}
                alt="Agent"
                className="w-full h-full object-cover"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto();
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <div className="text-center p-2">
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">
                Upload Photo
              </span>
            </div>
          )}
        </div>

        {/* Right Column - Agent Details */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Agent Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Your Name"
              value={agentInfo.name}
              onChange={(e) => onChange({ ...agentInfo, name: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="0449 088 584"
              value={agentInfo.phone}
              onChange={(e) => onChange({ ...agentInfo, phone: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Agent Email <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={agentInfo.email}
              onChange={(e) => onChange({ ...agentInfo, email: e.target.value })}
              className="h-9"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            400×400 recommended for agent photo
          </p>
        </div>
      </div>
    </div>
  );
}
