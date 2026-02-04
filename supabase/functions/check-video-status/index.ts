// Edge function to check video generation status (supports Shotstack and Luma Labs)
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

console.log("check-video-status: initializing...");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOTSTACK_API_URL = "https://api.shotstack.io/v1";
const LUMA_API_URL = "https://api.lumalabs.ai/dream-machine/v1";

Deno.serve(async (req) => {
  console.log("check-video-status: request received", req.method);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const jobId = body.jobId;
    const provider = body.provider || "shotstack"; // Default to shotstack

    if (!jobId) {
      console.error("No jobId provided");
      return new Response(
        JSON.stringify({ error: "Job ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking status for job ${jobId} (provider: ${provider})`);

    if (provider === "luma") {
      // Luma Labs status check
      const lumaApiKey = Deno.env.get("LUMA_API_KEY");
      if (!lumaApiKey) {
        return new Response(
          JSON.stringify({ error: "Luma API key not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const statusResponse = await fetch(`${LUMA_API_URL}/generations/${jobId}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${lumaApiKey}`,
          "Content-Type": "application/json"
        },
      });

      const responseText = await statusResponse.text();
      console.log("Luma response:", statusResponse.status, responseText.substring(0, 300));

      if (!statusResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to check video status", details: responseText.substring(0, 200) }),
          { status: statusResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const statusData = JSON.parse(responseText);
      const lumaStatus = statusData.state;
      const videoUrl = statusData.assets?.video;

      let status: "processing" | "done" | "failed";
      if (lumaStatus === "completed") {
        status = "done";
      } else if (lumaStatus === "failed") {
        status = "failed";
      } else {
        status = "processing";
      }

      return new Response(
        JSON.stringify({ 
          status, 
          videoUrl: status === "done" ? videoUrl : null, 
          rawStatus: lumaStatus,
          failureReason: statusData.failure_reason || null
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Shotstack status check (default)
      const shotstackApiKey = Deno.env.get("SHOTSTACK_API_KEY");
      if (!shotstackApiKey) {
        return new Response(
          JSON.stringify({ error: "Shotstack API key not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const statusResponse = await fetch(`${SHOTSTACK_API_URL}/render/${jobId}`, {
        method: "GET",
        headers: { 
          "x-api-key": shotstackApiKey,
          "Content-Type": "application/json"
        },
      });

      const responseText = await statusResponse.text();
      console.log("Shotstack response:", statusResponse.status, responseText.substring(0, 500));

      if (!statusResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to check video status", details: responseText.substring(0, 200) }),
          { status: statusResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const statusData = JSON.parse(responseText);
      const shotstackStatus = statusData.response?.status;
      const videoUrl = statusData.response?.url;

      console.log("Shotstack status:", shotstackStatus, "URL:", videoUrl || "none");

      // Shotstack states: queued, fetching, rendering, saving, done, failed
      let status: "processing" | "done" | "failed";
      if (shotstackStatus === "done") {
        status = "done";
      } else if (shotstackStatus === "failed") {
        status = "failed";
      } else {
        status = "processing";
      }

      return new Response(
        JSON.stringify({ 
          status, 
          videoUrl: status === "done" ? videoUrl : null, 
          rawStatus: shotstackStatus,
          failureReason: statusData.response?.error || null
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in check-video-status:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to check status" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
