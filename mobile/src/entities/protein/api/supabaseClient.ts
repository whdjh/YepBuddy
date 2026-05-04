import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import Constants from "expo-constants"

type SupabaseConfig = {
  supabaseUrl?: string
  supabaseAnonKey?: string
}

const supabaseConfig = Constants.expoConfig?.extra as SupabaseConfig | undefined

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? supabaseConfig?.supabaseUrl
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? supabaseConfig?.supabaseAnonKey

let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient() {
  // 환경변수가 빠져도 앱 시작 시점에는 크래시하지 않고, 프로틴 데이터 요청 시점에만 에러 발생
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Protein price data is unavailable because Supabase is not configured.",
    )
  }

  // 같은 Supabase 클라이언트를 재사용해 화면 이동마다 새 연결을 만들지X
  supabaseClient ??= createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}
