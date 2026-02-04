// Edge function for video generation using Luma Labs Dream Machine API
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

// Luma Labs API endpoint
const LUMA_API_URL = "https://api.lumalabs.ai/dream-machine/v1";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const lumaApiKey = Deno.env.get("LUMA_API_KEY");
    
    if (!lumaApiKey) {
      console.error("LUMA_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Video generation service not configured. Please add LUMA_API_KEY secret." }),
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

    // Validate images are URLs (not base64)
    for (const url of imageUrls) {
      if (!url.startsWith("http")) {
        console.error("Invalid image URL - expected http(s) URL, got:", url.substring(0, 50));
        return new Response(
          JSON.stringify({ error: "Images must be URLs, not base64 data" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Build prompt for Luma Labs
    const prompt = `Create a cinematic real estate property tour video. 
Property: ${propertyData.address}
Price: ${propertyData.price} | ${propertyData.beds} Bedrooms | ${propertyData.baths} Bathrooms
${propertyData.description}

Style: ${style || 'professional'}, smooth camera movements, elegant transitions between rooms, 
highlight architectural details, warm inviting atmosphere, 9:16 vertical format for social media.`;

    console.log("Calling Luma Labs API for video generation...");
    console.log("- Prompt:", prompt.substring(0, 200));

    // Use the first image as the keyframe for image-to-video generation
    const requestBody = {
      model: "ray-2",
      prompt: prompt,
      keyframes: {
        frame0: {
          type: "image",
          url: imageUrls[0]
        }
      },
      aspect_ratio: "9:16",
      loop: false
    };

    console.log("Request body:", JSON.stringify(requestBody));

    // Call Luma Labs API to generate video
    const lumaResponse = await fetch(`${LUMA_API_URL}/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lumaApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await lumaResponse.text();
    console.log("Luma Labs API response status:", lumaResponse.status);
    console.log("Luma Labs API response:", responseText.substring(0, 500));

    if (!lumaResponse.ok) {
      console.error("Luma Labs API error:", lumaResponse.status, responseText);
      
      let errorMessage = "Failed to start video generation";
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.detail || errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = responseText.substring(0, 200);
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: lumaResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse successful JSON response
    let lumaData;
    try {
      lumaData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Luma response as JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid response from video service" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("Luma Labs API response parsed:", JSON.stringify(lumaData));

    const jobId = lumaData.id;

    if (!jobId) {
      console.error("No job ID in Luma response:", lumaData);
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
        estimatedTime: 120, // Luma typically takes ~2 minutes
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
