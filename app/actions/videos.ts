"use server";

import { getUserVideos, deleteVideo } from "@/lib/supabase/videos";
import type { VideoRecord } from "@/lib/types";

export async function getUserVideosAction(): Promise<VideoRecord[]> {
  return getUserVideos();
}

export async function deleteVideoAction(id: string): Promise<void> {
  return deleteVideo(id);
}
