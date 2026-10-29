"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePhotoStore } from "@/lib/store/photo-store";
import {
  Settings,
  User,
  Shield,
  HardDrive,
  Palette,
  Sparkles,
  Cloud,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export default function SettingsPage() {
  const {
    user,
    setUser,
    isDemoMode,
    setIsDemoMode,
    photos,
    albums,
    resetToSampleData,
    activityLogs,
  } = usePhotoStore();

  const [displayName, setDisplayName] = useState(user.display_name);
  const [email, setEmail] = useState(user.email);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [galleryDensity, setGalleryDensity] = useState("masonry");
  const [defaultSort, setDefaultSort] = useState("newest");
  const [autoDuplicates, setAutoDuplicates] = useState(true);
  const [autoClusterAlbums, setAutoClusterAlbums] = useState(true);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      display_name: displayName,
      email,
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const storageUsed = photos.reduce((acc, p) => acc + p.file_size, 0);
  const storageTotal = user.storage_limit_bytes;
  const storagePercent = Math.min(100, Math.round((storageUsed / storageTotal) * 100));

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl pb-16">
        {/* Header */}
        <div className="pb-2 border-b border-[#E9DDF7]">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#241735]">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A88] mt-0.5">
            Manage your Pixora profile, cloud storage, AI organizer engine, and visual layout.
          </p>
        </div>

        {/* 1. Profile Settings */}
        <div className="p-6 rounded-3xl bg-white border border-[#E9DDF7] shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E9DDF7]">
            <div className="p-2 rounded-xl bg-[#F5EEFF] text-[#9333EA]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#241735]">
                Profile & Curator Identity
              </h2>
              <p className="text-xs text-[#7A6A88]">
                Personalize your workspace display name and email.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                alt={user.display_name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-[#E9DDF7]"
              />
              <div>
                <span className="text-xs font-semibold text-[#241735] block">
                  Profile Avatar
                </span>
                <span className="text-[11px] text-[#A398AF]">
                  Connected via Gravatar / Supabase Auth
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#241735] block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FCFAFF] border border-[#E9DDF7] focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#241735] block mb-1">
                  Account Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FCFAFF] border border-[#E9DDF7] focus:outline-none focus:ring-1 focus:ring-[#9333EA]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveSuccess ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Preferences saved successfully!
                </span>
              ) : (
                <div />
              )}
              <button
                type="submit"
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#9333EA] hover:bg-[#6D28D9] rounded-xl transition-all shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* 2. Storage Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-[#E9DDF7] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9DDF7]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FFF0F7] text-[#EC4899]">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#241735]">
                  Storage Quota & Breakdown
                </h2>
                <p className="text-xs text-[#7A6A88]">
                  Cloud object storage managed via Supabase Bucket.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-[#9333EA]">
              {formatBytes(storageUsed)} of {formatBytes(storageTotal)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-3 bg-[#F5EEFF] rounded-full overflow-hidden border border-[#E9DDF7]">
              <div
                className="h-full bg-gradient-to-r from-[#EC4899] via-[#9333EA] to-[#6D28D9] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, storagePercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#A398AF]">
              <span>{storagePercent}% Quota Utilized</span>
              <span>{formatBytes(storageTotal - storageUsed)} Available</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7]">
              <span className="text-[10px] text-[#A398AF] block">Indexed Photos</span>
              <span className="text-sm font-bold text-[#241735]">{photos.length} files</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7]">
              <span className="text-[10px] text-[#A398AF] block">Albums Count</span>
              <span className="text-sm font-bold text-[#241735]">{albums.length} albums</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7]">
              <span className="text-[10px] text-[#A398AF] block">Avg. Resolution</span>
              <span className="text-sm font-bold text-[#241735]">2200 × 1600 px</span>
            </div>
          </div>
        </div>

        {/* 3. Connected Cloud Backend Status */}
        <div className="p-6 rounded-3xl bg-white border border-[#E9DDF7] shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E9DDF7]">
            <div className="p-2 rounded-xl bg-[#F5EEFF] text-[#6D28D9]">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#241735]">
                Backend & Connected Services
              </h2>
              <p className="text-xs text-[#7A6A88]">
                Live Supabase PostgreSQL Database and Storage configuration.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#241735] block">
                  Supabase Project Reference
                </span>
                <span className="text-[11px] text-[#7A6A88] font-mono">
                  izczqhevfwmggjggckre.supabase.co
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Connected
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#241735] block">
                  AI Semantic Analyzer Engine
                </span>
                <span className="text-[11px] text-[#7A6A88]">
                  Multimodal heuristics + Google Gemini integration ready
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0F7] text-[#EC4899] border border-[#F472B6]/40">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* 4. Visual Library Controls & Reset */}
        <div className="p-6 rounded-3xl bg-white border border-[#E9DDF7] shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E9DDF7]">
            <div className="p-2 rounded-xl bg-[#FFF0F7] text-[#EC4899]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#241735]">
                Library Reset & Sample Data
              </h2>
              <p className="text-xs text-[#7A6A88]">
                Reload the original curated high-resolution sample library or clear cache.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7]">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#241735] block">
                Reset to Curated Sample Library
              </span>
              <span className="text-[11px] text-[#7A6A88]">
                Restores standard Nature, Travel, Friends, and Food photos with demo duplicates.
              </span>
            </div>

            <button
              onClick={() => {
                if (confirm("Reset visual library to default curated photos?")) {
                  resetToSampleData();
                  alert("Library reset to curated collection!");
                }
              }}
              className="px-4 py-2 text-xs font-semibold text-[#9333EA] bg-white border border-[#E9DDF7] rounded-xl hover:bg-[#F5EEFF] transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

