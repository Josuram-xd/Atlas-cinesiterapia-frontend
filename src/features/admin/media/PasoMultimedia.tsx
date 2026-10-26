import { useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { SelectField } from '@/components/Campos';
import { ConfirmarAccion } from '@/components/ConfirmarAccion';
import { Notice } from '@/components/Notice';
import type { EjercicioAdmin, MediaAdmin, MediaRol, MediaTipo } from '@/lib/api';
import { urlSegura } from '@/lib/urlSegura';
import { ReproductorVideo } from '../../atlas/ficha/ReproductorVideo';
import { etiquetaImagen } from '../../atlas/ficha/rolMedia';
import { useAdminApi } from '../api/contexto';
import { describirError } from '../erroresAdmin';
import { subirMedia } from './subida';
import { formatearTamano, REGLAS_MEDIA } from './validacion';

interface PasoMultimediaProps {
  /** `null` mientras la ficha no se haya guardado: sin id no hay a dónde subir. */
  ficha: EjercicioAdmin | null;
  /** Guarda el borrador para obtener el id; devuelve la ficha o `null` si falló. */
  onGuardarBorrador: () => Promise<unknown>;
  /** Mensaje del servidor sobre los archivos (por ejemplo, que falta al menos uno). */
  error?: string;
  /** Avisa que los archivos de la ficha cambiaron, para volver a leerla. */
  onCambio: () => Promise<void> | void;
}

const ROLES_IMAGEN: Array<[MediaRol, string]> = [
  ['POSICION_INICIAL', 'Posición inicial'],
  ['POSICION_FINAL', 'Posición final'],
  ['TOMA_TERAPEUTA', 'Toma del terapeuta'],
  ['OTRO', 'Otra'],
];

interface Subida {
  tipo: MediaTipo;
  nombre: string;
  progreso: number;
}

/** Paso de multimedia: sube video e imágenes con URL prefirmada y progreso, y los elimina. */
export function PasoMultimedia({
  ficha,
  error,
  onGuardarBorrador,
  onCambio,
}: PasoMultimediaProps) {
  const api = useAdminApi();
  const [subida, setSubida] = useState<Subida | null>(null);
  const [rol, setRol] = useState<MediaRol | ''>('');
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(
    null,
  );
  const [aEliminar, setAEliminar] = useState<MediaAdmin | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string>();
  const cancelar = useRef<AbortController | null>(null);
  const campoVideo = useRef<HTMLInputElement>(null);
  const campoImagen = useRef<HTMLInputElement>(null);

  if (!ficha) {
    return (
      <div className="flex max-w-prose flex-col items-start gap-4">
        <p>Para agregar archivos primero hay que guardar el borrador.</p>
        <Button onClick={() => void onGuardarBorrador()}>
          Guardar borrador y continuar
        </Button>
      </div>
    );
  }

  const confirmados = ficha.media.filter((m) => m.estado === 'CONFIRMADO');
  const video = confirmados.find((m) => m.tipo === 'VIDEO') ?? null;
  const imagenes = confirmados.filter((m) => m.tipo === 'IMAGEN');
  const ocupado = subida !== null;

  async function subir(tipo: MediaTipo, campo: HTMLInputElement | null) {
    const archivo = campo?.files?.[0];
    if (!archivo) {
      setAviso({ tipo: 'error', texto: 'Elige un archivo antes de subirlo.' });
      return;
    }
    if (tipo === 'IMAGEN' && !rol) {
      setAviso({ tipo: 'error', texto: 'Indica qué muestra la imagen.' });
      return;
    }
    setAviso(null);
    const control = new AbortController();
    cancelar.current = control;
    setSubida({ tipo, nombre: archivo.name, progreso: 0 });
    try {
      await subirMedia({
        api,
        fichaId: ficha!.id,
        archivo,
        tipo,
        rol: tipo === 'IMAGEN' ? (rol as MediaRol) : undefined,
        yaSubidos: tipo === 'VIDEO' ? (video ? 1 : 0) : imagenes.length,
        onProgreso: (f) => setSubida((s) => (s ? { ...s, progreso: f } : s)),
        signal: control.signal,
      });
      if (campo) campo.value = '';
      setAviso({
        tipo: 'ok',
        texto: tipo === 'VIDEO' ? 'Video subido.' : 'Imagen subida.',
      });
      await onCambio();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setAviso({ tipo: 'ok', texto: 'Subida cancelada.' });
      } else {
        setAviso({ tipo: 'error', texto: describirError(error).mensaje });
      }
    } finally {
      cancelar.current = null;
      setSubida(null);
    }
  }

  async function eliminar() {
    if (!aEliminar) return;
    setEliminando(true);
    setErrorEliminar(undefined);
    try {
      await api.eliminarMedia(ficha!.id, aEliminar.id);
      setAEliminar(null);
      setAviso({ tipo: 'ok', texto: 'Archivo eliminado.' });
      await onCambio();
    } catch (error) {
      setErrorEliminar(describirError(error).mensaje);
    } finally {
      setEliminando(false);
    }
  }

  const progresoPct = subida ? Math.round(subida.progreso * 100) : 0;

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      {error && !aviso ? <Notice tipo="error">{error}</Notice> : null}
      {aviso ? (
        <Notice tipo={aviso.tipo === 'ok' ? 'info' : 'error'}>{aviso.texto}</Notice>
      ) : null}

      {subida ? (
        <div role="status" className="bg-fondo-2 flex flex-col gap-3 p-4">
          <p className="font-semibold">
            Subiendo {subida.nombre}: {progresoPct} %
          </p>
          <progress
            value={progresoPct}
            max={100}
            aria-label={`Progreso de la subida de ${subida.nombre}`}
            className="h-3 w-full [&::-moz-progress-bar]:bg-acento [&::-webkit-progress-bar]:bg-fondo-3 [&::-webkit-progress-value]:bg-acento"
          />
          <div>
            <Button variante="secundario" onClick={() => cancelar.current?.abort()}>
              Cancelar subida
            </Button>
          </div>
        </div>
      ) : null}

      <section aria-labelledby="media-video" className="flex flex-col gap-4">
        <h3 id="media-video" className="font-display text-2xl">
          Video
        </h3>
        {video ? (
          <div className="flex flex-col items-start gap-3">
            <div className="w-full max-w-xl">
              <ReproductorVideo nombre={ficha.nombre} video={video} />
            </div>
            <p className="text-tinta-2">
              {formatearTamano(video.tamanoBytes)} · {video.contentType}
            </p>
            <Button variante="secundario" onClick={() => setAEliminar(video)}>
              Eliminar video
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <label htmlFor="archivo-video" className="font-semibold">
              Archivo de video
            </label>
            <input
              ref={campoVideo}
              id="archivo-video"
              type="file"
              accept={REGLAS_MEDIA.VIDEO.tipos.join(',')}
              disabled={ocupado}
              aria-describedby="ayuda-video"
              className="w-full max-w-xl"
            />
            <p id="ayuda-video" className="text-tinta-2">
              {REGLAS_MEDIA.VIDEO.etiquetaTipos}, hasta{' '}
              {formatearTamano(REGLAS_MEDIA.VIDEO.maxBytes)}. Un solo video por ficha.
            </p>
            <Button
              variante="secundario"
              disabled={ocupado}
              onClick={() => void subir('VIDEO', campoVideo.current)}
            >
              Subir video
            </Button>
          </div>
        )}
      </section>

      <section aria-labelledby="media-imagenes" className="flex flex-col gap-4">
        <h3 id="media-imagenes" className="font-display text-2xl">
          Imágenes
        </h3>
        <p className="text-tinta-2" aria-live="polite">
          {imagenes.length} de {REGLAS_MEDIA.IMAGEN.maxCantidad} imágenes
        </p>
        {imagenes.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {imagenes.map((m, i) => {
              const url = urlSegura(m.url);
              const etiqueta = etiquetaImagen(m, i + 1);
              return (
                <li key={m.id} className="bg-fondo-2 flex flex-col">
                  {url ? (
                    <img
                      src={url}
                      alt={`${etiqueta} de ${ficha.nombre}`}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : null}
                  <div className="flex flex-col items-start gap-1 p-3">
                    <span className="font-semibold">{etiqueta}</span>
                    <span className="text-tinta-2">{formatearTamano(m.tamanoBytes)}</span>
                    <button
                      type="button"
                      onClick={() => setAEliminar(m)}
                      aria-label={`Eliminar imagen: ${etiqueta}`}
                      className="text-acento min-h-11 cursor-pointer font-semibold underline underline-offset-4"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {imagenes.length < REGLAS_MEDIA.IMAGEN.maxCantidad ? (
          <div className="flex max-w-xl flex-col items-start gap-3">
            <SelectField
              className="w-full"
              label="Qué muestra la imagen"
              value={rol}
              onChange={(e) => setRol(e.target.value as MediaRol | '')}
            >
              <option value="">Elige una opción</option>
              {ROLES_IMAGEN.map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </SelectField>
            <label htmlFor="archivo-imagen" className="font-semibold">
              Archivo de imagen
            </label>
            <input
              ref={campoImagen}
              id="archivo-imagen"
              type="file"
              accept={REGLAS_MEDIA.IMAGEN.tipos.join(',')}
              disabled={ocupado}
              aria-describedby="ayuda-imagen"
              className="w-full"
            />
            <p id="ayuda-imagen" className="text-tinta-2">
              {REGLAS_MEDIA.IMAGEN.etiquetaTipos}, hasta{' '}
              {formatearTamano(REGLAS_MEDIA.IMAGEN.maxBytes)} cada una.
            </p>
            <Button
              variante="secundario"
              disabled={ocupado}
              onClick={() => void subir('IMAGEN', campoImagen.current)}
            >
              Subir imagen
            </Button>
          </div>
        ) : (
          <p>La ficha ya tiene el máximo de imágenes. Elimina una para subir otra.</p>
        )}
      </section>

      {aEliminar ? (
        <ConfirmarAccion
          titulo={
            aEliminar.tipo === 'VIDEO' ? '¿Eliminar el video?' : '¿Eliminar esta imagen?'
          }
          confirmar="Eliminar archivo"
          cargando={eliminando}
          error={errorEliminar}
          onConfirmar={() => void eliminar()}
          onCancelar={() => {
            setAEliminar(null);
            setErrorEliminar(undefined);
          }}
        >
          <p>
            El archivo se borra de la ficha y del almacenamiento. No se puede deshacer.
          </p>
        </ConfirmarAccion>
      ) : null}
    </div>
  );
}
