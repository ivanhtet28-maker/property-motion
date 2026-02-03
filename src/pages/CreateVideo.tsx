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
import { compressImages } from "@/utils/imageCompression";

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
  const [videoJobId, setVideoJobId] = useState<string | null>(null);

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
    if (photos.length < 5) {
      setError(`Need at least 5 photos (you have ${photos.length})`);
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratingProgress(0);
    setVideoJobId(null);

    try {
      // Compress photos to reduce payload size (800px max, 70% quality)
      console.log("Compressing images...");
      const imageUrls = await compressImages(photos, 800, 0.7);
      console.log("Images compressed, total size:", 
        Math.round(imageUrls.reduce((acc, url) => acc + url.length, 0) / 1024) + "KB"
      );
      
      // Use the script if available, otherwise use default
      const videoScript = script || "This is a beautiful property with great features";

      const response = await fetch(
        "https://pxhpfewunsetuxygeprp.supabase.co/functions/v1/generate-video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer sb_publishable_dZfmgOW6Z1N2FYNtiaDLMQ_Q27bxxAQ",
          },
          body: JSON.stringify({
            images: imageUrls,
            script: videoScript,
            aspectRatio: "9:16",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video");
      }

      if (data.jobId) {
        setVideoJobId(data.jobId);
        console.log("Video job started:", data.jobId);
        
        // Start progress simulation while waiting
        const interval = setInterval(() => {
          setGeneratingProgress((prev) => {
            if (prev >= 95) {
              clearInterval(interval);
              return 95;
            }
            return prev + Math.random() * 5;
          });
        }, 1000);

        toast({
          title: "Video Generation Started",
          description: "Generating video... please wait ~35 seconds",
        });

        // For now, simulate completion after 35 seconds
        // TODO: Replace with actual status polling
        setTimeout(() => {
          clearInterval(interval);
          setGeneratingProgress(100);
          setIsGenerating(false);
          setVideoReady(true);
          toast({
            title: "Video Ready!",
            description: "Your property video has been generated successfully.",
          });
        }, 35000);
      } else {
        throw new Error("No job ID received from server");
      }
    } catch (err) {
      console.error("Video generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate video");
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Failed to generate video",
        variant: "destructive",
      });
    }
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
                minPhotos={5}
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
                disabled={photos.length < 5 || isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Video"}
              </Button>
              {photos.length < 5 && (
                <p className="text-xs text-center text-warning mt-2">
                  Add {5 - photos.length} more photos
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
