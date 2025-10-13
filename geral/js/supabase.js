import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// TODO: Replace with your Supabase project details
const supabaseUrl = 'https://brjtxgmvjpjovxsncild.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyanR4Z212anBqb3Z4c25jaWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NjU0MTQsImV4cCI6MjA3NTI0MTQxNH0.gzIhyCBS6GOi6xwZMrwVGWNsJ0SlMqhwEXaDIsRgiLw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
