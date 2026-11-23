import { useEffect, useState } from 'react';

/** Devuelve `valor` tras `retrasoMs` sin cambios; útil para no consultar en cada tecla. */
export function useDebounce<T>(valor: T, retrasoMs: number): T {
  const [retrasado, setRetrasado] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setRetrasado(valor), retrasoMs);
    return () => clearTimeout(id);
  }, [valor, retrasoMs]);
  return retrasado;
}
