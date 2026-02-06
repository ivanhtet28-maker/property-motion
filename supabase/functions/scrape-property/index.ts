// ScraperAPI Integration for Property Image Scraping
// Supports: Domain.com.au, Realtor.com.au

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const SCRAPER_API_KEY = Deno.env.get("SCRAPER_API_KEY") || "";
const SCRAPER_API_BASE = "https://api.scraperapi.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ScrapedProperty {
  address: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  price?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  landSize?: string;
  features?: string[];
  description?: string;
  imageUrls: string[];
  sourceUrl: string;
  sourceWebsite: string;
  listingId?: string;
}

// Detect website type from URL
function detectWebsite(url: string): string {
  if (url.includes("domain.com.au")) return "domain.com.au";
  if (url.includes("realtor.com.au")) return "realtor.com.au";
  return "unknown";
}

// Extract listing ID from URL
function extractListingId(url: string, website: string): string | undefined {
  try {
    if (website === "domain.com.au") {
      // Example: https://www.domain.com.au/123-street-suburb-vic-3000-2018123456
      const match = url.match(/-(\d+)$/);
      return match ? match[1] : undefined;
    } else if (website === "realtor.com.au") {
      // Example: https://www.realtor.com.au/property/123456
      const match = url.match(/property\/(\d+)/);
      return match ? match[1] : undefined;
    }
  } catch (e) {
    console.error("Error extracting listing ID:", e);
  }
  return undefined;
}

