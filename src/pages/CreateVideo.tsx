import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
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
import { uploadImagesToStorage } from "@/utils/uploadToStorage";

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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Poll for video status
  const pollVideoStatus = async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
    let attempts = 0;
    let consecutiveErrors = 0;

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        setError("Video generation timed out after 5 minutes. Please try again.");
        setIsGenerating(false);
        return;
      }

      attempts++;
      
      try {
        console.log(`Polling attempt ${attempts}/${maxAttempts} for job ${jobId}`);
        
        const { data, error: fnError } = await supabase.functions.invoke("check-video-status", {
          body: { jobId, provider: "shotstack" },
        });

        if (fnError) {
          console.error("Status check error:", fnError);
          consecutiveErrors++;
          
          // After 5 consecutive errors, show a warning but keep trying
          if (consecutiveErrors >= 5) {
            console.warn("Multiple consecutive errors - edge function may be unavailable");
          }
          
          // Keep polling even on errors
          setTimeout(poll, 5000);
          return;
        }

        // Reset error counter on successful response
        consecutiveErrors = 0;
        console.log("Video status response:", data);

        if (data.status === "done" && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setGeneratingProgress(100);
          setIsGenerating(false);
          setVideoReady(true);
          toast({
            title: "Video Ready!",
            description: "Your property video has been generated successfully.",
          });
        } else if (data.status === "failed") {
          setError("Video generation failed. Please try again.");
          setIsGenerating(false);
        } else {
          // Still processing - update progress based on Shotstack status
          const progressMap: Record<string, number> = {
            queued: 35,
            fetching: 45,
            rendering: 60,
            saving: 85,
          };
          const newProgress = progressMap[data.rawStatus] || Math.min(generatingProgress + 2, 95);
          setGeneratingProgress(newProgress);
          setTimeout(poll, 5000);
        }
      } catch (err) {
        console.error("Poll exception:", err);
        consecutiveErrors++;
        setTimeout(poll, 5000);
      }
    };

    await poll();
  };

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
    setVideoUrl(null);
    setVideoJobId(null);
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
      // Step 1: Upload images to Supabase Storage
      console.log("Uploading images to storage...");
      const folder = `property-${Date.now()}`;
      
      const imageUrls = await uploadImagesToStorage(
        photos,
        folder,
        (completed, total) => {
          // Update progress during upload phase (0-30%)
          setGeneratingProgress((completed / total) * 30);
        }
      );
      
      console.log("Images uploaded:", imageUrls.length, "files");
      setGeneratingProgress(30);

      // Step 2: Use the script if available, otherwise use default
      const videoScript = script || "This is a beautiful property with great features";

      // Step 3: Call generate-video using Supabase client
      console.log("Calling generate-video API...");
      const { data, error: fnError } = await supabase.functions.invoke("generate-video", {
        body: {
          imageUrls: imageUrls,
          propertyData: {
            address: `${propertyDetails.streetAddress}, ${propertyDetails.suburb}, ${propertyDetails.state}`,
            price: propertyDetails.price,
            beds: propertyDetails.bedrooms,
            baths: propertyDetails.bathrooms,
            description: videoScript,
          },
          style: customization.selectedTemplate,
          voice: customization.voiceType,
          music: customization.musicTrack,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to generate video");
      }

      // Handle the response
      if (data.success) {
        setVideoJobId(data.jobId);
        console.log("Video job started:", data.jobId);

        toast({
          title: "Video Generation Started",
          description: "Generating video... this may take up to 2 minutes.",
        });

        // Start polling for video status
        pollVideoStatus(data.jobId);
      } else {
        throw new Error(data.error || "Video generation failed");
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20 overflow-hidden">
      {/* Premium Top Navigation */}
      <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
            <Video className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:block tracking-tight">
            PropertyVideos<span className="text-primary">.ai</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3">
          <Button 
            variant="hero" 
            size="sm" 
            onClick={handleNewVideo}
            className="shadow-lg shadow-primary/20"
          >
            New Video
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            Videos
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings")} className="text-muted-foreground hover:text-foreground">
            Account
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2.5 text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border/50 p-4 space-y-2 animate-fade-in">
          <Button variant="hero" className="w-full shadow-lg" onClick={handleNewVideo}>
            New Video
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => navigate("/dashboard")}>
            Videos
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => navigate("/settings")}>
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
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 lg:p-8 space-y-6">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Create Your Video
              </h1>
              <p className="text-muted-foreground">
                Fill in the details below to generate a stunning property video
              </p>
            </div>

            {/* Property Details Card */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <PropertyDetailsForm
                details={propertyDetails}
                onChange={setPropertyDetails}
              />
            </div>

            {/* Photo Upload Card */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <PhotoUpload
                photos={photos}
                onChange={setPhotos}
                minPhotos={5}
                maxPhotos={20}
              />
            </div>

            {/* Script Generator Card */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <ScriptGeneratorSection
                propertyDetails={propertyDetails}
                script={script}
                onScriptChange={setScript}
              />
            </div>

            {/* Customization Card */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <CustomizationSection
                settings={customization}
                onChange={setCustomization}
              />
            </div>

            {/* Mobile Generate Button */}
            <div className="lg:hidden sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-8 -mx-6 px-6">
              <Button
                variant="hero"
                size="lg"
                className="w-full shadow-xl shadow-primary/30"
                onClick={handleGenerate}
                disabled={photos.length < 5 || isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Video"}
              </Button>
              {photos.length < 5 && (
                <p className="text-xs text-center text-warning mt-3 font-medium">
                  Add {5 - photos.length} more photos to continue
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
            videoUrl={videoUrl}
          />
        </div>
      </div>
    </div>
  );
}
