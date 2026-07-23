# SPEC 01 — Pantallas visuales del MVP de Arcade Vault

> **Status:** implementado
> **Depends on:** —
> **Date:** 2026-07-22
> **Objective:** Portar las 5 pantallas visuales del prototipo estático (references/resources/templates/) a rutas de App Router en Next.js 16, usando datos mock desde app/data y estado de sesión/puntuaciones en memoria, sin implementar ningún juego real.

## Scope

**In:**

- Ruta `/` (Biblioteca): grid de juegos con búsqueda, filtro por categoría y hero animado, portado de `biblioteca.jsx`.
- Ruta `/juego/[id]` (Detalle): info del juego, tags, stats, leaderboard del juego y CTA para jugar, portado de `detalle.jsx`.
- Ruta `/juego/[id]/jugar` (Reproductor): HUD, marco CRT con simulación visual de partida (puntaje autoincremental, vidas, pausa, fin de juego con guardado de puntuación), portado de `reproductor.jsx` tal cual, incluyendo el `setInterval` de simulación.
- Ruta `/salon` (Salón de la Fama): podio top 3, tabla de puntuaciones por juego con tabs, portado de `salon.jsx`.
- Ruta `/auth` (Auth): formulario de inicio de sesión / registro / invitado, portado de `auth.jsx`.
- Componente `Nav` compartido (con menú móvil) portado de `nav.jsx`, montado en el layout raíz.
- `app/data/`: módulo(s) TS con `GAMES`, `CATS`, `PLAYERS`, `seededScores()` (catálogo "de base de datos" ficticio), portado de `data.jsx`.
- Estado de sesión de usuario (login) y puntuaciones guardadas al terminar una partida: manejados en memoria vía React Context/estado en un client component en el layout raíz — sin `localStorage`, se reinicia al recargar la página.
- Mantener fielmente la estética retro-arcade (neón, CRT, scanlines, tipografías pixel/mono) ya presente en `app/globals.css`; no se reinterpreta visualmente el diseño.
- Enrutamiento con App Router estándar (archivos de ruta, `next/link`, `next/navigation`), reemplazando el hash-routing manual del prototipo.

**Out of scope (for future specs):**

- Lógica real de ningún juego (Bloque Buster, Caída, Serpentina, etc.) — solo existen como datos de catálogo y la simulación visual del reproductor.
- Autenticación real (backend, validación de credenciales, OAuth con Google/GitHub) — los botones sociales quedan como UI decorativa sin funcionalidad.
- Persistencia real en base de datos — `app/data` es mock, pensado para ser reemplazado después.
- Guardado de puntuaciones o sesión entre recargas de página o dispositivos.
- Tests automatizados (no hay test runner configurado en el proyecto).
- Accesibilidad avanzada (ARIA completo) más allá de lo que ya trae el prototipo.

## Data model

```ts
// app/data/types.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export type Game = {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;   // clase CSS del cover generado (cover-bricks, cover-tetro, ...)
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;
};

export type ScoreRow = {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/AAAA"
};

export type User = {
  name: string;
};

export type SavedScore = {
  game: string; // Game.id
  score: number;
  name: string;
  at: number; // Date.now()
};
```

```ts
// app/data/games.ts
export const GAMES: Game[] = [ /* los 8 juegos del prototipo: bloque-buster, caida, serpentina, gloton, invasores, rocas, ranaria, duelo-pixel */ ];
export const CATS: ("TODOS" | GameCategory)[] = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];
```

```ts
// app/data/players.ts
export const PLAYERS: string[] = [ /* los 18 nombres del prototipo */ ];
export function seededScores(seed: number, count?: number): ScoreRow[]; // misma generación pseudoaleatoria determinista del prototipo
```

Estado de sesión (en memoria, sin persistencia), expuesto vía Context:

```ts
// components/session-provider.tsx
type SessionContextValue = {
  user: User | null;
  scores: SavedScore[];
  login: (user: User | null) => void; // null = invitado
  logout: () => void;
  saveScore: (entry: Omit<SavedScore, "at">) => void;
};
```

Este `SessionProvider` (client component) envuelve `children` en `app/layout.tsx` y mantiene `user`/`scores` con `useState`, reiniciándose en cada recarga completa de página.

Convenciones:

- Los ids de juego son slugs en minúscula con guiones, igual que en el prototipo (`bloque-buster`, `caida`, etc.).
- Los montos de puntuación se formatean con `toLocaleString("es-ES")` como en el prototipo.

## Implementation plan

