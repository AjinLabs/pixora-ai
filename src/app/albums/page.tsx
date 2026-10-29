"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { usePhotoStore } from "@/lib/store/photo-store";
import {
  FolderHeart,
  Plus,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  Edit2,
  Folder,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AlbumsPage() {
  const { albums, createAlbum, deleteAlbum, photos } = usePhotoStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [newAlbumCat, setNewAlbumCat] = useState("Custom");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    createAlbum(newAlbumName.trim(), newAlbumDesc.trim(), newAlbumCat);
    setNewAlbumName("");
    setNewAlbumDesc("");
    setIsCreateOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9DDF7]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#241735]">
              Photo Albums
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6A88] mt-0.5">
              Curated memory albums and intelligent auto-grouped collections.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:brightness-105 active:scale-98 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Album</span>
          </button>
        </div>

        {/* Albums Grid */}
        {albums.length === 0 ? (
          <div className="py-16 text-center p-6 bg-white rounded-3xl border border-[#E9DDF7]">
            <FolderHeart className="w-12 h-12 text-[#9333EA] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#241735]">No albums created yet</h3>
            <p className="text-xs text-[#7A6A88] mt-1">
              Create your first album or run the AI Organizer to cluster your library automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => {
              // Find cover photo
              const coverPhoto =
                photos.find((p) => p.id === album.cover_photo_id) ||
                photos.find((p) => p.album_ids?.includes(album.id));

              const coverUrl =
                coverPhoto?.thumbnail_path ||
                coverPhoto?.storage_path ||
                album.cover_photo_url ||
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

              const count = photos.filter((p) => p.album_ids?.includes(album.id)).length;

              return (
                <div
                  key={album.id}
                  className="group rounded-3xl overflow-hidden bg-white border border-[#E9DDF7] hover:border-[#9333EA]/40 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Cover Photo */}
                  <Link
                    href={`/albums/${album.id}`}
                    className="relative aspect-16/10 overflow-hidden bg-[#F5EEFF] block"
                  >
                    <img
                      src={coverUrl}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241735]/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {album.is_smart && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0F7] text-[#EC4899] border border-[#F472B6]/40 backdrop-blur-md">
                          <Sparkles className="w-3 h-3" />
                          AI Smart Album
                        </span>
                      )}
                      {album.category && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 backdrop-blur-md text-[#241735]">
                          {album.category}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-semibold">
                      {count} photos
                    </div>
                  </Link>

                  {/* Album Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/albums/${album.id}`}>
                        <h3 className="text-base font-bold text-[#241735] group-hover:text-[#9333EA] transition-colors truncate">
                          {album.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#7A6A88] mt-1 line-clamp-2">
                        {album.description || "Collection of visual moments."}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#E9DDF7]/70 flex items-center justify-between text-xs text-[#A398AF]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(album.created_at)}
                      </span>

                      <button
                        onClick={() => {
                          if (confirm(`Delete album "${album.name}"? Photos will not be deleted.`)) {
                            deleteAlbum(album.id);
                          }
                        }}
                        className="text-[#A398AF] hover:text-rose-500 p-1 rounded-lg transition-colors"
                        title="Delete album"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Album Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9DDF7] shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E9DDF7]">
                <h3 className="text-base font-bold text-[#241735]">
                  Create New Album
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 text-[#7A6A88] hover:text-[#241735]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#241735] block mb-1">
                    Album Title *
                  </label>
                  <input
                    type="text"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    placeholder="e.g. Summer Retreat 2026"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FCFAFF] border border-[#E9DDF7] focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#241735] block mb-1">
                    Description
                  </label>
                  <textarea
                    value={newAlbumDesc}
                    onChange={(e) => setNewAlbumDesc(e.target.value)}
                    placeholder="Add brief context or memories..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FCFAFF] border border-[#E9DDF7] focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#241735] block mb-1">
                    Category Theme
                  </label>
                  <select
                    value={newAlbumCat}
                    onChange={(e) => setNewAlbumCat(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FCFAFF] border border-[#E9DDF7] focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
                  >
                    <option value="Custom">Custom</option>
                    <option value="Travel & Adventures">Travel & Adventures</option>
                    <option value="People & Friends">People & Friends</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Nature & Landscapes">Nature & Landscapes</option>
                    <option value="Screenshots">Screenshots</option>
                    <option value="Documents">Documents</option>
                    <option value="Products & Shopping">Products & Shopping</option>
                    <option value="Events & Celebrations">Events & Celebrations</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#7A6A88]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] rounded-xl hover:brightness-105"
                  >
                    Create Album
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

