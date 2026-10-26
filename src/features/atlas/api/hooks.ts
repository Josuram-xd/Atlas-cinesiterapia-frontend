import { useQuery } from '@tanstack/react-query';
import { useAtlasApi } from './contexto';

/** El catálogo cambia muy poco: se conserva mientras la pestaña esté abierta. */
const CATALOGO = { staleTime: Infinity, gcTime: Infinity } as const;

export function useRegiones() {
  const api = useAtlasApi();
  return useQuery({
    queryKey: ['atlas', 'regiones'],
    queryFn: ({ signal }) => api.listarRegiones(signal),
    ...CATALOGO,
  });
}

export function useCategorias(regionId: number | null) {
  const api = useAtlasApi();
  return useQuery({
    queryKey: ['atlas', 'categorias', regionId],
    queryFn: ({ signal }) => api.listarCategorias(regionId!, signal),
    enabled: regionId !== null,
    ...CATALOGO,
  });
}

export function useEjercicios(regionId: number | null, categoriaId: number | null) {
  const api = useAtlasApi();
  return useQuery({
    queryKey: ['atlas', 'ejercicios', regionId, categoriaId],
    queryFn: ({ signal }) =>
      api.listarEjercicios({ regionId: regionId!, categoriaId: categoriaId! }, signal),
    enabled: regionId !== null && categoriaId !== null,
    staleTime: 60_000,
  });
}
