"use client";

import { useEffect, useState } from "react";
import styles from "./AdminShell.module.css";
import shared from "./AdminShared.module.css";
import { crearClienteSupabase } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const supabase = crearClienteSupabase();
  const [conteos, setConteos] = useState({
    equipos: 0,
    categorias: 0,
    inscripcionesPendientes: 0,
    usuarios: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarConteos() {
      const [equipos, categorias, pendientes, usuarios] = await Promise.all([
        supabase.from("equipos").select("id", { count: "exact", head: true }),
        supabase.from("categorias").select("id", { count: "exact", head: true }),
        supabase
          .from("inscripciones")
          .select("id", { count: "exact", head: true })
          .eq("estado", "pendiente"),
        supabase.from("perfiles").select("id", { count: "exact", head: true }),
      ]);

      setConteos({
        equipos: equipos.count ?? 0,
        categorias: categorias.count ?? 0,
        inscripcionesPendientes: pendientes.count ?? 0,
        usuarios: usuarios.count ?? 0,
      });
      setCargando(false);
    }
    cargarConteos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.pageSubtitle}>Resumen general del torneo.</p>

      <div className={shared.statsGrid}>
        <div className={shared.statCard}>
          <div className={shared.statValue}>{cargando ? "—" : conteos.equipos}</div>
          <div className={shared.statLabel}>Equipos registrados</div>
        </div>
        <div className={shared.statCard}>
          <div className={shared.statValue}>{cargando ? "—" : conteos.categorias}</div>
          <div className={shared.statLabel}>Categorías activas</div>
        </div>
        <div className={shared.statCard}>
          <div className={shared.statValue}>{cargando ? "—" : conteos.inscripcionesPendientes}</div>
          <div className={shared.statLabel}>Inscripciones pendientes</div>
        </div>
        <div className={shared.statCard}>
          <div className={shared.statValue}>{cargando ? "—" : conteos.usuarios}</div>
          <div className={shared.statLabel}>Usuarios totales</div>
        </div>
      </div>

      {conteos.inscripcionesPendientes > 0 && (
        <div className={shared.panel}>
          <p className={shared.helpText}>
            Tienes {conteos.inscripcionesPendientes} inscripción(es) esperando
            aprobación. Ve a la sección <strong>Equipos</strong> para revisarlas.
          </p>
        </div>
      )}
    </>
  );
}
