import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <AppLayout>
        <h1 className="font-display text-titulo">Atlas de cinesiterapia</h1>
      </AppLayout>
    ),
  },
];
