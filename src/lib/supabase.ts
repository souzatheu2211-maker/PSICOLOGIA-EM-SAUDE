import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwqurppvlgznpsxiyhdd.supabase.co';
const supabaseAnonKey = 'sb_publishable_yBVW7ryYBjK74UX8DRb7GQ_MpS8cd3e';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);