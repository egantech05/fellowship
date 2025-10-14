import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cryklfbfsxleddzxipng.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyeWtsZmJmc3hsZWRkenhpcG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODIwMzgsImV4cCI6MjA3NTk1ODAzOH0.VjAND8nLjFalfmC1rVA60rrbv7TVfYMNfAjGYQpVJ54';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
