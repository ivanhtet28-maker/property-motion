/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateVideoRequest {
  images: string[]; // Now expects URLs from Supabase Storage, not base64
  script: string;
  aspectRatio: string;
}

const RUNWAY_API_URL = "https://api.dev.runwayml.com/v1";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const runwayApiKey = Deno.env.get("RUNWAY_API_KEY");
    
    if (!runwayApiKey) {
      console.error("RUNWAY_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Video generation service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { images, script, aspectRatio }: GenerateVideoRequest = await req.json();

    console.log("Received video generation request:");
    console.log("- Number of images:", images?.length || 0);
    console.log("- First image URL:", images?.[0]?.substring(0, 100) || "none");
    console.log("- Script length:", script?.length || 0);
    console.log("- Aspect ratio:", aspectRatio);

    // Validate input
    if (!images || images.length < 5) {
      return new Response(
        JSON.stringify({ error: "Need at least 5 images" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!script) {
      return new Response(
        JSON.stringify({ error: "Script is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use the first image URL for Runway's image-to-video generation
    const firstImageUrl = images[0];
    
    // Validate it's a URL (not base64)
    if (!firstImageUrl.startsWith("http")) {
      console.error("Invalid image URL - expected http(s) URL, got:", firstImageUrl.substring(0, 50));
      return new Response(
        JSON.stringify({ error: "Images must be URLs, not base64 data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("Calling Runway API for image-to-video generation...");
    console.log("- Using image URL:", firstImageUrl);
    
    // Call Runway API to generate video from first image
    const runwayResponse = await fetch(`${RUNWAY_API_URL}/image_to_video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${runwayApiKey}`,
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen4_turbo",
        promptImage: firstImageUrl, // Now using URL from storage
        promptText: script.substring(0, 512), // Runway has text limit
        ratio: aspectRatio === "9:16" ? "720:1280" : "1280:720",
        duration: 5,
      }),
    });

    if (!runwayResponse.ok) {
      const errorText = await runwayResponse.text();
      console.error("Runway API error:", runwayResponse.status, errorText);
      
      // Parse error for better messaging
      let errorMessage = "Failed to start video generation";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        // Use default message
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: runwayResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const runwayData = await runwayResponse.json();
    console.log("Runway API response:", JSON.stringify(runwayData));

    const jobId = runwayData.id;

    if (!jobId) {
      console.error("No job ID in Runway response:", runwayData);
      return new Response(
        JSON.stringify({ error: "Failed to get job ID from video service" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Video generation job started:", jobId);

    return new Response(
      JSON.stringify({
        success: true,
        jobId: jobId,
        message: "Video generation started",
        estimatedTime: 35,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing video generation request:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process request",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
