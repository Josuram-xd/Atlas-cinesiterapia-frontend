import { NetworkError } from '@/lib/api';

/** Error del almacenamiento (R2) al recibir el archivo: firma vencida, tamaño o tipo no coinciden. */
export class SubidaRechazadaError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`El almacenamiento rechazó el archivo (${status})`);
    this.name = 'SubidaRechazadaError';
    this.status = status;
  }
}

/**
 * En desarrollo el backend (`MEDIA_PROVIDER=fake`) devuelve una URL de un dominio `.invalid`
 * que no existe: el paso 2 se omite y el backend da por subido el archivo.
 */
export function esUrlFicticia(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.invalid');
  } catch {
    return false;
  }
}

/**
 * `PUT` del archivo crudo con las cabeceras exactas de la URL prefirmada. Usa XHR porque
 * `fetch` no informa del progreso de subida. No envía `Authorization` ni cookies.
 */
export function putConProgreso(
  url: string,
  cabeceras: Record<string, string>,
  archivo: Blob,
  onProgreso: (fraccion: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolver, rechazar) => {
    // La URL la entrega el backend: solo se acepta http(s), nunca otros esquemas.
    if (!/^https?:\/\//i.test(url)) return rechazar(new SubidaRechazadaError(0));
    if (signal?.aborted) return rechazar(new DOMException('Cancelado', 'AbortError'));
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    for (const [nombre, valor] of Object.entries(cabeceras)) {
      xhr.setRequestHeader(nombre, valor);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) onProgreso(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgreso(1);
        resolver();
      } else {
        rechazar(new SubidaRechazadaError(xhr.status));
      }
    };
    xhr.onerror = () => rechazar(new NetworkError());
    xhr.onabort = () => rechazar(new DOMException('Cancelado', 'AbortError'));
    signal?.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(archivo);
  });
}
