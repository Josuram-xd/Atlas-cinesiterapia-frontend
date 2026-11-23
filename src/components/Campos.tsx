import { useId, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const CAJA =
  'rounded-campo bg-fondo text-tinta block min-h-12 w-full border-2 px-4 py-2.5';

function Mensajes({ id, error, ayuda }: { id: string; error?: string; ayuda?: string }) {
  return (
    <>
      {ayuda ? (
        <p id={`${id}-ayuda`} className="text-tinta-2 mt-1.5 text-base">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-error mt-1.5 font-medium">
          {error}
        </p>
      ) : null}
    </>
  );
}

const describedBy = (id: string, error?: string, ayuda?: string) =>
  [error ? `${id}-error` : null, ayuda ? `${id}-ayuda` : null]
    .filter(Boolean)
    .join(' ') || undefined;

interface BaseProps {
  label: string;
  error?: string;
  ayuda?: string;
}

/** Área de texto con etiqueta, ayuda y error, con el mismo aspecto que TextField. */
export function TextAreaField({
  label,
  error,
  ayuda,
  className = '',
  ...rest
}: BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, ayuda)}
        rows={4}
        className={`${CAJA} ${error ? 'border-error' : 'border-tinta'} resize-y leading-normal`}
        {...rest}
      />
      <Mensajes id={id} error={error} ayuda={ayuda} />
    </div>
  );
}

/** Lista desplegable nativa con etiqueta y error. */
export function SelectField({
  label,
  error,
  ayuda,
  className = '',
  children,
  ...rest
}: BaseProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, ayuda)}
        className={`${CAJA} ${error ? 'border-error' : 'border-tinta'}`}
        {...rest}
      >
        {children}
      </select>
      <Mensajes id={id} error={error} ayuda={ayuda} />
    </div>
  );
}
