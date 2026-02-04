// Edge function for video generation using Luma Labs + Shotstack hybrid approach
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

// API endpoints
const LUMA_API_URL = "https://api.lumalabs.ai/dream-machine/v1";
const SHOTSTACK_API_URL = "https://api.shotstack.io/v1";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const lumaApiKey = Deno.env.get("LUMA_API_KEY");
    const shotstackApiKey = Deno.env.get("SHOTSTACK_API_KEY");
    
    if (!lumaApiKey) {
      console.error("LUMA_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Video generation service not configured. Please add LUMA_API_KEY secret." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!shotstackApiKey) {
      console.error("SHOTSTACK_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Video editing service not configured. Please add SHOTSTACK_API_KEY secret." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageUrls, propertyData, style, voice, music }: GenerateVideoRequest = await req.json();

    console.log("=== PROPERTY WALKTHROUGH VIDEO GENERATION ===");
    console.log("Total images:", imageUrls?.length || 0);
    console.log("Property:", propertyData?.address);
    console.log("Style:", style);

    // Validate input
    if (!imageUrls || imageUrls.length < 5) {
      return new Response(
        JSON.stringify({ error: "Need at least 5 images" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate images are URLs
    for (const url of imageUrls) {
      if (!url.startsWith("http")) {
        return new Response(
          JSON.stringify({ error: "Images must be URLs, not base64 data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // === APPROACH: SHOTSTACK SLIDESHOW WITH ALL IMAGES ===
    // Creates a professional property tour video using all images with smooth transitions
    
    console.log("Creating Shotstack slideshow with all", imageUrls.length, "images");

    // Build Shotstack timeline with all images
    const clipDuration = 3; // seconds per image
    const transitionDuration = 0.5; // transition overlap
    
    // Create image clips for slideshow
    const imageClips = imageUrls.map((url, index) => ({
      asset: {
        type: "image",
        src: url
      },
      start: index * (clipDuration - transitionDuration),
      length: clipDuration,
      fit: "cover",
      transition: {
        in: index === 0 ? "fade" : "slideLeft",
        out: index === imageUrls.length - 1 ? "fade" : "slideLeft"
      },
      effect: "zoomIn" // Ken Burns effect
    }));

    // Calculate total video duration
    const totalDuration = (imageUrls.length * clipDuration) - ((imageUrls.length - 1) * transitionDuration);

    // Create text overlay for property info
    const addressParts = propertyData.address.split(',');
    const streetAddress = addressParts[0]?.trim() || propertyData.address;
    const suburb = addressParts[1]?.trim() || '';

    const textClips = [
      // Property address - appears at start
      {
        asset: {
          type: "html",
          html: `<div style="font-family: 'Inter', sans-serif; text-align: center; padding: 20px;">
            <p style="font-size: 24px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); margin: 0; font-weight: 600;">${streetAddress}</p>
            <p style="font-size: 18px; color: #e0e0e0; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); margin: 5px 0 0 0;">${suburb}</p>
          </div>`,
          width: 600,
          height: 120
        },
        start: 0.5,
        length: 4,
        position: "bottom",
        offset: { y: 0.1 },
        transition: { in: "fade", out: "fade" }
      },
      // Price and specs - appears in middle
      {
        asset: {
          type: "html",
          html: `<div style="font-family: 'Inter', sans-serif; text-align: center; padding: 20px; background: rgba(0,0,0,0.6); border-radius: 12px;">
            <p style="font-size: 32px; color: #FFD700; margin: 0; font-weight: 700;">$${Number(propertyData.price).toLocaleString()}</p>
            <p style="font-size: 18px; color: white; margin: 10px 0 0 0;">${propertyData.beds} Bed · ${propertyData.baths} Bath</p>
          </div>`,
          width: 400,
          height: 120
        },
        start: totalDuration / 2,
        length: 3,
        position: "center",
        transition: { in: "fade", out: "fade" }
      },
      // Call to action - end
      {
        asset: {
          type: "html",
          html: `<div style="font-family: 'Inter', sans-serif; text-align: center; padding: 30px; background: linear-gradient(135deg, rgba(139,92,246,0.9), rgba(168,85,247,0.9)); border-radius: 16px;">
            <p style="font-size: 24px; color: white; margin: 0; font-weight: 700;">Book Your Viewing Today</p>
          </div>`,
          width: 450,
          height: 100
        },
        start: totalDuration - 3,
        length: 2.5,
        position: "center",
        transition: { in: "slideUp", out: "fade" }
      }
    ];

    // Build the Shotstack edit request
    const shotstackEdit = {
      timeline: {
        background: "#000000",
        tracks: [
          { clips: textClips }, // Text on top
          { clips: imageClips } // Images below
        ]
      },
      output: {
        format: "mp4",
        resolution: "hd", // 1080p
        aspectRatio: "9:16", // Vertical for social media
        fps: 30
      }
    };

    console.log("Shotstack edit timeline:", JSON.stringify(shotstackEdit, null, 2).substring(0, 500));

    // Submit to Shotstack
    const shotstackResponse = await fetch(`${SHOTSTACK_API_URL}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": shotstackApiKey
      },
      body: JSON.stringify(shotstackEdit)
    });

    const shotstackText = await shotstackResponse.text();
    console.log("Shotstack response status:", shotstackResponse.status);
    console.log("Shotstack response:", shotstackText.substring(0, 500));

    if (!shotstackResponse.ok) {
      console.error("Shotstack API error:", shotstackText);
      return new Response(
        JSON.stringify({ error: "Failed to start video rendering: " + shotstackText.substring(0, 200) }),
        { status: shotstackResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let shotstackData;
    try {
      shotstackData = JSON.parse(shotstackText);
    } catch (e) {
      console.error("Failed to parse Shotstack response:", e);
      return new Response(
        JSON.stringify({ error: "Invalid response from video service" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jobId = shotstackData.response?.id;
    
    if (!jobId) {
      console.error("No job ID in Shotstack response:", shotstackData);
      return new Response(
        JSON.stringify({ error: "Failed to get job ID from video service" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("=== PROPERTY WALKTHROUGH STARTED ===");
    console.log("Job ID:", jobId);
    console.log("Total images used:", imageUrls.length);
    console.log("Estimated duration:", Math.round(totalDuration), "seconds");

    return new Response(
      JSON.stringify({
        success: true,
        jobId: jobId,
        message: "Property walkthrough video generation started",
        totalImages: imageUrls.length,
        estimatedDuration: Math.round(totalDuration),
        estimatedTime: 60, // Shotstack is typically faster than Luma
        provider: "shotstack"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing video generation request:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process request",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
