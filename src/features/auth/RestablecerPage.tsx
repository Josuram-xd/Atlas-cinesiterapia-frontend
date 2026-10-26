import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { ApiError } from '@/lib/api';
import { authApi } from './api';
import { mensajeDeError } from './messages';
import { PASSWORD_MAX, PASSWORD_MIN, validarPasswordNueva } from './validation';

const ENLACE_VENCIDO = 'El enlace venció o ya se usó. Pide uno nuevo.';

export function RestablecerPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<{ password?: string; confirmacion?: string }>(
    {},
  );

  const restablecer = useMutation({
    mutationFn: authApi.restablecer,
    onSuccess: () => {
      navigate('/login', {
        replace: true,
        state: { aviso: 'Contraseña actualizada. Inicia sesión con la nueva.' },
      });
    },
  });

  const enlaceInvalido =
    restablecer.error instanceof ApiError &&
    (restablecer.error.code === 'TOKEN_INVALIDO' ||
      restablecer.error.status === 404 ||
      restablecer.error.status === 410);

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!token) return;
    const siguiente = {
      password: validarPasswordNueva(password),
      confirmacion:
        confirmacion === password ? undefined : 'Las contraseñas no coinciden.',
    };
    setErrores(siguiente);
    if (siguiente.password || siguiente.confirmacion) return;
    restablecer.mutate({ token, nuevaPassword: password });
  }

  if (!token) {
    return (
      <AuthLayout
        titulo="Enlace incompleto"
        pie={
          <p>
            <Link to="/recuperar">Pedir un enlace nuevo</Link>
          </p>
        }
      >
        <Notice tipo="error">
          Este enlace no trae el código necesario. Pide uno nuevo desde la pantalla de
          recuperación.
        </Notice>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      titulo="Crea una contraseña nueva"
      descripcion="Elige una contraseña que no uses en otros sitios."
    >
      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        {restablecer.isError ? (
          <Notice tipo="error">
            {mensajeDeError(
              restablecer.error,
              {
                404: ENLACE_VENCIDO,
                410: ENLACE_VENCIDO,
                400: 'Revisa la contraseña: debe tener entre 8 y 72 caracteres.',
              },
              { TOKEN_INVALIDO: ENLACE_VENCIDO },
            )}
            {enlaceInvalido ? (
              <>
                {' '}
                <Link to="/recuperar">Pedir un enlace nuevo</Link>
              </>
            ) : null}
          </Notice>
        ) : null}
        <TextField
          label="Contraseña nueva"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          ayuda={`Entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`}
          error={errores.password}
        />
        <TextField
          label="Confirma la contraseña"
          type="password"
          name="confirmacion"
          autoComplete="new-password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          error={errores.confirmacion}
        />
        <Button type="submit" cargando={restablecer.isPending}>
          {restablecer.isPending ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
      </form>
    </AuthLayout>
  );
}
