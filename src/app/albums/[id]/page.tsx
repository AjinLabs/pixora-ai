import AlbumDetailClient from "./AlbumDetailClient";
import { SAMPLE_ALBUMS } from "@/lib/data/sample-photos";

export async function generateStaticParams() {
  return SAMPLE_ALBUMS.map((album) => ({
    id: album.id,
  }));
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AlbumDetailClient albumId={id} />;
}
