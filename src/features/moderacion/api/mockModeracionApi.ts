import { ApiError } from '@/lib/api';
import type { ComentarioRevision } from '@/lib/api';
import type { ModeracionApi } from './moderacionApi';

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
  };
}
