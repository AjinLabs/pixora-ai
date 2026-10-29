"use client";

import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  RefreshCw,
  FolderPlus,
} from "lucide-react";
import { usePhotoStore } from "@/lib/store/photo-store";
import { Photo } from "@/types";
import { formatBytes } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface UploadFileItem {
  file: File;
  id: string;
  previewUrl: string;
  status: "queued" | "uploading" | "success" | "error" | "duplicate";
  progress: number;
  error?: string;
  photo?: Photo;
}

export function UploadModal() {
  const {
    isUploadOpen,
    setIsUploadOpen,
    addPhotos,
    photos: existingPhotos,
    isDemoMode,
    user,
  } = usePhotoStore();

  const [filesToUpload, setFilesToUpload] = useState<UploadFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<{
    total: number;
    succeeded: number;
    duplicates: number;
    failed: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadOpen) return null;

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: UploadFileItem[] = [];
    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return;
      }
      // Max file size: 50MB
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 50MB limit.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        file,
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        previewUrl,
        status: "queued",
        progress: 0,
      });
    });

    setFilesToUpload((prev) => [...prev, ...newItems]);
    setUploadSummary(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const removeFileItem = (id: string) => {
    setFilesToUpload((prev) => prev.filter((item) => item.id !== id));
  };

  const startUploadBatch = async () => {
    if (filesToUpload.length === 0) return;
    setIsProcessing(true);

    const supabase = createClient();
    const createdPhotos: Photo[] = [];
    let succeeded = 0;
    let duplicates = 0;
    let failed = 0;

    for (let i = 0; i < filesToUpload.length; i++) {
      const item = filesToUpload[i];
      if (item.status === "success") continue;

      // Update item to uploading
      setFilesToUpload((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: "uploading", progress: 25 } : it
        )
      );

      try {
        // Read file dimensions and calculate a content hash
        const img = new Image();
        img.src = item.previewUrl;
        await new Promise((res) => {
          img.onload = res;
          img.onerror = res;
        });

        const width = img.naturalWidth || 1920;
        const height = img.naturalHeight || 1080;
        const fakeHash = `hash_${item.file.name}_${item.file.size}`;

        // Check if exact duplicate exists in library
        const isDuplicate = existingPhotos.some(
          (p) => p.content_hash === fakeHash || (p.original_filename === item.file.name && p.file_size === item.file.size)
        );

        if (isDuplicate) {
          duplicates++;
          setFilesToUpload((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: "duplicate", progress: 100 }
                : it
            )
          );
          continue;
        }

        let storageUrl = item.previewUrl;

        // If not in demo mode and user has Supabase session, upload to Supabase storage bucket
        if (!isDemoMode && user.id && !user.is_demo) {
          const fileExt = item.file.name.split(".").pop();
          const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileExt}`;

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("photos")
            .upload(filePath, item.file, { upsert: true });

          if (uploadErr) {
            console.warn("Storage upload error, falling back to local object:", uploadErr);
          } else if (uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from("photos")
              .getPublicUrl(filePath);
            storageUrl = publicUrlData.publicUrl;
          }
        }

        setFilesToUpload((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, progress: 80 } : it
          )
        );

        // Create Photo object
        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          owner_id: user.id || null,
          storage_path: storageUrl,
          thumbnail_path: storageUrl,
          original_filename: item.file.name,
          mime_type: item.file.type || "image/jpeg",
          file_size: item.file.size,
          width,
          height,
          captured_at: new Date(item.file.lastModified || Date.now()).toISOString(),
          uploaded_at: new Date().toISOString(),
          content_hash: fakeHash,
          ai_caption: `Imported photo ${item.file.name}, awaiting AI scan.`,
          ai_category: item.file.type.includes("png") ? "Screenshots" : "Nature & Landscapes",
          processing_status: "pending",
          tags: ["imported", item.file.type.split("/")[1] || "image"],
          is_favorite: false,
          album_ids: [],
        };

        createdPhotos.push(newPhoto);
        succeeded++;

        setFilesToUpload((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: "success", progress: 100, photo: newPhoto }
              : it
          )
        );
      } catch (err: any) {
        failed++;
        setFilesToUpload((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: "error", error: err.message || "Failed" }
              : it
          )
        );
      }
    }

    if (createdPhotos.length > 0) {
      addPhotos(createdPhotos);
    }

    setIsProcessing(false);
    setUploadSummary({
      total: filesToUpload.length,
      succeeded,
      duplicates,
      failed,
    });
  };

  const handleClose = () => {
    setIsUploadOpen(false);
    setFilesToUpload([]);
    setUploadSummary(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E9DDF7] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#E9DDF7] flex items-center justify-between bg-gradient-to-r from-[#FFF0F7] via-white to-[#F5EEFF]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#9333EA] text-white shadow-sm">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#241735]">
                Upload Photos & Visual Files
              </h3>
              <p className="text-xs text-[#7A6A88]">
                Drag and drop your images. Supported formats: JPEG, PNG, WebP, GIF
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Drag & Drop Target Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer text-center transition-all ${
              isDragging
                ? "border-[#9333EA] bg-[#F5EEFF]"
                : "border-[#E9DDF7] hover:border-[#9333EA]/50 hover:bg-[#FCFAFF]"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFilesSelected(e.target.files)}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0F7] text-[#EC4899] flex items-center justify-center mb-3 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-[#241735]">
              Drop your images here, or <span className="text-[#9333EA] underline">browse files</span>
            </h4>
            <span className="text-xs text-[#A398AF] mt-1">
              High resolution photos, up to 50MB each. Safe client validation.
            </span>
          </div>

          {/* Upload Queue List */}
          {filesToUpload.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#241735]">
                <span>Files Selected ({filesToUpload.length})</span>
                <button
                  onClick={() => setFilesToUpload([])}
                  className="text-[#EC4899] hover:underline"
                  disabled={isProcessing}
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filesToUpload.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#FCFAFF] border border-[#E9DDF7] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#E9DDF7]"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-[#241735] truncate max-w-[200px] sm:max-w-xs">
                          {item.file.name}
                        </p>
                        <span className="text-[10px] text-[#A398AF]">
                          {formatBytes(item.file.size)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.status === "uploading" && (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-[#9333EA] animate-spin" />
                          <span className="text-xs text-[#9333EA] font-medium">{item.progress}%</span>
                        </div>
                      )}
                      {item.status === "success" && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Uploaded</span>
                        </div>
                      )}
                      {item.status === "duplicate" && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          <span>Already exists</span>
                        </div>
                      )}
                      {item.status === "error" && (
                        <div className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          <span>Error</span>
                        </div>
                      )}
                      {item.status === "queued" && (
                        <button
                          onClick={() => removeFileItem(item.id)}
                          className="p-1 text-[#A398AF] hover:text-rose-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Summary Feedback */}
          {uploadSummary && (
            <div className="p-4 rounded-2xl bg-[#F5EEFF] border border-[#E9DDF7] text-xs text-[#6D28D9] flex items-center justify-between">
              <div>
                <span className="font-bold">Batch Processing Complete:</span>{" "}
                {uploadSummary.succeeded} added, {uploadSummary.duplicates} skipped (duplicates), {uploadSummary.failed} errors.
              </div>
              <button
                onClick={handleClose}
                className="px-3 py-1 bg-[#9333EA] text-white rounded-lg font-semibold hover:bg-[#6D28D9]"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[#E9DDF7] bg-[#FCFAFF] flex items-center justify-between">
          <span className="text-xs text-[#7A6A88]">
            {isDemoMode
              ? "Running in Local Demo Mode (Browser IndexedDB Storage)"
              : "Connected to Supabase Storage Bucket"}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-[#7A6A88] hover:text-[#241735]"
            >
              Cancel
            </button>
            <button
              onClick={startUploadBatch}
              disabled={filesToUpload.length === 0 || isProcessing}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:brightness-105 active:scale-98 transition-all disabled:opacity-50 shadow-sm"
            >
              {isProcessing
                ? "Processing..."
                : `Upload ${filesToUpload.length} File${filesToUpload.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

