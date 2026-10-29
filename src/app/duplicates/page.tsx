"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePhotoStore } from "@/lib/store/photo-store";
import { detectDuplicates } from "@/lib/ai/organizer";
import { DuplicateGroup, Photo } from "@/types";
import {
  CopyCheck,
  CheckCircle2,
  Trash2,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  HardDrive,
  ShieldCheck,
  Check,
} from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

export default function DuplicatesPage() {
  const { photos, resolveDuplicates, deletePhotos } = usePhotoStore();

  // Run duplicate detector dynamically
  const duplicateGroups = useMemo(() => {
    return detectDuplicates(photos);
  }, [photos]);

  const [selectedKeepers, setSelectedKeepers] = useState<Record<string, string>>({});
  const [resolvedGroupIds, setResolvedGroupIds] = useState<Set<string>>(new Set());

  const handleSelectKeeper = (groupId: string, photoId: string) => {
    setSelectedKeepers((prev) => ({ ...prev, [groupId]: photoId }));
  };

  const handleResolveGroup = (group: DuplicateGroup) => {
    const keeperId = selectedKeepers[group.id] || group.selectedKeeperId || group.photos[0].id;
    const toDeleteIds = group.photos.filter((p) => p.id !== keeperId).map((p) => p.id);

    if (
      confirm(
        `Keep preferred copy (${keeperId}) and remove ${toDeleteIds.length} redundant duplicate file(s)?`
      )
    ) {
      deletePhotos(toDeleteIds);
      setResolvedGroupIds((prev) => new Set([...prev, group.id]));
    }
  };

  const handleKeepAll = (groupId: string) => {
    setResolvedGroupIds((prev) => new Set([...prev, groupId]));
  };

  const activeGroups = duplicateGroups.filter((g) => !resolvedGroupIds.has(g.id));

  // Calculate potential storage savings
  const potentialSavingsBytes = activeGroups.reduce((acc, g) => {
    const sizes = g.photos.map((p) => p.file_size);
    const sum = sizes.reduce((a, b) => a + b, 0);
    const max = Math.max(...sizes);
    return acc + (sum - max);
  }, 0);

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9DDF7]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-1 border border-amber-200">
              <CopyCheck className="w-3.5 h-3.5" />
              <span>SHA-256 & Perceptual Scanner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#241735]">
              Duplicate & Similarity Review
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6A88] mt-0.5">
              Compare redundant copies side-by-side, choose the best version, and safely reclaim storage.
            </p>
          </div>

          {activeGroups.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E9DDF7] shadow-2xs">
              <HardDrive className="w-5 h-5 text-[#9333EA]" />
              <div className="text-xs">
                <span className="text-[#7A6A88] block">Potential Space Reclaimed:</span>
                <span className="text-sm font-bold text-[#241735]">
                  {formatBytes(potentialSavingsBytes)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notice Card */}
        <div className="p-4 rounded-2xl bg-white border border-[#E9DDF7] flex items-center gap-3 text-xs text-[#7A6A88]">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            <b>Safe Review Policy:</b> Pixora AI flags exact file hash matches and visual similarities. Files are only removed when you review and click &ldquo;Keep Preferred & Remove Duplicates&rdquo;.
          </span>
        </div>

        {/* Groups List */}
        {activeGroups.length === 0 ? (
          <div className="py-20 text-center p-8 bg-white rounded-3xl border border-[#E9DDF7] space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF0F7] text-[#EC4899] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-[#241735]">
              No Duplicates Found
            </h3>
            <p className="text-xs text-[#7A6A88] max-w-sm mx-auto">
              Your visual library is clean! All files have unique content hashes and compositions.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeGroups.map((group, groupIdx) => {
              const currentKeeperId =
                selectedKeepers[group.id] || group.selectedKeeperId || group.photos[0].id;

              return (
                <div
                  key={group.id}
                  className="rounded-3xl bg-white border border-[#E9DDF7] shadow-xs overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="p-4 sm:p-5 border-b border-[#E9DDF7] bg-[#FCFAFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-[#F5EEFF] text-[#6D28D9] flex items-center justify-center text-xs font-bold">
                        #{groupIdx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#241735]">
                            {group.matchType === "exact"
                              ? "Exact Content Hash Duplicate"
                              : "Perceptual Visual Similarity"}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              group.matchType === "exact"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {Math.round(group.confidence * 100)}% Match
                          </span>
                        </div>
                        <p className="text-xs text-[#7A6A88] mt-0.5">
                          {group.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleKeepAll(group.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#7A6A88] hover:text-[#241735] hover:bg-white transition-colors"
                      >
                        Keep Both
                      </button>
                      <button
                        onClick={() => handleResolveGroup(group)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:brightness-105 active:scale-98 transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Keep Preferred & Remove Extra</span>
                      </button>
                    </div>
                  </div>

                  {/* Side-by-Side Comparison Columns */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.photos.map((photo) => {
                      const isSelectedKeeper = currentKeeperId === photo.id;

                      return (
                        <div
                          key={photo.id}
                          onClick={() => handleSelectKeeper(group.id, photo.id)}
                          className={`rounded-2xl border-2 p-4 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                            isSelectedKeeper
                              ? "border-[#9333EA] bg-[#FFF0F7]/20 shadow-md"
                              : "border-[#E9DDF7] hover:border-[#9333EA]/40 bg-white"
                          }`}
                        >
                          {/* Image Box */}
                          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#F5EEFF] border border-[#E9DDF7]">
                            <img
                              src={photo.thumbnail_path || photo.storage_path}
                              alt={photo.original_filename}
                              className="w-full h-full object-cover"
                            />

                            {/* Preferred Badge */}
                            {isSelectedKeeper && (
                              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-[#9333EA] text-white text-xs font-bold shadow-md flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Preferred Keeper
                              </div>
                            )}
                          </div>

                          {/* Metadata Details Comparison */}
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between pb-1 border-b border-[#E9DDF7]">
                              <span className="text-[#A398AF]">Filename:</span>
                              <span className="font-semibold text-[#241735] truncate max-w-[150px]">
                                {photo.original_filename}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pb-1 border-b border-[#E9DDF7]">
                              <span className="text-[#A398AF]">File Size:</span>
                              <span className="font-semibold text-[#241735]">
                                {formatBytes(photo.file_size)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pb-1 border-b border-[#E9DDF7]">
                              <span className="text-[#A398AF]">Dimensions:</span>
                              <span className="font-semibold text-[#241735]">
                                {photo.width} × {photo.height} px
                              </span>
                            </div>
                            <div className="flex items-center justify-between pb-1 border-b border-[#E9DDF7]">
                              <span className="text-[#A398AF]">Added:</span>
                              <span className="font-semibold text-[#241735]">
                                {formatDate(photo.uploaded_at)}
                              </span>
                            </div>
                          </div>

                          {/* Radio Selection Button */}
                          <button
                            type="button"
                            className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                              isSelectedKeeper
                                ? "bg-[#9333EA] text-white"
                                : "bg-[#F5EEFF] text-[#6D28D9] hover:bg-[#E9DDF7]"
                            }`}
                          >
                            {isSelectedKeeper ? "✓ Selected to Keep" : "Choose this copy"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

