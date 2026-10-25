import { ApiError } from '@/lib/api';
import type { Autor, Comentario, EstadoComentario, Pagina } from '@/lib/api';
import type { ComentariosApi } from './comentariosApi';

export interface OpcionesMockComentarios {
  /** Retraso simulado de cada llamada, en milisegundos. */
  latenciaMs?: number;
  /** Quien "está autenticado" en el mock. */
  yo?: Autor;
}

interface Registro {
  id: number;
  ejercicioId: number;
  padreId: number | null;
  autor: Autor;
  texto: string;
  estado: EstadoComentario;
  createdAt: string;
  editadoAt: string | null;
}

const TAMANO = 20;
const MAX_CARACTERES = 1000;

export const YO_MOCK: Autor = { id: 1, nombre: 'tu.cuenta', rolPerfil: 'ESTUDIANTE' };
const ANA: Autor = { id: 11, nombre: 'ana.martinez', rolPerfil: 'PROFESIONAL' };
const LUIS: Autor = { id: 12, nombre: 'luis.rojas', rolPerfil: 'PRACTICANTE' };
const MARTA: Autor = { id: 13, nombre: 'marta', rolPerfil: 'ESTUDIANTE' };

function haceHoras(horas: number): string {
  return new Date(Date.now() - horas * 3_600_000).toISOString();
}

function semilla(yo: Autor): Registro[] {
  const base = { ejercicioId: 1, estado: 'PUBLICADO' as const, editadoAt: null };
  return [
    {
      ...base,
      id: 100,
      padreId: null,
      autor: ANA,
      texto:
        'Lo usé con un paciente post-operatorio de rodilla y la progresión de la fase 2 funcionó muy bien.',
      createdAt: haceHoras(52),
    },
    {
      ...base,
      id: 101,
      padreId: 100,
      autor: LUIS,
      texto: '¿Qué dosificación usaste en la primera semana?',
      createdAt: haceHoras(40),
    },
    {
      ...base,
      id: 102,
      padreId: 100,
      autor: ANA,
      texto: '@luis.rojas 3 series de 10 al inicio, sin carga.',
      createdAt: haceHoras(38),
    },
    {
      ...base,
      id: 103,
      padreId: null,
      autor: MARTA,
      texto: 'Comentario que su autora borró.',
      estado: 'ELIMINADO',
      createdAt: haceHoras(30),
    },
    {
      ...base,
      id: 104,
      padreId: 103,
      autor: LUIS,
      texto: 'Estoy de acuerdo con lo que decía.',
      createdAt: haceHoras(29),
    },
    {
      ...base,
      id: 105,
      padreId: null,
      autor: yo,
      texto: 'Faltaría una foto de la posición del terapeuta.',
      createdAt: haceHoras(5),
    },
  ];
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

/** Comentarios en memoria detrás de la misma interfaz que el backend. */
export function crearMockComentariosApi({
  latenciaMs = 0,
  yo = YO_MOCK,
}: OpcionesMockComentarios = {}): ComentariosApi {
  const registros = semilla(yo);
  let siguienteId = 1000;

  const noEncontrado = () =>
    new ApiError(404, {
      code: 'COMENTARIO_NO_ENCONTRADO',
      message: 'Comentario no encontrado',
    });

  /** Lo que ve quien consulta: lo publicado y, además, lo propio que espera revisión. */
  const visible = (r: Registro) =>
    r.estado === 'PUBLICADO' || (r.estado === 'EN_REVISION' && r.autor.id === yo.id);

  function aDto(r: Registro): Comentario {
    const eliminado = r.estado === 'ELIMINADO';
    return {
      id: r.id,
      ejercicioId: r.ejercicioId,
      padreId: r.padreId,
      autor: eliminado ? null : r.autor,
      texto: eliminado ? null : r.texto,
      estado: r.estado,
      enRevision: r.estado === 'EN_REVISION' && r.autor.id === yo.id,
      eliminado,
      propio: !eliminado && r.autor.id === yo.id,
      createdAt: r.createdAt,
      editadoAt: r.editadoAt,
      respuestas: [],
    };
  }

  const respuestasDe = (raiz: Registro) =>
    registros
      .filter((r) => r.padreId === raiz.id && visible(r))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  function validarTexto(texto: string): string {
    const limpio = texto.trim();
    if (/<[^>]*>/.test(limpio)) {
      throw new ApiError(400, { code: 'TEXTO_INVALIDO', message: 'Texto invalido' });
    }
    if (limpio.length === 0 || limpio.length > MAX_CARACTERES) {
      throw new ApiError(400, { code: 'VALIDATION_ERROR', message: 'Datos invalidos' });
    }
    return limpio;
  }

  async function respuesta<T>(valor: () => T, signal?: AbortSignal): Promise<T> {
    await esperar(latenciaMs, signal);
    return structuredClone(valor());
  }

  function nuevo(ejercicioId: number, padreId: number | null, texto: string): Registro {
    const registro: Registro = {
      id: siguienteId++,
      ejercicioId,
      padreId,
      autor: yo,
      texto: validarTexto(texto),
      estado: 'PUBLICADO',
      createdAt: new Date().toISOString(),
      editadoAt: null,
    };
    registros.push(registro);
    return registro;
  }

  return {
    listar: (ejercicioId, pagina, signal) =>
      respuesta((): Pagina<Comentario> => {
        const raices = registros
          .filter((r) => r.ejercicioId === ejercicioId && r.padreId === null)
          .filter((r) =>
            r.estado === 'ELIMINADO' ? respuestasDe(r).length > 0 : visible(r),
          )
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const content = raices
          .slice(pagina * TAMANO, (pagina + 1) * TAMANO)
          .map((r) => ({ ...aDto(r), respuestas: respuestasDe(r).map(aDto) }));
        return {
          content,
          page: pagina,
          size: TAMANO,
          totalElements: raices.length,
          totalPages: Math.ceil(raices.length / TAMANO),
        };
      }, signal),

    crear: (ejercicioId, texto) => respuesta(() => aDto(nuevo(ejercicioId, null, texto))),

    responder: (id, texto) =>
      respuesta(() => {
        const destino = registros.find((r) => r.id === id);
        if (!destino || destino.estado === 'ELIMINADO' || !visible(destino)) {
          throw noEncontrado();
        }
        const raiz =
          destino.padreId === null
            ? destino
            : registros.find((r) => r.id === destino.padreId)!;
        if (raiz.estado !== 'PUBLICADO' || destino.estado !== 'PUBLICADO') {
          throw new ApiError(409, { code: 'COMENTARIO_NO_RESPONDIBLE' });
        }
        return aDto(nuevo(raiz.ejercicioId, raiz.id, texto));
      }),
  };
}
