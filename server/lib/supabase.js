import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.SUPABASE_URL
const supabaseKey     = process.env.SUPABASE_SERVICE_ROLE_KEY  // Service role = admin rights

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants dans .env')
}

export const supabase = createClient(
  supabaseUrl     || 'https://placeholder.supabase.co',
  supabaseKey     || 'placeholder',
  { auth: { persistSession: false } }
)
