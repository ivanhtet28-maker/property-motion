import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Check, Download, Share2, Video, Facebook, Instagram, Linkedin, Mail, Link2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function CreateComplete() {
  const { toast } = useToast();

  const handleShare = (platform: string) => {
    toast({
      title: "Share link copied!",
      description: `Ready to share on ${platform}`,
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download started!",
      description: "Your video will download shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Success Animation */}
          <div className="text-center mt-12 mb-8 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-success-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your video is ready!</h1>
            <p className="text-muted-foreground">
              Your professional listing video has been created successfully
            </p>
          </div>

          {/* Video Player */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card mb-8 animate-fade-in">
            <div className="aspect-video bg-secondary relative">
              <video
                className="w-full h-full object-cover"
                controls
                poster="https://picsum.photos/1280/720"
              >
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Video Details */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-4">Video Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">48 seconds</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium text-foreground">24 MB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolution</p>
                <p className="font-medium text-foreground">1080p HD</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Format</p>
                <p className="font-medium text-foreground">MP4</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button onClick={handleDownload} variant="hero" size="lg">
              <Download className="w-5 h-5" />
              Download Video
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg">
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem onClick={() => handleShare("Facebook")}>
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("Instagram")}>
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("LinkedIn")}>
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("Email")}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("Copy Link")}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild variant="secondary" size="lg">
              <Link to="/create">
                <Plus className="w-5 h-5" />
                Create Another Video
              </Link>
            </Button>
          </div>

          <div className="text-center mt-8">
            <Link to="/dashboard" className="text-primary hover:text-primary/80 text-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
