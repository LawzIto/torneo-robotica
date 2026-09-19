"use client";

import { useEffect, useState } from "react";
import styles from "../AdminShell.module.css";
import shared from "../AdminShared.module.css";
import { crearClienteSupabase } from "@/lib/supabase/client";

type Perfil = {
  id: string;
  nombre_completo: string;
  rol: string;
  activo: boolean;
};

const ROLES = ["capitan", "juez", "organizador", "admin"];

export default function AdminUsuariosPage() {
  const supabase = crearClienteSupabase();
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [avisoPermiso, setAvisoPermiso] = useState(false);

  async function cargarPerfiles() {
    const { data } = await supabase
      .from("perfiles")
      .select("id, nombre_completo, rol, activo")
      .order("creado_en", { ascending: false });
    setPerfiles(data ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargarPerfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cambiarRol(id: string, nuevoRol: string) {
    const { data } = await supabase
      .from("perfiles")
      .update({ rol: nuevoRol })
      .eq("id", id)
      .select();

    // Si quien hace esto no es admin, la política RLS de Supabase
    // simplemente no deja pasar el UPDATE: no da error, pero
    // tampoco cambia nada. Por eso detectamos "0 filas afectadas"
    // para avisarle al usuario qué está pasando en vez de que
    // parezca que el botón no hace nada.
    if (!data || data.length === 0) {
      setAvisoPermiso(true);
      return;
    }

    cargarPerfiles();
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Usuarios</h1>
      <p className={styles.pageSubtitle}>
        Consulta los usuarios registrados y asigna roles. Solo un admin puede
        cambiar el rol de alguien.
      </p>

      {avisoPermiso && (
        <div className={shared.panel}>
          <span className={shared.error}>
            No se pudo cambiar el rol — tu cuenta no tiene permisos de admin
            para esta acción.
          </span>
        </div>
      )}

      <div className={shared.panel}>
        <h2 className={shared.panelTitle}>Todos los usuarios</h2>
        {cargando ? (
          <p className={shared.emptyState}>Cargando...</p>
        ) : perfiles.length === 0 ? (
          <p className={shared.emptyState}>No hay usuarios registrados todavía.</p>
        ) : (
          <table className={shared.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol actual</th>
                <th>Cambiar rol</th>
              </tr>
            </thead>
            <tbody>
              {perfiles.map((perfil) => (
                <tr key={perfil.id}>
                  <td>{perfil.nombre_completo}</td>
                  <td>
                    <span className={shared.badge} style={{ background: "#e8edf9", color: "#1453c1" }}>
                      {perfil.rol}
                    </span>
                  </td>
                  <td>
                    <select
                      defaultValue={perfil.rol}
                      onChange={(e) => cambiarRol(perfil.id, e.target.value)}
                      style={{
                        border: "1px solid var(--line-strong, #8a908e)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        fontSize: 13,
                      }}
                    >
                      {ROLES.map((rol) => (
                        <option key={rol} value={rol}>{rol}</option>
                      ))}
                    </select>
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
