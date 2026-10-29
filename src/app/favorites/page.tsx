"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PhotoMosaic } from "@/components/gallery/PhotoMosaic";
import { usePhotoStore } from "@/lib/store/photo-store";
import { Heart, Sparkles, Image as ImageIcon } from "lucide-react";

export default function FavoritesPage() {
  const { photos } = usePhotoStore();
  const favoritePhotos = photos.filter((p) => p.is_favorite);

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9DDF7]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F7] text-[#EC4899] text-xs font-semibold mb-1">
              <Heart className="w-3.5 h-3.5 fill-[#EC4899]" />
              <span>Favorited Memories</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#241735]">
              Favorites
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6A88] mt-0.5">
              Your most cherished photos and visual inspirations.
            </p>
          </div>
        </div>

        {favoritePhotos.length === 0 ? (
          <div className="py-20 text-center p-8 bg-white rounded-3xl border border-[#E9DDF7] space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF0F7] text-[#EC4899] flex items-center justify-center mx-auto shadow-sm">
              <Heart className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-[#241735]">
              No Favorites Marked Yet
            </h3>
            <p className="text-xs text-[#7A6A88] max-w-sm mx-auto">
              Tap the heart icon on any photo in your visual mosaic to pin it here for quick access.
            </p>
            <Link
              href="/photos"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9333EA] rounded-xl hover:bg-[#6D28D9]"
            >
              Explore Photos
            </Link>
          </div>
        ) : (
          <PhotoMosaic
            photos={favoritePhotos}
            title="Your Favorites"
            subtitle={`${favoritePhotos.length} photos starred`}
          />
        )}
      </div>
    </AppShell>
  );
}

