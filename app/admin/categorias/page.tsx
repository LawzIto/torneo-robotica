"use client";

import { useEffect, useState } from "react";
import styles from "../AdminShell.module.css";
import shared from "../AdminShared.module.css";
import { crearClienteSupabase } from "@/lib/supabase/client";

type Evento = { id: string; nombre: string };
type Categoria = {
  id: string;
  nombre: string;
  nivel_permitido: string | null;
  cupo_maximo: number | null;
  eventos: { nombre: string } | null;
};

export default function AdminCategoriasPage() {
  const supabase = crearClienteSupabase();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargarTodo() {
    const { data: eventosData } = await supabase.from("eventos").select("id, nombre");
    setEventos(eventosData ?? []);

    const { data: categoriasData } = await supabase
      .from("categorias")
      .select("id, nombre, nivel_permitido, cupo_maximo, eventos(nombre)");
    setCategorias((categoriasData as any) ?? []);

    setCargando(false);
  }

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function eliminarCategoria(id: string) {
    const confirmado = window.confirm(
      "¿Eliminar esta categoría? Esto borra también sus inscripciones y bracket asociados."
    );
    if (!confirmado) return;
    await supabase.from("categorias").delete().eq("id", id);
    cargarTodo();
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Categorías</h1>
      <p className={styles.pageSubtitle}>
        Define las categorías del torneo y su nivel permitido.
      </p>

      {!cargando && eventos.length === 0 ? (
        <FormularioCrearEvento supabase={supabase} onCreado={cargarTodo} />
      ) : (
        <>
          <div className={shared.panel}>
            <h2 className={shared.panelTitle}>Categorías existentes</h2>
            {cargando ? (
              <p className={shared.emptyState}>Cargando...</p>
            ) : categorias.length === 0 ? (
              <p className={shared.emptyState}>Todavía no hay categorías creadas.</p>
            ) : (
              <table className={shared.table}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Evento</th>
                    <th>Nivel permitido</th>
                    <th>Cupo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.nombre}</td>
                      <td>{cat.eventos?.nombre ?? "—"}</td>
                      <td>{cat.nivel_permitido ?? "—"}</td>
                      <td>{cat.cupo_maximo ?? "Sin límite"}</td>
                      <td>
                        <button className={shared.btnDanger} onClick={() => eliminarCategoria(cat.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <FormularioCrearCategoria eventos={eventos} supabase={supabase} onCreado={cargarTodo} />
        </>
      )}
    </>
  );
}

function FormularioCrearEvento({ supabase, onCreado }: any) {
  const [nombre, setNombre] = useState("");
  const [sede, setSede] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardando(true);

    const { error: errorSupabase } = await supabase.from("eventos").insert({
      nombre,
      sede,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    });

    setGuardando(false);

    if (errorSupabase) {
      setError("No se pudo crear el evento. Revisa que la fecha fin no sea anterior a la de inicio.");
      return;
    }

    onCreado();
  }

  return (
    <div className={shared.panel}>
      <h2 className={shared.panelTitle}>Primero crea el evento</h2>
      <p className={shared.helpText} style={{ marginBottom: 16 }}>
        Las categorías pertenecen a un evento (ej. "CIRI 2026"). Créalo antes
        de agregar categorías.
      </p>
      <form className={shared.formRow} onSubmit={handleCrear}>
        <span className={shared.label}>Nombre del evento</span>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <span className={shared.label}>Sede</span>
        <input value={sede} onChange={(e) => setSede(e.target.value)} />
        <span className={shared.label}>Fecha de inicio</span>
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
        <span className={shared.label}>Fecha de fin</span>
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
        {error && <span className={shared.error}>{error}</span>}
        <button className={shared.btnPrimary} disabled={guardando}>
          {guardando ? "Creando..." : "Crear evento"}
        </button>
      </form>
    </div>
  );
}

function FormularioCrearCategoria({ eventos, supabase, onCreado }: any) {
  const [nombre, setNombre] = useState("");
  const [eventoId, setEventoId] = useState(eventos[0]?.id ?? "");
  const [nivelPermitido, setNivelPermitido] = useState("");
  const [cupoMaximo, setCupoMaximo] = useState("");
  const [requisitos, setRequisitos] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardando(true);

    const { error: errorSupabase } = await supabase.from("categorias").insert({
      nombre,
      evento_id: eventoId,
      nivel_permitido: nivelPermitido || null,
      cupo_maximo: cupoMaximo ? Number(cupoMaximo) : null,
      requisitos: requisitos || null,
    });

    setGuardando(false);

    if (errorSupabase) {
      // El error más probable: ya existe una categoría con este
      // nombre en el mismo evento (UNIQUE(evento_id, nombre)).
      setError("No se pudo crear. ¿Ya existe una categoría con ese nombre en este evento?");
      return;
    }

    setNombre("");
    setNivelPermitido("");
    setCupoMaximo("");
    setRequisitos("");
    onCreado();
  }

  return (
    <div className={shared.panel}>
      <h2 className={shared.panelTitle}>Nueva categoría</h2>
      <form className={shared.formRow} onSubmit={handleCrear}>
        <span className={shared.label}>Nombre</span>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <span className={shared.label}>Evento</span>
        <select value={eventoId} onChange={(e) => setEventoId(e.target.value)} required>
          {eventos.map((ev: Evento) => (
            <option key={ev.id} value={ev.id}>{ev.nombre}</option>
          ))}
        </select>
        <span className={shared.label}>Nivel permitido</span>
        <input value={nivelPermitido} onChange={(e) => setNivelPermitido(e.target.value)} placeholder="Ej. universitario" />
        <span className={shared.label}>Cupo máximo (opcional)</span>
        <input type="number" value={cupoMaximo} onChange={(e) => setCupoMaximo(e.target.value)} />
        <span className={shared.label}>Requisitos (opcional)</span>
        <textarea rows={3} value={requisitos} onChange={(e) => setRequisitos(e.target.value)} />
        {error && <span className={shared.error}>{error}</span>}
        <button className={shared.btnPrimary} disabled={guardando}>
          {guardando ? "Creando..." : "Crear categoría"}
        </button>
      </form>
    </div>
  );
}
