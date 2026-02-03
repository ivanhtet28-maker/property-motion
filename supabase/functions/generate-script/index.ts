/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateScriptRequest {
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
  features: string[];
  description: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: GenerateScriptRequest = await req.json();

    console.log("Received script generation request:");
    console.log("- Address:", body.address);
    console.log("- Price:", body.price);
    console.log("- Bedrooms:", body.bedrooms);
    console.log("- Bathrooms:", body.bathrooms);
    console.log("- Size:", body.size);
    console.log("- Features:", body.features);

    // Build property details for script
    const { address, price, bedrooms, bathrooms, size, features } = body;

    // Generate a compelling script based on property details
    const featuresList = features && features.length > 0 
      ? features.join(", ") 
      : "modern amenities";

    const priceFormatted = price 
      ? `$${parseInt(price).toLocaleString()}` 
      : "contact for price";

    const script = `Welcome to ${address || "this stunning property"}. 

Priced at ${priceFormatted}, this exceptional ${bedrooms}-bedroom, ${bathrooms}-bathroom home offers ${size ? size + " square meters" : "generous living space"} of premium living.

Featuring ${featuresList}, this property combines luxury with functionality. Every detail has been carefully considered to create the perfect family home.

Don't miss this incredible opportunity. Contact us today to arrange your private inspection.`;

    console.log("Generated script successfully");

    return new Response(
      JSON.stringify({
        success: true,
        script: script,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating script:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate script",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
