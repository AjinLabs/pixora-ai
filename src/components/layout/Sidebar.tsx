"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  FolderHeart,
  Sparkles,
  Users,
  Clock,
  Heart,
  CopyCheck,
  Settings,
  Cloud,
  HardDrive,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { usePhotoStore } from "@/lib/store/photo-store";
import { formatBytes } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { photos, albums, user, isDemoMode, setIsDemoMode } = usePhotoStore();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsDemoMode(true);
    router.push("/login");
  };

  const favoritesCount = photos.filter((p) => p.is_favorite).length;
  // Calculate duplicates count
  const hashCounts = new Map<string, number>();
  photos.forEach((p) => {
    if (p.content_hash) {
      hashCounts.set(p.content_hash, (hashCounts.get(p.content_hash) || 0) + 1);
    }
  });
  const duplicateItemsCount = photos.filter(
    (p) => p.content_hash && (hashCounts.get(p.content_hash) || 0) > 1
  ).length;

  const navItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: "All Photos",
      href: "/photos",
      icon: ImageIcon,
      badge: photos.length,
    },
    {
      title: "Albums",
      href: "/albums",
      icon: FolderHeart,
      badge: albums.length,
    },
    {
      title: "Smart Collections",
      href: "/smart-collections",
      icon: Sparkles,
      badge: "AI",
      badgeColor: "bg-[#FFF0F7] text-[#EC4899] border-[#F472B6]/40",
    },
    {
      title: "People & Subjects",
      href: "/photos?category=People%20%26%20Friends",
      icon: Users,
      badge: null,
    },
    {
      title: "Recently Added",
      href: "/recent",
      icon: Clock,
      badge: null,
    },
    {
      title: "Favorites",
      href: "/favorites",
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : null,
      badgeColor: "bg-[#FFF0F7] text-[#EC4899]",
    },
    {
      title: "Duplicate Review",
      href: "/duplicates",
      icon: CopyCheck,
      badge: duplicateItemsCount > 0 ? duplicateItemsCount : null,
      badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  const storagePercentage = Math.min(
    100,
    Math.round((user.storage_used_bytes / user.storage_limit_bytes) * 100)
  );

  return (
    <aside className="w-64 h-full flex flex-col bg-[#FFFFFF] border-r border-[#E9DDF7] select-none">
      {/* Brand Header */}
      <div className="h-18 px-5 flex items-center justify-between border-b border-[#E9DDF7]/60">
        <BrandLogo size="md" />
      </div>

      {/* Mode Status Pill */}
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#F5EEFF] border border-[#E9DDF7] text-xs text-[#6D28D9]">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#9333EA] animate-pulse" />
            {isDemoMode ? "Curated Demo Mode" : "Supabase Cloud Connected"}
          </div>
          <Link
            href="/settings"
            className="text-[11px] font-semibold text-[#EC4899] hover:underline"
          >
            Config
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-[#A398AF] uppercase">
          Library
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#FFF0F7] to-[#F5EEFF] text-[#9333EA] font-semibold shadow-xs border border-[#E9DDF7]"
                  : "text-[#7A6A88] hover:bg-[#F5EEFF]/70 hover:text-[#241735]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 transition-colors ${
                    isActive
                      ? "text-[#9333EA]"
                      : "text-[#A398AF] group-hover:text-[#9333EA]"
                  }`}
                />
                <span>{item.title}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    item.badgeColor ||
                    "bg-[#F5EEFF] text-[#6D28D9] border-[#E9DDF7]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Storage Information & Account */}
      <div className="p-4 border-t border-[#E9DDF7] space-y-3 bg-[#FCFAFF]">
        {/* Storage Bar */}
        <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E9DDF7] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-[#7A6A88]">
              <HardDrive className="w-3.5 h-3.5 text-[#9333EA]" />
              Storage
            </span>
            <span className="text-[#241735] font-semibold">
              {formatBytes(user.storage_used_bytes)} / {formatBytes(user.storage_limit_bytes)}
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#F5EEFF] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#EC4899] to-[#9333EA] rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, storagePercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#A398AF]">
            <span>{storagePercentage}% used</span>
            <Link
              href="/settings"
              className="text-[#9333EA] hover:underline font-medium"
            >
              Manage
            </Link>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFFFFF] border border-[#E9DDF7]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
              alt={user.display_name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E9DDF7]"
            />
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-[#241735] truncate">
                {user.display_name}
              </span>
              <span className="text-[10px] text-[#A398AF] truncate">
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign out or switch to demo"
            className="p-1.5 text-[#A398AF] hover:text-[#EC4899] hover:bg-[#FFF0F7] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

