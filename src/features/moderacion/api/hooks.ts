import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siguientePagina } from '@/lib/api';
import { useModeracionApi } from './contexto';

const CLAVE_COLA = ['moderacion', 'cola'] as const;
const CLAVE_PALABRAS = ['moderacion', 'palabras'] as const;

/** Cola de revisión, página a página ("Ver más"). */
export function useColaModeracion() {
  const api = useModeracionApi();
  return useInfiniteQuery({
    queryKey: CLAVE_COLA,
    queryFn: ({ pageParam, signal }) => api.listarRevision(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: siguientePagina,
  });
}

/** Lista de palabras ofensivas filtrada por `q`, página a página. */
export function usePalabras(q: string) {
  const api = useModeracionApi();
  return useInfiniteQuery({
    queryKey: [...CLAVE_PALABRAS, q],
    queryFn: ({ pageParam, signal }) => api.listarPalabras(q, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: siguientePagina,
    // Mientras se teclea la búsqueda se conserva la lista anterior, sin parpadeo.
    placeholderData: (previo) => previo,
  });
}

/** Vuelve a pedir `clave` al terminar, también si falló: un 404 quita la fila ya resuelta. */
function useRefrescar(clave: readonly string[]) {
  const cliente = useQueryClient();
  return { onSettled: () => cliente.invalidateQueries({ queryKey: clave }) };
}

/** Aceptar o eliminar un comentario de la cola. */
export function useAccionesCola() {
  const api = useModeracionApi();
  const opciones = useRefrescar(CLAVE_COLA);
  return {
    aceptar: useMutation({ mutationFn: (id: number) => api.aceptar(id), ...opciones }),
    eliminar: useMutation({ mutationFn: (id: number) => api.eliminar(id), ...opciones }),
  };
}

/** Agregar o eliminar palabras ofensivas. */
export function useAccionesPalabras() {
  const api = useModeracionApi();
  const opciones = useRefrescar(CLAVE_PALABRAS);
  return {
    agregar: useMutation({
      mutationFn: (palabra: string) => api.agregarPalabra(palabra),
      ...opciones,
    }),
    eliminar: useMutation({
      mutationFn: (id: number) => api.eliminarPalabra(id),
      ...opciones,
    }),
  };
}
