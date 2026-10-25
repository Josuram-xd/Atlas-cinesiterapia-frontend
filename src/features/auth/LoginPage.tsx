import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { tokenStorage } from '@/lib/api';
import { authApi } from './api';
import { mensajeDeError } from './messages';
import { validarCorreo } from './validation';

interface LoginState {
  /** Ruta a la que volver tras iniciar sesión. */
  from?: string;
  /** Aviso a mostrar (cuenta creada, contraseña cambiada). */
  aviso?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LoginState;
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState<{ correo?: string; password?: string }>({});

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (auth) => {
      tokenStorage.set({
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
      });
      navigate(state.from ?? '/', { replace: true });
    },
  });

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const siguiente = {
      correo: validarCorreo(correo),
      password: password ? undefined : 'Escribe tu contraseña.',
    };
    setErrores(siguiente);
    if (siguiente.correo || siguiente.password) return;
    login.mutate({ correo: correo.trim(), password });
  }

  return (
    <AuthLayout
      titulo="Inicia sesión"
      descripcion="Entra con tu correo y contraseña para usar el atlas."
      pie={
        <>
          <p>
            ¿Primera vez aquí? <Link to="/registro">Crea tu cuenta</Link>
          </p>
          <p>
            <Link to="/recuperar">Olvidé mi contraseña</Link>
          </p>
        </>
      }
    >
      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        {state.aviso ? <Notice tipo="info">{state.aviso}</Notice> : null}
        {login.isError ? (
          <Notice tipo="error">
            {mensajeDeError(login.error, {
              400: 'Correo o contraseña incorrectos.',
              401: 'Correo o contraseña incorrectos.',
            })}
          </Notice>
        ) : null}
        <TextField
          label="Correo"
          type="email"
          name="correo"
          autoComplete="email"
          inputMode="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          error={errores.correo}
        />
        <TextField
          label="Contraseña"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errores.password}
        />
        <Button type="submit" cargando={login.isPending} className="mt-1">
          {login.isPending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  );
}
