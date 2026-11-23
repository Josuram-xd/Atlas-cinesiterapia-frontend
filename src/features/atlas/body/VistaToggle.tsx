import type { VistaId } from './geometry';

interface VistaToggleProps {
  vista: VistaId;
  onChange: (vista: VistaId) => void;
}

const OPCIONES: Array<{ id: VistaId; texto: string }> = [
  { id: 'anterior', texto: 'Anterior' },
  { id: 'posterior', texto: 'Posterior' },
];

/** Alterna entre la vista anterior y la posterior: control segmentado en píldora, la elegida rellena. */
export function VistaToggle({ vista, onChange }: VistaToggleProps) {
  return (
    <div
      role="group"
      aria-label="Vista del cuerpo"
      className="bg-fondo-2 inline-flex w-fit gap-1 rounded-full p-1"
    >
      {OPCIONES.map((op) => {
        const activa = vista === op.id;
        return (
          <button
            key={op.id}
            type="button"
            aria-pressed={activa}
            onClick={() => onChange(op.id)}
            className="chip font-display cursor-pointer px-5 text-lg"
          >
            {op.texto}
          </button>
        );
      })}
    </div>
  );
}
