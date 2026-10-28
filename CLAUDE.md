# Flujo de ramas (este proyecto)

Reemplaza la regla global "PR hacia main"; el resto de reglas globales sigue igual (commits por subtarea, Conventional Commits en inglés, sin coautoría de IA, nada de merge/rebase/tag/push a `main`).

- `main`: solo código liberado. Se actualiza con PRs de release `develop` → `main`; las versiones las publica el dueño.
- `develop`: rama de integración. **Todo PR de feature va hacia `develop`**, nunca hacia `main`.
- Features: `task-<n>-<descripcion-corta>` desde `develop`, un commit por subtarea, `[x.y]` y `[x]` en `TASKS.md` en el mismo commit.
- Hotfix: rama `hotfix-<descripcion>` desde `main`, PR a `main`, y después un PR `main` → `develop` para que no diverjan.
- Los merges de PR los hace el dueño.
