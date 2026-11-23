import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Notice } from '@/components/Notice';
import { useSession } from '@/features/auth/sessionStore';
import type { RolSistema } from '@/lib/api';
import { rutaLocal } from './rutaLocal';

function Cargando() {
  return (
    <div className="px-gutter grid min-h-dvh place-items-center">
      <p role="status" className="font-display text-titulo font-light">
        Cargando…
      </p>
    </div>
  );
}

/** Solo con sesión iniciada; si no, manda al login recordando a dónde iba (HU-16). */
export function RequireAuth() {
  const estado = useSession((s) => s.estado);
  const location = useLocation();
  if (estado === 'iniciando') return <Cargando />;
  if (estado === 'anonimo') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return <Outlet />;
}

/** Pantallas para quien aún no ha iniciado sesión: con sesión activa vuelve al atlas. */
export function PublicOnly() {
  const estado = useSession((s) => s.estado);
  const location = useLocation();
  if (estado === 'iniciando') return <Cargando />;
  if (estado === 'autenticado') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={rutaLocal(from)} replace />;
  }
  return <Outlet />;
}

/** Restringe por rol de sistema (usuario / admin). Se usa dentro de RequireAuth. */
export function RequireRole({ rol }: { rol: RolSistema }) {
  const usuario = useSession((s) => s.usuario);
  if (usuario?.rolSistema !== rol) {
    return (
      <section className="max-w-xl py-10">
        <h1 className="font-display text-titulo">Sin permiso</h1>
        <div className="mt-4">
          <Notice tipo="error">Tu cuenta no tiene acceso a esta sección.</Notice>
        </div>
        <p className="mt-6">
          <Link to="/">Volver al atlas</Link>
        </p>
      </section>
    );
  }
  return <Outlet />;
}
