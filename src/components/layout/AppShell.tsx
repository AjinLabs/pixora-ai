"use client";

import React, { useState, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { UploadModal } from "@/components/upload/UploadModal";
import { AIOrganizeModal } from "@/components/ai/AIOrganizeModal";
import { PhotoDetailModal } from "@/components/gallery/PhotoDetailModal";
import { LightboxViewer } from "@/components/gallery/LightboxViewer";
import { X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#FCFAFF] text-[#241735] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <Suspense fallback={<div className="w-64 h-full bg-white border-r border-[#E9DDF7]" />}>
          <Sidebar />
        </Suspense>
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#7A6A88] hover:text-[#241735] z-50"
            >
              <X className="w-5 h-5" />
            </button>
            <Suspense fallback={<div className="w-64 h-full bg-white" />}>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Suspense fallback={<div className="h-18 bg-white border-b border-[#E9DDF7]" />}>
          <TopNav onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        </Suspense>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals & Lightbox */}
      <UploadModal />
      <AIOrganizeModal />
      <PhotoDetailModal />
      <LightboxViewer />
    </div>
  );
}
