# SPEC 04 — Conexión de Supabase al proyecto

> **Status:** implementado
> **Depends on:** 02-home-page
> **Date:** 2026-07-25
> **Objective:** Conectar el proyecto Supabase existente (`dgwchiwswxzuxfsegvdk`) a la aplicación Next.js, instalando y configurando los clientes de servidor y navegador (`@supabase/ssr` + `@supabase/supabase-js`) con sus variables de entorno, sin implementar todavía autenticación ni persistencia de datos.

## Scope

**In:**

- Instalar las dependencias `@supabase/supabase-js` y `@supabase/ssr`.
- Documentar las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local.example`, con los valores reales del proyecto `dgwchiwswxzuxfsegvdk` puestos por el usuario en su propio `.env.local` (no versionado).
- Crear un helper de cliente para uso en Client Components (`lib/supabase/client.ts`, `createBrowserClient`).
- Crear un helper de cliente para uso en Server Components / Route Handlers (`lib/supabase/server.ts`, `createServerClient` con acceso a cookies vía `next/headers`).
- Confirmar que el proyecto compila (`npm run build`) con los nuevos archivos presentes, sin que ninguna pantalla existente los use todavía.

**Out of scope (para futuras specs):**

- Autenticación real (signup/login/logout con Supabase Auth) — hoy `session-provider.tsx` sigue siendo el fake session, sin cambios.
- Cualquier tabla, esquema o migración en la base de datos (el proyecto queda sin tablas, tal como está hoy).
- Persistencia real de puntajes (`saveScore`) o leaderboard real en `/salon`.
- Middleware/`proxy.ts` para refrescar sesión de Supabase (solo aplica una vez exista auth real).
- Login social (Google/GitHub).
- Página o ruta de prueba/debug para verificar la conexión en runtime — la verificación de esta spec es solo a nivel de build y tipado.

## Data model

Esta spec no introduce ningún modelo de datos nuevo (no hay tablas, no hay tipos nuevos en `app/data`). Solo se agregan helpers de configuración de cliente.

## Implementation plan

1. Instalar `@supabase/supabase-js` y `@supabase/ssr` (`npm install @supabase/supabase-js @supabase/ssr`). Prueba manual: `package.json` incluye ambas dependencias y `npm install` corre sin errores.
2. Actualizar `.env.local.example` agregando `NEXT_PUBLIC_SUPABASE_URL=` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` (comentario indicando que se obtienen del dashboard de Supabase del proyecto `dgwchiwswxzuxfsegvdk`). Prueba manual: el archivo de ejemplo existe con las nuevas variables documentadas; `.env.local` real (con los valores del usuario) sigue ignorado por git.
3. Crear `lib/supabase/client.ts` exportando una función `createClient()` que use `createBrowserClient` de `@supabase/ssr` con `process.env.NEXT_PUBLIC_SUPABASE_URL` y `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Prueba manual: el archivo tipa sin errores (`tsc`/build).
4. Crear `lib/supabase/server.ts` exportando una función `async createClient()` que use `createServerClient` de `@supabase/ssr`, leyendo/escribiendo cookies vía `await cookies()` de `next/headers` (async, según Next.js 16). Prueba manual: el archivo tipa sin errores y respeta el patrón async de Request APIs de Next 16.
5. Correr `npm run build` y confirmar que compila sin errores con los nuevos archivos presentes y sin ninguna pantalla existente importándolos todavía. Prueba manual: build exitoso, `git status` no muestra cambios en pantallas existentes (`app/auth`, `components/session-provider.tsx`, etc.).

## Acceptance criteria

- [x] `package.json` incluye `@supabase/supabase-js` y `@supabase/ssr` como dependencias, y `npm install` corre sin errores.
- [x] `.env.local.example` documenta `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (sin valores reales), y `.env.local` sigue ignorado por git.
- [x] Existe `lib/supabase/client.ts` con un `createClient()` basado en `createBrowserClient` de `@supabase/ssr`.
- [x] Existe `lib/supabase/server.ts` con un `async createClient()` basado en `createServerClient` de `@supabase/ssr`, usando `await cookies()`.
- [x] Ninguna pantalla ni componente existente (`app/auth`, `components/session-provider.tsx`, `/salon`, etc.) cambia de comportamiento.
- [x] No se crea ninguna tabla ni migración en el proyecto Supabase `dgwchiwswxzuxfsegvdk` (sigue vacío).
- [x] `npm run build` completa sin errores.

## Decisions

- **Sí:** usar el proyecto Supabase ya existente `dgwchiwswxzuxfsegvdk` (confirmado por el usuario), en vez de crear uno nuevo.
- **Sí:** usar `@supabase/ssr` (no solo `@supabase/supabase-js`) desde esta spec, aunque todavía no haya auth, porque el patrón cliente/servidor separado es el que Supabase recomienda para App Router y evita tener que reestructurar los helpers cuando se implemente auth en una spec futura.
- **Sí:** helpers ubicados en `lib/supabase/` (`client.ts` y `server.ts`), siguiendo la convención estándar de la documentación de Supabase para Next.js.
- **No:** implementar autenticación (signup/login/logout) en esta spec. Se definirá en una spec futura dedicada, incluyendo decisiones de username/metadata y RLS que se dejaron explícitamente fuera de esta.
- **No:** crear tablas, migraciones ni persistencia de scores/leaderboard en esta spec. Spec futura dedicada.
- **No:** crear una página o ruta de prueba para verificar la conexión en runtime. La verificación de esta spec se limita a build + tipado; la verificación funcional real ocurrirá naturalmente cuando se implemente auth.
- **No:** configurar `proxy.ts` para refresco de sesión. No aplica sin auth real todavía.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| El usuario aún no ha creado su `.env.local` con los valores reales de `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, y el build o el dev server podría fallar en runtime al instanciar el cliente si estas vars faltan. | Como esta spec no ejecuta ningún cliente en runtime (ninguna pantalla los importa todavía), el build no depende de que las env vars estén seteadas. Documentar claramente en `.env.local.example` de dónde sacar los valores (dashboard de Supabase del proyecto `dgwchiwswxzuxfsegvdk`). |
| Next.js 16 cambia el manejo de cookies (`cookies()` ahora es async) respecto a versiones anteriores en las que muchos ejemplos de Supabase están basados; copiar un snippet desatualizado de la documentación de Supabase puede romper el build. | Escribir `lib/supabase/server.ts` usando `await cookies()` explícitamente y validar con `npm run build`, no solo con snippets memorizados. |
| Sin un helper de refresco de sesión (`proxy.ts`/middleware), cuando se implemente auth en el futuro las sesiones podrían no refrescarse correctamente si no se agrega en la spec siguiente. | Documentado como out-of-scope en esta spec; queda anotado como pendiente para la spec de autenticación. |

## What is **not** in this spec

- Autenticación (signup/login/logout).
- Tablas, migraciones o persistencia de scores/leaderboard.
- Middleware/`proxy.ts` de refresco de sesión.
- Login social.
- Página de prueba/debug de conexión.

Cada uno de estos, si se implementa, va en su propia spec.
