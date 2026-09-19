// Middleware: se ejecuta ANTES de cargar cualquier página que
// coincida con el "matcher" de abajo.
//   /admin/*      → exige sesión Y rol admin/organizador
//   /mi-equipo/*  → exige sesión (cualquier rol)

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: usar getUser() y no getSession(). getUser() valida
  // el token contra el servidor de Supabase en cada petición;
  // getSession() solo lee la cookie sin verificarla.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const esRutaAdmin = request.nextUrl.pathname.startsWith("/admin");
  const esRutaMiEquipo = request.nextUrl.pathname.startsWith("/mi-equipo");

  if (esRutaAdmin) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    const rolesConAccesoAdmin = ["admin", "organizador"];

    if (!perfil || !rolesConAccesoAdmin.includes(perfil.rol)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (esRutaMiEquipo && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/mi-equipo/:path*"],
};
