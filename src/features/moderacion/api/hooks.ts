import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useModeracionApi } from './contexto';

const CLAVE_MODERACION = ['moderacion'] as const;

/** Cola de revisión, página a página ("Ver más"). */
export function useColaModeracion() {
  const api = useModeracionApi();
  return useInfiniteQuery({
    queryKey: [...CLAVE_MODERACION, 'cola'],
    queryFn: ({ pageParam, signal }) => api.listarRevision(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (ultima) =>
      ultima.page + 1 < ultima.totalPages ? ultima.page + 1 : undefined,
  });
}

/** Lista de palabras ofensivas filtrada por `q`, página a página. */
export function usePalabras(q: string) {
  const api = useModeracionApi();
  return useInfiniteQuery({
    queryKey: [...CLAVE_MODERACION, 'palabras', q],
    queryFn: ({ pageParam, signal }) => api.listarPalabras(q, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (ultima) =>
      ultima.page + 1 < ultima.totalPages ? ultima.page + 1 : undefined,
    // Mientras se teclea la búsqueda se conserva la lista anterior, sin parpadeo.
    placeholderData: (previo) => previo,
  });
}

/** Acciones de moderación; todas invalidan lo de moderación (cola y palabras). */
export function useAccionesModeracion() {
  const api = useModeracionApi();
  const cliente = useQueryClient();
  const opciones = {
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_MODERACION }),
  };
  return {
    aceptar: useMutation({ mutationFn: (id: number) => api.aceptar(id), ...opciones }),
    eliminar: useMutation({ mutationFn: (id: number) => api.eliminar(id), ...opciones }),
    agregarPalabra: useMutation({
      mutationFn: (palabra: string) => api.agregarPalabra(palabra),
      ...opciones,
    }),
    eliminarPalabra: useMutation({
      mutationFn: (id: number) => api.eliminarPalabra(id),
      ...opciones,
    }),
  };
}
