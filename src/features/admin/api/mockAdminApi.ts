import { ApiError } from '@/lib/api';
import type {
  EjercicioAdmin,
  EjercicioAdminResumen,
  EjercicioRequest,
  EstadoFicha,
  FiltroFichas,
  MediaAdmin,
  Pagina,
} from '@/lib/api';
import { CATEGORIAS_MOCK, REGIONES_MOCK } from '../../atlas/data/regiones';
import type { AdminApi } from './adminApi';

const DOSIS = [
  'series',
  'repeticiones',
  'intensidad',
  'tiempo',
  'descanso',
  'frecuencia',
] as const;

/** Mismas reglas que el backend (`ValidadorPublicacion`), en el mismo orden. */
export function camposFaltantesMock(e: EjercicioAdmin): string[] {
  const falta: string[] = [];
  const vacio = (v: string | null | undefined) => !v || !v.trim();
  for (const c of [
    'objetivoTerapeutico',
    'estructurasIntervenidas',
    'indicaciones',
    'precaucionesContraindicaciones',
    'posicionPaciente',
    'posicionFisioterapeuta',
    'ejecucion',
    'comandosVerbales',
  ] as const) {
    if (vacio(e[c])) falta.push(c);
  }
  for (const d of DOSIS) if (vacio(e.dosificacion?.[d])) falta.push(`dosificacion.${d}`);
  if (!e.media.some((m) => m.estado === 'CONFIRMADO')) falta.push('media');
  if (!e.estudiantesCreadores || e.estudiantesCreadores.length === 0) {
    falta.push('estudiantesCreadores');
  }
  if (vacio(e.cohorte)) falta.push('cohorte');
  if (vacio(e.profesoraRevisora)) falta.push('profesoraRevisora');
  return falta;
}

function esperar(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolver, rechazar) => {
    const id = setTimeout(resolver, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      rechazar(new DOMException('Cancelado', 'AbortError'));
    });
  });
}

const yo = { id: 2, correo: 'admin@correo.com' };
const otra = { id: 3, correo: 'profe@correo.com' };

function semilla(): EjercicioAdmin[] {
  const base = (
    id: number,
    estado: EstadoFicha,
    nombre: string,
    regionId: number,
    categoriaId: number,
    autor = yo,
  ) => {
    const region = REGIONES_MOCK.find((r) => r.id === regionId)!;
    const categoria = CATEGORIAS_MOCK.find((c) => c.id === categoriaId)!;
    const e: EjercicioAdmin = {
      id,
      estado,
      nombre,
      region: { id: region.id, nombre: region.nombre, svgId: region.svgId },
      categoria: { id: categoria.id, nombre: categoria.nombre },
      objetivoTerapeutico: 'Recuperar el rango articular.',
      estructurasIntervenidas: 'Cápsula y musculatura periarticular.',
      indicaciones: 'Rigidez posterior a inmovilización.',
      precaucionesContraindicaciones: 'Suspender ante dolor agudo.',
      posicionPaciente: 'Cómoda y estable.',
      posicionFisioterapeuta: 'De pie junto al paciente.',
      ejecucion: 'Movimiento lento y controlado.',
      comandosVerbales: 'Relájese, ahora despacio.',
      dosificacion: {
        series: '3',
        repeticiones: '10',
        intensidad: 'Leve',
        tiempo: '2 s',
        descanso: '60 s',
        frecuencia: 'Diaria',
      },
      progresion: null,
      erroresComunes: null,
      estudiantesCreadores: ['Laura Gómez'],
      cohorte: '2025-1',
      profesoraRevisora: 'Dra. María Rojas',
      media: [
        {
          id: id * 10,
          tipo: 'IMAGEN',
          rol: 'POSICION_INICIAL',
          contentType: 'image/svg+xml',
          tamanoBytes: 900,
          url: '/mock/posicion-inicial.svg',
          orden: 1,
          estado: 'CONFIRMADO',
        },
      ],
      creadoPor: autor,
      actualizadoPor: null,
      creadoEn: '2026-10-01T10:00:00Z',
      actualizadoEn: `2026-10-${String(10 + id).padStart(2, '0')}T10:00:00Z`,
      publicadoEn: estado === 'BORRADOR' ? null : '2026-10-05T10:00:00Z',
      archivadoEn: estado === 'ARCHIVADO' ? '2026-10-08T10:00:00Z' : null,
      camposFaltantes: [],
      version: 1,
    };
    return e;
  };
  const borrador = base(
    3,
    'BORRADOR',
    'Elevación activa en el plano escapular',
    2,
    3,
    otra,
  );
  borrador.indicaciones = null;
  borrador.dosificacion = { series: '3' };
  borrador.media = [];
  borrador.camposFaltantes = camposFaltantesMock(borrador);
  return [
    base(1, 'PUBLICADO', 'Flexoextensión pasiva de rodilla', 11, 1),
    base(2, 'PUBLICADO', 'Péndulo de Codman', 2, 1, otra),
    borrador,
    base(4, 'ARCHIVADO', 'Rodillas al pecho', 114, 5),
  ];
}

