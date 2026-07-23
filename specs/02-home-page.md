# SPEC 02 — Home, Biblioteca en /juegos y Acerca de

> **Status:** aprobado
> **Depends on:** 01-mvp-pantallas-visuales
> **Date:** 2026-07-23
> **Objective:** Agregar una landing page en `/`, mover la Biblioteca de `/` a `/juegos` (con sus subrutas de detalle y reproductor), y agregar la pantalla "Acerca de" en `/acerca-de`, portando `home.jsx` y `about.jsx` del prototipo y actualizando el `Nav`.

## Scope

**In:**

- Ruta `/` (Home): nueva landing page portada de `home.jsx` — hero con silhouettes flotantes, sección "¿Por qué Arcade Vault?" (4 feature cards), preview de juegos (6 mini-cards desde `GAMES`), sección de stats, "Actividad en vivo" (ticker de puntuaciones recientes + top jugadores del día, hardcodeado), sección de precios (plan único gratis + FAQ) y CTA final.
- Mover la Biblioteca actual (grid con búsqueda y filtro por categoría, hoy en `app/page.tsx`) a `app/juegos/page.tsx`, sin cambios de comportamiento.
- Mover `app/juego/[id]/page.tsx` → `app/juegos/[id]/page.tsx` (Detalle), sin cambios de comportamiento.
- Mover `app/juego/[id]/jugar/page.tsx` → `app/juegos/[id]/jugar/page.tsx` (Reproductor), sin cambios de comportamiento.
- Ruta `/acerca-de` (About): nueva pantalla portada de `about.jsx`, solo la sección "Acerca de" (hero con misión + 3 highlights). Sin la sección de contacto.
- Actualizar `components/nav.tsx`: agregar links "Inicio" (`/`) y "Acerca de" (`/acerca-de`), cambiar el link "Biblioteca" para que apunte a `/juegos`, y ajustar `isActive` para las 4 rutas (incluyendo que `/juegos/*` siga marcando "Biblioteca" como activo).
- Actualizar cualquier referencia interna a `/juego/...` (links en `GameCard`, `Nav`, botones "Jugar ahora"/"Volver al vault" del detalle y reproductor, mini-cards del nuevo home, etc.) para que apunten a `/juegos/...`.
- Mantener fielmente la estética retro-arcade ya presente en `globals.css` (no se reinterpreta visualmente el diseño de `home.jsx`/`about.jsx`).

**Out of scope (for future specs):**

- Formulario de contacto de `about.jsx` (campos, envío, animación de terminal de éxito) — no se porta nada de esa sección en esta spec.
- Cualquier lógica real de backend, autenticación o persistencia (ya fuera de alcance desde la spec 01).
- Hacer dinámicas las secciones "Actividad en vivo" y "Precios" del home con datos de `app/data` — quedan con los arrays hardcodeados del prototipo, igual que en `home.jsx`.
- Redirects/alias desde las URLs viejas (`/juego/[id]`) hacia las nuevas (`/juegos/[id]`) — se asume que no hay tráfico ni enlaces externos apuntando a las rutas viejas todavía.

## Data model

Esta spec no introduce estructuras de datos nuevas. El home reutiliza `GAMES` de `app/data/games.ts` para la preview de juegos, y las secciones "Actividad en vivo" y "Precios" quedan con los arrays hardcodeados del prototipo (no persistidos, no tipados en `app/data`).

## Implementation plan

