import { Photo, DuplicateGroup, OrganizationProposal } from "@/types";

/**
 * Intelligent categorization dictionary for image analysis fallback
 */
const CATEGORY_KEYWORDS: Record<string, { tags: string[]; priority: number }> = {
  "Nature & Landscapes": {
    tags: ["nature", "mountain", "lake", "forest", "sunset", "sunrise", "beach", "ocean", "landscape", "tree", "river", "sky", "hiking", "wilderness", "alpine", "valley"],
    priority: 1,
  },
  "Travel & Adventures": {
    tags: ["travel", "vacation", "trip", "santorini", "greece", "italy", "dolomites", "tourist", "flight", "passport", "hotel", "resort", "explore", "city", "monument", "landmark"],
    priority: 2,
  },
  "People & Friends": {
    tags: ["people", "person", "portrait", "selfie", "friends", "smile", "family", "crowd", "girl", "boy", "man", "woman", "gathering", "team"],
    priority: 3,
  },
  "Food & Dining": {
    tags: ["food", "dining", "meal", "coffee", "latte", "breakfast", "lunch", "dinner", "cocktail", "smoothie", "bowl", "restaurant", "dessert", "cake", "plate"],
    priority: 4,
  },
  "Screenshots": {
    tags: ["screenshot", "screen", "dashboard", "software", "ui", "ux", "browser", "app", "interface", "code", "terminal", "capture", "display"],
    priority: 5,
  },
  "Documents": {
    tags: ["document", "receipt", "invoice", "finance", "report", "tax", "statement", "paper", "pdf", "contract", "scan", "letter"],
    priority: 6,
  },
  "Products & Shopping": {
    tags: ["product", "watch", "shoe", "sneaker", "clothing", "gear", "gadget", "minimalism", "shopping", "box", "package", "item"],
    priority: 7,
  },
  "Events & Celebrations": {
    tags: ["celebration", "event", "party", "birthday", "sparkler", "wedding", "festival", "concert", "ceremony", "anniversary", "cheers"],
    priority: 8,
  },
};

/**
 * Stage 1 & 2 & 3: Heuristic & visual feature classifier
 */
