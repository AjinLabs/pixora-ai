"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { usePhotoStore } from "@/lib/store/photo-store";
import { SMART_COLLECTION_TEMPLATES } from "@/lib/data/sample-photos";
import {
  Sparkles,
  Compass,
  Users,
  Utensils,
  Mountain,
  Monitor,
  FileText,
  ShoppingBag,
  ArrowRight,
  FolderCheck,
} from "lucide-react";

export default function SmartCollectionsPage() {
  const { photos, setIsAIOrganizeOpen } = usePhotoStore();

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9DDF7]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F7] text-[#EC4899] text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autonomous Categorization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#241735]">
              AI Smart Collections
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6A88] mt-0.5">
              Dynamically generated virtual collections based on visual content, subjects, and search tags.
            </p>
          </div>

          <button
            onClick={() => setIsAIOrganizeOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:brightness-105 active:scale-98 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Re-scan Library</span>
          </button>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SMART_COLLECTION_TEMPLATES.map((col) => {
            const matchingPhotos = photos.filter(
              (p) =>
                p.ai_category === col.category ||
                p.tags?.some((t) => col.matchTags.includes(t))
            );

            const coverPhoto = matchingPhotos[0];
            const coverUrl =
              coverPhoto?.thumbnail_path ||
              coverPhoto?.storage_path ||
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

            return (
              <Link
                key={col.id}
                href={`/photos?category=${encodeURIComponent(col.category)}`}
                className="group rounded-3xl overflow-hidden bg-white border border-[#E9DDF7] hover:border-[#9333EA]/40 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail Preview Banner */}
                <div className="relative aspect-16/9 bg-[#F5EEFF] overflow-hidden">
                  <img
                    src={coverUrl}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241735]/70 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 p-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/20">
                    {getCollectionIcon(col.icon)}
                  </div>

                  <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                    {matchingPhotos.length} items
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#241735] group-hover:text-[#9333EA] transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-xs text-[#7A6A88] mt-1 leading-relaxed">
                      {col.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#E9DDF7]/70 flex items-center justify-between text-xs text-[#9333EA] font-semibold">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

