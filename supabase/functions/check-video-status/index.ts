// Edge function to check Shotstack video render status
// Version: 2 - Force redeploy
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

console.log("check-video-status function loaded");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Use stage API for sandbox keys, production for live keys
const SHOTSTACK_API_URL = "https://api.shotstack.io/stage";

interface CheckStatusRequest {
  jobId: string;
}

Deno.serve(async (req) => {
  console.log("check-video-status called:", req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const shotstackApiKey = Deno.env.get("SHOTSTACK_API_KEY");
    
    if (!shotstackApiKey) {
      console.error("SHOTSTACK_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Video service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { jobId }: CheckStatusRequest = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Job ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Checking status for job:", jobId);

    // Call Shotstack API to get render status
    const statusResponse = await fetch(`${SHOTSTACK_API_URL}/render/${jobId}`, {
      method: "GET",
      headers: {
        "x-api-key": shotstackApiKey,
      },
    });

    const responseText = await statusResponse.text();
    console.log("Shotstack status response:", responseText.substring(0, 500));

    if (!statusResponse.ok) {
      console.error("Shotstack status error:", statusResponse.status, responseText);
      return new Response(
        JSON.stringify({ error: "Failed to check video status" }),
        {
          status: statusResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let statusData;
    try {
      statusData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse status response:", e);
      return new Response(
        JSON.stringify({ error: "Invalid status response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const renderStatus = statusData.response?.status;
    const videoUrl = statusData.response?.url;

    console.log("Render status:", renderStatus, "URL:", videoUrl);

    // Map Shotstack status to our status
    let status: "processing" | "done" | "failed";
    if (renderStatus === "done") {
      status = "done";
    } else if (renderStatus === "failed") {
      status = "failed";
    } else {
      // queued, fetching, rendering, saving
      status = "processing";
    }

    return new Response(
      JSON.stringify({
        status,
        videoUrl: status === "done" ? videoUrl : null,
        rawStatus: renderStatus,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error checking video status:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to check status",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
