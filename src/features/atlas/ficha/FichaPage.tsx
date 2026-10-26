import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '@/lib/api';
import type { Ejercicio } from '@/lib/api';
import { useAtlasApi } from '../api/contexto';
import { useEjercicio } from '../api/hooks';
import { EstadoError } from '../EstadoError';
import { mensajeDeErrorAtlas } from '../mensajes';
import { GaleriaImagenes } from './GaleriaImagenes';
import { ReproductorVideo } from './ReproductorVideo';
import { Campo, Seccion } from './Seccion';
import { cohorteLegible, fechaLarga } from './texto';

const ETIQUETAS_DOSIS: Array<[keyof Ejercicio['dosificacion'], string]> = [
  ['series', 'Series'],
  ['repeticiones', 'Repeticiones'],
  ['intensidad', 'Intensidad'],
  ['tiempo', 'Tiempo'],
  ['descanso', 'Descanso'],
  ['frecuencia', 'Frecuencia'],
];

function VolverAlAtlas() {
  return (
    <Link to="/" className="inline-flex min-h-12 items-center font-semibold">
      <span aria-hidden>←&nbsp;</span>Volver al atlas
    </Link>
  );
}

function NoDisponible() {
  return (
    <section className="max-w-xl py-6">
      <h1 className="font-display text-titulo">Esta ficha no está disponible</h1>
      <p className="mt-4">
        Puede que el ejercicio ya no esté publicado o que el enlace sea incorrecto.
      </p>
      <p className="mt-6">
        <VolverAlAtlas />
      </p>
    </section>
  );
}

