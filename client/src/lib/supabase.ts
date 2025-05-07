import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and Key from environment variables
// Usando import.meta.env em vez de process.env para Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

// Log para debug (remover em produção)
console.log('Inicializando cliente Supabase com URL:', supabaseUrl ? 'URL definida' : 'URL não definida');

if (!supabaseUrl || !supabaseKey) {
  console.error('AVISO: VITE_SUPABASE_URL e VITE_SUPABASE_KEY devem estar definidos nas variáveis de ambiente');
}

// Create Supabase client with options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth functions
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { 
    user: data?.session?.user || null,
    error
  };
};

// Storage functions
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    
  return { data, error };
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return data.publicUrl;
};

export const getAuthenticatedUrl = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60); // 1 hour
    
  return { url: data?.signedUrl, error };
};
