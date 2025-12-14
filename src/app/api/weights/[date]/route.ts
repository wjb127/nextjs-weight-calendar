import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ date: string }>;
}

// GET /api/weights/[date] - 특정 날짜 기록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { date } = await params;

  const { data, error } = await supabase
    .from("weight_records")
    .select("*")
    .eq("date", date)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(null, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/weights/[date] - 특정 날짜 기록 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { date } = await params;
  const body = await request.json();
  const { weight, memo } = body;

  if (weight === undefined) {
    return NextResponse.json({ error: "weight는 필수입니다" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("weight_records")
    .update({
      weight,
      memo: memo || null,
      updated_at: new Date().toISOString(),
    })
    .eq("date", date)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/weights/[date] - 특정 날짜 기록 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { date } = await params;

  const { error } = await supabase
    .from("weight_records")
    .delete()
    .eq("date", date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
