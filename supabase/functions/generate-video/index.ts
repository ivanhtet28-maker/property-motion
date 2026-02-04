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

    // Mobile-optimized text overlays (9:16 vertical format = 1080x1920)
    const textClips = [
      // Property address - large, bold, bottom third for mobile thumb zone
      {
        asset: {
          type: "html",
          html: `<div style="font-family: 'Inter', sans-serif; text-align: center; padding: 24px 16px; background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)); width: 100%;">
            <p style="font-size: 42px; color: white; text-shadow: 3px 3px 6px rgba(0,0,0,0.9); margin: 0; font-weight: 700; line-height: 1.2;">${streetAddress}</p>
            <p style="font-size: 28px; color: #e0e0e0; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); margin: 12px 0 0 0; font-weight: 500;">${suburb}</p>
          </div>`,
          width: 1080,
          height: 300
        },
        start: 0.3,
        length: 4.5,
        position: "bottom",
        offset: { y: 0 },
        transition: { in: "fade", out: "fade" }
      },
      // Price and specs - centered, prominent for mobile
      {
        asset: {
          type: "html",
          html: `<div style="font-family: 'Inter', sans-serif; text-align: center; padding: 32px 24px; background: rgba(0,0,0,0.75); border-radius: 24px; backdrop-filter: blur(10px);">
            <p style="font-size: 56px; color: #FFD700; margin: 0; font-weight: 800; text-shadow: 2px 2px 8px rgba(0,0,0,0.5);">$${Number(propertyData.price).toLocaleString()}</p>
            <p style="font-size: 32px; color: white; margin: 16px 0 0 0; font-weight: 600;">${propertyData.beds} Bed · ${propertyData.baths} Bath</p>
          </div>`,
          width: 900,
          height: 220
        },
        start: totalDuration / 2,
        length: 3.5,
        position: "center",
        transition: { in: "fade", out: "fade" }
      },
      // Call to action - end, thumb-friendly at bottom
      {
        asset: {
          type: "html",
          html: `<div style="font-family: 'Inter', sans-serif; text-align: center; padding: 40px 32px; background: linear-gradient(135deg, rgba(139,92,246,0.95), rgba(168,85,247,0.95)); border-radius: 28px; box-shadow: 0 8px 32px rgba(139,92,246,0.4);">
            <p style="font-size: 36px; color: white; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Book Your Viewing</p>
          </div>`,
          width: 900,
          height: 160
        },
        start: totalDuration - 3.5,
        length: 3,
        position: "center",
        offset: { y: 0.15 },
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
