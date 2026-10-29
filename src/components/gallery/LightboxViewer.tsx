"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Heart,
  Download,
  Info,
  Sparkles,
} from "lucide-react";
import { usePhotoStore } from "@/lib/store/photo-store";
import { formatBytes, formatDate } from "@/lib/utils";

export function LightboxViewer() {
  const {
    isLightboxOpen,
    setIsLightboxOpen,
    currentPhoto,
    setCurrentPhoto,
    photos,
    toggleFavorite,
    setIsDetailOpen,
  } = usePhotoStore();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  // Find index of current photo
  const currentIndex = photos.findIndex((p) => p.id === currentPhoto?.id);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setCurrentPhoto(photos[currentIndex + 1]);
      setZoomLevel(1);
    } else {
      setCurrentPhoto(photos[0]); // Loop back
      setZoomLevel(1);
    }
  }, [currentIndex, photos, setCurrentPhoto]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentPhoto(photos[currentIndex - 1]);
      setZoomLevel(1);
    } else {
      setCurrentPhoto(photos[photos.length - 1]); // Loop back
      setZoomLevel(1);
    }
  }, [currentIndex, photos, setCurrentPhoto]);

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel((z) => Math.min(3, z + 0.25));
      } else if (e.key === "-") {
        setZoomLevel((z) => Math.max(0.75, z - 0.25));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handleNext, handlePrev, setIsLightboxOpen]);

  if (!isLightboxOpen || !currentPhoto) return null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = currentPhoto.storage_path;
    a.download = currentPhoto.original_filename;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F091A]/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="h-16 px-6 flex items-center justify-between z-50 text-white/90">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
            {currentPhoto.original_filename}
          </span>
          <span className="text-[11px] text-[#A398AF] hidden sm:inline">
            ({currentIndex + 1} of {photos.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center p-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 hover:text-white text-white/70 hover:bg-white/10 rounded-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] px-2 font-mono text-white/90">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
              className="p-1.5 hover:text-white text-white/70 hover:bg-white/10 rounded-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 hover:text-white text-white/70 hover:bg-white/10 rounded-lg transition-colors border-l border-white/10"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Favorite */}
          <button
            onClick={() => toggleFavorite(currentPhoto.id)}
            className={`p-2.5 rounded-xl border border-white/10 transition-colors ${
              currentPhoto.is_favorite
                ? "bg-[#FFF0F7] text-[#EC4899]"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title="Favorite"
          >
            <Heart
              className={`w-4 h-4 ${
                currentPhoto.is_favorite ? "fill-[#EC4899]" : ""
              }`}
            />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
            title="Download original"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2.5 rounded-xl border border-white/10 transition-colors ${
              showInfo
                ? "bg-[#9333EA] text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title="Toggle Info"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white border border-white/10 transition-colors ml-2"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Image Display with Zoom */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-6 z-40 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center Image */}
        <div
          className="relative transition-transform duration-200 flex items-center justify-center max-w-full max-h-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={currentPhoto.storage_path}
            alt={currentPhoto.original_filename}
            className="max-w-[90vw] max-h-[82vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-6 z-40 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Floating Info Overlay */}
        {showInfo && (
          <div className="absolute bottom-6 right-6 z-40 w-80 p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 text-white space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#EC4899]">
              <Sparkles className="w-4 h-4" />
              Pixora Intelligence
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              {currentPhoto.ai_caption || "Visual subject indexed by Pixora AI."}
            </p>
            <div className="pt-2 border-t border-white/10 text-[11px] text-white/70 space-y-1">
              <div>Dimensions: {currentPhoto.width} × {currentPhoto.height} px</div>
              <div>File Size: {formatBytes(currentPhoto.file_size)}</div>
              <div>Category: {currentPhoto.ai_category || "General"}</div>
              <div>Date: {formatDate(currentPhoto.captured_at || currentPhoto.uploaded_at)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="h-20 px-6 py-2 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto z-40">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => {
              setCurrentPhoto(photo);
              setZoomLevel(1);
            }}
            className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
              photo.id === currentPhoto.id
                ? "border-[#EC4899] scale-105 shadow-md"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={photo.thumbnail_path || photo.storage_path}
              alt={photo.original_filename}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