/** Administración en memoria con las mismas reglas del backend, para trabajar sin servidor. */
export function crearMockAdminApi({ latenciaMs = 0 } = {}): AdminApi {
  let fichas = semilla();
  let siguienteId = 100;
  let siguienteMedia = 1000;

  const espera = (signal?: AbortSignal) => esperar(latenciaMs, signal);
  const copia = <T>(v: T): T => structuredClone(v);
  const no404 = (): never => {
    throw new ApiError(404, {
      code: 'EJERCICIO_NO_ENCONTRADO',
      message: 'Ejercicio no encontrado',
    });
  };
  const buscar = (id: number) => fichas.find((f) => f.id === id) ?? no404();
  const refrescar = (f: EjercicioAdmin) => {
    f.camposFaltantes = camposFaltantesMock(f);
    f.actualizadoEn = new Date().toISOString();
    f.version += 1;
  };
  const aplicar = (f: EjercicioAdmin, d: EjercicioRequest) => {
    const region = REGIONES_MOCK.find((r) => r.id === d.regionId);
    const categoria = CATEGORIAS_MOCK.find((c) => c.id === d.categoriaId);
    if (!region)
      throw new ApiError(400, { code: 'REGION_INVALIDA', message: 'Region invalida' });
    if (!categoria) {
      throw new ApiError(400, {
        code: 'CATEGORIA_INVALIDA',
        message: 'Categoria invalida',
      });
    }
    Object.assign(f, d, {
      region: { id: region.id, nombre: region.nombre, svgId: region.svgId },
      categoria: { id: categoria.id, nombre: categoria.nombre },
    });
  };
  const exigirCompleta = (f: EjercicioAdmin) => {
    const falta = camposFaltantesMock(f);
    if (falta.length > 0) {
      throw new ApiError(422, {
        code: 'FICHA_INCOMPLETA',
        message: 'La ficha tiene campos obligatorios pendientes',
        fieldErrors: falta.map((field) => ({
          field,
          message:
            field === 'media'
              ? 'Agrega al menos una imagen o un video'
              : 'Campo obligatorio',
        })),
      });
    }
  };
  const estadoInvalido = () =>
    new ApiError(409, { code: 'ESTADO_INVALIDO', message: 'Estado invalido' });
  const sinTildes = (t: string) =>
    t
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();

  return {
    async listarFichas(filtro: FiltroFichas, signal) {
      await espera(signal);
      const size = filtro.size ?? 20;
      const page = filtro.page ?? 0;
      const lista = fichas
        .filter((f) => !filtro.estado || f.estado === filtro.estado)
        .filter((f) => filtro.regionId === undefined || f.region.id === filtro.regionId)
        .filter(
          (f) =>
            filtro.categoriaId === undefined || f.categoria.id === filtro.categoriaId,
        )
        .filter((f) => !filtro.q || sinTildes(f.nombre).includes(sinTildes(filtro.q)))
        .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn));
      const content: EjercicioAdminResumen[] = lista
        .slice(page * size, page * size + size)
        .map((f) => ({
          id: f.id,
          nombre: f.nombre,
          estado: f.estado,
          region: f.region,
          categoria: f.categoria,
          creadoPor: f.creadoPor,
          actualizadoEn: f.actualizadoEn,
        }));
      const pagina: Pagina<EjercicioAdminResumen> = {
        content,
        page,
        size,
        totalElements: lista.length,
        totalPages: Math.ceil(lista.length / size),
      };
      return copia(pagina);
    },
    async obtenerFicha(id, signal) {
      await espera(signal);
      const f = buscar(id);
      f.camposFaltantes = camposFaltantesMock(f);
      return copia(f);
    },
    async crearFicha(datos) {
      await espera();
      const f = semilla()[2];
      Object.assign(f, {
        id: siguienteId++,
        estado: 'BORRADOR',
        creadoPor: yo,
        media: [],
        progresion: null,
        erroresComunes: null,
        version: 0,
      });
      aplicar(f, datos);
      refrescar(f);
      fichas = [f, ...fichas];
      return copia(f);
    },
    async actualizarFicha(id, datos) {
      await espera();
      const f = buscar(id);
      const previo = copia(f);
      aplicar(f, datos);
      if (f.estado !== 'BORRADOR') {
        try {
          exigirCompleta(f);
        } catch (e) {
          Object.assign(f, previo);
          throw e;
        }
      }
      f.actualizadoPor = yo;
      refrescar(f);
      return copia(f);
    },
    async publicarFicha(id) {
      await espera();
      const f = buscar(id);
      if (f.estado !== 'BORRADOR') throw estadoInvalido();
      exigirCompleta(f);
      f.estado = 'PUBLICADO';
      f.publicadoEn = new Date().toISOString();
      refrescar(f);
      return copia(f);
    },
    async archivarFicha(id) {
      await espera();
      const f = buscar(id);
      if (f.estado !== 'PUBLICADO') throw estadoInvalido();
      f.estado = 'ARCHIVADO';
      f.archivadoEn = new Date().toISOString();
      refrescar(f);
      return copia(f);
    },
    async restaurarFicha(id) {
      await espera();
      const f = buscar(id);
      if (f.estado !== 'ARCHIVADO') throw estadoInvalido();
      f.estado = 'PUBLICADO';
      f.archivadoEn = null;
      refrescar(f);
      return copia(f);
    },
    async eliminarFicha(id) {
      await espera();
      buscar(id);
      fichas = fichas.filter((f) => f.id !== id);
    },
    async listarCategorias(signal) {
      await espera(signal);
      return copia(CATEGORIAS_MOCK);
    },
    async solicitarSubida(fichaId, solicitud) {
      await espera();
      const f = buscar(fichaId);
      const mediaId = siguienteMedia++;
      const media: MediaAdmin = {
        id: mediaId,
        tipo: solicitud.tipo,
        rol: solicitud.tipo === 'IMAGEN' ? (solicitud.rol ?? 'OTRO') : null,
        contentType: solicitud.contentType,
        tamanoBytes: solicitud.tamanoBytes,
        url: solicitud.tipo === 'IMAGEN' ? '/mock/toma.svg' : '',
        orden: f.media.length + 1,
        estado: 'PENDIENTE',
      };
      f.media.push(media);
      return {
        mediaId,
        urlSubida: 'https://almacenamiento-fake.invalid/mock',
        metodo: 'PUT' as const,
        cabeceras: { 'Content-Type': solicitud.contentType },
        expiraEn: new Date(Date.now() + 600_000).toISOString(),
      };
    },
    async subirArchivo(_subida, _archivo, onProgreso, signal) {
      for (const fraccion of [0.25, 0.5, 0.75, 1]) {
        await esperar(Math.max(latenciaMs, 120), signal);
        onProgreso(fraccion);
      }
    },
    async confirmarMedia(fichaId, mediaId) {
      await espera();
      const f = buscar(fichaId);
      const m = f.media.find((x) => x.id === mediaId);
      if (!m) {
        throw new ApiError(404, {
          code: 'MEDIA_NO_ENCONTRADA',
          message: 'Media no encontrada',
        });
      }
      m.estado = 'CONFIRMADO';
      refrescar(f);
      return copia(m);
    },
    async eliminarMedia(fichaId, mediaId) {
      await espera();
      const f = buscar(fichaId);
      const restantes = f.media.filter((m) => m.id !== mediaId);
      if (f.estado !== 'BORRADOR' && !restantes.some((m) => m.estado === 'CONFIRMADO')) {
        throw new ApiError(409, {
          code: 'MEDIA_REQUERIDA',
          message: 'No se puede quitar el ultimo medio',
        });
      }
      f.media = restantes;
      refrescar(f);
    },
  };
}
