"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./AdminShell.module.css";
import { crearClienteSupabase } from "@/lib/supabase/client";

const ENLACES = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/equipos", label: "Equipos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = crearClienteSupabase();
  const pathname = usePathname();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    async function cargarPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      // El middleware ya bloqueó el acceso si no corresponde; esto
      // solo es para mostrar el rol en la interfaz sin otra consulta.
      if (!user) return;
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .single();
      setRol(perfil?.rol ?? null);
      setCargando(false);
    }
    cargarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          CIRI<span>_admin</span>
        </div>
        <ul className={styles.navList}>
          {ENLACES.map((enlace) => (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                className={`${styles.navLink} ${
                  pathname === enlace.href ? styles.navLinkActive : ""
                }`}
              >
                {enlace.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.sidebarFooter}>
          {!cargando && rol && <div className={styles.rolBadge}>{rol}</div>}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
