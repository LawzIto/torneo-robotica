"use client";

import { useState } from "react";
import Script from "next/script";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [toggled, setToggled] = useState(false);

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
            <form className={styles.signIn} onSubmit={(e) => e.preventDefault()}>
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
                <input type="text" placeholder="Email" />
              </div>
              <div className={styles.containerInput}>
                {/* @ts-expect-error */}
                <ion-icon name="lock-closed-outline" />
                <input type="password" placeholder="Contraseña" />
              </div>

              <a href="#">¿Olvidaste tu contraseña?</a>
              <button type="submit" className={styles.button}>
                INICIAR SESIÓN
              </button>
            </form>
          </div>

          {/* ── Sign Up ── */}
          <div className={styles.containerForm}>
            <form className={styles.signUp} onSubmit={(e) => e.preventDefault()}>
              <h2>Registrarse</h2>
              <div className={styles.socialNetworks}>
                {/* @ts-expect-error */}
                <ion-icon name="logo-tiktok" />
                {/* @ts-expect-error */}
                <ion-icon name="logo-instagram" />
              </div>
              <span>Use su correo electrónico para registrarse</span>

              <div className={styles.containerInput}>
                {/* @ts-expect-error */}
                <ion-icon name="business-outline" />
                <input type="text" placeholder="Institución" />
              </div>
              <div className={styles.containerInput}>
                {/* @ts-expect-error */}
                <ion-icon name="add-circle-outline" />
                <input type="text" placeholder="Rol" />
              </div>
              <div className={styles.containerInput}>
                {/* @ts-expect-error */}
                <ion-icon name="person-outline" />
                <input type="text" placeholder="Nombre" />
              </div>
              <div className={styles.containerInput}>
                {/* @ts-expect-error */}
                <ion-icon name="mail-outline" />
                <input type="text" placeholder="Email" />
              </div>
              <div className={styles.containerInput}>
                {/* @ts-expect-error */}
                <ion-icon name="lock-closed-outline" />
                <input type="password" placeholder="Contraseña" />
              </div>

              <button type="submit" className={styles.button}>
                REGISTRARSE
              </button>
            </form>
          </div>

          {/* ── Welcome panel ── */}
          <div className={styles.containerWelcome}>
            {/* shown when NOT toggled */}
            <div className={`${styles.welcome} ${styles.welcomeSignUp}`}>
              <h3>¡Bienvenido!</h3>
              <p>Ingrese sus datos para usar todas las funciones del sitio</p>
              <button className={styles.button} onClick={() => setToggled(true)}>
                Registrarse
              </button>
            </div>

            {/* shown when toggled */}
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
