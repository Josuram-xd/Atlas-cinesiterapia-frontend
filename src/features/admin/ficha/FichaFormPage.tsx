import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import { ConfirmarSalida } from '@/components/ConfirmarSalida';
import { Notice } from '@/components/Notice';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { ApiError } from '@/lib/api';
import type { EjercicioAdmin } from '@/lib/api';
import { useRegiones } from '../../atlas/api/hooks';
import { EstadoError } from '../../atlas/EstadoError';
import {
  CLAVE_FICHAS,
  useAccionesFicha,
  useCategoriasAdmin,
  useFichaAdmin,
} from '../api/hooks';
import { useAdminApi } from '../api/contexto';
import { describirError } from '../erroresAdmin';
import { PasoMultimedia } from '../media/PasoMultimedia';
import { EtiquetaEstado } from '../lista/EtiquetaEstado';
import {
  etiquetaCampo,
  fichaAForm,
  formARequest,
  formVacio,
  hayCambios,
  pasoDeCampo,
  PASOS,
  validarBorrador,
  type FormFicha,
  type PasoId,
} from './fichaForm';
import {
  PasoDosificacion,
  PasoEjecucion,
  PasoGeneral,
  PasoMetadatos,
  PasoProtocolo,
} from './PasosFicha';

/** Agrupa los campos faltantes por el paso del formulario donde se completan. */
function agruparPorPaso(campos: string[]) {
  return PASOS.map((p) => ({
    paso: p.id,
    titulo: p.titulo,
    campos: campos.filter((c) => pasoDeCampo(c) === p.id),
  })).filter((g) => g.campos.length > 0);
}

function VolverALista() {
  return (
    <Link to="/admin" className="inline-flex min-h-12 items-center font-semibold">
      <span aria-hidden>←&nbsp;</span>Volver a las fichas
    </Link>
  );
}

interface Aviso {
  tipo: 'ok' | 'error';
  texto: string;
}

