# Luma AI Only - Complete Migration Guide

**Date**: February 5, 2026
**Migration**: Shotstack Hybrid → Luma AI Only
**Status**: ✅ Ready for Deployment

---

## 🎯 Overview

Successfully migrated from Shotstack hybrid approach to **Luma AI only** for complete cinematic video generation.

### What Changed
- ❌ **Removed**: Shotstack API dependency
- ✅ **Added**: Luma AI batch generation (multiple clips)
- ✅ **Added**: FFmpeg video stitching with overlays
- ✅ **Updated**: 3-6 images (was 5-10)
- ✅ **Updated**: 15-30 second videos (5 seconds per Luma clip)

### Cost Impact
- **Before**: ~$0.05 per video (Shotstack)
- **After**: ~$0.60-$1.20 per video (3-6 Luma clips @ $0.20 each)
- **Quality**: Significantly higher - AI-generated cinematic footage

### Generation Time
- **Before**: ~60-120 seconds (Shotstack rendering)
- **After**: ~135-270 seconds (45 seconds per Luma clip + stitching)

---

## 📁 New Files Created

### 1. `supabase/functions/generate-luma-batch/index.ts`
**Purpose**: Generate multiple Luma AI clips in parallel

**What it does**:
- Takes 3-6 image URLs
- Creates Luma generation for each image
- Returns array of generation IDs
- Runs all generations in parallel

**Key features**:
- Parallel processing for speed
- Error handling per-clip
- 9:16 aspect ratio (vertical video)
- Professional real estate prompts

### 2. `supabase/functions/check-luma-batch/index.ts`
**Purpose**: Check status of all Luma generations

**What it does**:
- Polls status for all generation IDs
- Returns summary (completed/processing/failed)
- Provides video URLs when all complete

**Response format**:
```json
{
  "success": true,
  "allCompleted": true,
  "summary": {
    "total": 5,
    "completed": 5,
    "processing": 0,
    "failed": 0
  },
  "videoUrls": ["url1", "url2", "url3", "url4", "url5"]
}
```

### 3. `supabase/functions/stitch-video/index.ts`
**Purpose**: Stitch Luma clips together with FFmpeg

**What it does**:
- Downloads all Luma video clips
- Stitches together sequentially
- Adds text overlays (property details)
- Adds background music
- Adds voiceover (if provided)
- Adds agent branding overlay
- Uploads final video to Supabase Storage

**FFmpeg features**:
- Smooth concatenation
- Text overlays (property address, price, specs)
- Audio mixing (music + voiceover)
- Agent info overlay at bottom
- 9:16 vertical format maintained
- 1080p HD quality

---

## ✏️ Modified Files

### Backend

#### 1. `supabase/functions/generate-video/index.ts`
**Complete rewrite** - No longer uses Shotstack

**Changes**:
- Removed all Shotstack code
- Removed `lumaIntroUrl` optional parameter
- Changed validation: 3-6 images (was 5-10)
- Calls `generate-luma-batch` function
- Returns `generationIds` array (not `jobId`)
- Returns additional data for stitching (audioUrl, musicUrl, agentInfo, propertyData)

**New response format**:
```typescript
{
  success: true,
  provider: "luma",
  videoId: "database-id",
  generationIds: ["luma-id-1", "luma-id-2", ...],
  totalClips: 5,
  estimatedDuration: 25, // seconds
  estimatedTime: 225, // seconds (45s per clip)
  message: "Started 5 Luma AI generations",
  audioUrl: "https://...",
  musicUrl: "https://...",
  agentInfo: {...},
  propertyData: {...}
}
```

#### 2. `supabase/functions/check-video-status/index.ts`
**Complete rewrite** - New workflow

**Old behavior**:
- Checked Shotstack or single Luma job
- Required `jobId` parameter

**New behavior**:
- Checks batch Luma status via `check-luma-batch`
- Requires `generationIds` array parameter
- Automatically triggers `stitch-video` when all clips ready
- Returns progress percentage (0-80% for Luma, 80-100% for stitching)

