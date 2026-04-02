import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrutbesdmjoyosnubueq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydXRiZXNkbWpveW9zbnVidWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjg2NzYsImV4cCI6MjA5MDYwNDY3Nn0.mdQnlzh-sGQGLjimZQa2Z_HCLUHfPNyN5Rb9B4QW6iM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
