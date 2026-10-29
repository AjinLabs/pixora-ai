"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PhotoMosaic } from "@/components/gallery/PhotoMosaic";
import { usePhotoStore } from "@/lib/store/photo-store";
import { Clock, UploadCloud } from "lucide-react";

export default function RecentPage() {
  const { photos, setIsUploadOpen } = usePhotoStore();

  // Sort photos newest first
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
  );

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9DDF7]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EEFF] text-[#6D28D9] text-xs font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline Order</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#241735]">
              Recently Added
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6A88] mt-0.5">
              Images and visual media organized chronologically by upload timestamp.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] rounded-xl hover:brightness-105 active:scale-98 transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New</span>
          </button>
        </div>

        <PhotoMosaic
          photos={sortedPhotos}
          title="Recent Ingested Media"
          subtitle={`Showing all ${photos.length} photos sorted from newest to oldest`}
        />
      </div>
    </AppShell>
  );
}

