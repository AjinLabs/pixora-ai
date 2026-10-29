"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  FolderHeart,
  Search,
  CopyCheck,
  ShieldCheck,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { SAMPLE_PHOTOS } from "@/lib/data/sample-photos";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FCFAFF] text-[#241735] flex flex-col selection:bg-[#F5EEFF] selection:text-[#9333EA]">
      {/* Top Navigation */}
      <header className="h-20 px-6 sm:px-12 flex items-center justify-between border-b border-[#E9DDF7] bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <BrandLogo size="md" withTagline={false} asLink={false} />

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#7A6A88] hover:text-[#241735] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:brightness-105 active:scale-98 transition-all shadow-sm"
          >
            <span>Launch App</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 sm:px-12 pt-16 pb-20 max-w-7xl mx-auto text-center space-y-8">
        {/* Shimmer Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F7] border border-[#F472B6]/40 text-[#EC4899] text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Every memory, beautifully organized.</span>
        </div>

        {/* Heading */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#241735] leading-[1.12]">
            Turn thousands of scattered photos into a{" "}
            <span className="pixora-gradient-text">beautifully organized</span>{" "}
            visual library with AI.
          </h1>
          <p className="text-base sm:text-lg text-[#7A6A88] max-w-2xl mx-auto leading-relaxed">
            Pixora AI scans your camera rolls, folders, and screenshots, groups them into meaningful thematic albums, detects duplicates, and enables natural language discovery.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#EC4899] via-[#9333EA] to-[#6D28D9] shadow-md hover:shadow-lg hover:brightness-105 active:scale-98 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Visual Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/photos"
            className="px-6 py-3.5 rounded-2xl text-sm font-bold text-[#241735] bg-white border border-[#E9DDF7] hover:bg-[#F5EEFF] transition-all shadow-xs"
          >
            View Photo Mosaic
          </Link>
        </div>

        {/* Live Mosaic Hero Canvas */}
        <div className="pt-10">
          <div className="p-3 sm:p-5 rounded-3xl bg-white/70 backdrop-blur-md border border-[#E9DDF7] shadow-xl">
            <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
              {SAMPLE_PHOTOS.slice(0, 8).map((photo) => (
                <div
                  key={photo.id}
                  className="relative rounded-2xl overflow-hidden border border-[#E9DDF7] group cursor-pointer break-inside-avoid"
                >
                  <img
                    src={photo.thumbnail_path || photo.storage_path}
                    alt={photo.original_filename}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241735]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-left text-white">
                    <span className="text-xs font-bold truncate">
                      {photo.original_filename}
                    </span>
                    <span className="text-[10px] text-pink-200">
                      {photo.ai_category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visual Transformation: Before & After */}
      <section className="px-6 sm:px-12 py-16 bg-[#FFFFFF] border-y border-[#E9DDF7]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#241735]">
              The Pixora Transformation
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6A88]">
              From an overwhelming folder of random filenames to an intelligent, curated gallery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Before */}
            <div className="p-6 rounded-3xl bg-[#FCFAFF] border border-[#E9DDF7] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E9DDF7]">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  Before: Disordered Chaos
                </span>
                <span className="text-xs text-[#A398AF]">Messy downloads & camera rolls</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-[#7A6A88]">
                <div className="p-2.5 rounded-xl bg-white border border-[#E9DDF7] flex justify-between">
                  <span>IMG_8829_HDR.JPG (duplicate)</span>
                  <span className="text-rose-400">3.4 MB</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E9DDF7] flex justify-between">
                  <span>Screenshot 2026-10-20 at 14.10.00.png</span>
                  <span className="text-rose-400">0.9 MB</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E9DDF7] flex justify-between">
                  <span>DSC_0031_EDIT_FINAL_v2.jpg</span>
                  <span className="text-rose-400">4.1 MB</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E9DDF7] flex justify-between">
                  <span>inv_receipt_4412_tax.pdf.jpg</span>
                  <span className="text-rose-400">1.4 MB</span>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFF0F7] via-[#F5EEFF] to-white border border-[#9333EA]/30 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E9DDF7]">
                <span className="text-xs font-bold text-[#9333EA] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                  After: Pixora AI Library
                </span>
                <span className="text-xs font-semibold text-[#EC4899]">Fully Structured</span>
              </div>
              <div className="space-y-2 text-xs text-[#241735]">
                <div className="p-2.5 rounded-xl bg-white border border-[#E9DDF7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9333EA]" />
                    <span className="font-semibold">Alpine & Wilderness</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5EEFF] text-[#6D28D9] font-medium">
                    Nature • 4 Photos
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E9DDF7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
                    <span className="font-semibold">Receipts & Invoices</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF0F7] text-[#EC4899] font-medium">
                    Work Docs • Tagged
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E9DDF7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold">Duplicate Review</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                    Identical hash resolved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="px-6 sm:px-12 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#241735]">
            Engineered for Visual Delight
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6A88]">
            Built with modern web technologies, Supabase cloud storage, and AI classifiers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E9DDF7] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F7] text-[#EC4899] flex items-center justify-center">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#241735]">
              Visual Mosaic & Explorer
            </h3>
            <p className="text-xs text-[#7A6A88] leading-relaxed">
              Masonry and justified responsive layouts that make scrolling through thousands of photos an effortless, fluid experience.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E9DDF7] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5EEFF] text-[#9333EA] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#241735]">
              Autonomous AI Categorization
            </h3>
            <p className="text-xs text-[#7A6A88] leading-relaxed">
              Detects landscapes, people, cuisine, receipts, products, and celebrations with captions and contextual tags.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E9DDF7] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F7] text-[#EC4899] flex items-center justify-center">
              <CopyCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#241735]">
              Duplicate & Similarity Review
            </h3>
            <p className="text-xs text-[#7A6A88] leading-relaxed">
              Finds exact SHA-256 byte duplicates and perceptual similarities with side-by-side comparison before any deletion.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 sm:px-12 py-8 border-t border-[#E9DDF7] bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6A88]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#241735]">Pixora AI</span>
          <span>•</span>
          <span>Every memory, beautifully organized.</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-[#9333EA]">
            Workspace
          </Link>
          <Link href="/photos" className="hover:text-[#9333EA]">
            Photos
          </Link>
          <Link href="/settings" className="hover:text-[#9333EA]">
            Preferences
          </Link>
        </div>
      </footer>
    </div>
  );
}
