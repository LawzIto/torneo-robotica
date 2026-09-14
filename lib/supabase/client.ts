// Cliente de Supabase para el NAVEGADOR (componentes "use client")
// Usa la clave pública (anon/publishable key) — es segura de exponer en el
// frontend porque el RLS de PostgreSQL es quien realmente protege
// los datos, no esta clave.

import { createBrowserClient } from "@supabase/ssr";

export function crearClienteSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
