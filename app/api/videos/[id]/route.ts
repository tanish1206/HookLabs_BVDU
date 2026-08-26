// app/api/videos/[id]/route.ts
// DELETE /api/videos/[id] — deletes a user's own video (RLS-protected)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id); // belt-and-suspenders: RLS already enforces this

  if (error) {
    console.error("[api/videos/[id] DELETE]", error.message);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
