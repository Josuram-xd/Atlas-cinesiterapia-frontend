import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import type { EjercicioResumen } from '@/lib/api';
import { useBuscarEjercicios } from '../api/hooks';
import { mensajeDeErrorAtlas } from '../mensajes';

/** Con menos letras el backend devolvería demasiado ruido; no se consulta. */
export const MINIMO_BUSQUEDA = 2;
/** Límite del backend para `q` (más de 100 caracteres responde 400). */
export const MAXIMO_BUSQUEDA = 100;
export const RETRASO_BUSQUEDA_MS = 300;

/**
 * Barra de búsqueda por nombre con debounce (HU-03). Patrón combobox con lista: flechas para
 * recorrer, Enter para abrir la ficha, Escape para cerrar. Cada resultado lleva a `/ejercicios/:id`.
 */
export function BuscadorEjercicios({
  retrasoMs = RETRASO_BUSQUEDA_MS,
}: {
  retrasoMs?: number;
}) {
  const navigate = useNavigate();
  const idLista = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const [texto, setTexto] = useState('');
  const [abierta, setAbierta] = useState(false);
  const [activa, setActiva] = useState(-1);

  const consulta = useDebounce(texto.trim(), retrasoMs);
  const listo = consulta.length >= MINIMO_BUSQUEDA;
  const busqueda = useBuscarEjercicios(listo ? consulta : null);
  const resultados: EjercicioResumen[] = busqueda.data ?? [];
  // Mientras se escribe, el resultado anterior ya no corresponde al texto.
  const esperando = texto.trim().length >= MINIMO_BUSQUEDA && texto.trim() !== consulta;
  const visible = abierta && texto.trim().length >= MINIMO_BUSQUEDA;
  const hayLista = visible && !esperando && busqueda.isSuccess && resultados.length > 0;

  function elegir(e: EjercicioResumen) {
    setTexto('');
    setAbierta(false);
    setActiva(-1);
    navigate(`/ejercicios/${e.id}`);
  }

  function alTeclear(ev: KeyboardEvent<HTMLInputElement>) {
    if (ev.key === 'Escape') {
      setAbierta(false);
      setActiva(-1);
    } else if (ev.key === 'ArrowDown' && hayLista) {
      ev.preventDefault();
      setAbierta(true);
      setActiva((i) => Math.min(i + 1, resultados.length - 1));
    } else if (ev.key === 'ArrowUp' && hayLista) {
      ev.preventDefault();
      setActiva((i) => Math.max(i - 1, 0));
    } else if (ev.key === 'Enter' && hayLista) {
      ev.preventDefault();
      elegir(resultados[activa >= 0 ? activa : 0]);
    }
  }

  let estado: string | null = null;
  if (visible) {
    if (esperando || busqueda.isPending || busqueda.isFetching) estado = 'Buscando…';
    else if (busqueda.isSuccess && resultados.length === 0) {
      estado = `Sin resultados para «${consulta}».`;
    }
  }

  return (
    <div
      ref={raiz}
      role="search"
      className="relative w-full"
      onBlur={(ev) => {
        if (!raiz.current?.contains(ev.relatedTarget)) setAbierta(false);
      }}
    >
      <label htmlFor={`${idLista}-campo`} className="sr-only">
        Buscar ejercicio por nombre
      </label>
      <svg
        viewBox="0 0 20 20"
        aria-hidden
        className="text-tinta-2 pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
      >
        <circle
          cx="8.5"
          cy="8.5"
          r="5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="m13 13 4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <input
        id={`${idLista}-campo`}
        type="text"
        role="combobox"
        aria-label="Buscar ejercicio por nombre"
        aria-expanded={hayLista}
        aria-controls={idLista}
        aria-autocomplete="list"
        aria-activedescendant={
          hayLista && activa >= 0 ? `${idLista}-${activa}` : undefined
        }
        autoComplete="off"
        maxLength={MAXIMO_BUSQUEDA}
        placeholder="Buscar ejercicio por nombre"
        value={texto}
        onChange={(ev) => {
          setTexto(ev.target.value);
          setAbierta(true);
          setActiva(-1);
        }}
        onFocus={() => setAbierta(true)}
        onKeyDown={alTeclear}
        className="campo min-h-11 rounded-full py-2 pl-11"
      />

      {visible ? (
        <div className="desplegable rounded-superficie bg-papel absolute inset-x-0 top-full z-40 mt-2 max-h-[60vh] overflow-y-auto p-1.5 shadow-[0_24px_60px_-20px_rgb(15_30_26/0.45)]">
          <p aria-live="polite" className="sr-only">
            {hayLista
              ? `${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'}`
              : ''}
          </p>
          {estado ? (
            <p role="status" className="text-tinta-2 px-4 py-3">
              {estado}
            </p>
          ) : null}
          {busqueda.isError && !esperando ? (
            <div className="flex flex-col items-start gap-2 px-4 py-3">
              <p role="alert" className="text-error font-medium">
                {mensajeDeErrorAtlas(busqueda.error)}
              </p>
              <button
                type="button"
                onClick={() => void busqueda.refetch()}
                className="text-acento min-h-11 cursor-pointer font-semibold underline underline-offset-4"
              >
                Reintentar
              </button>
            </div>
          ) : null}
          {hayLista ? (
            <ul id={idLista} role="listbox" aria-label="Resultados de la búsqueda">
              {resultados.map((e, i) => (
                <li
                  key={e.id}
                  id={`${idLista}-${i}`}
                  role="option"
                  aria-selected={i === activa}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => elegir(e)}
                  onMouseMove={() => setActiva(i)}
                  className={`flex min-h-12 cursor-pointer flex-col justify-center rounded-[calc(var(--radius-superficie)-6px)] px-4 py-2 transition-colors duration-150 ${
                    i === activa ? 'bg-tinta text-fondo' : 'hover:bg-fondo-2'
                  }`}
                >
                  <span className="font-semibold">{e.nombre}</span>
                  <span className={i === activa ? 'text-acento-claro' : 'text-tinta-2'}>
                    {e.region.nombre} · {e.categoria.nombre}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