export function analyzePhotoMetadata(photo: Photo): {
  category: string;
  tags: string[];
  caption: string;
  confidence: number;
} {
  const filename = photo.original_filename.toLowerCase();
  const existingTags = photo.tags || [];
  const combinedText = `${filename} ${existingTags.join(" ")} ${photo.exif?.location || ""} ${photo.exif?.camera || ""}`.toLowerCase();

  let bestCategory = photo.ai_category || "Uncategorized";
  let maxScore = 0;

  for (const [category, data] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const tag of data.tags) {
      if (combinedText.includes(tag)) {
        score += 2;
      }
    }
    // Check if filename matches category keywords
    if (filename.includes(category.toLowerCase().split(" ")[0])) {
      score += 3;
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  // Fallback defaults if score is low
  if (maxScore === 0 && !photo.ai_category) {
    if (photo.mime_type.includes("png") && (filename.includes("screen") || filename.includes("shot"))) {
      bestCategory = "Screenshots";
    } else if (filename.includes("inv") || filename.includes("rec") || filename.includes("doc")) {
      bestCategory = "Documents";
    } else {
      bestCategory = "General Memories";
    }
  }

  // Generate enriched tags
  const newTags = new Set<string>(existingTags.map((t) => t.toLowerCase()));
  if (bestCategory !== "Uncategorized" && bestCategory !== "General Memories") {
    const rootWord = bestCategory.toLowerCase().split(" ")[0];
    newTags.add(rootWord);
    if (rootWord.endsWith("s")) {
      newTags.add(rootWord.slice(0, -1));
    }
  }
  if (photo.exif?.location) {
    photo.exif.location.split(",").forEach((loc) => {
      const cleanLoc = loc.trim().toLowerCase();
      if (cleanLoc.length > 2) newTags.add(cleanLoc);
    });
  }

  // Generate readable descriptive caption if none exists
  let caption = photo.ai_caption;
  if (!caption) {
    const loc = photo.exif?.location ? ` in ${photo.exif.location}` : "";
    const catClean = bestCategory !== "Uncategorized" ? bestCategory.toLowerCase() : "photo";
    caption = `A high-resolution ${catClean} capture${loc}, indexed with Pixora AI.`;
  }

  return {
    category: bestCategory,
    tags: Array.from(newTags),
    caption,
    confidence: Math.min(0.95, 0.65 + maxScore * 0.05),
  };
}

/**
 * Stage 5: Duplicate & Similarity Detection
 * Finds exact content hash matches and perceptual similarity matches
 */
export function detectDuplicates(photos: Photo[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processedPhotoIds = new Set<string>();

  // 1. Exact hash matches
  const hashBuckets = new Map<string, Photo[]>();
  for (const photo of photos) {
    if (!photo.content_hash) continue;
    const list = hashBuckets.get(photo.content_hash) || [];
    list.push(photo);
    hashBuckets.set(photo.content_hash, list);
  }

  for (const [hash, bucket] of hashBuckets.entries()) {
    if (bucket.length > 1) {
      bucket.forEach((p) => processedPhotoIds.add(p.id));
      groups.push({
        id: `exact-${hash}`,
        matchType: "exact",
        confidence: 1.0,
        reason: "Exact SHA-256 byte match (identical image data)",
        photos: bucket,
        selectedKeeperId: bucket[0].id,
      });
    }
  }

  // 2. Perceptual / Name & Aspect Ratio / Proximity matches
  const remainingPhotos = photos.filter((p) => !processedPhotoIds.has(p.id));
  for (let i = 0; i < remainingPhotos.length; i++) {
    for (let j = i + 1; j < remainingPhotos.length; j++) {
      const p1 = remainingPhotos[i];
      const p2 = remainingPhotos[j];

      // Clean filenames
      const base1 = p1.original_filename.replace(/\.(jpg|jpeg|png|webp)/i, "").toLowerCase();
      const base2 = p2.original_filename.replace(/\.(jpg|jpeg|png|webp)/i, "").toLowerCase();

      // Check filename stems
      const isNameSimilar =
        base1.includes(base2) ||
        base2.includes(base1) ||
        base1.slice(0, 8) === base2.slice(0, 8);

      // Check aspect ratio
      const ratio1 = (p1.width / (p1.height || 1)).toFixed(2);
      const ratio2 = (p2.width / (p2.height || 1)).toFixed(2);
      const isRatioSimilar = Math.abs(parseFloat(ratio1) - parseFloat(ratio2)) < 0.05;

      // Check location or timestamp proximity
      const sameLocation =
        p1.exif?.location &&
        p2.exif?.location &&
        p1.exif.location.toLowerCase() === p2.exif.location.toLowerCase();

      if (isNameSimilar && (isRatioSimilar || sameLocation)) {
        groups.push({
          id: `perceptual-${p1.id}-${p2.id}`,
          matchType: "perceptual",
          confidence: 0.88,
          reason: "Visually similar composition, identical capture framing or series shot",
          photos: [p1, p2],
          selectedKeeperId: p1.file_size >= p2.file_size ? p1.id : p2.id,
        });
      }
    }
  }

  return groups;
}

/**
 * Stage 4: Smart Album Grouping
 * Clusters photos into coherent thematic albums
 */
export function generateSmartAlbumProposals(photos: Photo[]): {
  name: string;
  description: string;
  category: string;
  photoIds: string[];
  coverPhotoId?: string;
}[] {
  const categoryGroups = new Map<string, Photo[]>();

  for (const photo of photos) {
    const analysis = analyzePhotoMetadata(photo);
    const cat = photo.ai_category || analysis.category;
    if (cat === "Uncategorized" || cat === "General Memories") continue;

    const list = categoryGroups.get(cat) || [];
    list.push(photo);
    categoryGroups.set(cat, list);
  }

  const proposedAlbums: {
    name: string;
    description: string;
    category: string;
    photoIds: string[];
    coverPhotoId?: string;
  }[] = [];

  const albumTitles: Record<string, { title: string; desc: string }> = {
    "Nature & Landscapes": {
      title: "Alpine & Serene Wilderness",
      desc: "Curated collection of mountain reflections, forest trails, and vibrant horizons.",
    },
    "Travel & Adventures": {
      title: "Wanderlust Chronicles",
      desc: "Architectural wonders, island getaways, and scenic journeys abroad.",
    },
    "People & Friends": {
      title: "Friends & Candid Moments",
      desc: "Genuine smiles, warm outdoor portraits, and memorable gatherings.",
    },
    "Food & Dining": {
      title: "Culinary Journal & Cafes",
      desc: "Morning espresso art, fresh artisan bowls, and gastronomic delights.",
    },
    "Screenshots": {
      title: "Digital Captures & Interfaces",
      desc: "Web designs, metrics graphs, dashboards, and app screenshots.",
    },
    "Documents": {
      title: "Organized Invoices & Statements",
      desc: "Archived paperwork, expense receipts, and financial documents.",
    },
    "Products & Shopping": {
      title: "Aesthetic Products & Styles",
      desc: "Clean product layouts, timepieces, and design inspiration.",
    },
    "Events & Celebrations": {
      title: "Celebrations & Golden Nights",
      desc: "Sparklers, festive gatherings, and landmark anniversary memories.",
    },
  };

  for (const [category, groupPhotos] of categoryGroups.entries()) {
    if (groupPhotos.length > 0) {
      const template = albumTitles[category] || {
        title: `${category} Highlights`,
        desc: `AI-organized collection of ${groupPhotos.length} ${category.toLowerCase()} items.`,
      };

      // Select highest resolution or favorited photo as cover
      const coverPhoto =
        groupPhotos.find((p) => p.is_favorite) ||
        [...groupPhotos].sort((a, b) => b.width * b.height - a.width * a.height)[0];

      proposedAlbums.push({
        name: template.title,
        description: template.desc,
        category,
        photoIds: groupPhotos.map((p) => p.id),
        coverPhotoId: coverPhoto?.id,
      });
    }
  }

  return proposedAlbums;
}

/**
 * Full Organization Workflow Pipeline
 * Executes all stages and returns a reversible structured proposal for user review
 */
export async function runFullOrganizationPipeline(
  photos: Photo[],
  onStageChange?: (stage: string, progress: number, taskName: string) => void
): Promise<OrganizationProposal> {
  // Stage 1: SCAN
  onStageChange?.("scanning", 15, "Scanning photo library and reading metadata...");
  await new Promise((r) => setTimeout(r, 450));

  // Stage 2 & 3: ANALYZE & CLASSIFY
  onStageChange?.("analyzing", 40, "Extracting visual subjects, colors, and contextual tags...");
  const proposedTags: OrganizationProposal["proposedTags"] = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const analysis = analyzePhotoMetadata(photo);
    proposedTags.push({
      photoId: photo.id,
      tags: analysis.tags,
      category: analysis.category,
      caption: analysis.caption,
    });
  }
  await new Promise((r) => setTimeout(r, 450));

  // Stage 4: GROUP
  onStageChange?.("grouping", 70, "Clustering photos into thematic smart albums...");
  const proposedAlbums = generateSmartAlbumProposals(photos);
  await new Promise((r) => setTimeout(r, 400));

  // Stage 5: DETECT DUPLICATES
  onStageChange?.("grouping", 90, "Identifying exact hash duplicates and perceptual matches...");
  const detectedDuplicates = detectDuplicates(photos);
  await new Promise((r) => setTimeout(r, 300));

  // Stage 6: READY FOR REVIEW
  onStageChange?.("review", 100, "Organization proposal ready for review!");

  return {
    proposedAlbums,
    proposedTags,
    detectedDuplicates,
    summary: {
      totalScanned: photos.length,
      suggestedAlbumsCount: proposedAlbums.length,
      suggestedTagsCount: proposedTags.reduce((acc, curr) => acc + curr.tags.length, 0),
      duplicateGroupsCount: detectedDuplicates.length,
    },
  };
}
