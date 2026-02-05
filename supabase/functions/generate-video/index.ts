// Edge function for video generation using Luma AI completely
  /// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
  // Version 2.0 - Luma batch generation

  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
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
    userId?: string;
    propertyId?: string;
    script?: string;
    agentInfo?: {
      name: string;
      phone: string;
      email: string;
      photo: string | null;
    };
  }

  // Music library mapping
  const MUSIC_LIBRARY: Record<string, string> = {
    "upbeat-modern-1": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/upbeat-modern-1.mp3",
    "upbeat-modern-2": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/upbeat-modern-2.mp3",
    "upbeat-modern-3": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/upbeat-modern-3.mp3",
    "calm-ambient-1": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/calm-ambient-1.mp3",
    "calm-ambient-2": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/calm-ambient-2.mp3",
    "calm-ambient-3": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/calm-ambient-3.mp3",
    "luxury-elegant-1": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/luxury-elegant-1.mp3",
    "luxury-elegant-2": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/luxury-elegant-2.mp3",
    "luxury-elegant-3": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/luxury-elegant-3.mp3",
    "energetic-pop-1": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/energetic-pop-1.mp3",
    "energetic-pop-2": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/energetic-pop-2.mp3",
    "energetic-pop-3": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/energetic-pop-3.mp3",
    "classical-sophisticated-1": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/classical-sophisticated-1.mp3",
    "classical-sophisticated-2": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/classical-sophisticated-2.mp3",
    "classical-sophisticated-3": "https://acpkhbjgnlenjfiswftx.supabase.co/storage/v1/object/public/video-assets/music/classical-sophisticated-3.mp3",
  };

  const getMusicUrl = (musicId: string): string | null => {
    return MUSIC_LIBRARY[musicId] || null;
  };

  interface LumaGeneration {
    imageUrl: string;
    generationId: string;
    status: "queued" | "error";
    error?: string;
  }

  Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const { imageUrls, propertyData, style, voice, music, userId, propertyId, script, agentInfo }: GenerateVideoRequest = await req.json();

      console.log("=== LUMA AI VIDEO GENERATION ===");
      console.log("Total images:", imageUrls?.length || 0);
      console.log("Property:", propertyData?.address);

      // Validate input - 3-6 images for 15-30 second video (5 seconds per clip)
      if (!imageUrls || imageUrls.length < 3) {
        return new Response(
          JSON.stringify({ error: "Need at least 3 images for video generation (15 seconds minimum)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (imageUrls.length > 6) {
        return new Response(
          JSON.stringify({ error: "Maximum 6 images allowed for 15-30 second video (5 seconds per clip)" }),
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

      // Calculate expected duration
      const expectedDuration = imageUrls.length * 5; // 5 seconds per Luma clip
      console.log("Expected video duration:", expectedDuration, "seconds");

      // === STEP 1: GENERATE VOICEOVER (if voice selected) ===
      let audioUrl: string | null = null;
      if (voice && script) {
        console.log("Generating voiceover with ElevenLabs...");
        try {
          const audioResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-audio`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              },
              body: JSON.stringify({
                script: script,
                voiceId: voice,
                videoId: propertyId,
              }),
            }
          );

          const audioData = await audioResponse.json();
          if (audioData.success) {
            audioUrl = audioData.audioUrl;
            console.log("Voiceover generated:", audioUrl);
          } else {
            console.warn("Voiceover generation failed:", audioData.error);
          }
        } catch (err) {
          console.error("Error generating voiceover:", err);
        }
      }

      // === STEP 2: GET MUSIC URL (if music selected) ===
      let musicUrl: string | null = null;
      if (music) {
        musicUrl = getMusicUrl(music);
        if (musicUrl) {
          console.log("Using background music:", music);
        } else {
          console.warn(`Music track not found: ${music}`);
        }
      }

      // === STEP 3: CREATE DATABASE RECORD ===
      let videoRecordId: string | null = null;
      if (userId) {
        try {
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          const { data: videoRecord, error: dbError } = await supabase
            .from("videos")
            .insert({
              user_id: userId,
              property_id: propertyId || null,
              provider: "luma",
              template: style,
              voice_id: voice,
              music_id: music,
              aspect_ratio: "9:16",
              script: script || propertyData.description,
              status: "queued",
              progress: 0,
              duration: expectedDuration,
              agent_name: agentInfo?.name || null,
              agent_phone: agentInfo?.phone || null,
              agent_email: agentInfo?.email || null,
            })
            .select()
            .single();

          if (dbError) {
            console.error("Failed to create video record:", dbError);
          } else {
            videoRecordId = videoRecord.id;
            console.log("Video record created:", videoRecordId);
          }
        } catch (dbErr) {
          console.error("Database error:", dbErr);
        }
      }

      // === STEP 4: START LUMA BATCH GENERATION ===
      console.log("Starting Luma batch generation for", imageUrls.length, "images...");

      const lumaResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-luma-batch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            imageUrls: imageUrls,
            propertyAddress: propertyData.address,
          }),
        }
      );

      const lumaData = await lumaResponse.json();

      if (!lumaData.success) {
        throw new Error(lumaData.error || "Failed to start Luma batch generation");
      }

      const generations = (lumaData.generations as LumaGeneration[]).filter((g) => g.status === "queued");
      const generationIds = generations.map((g) => g.generationId);

      console.log(`Started ${generations.length} Luma generations`);
      console.log("Generation IDs:", generationIds);

      // Return immediately with job details
      // The frontend will poll check-luma-batch and then call stitch-video
      return new Response(
        JSON.stringify({
          success: true,
          provider: "luma",
          videoId: videoRecordId,
          generationIds: generationIds,
          totalClips: generationIds.length,
          estimatedDuration: expectedDuration,
          estimatedTime: generationIds.length * 45, // ~45 seconds per clip
          message: `Started ${generationIds.length} Luma AI generations. Use check-luma-batch to poll status.`,
          audioUrl: audioUrl,
          musicUrl: musicUrl,
          agentInfo: agentInfo,
          propertyData: propertyData,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error in video generation:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate video",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  });