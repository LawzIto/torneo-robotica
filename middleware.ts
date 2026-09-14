// Middleware: se ejecuta ANTES de cargar cualquier página que
// coincida con el "matcher" de abajo. Aquí protegemos /admin/*
// verificando que haya sesión Y que el rol tenga permiso.

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
  // getSession() solo lee la cookie sin verificarla, lo cual es
  // más rápido pero inseguro para decisiones de acceso.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const esRutaAdmin = request.nextUrl.pathname.startsWith("/admin");

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
      // Tiene sesión pero no el rol correcto (ej. un capitán
      // intentando entrar a /admin) → lo mandamos al inicio,
      // no al login, porque sí está autenticado.
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
