"use client";

import MediaLibrary from "@/components/media/MediaLibrary";


export default function MediaPage() {
  return (
      <div className="space-y-6">
        <h1 className="text-2xl">Media Library</h1>
        <MediaLibrary />
      </div>
  );
}