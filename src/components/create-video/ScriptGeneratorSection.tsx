import { useState } from "react";
import { Sparkles, RefreshCw, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PropertyDetails } from "./PropertyDetailsForm";

const SUPABASE_FUNCTION_URL = "https://pxhpfewunsetuxygeprp.supabase.co/functions/v1/generate-script";
const SUPABASE_ANON_KEY = "sb_publishable_dZfmgOW6Z1N2FYNtiaDLMQ_Q27bxxAQ";

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

    try {
      // Build full address
      const fullAddress = [
        propertyDetails.streetAddress,
        propertyDetails.suburb,
        propertyDetails.state,
      ]
        .filter(Boolean)
        .join(", ");

      const requestBody = {
        address: fullAddress || propertyDetails.streetAddress,
        price: propertyDetails.price,
        bedrooms: String(propertyDetails.bedrooms),
        bathrooms: String(propertyDetails.bathrooms),
        size: propertyDetails.landSize,
        features: propertyDetails.features,
        description: "", // Optional property description
      };

      console.log("Generating script with:", requestBody);

      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Script generation failed:", response.status, errorText);
        throw new Error(`Failed to generate script: ${response.status}`);
      }

      const data = await response.json();
      console.log("Script generated successfully:", data);

      if (data.script) {
        onScriptChange(data.script);
        toast({
          title: "Script Generated!",
          description: "Your AI-powered property script is ready.",
        });
      } else {
        throw new Error("No script returned from API");
      }
    } catch (error) {
      console.error("Script generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Script Preview (Editable)
            </label>
            <Textarea
              value={script}
              onChange={(e) => onScriptChange(e.target.value)}
              className="min-h-[180px] bg-background"
              placeholder="Your AI-generated script will appear here. Click 'Generate Script' above or type your own..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {script && (
                <>
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
                </>
              )}
            </div>

            <span className="text-xs text-muted-foreground">
              {script ? `Word Count: ${wordCount} | Duration: ~${estimatedDuration} sec` : "0 words"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
