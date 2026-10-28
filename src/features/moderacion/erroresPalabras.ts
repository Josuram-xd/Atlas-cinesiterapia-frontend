import { ApiError } from '@/lib/api';
import { describirError } from '../admin/erroresAdmin';

const MENSAJES_POR_CODIGO: Record<string, string> = {
  VALIDATION_ERROR: 'La palabra debe tener entre 1 y 60 caracteres.',
  PALABRA_INVALIDA: 'Una palabra debe tener al menos 3 letras.',
  PALABRA_DUPLICADA: 'Esa palabra ya está en la lista, aunque se escriba distinto.',
  PALABRA_NO_ENCONTRADA: 'Esa palabra ya no está en la lista.',
};

/** Mensajes propios de las palabras; lo demás (red, sesión, servidor) sale del panel de administración. */
export function mensajeErrorPalabra(error: unknown): string {
  const codigo = error instanceof ApiError ? error.code : undefined;
  return (codigo && MENSAJES_POR_CODIGO[codigo]) || describirError(error).mensaje;
}
