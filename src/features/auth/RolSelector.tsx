import { useId } from 'react';
import type { RolPerfil } from '@/lib/api';
import { ROLES_PERFIL } from './roles';

interface RolSelectorProps {
  value: RolPerfil | '';
  onChange: (rol: RolPerfil) => void;
  error?: string;
}

/** Grupo de radios: se elige un rol de perfil. Navegable con flechas (radios nativos). */
export function RolSelector({ value, onChange, error }: RolSelectorProps) {
  const id = useId();
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-1.5 font-semibold">¿Cómo vas a usar el atlas?</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {ROLES_PERFIL.map((rol) => (
          <label
            key={rol.valor}
            className="rounded-campo border-tinta has-[:checked]:bg-tinta has-[:checked]:text-fondo has-[:focus-visible]:outline-acento relative flex cursor-pointer flex-col border-2 px-4 py-3 transition-colors duration-150 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3"
          >
            <input
              type="radio"
              name="rolPerfil"
              value={rol.valor}
              checked={value === rol.valor}
              onChange={() => onChange(rol.valor)}
              className="absolute inset-0 opacity-0"
            />
            <span className="font-semibold">{rol.nombre}</span>
            <span className="text-base leading-snug opacity-85">{rol.detalle}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-error mt-1.5 font-medium">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
