// Edge function to check Shotstack video render status
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

console.log("check-video-status: initializing...");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOTSTACK_API_URL = "https://api.shotstack.io/stage";

Deno.serve(async (req) => {
  console.log("check-video-status: request received", req.method);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const shotstackApiKey = Deno.env.get("SHOTSTACK_API_KEY");

    if (!shotstackApiKey) {
      console.error("SHOTSTACK_API_KEY not configured");
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

    console.log("Checking Shotstack status for job:", jobId);

    const statusResponse = await fetch(`${SHOTSTACK_API_URL}/render/${jobId}`, {
      method: "GET",
      headers: { "x-api-key": shotstackApiKey },
    });

    const responseText = await statusResponse.text();
    console.log("Shotstack response:", statusResponse.status, responseText.substring(0, 300));

    if (!statusResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to check video status", details: responseText.substring(0, 200) }),
        { status: statusResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusData = JSON.parse(responseText);
    const renderStatus = statusData.response?.status;
    const videoUrl = statusData.response?.url;

    console.log("Render status:", renderStatus, "URL:", videoUrl || "none");

    let status: "processing" | "done" | "failed";
    if (renderStatus === "done") {
      status = "done";
    } else if (renderStatus === "failed") {
      status = "failed";
    } else {
      status = "processing";
    }

    return new Response(
      JSON.stringify({ status, videoUrl: status === "done" ? videoUrl : null, rawStatus: renderStatus }),
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
