import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BotonTexto } from '@/components/BotonTexto';
import { Button } from '@/components/Button';
import { ConfirmarAccion } from '@/components/ConfirmarAccion';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { useDebounce } from '@/hooks/useDebounce';
import type { PalabraOfensiva } from '@/lib/api';
import { EstadoError } from '../atlas/EstadoError';
import { mensajeDeErrorAtlas } from '../atlas/mensajes';
import { useAccionesPalabras, usePalabras } from './api/hooks';
import { mensajeErrorPalabra } from './erroresPalabras';

/** Lista de palabras que el filtro automático manda a revisión (solo ADMIN). */
export function PalabrasOfensivasPage() {
  const [busqueda, setBusqueda] = useState('');
  const q = useDebounce(busqueda.trim(), 300);
  const palabras = usePalabras(q);
  const acciones = useAccionesPalabras();

  const [nueva, setNueva] = useState('');
  const [errorAgregar, setErrorAgregar] = useState<string>();
  const [aviso, setAviso] = useState<{ texto: string; foco?: boolean }>();
  const titulo = useRef<HTMLHeadingElement>(null);
  // Al borrar, la fila desaparece con su botón: el foco vuelve al título, no a <body>.
  useEffect(() => {
    if (aviso?.foco) titulo.current?.focus();
  }, [aviso]);
  const [borrando, setBorrando] = useState<PalabraOfensiva>();
  const [errorBorrar, setErrorBorrar] = useState<string>();

  const paginas = palabras.data?.pages ?? [];
  const lista = paginas.flatMap((p) => p.content);
  const total = paginas[0]?.totalElements ?? 0;

  async function agregar(e: FormEvent) {
    e.preventDefault();
    setAviso(undefined);
    setErrorAgregar(undefined);
    const palabra = nueva.trim();
    if (!palabra) {
      setErrorAgregar('Escribe una palabra.');
      return;
    }
    try {
      const creada = await acciones.agregar.mutateAsync(palabra);
      setNueva('');
      setAviso({ texto: `Palabra «${creada.palabra}» agregada.` });
    } catch (fallo) {
      setErrorAgregar(mensajeErrorPalabra(fallo));
    }
  }

  async function eliminar(p: PalabraOfensiva) {
    setErrorBorrar(undefined);
    try {
      await acciones.eliminar.mutateAsync(p.id);
      setBorrando(undefined);
      setAviso({ texto: `Palabra «${p.palabra}» eliminada.`, foco: true });
    } catch (fallo) {
      setErrorBorrar(mensajeErrorPalabra(fallo));
    }
  }

  return (
    <section className="flex flex-col gap-8 pt-4 pb-16">
      <header>
        <h1 ref={titulo} tabIndex={-1} className="font-display text-titulo">
          Palabras ofensivas
        </h1>
        <p className="text-tinta-2 mt-1">
          Un comentario que contenga alguna de estas palabras queda oculto para revisión.
          Los cambios aplican de inmediato a comentarios nuevos y ediciones; los ya
          publicados no se vuelven a revisar.
        </p>
      </header>

      <form
        aria-label="Agregar palabra"
        onSubmit={(e) => void agregar(e)}
        className="flex flex-col gap-4 sm:flex-row sm:items-start"
      >
        <TextField
          label="Nueva palabra"
          value={nueva}
          maxLength={60}
          ayuda="Mínimo 3 letras. No distingue tildes ni mayúsculas, y reconoce 4 como a, 3 como e, etc."
          error={errorAgregar}
          onChange={(e) => setNueva(e.target.value)}
          className="sm:flex-1"
        />
        <Button type="submit" cargando={acciones.agregar.isPending} className="sm:mt-8">
          Agregar palabra
        </Button>
      </form>

      {aviso ? <Notice tipo="info">{aviso.texto}</Notice> : null}

      <TextField
        label="Buscar en la lista"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="max-w-md"
      />

      {palabras.isPending ? (
        <p role="status" className="text-tinta-2">
          Cargando palabras…
        </p>
      ) : null}

      {palabras.isError ? (
        <EstadoError
          mensaje={mensajeDeErrorAtlas(palabras.error)}
          onReintentar={() => void palabras.refetch()}
        />
      ) : null}

      {palabras.isSuccess && lista.length === 0 ? (
        <p role="status" className="bg-fondo-2 px-4 py-5">
          {q
            ? 'Ninguna palabra coincide con la búsqueda.'
            : 'Todavía no hay palabras en la lista.'}
        </p>
      ) : null}

      {lista.length > 0 ? (
        <div>
          <p className="text-tinta-2 mb-3" aria-live="polite">
            {total} {total === 1 ? 'palabra' : 'palabras'}
          </p>
          <ul className="flex flex-col gap-2">
            {lista.map((p) => (
              <li
                key={p.id}
                className="bg-fondo-2 flex items-center justify-between gap-4 px-4 py-2"
              >
                <span className="font-semibold break-all">{p.palabra}</span>
                <BotonTexto
                  aria-label={`Eliminar «${p.palabra}»`}
                  onClick={() => {
                    setErrorBorrar(undefined);
                    setBorrando(p);
                  }}
                >
                  Eliminar
                </BotonTexto>
              </li>
            ))}
          </ul>
          {palabras.hasNextPage ? (
            <Button
              variante="secundario"
              className="mt-6"
              cargando={palabras.isFetchingNextPage}
              onClick={() => void palabras.fetchNextPage()}
            >
              Ver más palabras
            </Button>
          ) : null}
        </div>
      ) : null}

      {borrando ? (
        <ConfirmarAccion
          titulo={`¿Eliminar «${borrando.palabra}»?`}
          confirmar="Eliminar palabra"
          error={errorBorrar}
          cargando={acciones.eliminar.isPending}
          onConfirmar={() => void eliminar(borrando)}
          onCancelar={() => setBorrando(undefined)}
        >
          <p>
            Los comentarios nuevos ya no se ocultarán por esta palabra. Los comentarios ya
            publicados no cambian.
          </p>
        </ConfirmarAccion>
      ) : null}
    </section>
  );
}
