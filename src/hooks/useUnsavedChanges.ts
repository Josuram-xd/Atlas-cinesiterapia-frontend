import { useEffect } from 'react';
import { useBlocker, type Blocker } from 'react-router-dom';

export const MENSAJE_CAMBIOS_SIN_GUARDAR =
  'Tienes cambios sin guardar. ¿Seguro que quieres salir?';

/**
 * Avisa antes de perder cambios sin guardar (HU-20):
 * - Cerrar o recargar la pestaña: diálogo nativo del navegador (`beforeunload`).
 * - Navegar dentro de la app: devuelve un `blocker` de React Router; la pantalla
 *   muestra <ConfirmarSalida blocker={blocker} /> para que la persona decida.
 * Requiere un router de datos (createBrowserRouter).
 */
export function useUnsavedChanges(hayCambios: boolean): Blocker {
  useEffect(() => {
    if (!hayCambios) return;
    function alCerrar(evento: BeforeUnloadEvent) {
      evento.preventDefault();
      // Algunos navegadores todavía exigen returnValue para mostrar el aviso.
      evento.returnValue = '';
    }
    window.addEventListener('beforeunload', alCerrar);
    return () => window.removeEventListener('beforeunload', alCerrar);
  }, [hayCambios]);

  return useBlocker(
    ({ currentLocation, nextLocation }) =>
      hayCambios &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search),
  );
}
