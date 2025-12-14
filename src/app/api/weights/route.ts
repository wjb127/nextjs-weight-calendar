import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/weights - 전체 기록 조회 (year, month 쿼리로 필터링 가능)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  let query = supabase
    .from("weight_records")
    .select("*")
    .order("date", { ascending: false });

  if (year && month) {
    const startDate = `${year}-${month.padStart(2, "0")}-01`;
    const endDate = `${year}-${month.padStart(2, "0")}-31`;
    query = query.gte("date", startDate).lte("date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/weights - 새 기록 생성
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, weight, memo } = body;

  if (!date || weight === undefined) {
    return NextResponse.json(
      { error: "date와 weight는 필수입니다" },
      { status: 400 }
    );
  }

  // upsert를 사용하여 같은 날짜에 기록이 있으면 업데이트
  const { data, error } = await supabase
    .from("weight_records")
    .upsert(
      {
        date,
        weight,
        memo: memo || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "date" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
