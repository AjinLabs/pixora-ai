import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runFullOrganizationPipeline } from "@/lib/ai/organizer";
import { Photo } from "@/types";

const OrganizeRequestSchema = z.object({
  photos: z.array(
    z.object({
      id: z.string(),
      original_filename: z.string(),
      mime_type: z.string(),
      file_size: z.number(),
      width: z.number(),
      height: z.number(),
      content_hash: z.string().optional().default(""),
      storage_path: z.string(),
      thumbnail_path: z.string().optional().nullable(),
      ai_caption: z.string().optional().nullable(),
      ai_category: z.string().optional().nullable(),
      tags: z.array(z.string()).optional(),
      is_favorite: z.boolean().optional(),
      album_ids: z.array(z.string()).optional(),
      exif: z
        .object({
          camera: z.string().optional(),
          lens: z.string().optional(),
          iso: z.number().optional(),
          focalLength: z.string().optional(),
          aperture: z.string().optional(),
          location: z.string().optional(),
        })
        .optional(),
      uploaded_at: z.string().optional(),
      captured_at: z.string().optional().nullable(),
      processing_status: z.enum(["pending", "analyzed", "failed"]).optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OrganizeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { photos } = parsed.data;
    const hasGemini = Boolean(process.env.GEMINI_API_KEY);

    // Run the organization pipeline
    const proposal = await runFullOrganizationPipeline(photos as Photo[]);

    return NextResponse.json({
      success: true,
      provider: hasGemini ? "gemini" : "smart_heuristic_engine",
      proposal,
    });
  } catch (error: any) {
    console.error("AI organize error:", error);
    return NextResponse.json(
      { error: "Failed to process AI organization", message: error.message },
      { status: 500 }
    );
  }
}

