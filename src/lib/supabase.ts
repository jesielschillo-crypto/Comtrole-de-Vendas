// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

const noopQueryBuilder = {
  upsert: async () => ({ data: null, error: null }),
  select: async () => ({ data: [], error: null }),
  insert: async () => ({ data: null, error: null }),
  update: async () => ({ data: null, error: null }),
  delete: async () => ({ data: null, error: null }),
};

const noopSupabaseClient = {
  from: () => noopQueryBuilder,
};

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

if (!isSupabaseConfigured()) {
  console.warn(
    'Supabase não configurado: as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram encontradas. O app continuará em modo local-only.',
  );
}

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (noopSupabaseClient as ReturnType<typeof createClient>);

export function getDynamicSupabaseClient() {
  return supabase;
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Configure o Supabase antes de usar o login com Google.') };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });

  return { error };
}

export async function getSupabaseSessionUser() {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
}

export async function sendPasswordResetEmail(email: string) {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Configure o Supabase para redefinir a senha por e-mail.') };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  return { error };
}