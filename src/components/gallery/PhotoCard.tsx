"use client";

import React, { useState } from "react";
import { Heart, Maximize2, Check, Sparkles, Folder } from "lucide-react";
import { Photo } from "@/types";
import { usePhotoStore } from "@/lib/store/photo-store";
import { cn } from "@/lib/utils";

interface PhotoCardProps {
  photo: Photo;
  density?: "masonry" | "grid" | "compact";
  index?: number;
}

export function PhotoCard({ photo, density = "masonry", index = 0 }: PhotoCardProps) {
  const {
    selectedPhotoIds,
    toggleSelectPhoto,
    toggleFavorite,
    setCurrentPhoto,
    setIsDetailOpen,
    setIsLightboxOpen,
    albums,
  } = usePhotoStore();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isSelected = selectedPhotoIds.has(photo.id);
  const photoAlbums = albums.filter((a) => photo.album_ids?.includes(a.id));

  // Determine aspect ratio class or height style
  const aspectRatio = photo.width && photo.height ? photo.width / photo.height : 1;
  const isPortrait = aspectRatio < 0.85;
  const isLandscape = aspectRatio > 1.25;

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking checkbox or action button, do not open detail
    if ((e.target as HTMLElement).closest(".action-stop-prop")) {
      return;
    }
    setCurrentPhoto(photo);
    setIsDetailOpen(true);
  };

  const handleOpenLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhoto(photo);
    setIsLightboxOpen(true);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative rounded-2xl overflow-hidden cursor-pointer bg-[#F5EEFF]/40 border border-[#E9DDF7] transition-all duration-300",
        "hover:shadow-lg hover:border-[#9333EA]/40 hover:-translate-y-1 select-none",
        isSelected && "ring-2 ring-[#9333EA] shadow-md border-transparent",
        density === "masonry" && (isPortrait ? "row-span-2" : isLandscape ? "col-span-1" : "row-span-1"),
        density === "grid" && "aspect-square",
        density === "compact" && "aspect-4/3"
      )}
    >
      {/* Loading Skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FFF0F7] via-[#F5EEFF] to-[#E9DDF7] animate-pulse" />
      )}

      {/* Fallback on error */}
      {imageError ? (
        <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-4 bg-[#FCFAFF] text-center">
          <div className="w-10 h-10 rounded-xl bg-[#F5EEFF] flex items-center justify-center text-[#9333EA] mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-[#241735] truncate max-w-full">
            {photo.original_filename}
          </p>
          <span className="text-[10px] text-[#A398AF] mt-0.5">Image indexed</span>
        </div>
      ) : (
        <img
          src={photo.thumbnail_path || photo.storage_path}
          alt={photo.ai_caption || photo.original_filename}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-104",
            !imageLoaded && "opacity-0",
            imageLoaded && "opacity-100",
            density === "masonry" ? "min-h-[180px] max-h-[460px]" : "h-full"
          )}
        />
      )}

      {/* Selection Checkbox */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleSelectPhoto(photo.id);
        }}
        className={cn(
          "action-stop-prop absolute top-3 left-3 w-6 h-6 rounded-lg flex items-center justify-center transition-all z-20",
          isSelected
            ? "bg-[#9333EA] text-white shadow-sm ring-2 ring-white"
            : "bg-white/80 backdrop-blur-xs text-transparent opacity-0 group-hover:opacity-100 hover:scale-105 border border-[#E9DDF7]"
        )}
      >
        <Check className={cn("w-3.5 h-3.5", isSelected ? "text-white" : "text-[#9333EA]")} />
      </div>

      {/* Favorite Button */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(photo.id);
        }}
        className={cn(
          "action-stop-prop absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center transition-all z-20",
          photo.is_favorite
            ? "bg-[#FFF0F7] text-[#EC4899] shadow-sm ring-1 ring-[#F472B6]"
            : "bg-white/80 backdrop-blur-xs text-[#7A6A88] opacity-0 group-hover:opacity-100 hover:text-[#EC4899] hover:bg-white"
        )}
      >
        <Heart
          className={cn(
            "w-4 h-4 transition-transform active:scale-125",
            photo.is_favorite && "fill-[#EC4899] text-[#EC4899]"
          )}
        />
      </div>

      {/* Bottom Info Gradient Overlay (Reveals on hover) */}
      <div className="absolute inset-x-0 bottom-0 p-3 pt-8 bg-gradient-to-t from-[#241735]/85 via-[#241735]/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold truncate drop-shadow-sm text-white">
            {photo.original_filename}
          </p>
          <button
            onClick={handleOpenLightbox}
            className="action-stop-prop p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Full-screen preview"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category & Tags Pill */}
        <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden">
          {photo.ai_category && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/20 backdrop-blur-md text-white truncate max-w-[120px]">
              {photo.ai_category}
            </span>
          )}
          {photoAlbums.length > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-[#9333EA]/60 backdrop-blur-md text-white truncate max-w-[100px]">
              <Folder className="w-2.5 h-2.5" />
              {photoAlbums[0].name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

