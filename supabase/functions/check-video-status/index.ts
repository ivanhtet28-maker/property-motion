// Edge function to check Luma Labs video generation status
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

console.log("check-video-status: initializing...");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LUMA_API_URL = "https://api.lumalabs.ai/dream-machine/v1";

Deno.serve(async (req) => {
  console.log("check-video-status: request received", req.method);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const lumaApiKey = Deno.env.get("LUMA_API_KEY");

    if (!lumaApiKey) {
      console.error("LUMA_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Video service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const jobId = body.jobId;

    if (!jobId) {
      console.error("No jobId provided");
      return new Response(
        JSON.stringify({ error: "Job ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Checking Luma Labs status for job:", jobId);

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

    console.log("Generation status:", lumaStatus, "URL:", videoUrl || "none");

    // Luma states: dreaming, completed, failed
    let status: "processing" | "done" | "failed";
    if (lumaStatus === "completed") {
      status = "done";
    } else if (lumaStatus === "failed") {
      status = "failed";
    } else {
      // dreaming, queued, processing
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
  } catch (error) {
    console.error("Error in check-video-status:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to check status" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
