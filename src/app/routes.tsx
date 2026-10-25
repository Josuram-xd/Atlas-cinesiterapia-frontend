import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { RecuperarPage } from '@/features/auth/RecuperarPage';
import { RegistroPage } from '@/features/auth/RegistroPage';
import { RestablecerPage } from '@/features/auth/RestablecerPage';

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegistroPage /> },
  { path: '/recuperar', element: <RecuperarPage /> },
  { path: '/restablecer', element: <RestablecerPage /> },
  {
    path: '/',
    element: (
      <AppLayout>
        <h1 className="font-display text-titulo">Atlas de cinesiterapia</h1>
      </AppLayout>
    ),
  },
];
