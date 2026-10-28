import { ApiError } from '@/lib/api';
import type { ComentarioRevision, PalabraOfensiva } from '@/lib/api';
import type { ModeracionApi } from './moderacionApi';

/** Como el backend: minúsculas, sin tildes, solo letras y espacios (simplificado). */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Registro {
  id: number;
  ejercicio: { id: number; nombre: string | null };
  autor: ComentarioRevision['autor'];
  texto: string;
  estado: 'PUBLICADO' | 'EN_REVISION';
  totalReportes: number;
  createdAt: string;
}

const TAMANO = 20;

function haceHoras(horas: number): string {
  return new Date(Date.now() - horas * 3_600_000).toISOString();
}

function semilla(): Registro[] {
  const ana = {
    id: 11,
    correo: 'ana.martinez@correo.com',
    rolPerfil: 'PROFESIONAL' as const,
  };
  const luis = {
    id: 12,
    correo: 'luis.rojas@correo.com',
    rolPerfil: 'PRACTICANTE' as const,
  };
  const marta = { id: 13, correo: 'marta@correo.com', rolPerfil: 'ESTUDIANTE' as const };
  const ficha = { id: 2, nombre: 'Péndulo de Codman' };
  return [
    {
      id: 201,
      ejercicio: ficha,
      autor: luis,
      texto: 'Este ejercicio es una idiotez.',
      estado: 'EN_REVISION',
      totalReportes: 0,
      createdAt: haceHoras(30),
    },
    {
      id: 202,
      ejercicio: { id: 1, nombre: 'Elevación activa de rodilla' },
      autor: marta,
      texto: 'La dosificación no tiene sentido, nadie la usaría así.',
      estado: 'PUBLICADO',
      totalReportes: 2,
      createdAt: haceHoras(20),
    },
    {
      id: 203,
      ejercicio: { id: 3, nombre: null },
      autor: ana,
      texto: 'Mala práctica, no lo recomiendo.',
      estado: 'EN_REVISION',
      totalReportes: 1,
      createdAt: haceHoras(2),
    },
  ];
}

export interface OpcionesMockModeracion {
  /** Retraso simulado de cada llamada, en milisegundos. */
  latenciaMs?: number;
}

/** Cola de moderación en memoria detrás de la misma interfaz que el backend. */
export function crearMockModeracionApi({
  latenciaMs = 0,
}: OpcionesMockModeracion = {}): ModeracionApi {
  const registros = semilla();
  let siguienteIdPalabra = 1000;
  const palabras: PalabraOfensiva[] = [
    'hijo de puta',
    'idiota',
    'imbecil',
    'maldito',
  ].map((palabra, i) => ({ id: i + 1, palabra, createdAt: haceHoras(100) }));

  const esperar = () => new Promise((resolver) => setTimeout(resolver, latenciaMs));
  const noEncontrado = () =>
    new ApiError(404, {
      code: 'COMENTARIO_NO_ENCONTRADO',
      message: 'Comentario no encontrado',
    });
  const buscar = (id: number): Registro => {
    const r = registros.find((x) => x.id === id);
    if (!r) throw noEncontrado();
    return r;
  };

  const aDto = (r: Registro): ComentarioRevision => ({
    id: r.id,
    padreId: null,
    ejercicio: r.ejercicio,
    autor: r.autor,
    texto: r.texto,
    estado: r.estado,
    ocultadoAutomaticamente: r.estado === 'EN_REVISION',
    totalReportes: r.totalReportes,
    createdAt: r.createdAt,
    editadoAt: null,
  });

  return {
    async listarRevision(pagina) {
      await esperar();
      const cola = registros
        .filter((r) => r.estado === 'EN_REVISION' || r.totalReportes > 0)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      return {
        content: cola.slice(pagina * TAMANO, (pagina + 1) * TAMANO).map(aDto),
        page: pagina,
        size: TAMANO,
        totalElements: cola.length,
        totalPages: Math.ceil(cola.length / TAMANO),
      };
    },

    async aceptar(id) {
      await esperar();
      const r = buscar(id);
      r.estado = 'PUBLICADO';
      r.totalReportes = 0;
      return aDto(r);
    },

    async eliminar(id) {
      await esperar();
      registros.splice(registros.indexOf(buscar(id)), 1);
    },

    async listarPalabras(q, pagina) {
      await esperar();
      const buscada = normalizar(q);
      const lista = palabras
        .filter((p) => normalizar(p.palabra).includes(buscada))
        .sort((a, b) => a.palabra.localeCompare(b.palabra, 'es'));
      return {
        content: lista.slice(pagina * TAMANO, (pagina + 1) * TAMANO),
        page: pagina,
        size: TAMANO,
        totalElements: lista.length,
        totalPages: Math.ceil(lista.length / TAMANO),
      };
    },

    async agregarPalabra(texto) {
      await esperar();
      const palabra = texto.trim();
      if (palabra.length === 0 || palabra.length > 60) {
        throw new ApiError(400, { code: 'VALIDATION_ERROR', message: 'Datos invalidos' });
      }
      const forma = normalizar(palabra);
      if (forma.replace(/ /g, '').length < 3) {
        throw new ApiError(400, {
          code: 'PALABRA_INVALIDA',
          message: 'Palabra invalida',
        });
      }
      if (palabras.some((p) => normalizar(p.palabra) === forma)) {
        throw new ApiError(409, {
          code: 'PALABRA_DUPLICADA',
          message: 'Palabra duplicada',
        });
      }
      const nueva = {
        id: siguienteIdPalabra++,
        palabra,
        createdAt: new Date().toISOString(),
      };
      palabras.push(nueva);
      return nueva;
    },

    async eliminarPalabra(id) {
      await esperar();
      const i = palabras.findIndex((p) => p.id === id);
      if (i < 0) {
        throw new ApiError(404, {
          code: 'PALABRA_NO_ENCONTRADA',
          message: 'Palabra no encontrada',
        });
      }
      palabras.splice(i, 1);
    },
  };
}
