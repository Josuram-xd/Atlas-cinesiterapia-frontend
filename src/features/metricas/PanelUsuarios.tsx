import { ROLES_PERFIL } from '@/features/auth/roles';
import type { Rango } from '@/lib/api';
import { PanelMetrica } from './PanelMetrica';

const NOMBRE_ROL = Object.fromEntries(ROLES_PERFIL.map((r) => [r.valor, r.nombre]));

/** Usuarios activos por rol de perfil en el periodo (HU-33). */
export function PanelUsuarios({ rango }: { rango: Rango | null }) {
  return (
    <PanelMetrica
      id="usuarios"
      titulo="Usuarios activos por rol"
      que="los usuarios activos"
      rango={rango}
      pedir={(api, r, signal) => api.usuariosActivos(r, signal)}
      vacio={(d) => (d.total === 0 ? 'No hubo usuarios activos en este periodo.' : null)}
    >
      {({ total, porRol }) => (
        <div className="flex flex-col gap-4">
          <p className="font-display text-3xl font-semibold">
            {total} {total === 1 ? 'usuario activo' : 'usuarios activos'}
          </p>
          <ul className="flex flex-col gap-2">
            {porRol.map(({ rol, usuarios }) => (
              <li key={rol} className="bg-fondo-2 flex justify-between gap-4 px-4 py-3">
                <span>{NOMBRE_ROL[rol]}</span>
                <span className="font-semibold tabular-nums">{usuarios}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PanelMetrica>
  );
}