1. Crear `app/data/types.ts`, `app/data/games.ts` y `app/data/players.ts` con los tipos y datos migrados de `data.jsx` (8 juegos, categorías, 18 jugadores, `seededScores`). Prueba manual: `import` desde una página temporal y verificar en consola que `GAMES.length === 8`.
2. Crear `components/session-provider.tsx` (Context con `user`, `scores`, `login`, `logout`, `saveScore` en memoria) e integrarlo en `app/layout.tsx` envolviendo `children`. Prueba manual: la app sigue compilando y renderizando el layout vacío.
3. Crear `components/nav.tsx` portado de `nav.jsx` (usando `next/link`, `usePathname` en vez de `route`/`navigate` manuales) e integrarlo en `app/layout.tsx`, junto con el footer estático de `app.jsx`. Prueba manual: la barra de navegación aparece en cualquier ruta con los links Biblioteca / Salón de la Fama funcionando.
4. Reemplazar `app/page.tsx` (scaffold por defecto) por la pantalla **Biblioteca**: hero, buscador, chips de categoría y grid de `GameCard`, portado de `biblioteca.jsx`. Cada card enlaza a `/juego/[id]`. Prueba manual: cargar `/`, buscar y filtrar juegos.
5. Crear `app/juego/[id]/page.tsx` (**Detalle**) portado de `detalle.jsx`: cover, tags, stats, leaderboard (`seededScores`) y botones "Jugar ahora" / "Volver al vault". Prueba manual: navegar desde una card y ver el detalle correcto según `id`.
6. Crear `app/juego/[id]/jugar/page.tsx` (**Reproductor**) portado de `reproductor.jsx`: HUD, marco CRT, simulación de puntaje con `setInterval`, pausa, fin de juego y modal que guarda la puntuación vía `saveScore` del `SessionProvider`. Prueba manual: jugar, pausar, terminar partida y guardar puntuación con nombre.
7. Crear `app/salon/page.tsx` (**Salón de la Fama**) portado de `salon.jsx`: tabs por juego, podio top 3 y tabla completa, mostrando la fila "tu mejor marca" solo si hay `user` en el `SessionProvider`. Prueba manual: cambiar de tab y ver que cambia el leaderboard.
8. Crear `app/auth/page.tsx` (**Auth**) portado de `auth.jsx`: tabs iniciar sesión / crear cuenta, botón de invitado y botones sociales decorativos. Al enviar, llama `login()` del `SessionProvider` y redirige a `/`. Prueba manual: iniciar sesión y ver el nombre reflejado en el `Nav`.
9. Revisión final de navegación cruzada entre las 5 pantallas, responsive (breakpoints ya definidos en `globals.css`) y limpieza de cualquier import/archivo residual del scaffold de `create-next-app` que ya no se use.

## Acceptance criteria

- [x] `/` muestra el hero, el buscador, los chips de categoría y el grid con los 8 juegos de `GAMES`.
- [x] Escribir en el buscador de `/` filtra las cards por título en tiempo real.
- [x] Seleccionar un chip de categoría en `/` filtra las cards por esa categoría, y "TODOS" muestra las 8.
- [x] Buscar un término sin resultados muestra el mensaje "NO HAY RESULTADOS".
- [x] Hacer clic en una card o su botón "JUGAR" navega a `/juego/[id]` con el juego correcto.
- [x] `/juego/[id]` muestra el cover, tags, descripción larga, stats (partidas, mejor global, dificultad) y un leaderboard de 10 filas.
- [x] El botón "JUGAR AHORA" en `/juego/[id]` navega a `/juego/[id]/jugar`.
- [x] El botón "VOLVER AL VAULT" en `/juego/[id]` navega a `/`.
- [x] `/juego/[id]/jugar` incrementa la puntuación automáticamente cada ~220ms mientras no está en pausa ni terminado.
- [x] El botón "PAUSA" detiene el incremento de puntuación y muestra el overlay "EN PAUSA"; "REANUDAR" lo reactiva.
- [x] El botón "FIN" abre el modal de fin de juego mostrando la puntuación final.
- [x] Guardar la puntuación en el modal la agrega a `scores` del `SessionProvider` y muestra el mensaje "PUNTUACIÓN GUARDADA".
- [x] "JUGAR DE NUEVO" en el modal reinicia puntaje, vidas, nivel y estado del juego sin salir de la pantalla.
- [x] "VOLVER AL VAULT" en el modal navega a `/`.
- [x] `/salon` muestra tabs por cada juego; cambiar de tab actualiza el podio (top 3) y la tabla de puntuaciones.
- [x] Si hay un usuario logueado (vía `/auth`), `/salon` muestra la fila "TU MEJOR MARCA"; si no hay usuario, esa fila no aparece.
- [x] `/auth` permite alternar entre "INICIAR SESIÓN" y "CREAR CUENTA", mostrando el campo de correo solo en la segunda.
- [x] Enviar el formulario de `/auth` (o el botón "JUGAR COMO INVITADO") actualiza el usuario en el `Nav` y redirige a `/`.
- [x] Con sesión iniciada, el `Nav` muestra el nombre de usuario en vez de "Iniciar Sesión", y permite cerrar sesión.
- [x] Recargar la página (F5) reinicia el usuario y las puntuaciones guardadas a su estado inicial (sin persistencia).
- [x] El menú móvil del `Nav` (hamburguesa) abre/cierra el panel lateral en viewports angostos.
- [x] `npm run build` completa sin errores.

