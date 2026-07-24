# SPEC 03 — Formulario de contacto en Acerca de con envío por Resend

> **Status:** aprobado
> **Depends on:** 02-home-page
> **Date:** 2026-07-23
> **Objective:** Agregar la sección de Contacto (divisor + formulario) del template `about.jsx` debajo del hero existente en `/acerca-de`, y conectar el envío del formulario a un correo real usando Resend.

## Scope

**In:**

- Agregar debajo del hero actual de `app/acerca-de/page.tsx` el divisor animado (`.about-divider`) y la sección de Contacto (`.about-contact`) portados de `about.jsx`: intro con tips, y formulario con campos Nombre, Correo electrónico y Mensaje.
- Portar la animación de "terminal de éxito" (líneas `[OK] Conectando...`, `[OK] Validando...`, `[OK] Transmitiendo...`, línea final con el nombre del usuario) mostrada **después** de recibir confirmación real de envío exitoso.
- Portar la validación de cliente ya existente en el template (campos vacíos → `shake`).
- Agregar validación básica en servidor: nombre, correo y mensaje no vacíos, y formato de correo válido.
- Crear `app/api/contact/route.ts` (Route Handler `POST`) que reciba `{ name, email, msg }`, valide, y envíe el correo vía Resend a `aciarenator@gmail.com` usando el dominio de pruebas `onboarding@resend.dev` como remitente.
- Instalar la dependencia `resend` y documentar `RESEND_API_KEY` como variable de entorno (`.env.local`, no versionada) que el usuario configurará manualmente.
- Manejo de error de envío: mensaje de error visible en el formulario, sin perder los datos escritos, permitiendo reintentar.
- Botón "Enviar otro mensaje" del estado de éxito, que resetea el formulario (igual que el template).

**Out of scope (para futuras specs):**

- Protección anti-spam (honeypot, rate limiting, captcha).
- Persistencia de los mensajes recibidos (base de datos, panel de administración, historial).
- Dominio propio verificado en Resend / remitente personalizado.
- Notificaciones adicionales (auto-respuesta al usuario que escribió, Slack, etc.).
- Internacionalización o soporte multi-idioma del formulario.

## Data model

Esta spec no introduce persistencia ni entidades nuevas en `app/data`. Sí define el contrato del endpoint interno:

**Request** — `POST /api/contact`

```ts
{
  name: string;
  email: string;
  msg: string;
}
```

**Response — éxito** (`200`)

```ts
{ ok: true }
```

**Response — error de validación** (`400`)

```ts
{ ok: false; error: string } // ej: "Todos los campos son obligatorios." | "Correo electrónico inválido."
```

**Response — error de envío** (`502`)

```ts
{ ok: false; error: string } // ej: "No se pudo enviar el mensaje. Intenta de nuevo."
```

El correo se envía con Resend: `from: "Arcade Vault <onboarding@resend.dev>"`, `to: "aciarenator@gmail.com"`, `reply_to: <email del formulario>`, asunto `Nuevo mensaje de contacto — Arcade Vault`, cuerpo con nombre, correo y mensaje del remitente.

## Implementation plan

1. Instalar la dependencia `resend` (`npm install resend`). Prueba manual: `package.json` incluye `resend` y `npm install` corre sin errores.
2. Crear `.env.local.example` (o similar) documentando `RESEND_API_KEY=` para que el usuario coloque su propia key en `.env.local` (no versionado). Prueba manual: el archivo de ejemplo existe y `.env.local` sigue ignorado por git.
3. Crear `app/api/contact/route.ts` con el handler `POST`: parsear el body, validar (`name`, `email`, `msg` no vacíos y formato de correo válido), y si es válido, llamar a Resend con el cliente inicializado desde `process.env.RESEND_API_KEY`. Devolver `400` en validación fallida, `502` si Resend falla, `200` con `{ ok: true }` en éxito. Prueba manual: probar el endpoint con `curl`/Thunder Client enviando payloads válidos e inválidos y confirmar los códigos de respuesta.
4. Extraer el formulario de contacto a un componente (ej. `components/contact-form.tsx`, client component) con el estado `form`, `sent`, `shake` y un nuevo estado `error`/`loading`, portando los campos y estilos del template. El `onSubmit` hace `fetch("/api/contact", { method: "POST", body: JSON.stringify(form) })`, muestra `loading` mientras espera, y ante éxito setea `sent` (dispara la animación de terminal); ante error, muestra el mensaje de error sin borrar los campos. Prueba manual: llenar el formulario con datos válidos, confirmar loading → animación de terminal → correo recibido en `aciarenator@gmail.com`.
5. Agregar en `app/acerca-de/page.tsx`, debajo del `<section className="about-hero">` existente, el divisor animado (`.about-divider` con los 24 `span` y `reveal`) y la sección `<section className="about-contact reveal">` con la intro/tips y el `<ContactForm />` del paso 4. Prueba manual: visitar `/acerca-de`, hacer scroll y confirmar que el divisor y el formulario aparecen con la animación `reveal` igual que el resto de la página.
6. Confirmar que los estilos usados (`.about-contact`, `.contact-grid`, `.contact-form`, `.terminal-success`, `.tip-led`, etc.) ya existen en `globals.css` portados desde `styles.css` del template; si falta alguno, portarlo manteniendo fidelidad visual. Prueba manual: comparar visualmente `/acerca-de` con `arcade-vault-standalone.html` del template para el estado inicial, estado de error y estado de éxito del formulario.
7. Revisión final: probar el botón "Enviar otro mensaje" (resetea el formulario), probar validación de campos vacíos (shake), probar correo inválido (error de servidor), y correr `npm run build` sin errores.

