// Edge function for video generation
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PropertyData {
  address: string;
  price: string;
  beds: number;
  baths: number;
  description: string;
}

interface GenerateVideoRequest {
  imageUrls: string[];
  propertyData: PropertyData;
  style: string;
  voice: string;
  music: string;
}

// Official Runway API endpoint (note: api.dev.runwayml.com for developers)
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
        JSON.stringify({ error: "Video generation service not configured. Please add RUNWAY_API_KEY secret." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { imageUrls, propertyData, style, voice, music }: GenerateVideoRequest = await req.json();

    console.log("Received video generation request:");
    console.log("- Number of images:", imageUrls?.length || 0);
    console.log("- First image URL:", imageUrls?.[0]?.substring(0, 100) || "none");
    console.log("- Property address:", propertyData?.address || "none");
    console.log("- Style:", style);

    // Validate input
    if (!imageUrls || imageUrls.length < 5) {
      return new Response(
        JSON.stringify({ error: "Need at least 5 images" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!propertyData?.description) {
      return new Response(
        JSON.stringify({ error: "Property description is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use the first image URL for Runway's image-to-video generation
    const firstImageUrl = imageUrls[0];
    
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
    console.log("- API URL:", `${RUNWAY_API_URL}/image_to_video`);
    console.log("- Using image URL:", firstImageUrl);
    console.log("- API Key prefix:", runwayApiKey.substring(0, 10) + "...");
    
    // Build request body according to Runway API docs
    const requestBody = {
      model: "gen4_turbo",
      promptImage: firstImageUrl,
      promptText: propertyData.description.substring(0, 1000),
      ratio: "720:1280", // 9:16 vertical format
      duration: 5,
    };
    
    console.log("Request body:", JSON.stringify(requestBody));
    
    // Call Runway API to generate video from first image
    const runwayResponse = await fetch(`${RUNWAY_API_URL}/image_to_video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${runwayApiKey}`,
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify(requestBody),
    });

    // Get response as text first to handle HTML error pages
    const responseText = await runwayResponse.text();
    console.log("Runway API response status:", runwayResponse.status);
    console.log("Runway API response (first 500 chars):", responseText.substring(0, 500));

    // Check if response is HTML (error page)
    if (responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
      console.error("Runway API returned HTML instead of JSON - likely invalid endpoint or auth issue");
      return new Response(
        JSON.stringify({ 
          error: "Runway API returned an error page. Please verify your RUNWAY_API_KEY is valid.",
          details: "The API endpoint may be incorrect or the API key may be invalid."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!runwayResponse.ok) {
      console.error("Runway API error:", runwayResponse.status, responseText);
      
      // Try to parse error message
      let errorMessage = "Failed to start video generation";
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = responseText.substring(0, 200);
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: runwayResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse successful JSON response
    let runwayData;
    try {
      runwayData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Runway response as JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid response from video service" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
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
