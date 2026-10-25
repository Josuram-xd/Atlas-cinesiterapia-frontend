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

| Variable       | Descripción                                                       | Ejemplo                 |
| -------------- | ----------------------------------------------------------------- | ----------------------- |
| `VITE_API_URL` | URL base del backend, sin barra final. Obligatoria en producción. | `http://localhost:8080` |

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

Todos los tipos de la API están en [`src/lib/api/types.ts`](./src/lib/api/types.ts). Mientras
el backend no esté desplegado, el contrato es el descrito en su `TASKS.md`:
`POST /auth/registro`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/recuperar`,
`/auth/restablecer` y `/auth/cierre-pendiente`.

Sesión: los tokens se guardan en `sessionStorage` (se borran al cerrar la pestaña). El cliente
HTTP renueva el access token ante un 401. Al cerrar la pestaña (`pagehide`) se avisa con
`navigator.sendBeacon` a `/auth/cierre-pendiente`; el backend espera 60 s y cancela el cierre
si llega un refresh.

## Diseño

Un solo tipo de letra (Bricolage Grotesque), colores planos definidos como variables CSS en
`src/index.css`, sin gradientes ni sombras en reposo. Mobile-first, contraste AA y foco visible.
