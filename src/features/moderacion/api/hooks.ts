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

/** Aceptar o eliminar; ambas sacan el comentario de la cola, así que vuelven a pedirla. */
export function useAccionesModeracion() {
  const api = useModeracionApi();
  const cliente = useQueryClient();
  const opciones = {
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_MODERACION }),
  };
  return {
    aceptar: useMutation({ mutationFn: (id: number) => api.aceptar(id), ...opciones }),
    eliminar: useMutation({ mutationFn: (id: number) => api.eliminar(id), ...opciones }),
  };
}
