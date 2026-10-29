"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  UploadCloud,
  Sparkles,
  Bell,
  Menu,
  X,
  SlidersHorizontal,
  FolderPlus,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { usePhotoStore } from "@/lib/store/photo-store";

interface TopNavProps {
  onOpenMobileMenu: () => void;
}

function SearchBarComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchSuggestions(false);
    if (searchQuery.trim()) {
      router.push(`/photos?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/photos");
    }
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    setShowSearchSuggestions(false);
    router.push(`/photos?search=${encodeURIComponent(query)}`);
  };

  const searchSuggestions = [
    "Photos from my last trip",
    "Sunset pictures",
    "Screenshots containing receipts",
    "Pictures of food & coffee",
    "Alpine mountain reflections",
    "Portraits with friends",
  ];

  return (
    <div className="relative flex-1 max-w-md mx-3">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#A398AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
            placeholder="Ask Pixora or search 'sunset', 'trip', 'receipts'..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-[#FCFAFF] border border-[#E9DDF7] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#9333EA]/30 focus:border-[#9333EA] transition-all text-[#241735] placeholder-[#A398AF]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                router.push("/photos");
              }}
              className="absolute right-3 p-0.5 text-[#A398AF] hover:text-[#241735]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSearchSuggestions && (
        <div className="absolute left-0 right-0 mt-2 p-2 bg-[#FFFFFF] rounded-2xl border border-[#E9DDF7] shadow-xl z-50">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#A398AF] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#EC4899]" />
            Natural Language Suggestions
          </div>
          <div className="space-y-0.5">
            {searchSuggestions.map((item, idx) => (
              <button
                key={idx}
                onMouseDown={() => handleSuggestionClick(item)}
                className="w-full text-left px-3 py-2 text-xs text-[#241735] hover:bg-[#F5EEFF] rounded-lg transition-colors flex items-center justify-between"
              >
                <span>{item}</span>
                <span className="text-[10px] text-[#A398AF]">Filter</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopNav({ onOpenMobileMenu }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    setIsUploadOpen,
    setIsAIOrganizeOpen,
    user,
    selectedPhotoIds,
    clearSelection,
    deletePhotos,
    activityLogs,
  } = usePhotoStore();

  const [showNotifications, setShowNotifications] = useState(false);

  // Get current breadcrumb
  const getBreadcrumb = () => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname === "/photos") return "Visual Library";
    if (pathname === "/albums") return "Photo Albums";
    if (pathname === "/smart-collections") return "Smart Collections";
    if (pathname === "/duplicates") return "Duplicate Review";
    if (pathname === "/favorites") return "Favorites";
    if (pathname === "/recent") return "Recently Added";
    if (pathname === "/settings") return "Settings & Preferences";
    if (pathname.startsWith("/albums/")) return "Album Explorer";
    return "Workspace";
  };

  return (
    <header className="h-18 px-4 md:px-8 bg-[#FFFFFF] border-b border-[#E9DDF7] flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-[#7A6A88] hover:bg-[#F5EEFF] rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-[#A398AF] font-medium">Pixora</span>
          <span className="text-[#E9DDF7]">/</span>
          <span className="font-semibold text-[#241735]">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Middle: Natural Language Search Input in Suspense */}
      <Suspense fallback={<div className="flex-1 max-w-md mx-3 h-9 bg-[#FCFAFF] rounded-xl border border-[#E9DDF7]" />}>
        <SearchBarComponent />
      </Suspense>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Bulk Action Bar if photos selected */}
        {selectedPhotoIds.size > 0 && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF0F7] border border-[#F472B6]/40 text-xs text-[#241735]">
            <span className="font-semibold text-[#EC4899]">
              {selectedPhotoIds.size} selected
            </span>
            <button
              onClick={() => deletePhotos(Array.from(selectedPhotoIds))}
              className="px-2 py-1 bg-[#FFFFFF] hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
            <button
              onClick={clearSelection}
              className="text-[#7A6A88] hover:text-[#241735] font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#FFFFFF] hover:bg-[#F5EEFF] text-[#241735] border border-[#E9DDF7] shadow-2xs hover:border-[#9333EA]/30 transition-all active:scale-98"
        >
          <UploadCloud className="w-4 h-4 text-[#9333EA]" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* AI Organize Button (Pink-Purple Gradient Accent) */}
        <button
          onClick={() => setIsAIOrganizeOpen(true)}
          className="relative group flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] via-[#9333EA] to-[#6D28D9] shadow-sm hover:shadow-md hover:brightness-105 active:scale-98 transition-all"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span>AI Organize</span>
          <span className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl blur-xs opacity-30 group-hover:opacity-60 transition-opacity -z-10" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#7A6A88] hover:text-[#241735] hover:bg-[#F5EEFF] rounded-xl border border-transparent hover:border-[#E9DDF7] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EC4899]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 p-3 bg-[#FFFFFF] rounded-2xl border border-[#E9DDF7] shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#E9DDF7]">
                <span className="text-xs font-bold text-[#241735]">Activity & System</span>
                <span className="text-[10px] text-[#A398AF]">Recent events</span>
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {activityLogs.length === 0 ? (
                  <p className="text-xs text-[#A398AF] text-center py-4">No recent activity</p>
                ) : (
                  activityLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-[#FCFAFF] border border-[#E9DDF7]/50 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#9333EA] capitalize">
                          {log.action_type.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-[#A398AF]">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A6A88]">
                        {log.details.message || JSON.stringify(log.details)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <button
          onClick={() => router.push("/settings")}
          className="focus:outline-none"
        >
          <img
            src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
            alt={user.display_name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E9DDF7] hover:ring-[#9333EA] transition-all"
          />
        </button>
      </div>
    </header>
  );
}
