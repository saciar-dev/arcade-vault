import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const msg = typeof body.msg === "string" ? body.msg.trim() : "";

  if (!name || !email || !msg) {
    return NextResponse.json(
      { ok: false, error: "Todos los campos son obligatorios." },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Correo electrónico inválido." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo enviar el mensaje. Intenta de nuevo.",
      },
      { status: 502 }
    );
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Arcade Vault <onboarding@resend.dev>",
    to: "aciarenator@gmail.com",
    replyTo: email,
    subject: "Nuevo mensaje de contacto — Arcade Vault",
    text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${msg}`,
  });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo enviar el mensaje. Intenta de nuevo.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
