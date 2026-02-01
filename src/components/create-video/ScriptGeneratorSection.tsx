import { useState } from "react";
import { Sparkles, RefreshCw, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PropertyDetails } from "./PropertyDetailsForm";

interface ScriptGeneratorSectionProps {
  propertyDetails: PropertyDetails;
  script: string;
  onScriptChange: (script: string) => void;
}

export function ScriptGeneratorSection({
  propertyDetails,
  script,
  onScriptChange,
}: ScriptGeneratorSectionProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const estimatedDuration = Math.ceil(wordCount / 2.5); // ~2.5 words per second

  const generateScript = async () => {
    setIsGenerating(true);

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const features = propertyDetails.features.length > 0
      ? propertyDetails.features.join(", ").toLowerCase()
      : "premium finishes";

    const generatedScript = `Welcome to ${propertyDetails.streetAddress || "this stunning property"}${propertyDetails.suburb ? ` in ${propertyDetails.suburb}` : ""}.

This exceptional ${propertyDetails.bedrooms}-bedroom, ${propertyDetails.bathrooms}-bathroom residence offers the perfect blend of style and functionality. ${propertyDetails.landSize ? `Sitting on a generous ${propertyDetails.landSize} square metre block, ` : ""}this home features ${features} throughout.

The thoughtfully designed layout provides seamless indoor-outdoor living, while premium appointments ensure comfort and convenience at every turn.

${propertyDetails.price ? `Offered at ${propertyDetails.price}, this` : "This"} is an opportunity not to be missed. Contact us today to arrange your private inspection.`;

    onScriptChange(generatedScript);
    setIsGenerating(false);

    toast({
      title: "Script Generated!",
      description: "Your AI-powered property script is ready.",
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Script copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onScriptChange("");
  };

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Auto-Generate Script
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Let AI create a compelling property description for your video narration
          </p>
        </div>
      </div>

      <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Based on the property details you entered, click to generate an AI script for video narration.
        </p>

        <div className="flex gap-2">
          <Button
            variant="hero"
            onClick={generateScript}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Script
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!script || isGenerating}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>

        {script && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Generated Script (Editable)
              </label>
              <Textarea
                value={script}
                onChange={(e) => onScriptChange(e.target.value)}
                className="min-h-[180px] bg-background"
                placeholder="Your generated script will appear here..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateScript}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <span className="text-xs text-muted-foreground">
                Word Count: {wordCount} | Duration: ~{estimatedDuration} sec
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
