import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Navbar } from "@/components/layout/Navbar";
import {
  Video,
  Link2,
  Upload,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  X,
  Play,
  Wand2,
  Music,
  Image,
  User,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = 1 | 2 | 3 | 4;

interface PropertyDetails {
  address: string;
  price: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  propertyType: string;
  keyFeatures: string;
}

interface AgentBranding {
  name: string;
  phone: string;
  email: string;
  saveAsDefault: boolean;
}

interface VideoSettings {
  template: string;
  music: string;
  duration: number;
}

const templates = [
  { id: "modern", name: "Modern Minimal" },
  { id: "luxury", name: "Luxury Premium" },
  { id: "bold", name: "Bold & Bright" },
  { id: "classic", name: "Classic Elegant" },
  { id: "dynamic", name: "Dynamic Energy" },
];

const musicOptions = [
  "Upbeat Summer",
  "Cinematic Drama",
  "Elegant Piano",
  "Modern Tech",
  "Smooth Jazz",
  "Corporate Energy",
  "Ambient Calm",
  "Pop Energy",
  "Classical Grace",
  "Electronic Vibes",
];

export default function CreateVideo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [importTab, setImportTab] = useState<"url" | "upload">("url");
  const [listingUrl, setListingUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    address: "",
    price: "",
    listingType: "For Sale",
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 2,
    propertyType: "House",
    keyFeatures: "",
  });
  const [agentBranding, setAgentBranding] = useState<AgentBranding>({
    name: "",
    phone: "",
    email: "",
    saveAsDefault: true,
  });
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    template: "modern",
    music: "Upbeat Summer",
    duration: 4,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);

  const handleImportListing = async () => {
    if (!listingUrl) return;
    setIsImporting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock data
    const mockPhotos = Array.from({ length: 15 }, (_, i) => `https://picsum.photos/800/600?random=${i + 1}`);
    setPhotos(mockPhotos);
    setPropertyDetails({
      address: "123 Example Street, Melbourne VIC 3000",
      price: "$850,000",
      listingType: "For Sale",
      bedrooms: 3,
      bathrooms: 2,
      carSpaces: 2,
      propertyType: "House",
      keyFeatures: "Swimming pool\nAir conditioning\nSolar panels\nGarage",
    });

    setIsImporting(false);
    setImportSuccess(true);
  };

  const handleUploadPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setGeneratingProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setGeneratingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    // Wait for completion
    await new Promise((resolve) => setTimeout(resolve, 4000));
    clearInterval(interval);
    setGeneratingProgress(100);

    // Navigate to completion page
    setTimeout(() => {
      navigate("/create/complete");
    }, 500);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return importSuccess || photos.length >= 5;
      case 2:
        return propertyDetails.address && propertyDetails.price;
      case 3:
        return agentBranding.name;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getProgressStatus = () => {
    if (generatingProgress < 20) return "Analyzing photos...";
    if (generatingProgress < 40) return "Building video template...";
    if (generatingProgress < 60) return "Adding property details...";
    if (generatingProgress < 80) return "Mixing audio...";
    return "Finalizing your video...";
  };

  const estimatedDuration = photos.length * videoSettings.duration;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Generating Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-secondary"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-primary"
                    strokeLinecap="round"
                    strokeDasharray={276.46}
                    strokeDashoffset={276.46 - (276.46 * Math.min(generatingProgress, 100)) / 100}
                    style={{ transition: "stroke-dashoffset 0.3s ease" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">
                  {Math.round(Math.min(generatingProgress, 100))}%
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Creating your professional listing video...
              </h2>
              <p className="text-muted-foreground mb-4">{getProgressStatus()}</p>
              <p className="text-sm text-muted-foreground">Usually takes 60-90 seconds</p>
              <p className="text-xs text-muted-foreground mt-4">Please don't close this window</p>
            </div>
          </div>
        </div>
      )}

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8 mt-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    s < step
                      ? "bg-success text-success-foreground"
                      : s === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-2 rounded ${
                      s < step ? "bg-success" : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground mb-8">Step {step} of 4</p>

          {/* Step 1: Import Property */}
          {step === 1 && (
            <div className="bg-card rounded-2xl border border-border p-8 animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-6">Import Property</h1>

              {/* Tab Buttons */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setImportTab("url")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    importTab === "url"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Link2 className="w-5 h-5" />
                  Paste URL
                </button>
                <button
                  onClick={() => setImportTab("upload")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    importTab === "upload"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  Upload Photos
                </button>
              </div>

              {importTab === "url" && (
                <div className="space-y-6">
                  {!importSuccess ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="listing-url">Paste your listing URL</Label>
                        <Input
                          id="listing-url"
                          placeholder="e.g., https://www.realestate.com.au/property-house-vic-melbourne-123456"
                          value={listingUrl}
                          onChange={(e) => setListingUrl(e.target.value)}
                          className="h-12"
                        />
                        <p className="text-sm text-muted-foreground">
                          Supports realestate.com.au and domain.com.au
                        </p>
                      </div>
                      <Button
                        onClick={handleImportListing}
                        variant="hero"
                        size="lg"
                        className="w-full"
                        disabled={!listingUrl || isImporting}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Fetching listing details...
                          </>
                        ) : (
                          "Import Listing"
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                          <Check className="w-5 h-5 text-success-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Successfully imported!</p>
                          <p className="text-sm text-muted-foreground">
                            {photos.length} photos found
                          </p>
                        </div>
                      </div>
                      <div className="bg-secondary rounded-xl p-4">
                        <p className="font-medium text-foreground">{propertyDetails.address}</p>
                        <p className="text-primary font-bold mt-1">{propertyDetails.price}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                          <span>{propertyDetails.bedrooms} beds</span>
                          <span>{propertyDetails.bathrooms} baths</span>
                          <span>{propertyDetails.carSpaces} cars</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {importTab === "upload" && (
                <div className="space-y-6">
                  {/* Upload Zone */}
                  <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleUploadPhotos}
                    />
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium text-foreground">Drag photos here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-2">JPG, PNG, HEIC accepted</p>
                    <p className="text-sm text-muted-foreground">5-20 photos recommended</p>
                  </label>

                  {/* Photo Preview Grid */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square group">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length > 0 && photos.length < 5 && (
                    <p className="text-sm text-warning">
                      Add at least {5 - photos.length} more photo{5 - photos.length > 1 ? "s" : ""} (minimum 5
                      required)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Property Details */}
          {step === 2 && (
            <div className="bg-card rounded-2xl border border-border p-8 animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-6">Property Details</h1>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Property Address *</Label>
                  <Input
                    id="address"
                    value={propertyDetails.address}
                    onChange={(e) =>
                      setPropertyDetails({ ...propertyDetails, address: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="price"
                      value={propertyDetails.price.replace("$", "")}
                      onChange={(e) =>
                        setPropertyDetails({ ...propertyDetails, price: `$${e.target.value}` })
                      }
                      className="h-12 pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Listing Type</Label>
                  <Select
                    value={propertyDetails.listingType}
                    onValueChange={(value) =>
                      setPropertyDetails({ ...propertyDetails, listingType: value })
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="For Sale">For Sale</SelectItem>
                      <SelectItem value="For Rent">For Rent</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Leased">Leased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min={0}
                    max={10}
                    value={propertyDetails.bedrooms}
                    onChange={(e) =>
                      setPropertyDetails({ ...propertyDetails, bedrooms: parseInt(e.target.value) || 0 })
                    }
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min={0}
                    max={10}
                    value={propertyDetails.bathrooms}
                    onChange={(e) =>
                      setPropertyDetails({ ...propertyDetails, bathrooms: parseInt(e.target.value) || 0 })
                    }
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carSpaces">Car Spaces</Label>
                  <Input
                    id="carSpaces"
                    type="number"
                    min={0}
                    max={10}
                    value={propertyDetails.carSpaces}
                    onChange={(e) =>
                      setPropertyDetails({ ...propertyDetails, carSpaces: parseInt(e.target.value) || 0 })
                    }
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select
                    value={propertyDetails.propertyType}
                    onValueChange={(value) =>
                      setPropertyDetails({ ...propertyDetails, propertyType: value })
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Townhouse">Townhouse</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="features">Key Features</Label>
                  <Textarea
                    id="features"
                    placeholder="e.g., Swimming pool, Air conditioning, Solar panels, Ocean views"
                    value={propertyDetails.keyFeatures}
                    onChange={(e) =>
                      setPropertyDetails({ ...propertyDetails, keyFeatures: e.target.value })
                    }
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">One feature per line</p>
                </div>
              </div>

              {/* Photo Preview */}
              {photos.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">
                      Imported Photos ({photos.length})
                    </h3>
                    <button className="text-sm text-primary hover:text-primary/80">
                      Edit Photos
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {photos.slice(0, 10).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                    {photos.length > 10 && (
                      <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm text-muted-foreground">+{photos.length - 10}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Agent Branding */}
          {step === 3 && (
            <div className="bg-card rounded-2xl border border-border p-8 animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-6">Agent Branding</h1>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Agent Photo */}
                  <div className="space-y-2">
                    <Label>Agent Photo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <Button variant="outline">Upload Photo</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-name">Agent Name *</Label>
                    <Input
                      id="agent-name"
                      placeholder="Your full name"
                      value={agentBranding.name}
                      onChange={(e) => setAgentBranding({ ...agentBranding, name: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-phone">Phone Number</Label>
                    <Input
                      id="agent-phone"
                      placeholder="04XX XXX XXX"
                      value={agentBranding.phone}
                      onChange={(e) => setAgentBranding({ ...agentBranding, phone: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-email">Email</Label>
                    <Input
                      id="agent-email"
                      type="email"
                      placeholder="you@agency.com.au"
                      value={agentBranding.email}
                      onChange={(e) => setAgentBranding({ ...agentBranding, email: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  {/* Agency Logo */}
                  <div className="space-y-2">
                    <Label>Agency Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-40 h-16 rounded-lg bg-secondary flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <Button variant="outline">Upload Logo</Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="save-default"
                      checked={agentBranding.saveAsDefault}
                      onCheckedChange={(checked) =>
                        setAgentBranding({ ...agentBranding, saveAsDefault: checked as boolean })
                      }
                    />
                    <Label htmlFor="save-default" className="text-sm cursor-pointer">
                      Save as default for future videos
                    </Label>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Preview</h3>
                  <div className="aspect-video bg-secondary rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-muted-foreground" />
                    </div>
                    {/* Agent branding preview overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="text-background">
                          <p className="font-semibold">{agentBranding.name || "Agent Name"}</p>
                          <p className="text-sm opacity-80">{agentBranding.phone || "Phone"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Customize Video */}
          {step === 4 && (
            <div className="bg-card rounded-2xl border border-border p-8 animate-fade-in">
              <h1 className="text-2xl font-bold text-foreground mb-6">Customize Video</h1>

              {/* Template Selection */}
              <div className="mb-8">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Choose Video Style
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setVideoSettings({ ...videoSettings, template: template.id })}
                      className={`p-4 rounded-xl border-2 transition-all hover-lift ${
                        videoSettings.template === template.id
                          ? "border-primary bg-accent"
                          : "border-border bg-secondary hover:border-primary/50"
                      }`}
                    >
                      <div className="aspect-video bg-background rounded-lg mb-3 flex items-center justify-center">
                        <Video className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          videoSettings.template === template.id
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {template.name}
                      </p>
                      {videoSettings.template === template.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Music Selection */}
              <div className="mb-8">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Background Music
                </h3>
                <Select
                  value={videoSettings.music}
                  onValueChange={(value) => setVideoSettings({ ...videoSettings, music: value })}
                >
                  <SelectTrigger className="w-full max-w-xs h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {musicOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Slider */}
              <div className="mb-8">
                <h3 className="font-semibold text-foreground mb-4">Duration Per Photo</h3>
                <div className="max-w-md">
                  <Slider
                    value={[videoSettings.duration]}
                    onValueChange={([value]) =>
                      setVideoSettings({ ...videoSettings, duration: value })
                    }
                    min={3}
                    max={6}
                    step={0.5}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>3s</span>
                    <span className="font-medium text-foreground">
                      {videoSettings.duration}s per photo
                    </span>
                    <span>6s</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Video will be approximately{" "}
                    <span className="font-medium text-foreground">{estimatedDuration} seconds</span>
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateVideo}
                variant="hero"
                size="xl"
                className="w-full"
              >
                <Wand2 className="w-5 h-5" />
                Generate Video
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep((step - 1) as Step)}>
                <ArrowLeft className="w-5 h-5" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                  Back to Dashboard
                </Link>
              </Button>
            )}

            {step < 4 && (
              <Button
                onClick={() => setStep((step + 1) as Step)}
                disabled={!canProceed()}
                variant="hero"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
