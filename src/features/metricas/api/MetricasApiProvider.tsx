import type { ReactNode } from 'react';
import type { MetricasApi } from './metricasApi';
import { MetricasApiContext } from './contexto';

export function MetricasApiProvider({
  api,
  children,
}: {
  api: MetricasApi;
  children: ReactNode;
}) {
  return (
    <MetricasApiContext.Provider value={api}>{children}</MetricasApiContext.Provider>
  );
}
