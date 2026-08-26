// app/api/videos/[id]/public/route.ts
// PATCH /api/videos/[id]/public — toggle is_public for gallery sharing

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { is_public: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { error } = await supabase
    .from("videos")
    .update({ is_public: body.is_public })
    .eq("id", params.id)
    .eq("user_id", user.id); // ensure ownership via belt-and-suspenders

  if (error) {
    console.error("[api/videos/[id]/public PATCH]", error.message);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ id: params.id, is_public: body.is_public });
}
