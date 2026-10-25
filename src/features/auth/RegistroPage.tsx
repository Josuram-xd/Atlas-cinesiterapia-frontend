import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { ApiError, type RolPerfil } from '@/lib/api';
import { authApi } from './api';
import { mensajeDeError } from './messages';
import { RolSelector } from './RolSelector';
import { PASSWORD_MIN, validarCorreo, validarPasswordNueva } from './validation';

interface Errores {
  correo?: string;
  password?: string;
  rolPerfil?: string;
}

export function RegistroPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rolPerfil, setRolPerfil] = useState<RolPerfil | ''>('');
  const [errores, setErrores] = useState<Errores>({});

  const registro = useMutation({
    mutationFn: authApi.registro,
    onSuccess: () => {
      navigate('/login', {
        replace: true,
        state: { aviso: 'Cuenta creada. Ya puedes iniciar sesión.' },
      });
    },
  });

  // 409: el correo ya existe. Se muestra en el campo, no como aviso general.
  const correoEnUso = registro.error instanceof ApiError && registro.error.status === 409;

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const siguiente: Errores = {
      correo: validarCorreo(correo),
      password: validarPasswordNueva(password),
      rolPerfil: rolPerfil ? undefined : 'Selecciona cómo vas a usar el atlas.',
    };
    setErrores(siguiente);
    if (siguiente.correo || siguiente.password || siguiente.rolPerfil || !rolPerfil)
      return;
    registro.mutate({ correo: correo.trim(), password, rolPerfil });
  }

  return (
    <AuthLayout
      titulo="Crea tu cuenta"
      descripcion="Con tu cuenta puedes explorar el atlas completo."
      pie={
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      }
    >
      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        {registro.isError && !correoEnUso ? (
          <Notice tipo="error">{mensajeDeError(registro.error)}</Notice>
        ) : null}
        <TextField
          label="Correo"
          type="email"
          name="correo"
          autoComplete="email"
          inputMode="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          error={
            errores.correo ?? (correoEnUso ? 'Ese correo ya está en uso.' : undefined)
          }
        />
        <TextField
          label="Contraseña"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          ayuda={`Mínimo ${PASSWORD_MIN} caracteres.`}
          error={errores.password}
        />
        <RolSelector
          value={rolPerfil}
          onChange={setRolPerfil}
          error={errores.rolPerfil}
        />
        <Button type="submit" cargando={registro.isPending} className="mt-1">
          {registro.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  );
}
