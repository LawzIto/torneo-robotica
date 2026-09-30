"use client";

// Recuperación de contraseña en dos pasos, en la misma página:
//   1. "pedir":  el usuario escribe su correo y Supabase le envía un enlace.
//   2. "nueva":  el enlace del correo vuelve aquí con ?paso=nueva&code=...
//                El cliente de Supabase canjea ese code por una sesión
//                temporal de recuperación, y con ella se guarda la nueva
//                contraseña.
// La URL de retorno debe estar permitida en Supabase:
// Authentication → URL Configuration → Redirect URLs.

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./RecuperarPage.module.css";
import { crearClienteSupabase } from "@/lib/supabase/client";

type Paso = "verificando" | "pedir" | "enviado" | "nueva" | "listo";

export default function RecuperarPage() {
  const [supabase] = useState(() => crearClienteSupabase());
  const [paso, setPaso] = useState<Paso>("verificando");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // getSession() espera a que el cliente termine de canjear el code
    // del enlace. Si no hay sesión, el enlace expiró, ya se usó, o se
    // abrió en otro navegador distinto al que pidió la recuperación.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const vieneDelEnlace =
        new URLSearchParams(window.location.search).get("paso") === "nueva";

      if (!vieneDelEnlace) {
        setPaso("pedir");
      } else if (session) {
        setPaso("nueva");
      } else {
        setError("El enlace no es válido o ya expiró. Pide uno nuevo.");
        setPaso("pedir");
      }
    });
  }, [supabase]);

  async function handlePedir(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar?paso=nueva`,
    });

    setCargando(false);

    if (error) {
      setError("No se pudo enviar el correo. Intenta de nuevo en unos minutos.");
      return;
    }

    // Por seguridad no se indica si el correo existe o no.
    setPaso("enviado");
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setCargando(false);
      setError(
        error.message.includes("different from the old")
          ? "La nueva contraseña debe ser distinta a la anterior."
          : "No se pudo guardar la contraseña. Pide un enlace nuevo."
      );
      return;
    }

    // Se cierra la sesión de recuperación para que entre con la nueva clave.
    await supabase.auth.signOut();
    setCargando(false);
    setPaso("listo");
  }

  return (
    <main className={styles.body}>
      <div className={styles.card}>
        <div className={styles.brandHeader}>
          <Image
            src="/logo-huellas.png"
            alt="Logo Huellas Industriales"
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
          />
          <span className={styles.brandTitle}>
            CIRI<span className={styles.brandUnderscore}>_</span>2026
          </span>
        </div>

        {paso === "verificando" && <p className={styles.text}>Verificando enlace...</p>}

        {paso === "pedir" && (
          <form className={styles.form} onSubmit={handlePedir}>
            <h2>Recuperar contraseña</h2>
            <p className={styles.text}>
              Escribe el correo de tu cuenta y te enviaremos un enlace para
              crear una contraseña nueva.
            </p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <span className={styles.error}>{error}</span>}
            <button type="submit" className={styles.button} disabled={cargando}>
              {cargando ? "ENVIANDO..." : "ENVIAR ENLACE"}
            </button>
          </form>
        )}

        {paso === "enviado" && (
          <div className={styles.form}>
            <h2>Revisa tu correo</h2>
            <p className={styles.text}>
              Si <strong>{email}</strong> tiene una cuenta, recibirás un enlace
              para restablecer tu contraseña. Ábrelo en este mismo navegador.
            </p>
          </div>
        )}

        {paso === "nueva" && (
          <form className={styles.form} onSubmit={handleGuardar}>
            <h2>Nueva contraseña</h2>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <input
              type="password"
              placeholder="Repite la contraseña"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              autoComplete="new-password"
              required
            />
            {error && <span className={styles.error}>{error}</span>}
            <button type="submit" className={styles.button} disabled={cargando}>
              {cargando ? "GUARDANDO..." : "GUARDAR"}
            </button>
          </form>
        )}

        {paso === "listo" && (
          <div className={styles.form}>
            <h2>¡Contraseña actualizada!</h2>
            <p className={styles.text}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <Link href="/login" className={styles.button}>
              INICIAR SESIÓN
            </Link>
          </div>
        )}

        {paso !== "listo" && (
          <Link href="/login" className={styles.back}>
            ← Volver a iniciar sesión
          </Link>
        )}
      </div>
    </main>
  );
}
