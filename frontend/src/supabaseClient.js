import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.REACT_APP_SUPABASE_URL ||
  'https://rmfzydycexyuhqskklgu.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_Q9yJIk54WyB4jsiBOx2OWQ_ie1YTWBt';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
