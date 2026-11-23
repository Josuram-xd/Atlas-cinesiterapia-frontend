import { describe, expect, it, vi } from 'vitest';
import type { AdminApi } from '../api/adminApi';
import { ArchivoInvalidoError, subirMedia } from './subida';
import { formatearTamano, REGLAS_MEDIA, validarArchivo } from './validacion';

const archivo = (tipo: string, bytes: number, nombre = 'a') =>
  new File([new Uint8Array(Math.min(bytes, 10))], nombre, { type: tipo });
const conTamano = (f: File, size: number) => {
  Object.defineProperty(f, 'size', { value: size });
  return f;
};

describe('validarArchivo', () => {
  it('acepta los formatos y tamaños permitidos', () => {
    expect(validarArchivo({ type: 'image/png', size: 1000 }, 'IMAGEN', 0)).toBeNull();
    expect(validarArchivo({ type: 'video/webm', size: 1000 }, 'VIDEO', 0)).toBeNull();
    expect(validarArchivo({ type: 'image/gif', size: 1000 }, 'VIDEO', 0)).toBeNull();
    expect(
      validarArchivo(
        { type: 'image/jpeg', size: REGLAS_MEDIA.IMAGEN.maxBytes },
        'IMAGEN',
        7,
      ),
    ).toBeNull();
  });

  it('rechaza formatos que no corresponden al tipo', () => {
    expect(validarArchivo({ type: 'image/gif', size: 10 }, 'IMAGEN', 0)).toMatch(
      /Formato/,
    );
    expect(validarArchivo({ type: 'video/mp4', size: 10 }, 'IMAGEN', 0)).toMatch(
      /Formato/,
    );
    expect(validarArchivo({ type: 'image/png', size: 10 }, 'VIDEO', 0)).toMatch(
      /Formato/,
    );
    expect(validarArchivo({ type: '', size: 10 }, 'IMAGEN', 0)).toMatch(/Formato/);
    expect(validarArchivo({ type: 'application/pdf', size: 10 }, 'IMAGEN', 0)).toMatch(
      /Formato/,
    );
  });

  it('rechaza archivos vacíos o demasiado pesados', () => {
    expect(validarArchivo({ type: 'image/png', size: 0 }, 'IMAGEN', 0)).toMatch(/vacío/);
    expect(
      validarArchivo(
        { type: 'image/png', size: REGLAS_MEDIA.IMAGEN.maxBytes + 1 },
        'IMAGEN',
        0,
      ),
    ).toMatch(/5 MB/);
    expect(
      validarArchivo(
        { type: 'video/mp4', size: REGLAS_MEDIA.VIDEO.maxBytes + 1 },
        'VIDEO',
        0,
      ),
    ).toMatch(/25 MB/);
  });

  it('respeta la cantidad máxima por ficha', () => {
    expect(validarArchivo({ type: 'video/mp4', size: 10 }, 'VIDEO', 1)).toMatch(
      /ya tiene un video/,
    );
    expect(validarArchivo({ type: 'image/png', size: 10 }, 'IMAGEN', 8)).toMatch(
      /8 imágenes/,
    );
  });
});

describe('formatearTamano', () => {
  it('usa KB o MB según el peso', () => {
    expect(formatearTamano(2048)).toBe('2 KB');
    expect(formatearTamano(5_242_880)).toBe('5 MB');
    expect(formatearTamano(1_572_864)).toBe('1.5 MB');
  });
});

describe('subirMedia', () => {
  function apiFalsa() {
    const orden: string[] = [];
    const api = {
      solicitarSubida: vi.fn(async () => {
        orden.push('1-solicitar');
        return {
          mediaId: 7,
          urlSubida: 'https://r2.ejemplo.com/x',
          metodo: 'PUT' as const,
          cabeceras: { 'Content-Type': 'image/png' },
          expiraEn: '2026-10-25T14:40:00Z',
        };
      }),
      subirArchivo: vi.fn(async (_s, _a, onProgreso: (f: number) => void) => {
        orden.push('2-subir');
        onProgreso(0.5);
        onProgreso(1);
      }),
      confirmarMedia: vi.fn(async () => {
        orden.push('3-confirmar');
        return { id: 7, estado: 'CONFIRMADO' } as never;
      }),
    } as unknown as AdminApi;
    return { api, orden };
  }

  it('sigue los tres pasos en orden y entrega el progreso', async () => {
    const { api, orden } = apiFalsa();
    const progreso = vi.fn();
    const media = await subirMedia({
      api,
      fichaId: 3,
      archivo: archivo('image/png', 2000, 'inicio.png'),
      tipo: 'IMAGEN',
      rol: 'POSICION_INICIAL',
      yaSubidos: 0,
      onProgreso: progreso,
    });
    expect(orden).toEqual(['1-solicitar', '2-subir', '3-confirmar']);
    expect(api.solicitarSubida).toHaveBeenCalledWith(3, {
      tipo: 'IMAGEN',
      rol: 'POSICION_INICIAL',
      nombreArchivo: 'inicio.png',
      contentType: 'image/png',
      tamanoBytes: expect.any(Number),
    });
    expect(api.confirmarMedia).toHaveBeenCalledWith(3, 7);
    expect(progreso).toHaveBeenLastCalledWith(1);
    expect(media.id).toBe(7);
  });

  it('no manda rol en un video', async () => {
    const { api } = apiFalsa();
    await subirMedia({
      api,
      fichaId: 3,
      archivo: archivo('video/mp4', 10, 'v.mp4'),
      tipo: 'VIDEO',
      rol: 'POSICION_INICIAL',
      yaSubidos: 0,
      onProgreso: () => {},
    });
    expect(vi.mocked(api.solicitarSubida).mock.calls[0][1].rol).toBeUndefined();
  });

  it('valida antes de pedir la URL: un archivo pesado no llega al backend', async () => {
    const { api } = apiFalsa();
    const grande = conTamano(archivo('image/png', 10), REGLAS_MEDIA.IMAGEN.maxBytes + 1);
    await expect(
      subirMedia({
        api,
        fichaId: 3,
        archivo: grande,
        tipo: 'IMAGEN',
        rol: 'OTRO',
        yaSubidos: 0,
        onProgreso: () => {},
      }),
    ).rejects.toBeInstanceOf(ArchivoInvalidoError);
    expect(api.solicitarSubida).not.toHaveBeenCalled();
  });

  it('si falla el PUT no confirma', async () => {
    const { api } = apiFalsa();
    vi.mocked(api.subirArchivo).mockRejectedValueOnce(new Error('403'));
    await expect(
      subirMedia({
        api,
        fichaId: 3,
        archivo: archivo('image/png', 10),
        tipo: 'IMAGEN',
        rol: 'OTRO',
        yaSubidos: 0,
        onProgreso: () => {},
      }),
    ).rejects.toThrow('403');
    expect(api.confirmarMedia).not.toHaveBeenCalled();
  });
});