## Acceptance criteria

- [ ] `/acerca-de` muestra, debajo del hero existente, el divisor animado y la sección de Contacto con intro, 3 tips y el formulario (Nombre, Correo electrónico, Mensaje).
- [ ] Enviar el formulario con algún campo vacío dispara la animación `shake` y no hace ninguna petición de red.
- [ ] Enviar el formulario con un correo con formato inválido muestra un mensaje de error del servidor sin perder los datos escritos.
- [ ] Enviar el formulario con datos válidos muestra un estado de carga, y al confirmarse el envío exitoso, muestra la animación de terminal (`[OK] Conectando...`, `[OK] Validando...`, `[OK] Transmitiendo...`, línea final con el nombre en mayúsculas).
- [ ] Un envío exitoso hace llegar un correo real a `aciarenator@gmail.com` con nombre, correo y mensaje del remitente, usando `onboarding@resend.dev` como remitente y el correo del formulario como `reply_to`.
- [ ] Si Resend falla (API key inválida, error de red, etc.), se muestra un mensaje de error en el formulario y el usuario puede reintentar sin perder lo escrito.
- [ ] El botón "Enviar otro mensaje" del estado de éxito resetea el formulario a sus campos vacíos.
- [ ] `RESEND_API_KEY` se lee desde variable de entorno; no hay ninguna API key hardcodeada en el código.
- [ ] `npm run build` completa sin errores.

## Decisions

- **Sí:** agregar la sección de Contacto en la misma ruta `/acerca-de` (debajo del hero), en vez de una ruta separada. Replica la estructura de una sola pantalla "About + Contact" del template, y es la ruta que la spec 02 dejó preparada para esto.
- **Sí:** usar un Route Handler (`app/api/contact/route.ts`) en vez de un Server Action. El formulario ya es un client component con estado propio (`shake`, `sent`, animación de terminal manual), y un `fetch` explícito da más control sobre estados de carga/error que un Server Action con `useActionState`.
- **Sí:** usar el dominio de pruebas `onboarding@resend.dev` como remitente. No hay dominio propio verificado en Resend todavía; se puede migrar a un dominio propio en una spec futura sin cambiar el resto del flujo.
- **Sí:** correo fijo `aciarenator@gmail.com` como destinatario hardcodeado (no configurable desde UI ni por env var). Es el único destinatario esperado para este MVP.
- **Sí:** animación de terminal se muestra solo tras confirmación real del servidor, no en paralelo a la petición. Evita mostrar "éxito" antes de saber si el correo realmente se envió.
- **No:** protección anti-spam (honeypot, rate limiting, captcha). MVP simple; se evalúa agregar si se vuelve un problema real.
- **Sí:** validación de formato de correo también en el servidor, no solo en cliente. El template solo valida "no vacío"; agregar formato de correo evita envíos claramente inválidos a Resend.
- **No:** persistir los mensajes recibidos en ninguna base de datos ni archivo. Solo se envía el correo; no hay historial ni panel de administración en esta spec.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| El dominio de pruebas `onboarding@resend.dev` de Resend puede tener restricciones (ej. solo permite enviar a la cuenta verificada del dueño del API key). | Verificar en la documentación de Resend antes de implementar el paso 3; si aplica la restricción y coincide con `aciarenator@gmail.com` como cuenta del API key, no hay problema — si no coincide, avisar al usuario antes de continuar. |
| Si `RESEND_API_KEY` no está configurada (usuario aún no la puso en `.env.local`), el endpoint fallará en cada intento. | El Route Handler debe devolver un error claro (`502` con mensaje) en vez de un 500 genérico si falta la key, y el mensaje de error en el formulario debe ser visible para diagnosticar rápido. |
| Los estilos de `.about-contact`/`.terminal-success` del template pueden no estar completos en `globals.css` si nunca se portaron en la spec 02 (que excluyó explícitamente esta sección). | Comparar visualmente contra `styles.css`/`arcade-vault-standalone.html` del template en el paso 6 y portar cualquier regla faltante. |

## What is **not** in this spec

- Protección anti-spam (honeypot, rate limiting, captcha).
- Persistencia de los mensajes recibidos.
- Dominio propio verificado en Resend / remitente personalizado.
- Notificaciones adicionales al usuario que escribió el mensaje.
- Internacionalización del formulario.

Cada uno de estos, si se implementa, va en su propia spec.