// Scrape property data using ScraperAPI
async function scrapePropertyData(url: string): Promise<string> {
  if (!SCRAPER_API_KEY) {
    throw new Error("SCRAPER_API_KEY environment variable not set");
  }

  // ScraperAPI parameters
  const scraperUrl = new URL(SCRAPER_API_BASE);
  scraperUrl.searchParams.set("api_key", SCRAPER_API_KEY);
  scraperUrl.searchParams.set("url", url);
  scraperUrl.searchParams.set("render", "true"); // Enable JavaScript rendering
  scraperUrl.searchParams.set("country_code", "au"); // Australian IP for .au sites

  console.log("Calling ScraperAPI for:", url);

  const response = await fetch(scraperUrl.toString());

  if (!response.ok) {
    throw new Error(`ScraperAPI error: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

// Parse Domain.com.au HTML
function parseDomainAu(html: string, sourceUrl: string): ScrapedProperty {
  const imageUrls: string[] = [];
  const features: string[] = [];

  // Extract images - Domain.com.au typically uses data-src or src in gallery
  const imageRegex = /<img[^>]+(?:data-src|src)="([^"]+)"[^>]*(?:gallery|listing|property)[^>]*>/gi;
  let match;
  while ((match = imageRegex.exec(html)) !== null) {
    let imgUrl = match[1];
    // Domain uses CDN URLs
    if (imgUrl && (imgUrl.startsWith("http") || imgUrl.startsWith("//"))) {
      if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
      // Filter out small thumbnails and logos
      if (!imgUrl.includes("logo") && !imgUrl.includes("icon") && !imgUrl.includes("avatar")) {
        imageUrls.push(imgUrl);
      }
    }
  }

  // Extract price - Domain format: "$XXX,XXX" or "$X.XX million"
  let price = "";
  const priceMatch = html.match(/<[^>]*price[^>]*>([^<]*\$[^<]+)<\/[^>]*>/i) ||
    html.match(/\$[\d,]+(?:\.\d+)?\s*(?:million|k)?/i);
  if (priceMatch) price = priceMatch[1] || priceMatch[0];

  // Extract address
  let address = "";
  const addressMatch = html.match(/<h1[^>]*>([^<]*(?:\d+\s+)?[^<]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|Lane|Ln)[^<]*)<\/h1>/i);
  if (addressMatch) address = addressMatch[1].trim();

  // Extract bedrooms, bathrooms, parking
  const bedroomsMatch = html.match(/(\d+)\s*(?:bed|bedroom)/i);
  const bathroomsMatch = html.match(/(\d+)\s*(?:bath|bathroom)/i);
  const parkingMatch = html.match(/(\d+)\s*(?:car|parking|garage)/i);

  const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : undefined;
  const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1]) : undefined;
  const parking = parkingMatch ? parseInt(parkingMatch[1]) : undefined;

  // Extract land size
  let landSize = "";
  const landMatch = html.match(/(\d+(?:,\d+)?)\s*(?:m²|sqm|square metre)/i);
  if (landMatch) landSize = landMatch[1] + " m²";

  // Extract features
  const featureMatches = html.matchAll(/<li[^>]*feature[^>]*>([^<]+)<\/li>/gi);
  for (const fm of featureMatches) {
    features.push(fm[1].trim());
  }

  // Extract description
  let description = "";
  const descMatch = html.match(/<div[^>]*description[^>]*>([^<]+(?:<[^>]+>[^<]*)*?)<\/div>/i);
  if (descMatch) {
    description = descMatch[1].replace(/<[^>]+>/g, "").trim();
  }

  return {
    address,
    price,
    bedrooms,
    bathrooms,
    parking,
    landSize,
    features: features.length > 0 ? features : undefined,
    description,
    imageUrls: [...new Set(imageUrls)], // Remove duplicates
    sourceUrl,
    sourceWebsite: "domain.com.au",
    listingId: extractListingId(sourceUrl, "domain.com.au"),
  };
}

// Parse Realtor.com.au HTML
function parseRealtorAu(html: string, sourceUrl: string): ScrapedProperty {
  const imageUrls: string[] = [];
  const features: string[] = [];

  // Extract images - Realtor.com.au uses property-gallery
  const imageRegex = /<img[^>]+(?:data-src|src)="([^"]+)"[^>]*>/gi;
  let match;
  while ((match = imageRegex.exec(html)) !== null) {
    const imgUrl = match[1];
    if (imgUrl && imgUrl.startsWith("http")) {
      // Filter out UI elements
      if (!imgUrl.includes("logo") && !imgUrl.includes("icon") && !imgUrl.includes("avatar")) {
        imageUrls.push(imgUrl);
      }
    }
  }

  // Extract price
  let price = "";
  const priceMatch = html.match(/<span[^>]*price[^>]*>([^<]*\$[^<]+)<\/span>/i) ||
    html.match(/\$[\d,]+/);
  if (priceMatch) price = priceMatch[1] || priceMatch[0];

  // Extract address
  let address = "";
  const addressMatch = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (addressMatch) address = addressMatch[1].trim();

  // Extract property details
  const bedroomsMatch = html.match(/(\d+)\s*bed/i);
  const bathroomsMatch = html.match(/(\d+)\s*bath/i);
  const parkingMatch = html.match(/(\d+)\s*car/i);

  const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : undefined;
  const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1]) : undefined;
  const parking = parkingMatch ? parseInt(parkingMatch[1]) : undefined;

  // Extract land size
  let landSize = "";
  const landMatch = html.match(/(\d+)\s*m²/i);
  if (landMatch) landSize = landMatch[1] + " m²";

  return {
    address,
    price,
    bedrooms,
    bathrooms,
    parking,
    landSize,
    features: features.length > 0 ? features : undefined,
    imageUrls: [...new Set(imageUrls)],
    sourceUrl,
    sourceWebsite: "realtor.com.au",
    listingId: extractListingId(sourceUrl, "realtor.com.au"),
  };
}

// Parse scraped HTML based on website
function parsePropertyHtml(html: string, url: string, website: string): ScrapedProperty {
  if (website === "domain.com.au") {
    return parseDomainAu(html, url);
  } else if (website === "realtor.com.au") {
    return parseRealtorAu(html, url);
  }
  throw new Error(`Unsupported website: ${website}`);
}

// Upload image to Supabase Storage
async function uploadImageToStorage(
  supabase: SupabaseClient,
  imageUrl: string,
  userId: string,
  index: number
): Promise<string | null> {
  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return null;

    const imageBlob = await imageResponse.blob();
    const fileExt = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
    const fileName = `${userId}/${Date.now()}_${index}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("property-images")
      .upload(fileName, imageBlob, {
        contentType: imageBlob.type || "image/jpeg",
        cacheControl: "3600",
      });

    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("property-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (e) {
    console.error("Error uploading image:", e);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url, userId } = await req.json();

    if (!url) {
      throw new Error("Property URL is required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Detect website
    const website = detectWebsite(url);
    if (website === "unknown") {
      throw new Error("Unsupported property website. Supported: Domain.com.au, Realtor.com.au");
    }

    console.log("Scraping property from:", website);

    // Create scraping job record
    const { data: scrapingJob, error: jobError } = await supabase
      .from("scraping_jobs")
      .insert({
        user_id: userId,
        source_url: url,
        source_website: website,
        status: "in_progress",
      })
      .select()
      .single();

    if (jobError) {
      console.error("Error creating scraping job:", jobError);
    }

    // Scrape the property page
    const html = await scrapePropertyData(url);

    // Parse property data
    const propertyData = parsePropertyHtml(html, url, website);

    console.log(`Found ${propertyData.imageUrls.length} images`);

    // Upload images to Supabase Storage
    const uploadedImageUrls: string[] = [];
    for (let i = 0; i < Math.min(propertyData.imageUrls.length, 20); i++) {
      const imageUrl = propertyData.imageUrls[i];
      const uploadedUrl = await uploadImageToStorage(supabase, imageUrl, userId || "anonymous", i);
      if (uploadedUrl) {
        uploadedImageUrls.push(uploadedUrl);
      }
    }

    console.log(`Successfully uploaded ${uploadedImageUrls.length} images`);

    // Create property record
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        user_id: userId,
        address: propertyData.address,
        suburb: propertyData.suburb,
        state: propertyData.state,
        postcode: propertyData.postcode,
        price: propertyData.price,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        parking: propertyData.parking,
        land_size: propertyData.landSize,
        features: propertyData.features,
        description: propertyData.description,
        source_url: propertyData.sourceUrl,
        source_website: propertyData.sourceWebsite,
        listing_id: propertyData.listingId,
        image_urls: uploadedImageUrls,
      })
      .select()
      .single();

    if (propertyError) {
      console.error("Error creating property:", propertyError);
    }

    // Update scraping job
    if (scrapingJob) {
      await supabase
        .from("scraping_jobs")
        .update({
          status: "completed",
          images_found: propertyData.imageUrls.length,
          images_scraped: uploadedImageUrls,
          property_data: propertyData,
          completed_at: new Date().toISOString(),
        })
        .eq("id", scrapingJob.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        property: {
          ...propertyData,
          imageUrls: uploadedImageUrls,
          propertyId: property?.id,
        },
        imagesScraped: uploadedImageUrls.length,
        totalImagesFound: propertyData.imageUrls.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Scraping error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
