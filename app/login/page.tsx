"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import styles from "./LoginPage.module.css";
import { crearClienteSupabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [toggled, setToggled] = useState(false);
  const router = useRouter();
  const supabase = crearClienteSupabase();

  // ── Estado del formulario de inicio de sesión ──
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginCargando, setLoginCargando] = useState(false);

  // ── Estado del formulario de registro ──
  const [signupNombre, setSignupNombre] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupCargando, setSignupCargando] = useState(false);
  const [signupExito, setSignupExito] = useState(false);

  // ────────────────────────────────────────────────
  // INICIAR SESIÓN
  // ────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginCargando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError("Correo o contraseña incorrectos.");
      setLoginCargando(false);
      return;
    }

    // Consultamos el rol para decidir a dónde redirigir.
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", data.user.id)
      .single();

    setLoginCargando(false);

    const rolesConPanelAdmin = ["admin", "organizador"];
    if (perfil && rolesConPanelAdmin.includes(perfil.rol)) {
      router.push("/admin");
    } else if (perfil && perfil.rol === "capitan") {
      router.push("/mi-equipo");
    } else {
      router.push("/mi-equipo");
    }
    router.refresh();
  }

  // ────────────────────────────────────────────────
  // REGISTRARSE
  // ────────────────────────────────────────────────
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError("");
    setSignupCargando(true);

    if (signupPassword.length < 8) {
      setSignupError("La contraseña debe tener al menos 8 caracteres.");
      setSignupCargando(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          nombre_completo: signupNombre,
        },
      },
    });

    setSignupCargando(false);

    if (error) {
      setSignupError(
        error.message.includes("already registered")
          ? "Este correo ya está registrado."
          : "No se pudo completar el registro. Intenta de nuevo."
      );
      return;
    }

    setSignupExito(true);
  }

  return (
    <>
      {/* Ionicons */}
      <Script
        type="module"
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
        strategy="afterInteractive"
      />
      <Script
        noModule
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"
        strategy="afterInteractive"
      />

      <main className={styles.body}>
        <div className={`${styles.container} ${toggled ? styles.toggle : ""}`}>

          {/* ── Sign In ── */}
          <div className={styles.containerForm}>
            <form className={styles.signIn} onSubmit={handleLogin}>
              <h2>Iniciar Sesión</h2>
              <div className={styles.socialNetworks}>
                {/* @ts-expect-error – ionicons custom element */}
                <ion-icon name="logo-tiktok" />
                {/* @ts-expect-error – ionicons custom element */}
                <ion-icon name="logo-instagram" />
              </div>
              <span>Use su correo y contraseña</span>

              <div className={styles.containerInput}>
                {/* @ts-expect-error */}
                <ion-icon name="mail-outline" />
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.containerInput}>
                {/* @ts-expect-error */}
                <ion-icon name="lock-closed-outline" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && (
                <span style={{ color: "#c0392b" }}>{loginError}</span>
              )}

              <a href="#">¿Olvidaste tu contraseña?</a>
              <button type="submit" className={styles.button} disabled={loginCargando}>
                {loginCargando ? "INGRESANDO..." : "INICIAR SESIÓN"}
              </button>
            </form>
          </div>

          {/* ── Sign Up ── */}
          <div className={styles.containerForm}>
            <form className={styles.signUp} onSubmit={handleSignup}>
              <h2>Registrarse</h2>
              <div className={styles.socialNetworks}>
                {/* @ts-expect-error */}
                <ion-icon name="logo-tiktok" />
                {/* @ts-expect-error */}
                <ion-icon name="logo-instagram" />
              </div>

              {signupExito ? (
                <span>
                  ¡Listo! Revisa tu correo para confirmar tu cuenta antes de
                  iniciar sesión.
                </span>
              ) : (
                <>
                  <span>Use su correo electrónico para registrarse</span>

                  <div className={styles.containerInput}>
                    {/* @ts-expect-error */}
                    <ion-icon name="person-outline" />
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={signupNombre}
                      onChange={(e) => setSignupNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.containerInput}>
                    {/* @ts-expect-error */}
                    <ion-icon name="mail-outline" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.containerInput}>
                    {/* @ts-expect-error */}
                    <ion-icon name="lock-closed-outline" />
                    <input
                      type="password"
                      placeholder="Contraseña"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>

                  {signupError && (
                    <span style={{ color: "#c0392b" }}>{signupError}</span>
                  )}

                  <button
                    type="submit"
                    className={styles.button}
                    disabled={signupCargando}
                  >
                    {signupCargando ? "REGISTRANDO..." : "REGISTRARSE"}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* ── Welcome panel ── */}
          <div className={styles.containerWelcome}>
            <div className={`${styles.welcome} ${styles.welcomeSignUp}`}>
              <h3>¡Bienvenido!</h3>
              <p>Ingrese sus datos para usar todas las funciones del sitio</p>
              <button className={styles.button} onClick={() => setToggled(true)}>
                Registrarse
              </button>
            </div>

            <div className={`${styles.welcome} ${styles.welcomeSignIn}`}>
              <h3>¡Hola!</h3>
              <p>Regístrese con sus datos para usar todas las funciones del sitio</p>
              <button className={styles.button} onClick={() => setToggled(false)}>
                Iniciar Sesión
              </button>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}