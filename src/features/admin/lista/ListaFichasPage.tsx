import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SelectField } from '@/components/Campos';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { useDebounce } from '@/hooks/useDebounce';
import type { EstadoFicha, FiltroFichas } from '@/lib/api';
import { useRegiones } from '../../atlas/api/hooks';
import { EstadoError } from '../../atlas/EstadoError';
import { mensajeDeErrorAtlas } from '../../atlas/mensajes';
import { useCategoriasAdmin, useFichasAdmin } from '../api/hooks';
import { fechaCorta } from '../fechas';
import { ETIQUETA_ESTADO } from '../estados';
import { AccionesFicha } from './AccionesFicha';
import { EtiquetaEstado } from './EtiquetaEstado';

const TAMANO_PAGINA = 20;
const TEXTO_RESULTADO = {
  archivar: (n: string) => `Ficha «${n}» archivada.`,
  restaurar: (n: string) => `Ficha «${n}» restaurada.`,
  eliminar: (n: string) => `Ficha «${n}» eliminada.`,
};
const ESTADOS: EstadoFicha[] = ['BORRADOR', 'PUBLICADO', 'ARCHIVADO'];

function numeroDe(valor: string | null): number | undefined {
  return valor && /^\d+$/.test(valor) ? Number(valor) : undefined;
}

/**
 * Todas las fichas de todos los administradores (HU-15), con filtros por estado, región,
 * categoría y nombre. Los filtros viven en la URL: se pueden compartir y sobreviven al recargar.
 */
