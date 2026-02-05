import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  RefreshCw,
  Edit3,
  Download,
  Copy,
  Check,
  Loader2,
  Play,
  AlertCircle,
  Sparkles,
  Monitor,
  Volume2,
} from "lucide-react";
import { PropertyDetails } from "./PropertyDetailsForm";

// Social icons
const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

interface RightPanelProps {
  propertyDetails: PropertyDetails;
  photoCount: number;
  onGenerate: () => void;
  isGenerating: boolean;
  generatingProgress: number;
  videoReady: boolean;
  error: string | null;
  videoUrl?: string | null;
  videoUrls?: string[];
}

export function RightPanel({
  propertyDetails,
  photoCount,
  onGenerate,
  isGenerating,
  generatingProgress,
  videoReady,
  error,
  videoUrl,
  videoUrls = [],
}: RightPanelProps) {
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a mock script based on property details
  const generateScript = () => {
    const { streetAddress, suburb, bedrooms, bathrooms, landSize, features } = propertyDetails;
    if (!streetAddress) {
      return "Enter property details to generate your video script...";
    }

    const featureText = features.length > 0 ? `, featuring ${features.slice(0, 3).join(", ")}` : "";

    return `Welcome to ${streetAddress || "this stunning property"} in ${suburb || "a prime location"}. 

This exceptional ${bedrooms}-bedroom, ${bathrooms}-bathroom home offers ${landSize || "generous"} square meters of living space${featureText}.

Perfect for families seeking modern luxury living with every convenience at your doorstep.

Contact us today for a private inspection.`;
  };

  const [script, setScript] = useState(generateScript());

  // Update script when property details change
  const currentScript = isEditingScript ? script : generateScript();

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://propertyvideos.ai/share/abc123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canGenerate = photoCount >= 3 && photoCount <= 6;

  const getProgressStatus = () => {
    if (generatingProgress < 20) return "Uploading photos...";
    if (generatingProgress < 80) return "Generating cinematic clips with Luma AI...";
    if (generatingProgress < 90) return "Clips ready, starting stitching...";
    if (generatingProgress < 95) return "Stitching clips with Shotstack...";
    return "Finalizing your video...";
  };

  const remainingSeconds = Math.max(0, Math.round(300 - (generatingProgress / 100) * 300)); // 5 minutes for Luma

  return (
    <aside className="w-[340px] bg-gradient-to-b from-card via-card to-secondary/20 border-l border-border/50 flex flex-col h-full overflow-hidden">
      {/* Video Preview Frame */}
      <div className="p-4 pb-0">
        <div className="relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-2xl">
          {/* Monitor Frame Effect */}
          <div className="absolute inset-0 border-4 border-gray-700 rounded-xl pointer-events-none" />
          
          {videoReady && videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
          ) : (
            <>
              {/* Placeholder with animated gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 animate-pulse" />
              
              {/* Play button or generating state */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3 mx-auto">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <p className="text-white/80 text-sm font-medium">{getProgressStatus()}</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/20">
                      <Play className="w-7 h-7 text-white ml-1" fill="white" fillOpacity={0.9} />
                    </div>
                    <p className="text-white/60 text-sm">Preview will appear here</p>
                  </>
                )}
              </div>
              
              {/* Corner decorations */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/80" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <div className="w-2 h-2 rounded-full bg-green-500/80" />
              </div>
            </>
          )}
        </div>
        
        {/* Video specs bar */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            1080p HD
          </span>
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3" />
            Voiceover
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Enhanced
          </span>
        </div>
      </div>

      {/* Script Preview */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Script</h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10"
              onClick={() => setIsEditingScript(!isEditingScript)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10"
              onClick={() => setScript(generateScript())}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isEditingScript ? (
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="min-h-[160px] text-sm resize-none bg-secondary/50 border-border/50"
          />
        ) : (
          <div className="bg-secondary/30 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line border border-border/30">
            {currentScript}
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm space-y-4">
        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              <button className="text-xs underline mt-1 opacity-80 hover:opacity-100">
                Fix and try again →
              </button>
            </div>
          </div>
        )}

        {/* Generating State */}
        {isGenerating && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="font-semibold text-foreground">Generating...</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ~{Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(generatingProgress, 100)}%` }}
              />
              <div 
                className="absolute inset-y-0 left-0 bg-white/20 animate-pulse rounded-full"
                style={{ width: `${Math.min(generatingProgress, 100)}%` }}
              />
            </div>

            <p className="text-xs text-center text-muted-foreground">
              {getProgressStatus()} • Don't close this window
            </p>
          </div>
        )}

        {/* Video Ready State */}
        {videoReady && !isGenerating && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-success bg-success/10 p-3 rounded-xl">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Your video is ready!</span>
            </div>

            {/* Download & Share */}
            <Button
              variant="hero"
              className="w-full gap-2 shadow-lg shadow-primary/25"
              onClick={() => videoUrl && window.open(videoUrl, '_blank')}
              disabled={!videoUrl}
            >
              <Download className="w-4 h-4" />
              Download MP4
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <FacebookIcon />
                Facebook
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <InstagramIcon />
                Instagram
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <TikTokIcon />
                TikTok
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="w-full gap-2" onClick={handleCopyLink}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Link Copied!" : "Copy Share Link"}
            </Button>
          </div>
        )}

        {/* Generate Button */}
        {!videoReady && !isGenerating && (
          <div className="space-y-4">
            <Button
              variant="hero"
              size="lg"
              className="w-full gap-2 shadow-xl shadow-primary/30 h-14"
              onClick={onGenerate}
              disabled={!canGenerate}
            >
              <Sparkles className="w-5 h-5" />
              Generate Video
            </Button>
            
            {!canGenerate ? (
              <div className="text-center">
                {photoCount < 3 ? (
                  <>
                    <p className="text-sm text-warning font-medium">
                      Add {3 - photoCount} more photos to continue
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      3-6 photos required (15-30s video)
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-warning font-medium">
                      Maximum 6 photos allowed
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You have {photoCount} photos
                    </p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                Estimated time: ~{photoCount * 45} seconds
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