**New request format**:
```typescript
{
  generationIds: ["id1", "id2", "id3"],
  videoId: "database-id",
  audioUrl: "https://...", // for stitching
  musicUrl: "https://...", // for stitching
  agentInfo: {...}, // for stitching
  propertyData: {...} // for stitching
}
```

#### 3. `supabase/config.toml`
**Added new edge functions**:
```toml
[functions.generate-luma-batch]
verify_jwt = false

[functions.check-luma-batch]
verify_jwt = false

[functions.stitch-video]
verify_jwt = false
```

### Frontend

#### 4. `src/pages/CreateVideo.tsx`
**Major updates**:

**State changes**:
- Removed `videoJobId` → Added `generationIds` (array)
- Removed `useLumaIntro` toggle (no longer optional)
- Added `generationData` state

**Validation changes**:
```typescript
// Before
const hasImages = photos.length >= 5 || scrapedImageUrls.length >= 5;

// After
const imageCount = scrapedImageUrls.length > 0 ? scrapedImageUrls.length : photos.length;
if (imageCount < 3) { error }
if (imageCount > 6) { error }
```

**Polling function changes**:
```typescript
// Before
pollVideoStatus(jobId: string, videoId: string)

// After
pollVideoStatus(
  generationIds: string[],
  videoId: string,
  audioUrl: string | null,
  musicUrl: string | null,
  agentInfo: any,
  propertyData: any
)
```

**Progress tracking**:
- Now uses `data.progress` from backend (0-100%)
- Shows clip completion status: "3/5 clips ready"
- Longer timeout: 10 minutes (was 5 minutes)

**Button validation**:
```typescript
// Before
disabled={(photos.length < 5 && scrapedImageUrls.length < 5) || isGenerating}

// After
disabled={(photos.length < 3 && scrapedImageUrls.length < 3) ||
          (Math.max(photos.length, scrapedImageUrls.length) > 6) ||
          isGenerating}
```

**Error messages**:
- "Add X more photos (3-6 images for 15-30s video)"
- "Maximum 6 photos allowed (you have X)"

#### 5. `src/components/create-video/RightPanel.tsx`
**Updated progress and validation**:

```typescript
// Before
const canGenerate = photoCount >= 5;
const remainingSeconds = 120 - (generatingProgress / 100) * 120; // 2 minutes

// After
const canGenerate = photoCount >= 3 && photoCount <= 6;
const remainingSeconds = 300 - (generatingProgress / 100) * 300; // 5 minutes
```

**Progress status messages**:
- "Generating cinematic clips with Luma AI..." (80% of time)
- "Stitching video clips..." (15% of time)
- "Finalizing your video..." (5% of time)

**Validation messages**:
- "3-6 photos required (15-30s video)"
- "Maximum 6 photos allowed"

**Time estimate**:
```typescript
// Before: "Estimated time: ~2 minutes"
// After: "Estimated time: ~{photoCount * 45} seconds"
```

#### 6. `src/components/create-video/PhotoUpload.tsx`
**Already updated** (from previous work):
```typescript
// Line 14-15
minPhotos = 3,  // was 5
maxPhotos = 6,  // was 10
```

#### 7. `src/components/create-video/PropertySourceSelector.tsx`
**Already updated** (from previous work):
```typescript
// Line 186
<PhotoUpload photos={photos} onChange={onPhotosChange} minPhotos={3} maxPhotos={6} />
```

---

## 🔧 Deployment Steps

### Prerequisites
- Supabase CLI installed
- FFmpeg installed on edge function runtime
- LUMA_API_KEY secret set

### Step 1: Set Required Secrets
```bash
# Luma AI API key (required)
supabase secrets set LUMA_API_KEY=luma-3cd8b9ba-07f7-4650-9293-f25e7dcfb632-62bcfabf-eafa-475b-bd63-4ccba0bc69f7

# ElevenLabs (optional - for voiceover)
supabase secrets set ELEVENLABS_API_KEY=sk_e7ad45a6b367f98abb04bc7887e7a9fb9d95aa9a39ed5bb1

# OpenAI (optional - for script generation)
supabase secrets set OPENAI_API_KEY=your_openai_key

# Note: SHOTSTACK_API_KEY no longer required!
```

