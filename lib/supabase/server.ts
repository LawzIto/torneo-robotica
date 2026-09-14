// Cliente de Supabase para el SERVIDOR (Server Components de Next.js).
// Lee y escribe las cookies de sesión a través del sistema de
// cookies de Next.js, para que el servidor sepa quién está
// autenticado sin depender de JavaScript en el navegador.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function crearClienteSupabaseServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se puede ignorar si esto se llama desde un Server Component
            // puro (sin capacidad de escribir cookies). El middleware sí
            // las refresca correctamente en cada petición.
          }
        },
      },
    }
  );
}
