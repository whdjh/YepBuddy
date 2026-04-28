import { createClient } from "@supabase/supabase-js"
import Constants from "expo-constants"

type SupabaseConfig = {
  supabaseUrl?: string
  supabaseAnonKey?: string
}

const supabaseConfig = Constants.expoConfig?.extra as SupabaseConfig | undefined

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? supabaseConfig?.supabaseUrl
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? supabaseConfig?.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are required")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
