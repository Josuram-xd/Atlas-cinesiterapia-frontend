import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { BuscadorEjercicios } from '@/features/atlas/busqueda/BuscadorEjercicios';
import { useSession } from '@/features/auth/sessionStore';

/** Marco de las pantallas con sesión: cabecera con el usuario y el cierre de sesión. */
export function AppShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const usuario = useSession((s) => s.usuario);
  const cerrarSesion = useSession((s) => s.cerrarSesion);

  function salir() {
    navigate('/login', { replace: true });
    void cerrarSesion();
  }

  return (
    <AppLayout
      // La clave reinicia la búsqueda (texto y lista) al cambiar de pantalla.
      centro={<BuscadorEjercicios key={pathname} />}
      navegacion={
        usuario?.rolSistema === 'ADMIN' ? (
          <nav aria-label="Administración" className="flex w-max gap-1">
            <NavLink to="/admin" end className="chip">
              Administración
            </NavLink>
            <NavLink to="/admin/moderacion" className="chip">
              Moderación
            </NavLink>
            <NavLink to="/admin/palabras-ofensivas" className="chip">
              Palabras ofensivas
            </NavLink>
            <NavLink to="/admin/metricas" className="chip">
              Métricas
            </NavLink>
          </nav>
        ) : null
      }
      actions={
        <>
          <span className="text-tinta-2 max-w-[16ch] truncate max-2xl:hidden">
            {usuario?.correo}
          </span>
          <Button
            variante="secundario"
            onClick={salir}
            className="min-h-11 px-4 py-1.5 whitespace-nowrap"
          >
            Cerrar sesión
          </Button>
        </>
      }
    >
      <Outlet />
    </AppLayout>
  );
}