function Ficha({ e }: { e: Ejercicio }) {
  const secciones: Array<[string, string]> = [
    ['informacion-general', 'Información general'],
    ['protocolo-clinico', 'Protocolo clínico'],
    ['ejecucion', 'Ejecución'],
    ['dosificacion', 'Dosificación'],
    ...(e.progresion ? [['progresion', 'Progresión'] as [string, string]] : []),
    ...(e.erroresComunes
      ? [['errores-comunes', 'Errores comunes'] as [string, string]]
      : []),
    ['metadatos', 'Metadatos académicos'],
  ];
  return (
    <article className="flex flex-col gap-12 pb-16 lg:gap-16">
      <header className="flex flex-col gap-4">
        <VolverAlAtlas />
        <p className="text-tinta-2 text-lg">
          {e.region.nombre} · {e.categoria.nombre}
        </p>
        <h1 className="font-display text-gigante max-w-[20ch] font-extrabold">
          {e.nombre}
        </h1>
        <p
          className="font-display max-w-[48ch] text-2xl leading-snug font-light"
          aria-label="Objetivo terapéutico"
        >
          {e.objetivoTerapeutico}
        </p>
      </header>

      {e.video || e.imagenes.length > 0 ? (
        <section
          aria-label="Video e imágenes"
          className={`grid gap-4 ${e.video && e.imagenes.length > 0 ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : ''}`}
        >
          {e.video ? <ReproductorVideo nombre={e.nombre} video={e.video} /> : null}
          <GaleriaImagenes
            nombre={e.nombre}
            imagenes={e.imagenes}
            className={
              e.video
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 lg:content-start'
                : 'grid-cols-2 sm:grid-cols-3'
            }
          />
        </section>
      ) : null}

      <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
        <nav aria-label="Secciones de la ficha" className="mb-10 lg:mb-0">
          <ul className="flex flex-wrap gap-x-5 lg:sticky lg:top-6 lg:flex-col lg:gap-0">
            {secciones.map(([id, titulo]) => (
              <li key={id}>
                <a href={`#${id}`} className="inline-flex min-h-11 items-center">
                  {titulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-16 lg:gap-20">
          <Seccion id="informacion-general" titulo="Información general">
            <Campo
              titulo="Región anatómica"
              texto={`${e.region.nombre}, vista ${e.region.vista === 'ANTERIOR' ? 'anterior' : 'posterior'}`}
            />
            <Campo titulo="Categoría terapéutica" texto={e.categoria.nombre} />
            <Campo titulo="Estructuras intervenidas" texto={e.estructurasIntervenidas} />
          </Seccion>

          <Seccion id="protocolo-clinico" titulo="Protocolo clínico">
            <Campo titulo="Indicaciones" texto={e.indicaciones} />
            <div className="border-error bg-fondo-2 border-l-4 px-5 py-4">
              <Campo
                titulo="Precauciones y contraindicaciones"
                texto={e.precaucionesContraindicaciones}
              />
            </div>
          </Seccion>

          <Seccion id="ejecucion" titulo="Ejecución">
            <Campo titulo="Posición del paciente" texto={e.posicionPaciente} />
            <Campo
              titulo="Posición del fisioterapeuta"
              texto={e.posicionFisioterapeuta}
            />
            <Campo titulo="Pasos de la ejecución" texto={e.ejecucion} />
            <Campo titulo="Comandos verbales" texto={e.comandosVerbales} />
          </Seccion>

          <Seccion id="dosificacion" titulo="Dosificación">
            <dl className="bg-fondo-2 grid grid-cols-2 gap-x-6 gap-y-6 p-5 sm:grid-cols-3 sm:p-6">
              {ETIQUETAS_DOSIS.map(([clave, etiqueta]) => (
                <div key={clave}>
                  <dt className="text-tinta-2">{etiqueta}</dt>
                  <dd className="font-display mt-0.5 text-2xl leading-tight font-semibold">
                    {e.dosificacion[clave]}
                  </dd>
                </div>
              ))}
            </dl>
          </Seccion>

          {e.progresion ? (
            <Seccion id="progresion" titulo="Progresión">
              <Campo titulo="Cómo avanzar" texto={e.progresion} />
            </Seccion>
          ) : null}

          {e.erroresComunes ? (
            <Seccion id="errores-comunes" titulo="Errores comunes">
              <Campo titulo="Qué evitar" texto={e.erroresComunes} />
            </Seccion>
          ) : null}

          <Seccion id="metadatos" titulo="Metadatos académicos">
            <dl className="grid max-w-[68ch] gap-x-8 gap-y-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-tinta-2">Estudiantes creadores</dt>
                <dd className="font-display text-xl font-semibold">
                  {e.estudiantesCreadores.join(', ')}
                </dd>
              </div>
              <div>
                <dt className="text-tinta-2">Cohorte</dt>
                <dd className="font-display text-xl font-semibold">
                  {cohorteLegible(e.cohorte)}
                </dd>
              </div>
              <div>
                <dt className="text-tinta-2">Profesora revisora</dt>
                <dd className="font-display text-xl font-semibold">
                  {e.profesoraRevisora}
                </dd>
              </div>
              {fechaLarga(e.actualizadoEn) ? (
                <div>
                  <dt className="text-tinta-2">Última actualización</dt>
                  <dd className="font-display text-xl font-semibold">
                    {fechaLarga(e.actualizadoEn)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </Seccion>
        </div>
      </div>
    </article>
  );
}

/** Ficha completa de un ejercicio (HU-02). */
export function FichaPage() {
  const { id } = useParams();
  const numero = id && /^\d+$/.test(id) ? Number(id) : null;
  const ficha = useEjercicio(numero);
  const api = useAtlasApi();

  // Una visita por ficha abierta (RF_032). Se espera a que la ficha exista para no contar
  // enlaces rotos. El efecto depende solo del id, así que un refetch no la repite.
  const fichaId = ficha.data?.id;
  useEffect(() => {
    if (fichaId === undefined) return;
    void api.registrarVisita(fichaId).catch(() => {});
  }, [api, fichaId]);

  if (numero === null) return <NoDisponible />;
  if (ficha.isPending) {
    return (
      <div role="status" className="flex flex-col gap-4 py-6">
        <p className="text-tinta-2">Cargando ficha…</p>
        <div aria-hidden className="bg-fondo-2 h-16 max-w-xl" />
        <div aria-hidden className="bg-fondo-2 h-40 max-w-3xl" />
      </div>
    );
  }
  if (ficha.isError) {
    if (ficha.error instanceof ApiError && ficha.error.status === 404) {
      return <NoDisponible />;
    }
    return (
      <div className="flex max-w-xl flex-col gap-4 py-6">
        <VolverAlAtlas />
        <EstadoError
          mensaje={mensajeDeErrorAtlas(ficha.error)}
          onReintentar={() => void ficha.refetch()}
        />
      </div>
    );
  }
  return <Ficha e={ficha.data} />;
}
