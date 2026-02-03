/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateVideoRequest {
  images: string[];
  script: string;
  aspectRatio: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { images, script, aspectRatio }: GenerateVideoRequest = await req.json();

    console.log("Received video generation request:");
    console.log("- Number of images:", images?.length || 0);
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

    // Generate a unique job ID
    const jobId = crypto.randomUUID();

    console.log("Created video generation job:", jobId);

    // TODO: In production, this would:
    // 1. Store the job in a database
    // 2. Queue the video generation task (e.g., using Shotstack API)
    // 3. Return immediately with the jobId for status polling

    // For now, return a mock successful response
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
        error: error instanceof Error ? error.message : "Failed to process request" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
