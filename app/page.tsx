"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; // 👈 Importamos el componente Image de Next.js
import styles from "./HomePage.module.css";

// ────────────────────────────────────────────────────────────
// COMPONENTES DE ANIMACIÓN
// ────────────────────────────────────────────────────────────

function NumberCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      if (progress < 1) {
        setCount(Math.floor(Math.random() * (target * 3 + 10)));
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return <span>{count}</span>;
}

function DecipherTitle({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 40);

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
}

// ────────────────────────────────────────────────────────────
// DATOS DE EJEMPLO
// ────────────────────────────────────────────────────────────

const CATEGORIAS = [
  {
    nombre: "Sumo RC",
    nivel: "Universitario",
    descripcion:
      "Robots que detectan y empujan a su oponente fuera del área, con control remoto durante el combate.",
  },
  {
    nombre: "Line Follower",
    nivel: "Universitario",
    descripcion:
      "Velocidad y precisión siguiendo una ruta marcada. Gana quien complete el circuito en menor tiempo.",
  },
  {
    nombre: "Innovación Libre",
    nivel: "Abierta",
    descripcion:
      "Proyectos que resuelven un problema real con robótica. Se evalúa impacto, no solo desempeño en pista.",
  },
];

const CRONOGRAMA = [
  {
    fecha: "Por definir",
    titulo: "Apertura de inscripciones",
    detalle: "Equipos registran su universidad, participantes y ficha técnica del robot.",
  },
  {
    fecha: "Por definir",
    titulo: "Cierre de inscripciones",
    detalle: "Última fecha para inscribirse y para modificar la ficha técnica del robot.",
  },
  {
    fecha: "Por definir",
    titulo: "Inspección técnica",
    detalle: "Verificación de que cada robot cumple el reglamento de su categoría.",
  },
  {
    fecha: "Por definir",
    titulo: "Día del certamen",
    detalle: "Eliminatorias, semifinales y final. Resultados y bracket en vivo en esta misma página.",
  },
];

const FAQS = [
  {
    pregunta: "¿Puede un equipo competir en más de una categoría?",
    respuesta:
      "Sí. Un mismo equipo puede inscribirse en varias categorías, presentando un robot para cada una.",
  },
  {
    pregunta: "¿Cuántos integrantes puede tener un equipo?",
    respuesta:
      "El número de integrantes lo define el reglamento de cada categoría. Consulta el documento descargable arriba.",
  },
  {
    pregunta: "¿Quién puede editar la ficha técnica del robot?",
    respuesta:
      "Solo el capitán del equipo, desde su cuenta, hasta la fecha de cierre de inscripciones.",
  },
  {
    pregunta: "¿Cómo se resuelven los empates?",
    respuesta:
      "Cada categoría define su propio criterio de desempate en el reglamento oficial.",
  },
];

// ────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ────────────────────────────────────────────────────────────

