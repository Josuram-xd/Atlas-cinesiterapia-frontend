import type { RouteObject } from 'react-router-dom';
import { ListaFichasPage } from '@/features/admin/lista/ListaFichasPage';
import { FichaPage } from '@/features/atlas/ficha/FichaPage';
import { InicioPage } from '@/features/atlas/InicioPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RecuperarPage } from '@/features/auth/RecuperarPage';
import { RegistroPage } from '@/features/auth/RegistroPage';
import { RestablecerPage } from '@/features/auth/RestablecerPage';
import { AppShell } from './AppShell';
import { PublicOnly, RequireAuth, RequireRole } from './guards';

export const routes: RouteObject[] = [
  {
    element: <PublicOnly />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegistroPage /> },
    ],
  },
  { path: '/recuperar', element: <RecuperarPage /> },
  { path: '/restablecer', element: <RestablecerPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <InicioPage /> },
          { path: '/ejercicios/:id', element: <FichaPage /> },
          {
            element: <RequireRole rol="ADMIN" />,
            children: [{ path: '/admin', element: <ListaFichasPage /> }],
          },
        ],
      },
    ],
  },
];
