"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Photo, Album, OrganizationProposal, DuplicateGroup, ActivityLogItem, UserProfile } from "@/types";
import { SAMPLE_PHOTOS, SAMPLE_ALBUMS } from "@/lib/data/sample-photos";
import { createClient } from "@/lib/supabase/client";

interface PhotoStoreContextType {
  photos: Photo[];
  albums: Album[];
  activityLogs: ActivityLogItem[];
  user: UserProfile;
  isLoading: boolean;
  
  // Selection
  selectedPhotoIds: Set<string>;
  toggleSelectPhoto: (id: string) => void;
  selectAllPhotos: () => void;
  clearSelection: () => void;
  
  // Modals & Active Views
  currentPhoto: Photo | null;
  setCurrentPhoto: (photo: Photo | null) => void;
  isDetailOpen: boolean;
  setIsDetailOpen: (open: boolean) => void;
  isLightboxOpen: boolean;
  setIsLightboxOpen: (open: boolean) => void;
  isUploadOpen: boolean;
  setIsUploadOpen: (open: boolean) => void;
  isAIOrganizeOpen: boolean;
  setIsAIOrganizeOpen: (open: boolean) => void;
  
  // Photo Operations
  addPhotos: (newPhotos: Photo[]) => void;
  updatePhoto: (id: string, updates: Partial<Photo>) => void;
  deletePhotos: (ids: string[]) => void;
  toggleFavorite: (id: string) => void;
  addTag: (photoId: string, tag: string) => void;
  removeTag: (photoId: string, tag: string) => void;
  
  // Album Operations
  createAlbum: (name: string, description?: string, category?: string, photoIds?: string[]) => Album;
  updateAlbum: (id: string, updates: Partial<Album>) => void;
  deleteAlbum: (id: string) => void;
  addPhotosToAlbum: (albumId: string, photoIds: string[]) => void;
  removePhotosFromAlbum: (albumId: string, photoIds: string[]) => void;
  
  // AI Organization
  applyOrganizationProposal: (proposal: OrganizationProposal) => void;
  resolveDuplicates: (groupId: string, keeperId: string, removeOtherDuplicates: boolean) => void;
  
  // Utilities
  resetToSampleData: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
}

const PhotoStoreContext = createContext<PhotoStoreContextType | null>(null);

const STORAGE_KEY_PHOTOS = "pixora_photos_v1";
const STORAGE_KEY_ALBUMS = "pixora_albums_v1";
const STORAGE_KEY_LOGS = "pixora_logs_v1";

