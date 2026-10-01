// Recibe el formulario de Contacto de la página principal y lo envía
// por correo a la cuenta de CIRI usando Gmail (SMTP).
//
// Variables de entorno necesarias (en .env.local y en Vercel):
//   GMAIL_USER          → ciri2026.torneo@gmail.com
//   GMAIL_APP_PASSWORD  → contraseña de aplicación de esa cuenta (16 letras)

import nodemailer from "nodemailer";

const LIMITES = { nombre: 100, correo: 200, mensaje: 5000 };
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let datos: Record<string, unknown>;
  try {
    datos = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Campo trampa: es invisible para las personas, solo los bots lo llenan.
  // Se responde "ok" para que el bot no sepa que fue descartado.
  if (typeof datos.sitio_web === "string" && datos.sitio_web.trim() !== "") {
    return Response.json({ ok: true });
  }

  // Los saltos de línea se quitan del nombre porque va en el asunto.
  const nombre = String(datos.nombre ?? "").replace(/[\r\n]+/g, " ").trim();
  const correo = String(datos.correo ?? "").trim();
  const mensaje = String(datos.mensaje ?? "").trim();

  if (!nombre || !correo || !mensaje) {
    return Response.json({ error: "Completa todos los campos." }, { status: 400 });
  }
  if (!CORREO_VALIDO.test(correo) || correo.length > LIMITES.correo) {
    return Response.json({ error: "El correo no es válido." }, { status: 400 });
  }
  if (nombre.length > LIMITES.nombre || mensaje.length > LIMITES.mensaje) {
    return Response.json({ error: "El mensaje es demasiado largo." }, { status: 400 });
  }

  const usuario = process.env.GMAIL_USER;
  const clave = process.env.GMAIL_APP_PASSWORD;
  if (!usuario || !clave) {
    console.error("Contacto: faltan GMAIL_USER o GMAIL_APP_PASSWORD");
    return Response.json(
      { error: "El formulario no está disponible ahora. Escríbenos directamente por correo." },
      { status: 500 }
    );
  }

  const transporte = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: usuario, pass: clave },
  });

  try {
    await transporte.sendMail({
      from: `"Web CIRI 2026" <${usuario}>`,
      to: usuario,
      // "Responder" en Gmail contesta directamente a quien escribió.
      replyTo: { name: nombre, address: correo },
      subject: `Contacto web: ${nombre}`,
      text: `Nombre: ${nombre}\nCorreo: ${correo}\n\nMensaje:\n${mensaje}`,
    });
  } catch (error) {
    console.error("Contacto: no se pudo enviar el correo", error);
    return Response.json(
      { error: "No se pudo enviar el mensaje. Intenta de nuevo en unos minutos." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
