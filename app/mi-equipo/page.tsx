"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./MiEquipo.module.css";
import { crearClienteSupabase } from "@/lib/supabase/client";

// ────────────────────────────────────────────────────────────
// Tipos básicos. En un proyecto más maduro estos vivirían en
// un archivo compartido (ej. lib/types.ts) generado a partir
// del schema de Supabase, pero para este módulo los dejamos
// simples y explícitos.
// ────────────────────────────────────────────────────────────
type Equipo = {
  id: string;
  nombre_equipo: string;
  universidad: string;
  descripcion: string | null;
};

type Categoria = { id: string; nombre: string };

type Inscripcion = {
  id: string;
  categoria_id: string;
  estado: string;
  categorias: { nombre: string } | null;
};

type Participante = {
  id: string;
  nombre_completo: string;
  documento: string;
  rol_en_equipo: string | null;
};

type Robot = {
  id: string;
  inscripcion_id: string;
  nombre_robot: string;
  tipo_robot: string | null;
  peso_kg: number | null;
  dimensiones_cm: string | null;
};

type FormularioCrearEquipoProps = {
  usuarioId: string;
  supabase: ReturnType<typeof crearClienteSupabase>;
  onCreado: (nuevoEquipo: Equipo) => void;
};

export default function MiEquipoPage() {
  const supabase = crearClienteSupabase();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);

  // ── Cargar todo al entrar a la página ──
  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUsuarioId(user.id);

      const { data: equipoData } = await supabase
        .from("equipos")
        .select("id, nombre_equipo, universidad, descripcion")
        .eq("capitan_id", user.id)
        .maybeSingle();

      setEquipo(equipoData);

      const { data: categoriasData } = await supabase
        .from("categorias")
        .select("id, nombre");
      setCategorias(categoriasData ?? []);

      if (equipoData) {
        await cargarDatosDelEquipo(equipoData.id);
      }

      setCargando(false);
    }

    async function cargarDatosDelEquipo(equipoId: string) {
      const { data: inscripcionesData } = await supabase
        .from("inscripciones")
        .select("id, categoria_id, estado, categorias(nombre)")
        .eq("equipo_id", equipoId);
      setInscripciones((inscripcionesData as any) ?? []);

      const { data: participantesData } = await supabase
        .from("participantes")
        .select("id, nombre_completo, documento, rol_en_equipo")
        .eq("equipo_id", equipoId);
      setParticipantes(participantesData ?? []);

      const idsInscripciones = (inscripcionesData ?? []).map((i) => i.id);
      if (idsInscripciones.length > 0) {
        const { data: robotsData } = await supabase
          .from("robots")
          .select("id, inscripcion_id, nombre_robot, tipo_robot, peso_kg, dimensiones_cm")
          .in("inscripcion_id", idsInscripciones);
        setRobots(robotsData ?? []);
      }
    }

    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function recargarEquipo() {
    if (!equipo) return;
    setCargando(true);
    const { data: inscripcionesData } = await supabase
      .from("inscripciones")
      .select("id, categoria_id, estado, categorias(nombre)")
      .eq("equipo_id", equipo.id);
    setInscripciones((inscripcionesData as any) ?? []);

    const { data: participantesData } = await supabase
      .from("participantes")
      .select("id, nombre_completo, documento, rol_en_equipo")
      .eq("equipo_id", equipo.id);
    setParticipantes(participantesData ?? []);

    const idsInscripciones = (inscripcionesData ?? []).map((i) => i.id);
    const { data: robotsData } = await supabase
      .from("robots")
      .select("id, inscripcion_id, nombre_robot, tipo_robot, peso_kg, dimensiones_cm")
      .in("inscripcion_id", idsInscripciones.length > 0 ? idsInscripciones : [""]);
    setRobots(robotsData ?? []);
    setCargando(false);
  }

  if (cargando) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.subtitle}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Panel del capitán</span>
          <h1 className={styles.title}>Mi equipo</h1>
        </div>

       {!equipo ? (
        <FormularioCrearEquipo
          usuarioId={usuarioId!}
          supabase={supabase}
          onCreado={setEquipo}
          />
        ) : (
          <>
            <PanelEquipo equipo={equipo} />
            <PanelInscripciones
              equipo={equipo}
              categorias={categorias}
              inscripciones={inscripciones}
              supabase={supabase}
              onCambio={recargarEquipo}
            />
            <PanelParticipantes
              equipo={equipo}
              participantes={participantes}
              supabase={supabase}
              onCambio={recargarEquipo}
            />
            <PanelRobots
              inscripciones={inscripciones}
              robots={robots}
              supabase={supabase}
              onCambio={recargarEquipo}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Crear equipo (primera vez que el capitán entra)
// ════════════════════════════════════════════════════════════
function FormularioCrearEquipo({ usuarioId, supabase, onCreado }: FormularioCrearEquipoProps) {
  const [nombre, setNombre] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardando(true);

    const { data, error: errorSupabase } = await supabase
      .from("equipos")
      .insert({
        nombre_equipo: nombre,
        universidad,
        descripcion,
        capitan_id: usuarioId,
      })
      .select()
      .single();

    setGuardando(false);

    if (errorSupabase) {
      setError("No se pudo crear el equipo. Intenta de nuevo.");
      return;
    }

    onCreado(data);
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Todavía no tienes un equipo</h2>
      <p className={styles.subtitle} style={{ marginBottom: 20 }}>
        Créalo para poder inscribirlo en categorías, agregar participantes y
        subir la ficha técnica de tu robot.
      </p>
      <form className={styles.formRow} onSubmit={handleCrear}>
        <span className={styles.label}>Nombre del equipo</span>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <span className={styles.label}>Universidad o institución</span>
        <input value={universidad} onChange={(e) => setUniversidad(e.target.value)} required />
        <span className={styles.label}>Descripción (opcional)</span>
        <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        {error && <span className={styles.error}>{error}</span>}
        <button className={styles.btnPrimary} disabled={guardando}>
          {guardando ? "Creando..." : "Crear equipo"}
        </button>
      </form>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Datos generales del equipo (solo lectura por ahora)
// ════════════════════════════════════════════════════════════
function PanelEquipo({ equipo }: { equipo: Equipo }) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>{equipo.nombre_equipo}</h2>
      <p className={styles.subtitle}>{equipo.universidad}</p>
      {equipo.descripcion && <p className={styles.subtitle}>{equipo.descripcion}</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Inscripciones en categorías
// ════════════════════════════════════════════════════════════
function PanelInscripciones({ equipo, categorias, inscripciones, supabase, onCambio }: any) {
  const [categoriaId, setCategoriaId] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // 1. Filtrar la categoría "Innovación Libre" del menú desplegable
  const categoriasPermitidas = categorias.filter((cat: any) => {
    const nombreLimpio = cat.nombre.toLowerCase().trim();
    return nombreLimpio !== "innovación libre" && nombreLimpio !== "innovacion libre";
  });

  // 2. Excluir categorías en las que el equipo ya está inscrito para no duplicar en el selector
  const categoriasDisponibles = categoriasPermitidas.filter((cat: any) => {
    return !inscripciones.some((ins: any) => ins.categoria_id === cat.id);
  });

  async function handleInscribir(e: React.FormEvent) {
    e.preventDefault();
    if (!categoriaId) return;

    setGuardando(true);
    setError("");

    const { error: errorSupabase } = await supabase
      .from("inscripciones")
      .insert({
        equipo_id: equipo.id,
        categoria_id: categoriaId,
      });

    setGuardando(false);

    if (errorSupabase) {
      console.error("Error al inscribir categoría:", errorSupabase);
      setError("No se pudo realizar la inscripción en esta categoría.");
      return;
    }

    setCategoriaId("");
    onCambio();
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Categorías Inscritas</h2>

      {/* Lista de categorías a las que ya está inscrito el equipo */}
      <div style={{ marginBottom: 20 }}>
        {inscripciones.length === 0 ? (
          <p className={styles.emptyState}>Tu equipo aún no se ha inscrito en ninguna categoría.</p>
        ) : (
          inscripciones.map((ins: any) => (
            <div key={ins.id} className={styles.listItem}>
              <div>
                <div className={styles.listItemName}>
                  {ins.categorias?.nombre}
                </div>
                <div className={styles.listItemMeta}>
                  {ins.categorias?.descripcion}
                </div>
              </div>
              <span className={styles.badge}>Inscrito</span>
            </div>
          ))
        )}
      </div>

      {/* Formulario para agregar nuevas categorías (solo si quedan disponibles) */}
      {categoriasDisponibles.length > 0 ? (
        <form onSubmit={handleInscribir} className={styles.formRow}>
          <span className={styles.label}>Inscribir nueva categoría</span>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            <option value=""> Selecciona una categoría </option>
            {categoriasDisponibles.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btnPrimary} disabled={guardando}>
            {guardando ? "Inscribiendo..." : "Inscribir Categoría"}
          </button>
        </form>
      ) : (
        <p className={styles.emptyState} style={{ color: "var(--text-muted)" }}>
          Ya has registrado tu equipo en todas las categorías de competición disponibles.
        </p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Participantes
// ════════════════════════════════════════════════════════════
function PanelParticipantes({ equipo, participantes, supabase, onCambio }: any) {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [documento, setDocumento] = useState("");
  const [rolEnEquipo, setRolEnEquipo] = useState("");
  
  // Estado para controlar la edición
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDocumento, setEditDocumento] = useState("");
  const [editRol, setEditRol] = useState("");

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const limiteAlcanzado = participantes.length >= 4;

  // Manejadores con Validaciones (RegEx)
  const validarNombre = (val: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(val);
  const validarDocumento = (val: string) => /^[0-9]*$/.test(val);

  // Iniciar modo edición
  function IniciarEdicion(p: any) {
    setEditandoId(p.id);
    setEditNombre(p.nombre_completo);
    setEditDocumento(p.documento);
    setEditRol(p.rol_en_equipo || "");
    setError("");
  }

  // Guardar Cambios de Edición
  async function handleGuardarEdicion(id: string) {
    if (!editNombre.trim() || !editDocumento.trim()) {
      setError("Nombre y documento son obligatorios.");
      return;
    }

    setGuardando(true);
    setError("");

    const { error: errorSupabase } = await supabase
      .from("participantes")
      .update({
        nombre_completo: editNombre.trim(),
        documento: editDocumento.trim(),
        rol_en_equipo: editRol.trim() || "Integrante",
      })
      .eq("id", id);

    setGuardando(false);

    if (errorSupabase) {
      setError("No se pudieron guardar los cambios.");
      return;
    }

    setEditandoId(null);
    onCambio();
  }

  // Agregar nuevo participante
  async function handleAgregar(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (limiteAlcanzado) {
      setError("Límite máximo de 3 participantes alcanzado.");
      return;
    }

    setGuardando(true);

    const { error: errorSupabase } = await supabase.from("participantes").insert({
      equipo_id: equipo.id,
      nombre_completo: nombreCompleto.trim(),
      documento: documento.trim(),
      rol_en_equipo: rolEnEquipo.trim() || "Integrante",
    });

    setGuardando(false);

    if (errorSupabase) {
      setError("No se pudo agregar. Verifica si el documento ya existe.");
      return;
    }

    setNombreCompleto("");
    setDocumento("");
    setRolEnEquipo("");
    onCambio();
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>
        Participantes ({participantes.length}/4)
      </h2>

      <div style={{ marginBottom: 20 }}>
        {participantes.map((p: any) => (
          <div key={p.id} className={styles.listItem} style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
            {editandoId === p.id ? (
              /* Modo Edición En Línea */
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => validarNombre(e.target.value) && setEditNombre(e.target.value)}
                  placeholder="Nombre completo"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={editDocumento}
                  onChange={(e) => validarDocumento(e.target.value) && setEditDocumento(e.target.value)}
                  placeholder="Documento"
                />
                <input
                  type="text"
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                  placeholder="Rol (Ej. Piloto)"
                />
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button 
                    type="button" 
                    className={styles.btnPrimary} 
                    onClick={() => handleGuardarEdicion(p.id)}
                    disabled={guardando}
                  >
                    {guardando ? "Guardando..." : "Guardar"}
                  </button>
                  <button 
                    type="button" 
                    style={{ background: "#ccc", border: "none", borderRadius: 6, padding: "8px 12px", cursor: "pointer" }}
                    onClick={() => setEditandoId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Vista Normal de Lectura */
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className={styles.listItemName}>{p.nombre_completo}</div>
                  <div className={styles.listItemMeta}>
                    {p.rol_en_equipo ?? "Integrante"} · Doc. {p.documento}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {p.rol_en_equipo === "Capitán" && (
                    <span className={styles.badge}>Capitán</span>
                  )}
                  <button
                    type="button"
                    style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}
                    onClick={() => IniciarEdicion(p)}
                  >
                    ✏️ Editar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className={styles.error} style={{ marginBottom: 10 }}>{error}</p>}

      {/* Formulario de Agregar (Solo si no ha superado el límite) */}
      {!limiteAlcanzado && (
        <form className={styles.formRow} onSubmit={handleAgregar}>
          <span className={styles.label}>Nombre completo</span>
          <input 
            type="text"
            value={nombreCompleto} 
            onChange={(e) => validarNombre(e.target.value) && setNombreCompleto(e.target.value)} 
            placeholder="Ej. Juan Pérez"
            required 
          />

          <span className={styles.label}>Documento de identidad</span>
          <input 
            type="text"
            inputMode="numeric"
            value={documento} 
            onChange={(e) => validarDocumento(e.target.value) && setDocumento(e.target.value)} 
            placeholder="Ej. 1065123456"
            required 
          />

          <span className={styles.label}>Rol en el equipo (opcional)</span>
          <input 
            type="text"
            value={rolEnEquipo} 
            onChange={(e) => setRolEnEquipo(e.target.value)} 
            placeholder="Ej. Piloto / Programador" 
          />

          <button className={styles.btnPrimary} disabled={guardando}>
            {guardando ? "Agregando..." : "Agregar participante"}
          </button>
        </form>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Ficha técnica del robot (una por inscripción)
// ════════════════════════════════════════════════════════════
function PanelRobots({ inscripciones, robots, supabase, onCambio }: any) {
  const [inscripcionId, setInscripcionId] = useState("");
  const [nombreRobot, setNombreRobot] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Excluir "Innovación Libre"
  const inscripcionesRequierenFicha = inscripciones.filter((ins: any) => {
    const nombreCat = ins.categorias?.nombre?.toLowerCase().trim() || "";
    return nombreCat !== "innovación libre" && nombreCat !== "innovacion libre";
  });

  const inscripcionSeleccionada = inscripcionesRequierenFicha.find((i: any) => i.id === inscripcionId);
  const esSumo = inscripcionSeleccionada?.categorias?.nombre?.toLowerCase().includes("sumo");

  async function handleGuardarRobot(e: React.FormEvent) {
    e.preventDefault();
    if (!inscripcionId) return;

    setGuardando(true);
    setError("");
    let fotoUrlPublica = null;

    // ── 1. Subir la imagen a Supabase Storage (si seleccionó archivo) ──
    if (archivoFoto) {
      const fileExt = archivoFoto.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `fotos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('robots')
        .upload(filePath, archivoFoto);

      if (uploadError) {
        setError("Error al subir la imagen del robot.");
        setGuardando(false);
        return;
      }

      // Obtener la URL pública del archivo subido
      const { data } = supabase.storage.from('robots').getPublicUrl(filePath);
      fotoUrlPublica = data.publicUrl;
    }

    // ── 2. Guardar el robot en la base de datos ──
    const { error: dbError } = await supabase.from("robots").insert({
      inscripcion_id: inscripcionId,
      nombre_robot: nombreRobot.trim(),
      peso_kg: esSumo && pesoKg ? parseFloat(pesoKg) : null,
      descripcion_tecnica: descripcion.trim() || null,
      foto_url: fotoUrlPublica, // Guardamos la URL de la foto subida
    });

    setGuardando(false);

    if (dbError) {
      setError("No se pudo registrar la ficha técnica del robot.");
      return;
    }

    // Limpiar formulario
    setInscripcionId("");
    setNombreRobot("");
    setPesoKg("");
    setDescripcion("");
    setArchivoFoto(null);
    onCambio();
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Ficha Técnica de Robots</h2>

      {inscripcionesRequierenFicha.length === 0 ? (
        <p className={styles.emptyState}>
          No tienes inscripciones pendientes que requieran registro de ficha técnica.
        </p>
      ) : (
        <form className={styles.formRow} onSubmit={handleGuardarRobot}>
          <span className={styles.label}>Seleccionar Inscripción</span>
          <select value={inscripcionId} onChange={(e) => setInscripcionId(e.target.value)} required>
            <option value=""> Elige una categoría </option>
            {inscripcionesRequierenFicha.map((i: any) => (
              <option key={i.id} value={i.id}>
                {i.categorias?.nombre}
              </option>
            ))}
          </select>

          <span className={styles.label}>Nombre del Robot</span>
          <input 
            value={nombreRobot} 
            onChange={(e) => setNombreRobot(e.target.value)} 
            placeholder="Ej. Titán V2" 
            required 
          />

          {esSumo ? (
            <>
              <span className={styles.label}>Peso del Robot (kg)</span>
              <input 
                type="number" 
                step="0.01" 
                placeholder="Ej. 1.5" 
                value={pesoKg} 
                onChange={(e) => setPesoKg(e.target.value)} 
                required 
              />
            </>
          ) : (
            <>
              <span className={styles.label}>Descripción Breve</span>
              <textarea 
                rows={3} 
                placeholder="Detalles o especificaciones del robot..." 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
              />
            </>
          )}

          {/* Campo para subir la foto desde los archivos del equipo/teléfono */}
          <span className={styles.label}>Foto del Robot (JPG, PNG)</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setArchivoFoto(e.target.files?.[0] || null)} 
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btnPrimary} disabled={guardando}>
            {guardando ? "Subiendo foto y guardando..." : "Registrar Robot"}
          </button>
        </form>
      )}
    </div>
  );
}

function FormularioRobot({ inscripcion, robot, supabase, onCambio }: any) {
  const [nombreRobot, setNombreRobot] = useState(robot?.nombre_robot ?? "");
  const [tipoRobot, setTipoRobot] = useState(robot?.tipo_robot ?? "");
  const [pesoKg, setPesoKg] = useState(robot?.peso_kg ?? "");
  const [dimensiones, setDimensiones] = useState(robot?.dimensiones_cm ?? "");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardando(true);

    const payload = {
      inscripcion_id: inscripcion.id,
      nombre_robot: nombreRobot,
      tipo_robot: tipoRobot || null,
      peso_kg: pesoKg ? Number(pesoKg) : null,
      dimensiones_cm: dimensiones || null,
    };

    // upsert: si ya existe una ficha para esta inscripción, la
    // actualiza; si no, la crea. Evita tener que manejar dos
    // formularios distintos (crear vs editar).
    const { error: errorSupabase } = await supabase
      .from("robots")
      .upsert(payload, { onConflict: "inscripcion_id" });

    setGuardando(false);

    if (errorSupabase) {
      setError("No se pudo guardar la ficha técnica.");
      return;
    }

    onCambio();
  }

  return (
    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
      <p className={styles.listItemMeta} style={{ marginBottom: 12 }}>
        Categoría: {inscripcion.categorias?.nombre ?? "—"}
      </p>
      <form className={styles.formRow} onSubmit={handleGuardar}>
        <span className={styles.label}>Nombre del robot</span>
        <input value={nombreRobot} onChange={(e) => setNombreRobot(e.target.value)} required />
        <span className={styles.label}>Tipo de robot</span>
        <input value={tipoRobot} onChange={(e) => setTipoRobot(e.target.value)} placeholder="Ej. autónomo" />
        <span className={styles.label}>Peso (kg)</span>
        <input type="number" step="0.01" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} />
        <span className={styles.label}>Dimensiones (cm)</span>
        <input value={dimensiones} onChange={(e) => setDimensiones(e.target.value)} placeholder="Ej. 30x30x20" />
        {error && <span className={styles.error}>{error}</span>}
        <button className={styles.btnPrimary} disabled={guardando}>
          {guardando ? "Guardando..." : robot ? "Actualizar ficha" : "Guardar ficha"}
        </button>
        <p className={styles.pendingNote}>
          Subida de foto y PDF: pendiente (módulo de Supabase Storage)
        </p>
      </form>
    </div>
  );
}
