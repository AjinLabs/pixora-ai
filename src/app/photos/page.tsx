"use client";

import React, { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PhotoMosaic } from "@/components/gallery/PhotoMosaic";
import { usePhotoStore } from "@/lib/store/photo-store";
import { Search, Sparkles, X, Tag } from "lucide-react";
import Link from "next/link";
import { formatBytes } from "@/lib/utils";

function PhotosContent() {
  const searchParams = useSearchParams();
  const searchFilter = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "";
  const tagFilter = searchParams.get("tag") || "";

  const { photos, setIsAIOrganizeOpen } = usePhotoStore();

  // Natural language query filter engine
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    if (categoryFilter) {
      result = result.filter(
        (p) => p.ai_category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (tagFilter) {
      result = result.filter((p) =>
        p.tags?.some((t) => t.toLowerCase() === tagFilter.toLowerCase())
      );
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();

      // Check for natural language intent keywords
      const isTrip = q.includes("trip") || q.includes("vacation") || q.includes("travel");
      const isSunset = q.includes("sunset") || q.includes("sunrise") || q.includes("golden hour");
      const isReceipt = q.includes("receipt") || q.includes("invoice") || q.includes("doc");
      const isFood = q.includes("food") || q.includes("coffee") || q.includes("dining") || q.includes("meal");
      const isPeople = q.includes("people") || q.includes("friend") || q.includes("portrait") || q.includes("smile");
      const isNature = q.includes("nature") || q.includes("mountain") || q.includes("lake") || q.includes("forest");
      const isUnorganized = q.includes("unorganized") || q.includes("pending");

      result = result.filter((p) => {
        const text = `${p.original_filename} ${p.ai_category || ""} ${p.ai_caption || ""} ${(p.tags || []).join(" ")} ${p.exif?.location || ""}`.toLowerCase();

        if (text.includes(q)) return true;

        if (isTrip && (p.ai_category === "Travel & Adventures" || text.includes("santorini") || text.includes("italy"))) return true;
        if (isSunset && (text.includes("sunset") || text.includes("beach") || text.includes("dusk"))) return true;
        if (isReceipt && (p.ai_category === "Documents" || p.ai_category === "Screenshots" || text.includes("receipt") || text.includes("invoice"))) return true;
        if (isFood && (p.ai_category === "Food & Dining" || text.includes("coffee") || text.includes("bowl"))) return true;
        if (isPeople && (p.ai_category === "People & Friends" || text.includes("friend") || text.includes("smile"))) return true;
        if (isNature && (p.ai_category === "Nature & Landscapes" || text.includes("mountain") || text.includes("lake"))) return true;
        if (isUnorganized && (p.processing_status === "pending" || !p.ai_category)) return true;

        return false;
      });
    }

    return result;
  }, [photos, searchFilter, categoryFilter, tagFilter]);

  const totalBytes = filteredPhotos.reduce((acc, p) => acc + p.file_size, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Active Search & Filter Banner */}
      {(searchFilter || categoryFilter || tagFilter) && (
        <div className="p-4 rounded-2xl bg-white border border-[#E9DDF7] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-[#7A6A88]">Active Filters:</span>
            {searchFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF0F7] text-[#EC4899] border border-[#F472B6]/40 font-bold">
                <Search className="w-3.5 h-3.5" />
                Query: &ldquo;{searchFilter}&rdquo;
              </span>
            )}
            {categoryFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F5EEFF] text-[#6D28D9] border border-[#E9DDF7] font-bold">
                Category: {categoryFilter}
              </span>
            )}
            {tagFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F5EEFF] text-[#6D28D9] border border-[#E9DDF7] font-bold">
                <Tag className="w-3.5 h-3.5" />
                Tag: #{tagFilter}
              </span>
            )}
          </div>

          <Link
            href="/photos"
            className="flex items-center gap-1 text-xs font-semibold text-[#EC4899] hover:underline"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </Link>
        </div>
      )}

      {/* Main Mosaic Component */}
      <PhotoMosaic
        photos={filteredPhotos}
        title="Visual Photo Mosaic"
        subtitle={`Showing ${filteredPhotos.length} of ${photos.length} total images (${formatBytes(totalBytes)})`}
      />
    </div>
  );
}

export default function PhotosPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#7A6A88]">Loading visual library...</div>}>
        <PhotosContent />
      </Suspense>
    </AppShell>
  );
}

