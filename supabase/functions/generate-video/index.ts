// Edge function for video generation using Shotstack API
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

// Shotstack API endpoint
// Use stage API for sandbox keys, production for live keys
const SHOTSTACK_API_URL = "https://api.shotstack.io/stage";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const shotstackApiKey = Deno.env.get("SHOTSTACK_API_KEY");
    
    if (!shotstackApiKey) {
      console.error("SHOTSTACK_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Video generation service not configured. Please add SHOTSTACK_API_KEY secret." }),
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

    // Build Shotstack timeline with image clips
    const clipDuration = 3; // seconds per image
    const clips = imageUrls.slice(0, 10).map((url, index) => ({
      asset: {
        type: "image",
        src: url,
      },
      start: index * clipDuration,
      length: clipDuration,
      effect: "zoomIn", // Ken Burns-style effect
      transition: {
        in: "fade",
        out: "fade",
      },
    }));

    // Add text overlay with property info
    const textClips = [
      {
        asset: {
          type: "html",
          html: `<p>${propertyData.address}</p>`,
          css: "p { font-family: 'Montserrat'; color: #ffffff; font-size: 48px; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }",
          width: 1000,
          height: 100,
        },
        start: 0,
        length: clips.length * clipDuration,
        position: "bottom",
        offset: { y: 0.15 },
      },
      {
        asset: {
          type: "html",
          html: `<p>${propertyData.price} | ${propertyData.beds} Bed | ${propertyData.baths} Bath</p>`,
          css: "p { font-family: 'Montserrat'; color: #ffffff; font-size: 36px; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }",
          width: 1000,
          height: 80,
        },
        start: 0,
        length: clips.length * clipDuration,
        position: "bottom",
        offset: { y: 0.08 },
      },
    ];

    // Build the Shotstack render request
    const renderRequest = {
      timeline: {
        background: "#000000",
        tracks: [
          { clips: textClips }, // Text on top
          { clips }, // Images below
        ],
      },
      output: {
        format: "mp4",
        resolution: "hd", // 1280x720
        aspectRatio: "9:16", // Vertical format for social media
        fps: 30,
      },
    };

    console.log("Calling Shotstack API for video render...");
    console.log("- API URL:", `${SHOTSTACK_API_URL}/render`);
    console.log("- Number of clips:", clips.length);
    console.log("- Total duration:", clips.length * clipDuration, "seconds");

    // Call Shotstack API to render video
    const shotstackResponse = await fetch(`${SHOTSTACK_API_URL}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": shotstackApiKey,
      },
      body: JSON.stringify(renderRequest),
    });

    // Get response as text first to handle HTML error pages
    const responseText = await shotstackResponse.text();
    console.log("Shotstack API response status:", shotstackResponse.status);
    console.log("Shotstack API response (first 500 chars):", responseText.substring(0, 500));

    // Check if response is HTML (error page)
    if (responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
      console.error("Shotstack API returned HTML instead of JSON");
      return new Response(
        JSON.stringify({ 
          error: "Shotstack API returned an error page. Please verify your SHOTSTACK_API_KEY is valid.",
          details: responseText.substring(0, 200),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!shotstackResponse.ok) {
      console.error("Shotstack API error:", shotstackResponse.status, responseText);
      
      let errorMessage = "Failed to start video generation";
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = responseText.substring(0, 200);
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: shotstackResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse successful JSON response
    let shotstackData;
    try {
      shotstackData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Shotstack response as JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid response from video service" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("Shotstack API response:", JSON.stringify(shotstackData));

    const jobId = shotstackData.response?.id;

    if (!jobId) {
      console.error("No job ID in Shotstack response:", shotstackData);
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
        estimatedTime: 60, // Shotstack typically takes ~1 minute
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
