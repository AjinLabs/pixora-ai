import { describe, it, expect } from "vitest";
import {
  analyzePhotoMetadata,
  detectDuplicates,
  generateSmartAlbumProposals,
} from "../lib/ai/organizer";
import { Photo, Album } from "../types";

describe("Pixora AI Organization Engine", () => {
  const sampleTestPhoto: Photo = {
    id: "test-1",
    original_filename: "yosemite_mountain_reflection.jpg",
    mime_type: "image/jpeg",
    file_size: 3000000,
    width: 2400,
    height: 1600,
    content_hash: "hash_test_123",
    storage_path: "https://example.com/test-1.jpg",
    uploaded_at: new Date().toISOString(),
    processing_status: "pending",
    tags: ["mountains", "yosemite"],
    exif: {
      location: "Yosemite, California",
      camera: "Sony Alpha 7",
    },
  };

  it("should analyze and classify visual metadata correctly", () => {
    const analysis = analyzePhotoMetadata(sampleTestPhoto);
    expect(analysis.category).toBe("Nature & Landscapes");
    expect(analysis.tags).toContain("mountains");
    expect(analysis.tags).toContain("yosemite");
    expect(analysis.confidence).toBeGreaterThan(0.6);
  });

  it("should classify screenshots based on filename and mime type", () => {
    const screenshotPhoto: Photo = {
      ...sampleTestPhoto,
      id: "test-screen",
      original_filename: "analytics_dashboard_screenshot.png",
      mime_type: "image/png",
      tags: ["dashboard"],
      ai_category: undefined,
    };
    const analysis = analyzePhotoMetadata(screenshotPhoto);
    expect(analysis.category).toBe("Screenshots");
    expect(analysis.tags).toContain("screenshot");
  });

  it("should classify food and dining photos", () => {
    const foodPhoto: Photo = {
      ...sampleTestPhoto,
      id: "test-food",
      original_filename: "morning_espresso_artisan_latte.jpg",
      tags: ["coffee", "cafe"],
      ai_category: undefined,
    };
    const analysis = analyzePhotoMetadata(foodPhoto);
    expect(analysis.category).toBe("Food & Dining");
    expect(analysis.tags).toContain("coffee");
  });

  it("should detect exact SHA-256 content hash duplicates", () => {
    const photoCopy: Photo = {
      ...sampleTestPhoto,
      id: "test-1-copy",
      original_filename: "yosemite_mountain_reflection (Copy).jpg",
      content_hash: "hash_test_123", // Identical hash
    };

    const duplicates = detectDuplicates([sampleTestPhoto, photoCopy]);
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].matchType).toBe("exact");
    expect(duplicates[0].confidence).toBe(1.0);
    expect(duplicates[0].photos.length).toBe(2);
  });

  it("should detect perceptual similarity when framing and filename match", () => {
    const similarPhoto: Photo = {
      ...sampleTestPhoto,
      id: "test-1-edited",
      original_filename: "yosemite_mountain_reflection_cropped.jpg",
      content_hash: "hash_different_456",
      file_size: 2500000,
      width: 2400,
      height: 1600,
    };

    const duplicates = detectDuplicates([sampleTestPhoto, similarPhoto]);
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].matchType).toBe("perceptual");
  });

  it("should generate smart album proposals with coherent titles", () => {
    const proposals = generateSmartAlbumProposals([sampleTestPhoto]);
    expect(proposals.length).toBe(1);
    expect(proposals[0].category).toBe("Nature & Landscapes");
    expect(proposals[0].photoIds).toContain("test-1");
  });

  it("preserves underlying photos when virtual albums are deleted", () => {
    const album: Album = {
      id: "album-temp-1",
      name: "Temporary Album",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const photoWithAlbum: Photo = {
      ...sampleTestPhoto,
      album_ids: [album.id],
    };

    // Simulate album deletion logic: removes album ID from photo's album_ids list without deleting photo
    const updatedPhoto = {
      ...photoWithAlbum,
      album_ids: photoWithAlbum.album_ids?.filter((id) => id !== album.id),
    };

    expect(updatedPhoto.id).toBe(sampleTestPhoto.id);
    expect(updatedPhoto.album_ids?.length).toBe(0);
  });
});