function Formulario({ ficha: inicial }: { ficha: EjercicioAdmin | null }) {
  const navigate = useNavigate();
  const cliente = useQueryClient();
  const adminApi = useAdminApi();
  const [params] = useSearchParams();
  const acciones = useAccionesFicha();
  const regiones = useRegiones();
  const categorias = useCategoriasAdmin();

  const [ficha, setFicha] = useState(inicial);
  const [form, setForm] = useState<FormFicha>(() =>
    inicial ? fichaAForm(inicial) : formVacio(),
  );
  const [base, setBase] = useState(form);
  const [paso, setPaso] = useState<PasoId>(
    () => PASOS.find((p) => p.id === params.get('paso'))?.id ?? 'general',
  );
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [faltantes, setFaltantes] = useState<string[]>(inicial?.camposFaltantes ?? []);
  const [irA, setIrA] = useState<string | null>(null);

  const sinGuardar = hayCambios(base, form);
  const bloqueo = useUnsavedChanges(sinGuardar);

  // Tras crear el borrador se pasa a su dirección propia. La navegación espera al siguiente
  // render para que el aviso de cambios sin guardar ya sepa que no queda nada pendiente.
  useEffect(() => {
    if (irA) navigate(irA, { replace: true });
  }, [irA, navigate]);

  function cambiar(cambios: Partial<FormFicha>) {
    setForm((f) => ({ ...f, ...cambios }));
    setAviso(null);
  }

  function irAlPrimerError(campos: string[]) {
    if (campos.length > 0) setPaso(pasoDeCampo(campos[0]));
  }

  async function guardarBorrador(): Promise<EjercicioAdmin | null> {
    const locales = validarBorrador(form);
    setErrores(locales);
    if (Object.keys(locales).length > 0) {
      setAviso({ tipo: 'error', texto: 'Revisa los campos marcados.' });
      irAlPrimerError(Object.keys(locales));
      return null;
    }
    try {
      const datos = formARequest(form);
      const guardada = ficha
        ? await acciones.actualizar.mutateAsync({ id: ficha.id, datos })
        : await acciones.crear.mutateAsync(datos);
      setFicha(guardada);
      setFaltantes(guardada.camposFaltantes);
      setBase(form);
      setErrores({});
      setAviso({ tipo: 'ok', texto: 'Borrador guardado.' });
      if (!ficha) {
        cliente.setQueryData([...CLAVE_FICHAS, 'detalle', guardada.id], guardada);
        setIrA(`/admin/fichas/${guardada.id}?paso=${paso}`);
      }
      return guardada;
    } catch (error) {
      const d = describirError(error);
      setErrores(d.campos);
      if (d.faltantes.length > 0) setFaltantes(d.faltantes);
      setAviso({ tipo: 'error', texto: d.mensaje });
      irAlPrimerError(Object.keys(d.campos));
      return null;
    }
  }

  /** Guarda lo pendiente y publica. Si el backend responde 422 muestra qué falta, por paso. */
  async function publicar() {
    const guardada = sinGuardar || !ficha ? await guardarBorrador() : ficha;
    if (!guardada) return;
    try {
      const publicada = await acciones.publicar.mutateAsync(guardada.id);
      setFicha(publicada);
      setFaltantes([]);
      setErrores({});
      setAviso({
        tipo: 'ok',
        texto: 'Ficha publicada. Ya la ven todas las personas usuarias.',
      });
    } catch (error) {
      const d = describirError(error);
      setErrores(d.campos);
      setFaltantes(d.faltantes);
      setAviso({ tipo: 'error', texto: d.mensaje });
      irAlPrimerError(d.faltantes.length > 0 ? d.faltantes : Object.keys(d.campos));
    }
  }

  /** Vuelve a leer la ficha tras subir o quitar archivos (lista de medios y campos faltantes). */
  async function recargarFicha() {
    if (!ficha) return;
    const actual = await adminApi.obtenerFicha(ficha.id);
    setFicha(actual);
    setFaltantes(actual.camposFaltantes);
    cliente.setQueryData([...CLAVE_FICHAS, 'detalle', actual.id], actual);
    void cliente.invalidateQueries({ queryKey: [...CLAVE_FICHAS, 'lista'] });
  }

  const guardando = acciones.crear.isPending || acciones.actualizar.isPending;
  const publicando = acciones.publicar.isPending;
  const porPaso = agruparPorPaso(faltantes);
  const indice = PASOS.findIndex((p) => p.id === paso);
  const props = { form, errores, onCambio: cambiar };

  return (
    <section className="flex flex-col gap-8 pt-2 pb-16">
      <header className="flex flex-col gap-3">
        <VolverALista />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col items-start gap-2">
            {ficha ? <EtiquetaEstado estado={ficha.estado} /> : null}
            <h1 className="font-display text-titulo">
              {ficha ? ficha.nombre : 'Nueva ficha'}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variante={
                ficha?.estado === 'BORRADOR' || !ficha ? 'secundario' : 'primario'
              }
              onClick={() => void guardarBorrador()}
              cargando={guardando}
              disabled={publicando}
            >
              Guardar borrador
            </Button>
            {ficha?.estado === 'BORRADOR' ? (
              <Button
                onClick={() => void publicar()}
                cargando={publicando}
                disabled={guardando}
              >
                Publicar
              </Button>
            ) : null}
          </div>
        </div>
        <div aria-live="polite">
          {aviso ? (
            <Notice tipo={aviso.tipo === 'ok' ? 'info' : 'error'}>{aviso.texto}</Notice>
          ) : null}
        </div>
      </header>

      {faltantes.length > 0 && ficha?.estado !== 'ARCHIVADO' ? (
        <section
          aria-labelledby="faltantes-titulo"
          className="bg-fondo-2 border-error flex flex-col gap-3 border-l-4 px-5 py-4"
        >
          <h2 id="faltantes-titulo" className="font-display text-xl">
            {ficha?.estado === 'PUBLICADO'
              ? `Faltan ${faltantes.length} datos obligatorios para guardar los cambios`
              : `Faltan ${faltantes.length} datos obligatorios para publicar`}
          </h2>
          <ul className="flex flex-col gap-1">
            {porPaso.map(({ paso: id, titulo, campos }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setPaso(id)}
                  className="text-acento min-h-11 cursor-pointer text-left font-semibold underline underline-offset-4"
                >
                  {titulo}
                </button>
                <span className="text-tinta-2">
                  : {campos.map(etiquetaCampo).join(', ')}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-tinta-2">
            Según lo último que se guardó o que respondió el servidor.
          </p>
        </section>
      ) : null}

      <nav aria-label="Pasos de la ficha">
        <ol className="flex flex-wrap gap-2">
          {PASOS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setPaso(p.id)}
                aria-current={p.id === paso ? 'step' : undefined}
                className={`rounded-campo min-h-12 cursor-pointer border-2 border-tinta px-4 py-2 font-semibold transition-colors duration-150 ${
                  p.id === paso
                    ? 'bg-tinta text-fondo'
                    : 'bg-fondo text-tinta hover:bg-acento-claro'
                }`}
              >
                {p.titulo}
                {porPaso.find((g) => g.paso === p.id) ? (
                  <span className="font-light"> · pendiente</span>
                ) : null}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <form
        aria-labelledby="paso-titulo"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void guardarBorrador();
        }}
        className="flex flex-col gap-8"
      >
        <h2 id="paso-titulo" className="font-display text-3xl">
          {PASOS[indice].titulo}
        </h2>
        {paso === 'general' ? (
          <PasoGeneral
            {...props}
            regiones={regiones.data ?? []}
            categorias={categorias.data ?? []}
          />
        ) : null}
        {paso === 'protocolo' ? <PasoProtocolo {...props} /> : null}
        {paso === 'ejecucion' ? <PasoEjecucion {...props} /> : null}
        {paso === 'dosificacion' ? <PasoDosificacion {...props} /> : null}
        {paso === 'multimedia' ? (
          <PasoMultimedia
            ficha={ficha}
            error={errores.media}
            onGuardarBorrador={guardarBorrador}
            onCambio={recargarFicha}
          />
        ) : null}
        {paso === 'metadatos' ? <PasoMetadatos {...props} /> : null}

        <div className="flex flex-wrap gap-3">
          <Button
            variante="secundario"
            disabled={indice === 0}
            onClick={() => setPaso(PASOS[indice - 1].id)}
          >
            Paso anterior
          </Button>
          <Button
            variante="secundario"
            disabled={indice === PASOS.length - 1}
            onClick={() => setPaso(PASOS[indice + 1].id)}
          >
            Paso siguiente
          </Button>
        </div>
      </form>
      <ConfirmarSalida blocker={bloqueo} />
    </section>
  );
}

