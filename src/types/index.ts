export interface Photo {
  id: string;
  owner_id?: string | null;
  storage_path: string;
  thumbnail_path?: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  captured_at?: string | null;
  uploaded_at: string;
  content_hash: string;
  ai_caption?: string | null;
  ai_category?: string | null;
  processing_status: "pending" | "analyzed" | "failed";
  tags?: string[];
  is_favorite?: boolean;
  album_ids?: string[];
  exif?: {
    camera?: string;
    lens?: string;
    iso?: number;
    focalLength?: string;
    aperture?: string;
    location?: string;
  };
}

export interface Album {
  id: string;
  owner_id?: string | null;
  name: string;
  description?: string | null;
  cover_photo_id?: string | null;
  cover_photo_url?: string | null;
  photo_count?: number;
  category?: string | null;
  is_smart?: boolean;
  smart_rule?: {
    category?: string;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface DuplicateGroup {
  id: string;
  matchType: "exact" | "perceptual";
  confidence: number;
  reason: string;
  photos: Photo[];
  selectedKeeperId?: string;
}

export interface OrganizationProposal {
  proposedAlbums: {
    name: string;
    description: string;
    category: string;
    photoIds: string[];
    coverPhotoId?: string;
  }[];
  proposedTags: {
    photoId: string;
    tags: string[];
    category: string;
    caption: string;
  }[];
  detectedDuplicates: DuplicateGroup[];
  summary: {
    totalScanned: number;
    suggestedAlbumsCount: number;
    suggestedTagsCount: number;
    duplicateGroupsCount: number;
  };
}

export interface OrganizationJob {
  id: string;
  owner_id?: string | null;
  status: "idle" | "scanning" | "analyzing" | "grouping" | "review" | "completed" | "failed";
  total_items: number;
  processed_items: number;
  failed_items: number;
  currentTask?: string;
  progress: number;
  proposal?: OrganizationProposal | null;
  started_at?: string;
  completed_at?: string;
  summary?: {
    categorizedCount: number;
    albumsCreated: number;
    duplicatesResolved: number;
    durationSeconds: number;
  };
}

export interface ActivityLogItem {
  id: string;
  action_type: "upload" | "organize" | "album_add" | "favorite" | "delete" | "duplicate_resolved";
  entity_type: "photo" | "album" | "job";
  entity_id?: string;
  details: Record<string, any>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  is_demo: boolean;
  storage_used_bytes: number;
  storage_limit_bytes: number;
}

