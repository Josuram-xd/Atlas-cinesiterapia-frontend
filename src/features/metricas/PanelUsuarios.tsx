import { EstadoError } from '@/features/atlas/EstadoError';
import { mensajeDeErrorAtlas } from '@/features/atlas/mensajes';
import { ROLES_PERFIL } from '@/features/auth/roles';
import type { Rango } from '@/lib/api';
import { useUsuariosActivos } from './api/hooks';

const NOMBRE_ROL = Object.fromEntries(ROLES_PERFIL.map((r) => [r.valor, r.nombre]));

/** Usuarios activos por rol de perfil en el periodo (HU-33). */
export function PanelUsuarios({ rango }: { rango: Rango | null }) {
  const activos = useUsuariosActivos(rango);

  let contenido;
  if (!rango) {
    contenido = (
      <p className="text-tinta-2">Corrige las fechas para ver los usuarios activos.</p>
    );
  } else if (activos.isPending) {
    contenido = (
      <p role="status" className="text-tinta-2">
        Cargando usuarios activos…
      </p>
    );
  } else if (activos.isError) {
    contenido = (
      <EstadoError
        mensaje={mensajeDeErrorAtlas(activos.error)}
        onReintentar={() => void activos.refetch()}
      />
    );
  } else if (activos.data.total === 0) {
    contenido = (
      <p role="status" className="bg-fondo-2 px-4 py-5">
        No hubo usuarios activos en este periodo.
      </p>
    );
  } else {
    const { total, porRol } = activos.data;
    contenido = (
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
    );
  }

  return (
    <section aria-labelledby="usuarios-titulo" className="flex flex-col gap-4">
      <h2 id="usuarios-titulo" className="font-display text-2xl font-semibold">
        Usuarios activos por rol
      </h2>
      {contenido}
    </section>
  );
}
