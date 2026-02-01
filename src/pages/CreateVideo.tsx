import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  LeftSidebar,
  PropertyDetailsForm,
  PhotoUpload,
  CustomizationSection,
  RightPanel,
  PropertyDetails,
  CustomizationSettings,
} from "@/components/create-video";
import { ScriptGeneratorSection } from "@/components/create-video/ScriptGeneratorSection";

export default function CreateVideo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form state
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    streetAddress: "",
    suburb: "",
    state: "",
    price: "",
    bedrooms: 4,
    bathrooms: 3,
    carSpaces: 2,
    landSize: "",
    features: [],
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [script, setScript] = useState("");

  const [customization, setCustomization] = useState<CustomizationSettings>({
    includeVoiceover: true,
    voiceType: "Australian Male",
    musicStyle: "Cinematic & Epic",
    musicTrack: "Horizon - Epic Journey",
    colorScheme: "purple",
    logoUrl: null,
    selectedTemplate: "modern-luxe",
    agentInfo: {
      photo: null,
      name: "",
      phone: "",
      email: "",
    },
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewVideo = () => {
    setPropertyDetails({
      streetAddress: "",
      suburb: "",
      state: "",
      price: "",
      bedrooms: 4,
      bathrooms: 3,
      carSpaces: 2,
      landSize: "",
      features: [],
    });
    setPhotos([]);
    setScript("");
    setVideoReady(false);
    setError(null);
  };

  const handleGenerate = async () => {
    if (photos.length < 10) {
      setError(`Need at least 10 photos (you have ${photos.length})`);
      return;
    }

    if (!propertyDetails.streetAddress) {
      setError("Please enter a property address");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratingProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setGeneratingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 300);

    // Wait for completion
    await new Promise((resolve) => setTimeout(resolve, 5000));
    clearInterval(interval);
    setGeneratingProgress(100);

    setTimeout(() => {
      setIsGenerating(false);
      setVideoReady(true);
      toast({
        title: "Video Ready!",
        description: "Your property video has been generated successfully.",
      });
    }, 500);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Navigation */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Video className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground hidden sm:block">
            PropertyVideos.ai
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="hero" size="sm" onClick={handleNewVideo}>
            New Video
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            Videos
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
            Account
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-2">
          <Button variant="hero" className="w-full" onClick={handleNewVideo}>
            New Video
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
            Videos
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/settings")}>
            Account
          </Button>
        </div>
      )}

      {/* Main Content - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <LeftSidebar
            onNewVideo={handleNewVideo}
            selectedTemplate={customization.selectedTemplate}
            onSelectTemplate={(templateId) =>
              setCustomization((prev) => ({ ...prev, selectedTemplate: templateId }))
            }
          />
        </div>

        {/* Center Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-2xl mx-auto p-6 space-y-8">
            {/* Property Details */}
            <div className="bg-card rounded-xl border border-border p-6">
              <PropertyDetailsForm
                details={propertyDetails}
                onChange={setPropertyDetails}
              />
            </div>

            {/* Photo Upload */}
            <div className="bg-card rounded-xl border border-border p-6">
              <PhotoUpload
                photos={photos}
                onChange={setPhotos}
                minPhotos={10}
                maxPhotos={20}
              />
            </div>

            {/* Script Generator */}
            <div className="bg-card rounded-xl border border-border p-6">
              <ScriptGeneratorSection
                propertyDetails={propertyDetails}
                script={script}
                onScriptChange={setScript}
              />
            </div>

            {/* Customization (Collapsible) */}
            <div className="bg-card rounded-xl border border-border p-6">
              <CustomizationSection
                settings={customization}
                onChange={setCustomization}
              />
            </div>

            {/* Mobile Generate Button */}
            <div className="lg:hidden sticky bottom-0 bg-background pt-4 pb-6 -mx-6 px-6 border-t border-border">
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                disabled={photos.length < 10 || !propertyDetails.streetAddress || isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Video"}
              </Button>
              {photos.length < 10 && (
                <p className="text-xs text-center text-warning mt-2">
                  Add {10 - photos.length} more photos
                </p>
              )}
            </div>
          </div>
        </main>

        {/* Right Panel - Hidden on mobile */}
        <div className="hidden lg:block">
          <RightPanel
            propertyDetails={propertyDetails}
            photoCount={photos.length}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            generatingProgress={generatingProgress}
            videoReady={videoReady}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
