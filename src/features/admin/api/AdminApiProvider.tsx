import type { ReactNode } from 'react';
import type { AdminApi } from './adminApi';
import { AdminApiContext } from './contexto';

export function AdminApiProvider({
  api,
  children,
}: {
  api: AdminApi;
  children: ReactNode;
}) {
  return <AdminApiContext.Provider value={api}>{children}</AdminApiContext.Provider>;
}
