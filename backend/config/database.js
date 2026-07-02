import { supabase } from './supabase.js';

export const connectToDatabase = async () => {
  const { error } = await supabase.from('users').select('id').limit(1);

  if (error && error.code !== 'PGRST116') {
    const missingTable =
      error.code === '42P01' ||
      error.code === 'PGRST205' ||
      error.message?.includes('Could not find the table');

    if (missingTable) {
      throw new Error(
        'Supabase tables are missing. Run backend/supabase/schema.sql in the Supabase SQL Editor first.',
      );
    }

    throw new Error(`Failed to connect to Supabase: ${error.message}`);
  }

  console.log('Connected to Supabase');
};

export { supabase };