export function PhotoStoreProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const [user, setUser] = useState<UserProfile>({
    id: "demo-user-1",
    email: "creator@pixora.ai",
    display_name: "Creative Explorer",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    is_demo: true,
    storage_used_bytes: 32400000,
    storage_limit_bytes: 10737418240, // 10 GB
  });

  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAIOrganizeOpen, setIsAIOrganizeOpen] = useState(false);

  // Initialize data from Supabase or LocalStorage
  useEffect(() => {
    async function initStore() {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsDemoMode(false);
        setUser((prev) => ({
          ...prev,
          id: session.user.id,
          email: session.user.email || "user@pixora.ai",
          display_name: session.user.user_metadata?.display_name || "Pixora Curator",
          is_demo: false,
        }));

        // Fetch from Supabase tables
        try {
          const { data: dbPhotos } = await supabase.from("photos").select("*").order("uploaded_at", { ascending: false });
          const { data: dbAlbums } = await supabase.from("albums").select("*").order("created_at", { ascending: false });
          const { data: dbFavorites } = await supabase.from("favorites").select("photo_id");
          const { data: dbTags } = await supabase.from("photo_tags").select("*");
          const { data: dbAlbumPhotos } = await supabase.from("album_photos").select("*");

          if (dbPhotos && dbPhotos.length > 0) {
            const favSet = new Set((dbFavorites || []).map((f) => f.photo_id));
            const tagMap = new Map<string, string[]>();
            (dbTags || []).forEach((t) => {
              const current = tagMap.get(t.photo_id) || [];
              current.push(t.tag);
              tagMap.set(t.photo_id, current);
            });

            const albumMap = new Map<string, string[]>();
            (dbAlbumPhotos || []).forEach((ap) => {
              const current = albumMap.get(ap.photo_id) || [];
              current.push(ap.album_id);
              albumMap.set(ap.photo_id, current);
            });

            const hydratedPhotos: Photo[] = dbPhotos.map((p) => ({
              ...p,
              tags: tagMap.get(p.id) || [],
              is_favorite: favSet.has(p.id),
              album_ids: albumMap.get(p.id) || [],
            }));

            setPhotos(hydratedPhotos);
            setAlbums(dbAlbums || []);
            setIsLoading(false);
            return;
          }
        } catch (dbErr) {
          console.warn("Notice: Initializing demo library as Supabase tables were empty:", dbErr);
        }
      }

      // Check localStorage for demo/cached data
      try {
        const localPhotos = localStorage.getItem(STORAGE_KEY_PHOTOS);
        const localAlbums = localStorage.getItem(STORAGE_KEY_ALBUMS);
        const localLogs = localStorage.getItem(STORAGE_KEY_LOGS);

        if (localPhotos) {
          setPhotos(JSON.parse(localPhotos));
        } else {
          setPhotos(SAMPLE_PHOTOS);
          localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(SAMPLE_PHOTOS));
        }

        if (localAlbums) {
          setAlbums(JSON.parse(localAlbums));
        } else {
          setAlbums(SAMPLE_ALBUMS);
          localStorage.setItem(STORAGE_KEY_ALBUMS, JSON.stringify(SAMPLE_ALBUMS));
        }

        if (localLogs) {
          setActivityLogs(JSON.parse(localLogs));
        } else {
          const initialLog: ActivityLogItem = {
            id: "log-init",
            action_type: "organize",
            entity_type: "job",
            details: { message: "Pixora AI library initialized with curated sample assets" },
            created_at: new Date().toISOString(),
          };
          setActivityLogs([initialLog]);
        }
      } catch (e) {
        setPhotos(SAMPLE_PHOTOS);
        setAlbums(SAMPLE_ALBUMS);
      }

      setIsLoading(false);
    }

    initStore();
  }, []);

  // Sync to localStorage on update
  useEffect(() => {
    if (!isLoading && photos.length > 0) {
      localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
      const totalBytes = photos.reduce((acc, p) => acc + (p.file_size || 0), 0);
      setUser((prev) => ({ ...prev, storage_used_bytes: totalBytes }));
    }
  }, [photos, isLoading]);

  useEffect(() => {
    if (!isLoading && albums.length > 0) {
      localStorage.setItem(STORAGE_KEY_ALBUMS, JSON.stringify(albums));
    }
  }, [albums, isLoading]);

  useEffect(() => {
    if (!isLoading && activityLogs.length > 0) {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(activityLogs));
    }
  }, [activityLogs, isLoading]);

  // Log activity helper
  const logActivity = (
    action_type: ActivityLogItem["action_type"],
    entity_type: ActivityLogItem["entity_type"],
    details: Record<string, any>,
    entity_id?: string
  ) => {
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action_type,
      entity_type,
      entity_id,
      details,
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Selection handlers
  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPhotos = () => {
    setSelectedPhotoIds(new Set(photos.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedPhotoIds(new Set());
  };

  // Photo handlers
  const addPhotos = (newPhotos: Photo[]) => {
    setPhotos((prev) => [...newPhotos, ...prev]);
    logActivity("upload", "photo", { count: newPhotos.length, names: newPhotos.map((p) => p.original_filename) });
  };

  const updatePhoto = (id: string, updates: Partial<Photo>) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, ...updates } : photo))
    );
    if (currentPhoto && currentPhoto.id === id) {
      setCurrentPhoto((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deletePhotos = (ids: string[]) => {
    const idSet = new Set(ids);
    setPhotos((prev) => prev.filter((p) => !idSet.has(p.id)));
    // Also remove photo from albums
    setAlbums((prev) =>
      prev.map((album) => {
        const remainingCount = photos.filter(
          (p) => !idSet.has(p.id) && p.album_ids?.includes(album.id)
        ).length;
        return { ...album, photo_count: remainingCount };
      })
    );
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    if (currentPhoto && idSet.has(currentPhoto.id)) {
      setCurrentPhoto(null);
      setIsDetailOpen(false);
      setIsLightboxOpen(false);
    }
    logActivity("delete", "photo", { count: ids.length, ids });
  };

  const toggleFavorite = (id: string) => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id === id) {
          const nextState = !photo.is_favorite;
          logActivity("favorite", "photo", { id, is_favorite: nextState }, id);
          return { ...photo, is_favorite: nextState };
        }
        return photo;
      })
    );
    if (currentPhoto && currentPhoto.id === id) {
      setCurrentPhoto((prev) =>
        prev ? { ...prev, is_favorite: !prev.is_favorite } : null
      );
    }
  };

  const addTag = (photoId: string, tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (!cleanTag) return;
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id === photoId) {
          const currentTags = photo.tags || [];
          if (!currentTags.includes(cleanTag)) {
            return { ...photo, tags: [...currentTags, cleanTag] };
          }
        }
        return photo;
      })
    );
    if (currentPhoto && currentPhoto.id === photoId) {
      setCurrentPhoto((prev) =>
        prev
          ? {
              ...prev,
              tags: prev.tags?.includes(cleanTag)
                ? prev.tags
                : [...(prev.tags || []), cleanTag],
            }
          : null
      );
    }
  };

  const removeTag = (photoId: string, tag: string) => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id === photoId) {
          return { ...photo, tags: (photo.tags || []).filter((t) => t !== tag) };
        }
        return photo;
      })
    );
    if (currentPhoto && currentPhoto.id === photoId) {
      setCurrentPhoto((prev) =>
        prev
          ? { ...prev, tags: (prev.tags || []).filter((t) => t !== tag) }
          : null
      );
    }
  };

  // Album operations
  const createAlbum = (
    name: string,
    description?: string,
    category?: string,
    photoIds: string[] = []
  ): Album => {
    const coverPhoto = photos.find((p) => photoIds.includes(p.id));
    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      name,
      description: description || null,
      cover_photo_id: coverPhoto?.id || null,
      cover_photo_url: coverPhoto?.storage_path || null,
      photo_count: photoIds.length,
      category: category || "Custom",
      is_smart: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setAlbums((prev) => [newAlbum, ...prev]);

    if (photoIds.length > 0) {
      setPhotos((prev) =>
        prev.map((photo) => {
          if (photoIds.includes(photo.id)) {
            const currentAlbums = photo.album_ids || [];
            if (!currentAlbums.includes(newAlbum.id)) {
              return { ...photo, album_ids: [...currentAlbums, newAlbum.id] };
            }
          }
          return photo;
        })
      );
    }

    logActivity("album_add", "album", { name, photoCount: photoIds.length }, newAlbum.id);
    return newAlbum;
  };

  const updateAlbum = (id: string, updates: Partial<Album>) => {
    setAlbums((prev) =>
      prev.map((album) =>
        album.id === id ? { ...album, ...updates, updated_at: new Date().toISOString() } : album
      )
    );
  };

  const deleteAlbum = (id: string) => {
    // IMPORTANT: Deleting an album must NOT delete its underlying photos!
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        album_ids: (p.album_ids || []).filter((aid) => aid !== id),
      }))
    );
    logActivity("delete", "album", { id }, id);
  };

  const addPhotosToAlbum = (albumId: string, photoIds: string[]) => {
    const idSet = new Set(photoIds);
    setPhotos((prev) =>
      prev.map((photo) => {
        if (idSet.has(photo.id)) {
          const current = photo.album_ids || [];
          if (!current.includes(albumId)) {
            return { ...photo, album_ids: [...current, albumId] };
          }
        }
        return photo;
      })
    );
    setAlbums((prev) =>
      prev.map((album) => {
        if (album.id === albumId) {
          const count = photos.filter(
            (p) => p.album_ids?.includes(albumId) || idSet.has(p.id)
          ).length;
          return { ...album, photo_count: count };
        }
        return album;
      })
    );
    logActivity("album_add", "album", { albumId, count: photoIds.length }, albumId);
  };

  const removePhotosFromAlbum = (albumId: string, photoIds: string[]) => {
    const idSet = new Set(photoIds);
    setPhotos((prev) =>
      prev.map((photo) => {
        if (idSet.has(photo.id)) {
          return {
            ...photo,
            album_ids: (photo.album_ids || []).filter((aid) => aid !== albumId),
          };
        }
        return photo;
      })
    );
    setAlbums((prev) =>
      prev.map((album) => {
        if (album.id === albumId) {
          const count = photos.filter(
            (p) => p.album_ids?.includes(albumId) && !idSet.has(p.id)
          ).length;
          return { ...album, photo_count: count };
        }
        return album;
      })
    );
  };

  // AI Organization Proposal Application (Reversible & User-Approved)
  const applyOrganizationProposal = (proposal: OrganizationProposal) => {
    // 1. Create or update suggested albums
    const newAlbumsToAdd: Album[] = [];
    const photoAlbumAdditions = new Map<string, string[]>();

    proposal.proposedAlbums.forEach((propAlbum) => {
      // Find existing album with same name or create new
      const existing = albums.find(
        (a) => a.name.toLowerCase() === propAlbum.name.toLowerCase()
      );
      const albumId = existing ? existing.id : `album-ai-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

      if (!existing) {
        const cover = photos.find((p) => p.id === propAlbum.coverPhotoId) || photos.find((p) => propAlbum.photoIds.includes(p.id));
        newAlbumsToAdd.push({
          id: albumId,
          name: propAlbum.name,
          description: propAlbum.description,
          category: propAlbum.category,
          cover_photo_id: cover?.id || null,
          cover_photo_url: cover?.storage_path || null,
          photo_count: propAlbum.photoIds.length,
          is_smart: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      propAlbum.photoIds.forEach((pid) => {
        const current = photoAlbumAdditions.get(pid) || [];
        current.push(albumId);
        photoAlbumAdditions.set(pid, current);
      });
    });

    // 2. Map tags and captions to photos
    const tagMap = new Map<string, { tags: string[]; category: string; caption: string }>();
    proposal.proposedTags.forEach((pt) => {
      tagMap.set(pt.photoId, pt);
    });

    setPhotos((prev) =>
      prev.map((photo) => {
        const tagInfo = tagMap.get(photo.id);
        const albumAdditions = photoAlbumAdditions.get(photo.id) || [];
        const mergedAlbums = Array.from(new Set([...(photo.album_ids || []), ...albumAdditions]));

        if (tagInfo) {
          const mergedTags = Array.from(new Set([...(photo.tags || []), ...tagInfo.tags]));
          return {
            ...photo,
            ai_category: tagInfo.category,
            ai_caption: tagInfo.caption,
            tags: mergedTags,
            album_ids: mergedAlbums,
            processing_status: "analyzed",
          };
        }
        return {
          ...photo,
          album_ids: mergedAlbums,
        };
      })
    );

    if (newAlbumsToAdd.length > 0) {
      setAlbums((prev) => [...newAlbumsToAdd, ...prev]);
    }

    logActivity("organize", "job", {
      categorized: proposal.proposedTags.length,
      albumsCreated: newAlbumsToAdd.length,
      duplicatesFound: proposal.detectedDuplicates.length,
    });
  };

  // Duplicate Resolution
  const resolveDuplicates = (groupId: string, keeperId: string, removeOtherDuplicates: boolean) => {
    if (removeOtherDuplicates) {
      // Find the group photos and remove all except keeper
      setPhotos((prev) => {
        const keeper = prev.find((p) => p.id === keeperId);
        if (!keeper) return prev;
        
        // Remove photos with identical content hash or name duplicate that are NOT the keeper
        return prev.filter((p) => {
          if (p.id === keeperId) return true;
          if (keeper.content_hash && p.content_hash === keeper.content_hash) {
            return false;
          }
          if (groupId.includes(p.id) && p.id !== keeperId) {
            return false;
          }
          return true;
        });
      });
    }
    logActivity("duplicate_resolved", "photo", { groupId, keeperId, removedOther: removeOtherDuplicates });
  };

  const resetToSampleData = () => {
    setPhotos(SAMPLE_PHOTOS);
    setAlbums(SAMPLE_ALBUMS);
    localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(SAMPLE_PHOTOS));
    localStorage.setItem(STORAGE_KEY_ALBUMS, JSON.stringify(SAMPLE_ALBUMS));
    clearSelection();
    logActivity("organize", "job", { action: "reset_to_curated_sample_library" });
  };

  return (
    <PhotoStoreContext.Provider
      value={{
        photos,
        albums,
        activityLogs,
        user,
        isLoading,
        selectedPhotoIds,
        toggleSelectPhoto,
        selectAllPhotos,
        clearSelection,
        currentPhoto,
        setCurrentPhoto,
        isDetailOpen,
        setIsDetailOpen,
        isLightboxOpen,
        setIsLightboxOpen,
        isUploadOpen,
        setIsUploadOpen,
        isAIOrganizeOpen,
        setIsAIOrganizeOpen,
        addPhotos,
        updatePhoto,
        deletePhotos,
        toggleFavorite,
        addTag,
        removeTag,
        createAlbum,
        updateAlbum,
        deleteAlbum,
        addPhotosToAlbum,
        removePhotosFromAlbum,
        applyOrganizationProposal,
        resolveDuplicates,
        resetToSampleData,
        setUser,
        isDemoMode,
        setIsDemoMode,
      }}
    >
      {children}
    </PhotoStoreContext.Provider>
  );
}

export function usePhotoStore() {
  const context = useContext(PhotoStoreContext);
  if (!context) {
    throw new Error("usePhotoStore must be used within a PhotoStoreProvider");
  }
  return context;
}

