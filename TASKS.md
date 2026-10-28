# TASKS — Frontend (React + Vite + TypeScript)

Plan de implementación del frontend del Atlas Interactivo de Cinesiterapia.
Cada task es un commit; al terminarla se marca `[x]` en ese mismo commit con el sufijo `[x.y]`.
Rama por task: `task-<n>-<descripcion-corta>`. Las historias de usuario están en el repo del backend (`docs/historias-usuario/`).
El backend y su plan están en `Atlas-cinesiterapia-backend/TASKS.md`.

## Decisiones

| Tema | Decisión |
|---|---|
| Base | React + Vite + TypeScript, React Router |
| Datos | TanStack Query (caché y reintentos); estado de sesión con Zustand |
| Estilos | Tailwind con tokens propios (colores y tipografía en variables CSS) |
| Cuerpo interactivo | **SVG dibujado por nosotros** (sin licencias): silueta estilizada anterior y posterior, una `<path>` por región con `id` = `svg_id` de la región. Zoom animando el `viewBox` (GSAP o Motion) |
| Sesión | Tokens en `sessionStorage` (se borra al cerrar la pestaña, RF_029); `pagehide` + `sendBeacon` para el cierre pendiente de 60 s |
| Offline | PWA con Workbox: caché de la app y de las respuestas GET del atlas (RNF_004) |
| Despliegue | **Vercel** (plan Hobby), variable `VITE_API_URL` |
| Tests | Vitest + Testing Library; Playwright para flujos clave |

## Dirección de diseño

El cuerpo es el menú: al elegir una región la cámara se acerca a esa zona y las 9 categorías aparecen alrededor; después el listado de ejercicios y la ficha. Estilo sobrio: un solo tipo de letra, colores planos, sin gradientes, sin sombras en reposo, sin tarjetas con iconos. Mobile-first (RNF_003). Contraste AA y navegación por teclado en el SVG.

---

## Fase 0 — Fundación
- [x] 0.1 Scaffold Vite + React + TS, Tailwind, ESLint, Prettier, Vitest
- [x] 0.2 Estructura de carpetas (`features/`, `components/`, `lib/api`), cliente HTTP con interceptor de refresh
- [x] 0.3 Tokens de diseño (color, tipografía, espaciado) y layout base
- [x] 0.4 CI en GitHub Actions: lint + test + build
- [x] 0.5 README con cómo correr y variables de entorno

## Fase 1 — Autenticación (HU-16 a HU-20)
- [x] 1.1 Pantalla de login (HU-16)
- [x] 1.2 Pantalla de registro con selección de rol (HU-17)
- [x] 1.3 Recuperar contraseña: solicitud y restablecimiento (HU-18)
- [x] 1.4 Store de sesión, rutas protegidas y guard por rol (usuario / admin)
- [x] 1.5 Cierre de sesión al cerrar la pestaña con periodo de gracia (HU-19)
- [x] 1.6 Hook `useUnsavedChanges` con aviso `beforeunload` y de navegación interna (HU-20)

## Fase 2 — El cuerpo interactivo (HU-01)
- [x] 2.1 Dibujar el SVG del cuerpo: vista anterior y posterior con todas las regiones como paths separados
- [x] 2.2 Componente `BodyAtlas`: regiones clicables, hover, foco con teclado, etiqueta accesible
- [x] 2.3 Alternar vista anterior/posterior con animación
- [x] 2.4 Zoom animado a la región y botón/gesto para volver al cuerpo completo
- [x] 2.5 Gestos táctiles: tocar región, pellizco y arrastre en móvil
- [x] 2.6 Menú de las 9 categorías alrededor de la región ampliada
- [x] 2.7 Panel con el listado de ejercicios de la categoría
- [x] 2.8 Estados de carga, vacío y error

## Fase 3 — Ficha y búsqueda (HU-02, HU-03)
- [x] 3.1 Vista de ficha completa por secciones (información general, protocolo clínico, ejecución, dosificación)
- [x] 3.2 Reproductor de video y galería de imágenes con visor
- [x] 3.3 Barra de búsqueda con debounce y resultados que llevan a la ficha
- [x] 3.4 Registro de visita al abrir una ficha

## Fase 4 — Panel de administración (HU-04 a HU-15)
- [x] 4.1 Lista de fichas con filtros por estado, región y categoría (todas las de todos los admin)
- [x] 4.2 Formulario de ficha por pasos: información general, protocolo, ejecución, dosificación, multimedia, metadatos académicos
- [x] 4.3 Subida de video e imágenes con barra de progreso y validación de tamaño/tipo
- [x] 4.4 Guardar borrador y publicar mostrando los campos faltantes
- [x] 4.5 Editar ficha publicada
- [x] 4.6 Archivar, restaurar y eliminar con confirmación

## Fase 5 — Comentarios y moderación (HU-21 a HU-29)
- [ ] 5.1 Lista de comentarios con hilos y formulario de nuevo comentario
- [ ] 5.2 Editar y eliminar comentario propio
- [ ] 5.3 Estado "esperando revisión": atenuado en gris, ícono de advertencia a la derecha y mensaje (RF_045)
- [ ] 5.4 Reportar comentario
- [ ] 5.5 Página de moderación: ocultados y reportados, aceptar y eliminar
- [ ] 5.6 Gestión de palabras ofensivas (admin)

## Fase 6 — Métricas (HU-30 a HU-34)
- [ ] 6.1 Página de métricas protegida para admin
- [ ] 6.2 Gráfico de visitas por periodo con selector de rango
- [ ] 6.3 Ranking de ejercicios más consultados
- [ ] 6.4 Usuarios activos por rol
- [ ] 6.5 Tiempo promedio de uso por sesión
- [ ] 6.6 Ping de sesión para alimentar la métrica de tiempo

## Fase 7 — Offline, calidad y despliegue (RNF_003, RNF_004)
- [ ] 7.1 PWA: manifest, íconos, service worker, caché de app y de GET del atlas
- [ ] 7.2 Indicador de modo sin conexión y deshabilitar acciones de escritura
- [ ] 7.3 Pruebas E2E con Playwright: login, explorar por región, ver ficha, comentar, publicar ficha
- [ ] 7.4 Auditoría de accesibilidad y rendimiento (Lighthouse), revisión en móvil/tablet/PC
- [ ] 7.5 Despliegue en Vercel con `VITE_API_URL` y reescritura para SPA
