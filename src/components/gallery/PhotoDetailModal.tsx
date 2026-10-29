"use client";

import React, { useState } from "react";
import {
  X,
  Heart,
  Download,
  Share2,
  Trash2,
  Sparkles,
  Camera,
  MapPin,
  Calendar,
  FileText,
  Tag,
  FolderPlus,
  Maximize2,
  Check,
  Edit2,
  Layers,
} from "lucide-react";
import { usePhotoStore } from "@/lib/store/photo-store";
import { formatBytes, formatDate } from "@/lib/utils";

export function PhotoDetailModal() {
  const {
    currentPhoto,
    setCurrentPhoto,
    isDetailOpen,
    setIsDetailOpen,
    setIsLightboxOpen,
    toggleFavorite,
    deletePhotos,
    updatePhoto,
    addTag,
    removeTag,
    albums,
    addPhotosToAlbum,
    removePhotosFromAlbum,
    photos,
  } = usePhotoStore();

  const [newTagInput, setNewTagInput] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isDetailOpen || !currentPhoto) return null;

  // Find associated albums
  const photoAlbums = albums.filter((a) => currentPhoto.album_ids?.includes(a.id));

  // Similar photos in same category
  const similarPhotos = photos
    .filter(
      (p) =>
        p.id !== currentPhoto.id &&
        (p.ai_category === currentPhoto.ai_category ||
          p.tags?.some((t) => currentPhoto.tags?.includes(t)))
    )
    .slice(0, 4);

  const handleStartRename = () => {
    setEditedName(currentPhoto.original_filename);
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    if (editedName.trim()) {
      updatePhoto(currentPhoto.id, { original_filename: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      addTag(currentPhoto.id, newTagInput.trim());
      setNewTagInput("");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentPhoto.storage_path);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove "${currentPhoto.original_filename}" from your library?`)) {
      deletePhotos([currentPhoto.id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-white rounded-3xl border border-[#E9DDF7] shadow-2xl flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Large Photo Preview Canvas */}
        <div className="relative flex-1 bg-[#0F091A] flex items-center justify-center p-4 min-h-[300px] overflow-hidden group">
          <img
            src={currentPhoto.storage_path}
            alt={currentPhoto.ai_caption || currentPhoto.original_filename}
            className="max-w-full max-h-full object-contain rounded-xl select-none"
          />

          {/* Canvas Floating Overlay Controls */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="p-2.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-105"
              title="Full-screen Lightbox"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(currentPhoto.id)}
              className={`p-2.5 rounded-xl backdrop-blur-md border border-white/20 transition-all ${
                currentPhoto.is_favorite
                  ? "bg-[#FFF0F7] text-[#EC4899]"
                  : "bg-black/50 hover:bg-black/80 text-white"
              }`}
              title="Favorite"
            >
              <Heart
                className={`w-4 h-4 ${
                  currentPhoto.is_favorite ? "fill-[#EC4899]" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Side: Details, EXIF & AI Inspector Panel */}
        <div className="w-full lg:w-96 flex flex-col bg-[#FCFAFF] border-t lg:border-t-0 lg:border-l border-[#E9DDF7] overflow-y-auto">
          {/* Header */}
          <div className="p-5 border-b border-[#E9DDF7] flex items-start justify-between bg-white sticky top-0 z-10">
            <div className="flex-1 mr-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-2 py-1 text-sm font-semibold rounded-lg border border-[#9333EA] focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveRename}
                    className="p-1 rounded bg-[#9333EA] text-white"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group">
                  <h3 className="text-base font-bold text-[#241735] truncate max-w-[220px]">
                    {currentPhoto.original_filename}
                  </h3>
                  <button
                    onClick={handleStartRename}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#A398AF] hover:text-[#9333EA] transition-opacity"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <span className="text-xs text-[#7A6A88]">
                {formatBytes(currentPhoto.file_size)} • {currentPhoto.width} × {currentPhoto.height} px
              </span>
            </div>

            <button
              onClick={() => setIsDetailOpen(false)}
              className="p-2 text-[#7A6A88] hover:text-[#241735] hover:bg-[#F5EEFF] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content sections */}
          <div className="p-5 space-y-6">
            {/* Quick Actions Bar */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white border border-[#E9DDF7] text-[#241735] hover:bg-[#F5EEFF] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#9333EA]" />
                Download
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white border border-[#E9DDF7] text-[#241735] hover:bg-[#F5EEFF] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-[#EC4899]" />
                {copiedLink ? "Copied!" : "Share"}
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>

            {/* AI Insight Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF0F7] via-[#F5EEFF] to-[#FFFFFF] border border-[#E9DDF7] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9333EA]">
                <Sparkles className="w-4 h-4 text-[#EC4899]" />
                AI Visual Classification
              </div>
              <p className="text-xs text-[#241735] leading-relaxed italic">
                &ldquo;{currentPhoto.ai_caption || "Visual subject analyzed with Pixora semantic analyzer."}&rdquo;
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-[#7A6A88]">Category:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#9333EA] text-white">
                  {currentPhoto.ai_category || "General"}
                </span>
              </div>
            </div>

            {/* Tags & Search Keywords */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#241735]">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#9333EA]" />
                  Tags & Visual Labels
                </span>
                <span className="text-[10px] text-[#A398AF]">
                  {currentPhoto.tags?.length || 0} tags
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(currentPhoto.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white border border-[#E9DDF7] text-[#241735] hover:border-[#9333EA]/40"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(currentPhoto.id, tag)}
                      className="text-[#A398AF] hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddTagSubmit} className="pt-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="+ Add new tag and press enter..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E9DDF7] focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
                />
              </form>
            </div>

            {/* Album Membership */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#241735]">
                <span className="flex items-center gap-1.5">
                  <FolderPlus className="w-3.5 h-3.5 text-[#9333EA]" />
                  Albums
                </span>
              </div>

              <div className="space-y-1">
                {albums.map((album) => {
                  const isInAlbum = currentPhoto.album_ids?.includes(album.id);
                  return (
                    <button
                      key={album.id}
                      onClick={() => {
                        if (isInAlbum) {
                          removePhotosFromAlbum(album.id, [currentPhoto.id]);
                        } else {
                          addPhotosToAlbum(album.id, [currentPhoto.id]);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium border transition-colors ${
                        isInAlbum
                          ? "bg-[#F5EEFF] border-[#E9DDF7] text-[#6D28D9]"
                          : "bg-white border-[#E9DDF7]/60 text-[#7A6A88] hover:bg-[#FCFAFF]"
                      }`}
                    >
                      <span className="truncate">{album.name}</span>
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isInAlbum ? "bg-[#9333EA] text-white" : "border border-[#A398AF]"
                        }`}
                      >
                        {isInAlbum && "✓"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EXIF Metadata & Details */}
            <div className="p-4 rounded-2xl bg-white border border-[#E9DDF7] space-y-3">
              <span className="text-xs font-bold text-[#241735] flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#9333EA]" />
                Camera & EXIF Data
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#A398AF] block">Camera</span>
                  <span className="font-semibold text-[#241735] truncate block">
                    {currentPhoto.exif?.camera || "Standard Sensor"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A398AF] block">Lens</span>
                  <span className="font-semibold text-[#241735] truncate block">
                    {currentPhoto.exif?.lens || "Prime Optics"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A398AF] block">Settings</span>
                  <span className="font-semibold text-[#241735] truncate block">
                    {currentPhoto.exif?.aperture || "f/2.8"} • ISO {currentPhoto.exif?.iso || "100"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A398AF] block">Focal Length</span>
                  <span className="font-semibold text-[#241735] truncate block">
                    {currentPhoto.exif?.focalLength || "35mm"}
                  </span>
                </div>
              </div>

              {currentPhoto.exif?.location && (
                <div className="pt-2 border-t border-[#E9DDF7] flex items-center gap-1.5 text-xs text-[#7A6A88]">
                  <MapPin className="w-3.5 h-3.5 text-[#EC4899]" />
                  <span>{currentPhoto.exif.location}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-[#7A6A88]">
                <Calendar className="w-3.5 h-3.5 text-[#9333EA]" />
                <span>Captured: {formatDate(currentPhoto.captured_at || currentPhoto.uploaded_at)}</span>
              </div>
            </div>

            {/* Similar Photos Preview */}
            {similarPhotos.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#241735] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#EC4899]" />
                  Similar Photos
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {similarPhotos.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => setCurrentPhoto(sim)}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer border border-[#E9DDF7] hover:scale-105 transition-transform"
                    >
                      <img
                        src={sim.thumbnail_path || sim.storage_path}
                        alt={sim.original_filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

