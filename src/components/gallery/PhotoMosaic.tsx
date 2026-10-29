"use client";

import React, { useState, useMemo } from "react";
import { Photo } from "@/types";
import { PhotoCard } from "@/components/gallery/PhotoCard";
import {
  LayoutGrid,
  Grid3X3,
  Columns,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Sparkles,
  FolderPlus,
  Heart,
  Trash2,
  X,
} from "lucide-react";
import { usePhotoStore } from "@/lib/store/photo-store";
import { cn } from "@/lib/utils";

interface PhotoMosaicProps {
  photos: Photo[];
  title?: string;
  subtitle?: string;
  allowDensityToggle?: boolean;
}

export function PhotoMosaic({
  photos,
  title,
  subtitle,
  allowDensityToggle = true,
}: PhotoMosaicProps) {
  const {
    selectedPhotoIds,
    selectAllPhotos,
    clearSelection,
    deletePhotos,
    toggleFavorite,
    setIsAIOrganizeOpen,
    albums,
    addPhotosToAlbum,
  } = usePhotoStore();

  const [density, setDensity] = useState<"masonry" | "grid" | "compact">("masonry");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "size" | "name">("newest");
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.ai_category) set.add(p.ai_category);
    });
    return ["All", ...Array.from(set)];
  }, [photos]);

  // Filter and sort
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.ai_category === selectedCategory);
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
      }
      if (sortBy === "size") {
        return b.file_size - a.file_size;
      }
      if (sortBy === "name") {
        return a.original_filename.localeCompare(b.original_filename);
      }
      return 0;
    });

    return result;
  }, [photos, selectedCategory, sortBy]);

  const handleBatchAddToAlbum = (albumId: string) => {
    addPhotosToAlbum(albumId, Array.from(selectedPhotoIds));
    setShowAlbumPicker(false);
    clearSelection();
  };

  const handleBatchFavorite = () => {
    selectedPhotoIds.forEach((id) => toggleFavorite(id));
    clearSelection();
  };

  const handleBatchDelete = () => {
    if (confirm(`Remove ${selectedPhotoIds.size} photo(s) from your library?`)) {
      deletePhotos(Array.from(selectedPhotoIds));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E9DDF7]/80">
        <div>
          {title && (
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#241735]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#7A6A88] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Filter Pills, Density & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                  selectedCategory === cat
                    ? "bg-[#9333EA] text-white shadow-xs"
                    : "bg-[#FFFFFF] text-[#7A6A88] border border-[#E9DDF7] hover:border-[#9333EA]/30 hover:bg-[#F5EEFF]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-7 pr-7 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#E9DDF7] text-[#241735] focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
              >
                <option value="newest">Newest Added</option>
                <option value="oldest">Oldest Added</option>
                <option value="size">Largest Size</option>
                <option value="name">File Name</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7A6A88] absolute left-2 top-2.5 pointer-events-none" />
            </div>

            {/* Density Selector */}
            {allowDensityToggle && (
              <div className="flex items-center p-0.5 rounded-xl bg-[#FFFFFF] border border-[#E9DDF7]">
                <button
                  onClick={() => setDensity("masonry")}
                  title="Masonry flow"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    density === "masonry"
                      ? "bg-[#F5EEFF] text-[#9333EA]"
                      : "text-[#A398AF] hover:text-[#241735]"
                  )}
                >
                  <Columns className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDensity("grid")}
                  title="Square Grid"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    density === "grid"
                      ? "bg-[#F5EEFF] text-[#9333EA]"
                      : "text-[#A398AF] hover:text-[#241735]"
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDensity("compact")}
                  title="Compact Grid"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    density === "compact"
                      ? "bg-[#F5EEFF] text-[#9333EA]"
                      : "text-[#A398AF] hover:text-[#241735]"
                  )}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Batch Selection Bar */}
      {selectedPhotoIds.size > 0 && (
        <div className="sticky top-20 z-20 flex items-center justify-between p-3 rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E9DDF7] shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-[#FFF0F7] text-xs font-bold text-[#EC4899] border border-[#F472B6]/40">
              {selectedPhotoIds.size} Selected
            </span>
            <button
              onClick={selectAllPhotos}
              className="text-xs font-semibold text-[#7A6A88] hover:text-[#9333EA] transition-colors"
            >
              Select All ({photos.length})
            </button>
            <button
              onClick={clearSelection}
              className="text-xs font-semibold text-[#A398AF] hover:text-[#241735] transition-colors"
            >
              Deselect
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Add to Album Button */}
            <div className="relative">
              <button
                onClick={() => setShowAlbumPicker(!showAlbumPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5EEFF] hover:bg-[#E9DDF7] text-[#6D28D9] transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                Add to Album
              </button>

              {showAlbumPicker && (
                <div className="absolute right-0 mt-2 w-56 p-2 bg-[#FFFFFF] rounded-2xl border border-[#E9DDF7] shadow-xl z-50">
                  <div className="text-[11px] font-bold text-[#A398AF] px-2 py-1 uppercase tracking-wider">
                    Choose Album
                  </div>
                  <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                    {albums.map((album) => (
                      <button
                        key={album.id}
                        onClick={() => handleBatchAddToAlbum(album.id)}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-[#241735] hover:bg-[#F5EEFF] rounded-lg transition-colors truncate"
                      >
                        {album.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Favorite Batch */}
            <button
              onClick={handleBatchFavorite}
              className="p-1.5 rounded-xl text-[#7A6A88] hover:text-[#EC4899] hover:bg-[#FFF0F7] transition-colors"
              title="Favorite all"
            >
              <Heart className="w-4 h-4" />
            </button>

            {/* Delete Batch */}
            <button
              onClick={handleBatchDelete}
              className="p-1.5 rounded-xl text-[#7A6A88] hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Photo Grid / Masonry Container */}
      {filteredPhotos.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-[#E9DDF7]">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0F7] text-[#EC4899] flex items-center justify-center mb-3">
            <Filter className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#241735]">No photos found</h3>
          <p className="text-xs text-[#7A6A88] max-w-sm mt-1">
            No images match the selected category &quot;{selectedCategory}&quot;. Try resetting your filters.
          </p>
          <button
            onClick={() => setSelectedCategory("All")}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#9333EA] text-white hover:bg-[#6D28D9] transition-colors"
          >
            Show All Photos
          </button>
        </div>
      ) : density === "masonry" ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filteredPhotos.map((photo, idx) => (
            <div key={photo.id} className="break-inside-avoid">
              <PhotoCard photo={photo} density="masonry" index={idx} />
            </div>
          ))}
        </div>
      ) : density === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPhotos.map((photo, idx) => (
            <PhotoCard key={photo.id} photo={photo} density="grid" index={idx} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredPhotos.map((photo, idx) => (
            <PhotoCard key={photo.id} photo={photo} density="compact" index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