1. Crear el directorio `app/juegos/` y mover el contenido de `app/page.tsx` (Biblioteca) a `app/juegos/page.tsx` tal cual, sin modificar su lógica. Prueba manual: `npm run dev`, visitar `/juegos` y confirmar que el grid, buscador y chips funcionan igual que antes en `/`.
2. Mover `app/juego/[id]/page.tsx` → `app/juegos/[id]/page.tsx` y `app/juego/[id]/jugar/page.tsx` → `app/juegos/[id]/jugar/page.tsx`, eliminando el directorio `app/juego/` vacío. Prueba manual: navegar a `/juegos/<id>` y `/juegos/<id>/jugar` para un juego existente y confirmar que cargan igual que antes.
3. Actualizar todas las referencias internas a `/juego/...` (en `GameCard`, botones del detalle y del reproductor, cualquier `router.push`/`Link` residual) para que apunten a `/juegos/...`. Prueba manual: desde `/juegos`, hacer clic en una card, jugar, y volver al vault, confirmando que todas las URLs usan `/juegos`.
4. Crear `app/page.tsx` nuevo con la landing Home portada de `home.jsx` (hero, silhouettes flotantes, feature cards, preview de 6 juegos desde `GAMES`, stats, actividad en vivo hardcodeada, precios/FAQ y CTA final), usando `next/link`/`useRouter` en vez de la prop `navigate` del prototipo. Prueba manual: visitar `/`, confirmar que se ve el hero y que los CTAs navegan a `/juegos`, `/auth` y `/salon` correctamente.
5. Crear `app/acerca-de/page.tsx` con la sección "Acerca de" portada de `about.jsx` (hero, misión, 3 highlights), sin incluir la sección de contacto. Prueba manual: visitar `/acerca-de` y confirmar que se ve el hero y los 3 highlights con sus animaciones `reveal`.
6. Actualizar `components/nav.tsx`: agregar los links "Inicio" (`/`) y "Acerca de" (`/acerca-de`) en desktop y en el panel móvil, cambiar el href de "Biblioteca" a `/juegos`, y actualizar `isActive` para que `/juegos*` marque "Biblioteca" activo y `/acerca-de` marque "Acerca de" activo. Prueba manual: navegar por las 4 rutas y confirmar que el link correspondiente se resalta en cada una, tanto en desktop como en el menú móvil.
7. Revisión final de navegación cruzada entre las 7 pantallas (`/`, `/juegos`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/salon`, `/auth`, `/acerca-de`), responsive, y `npm run build` sin errores.

## Acceptance criteria

- [ ] `/` muestra la nueva landing: hero con título de 3 líneas y CTAs, sección "¿Por qué Arcade Vault?" con 4 feature cards, preview de 6 juegos, sección de stats, "Actividad en vivo" (ticker + top jugadores) y sección de precios con FAQ.
- [ ] En `/`, el CTA "Explorar Juegos" del hero navega a `/juegos`.
- [ ] En `/`, el CTA "Crear Cuenta" del hero navega a `/auth`.
- [ ] En `/`, el botón "Ver Todos los Juegos" de la sección de preview navega a `/juegos`.
- [ ] En `/`, el botón "Ver Salón" de la sección de actividad navega a `/salon`.
- [ ] En `/`, el botón "Empezar Gratis" de precios y el CTA final "Insertar Moneda" navegan a `/auth` y `/juegos` respectivamente.
- [ ] Las 6 mini-cards de la sección de preview muestran juegos reales de `GAMES` y cada una navega a `/juegos/[id]` con el id correcto.
- [ ] `/juegos` muestra el mismo grid, buscador y filtro por categoría que antes vivían en `/` (comportamiento sin cambios).
- [ ] `/juegos/[id]` y `/juegos/[id]/jugar` funcionan igual que antes (mismo comportamiento que `/juego/[id]` y `/juego/[id]/jugar` en la spec 01), solo que en la nueva URL.
- [ ] Las rutas viejas `/juego/[id]` y `/juego/[id]/jugar` ya no existen (404 estándar de Next.js).
- [ ] `/acerca-de` muestra el hero "Acerca de Arcade Vault", el texto de misión y los 3 highlights, sin ninguna sección de contacto.
- [ ] El `Nav` muestra 4 links: Inicio, Biblioteca, Salón de la Fama, Acerca de.
- [ ] Estando en `/`, el link "Inicio" del `Nav` aparece activo.
- [ ] Estando en `/juegos`, `/juegos/[id]` o `/juegos/[id]/jugar`, el link "Biblioteca" del `Nav` aparece activo.
- [ ] Estando en `/acerca-de`, el link "Acerca de" del `Nav` aparece activo.
- [ ] El menú móvil del `Nav` incluye los mismos 4 links y resalta el activo igual que en desktop.
- [ ] `npm run build` completa sin errores.

## Decisions

- **Sí:** mover la Biblioteca de `/` a `/juegos` y liberar `/` para la nueva landing. Refleja la estructura del prototipo (`home` y `biblioteca` son pantallas distintas en `nav.jsx`) y es lo que pidió el usuario explícitamente.
- **Sí:** renombrar `/juego/[id]` → `/juegos/[id]` (y su subruta `/jugar`), en vez de dejar `/juego` para detalle y `/juegos` para el listado. Evita la inconsistencia de tener `/juego` (singular) y `/juegos` (plural) como prefijos distintos y separados en la misma jerarquía de juegos.
- **No:** crear redirects desde las rutas viejas (`/juego/[id]`) hacia las nuevas. No hay tráfico externo ni enlaces persistentes apuntando a las rutas viejas todavía (proyecto en desarrollo activo), así que el costo de mantener redirects no se justifica.
- **Sí:** ruta `/acerca-de` en español, consistente con `/salon` y `/juegos`, en vez de `/about` como en el prototipo original.
- **No:** portar la sección de contacto de `about.jsx` en esta spec (ni siquiera de forma decorativa). El usuario prefirió dejarla completamente fuera para no introducir UI a medio terminar; se implementará en una spec futura dedicada.
- **Sí:** las secciones "Actividad en vivo" y "Precios" del home quedan con los arrays hardcodeados del prototipo (no se conectan a `PLAYERS`/`seededScores` de `app/data`). Mantiene fidelidad 1:1 con el prototipo y evita acoplar contenido de marketing a los datos de juego.
- **Sí:** usar `next/link`/`useRouter` para la navegación del nuevo home y about, reemplazando la prop `navigate` manual del prototipo — mismo patrón ya usado en `app/juegos/page.tsx` y `components/nav.tsx` desde la spec 01.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Quedan referencias residuales a `/juego/...` (hardcoded strings) en componentes no revisados, rompiendo la navegación silenciosamente. | Buscar todas las ocurrencias de `"/juego"` en el código (`grep -r "/juego"`) antes de dar por cerrado el paso 3, y confirmar que solo queden matches de `/juegos`. |
| Al mover `app/juego/[id]/` a `app/juegos/[id]/`, si no se borra bien el directorio viejo, Next.js podría mantener ambas rutas o fallar el build por archivos huérfanos. | Verificar con `git status`/listado de archivos que `app/juego/` ya no existe tras el paso 2, y correr `npm run build` para confirmar que no hay rutas duplicadas. |
| El hook `useReveal` (IntersectionObserver sobre `.reveal`) se define de forma casi idéntica en `home.jsx` y `about.jsx`; portarlo dos veces como en el prototipo puede generar código duplicado que un linter marque. | Aceptable para esta spec (fidelidad al prototipo); si se quiere extraer a un hook compartido, queda como mejora futura fuera de alcance. |

## What is **not** in this spec

- Formulario de contacto de la pantalla "Acerca de" (campos, envío, animación de terminal).
- Redirects desde las rutas viejas `/juego/[id]` hacia `/juegos/[id]`.
- Conectar las secciones "Actividad en vivo" y "Precios" del home a datos reales de `app/data`.
- Cualquier lógica real de backend, autenticación o persistencia.

Cada uno de estos, si se implementa, va en su propia spec.
