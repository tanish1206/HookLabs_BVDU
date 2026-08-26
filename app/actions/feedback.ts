"use server";

import { getFeedbackStats } from "@/lib/supabase/feedback";
import type { FeedbackStats } from "@/lib/types";

export async function fetchFeedbackStatsAction(): Promise<FeedbackStats> {
  return getFeedbackStats();
}
