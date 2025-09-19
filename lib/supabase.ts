import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AppConfig {
  id: number
  key: string
  value: string
  description: string | null
  category: string
  created_at: string
  updated_at: string
}

export async function getAppConfig(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('app_config')
    .select('key, value')

  if (error) {
    console.error('Error fetching app config:', error)
    return {}
  }

  return data.reduce((acc, config) => {
    acc[config.key] = config.value
    return acc
  }, {} as Record<string, string>)
}

export async function updateAppConfig(key: string, value: string): Promise<boolean> {
  const { error } = await supabase
    .from('app_config')
    .update({ value })
    .eq('key', key)

  if (error) {
    console.error('Error updating app config:', error)
    return false
  }

  return true
}

export async function getAllAppConfigs(): Promise<AppConfig[]> {
  const { data, error } = await supabase
    .from('app_config')
    .select('*')
    .order('category', { ascending: true })
    .order('key', { ascending: true })

  if (error) {
    console.error('Error fetching all app configs:', error)
    return []
  }

  return data || []
}