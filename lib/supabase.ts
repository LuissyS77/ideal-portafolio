import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// DEBUG: Verifica si las variables llegan al navegador
if (typeof window !== 'undefined') {
  console.log('--- DEBUG SUPABASE ---');
  console.log('URL cargada:', supabaseUrl ? 'SÍ (empieza con ' + supabaseUrl.substring(0, 10) + '...)' : 'NO');
  console.log('Anon Key cargada:', supabaseAnonKey ? 'SÍ' : 'NO');
  console.log('----------------------');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Supabase URL o Anon Key faltan en .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Tipado rápido para las tablas principales (puedes expandirlo luego)
 */
export type DbProduct = {
  id: number;
  name: string;
  category: string;
  category_label: string;
  price: number;
  description: string;
  image: string;
  badge: string | null;
  is_custom: boolean;
};

export type DbSale = {
  id: string;
  client_name: string;
  total: number;
  status: 'pending' | 'partial' | 'completed';
  created_at: string;
};
