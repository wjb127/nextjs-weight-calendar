import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/settings - 설정 조회
export async function GET() {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    // 설정이 없으면 기본값 반환
    if (error.code === "PGRST116") {
      return NextResponse.json({
        id: 1,
        target_weight: null,
        height: null,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/settings - 설정 수정
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { target_weight, height } = body;

  const { data, error } = await supabase
    .from("settings")
    .upsert(
      {
        id: 1,
        target_weight,
        height,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
