import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdminInstance: SupabaseClient | null = null;

// 서버 사이드 전용 (API Routes) - service_role 키 사용, RLS 우회
export const getSupabaseAdmin = () => {
  if (supabaseAdminInstance) return supabaseAdminInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다");
  }

  supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey);
  return supabaseAdminInstance;
};

// API Route용 export
export const supabase = {
  from: (table: string) => getSupabaseAdmin().from(table),
};
