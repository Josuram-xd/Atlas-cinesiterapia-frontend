import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import type { SubidaPrefirmada } from '@/lib/api';
import { consultaFichas, httpAdminApi } from './httpAdminApi';
import { esUrlFicticia, putConProgreso, SubidaRechazadaError } from './putConProgreso';

afterEach(() => vi.restoreAllMocks());

describe('consultaFichas', () => {
  it('manda solo los filtros con valor y la paginación por defecto', () => {
    expect(consultaFichas({})).toBe('page=0&size=20');
    expect(
      consultaFichas({
        estado: 'PUBLICADO',
        regionId: 3,
        categoriaId: 2,
        q: ' rodilla ',
        page: 2,
        size: 10,
      }),
    ).toBe('estado=PUBLICADO&regionId=3&categoriaId=2&q=rodilla&page=2&size=10');
  });
});

describe('httpAdminApi', () => {
  it('usa las rutas del contrato', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({});
    const post = vi.spyOn(api, 'post').mockResolvedValue({});
    const put = vi.spyOn(api, 'put').mockResolvedValue({});
    const del = vi.spyOn(api, 'delete').mockResolvedValue(undefined);
    await httpAdminApi.listarFichas({ estado: 'BORRADOR' });
    await httpAdminApi.obtenerFicha(4);
    await httpAdminApi.listarCategorias();
    await httpAdminApi.crearFicha({} as never);
    await httpAdminApi.actualizarFicha(4, {} as never);
    await httpAdminApi.publicarFicha(4);
    await httpAdminApi.archivarFicha(4);
    await httpAdminApi.restaurarFicha(4);
    await httpAdminApi.eliminarFicha(4);
    await httpAdminApi.eliminarMedia(4, 9);
    await httpAdminApi.confirmarMedia(4, 9);
    await httpAdminApi.solicitarSubida(4, {
      tipo: 'VIDEO',
      nombreArchivo: 'v.mp4',
      contentType: 'video/mp4',
      tamanoBytes: 5,
    });
    expect(get.mock.calls.map((c) => c[0])).toEqual([
      '/admin/ejercicios?estado=BORRADOR&page=0&size=20',
      '/admin/ejercicios/4',
      '/categorias',
    ]);
    expect(post.mock.calls.map((c) => c[0])).toEqual([
      '/admin/ejercicios',
      '/admin/ejercicios/4/publicar',
      '/admin/ejercicios/4/archivar',
      '/admin/ejercicios/4/restaurar',
      '/admin/ejercicios/4/media/9/confirmar',
      '/admin/ejercicios/4/media/subida',
    ]);
    expect(put.mock.calls[0][0]).toBe('/admin/ejercicios/4');
    expect(del.mock.calls.map((c) => c[0])).toEqual([
      '/admin/ejercicios/4',
      '/admin/ejercicios/4/media/9',
    ]);
  });

  it('omite el PUT cuando la URL de subida es ficticia (almacenamiento fake)', async () => {
    const subida: SubidaPrefirmada = {
      mediaId: 1,
      urlSubida: 'https://almacenamiento-fake.invalid/x.png?firma=fake',
      metodo: 'PUT',
      cabeceras: { 'Content-Type': 'image/png' },
      expiraEn: '2026-10-25T14:40:00Z',
    };
    const progreso = vi.fn();
    await httpAdminApi.subirArchivo(subida, new Blob(['x']), progreso);
    expect(progreso).toHaveBeenCalledWith(1);
  });
});

describe('esUrlFicticia', () => {
  it('distingue el dominio .invalid de uno real', () => {
    expect(esUrlFicticia('https://almacenamiento-fake.invalid/a')).toBe(true);
    expect(esUrlFicticia('https://cuenta.r2.cloudflarestorage.com/a')).toBe(false);
    expect(esUrlFicticia('no es url')).toBe(false);
  });
});

describe('putConProgreso', () => {
  class XhrFalso {
    static ultimo: XhrFalso;
    metodo = '';
    url = '';
    cabeceras: Record<string, string> = {};
    enviado: Blob | null = null;
    status = 200;
    upload: { onprogress: ((e: unknown) => void) | null } = { onprogress: null };
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onabort: (() => void) | null = null;
    constructor() {
      XhrFalso.ultimo = this;
    }
    open(m: string, u: string) {
      this.metodo = m;
      this.url = u;
    }
    setRequestHeader(n: string, v: string) {
      this.cabeceras[n] = v;
    }
    send(b: Blob) {
      this.enviado = b;
    }
    abort() {
      this.onabort?.();
    }
  }

  it('hace PUT con las cabeceras indicadas e informa el progreso', async () => {
    vi.stubGlobal('XMLHttpRequest', XhrFalso);
    const progreso = vi.fn();
    const promesa = putConProgreso(
      'https://r2.ejemplo.com/a',
      { 'Content-Type': 'image/png' },
      new Blob(['abc']),
      progreso,
    );
    const xhr = XhrFalso.ultimo;
    expect(xhr.metodo).toBe('PUT');
    expect(xhr.cabeceras).toEqual({ 'Content-Type': 'image/png' });
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 1, total: 4 });
    expect(progreso).toHaveBeenLastCalledWith(0.25);
    xhr.onload?.();
    await expect(promesa).resolves.toBeUndefined();
    expect(progreso).toHaveBeenLastCalledWith(1);
    vi.unstubAllGlobals();
  });

  it('rechaza si el almacenamiento responde con error', async () => {
    vi.stubGlobal('XMLHttpRequest', XhrFalso);
    const promesa = putConProgreso(
      'https://r2.ejemplo.com/a',
      {},
      new Blob(['a']),
      vi.fn(),
    );
    XhrFalso.ultimo.status = 403;
    XhrFalso.ultimo.onload?.();
    await expect(promesa).rejects.toBeInstanceOf(SubidaRechazadaError);
    vi.unstubAllGlobals();
  });

  it('se cancela con la señal', async () => {
    vi.stubGlobal('XMLHttpRequest', XhrFalso);
    const control = new AbortController();
    const promesa = putConProgreso(
      'https://r2.ejemplo.com/a',
      {},
      new Blob(['a']),
      vi.fn(),
      control.signal,
    );
    control.abort();
    await expect(promesa).rejects.toMatchObject({ name: 'AbortError' });
    vi.unstubAllGlobals();
  });
});
