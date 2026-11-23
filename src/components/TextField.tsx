import { useId, useState, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  /** Texto de ayuda bajo el campo. */
  ayuda?: string;
}

export function TextField({
  label,
  error,
  ayuda,
  type = 'text',
  className = '',
  ...rest
}: TextFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const esPassword = type === 'password';
  const describedBy =
    [error ? `${id}-error` : null, ayuda ? `${id}-ayuda` : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={esPassword && visible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`campo ${esPassword ? 'pr-24' : ''}`}
          {...rest}
        />
        {esPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            className="text-acento hover:text-tinta absolute inset-y-1 right-1 cursor-pointer rounded-[calc(var(--radius-campo)-4px)] px-3 font-semibold underline underline-offset-4 transition-colors duration-200"
          >
            {visible ? 'Ocultar' : 'Mostrar'}
          </button>
        ) : null}
      </div>
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
    </div>
  );
}
