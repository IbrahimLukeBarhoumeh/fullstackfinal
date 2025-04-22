import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cmuvqrwfldpazxoxngmy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdXZxcndmbGRwYXp4b3huZ215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjQ2OTMsImV4cCI6MjA2MDg0MDY5M30.R-dmi5OGoCY211cfM_I7JU-asCr5qOJFkiRymqTSX04'

export const supabase = createClient(supabaseUrl, supabaseKey)
