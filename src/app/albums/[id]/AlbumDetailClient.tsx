"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PhotoMosaic } from "@/components/gallery/PhotoMosaic";
import { usePhotoStore } from "@/lib/store/photo-store";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Trash2,
  Edit2,
  Check,
  Plus,
  FolderHeart,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AlbumDetailClient({ albumId }: { albumId: string }) {
  const router = useRouter();
  const { albums, photos, updateAlbum, deleteAlbum, addPhotosToAlbum } = usePhotoStore();

  const album = albums.find((a) => a.id === albumId);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(album?.name || "");
  const [editDesc, setEditDesc] = useState(album?.description || "");
  const [showAddPhotosModal, setShowAddPhotosModal] = useState(false);

  if (!album) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4">
          <FolderHeart className="w-12 h-12 text-[#9333EA] mx-auto opacity-50" />
          <h2 className="text-xl font-bold text-[#241735]">Album Not Found</h2>
          <p className="text-xs text-[#7A6A88]">
            This album may have been deleted or does not exist.
          </p>
          <Link
            href="/albums"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9333EA] rounded-xl hover:bg-[#6D28D9]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Albums
          </Link>
        </div>
      </AppShell>
    );
  }

  // Photos belonging to this album
  const albumPhotos = photos.filter((p) => p.album_ids?.includes(album.id));
  const otherPhotos = photos.filter((p) => !p.album_ids?.includes(album.id));

  const handleSaveDetails = () => {
    updateAlbum(album.id, {
      name: editName.trim() || album.name,
      description: editDesc.trim(),
    });
    setIsEditing(false);
  };

  const handleDeleteAlbum = () => {
    if (confirm(`Delete album "${album.name}"? Photos will remain in your library.`)) {
      deleteAlbum(album.id);
      router.push("/albums");
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Navigation Breadcrumb Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/albums"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6A88] hover:text-[#241735] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Albums
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddPhotosModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5EEFF] text-[#6D28D9] hover:bg-[#E9DDF7] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Photos
            </button>
            <button
              onClick={handleDeleteAlbum}
              className="p-1.5 text-[#A398AF] hover:text-rose-500 rounded-lg transition-colors"
              title="Delete album"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Album Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E9DDF7] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {album.is_smart && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0F7] text-[#EC4899] border border-[#F472B6]/40">
                  <Sparkles className="w-3 h-3" />
                  AI Smart Collection
                </span>
              )}
              {album.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5EEFF] text-[#6D28D9]">
                  {album.category}
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xl font-bold px-3 py-1.5 rounded-xl border border-[#9333EA] focus:outline-none"
                  autoFocus
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#E9DDF7] focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveDetails}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-[#9333EA] text-white rounded-lg"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-xs text-[#7A6A88]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241735]">
                    {album.name}
                  </h1>
                  <button
                    onClick={() => {
                      setEditName(album.name);
                      setEditDesc(album.description || "");
                      setIsEditing(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#A398AF] hover:text-[#9333EA] transition-opacity"
                    title="Edit name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-[#7A6A88] mt-1 max-w-2xl">
                  {album.description || "No description provided."}
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-[#A398AF] pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created {formatDate(album.created_at)}
              </span>
              <span>•</span>
              <span className="font-semibold text-[#241735]">
                {albumPhotos.length} Photos in Album
              </span>
            </div>
          </div>
        </div>

        {/* Photos in Album */}
        {albumPhotos.length === 0 ? (
          <div className="py-16 text-center p-6 bg-white rounded-3xl border border-[#E9DDF7] space-y-3">
            <h3 className="text-base font-bold text-[#241735]">
              No photos in this album yet
            </h3>
            <p className="text-xs text-[#7A6A88]">
              Select photos from your visual library to add them to this album.
            </p>
            <button
              onClick={() => setShowAddPhotosModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#9333EA] rounded-xl hover:bg-[#6D28D9]"
            >
              Add Photos Now
            </button>
          </div>
        ) : (
          <PhotoMosaic
            photos={albumPhotos}
            title={`${album.name} Photos`}
            subtitle={`Displaying all ${albumPhotos.length} items`}
          />
        )}

        {/* Add Photos to Album Picker Modal */}
        {showAddPhotosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-xl bg-white rounded-3xl border border-[#E9DDF7] shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-[#E9DDF7]">
                <h3 className="text-base font-bold text-[#241735]">
                  Add Photos to &ldquo;{album.name}&rdquo;
                </h3>
                <button
                  onClick={() => setShowAddPhotosModal(false)}
                  className="p-1 text-[#7A6A88]"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 p-1">
                {otherPhotos.length === 0 ? (
                  <p className="text-xs text-[#7A6A88] col-span-3 text-center py-8">
                    All existing photos are already in this album!
                  </p>
                ) : (
                  otherPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => {
                        addPhotosToAlbum(album.id, [photo.id]);
                      }}
                      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-[#E9DDF7] hover:border-[#9333EA]"
                    >
                      <img
                        src={photo.thumbnail_path || photo.storage_path}
                        alt={photo.original_filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        + Add
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-[#E9DDF7] flex justify-end">
                <button
                  onClick={() => setShowAddPhotosModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#9333EA] rounded-xl hover:bg-[#6D28D9]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