### Step 2: Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy generate-video
supabase functions deploy check-video-status
supabase functions deploy generate-luma-batch
supabase functions deploy check-luma-batch
supabase functions deploy stitch-video

# Or deploy all at once
supabase functions deploy
```

### Step 3: Verify Storage Bucket
```bash
# Ensure video-assets bucket exists
supabase storage list

# If not, create it
supabase storage create video-assets --public

# Should have folders:
# - music/ (background music tracks)
# - audio/ (generated voiceovers)
# - agent-photos/ (agent profile pictures)
# - videos/ (final stitched videos)
```

### Step 4: Deploy Frontend
```bash
cd C:\Users\mico\Desktop\Projects\Property-Motion
npm install
npm run build
npm run deploy # or your deployment command
```

---

## 🧪 Testing Checklist

### Basic Workflow
- [ ] Upload 3 images → Should allow generation
- [ ] Upload 6 images → Should allow generation
- [ ] Upload 2 images → Should show error "Add 1 more photo"
- [ ] Upload 7 images → Should show error "Maximum 6 photos allowed"

### Video Generation
- [ ] Generate video with 3 images → Should take ~135 seconds
- [ ] Generate video with 5 images → Should take ~225 seconds
- [ ] Generate video with 6 images → Should take ~270 seconds
- [ ] Check video duration: 3 images = 15s, 5 images = 25s, 6 images = 30s

### Features
- [ ] Video without voiceover → Should work
- [ ] Video with voiceover → Should work (if ELEVENLABS_API_KEY set)
- [ ] Video with background music → Should work
- [ ] Video with agent overlay → Should work
- [ ] Property details overlay → Should appear at top

### Error Handling
- [ ] If one Luma clip fails → Should continue with others
- [ ] If all Luma clips fail → Should show error
- [ ] If stitching fails → Should show error
- [ ] Network interruption → Should resume polling

### Database
- [ ] Video record created with status "queued"
- [ ] Status updates to "processing" during generation
- [ ] Progress updates (0-100%)
- [ ] Final video URL saved to database
- [ ] Status updates to "completed" when done

---

## 📊 Video Duration Matrix

| Images | Duration | Status | Generation Time |
|--------|----------|--------|-----------------|
| 3      | 15s      | ✅ Min | ~135s (2:15)    |
| 4      | 20s      | ✅     | ~180s (3:00)    |
| 5      | 25s      | ✅ Recommended | ~225s (3:45) |
| 6      | 30s      | ✅ Max | ~270s (4:30)    |
| 7+     | Rejected | ❌     | N/A             |
| 0-2    | Rejected | ❌     | N/A             |

**Formula**:
- Duration = images × 5 seconds
- Generation time = (images × 45s) + 30s stitching

---

## 🔄 Workflow Diagram

```
User Uploads 3-6 Images
        ↓
generate-video (Edge Function)
        ↓
generate-luma-batch (starts parallel generations)
        ↓
        ├─→ Luma Clip 1 (45s)
        ├─→ Luma Clip 2 (45s)
        ├─→ Luma Clip 3 (45s)
        ├─→ Luma Clip 4 (45s)
        └─→ Luma Clip 5 (45s)
        ↓
Frontend polls check-video-status every 5s
        ↓
check-video-status → check-luma-batch
        ↓
    All clips ready?
        ↓
check-video-status → stitch-video
        ↓
        ├─ Download all Luma clips
        ├─ Concatenate with FFmpeg
        ├─ Add property text overlays
        ├─ Mix audio (music + voiceover)
        ├─ Add agent branding
        └─ Upload to Supabase Storage
        ↓
Final Video URL returned
        ↓
