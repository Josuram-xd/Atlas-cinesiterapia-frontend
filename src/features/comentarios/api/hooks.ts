import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useComentariosApi } from './contexto';

export const claveComentarios = (ejercicioId: number) =>
  ['comentarios', ejercicioId] as const;

/** Comentarios raíz de una ficha, página a página ("Ver más comentarios"). */
export function useComentarios(ejercicioId: number) {
  const api = useComentariosApi();
  return useInfiniteQuery({
    queryKey: claveComentarios(ejercicioId),
    queryFn: ({ pageParam, signal }) => api.listar(ejercicioId, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (ultima) =>
      ultima.page + 1 < ultima.totalPages ? ultima.page + 1 : undefined,
    // Dependen de quien consulta: siempre se piden de nuevo al volver a la ficha.
    staleTime: 0,
  });
}

/** Operaciones sobre los comentarios de una ficha; todas vuelven a pedir la lista. */
export function useAccionesComentario(ejercicioId: number) {
  const api = useComentariosApi();
  const cliente = useQueryClient();
  const invalidar = () =>
    cliente.invalidateQueries({ queryKey: claveComentarios(ejercicioId) });
  const opciones = { onSuccess: invalidar };
  return {
    crear: useMutation({
      mutationFn: (texto: string) => api.crear(ejercicioId, texto),
      ...opciones,
    }),
    responder: useMutation({
      mutationFn: ({ id, texto }: { id: number; texto: string }) =>
        api.responder(id, texto),
      ...opciones,
    }),
    editar: useMutation({
      mutationFn: ({ id, texto }: { id: number; texto: string }) => api.editar(id, texto),
      ...opciones,
    }),
    eliminar: useMutation({
      mutationFn: (id: number) => api.eliminar(id),
      ...opciones,
    }),
  };
}
