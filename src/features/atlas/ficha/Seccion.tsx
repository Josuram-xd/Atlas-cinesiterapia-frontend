import type { ReactNode } from 'react';
import { aParrafos } from './texto';

/** Sección de la ficha: región con nombre accesible y título de segundo nivel. */
export function Seccion({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-6">
      <h2 id={`${id}-titulo`} className="font-display text-3xl leading-tight">
        {titulo}
      </h2>
      <div className="mt-6 flex flex-col gap-7">{children}</div>
    </section>
  );
}

/** Un dato de la ficha: título y su texto, mostrado siempre como texto plano. */
export function Campo({ titulo, texto }: { titulo: string; texto: string | null }) {
  const parrafos = aParrafos(texto);
  if (parrafos.length === 0) return null;
  return (
    <div className="max-w-[68ch]">
      <h3 className="font-display text-xl font-semibold">{titulo}</h3>
      <div className="mt-1.5 flex flex-col gap-3">
        {parrafos.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
