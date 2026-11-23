import type { VistaId } from './geometry';

interface VistaToggleProps {
  vista: VistaId;
  onChange: (vista: VistaId) => void;
}

const OPCIONES: Array<{ id: VistaId; texto: string }> = [
  { id: 'anterior', texto: 'Anterior' },
  { id: 'posterior', texto: 'Posterior' },
];

/** Alterna entre la vista anterior y la posterior. Texto plano; la elegida lleva subrayado grueso. */
export function VistaToggle({ vista, onChange }: VistaToggleProps) {
  return (
    <div role="group" aria-label="Vista del cuerpo" className="flex gap-6">
      {OPCIONES.map((op) => {
        const activa = vista === op.id;
        return (
          <button
            key={op.id}
            type="button"
            aria-pressed={activa}
            onClick={() => onChange(op.id)}
            className={`font-display cursor-pointer text-2xl font-semibold underline decoration-4 underline-offset-8 transition-colors duration-150 ${
              activa
                ? 'text-tinta decoration-acento'
                : 'text-tinta-2 hover:text-tinta decoration-transparent'
            }`}
          >
            {op.texto}
          </button>
        );
      })}
    </div>
  );
}