## Decisions

- **Sí:** rutas de archivo estándar de App Router (`/`, `/juego/[id]`, `/juego/[id]/jugar`, `/salon`, `/auth`) en vez de hash-routing. Da URLs limpias y usa `next/link`/`next/navigation` como es idiomático en Next.js 16.
- **No:** mantener el hash-routing manual del prototipo (`location.hash` + `JSON.parse`). Sería un anti-patrón dentro de App Router y complicaría el uso de Server/Client Components.
- **Sí:** slugs de URL en español (`/juego/[id]`, `/salon`), consistente con el resto de la app (español) y con el prototipo.
- **Sí:** `app/data/` como mock "de base de datos" para el catálogo de juegos y generación de leaderboards semilla (`GAMES`, `CATS`, `PLAYERS`, `seededScores`). Facilita reemplazarlo después por consultas reales sin tocar los componentes visuales.
- **Sí:** sesión de usuario y puntuaciones guardadas en memoria vía React Context (`SessionProvider`) en el layout raíz, sin `localStorage`. Evita construir lógica de persistencia que se descartará cuando exista backend real; el usuario prefirió no acoplar esa lógica ahora.
- **No:** `localStorage` para `av_user`/`av_scores` como en el prototipo. Contradice la decisión anterior y generaría trabajo a descartar.
- **Sí:** portar `reproductor.jsx` tal cual, incluyendo la simulación de puntaje con `setInterval`. Es una simulación puramente visual (no un juego real), por lo que no viola el alcance "no implementar ningún juego".
- **Sí:** portar el CSS del prototipo tal cual a `globals.css`. Ya estaba migrado casi 1:1 en un spec anterior (estilos/fuentes); no se reinterpreta con utilidades Tailwind para preservar fielmente la estética retro-arcade.
- **No:** reescribir el diseño con clases utilitarias de Tailwind. Implicaría reinterpretar visualmente el prototipo en vez de portarlo fielmente, como pidió el usuario.
- **No:** autenticación real ni validación de credenciales. Fuera de alcance — es una spec solo visual.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| En Next.js 16, `params` en `app/juego/[id]/page.tsx` y `app/juego/[id]/jugar/page.tsx` es asíncrono y debe usarse con `await` (no hay fallback síncrono). | Usar `PageProps<'/juego/[id]'>` generado por `next typegen` y `await params` antes de leer `id`, como indica CLAUDE.md. |
| Un `id` de juego inexistente en la URL (`/juego/no-existe`) rompería `GAMES.find(...)`. | Si `GAMES.find` no encuentra el juego, llamar a `notFound()` de `next/navigation` para mostrar el 404 estándar de Next.js. |
| El `SessionProvider` es un Client Component; si se usa mal en Server Components puede romper el build. | Marcar explícitamente `"use client"` en `session-provider.tsx` y en cualquier componente que consuma el hook del contexto (`Nav`, `Auth`, `GamePlayer`, `HallOfFame`). |
| El `setInterval` de la simulación de puntaje en el reproductor puede seguir corriendo si el componente se desmonta sin limpiar el efecto. | Igual que en el prototipo, limpiar el intervalo en el `return` del `useEffect` cuando cambian `over`/`paused` o al desmontar. |

## What is **not** in this spec

- Lógica real de ningún juego jugable (Bloque Buster, Caída, Serpentina, Glotón, Invasores, Rocas, Ranaria, Duelo Pixel).
- Autenticación real, OAuth funcional, validación de credenciales.
- Persistencia real en base de datos o `localStorage`.
- Tests automatizados.
- Accesibilidad avanzada (ARIA completo).

Cada uno de estos, si se implementa, va en su propia spec.