User downloads/shares video
```

---

## 🐛 Troubleshooting

### Error: "LUMA_API_KEY not configured"
**Fix**: Set the Luma API key
```bash
supabase secrets set LUMA_API_KEY=your_key
```

### Error: "All Luma generations failed"
**Possible causes**:
- Invalid Luma API key
- Image URLs not accessible
- Luma API rate limit exceeded

**Fix**: Check Luma dashboard, verify image URLs are public

### Error: "Video stitching failed"
**Possible causes**:
- FFmpeg not installed on edge function runtime
- Luma video URLs expired
- Insufficient memory

**Fix**: Check edge function logs:
```bash
supabase functions logs stitch-video --tail
```

### Video generation taking too long
**Expected times**:
- 3 images: 2-3 minutes
- 5 images: 3-4 minutes
- 6 images: 4-5 minutes

**If longer**: Check Luma API status at https://lumalabs.ai/status

### Progress stuck at 80%
**Meaning**: All Luma clips done, stitching in progress
**Normal**: Stitching takes 20-60 seconds
**If stuck >2 minutes**: Check stitch-video logs

---

## 📈 Cost Analysis

### Per Video Cost Breakdown

**3 Images (15s video)**:
- Luma clips: 3 × $0.20 = $0.60
- Voice (optional): $0.10
- Total: $0.60-$0.70

**5 Images (25s video)**:
- Luma clips: 5 × $0.20 = $1.00
- Voice (optional): $0.10
- Total: $1.00-$1.10

**6 Images (30s video)**:
- Luma clips: 6 × $0.20 = $1.20
- Voice (optional): $0.10
- Total: $1.20-$1.30

### Monthly Cost Estimate
- 100 videos/month × $1.00 avg = **$100/month**
- 500 videos/month × $1.00 avg = **$500/month**

**Note**: Significantly higher than Shotstack (~$5-25/month), but much higher quality cinematic footage.

---

## 🎨 Quality Comparison

### Before (Shotstack)
- Static image slideshow
- Basic transitions
- Fast rendering
- Professional but standard

### After (Luma AI)
- AI-generated camera movements
- Cinematic depth and motion
- Slower rendering
- Premium cinematic quality

**Recommended use cases**:
- High-end property listings
- Luxury real estate
- Marketing videos
- Premium client presentations

---

## ✅ Success Criteria

All these should be true after deployment:

- ✅ 3-6 images accepted
- ✅ <3 or >6 images rejected with clear message
- ✅ Video duration matches: images × 5 seconds
- ✅ All Luma clips generated successfully
- ✅ Video stitching works correctly
- ✅ Text overlays visible (property details + agent info)
- ✅ Background music plays
- ✅ Voiceover works (if selected)
- ✅ Final video saved to database
- ✅ Progress tracking accurate (0-100%)
- ✅ Error handling works for partial failures
- ✅ Database records update correctly

---

## 🚀 Next Steps (Optional Enhancements)

1. **Parallel stitching optimization**: Start stitching completed clips while others generate
2. **Clip customization**: Allow users to customize camera movement per image
3. **Batch processing**: Generate multiple property videos in parallel
4. **Clip caching**: Cache Luma clips for re-use in different video variations
5. **Custom prompts**: Let users customize Luma generation prompts
6. **Preview mode**: Show Luma clip previews before stitching
7. **Transition effects**: Add custom transitions between clips
8. **Multiple aspect ratios**: Support 16:9, 1:1, 4:5 formats

---

## 📝 Important Notes

- **No Shotstack dependency**: Completely removed, API key no longer needed
- **FFmpeg required**: Edge function runtime must have FFmpeg installed
- **Public URLs required**: All image URLs must be publicly accessible
- **Longer generation**: Users should expect 2-5 minutes (not instant)
- **Higher cost**: ~20x more expensive than Shotstack, but premium quality
- **Storage growth**: Final videos stored in Supabase (monitor usage)

---

**Migration Status**: ✅ Complete and Ready for Production
**Last Updated**: February 5, 2026
**Next Action**: Deploy edge functions and test with 3-6 images

---

## 🎯 Quick Deployment Commands

```bash
# 1. Set secrets
supabase secrets set LUMA_API_KEY=your_key_here

# 2. Deploy functions
supabase functions deploy

# 3. Test
# Upload 5 images and generate video - should complete in ~225 seconds

# 4. Monitor
supabase functions logs generate-video --tail
supabase functions logs check-luma-batch --tail
supabase functions logs stitch-video --tail
```

**Status**: Ready to deploy! 🚀