function NoExiste() {
  return (
    <section className="flex max-w-xl flex-col gap-4 py-6">
      <h1 className="font-display text-titulo">Esta ficha no existe</h1>
      <p>Puede que se haya eliminado o que el enlace sea incorrecto.</p>
      <VolverALista />
    </section>
  );
}

/** Crear una ficha (`/admin/fichas/nueva`) o editar una existente (`/admin/fichas/:id`). */
export function FichaFormPage() {
  const { id } = useParams();
  const esNueva = id === undefined;
  const numero = id !== undefined && /^\d+$/.test(id) ? Number(id) : null;
  const ficha = useFichaAdmin(numero);

  if (esNueva) return <Formulario key="nueva" ficha={null} />;
  if (numero === null) return <NoExiste />;
  if (ficha.isPending) {
    return (
      <p role="status" className="text-tinta-2 py-6">
        Cargando ficha…
      </p>
    );
  }
  if (ficha.isError) {
    if (ficha.error instanceof ApiError && ficha.error.status === 404)
      return <NoExiste />;
    return (
      <div className="flex max-w-xl flex-col gap-4 py-6">
        <VolverALista />
        <EstadoError
          mensaje={describirError(ficha.error).mensaje}
          onReintentar={() => void ficha.refetch()}
        />
      </div>
    );
  }
  return <Formulario key={ficha.data.id} ficha={ficha.data} />;
}
