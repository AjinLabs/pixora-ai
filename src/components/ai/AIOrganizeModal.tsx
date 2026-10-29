"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  FolderPlus,
  Tag,
  CopyCheck,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Layers,
  Check,
} from "lucide-react";
import { usePhotoStore } from "@/lib/store/photo-store";
import { runFullOrganizationPipeline } from "@/lib/ai/organizer";
import { OrganizationProposal } from "@/types";

export function AIOrganizeModal() {
  const {
    isAIOrganizeOpen,
    setIsAIOrganizeOpen,
    photos,
    applyOrganizationProposal,
  } = usePhotoStore();

  const [step, setStep] = useState<"idle" | "running" | "review" | "complete">("idle");
  const [currentStageName, setCurrentStageName] = useState("Initializing...");
  const [progress, setProgress] = useState(0);
  const [proposal, setProposal] = useState<OrganizationProposal | null>(null);
  const [selectedAlbumNames, setSelectedAlbumNames] = useState<Set<string>>(new Set());

  if (!isAIOrganizeOpen) return null;

  const startAnalysis = async () => {
    setStep("running");
    setProgress(5);
    setCurrentStageName("Starting visual library analysis...");

    try {
      const generatedProposal = await runFullOrganizationPipeline(
        photos,
        (stage, prog, task) => {
          setProgress(prog);
          setCurrentStageName(task);
        }
      );

      setProposal(generatedProposal);
      // Select all proposed albums by default for user review
      setSelectedAlbumNames(new Set(generatedProposal.proposedAlbums.map((a) => a.name)));
      setStep("review");
    } catch (err) {
      console.error("AI workflow failed:", err);
      setCurrentStageName("An error occurred during AI analysis. You can retry.");
    }
  };

  const handleApplyChanges = () => {
    if (!proposal) return;

    // Filter proposed albums according to user selection in review
    const filteredProposal: OrganizationProposal = {
      ...proposal,
      proposedAlbums: proposal.proposedAlbums.filter((a) =>
        selectedAlbumNames.has(a.name)
      ),
    };

    applyOrganizationProposal(filteredProposal);
    setStep("complete");
  };

  const toggleSelectAlbum = (name: string) => {
    setSelectedAlbumNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleClose = () => {
    setIsAIOrganizeOpen(false);
    setStep("idle");
    setProposal(null);
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#E9DDF7] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Pink-Purple Gradient Accents */}
        <div className="p-6 border-b border-[#E9DDF7] flex items-center justify-between bg-gradient-to-r from-[#FFF0F7] via-white to-[#F5EEFF]">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#9333EA] text-white shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#241735]">
                  Pixora AI Organizer Engine
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#FFF0F7] text-[#EC4899] border border-[#F472B6]/40">
                  Safe & Reversible
                </span>
              </div>
              <p className="text-xs text-[#7A6A88]">
                8-stage intelligent scan, classification, duplicate check, and smart album structuring.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-[#7A6A88] hover:text-[#241735] hover:bg-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content per Step */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: IDLE / INTRO */}
          {step === "idle" && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFF0F7] to-[#F5EEFF] border border-[#E9DDF7] flex flex-col sm:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-[#E9DDF7] flex items-center justify-center text-[#9333EA] flex-shrink-0">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-sm font-bold text-[#241735]">
                    Your library contains {photos.length} photos ready for intelligent organization.
                  </h4>
                  <p className="text-xs text-[#7A6A88] leading-relaxed">
                    Pixora AI will scan file metadata, classify subjects (Nature, Travel, Food, People, Documents), identify potential smart albums, and detect duplicates. All changes are presented for your review before being applied.
                  </p>
                </div>
              </div>

              {/* Workflow Stages Roadmap */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#A398AF] uppercase tracking-wider">
                  8-Stage Processing Pipeline
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7] text-xs">
                    <span className="font-bold text-[#9333EA] block">1. Scan</span>
                    <span className="text-[11px] text-[#7A6A88]">File inventory & hashes</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7] text-xs">
                    <span className="font-bold text-[#9333EA] block">2. Analyze</span>
                    <span className="text-[11px] text-[#7A6A88]">Visual subjects & EXIF</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7] text-xs">
                    <span className="font-bold text-[#9333EA] block">3. Group</span>
                    <span className="text-[11px] text-[#7A6A88]">Smart albums clustering</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7] text-xs">
                    <span className="font-bold text-[#EC4899] block">4. Review</span>
                    <span className="text-[11px] text-[#7A6A88]">User confirmation</span>
                  </div>
                </div>
              </div>

              {/* Safety notice */}
              <div className="p-3 rounded-xl bg-white border border-[#E9DDF7] flex items-center gap-2 text-xs text-[#7A6A88]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Safety guarantee: Pixora AI never deletes or moves your original files without explicit confirmation.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: RUNNING / PROGRESS */}
          {step === "running" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#EC4899] to-[#9333EA] text-white flex items-center justify-center shadow-lg animate-pulse">
                  <Sparkles className="w-10 h-10" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur-md opacity-30 animate-spin-slow -z-10" />
              </div>

              <div className="space-y-2 max-w-md">
                <h4 className="text-base font-bold text-[#241735]">
                  Analyzing Visual Collection...
                </h4>
                <p className="text-xs text-[#9333EA] font-medium h-6">
                  {currentStageName}
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full max-w-md space-y-1.5">
                <div className="w-full h-2.5 bg-[#F5EEFF] rounded-full overflow-hidden border border-[#E9DDF7]">
                  <div
                    className="h-full bg-gradient-to-r from-[#EC4899] via-[#9333EA] to-[#6D28D9] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#A398AF] font-mono">
                  <span>Processed: {photos.length} photos</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW PROPOSAL */}
          {step === "review" && proposal && (
            <div className="space-y-6">
              {/* Proposal summary pill bar */}
              <div className="p-4 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-[#A398AF] uppercase font-bold block">Scanned</span>
                  <span className="text-sm font-bold text-[#241735]">
                    {proposal.summary.totalScanned} Photos
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A398AF] uppercase font-bold block">Suggested Albums</span>
                  <span className="text-sm font-bold text-[#9333EA]">
                    {proposal.summary.suggestedAlbumsCount} Albums
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A398AF] uppercase font-bold block">Enriched Tags</span>
                  <span className="text-sm font-bold text-[#EC4899]">
                    +{proposal.summary.suggestedTagsCount} Tags
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A398AF] uppercase font-bold block">Duplicates</span>
                  <span className="text-sm font-bold text-amber-600">
                    {proposal.summary.duplicateGroupsCount} Groups
                  </span>
                </div>
              </div>

              {/* Proposed Albums List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#241735] flex items-center gap-1.5">
                    <FolderPlus className="w-4 h-4 text-[#9333EA]" />
                    Suggested Smart Albums (Click to include/exclude)
                  </span>
                  <span className="text-[11px] text-[#7A6A88]">
                    {selectedAlbumNames.size} of {proposal.proposedAlbums.length} selected
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {proposal.proposedAlbums.map((album) => {
                    const isSelected = selectedAlbumNames.has(album.name);
                    return (
                      <div
                        key={album.name}
                        onClick={() => toggleSelectAlbum(album.name)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[#FFF0F7]/40 border-[#9333EA] shadow-2xs"
                            : "bg-white border-[#E9DDF7] opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected ? "bg-[#9333EA] text-white" : "border border-[#A398AF]"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-[#241735]">
                              {album.name}
                            </h5>
                            <p className="text-[11px] text-[#7A6A88]">
                              {album.description}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5EEFF] text-[#6D28D9] border border-[#E9DDF7]">
                          {album.photoIds.length} photos
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detected Duplicates Notice */}
              {proposal.detectedDuplicates.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Pixora detected <b>{proposal.detectedDuplicates.length} duplicate groups</b>. You can review and resolve them on the Duplicate Review page.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: COMPLETE */}
          {step === "complete" && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-lg font-bold text-[#241735]">
                Organization Complete!
              </h4>
              <p className="text-xs text-[#7A6A88] max-w-sm">
                Your photos have been categorized into smart collections, assigned albums, and indexed with natural language search tags.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#E9DDF7] bg-[#FCFAFF] flex items-center justify-between">
          <span className="text-[11px] text-[#A398AF]">
            {step === "review" ? "Changes will be applied reversibly" : "Pixora Autonomous Classifier"}
          </span>

          <div className="flex items-center gap-2">
            {step === "idle" && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-[#7A6A88] hover:text-[#241735]"
                >
                  Cancel
                </button>
                <button
                  onClick={startAnalysis}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:brightness-105 active:scale-98 transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start AI Scan</span>
                </button>
              </>
            )}

            {step === "review" && (
              <>
                <button
                  onClick={() => setStep("idle")}
                  className="px-4 py-2 text-xs font-semibold text-[#7A6A88] hover:text-[#241735]"
                >
                  Back
                </button>
                <button
                  onClick={handleApplyChanges}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:brightness-105 active:scale-98 transition-all shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Apply ({selectedAlbumNames.size} Albums)</span>
                </button>
              </>
            )}

            {step === "complete" && (
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#9333EA] hover:bg-[#6D28D9] transition-colors"
              >
                View Library
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