export default function HomePage() {
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const sectionIds = ["reglamento", "categorias", "cronograma", "faq", "contacto"];
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      {/* ── Navegación ── */}
      <nav className={styles.nav}>
        {/* Enlace ancla al Hero con el Logo del Semillero */}
        <a href="#hero" className={styles.navBrand}>
          <Image
            src="/logo-huellas.png"
            alt="Logo Huellas Industriales"
            width={39}
            height={34}
            style={{ objectFit: "contain" }}
          />
          CIRI<span>_</span>2026
        </a>

        <ul className={styles.navLinks}>
          <li>
            <a
              href="#reglamento"
              className={activeSection === "reglamento" ? styles.activeLink : ""}
            >
              Reglamento
            </a>
          </li>
          <li>
            <a
              href="#categorias"
              className={activeSection === "categorias" ? styles.activeLink : ""}
            >
              Categorías
            </a>
          </li>
          <li>
            <a
              href="#cronograma"
              className={activeSection === "cronograma" ? styles.activeLink : ""}
            >
              Cronograma
            </a>
          </li>
          <li>
            <a
              href="#faq"
              className={activeSection === "faq" ? styles.activeLink : ""}
            >
              FAQ
            </a>
          </li>
          <li>
            <a
              href="#contacto"
              className={activeSection === "contacto" ? styles.activeLink : ""}
            >
              Contacto
            </a>
          </li>
        </ul>
        <a href="/login" className={styles.navLoginBtn}>
          Iniciar sesión
        </a>
      </nav>

      {/* ── Hero con id="hero" ── */}
      <header id="hero" className={styles.hero}>
        <span className={styles.heroEyebrow}>Certamen Interuniversitario de Robótica e Innovación</span>
        <h1 className={styles.heroTitle}>
          <DecipherTitle text="CIRI 2026" />
        </h1>
        <p className={styles.heroSubtitle}>
          Instituciones Educativas de toda la región compiten con sus robots en sumo,
          velocidad y proyectos de innovación. Inscribe a tu equipo o sigue
          los resultados en tiempo real el día del evento.
        </p>
        <div className={styles.heroActions}>
          <a href="/login" className={styles.btnPrimary}>Inscribir mi equipo</a>
          <a href="#reglamento" className={styles.btnSecondary}>Ver reglamento</a>
        </div>
      </header>

      {/* ── Barra de estado ── */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            <NumberCounter target={3} />
          </div>
          <div className={styles.statLabel}>Categorías</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            +<NumberCounter target={8} />
          </div>
          <div className={styles.statLabel}>Instituciones Educativas</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            <NumberCounter target={1} />
          </div>
          <div className={styles.statLabel}>Día de competencia</div>
        </div>
      </div>

      {/* ── Reglamento ── */}
      <section id="reglamento" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Reglamento oficial</h2>
          <p className={styles.sectionLead}>
            Las reglas generales del CIRI y los criterios específicos de cada
            categoría están reunidos en un solo documento.
          </p>
        </div>
        <div className={styles.reglamentoGrid}>
          <div className={`${styles.panel} ${styles.reglamentoPanel}`}>
            <p>
              El reglamento cubre las normas de seguridad, dimensiones y peso
              permitidos por categoría, el sistema de eliminación del
              bracket, y los criterios de desempate. Léelo completo antes de
              inscribir a tu equipo — la inspección técnica del día del
              evento se basa strictly en este documento.
            </p>
          </div>
          <div className={`${styles.panel} ${styles.downloadPanel}`}>
            <span className={styles.fileLabel}>PDF · Edición 2026</span>
            <a href="/reglamento-ciri-2026.pdf" 
            download="Reglamento_CIRI_2026.pdf"className={styles.btnPrimary} 
            >Descargar reglamento</a>
          </div>
        </div>
      </section>

      {/* ── Categorías ── */}
      <section id="categorias" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Categorías del torneo</h2>
          <p className={styles.sectionLead}>
            Cada categoría tiene su propio reglamento técnico y nivel
            permitido. Un mismo equipo puede inscribirse en varias.
          </p>
        </div>
        <div className={styles.categoriasGrid}>
          {CATEGORIAS.map((cat) => (
            <div key={cat.nombre} className={`${styles.panel} ${styles.categoriaCard}`}>
              <div className={styles.categoriaNivel}>{cat.nivel}</div>
              <h3>{cat.nombre}</h3>
              <p>{cat.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cronograma ── */}
      <section id="cronograma" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Cronograma</h2>
          <p className={styles.sectionLead}>
            Fechas clave del proceso, desde la inscripción hasta la final.
          </p>
        </div>
        <div className={`${styles.panel} ${styles.timeline}`}>
          {CRONOGRAMA.map((item, i) => (
            <div key={item.titulo} className={styles.timelineItem}>
              <div className={styles.timelineNum}>{String(i + 1).padStart(2, "0")}</div>
              <div className={styles.timelineContent}>
                <h4>{item.titulo}</h4>
                <div className={styles.timelineFecha}>{item.fecha}</div>
                <p>{item.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
        </div>
        <div>
          {FAQS.map((item, i) => {
            const abierta = faqAbierta === i;
            return (
              <div key={item.pregunta} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setFaqAbierta(abierta ? null : i)}
                  aria-expanded={abierta}
                >
                  {item.pregunta}
                  <span className={styles.faqIcon}>{abierta ? "−" : "+"}</span>
                </button>
                <div className={`${styles.faqAnswer} ${abierta ? styles.faqOpen : ""}`}>
                  <p>{item.respuesta}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Contacto ── */}
      <section id="contacto" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Contacto</h2>
          <p className={styles.sectionLead}>
            ¿Dudas sobre el reglamento o tu inscripción? Escríbenos.
          </p>
        </div>
        <div className={styles.contactoGrid}>
          <div className={styles.panel}>
            <form
              className={styles.contactoForm}
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="text" placeholder="Nombre" required />
              <input type="email" placeholder="Correo" required />
              <textarea placeholder="Mensaje" rows={4} required />
              <button type="submit" className={styles.btnPrimary}>
                Enviar mensaje
              </button>
            </form>
          </div>
          <div className={styles.panel}>
            <div className={styles.organizadorItem}>
              <strong>Coordinación general</strong>
              <span>coordinacion@ciri.edu</span>
            </div>
            <div className={styles.organizadorItem}>
              <strong>Soporte técnico de inscripciones</strong>
              <span>soporte@ciri.edu</span>
            </div>
            <div className={styles.organizadorItem}>
              <strong>Sede</strong>
              <span>Universidad de Córdoba (polideportivo)</span>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        CIRI — Certamen Interuniversitario de Robótica e Innovación
      </footer>
    </div>
  );
}