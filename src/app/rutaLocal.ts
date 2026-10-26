/** Solo acepta rutas internas ("/x"); evita redirecciones abiertas a otros sitios. */
export function rutaLocal(destino?: string): string {
  return destino && /^\/(?![/\\])/.test(destino) ? destino : '/';
}
