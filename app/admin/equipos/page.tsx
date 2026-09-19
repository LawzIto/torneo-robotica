"use client";

import { useEffect, useState } from "react";
import styles from "../AdminShell.module.css";
import shared from "../AdminShared.module.css";
import { crearClienteSupabase } from "@/lib/supabase/client";

type Inscripcion = {
  id: string;
  estado: string;
  categorias: { nombre: string } | null;
};

type Equipo = {
  id: string;
  nombre_equipo: string;
  universidad: string;
  perfiles: { nombre_completo: string } | null;
  inscripciones: Inscripcion[];
};

const CLASE_BADGE: Record<string, string> = {
  pendiente: "badgePendiente",
  aprobada: "badgeAprobada",
  rechazada: "badgeRechazada",
};

export default function AdminEquiposPage() {
  const supabase = crearClienteSupabase();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargarEquipos() {
    const { data } = await supabase
      .from("equipos")
      .select(
        "id, nombre_equipo, universidad, perfiles(nombre_completo), inscripciones(id, estado, categorias(nombre))"
      )
      .order("creado_en", { ascending: false });
    setEquipos((data as any) ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargarEquipos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cambiarEstadoInscripcion(inscripcionId: string, nuevoEstado: string) {
    await supabase
      .from("inscripciones")
      .update({ estado: nuevoEstado })
      .eq("id", inscripcionId);
    cargarEquipos();
  }

  async function eliminarEquipo(equipoId: string, nombre: string) {
    // Confirmación simple en el navegador. Para un panel más pulido
    // se reemplazaría por un modal propio, pero esto es funcional
    // y evita borrados accidentales con un solo clic.
    const confirmado = window.confirm(
      `¿Eliminar el equipo "${nombre}"? Esto borra también sus inscripciones, participantes y robots asociados.`
    );
    if (!confirmado) return;

    await supabase.from("equipos").delete().eq("id", equipoId);
    cargarEquipos();
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Equipos</h1>
      <p className={styles.pageSubtitle}>
        Revisa inscripciones pendientes y administra los equipos registrados.
      </p>

      <div className={shared.panel}>
        <h2 className={shared.panelTitle}>Listado de equipos</h2>

        {cargando ? (
          <p className={shared.emptyState}>Cargando...</p>
        ) : equipos.length === 0 ? (
          <p className={shared.emptyState}>Todavía no hay equipos registrados.</p>
        ) : (
          <table className={shared.table}>
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Universidad</th>
                <th>Capitán</th>
                <th>Categorías inscritas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((equipo) => (
                <tr key={equipo.id}>
                  <td>{equipo.nombre_equipo}</td>
                  <td>{equipo.universidad}</td>
                  <td>{equipo.perfiles?.nombre_completo ?? "—"}</td>
                  <td>
                    {equipo.inscripciones.length === 0 ? (
                      <span className={shared.helpText}>Ninguna</span>
                    ) : (
                      equipo.inscripciones.map((insc) => (
                        <div key={insc.id} style={{ marginBottom: 6 }}>
                          <span
                            className={`${shared.badge} ${
                              shared[CLASE_BADGE[insc.estado] ?? "badgePendiente"]
                            }`}
                            style={{ marginRight: 8 }}
                          >
                            {insc.categorias?.nombre ?? "Categoría"} · {insc.estado}
                          </span>
                          {insc.estado === "pendiente" && (
                            <>
                              <button
                                className={shared.btnGhost}
                                onClick={() => cambiarEstadoInscripcion(insc.id, "aprobada")}
                              >
                                Aprobar
                              </button>
                              <button
                                className={shared.btnGhost}
                                onClick={() => cambiarEstadoInscripcion(insc.id, "rechazada")}
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </td>
                  <td>
                    <button
                      className={shared.btnDanger}
                      onClick={() => eliminarEquipo(equipo.id, equipo.nombre_equipo)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
