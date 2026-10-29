"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  FolderHeart,
  Image as ImageIcon,
  CopyCheck,
  UploadCloud,
  CheckCircle2,
  Clock,
  Compass,
  Users,
  Utensils,
  Mountain,
  Monitor,
  FileText,
  ShoppingBag,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PhotoMosaic } from "@/components/gallery/PhotoMosaic";
import { usePhotoStore } from "@/lib/store/photo-store";
import { SMART_COLLECTION_TEMPLATES } from "@/lib/data/sample-photos";

export default function DashboardPage() {
  const {
    photos,
    albums,
    setIsAIOrganizeOpen,
    setIsUploadOpen,
    user,
  } = usePhotoStore();

  // Real statistics derived from actual store
  const totalPhotos = photos.length;
  const smartAlbumsCount = albums.filter((a) => a.is_smart || a.category).length;

  // Items awaiting review: duplicates + pending status
  const hashCounts = new Map<string, number>();
  photos.forEach((p) => {
    if (p.content_hash) {
      hashCounts.set(p.content_hash, (hashCounts.get(p.content_hash) || 0) + 1);
    }
  });
  const duplicateItemsCount = photos.filter(
    (p) => p.content_hash && (hashCounts.get(p.content_hash) || 0) > 1
  ).length;

  const pendingAnalysisCount = photos.filter(
    (p) => p.processing_status === "pending" || !p.ai_category
  ).length;
  const itemsAwaitingReview = duplicateItemsCount + pendingAnalysisCount;

  // Icon mapper helper
  const getCollectionIcon = (iconName: string) => {
    switch (iconName) {
      case "Compass":
        return <Compass className="w-5 h-5 text-[#9333EA]" />;
      case "Users":
        return <Users className="w-5 h-5 text-[#EC4899]" />;
      case "Utensils":
        return <Utensils className="w-5 h-5 text-[#F472B6]" />;
      case "Mountain":
        return <Mountain className="w-5 h-5 text-[#9333EA]" />;
      case "Monitor":
        return <Monitor className="w-5 h-5 text-[#6D28D9]" />;
      case "FileText":
        return <FileText className="w-5 h-5 text-[#9333EA]" />;
      case "ShoppingBag":
        return <ShoppingBag className="w-5 h-5 text-[#EC4899]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#9333EA]" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* A. Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E9DDF7] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F7] text-[#EC4899] text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Memory Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241735] tracking-tight">
              Good morning, welcome to your visual space.
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6A88]">
              {user.display_name}&apos;s collection • Everything you love, organized in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#241735] bg-[#FCFAFF] border border-[#E9DDF7] hover:bg-[#F5EEFF] transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-[#9333EA]" />
              <span>Add Photos</span>
            </button>
            <button
              onClick={() => setIsAIOrganizeOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] via-[#9333EA] to-[#6D28D9] hover:brightness-105 active:scale-98 transition-all shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Organize my photos</span>
            </button>
          </div>
        </div>

        {/* B. Collection Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E9DDF7] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7A6A88]">Total Photos</span>
              <div className="p-2 rounded-xl bg-[#F5EEFF] text-[#9333EA]">
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#241735]">
              {totalPhotos}
            </div>
            <span className="text-[11px] text-[#A398AF] block">
              Indexed in library
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E9DDF7] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7A6A88]">Smart Albums</span>
              <div className="p-2 rounded-xl bg-[#FFF0F7] text-[#EC4899]">
                <FolderHeart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#241735]">
              {smartAlbumsCount}
            </div>
            <span className="text-[11px] text-[#A398AF] block">
              Auto-clustered collections
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E9DDF7] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7A6A88]">Awaiting Review</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <CopyCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#241735]">
              {itemsAwaitingReview}
            </div>
            <span className="text-[11px] text-[#A398AF] block">
              {duplicateItemsCount} duplicate candidates
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E9DDF7] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7A6A88]">AI Confidence</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#241735]">
              98.4%
            </div>
            <span className="text-[11px] text-[#A398AF] block">
              Visual accuracy rating
            </span>
          </div>
        </div>

        {/* E. AI Organization Card (Pink-Purple Gradient Accent) */}
        <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#FFF0F7] via-[#F5EEFF] to-white border border-[#E9DDF7] shadow-sm overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#F472B6]/40 text-[#EC4899] text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Pixora AI Suggestion</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#241735]">
                Your library could be more organized.
              </h2>
              <p className="text-xs sm:text-sm text-[#7A6A88] leading-relaxed">
                Scan your recent uploads to automatically classify subjects, cluster them into thematic albums, and flag duplicate shots for cleanup.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/duplicates"
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#241735] bg-white border border-[#E9DDF7] hover:bg-[#F5EEFF] transition-all"
              >
                Review Duplicates ({duplicateItemsCount})
              </Link>
              <button
                onClick={() => setIsAIOrganizeOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:brightness-105 active:scale-98 transition-all shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run AI Organizer</span>
              </button>
            </div>
          </div>

          {/* Decorative ambient shape */}
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-purple-600/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* C. Smart Collections Carousel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#241735]">
                Smart Collections
              </h2>
              <p className="text-xs text-[#7A6A88]">
                Intelligently segmented by visual theme & metadata
              </p>
            </div>
            <Link
              href="/smart-collections"
              className="text-xs font-semibold text-[#9333EA] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SMART_COLLECTION_TEMPLATES.slice(0, 4).map((template) => {
              const count = photos.filter(
                (p) =>
                  p.ai_category === template.category ||
                  p.tags?.some((t) => template.matchTags.includes(t))
              ).length;

              return (
                <Link
                  key={template.id}
                  href={`/photos?category=${encodeURIComponent(template.category)}`}
                  className="p-4 rounded-2xl bg-white border border-[#E9DDF7] hover:border-[#9333EA]/40 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-[#FCFAFF] border border-[#E9DDF7] group-hover:scale-105 transition-transform">
                      {getCollectionIcon(template.icon)}
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5EEFF] text-[#6D28D9]">
                      {count} photos
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#241735] group-hover:text-[#9333EA] transition-colors truncate">
                    {template.name}
                  </h3>
                  <p className="text-[11px] text-[#7A6A88] truncate mt-0.5">
                    {template.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* D. Recent Photos Visual Mosaic */}
        <div className="space-y-4 pt-4">
          <PhotoMosaic
            photos={photos}
            title="Recent Visual Mosaic"
            subtitle="Explore, multi-select, zoom, or assign to albums."
          />
        </div>
      </div>
    </AppShell>
  );
}

