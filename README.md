# Atlas de Cinesiterapia, frontend

Atlas interactivo de ejercicios de cinesiterapia. El cuerpo humano es el menú: se elige una
región, luego una categoría terapéutica y se llega al listado de ejercicios y a su ficha.

Stack: React 19, Vite, TypeScript, React Router, TanStack Query, Zustand, Tailwind CSS 4,
GSAP (zoom del cuerpo), Vitest y Testing Library. El plan de trabajo está en
[`TASKS.md`](./TASKS.md); el backend (Spring Boot) vive en otro repositorio.

## Requisitos

- Node.js 24 o superior
- npm 11 o superior

## Cómo correrlo

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL
npm run dev            # http://localhost:5173
```

## Variables de entorno

| Variable         | Descripción                                                                                                                                                                | Ejemplo                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `VITE_API_URL`   | URL base del backend, sin barra final. Obligatoria en producción.                                                                                                          | `http://localhost:8080` |
| `VITE_ATLAS_API` | Origen de los datos del atlas: `mock` (por defecto) o `http` (backend real; **valor para producción**). En desarrollo, `?mock=error` o `?mock=lento` fuerzan esos estados. | `mock`                  |

`.env` no se versiona. Las variables `VITE_*` quedan dentro del bundle: nunca pongas secretos.

## Scripts

| Comando                | Qué hace                        |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Servidor de desarrollo          |
| `npm run build`        | Typecheck y build de producción |
| `npm run preview`      | Sirve el build local            |
| `npm run lint`         | ESLint                          |
| `npm run format`       | Prettier (escribe)              |
| `npm run format:check` | Prettier (solo verifica)        |
| `npm test`             | Vitest, una sola ejecución      |
| `npm run test:watch`   | Vitest en modo observador       |

La CI (`.github/workflows/ci.yml`) corre lint, formato, tests y build en cada PR.

## Estructura

```
src/
  app/          rutas, proveedores y guardas
  components/   piezas de interfaz compartidas
  features/     una carpeta por funcionalidad (auth, atlas, ...)
  lib/api/      cliente HTTP, tipos del contrato y almacenamiento de tokens
  test/         configuración de pruebas
```

## Contrato con el backend

Todos los tipos de la API están en [`src/lib/api/types.ts`](./src/lib/api/types.ts). La fuente
de verdad es `docs/API.md` del repositorio del backend: auth (`/auth/*`), catálogos
(`/regiones`, `/regiones/{id}/categorias`), atlas (`/ejercicios`, `/ejercicios/{id}`,
`/ejercicios/buscar?q=`) y administración (`/admin/ejercicios/**`).

Con `VITE_ATLAS_API=http` el atlas usa el backend real; con `mock` usa datos de ejemplo
(`src/features/atlas/data`, imágenes en `public/mock`). El registro de visitas a una ficha
llama a `POST /ejercicios/{id}/visitas`, endpoint que llegará con la Fase 5 del backend: hasta
entonces responde 404 y el frontend lo ignora sin avisar a la persona.

## Panel de administración

Rutas `/admin` (lista de fichas con filtros y paginación), `/admin/fichas/nueva` y
`/admin/fichas/:id` (formulario por pasos). Solo entra quien tiene `rolSistema` `ADMIN`
(`RequireRole`); el backend lo vuelve a exigir en `/admin/**`. Con `VITE_ATLAS_API=mock` el panel
trabaja con datos en memoria; con `http` usa el backend real.

La multimedia se sube sin pasar por el backend: 1) `POST /admin/ejercicios/{id}/media/subida`
devuelve una URL prefirmada, 2) el archivo se envía con `PUT` a esa URL (con barra de progreso), 3) `POST .../media/{mediaId}/confirmar`. Antes del paso 1 se valida el tipo y el tamaño (video
MP4/WebM/GIF hasta 25 MB, imágenes JPG/PNG/WebP hasta 5 MB). En desarrollo el backend usa
almacenamiento `fake`: su URL es de un dominio `.invalid` y el frontend omite el paso 2. En
producción el bucket de R2 necesita CORS que permita `PUT` con la cabecera `Content-Type` desde
el origen del frontend.

Sesión: los tokens se guardan en `sessionStorage` (se borran al cerrar la pestaña). El cliente
HTTP renueva el access token ante un 401. Al cerrar la pestaña (`pagehide`) se avisa con
`navigator.sendBeacon` a `/auth/cierre-pendiente`; el backend espera 60 s y cancela el cierre
si llega un refresh.

## Diseño

Un solo tipo de letra (Bricolage Grotesque), colores planos definidos como variables CSS en
`src/index.css`, sin gradientes ni sombras en reposo. Mobile-first, contraste AA y foco visible.
