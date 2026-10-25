import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { useSession } from '@/features/auth/sessionStore';

/** Marco de las pantallas con sesión: cabecera con el usuario y el cierre de sesión. */
export function AppShell() {
  const navigate = useNavigate();
  const usuario = useSession((s) => s.usuario);
  const cerrarSesion = useSession((s) => s.cerrarSesion);

  function salir() {
    navigate('/login', { replace: true });
    void cerrarSesion();
  }

  return (
    <AppLayout
      actions={
        <>
          {usuario?.rolSistema === 'ADMIN' ? (
            <Link to="/admin">Administración</Link>
          ) : null}
          <span className="text-tinta-2 max-sm:hidden">{usuario?.correo}</span>
          <Button
            variante="secundario"
            onClick={salir}
            className="min-h-10 px-4 py-1.5 whitespace-nowrap"
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
