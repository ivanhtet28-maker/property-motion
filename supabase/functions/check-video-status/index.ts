/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function updateVideoRecord(
  videoId: string | undefined,
  status: "processing" | "completed" | "failed",
  videoUrl: string | null = null,
  progress: number = 0,
  errorMessage: string | null = null
) {
  if (!videoId) return;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const updateData: {
      status: string;
      progress: number;
      video_url?: string;
      completed_at?: string;
      error_message?: string;
    } = {
      status,
      progress,
    };

    if (videoUrl) {
      updateData.video_url = videoUrl;
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { error } = await supabase
      .from("videos")
      .update(updateData)
      .eq("id", videoId);

    if (error) {
      console.error("Failed to update video record:", error);
    } else {
      console.log("Video record updated:", videoId, "status:", status, "progress:", progress);
    }
  } catch (err) {
    console.error("Error updating video record:", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { generationIds, videoId, audioUrl, musicUrl, agentInfo, propertyData, stitchJobId } = body;

    // If stitchJobId is provided, we're polling Shotstack stitching job instead of Luma
    if (stitchJobId) {
      console.log("Checking Shotstack stitch job status:", stitchJobId);

      const shotstackResponse = await fetch(
        `https://api.shotstack.io/v1/render/${stitchJobId}`,
        {
          headers: {
            "x-api-key": Deno.env.get("SHOTSTACK_API_KEY")!,
          },
        }
      );

      const shotstackData = await shotstackResponse.json();
      const shotstackStatus = shotstackData.response?.status; // "queued", "fetching", "rendering", "saving", "done", "failed"
      const videoUrl = shotstackData.response?.url;

      console.log("Shotstack status:", shotstackStatus);

      if (shotstackStatus === "done" && videoUrl) {
        await updateVideoRecord(videoId, "completed", videoUrl, 100);
        return new Response(
          JSON.stringify({
            status: "done",
            videoUrl: videoUrl,
            message: "Video stitched successfully!",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (shotstackStatus === "failed") {
        await updateVideoRecord(videoId, "failed", null, 0, "Shotstack stitching failed");
        return new Response(
          JSON.stringify({
            status: "failed",
            message: "Video stitching failed",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Still stitching
        return new Response(
          JSON.stringify({
            status: "stitching",
            progress: 95,
            message: "Stitching video clips...",
            stitchJobId: stitchJobId,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Otherwise, check Luma generation status
    if (!generationIds || !Array.isArray(generationIds) || generationIds.length === 0) {
      throw new Error("generationIds array is required");
    }

    console.log("Checking status for", generationIds.length, "Luma generations");

    // Check batch status
    const statusResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/check-luma-batch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({ generationIds }),
      }
    );

    const statusData = await statusResponse.json();

    if (!statusData.success) {
      throw new Error("Failed to check Luma batch status");
    }

    const { allCompleted, anyFailed, summary, videoUrls } = statusData;

    // Calculate progress based on completed clips
    const progressPercent = Math.round((summary.completed / summary.total) * 80); // 0-80% for Luma generation

    await updateVideoRecord(videoId, "processing", null, progressPercent);

    // If any failed, return error
    if (anyFailed && summary.completed === 0) {
      await updateVideoRecord(videoId, "failed", null, 0, "All Luma generations failed");
      return new Response(
        JSON.stringify({
          status: "failed",
          message: "All video clips failed to generate",
          summary,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If not all complete yet, return processing status
    if (!allCompleted) {
      return new Response(
        JSON.stringify({
          status: "processing",
          progress: progressPercent,
          message: `${summary.completed}/${summary.total} clips ready`,
          summary,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // All complete - start Shotstack stitching
    console.log("All Luma clips ready! Starting Shotstack stitching...");

    await updateVideoRecord(videoId, "processing", null, 85, "Stitching video clips...");

    const stitchResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/stitch-video`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          videoUrls: videoUrls,
          audioUrl: audioUrl,
          musicUrl: musicUrl,
          agentInfo: agentInfo,
          propertyData: propertyData,
          videoId: videoId,
        }),
      }
    );

    const stitchData = await stitchResponse.json();

    if (!stitchData.success) {
      console.error("Stitching failed:", stitchData.error);
      await updateVideoRecord(videoId, "failed", null, 0, stitchData.error || "Video stitching failed");
      return new Response(
        JSON.stringify({
          status: "failed",
          message: stitchData.error || "Failed to stitch video clips",
          summary,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Shotstack job started - now poll for the stitch job
    console.log("Stitching job started with Shotstack:", stitchData.jobId);

    return new Response(
      JSON.stringify({
        status: "stitching",
        progress: 90,
        message: "Stitching video clips with Shotstack...",
        stitchJobId: stitchData.jobId,
        summary,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking video status:", error);
    return new Response(
      JSON.stringify({
        status: "failed",
        error: error instanceof Error ? error.message : "Failed to check video status",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
