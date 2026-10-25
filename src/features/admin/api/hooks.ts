import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EjercicioRequest, FiltroFichas } from '@/lib/api';
import { useAdminApi } from './contexto';

export const CLAVE_FICHAS = ['admin', 'fichas'] as const;

export function useFichasAdmin(filtro: FiltroFichas) {
  const api = useAdminApi();
  return useQuery({
    queryKey: [...CLAVE_FICHAS, 'lista', filtro],
    queryFn: ({ signal }) => api.listarFichas(filtro, signal),
    // Mientras llega la página nueva se conserva la anterior para que la lista no parpadee.
    placeholderData: (previo) => previo,
  });
}

export function useFichaAdmin(id: number | null) {
  const api = useAdminApi();
  return useQuery({
    queryKey: [...CLAVE_FICHAS, 'detalle', id],
    queryFn: ({ signal }) => api.obtenerFicha(id!, signal),
    enabled: id !== null,
    // El formulario se hidrata una vez; no se recarga solo bajo los pies de quien edita.
    staleTime: Infinity,
    gcTime: 0,
  });
}

export function useCategoriasAdmin() {
  const api = useAdminApi();
  return useQuery({
    queryKey: ['admin', 'categorias'],
    queryFn: ({ signal }) => api.listarCategorias(signal),
    staleTime: Infinity,
  });
}

/** Operaciones que cambian una ficha; todas invalidan la lista. */
export function useAccionesFicha() {
  const api = useAdminApi();
  const cliente = useQueryClient();
  const invalidar = () => cliente.invalidateQueries({ queryKey: CLAVE_FICHAS });
  const opciones = { onSuccess: invalidar };
  return {
    crear: useMutation({
      mutationFn: (d: EjercicioRequest) => api.crearFicha(d),
      ...opciones,
    }),
    actualizar: useMutation({
      mutationFn: ({ id, datos }: { id: number; datos: EjercicioRequest }) =>
        api.actualizarFicha(id, datos),
      ...opciones,
    }),
    publicar: useMutation({
      mutationFn: (id: number) => api.publicarFicha(id),
      ...opciones,
    }),
    archivar: useMutation({
      mutationFn: (id: number) => api.archivarFicha(id),
      ...opciones,
    }),
    restaurar: useMutation({
      mutationFn: (id: number) => api.restaurarFicha(id),
      ...opciones,
    }),
    eliminar: useMutation({
      mutationFn: (id: number) => api.eliminarFicha(id),
      ...opciones,
    }),
  };
}