export function ListaFichasPage() {
  const [params, setParams] = useSearchParams();
  const [texto, setTexto] = useState(params.get('q') ?? '');
  const [resultado, setResultado] = useState<string | null>(null);
  const q = useDebounce(texto.trim(), 300);

  const estadoParam = params.get('estado');
  const filtro: FiltroFichas = {
    estado: ESTADOS.find((e) => e === estadoParam),
    regionId: numeroDe(params.get('regionId')),
    categoriaId: numeroDe(params.get('categoriaId')),
    q: q || undefined,
    page: numeroDe(params.get('page')) ?? 0,
    size: TAMANO_PAGINA,
  };

  const fichas = useFichasAdmin(filtro);
  const regiones = useRegiones();
  const categorias = useCategoriasAdmin();

  function cambiar(clave: string, valor: string) {
    const siguiente = new URLSearchParams(params);
    if (valor) siguiente.set(clave, valor);
    else siguiente.delete(clave);
    if (clave !== 'page') siguiente.delete('page');
    setParams(siguiente, { replace: true });
  }

  const pagina = fichas.data;
  const hayFiltros = Boolean(filtro.estado || filtro.regionId || filtro.categoriaId || q);
  const anteriores = regiones.data?.filter((r) => r.vista === 'ANTERIOR') ?? [];
  const posteriores = regiones.data?.filter((r) => r.vista === 'POSTERIOR') ?? [];

  return (
    <section className="flex flex-col gap-8 pt-4 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-titulo">Fichas de ejercicios</h1>
          <p className="text-tinta-2 mt-1">
            Todas las fichas, de todas las personas administradoras.
          </p>
        </div>
        <Link
          to="/admin/fichas/nueva"
          className="rounded-campo bg-tinta text-fondo hover:bg-acento hover:text-fondo inline-flex min-h-12 items-center justify-center px-6 font-semibold no-underline"
        >
          Nueva ficha
        </Link>
      </header>

      <form
        role="search"
        aria-label="Filtros de fichas"
        onSubmit={(e) => e.preventDefault()}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <TextField
          label="Nombre"
          type="text"
          value={texto}
          maxLength={100}
          onChange={(e) => setTexto(e.target.value)}
        />
        <SelectField
          label="Estado"
          value={filtro.estado ?? ''}
          onChange={(e) => cambiar('estado', e.target.value)}
        >
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_ESTADO[e]}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Región"
          value={filtro.regionId ?? ''}
          onChange={(e) => cambiar('regionId', e.target.value)}
        >
          <option value="">Todas</option>
          <optgroup label="Vista anterior">
            {anteriores.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </optgroup>
          <optgroup label="Vista posterior">
            {posteriores.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </optgroup>
        </SelectField>
        <SelectField
          label="Categoría"
          value={filtro.categoriaId ?? ''}
          onChange={(e) => cambiar('categoriaId', e.target.value)}
        >
          <option value="">Todas</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </SelectField>
      </form>

      {resultado ? <Notice tipo="info">{resultado}</Notice> : null}

      {fichas.isPending ? (
        <div role="status" className="flex flex-col gap-2">
          <p className="text-tinta-2">Cargando fichas…</p>
          {[0, 1, 2].map((i) => (
            <div key={i} aria-hidden className="bg-fondo-2 h-20" />
          ))}
        </div>
      ) : null}

      {fichas.isError ? (
        <EstadoError
          mensaje={mensajeDeErrorAtlas(fichas.error)}
          onReintentar={() => void fichas.refetch()}
        />
      ) : null}

      {pagina && pagina.content.length === 0 ? (
        <div role="status" className="bg-fondo-2 flex flex-col gap-1 px-4 py-5">
          <p className="font-display text-lg font-semibold">
            {hayFiltros
              ? 'Ninguna ficha coincide con los filtros.'
              : 'Todavía no hay fichas.'}
          </p>
          <p className="text-tinta-2">
            {hayFiltros
              ? 'Prueba con otros filtros o quítalos para ver todas.'
              : 'Crea la primera con el botón «Nueva ficha».'}
          </p>
        </div>
      ) : null}

      {pagina && pagina.content.length > 0 ? (
        <div
          aria-busy={fichas.isFetching}
          className={fichas.isFetching ? 'opacity-70 transition-opacity' : ''}
        >
          <p className="text-tinta-2 mb-3" aria-live="polite">
            {pagina.totalElements} {pagina.totalElements === 1 ? 'ficha' : 'fichas'}
          </p>
          <ul className="flex flex-col gap-2">
            {pagina.content.map((f) => (
              <li key={f.id} className="bg-fondo-2">
                <Link
                  to={`/admin/fichas/${f.id}`}
                  className="hover:bg-fondo-3 text-tinta grid gap-x-6 gap-y-1 px-4 pt-4 pb-2 no-underline transition-colors duration-150 sm:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <span className="font-display text-xl leading-snug font-semibold">
                    {f.nombre}
                  </span>
                  <span className="sm:row-span-2 sm:self-center">
                    <EtiquetaEstado estado={f.estado} />
                  </span>
                  <span className="text-tinta-2">
                    {f.region.nombre} · {f.categoria.nombre} · {f.creadoPor.correo} ·
                    actualizada el {fechaCorta(f.actualizadoEn)}
                  </span>
                </Link>
                <div className="flex flex-wrap gap-x-4 px-3 pb-2">
                  <AccionesFicha
                    ficha={f}
                    compacto
                    onHecho={(accion) => setResultado(TEXTO_RESULTADO[accion](f.nombre))}
                  />
                </div>
              </li>
            ))}
          </ul>

          {pagina.totalPages > 1 ? (
            <nav
              aria-label="Paginación"
              className="mt-6 flex flex-wrap items-center justify-between gap-4"
            >
              <button
                type="button"
                disabled={pagina.page <= 0}
                onClick={() => cambiar('page', String(pagina.page - 1))}
                className="text-acento min-h-12 cursor-pointer px-1 font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
              >
                Página anterior
              </button>
              <p aria-live="polite">
                Página {pagina.page + 1} de {pagina.totalPages}
              </p>
              <button
                type="button"
                disabled={pagina.page + 1 >= pagina.totalPages}
                onClick={() => cambiar('page', String(pagina.page + 1))}
                className="text-acento min-h-12 cursor-pointer px-1 font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
              >
                Página siguiente
              </button>
            </nav>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
