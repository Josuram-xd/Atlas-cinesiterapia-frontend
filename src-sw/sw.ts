/// <reference lib="webworker" />
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { API_URL } from '../src/lib/api/config';
import { CACHE_DATOS, esLecturaCacheable } from '../src/pwa/politicaCache';

declare const self: ServiceWorkerGlobalScope;

const SIETE_DIAS_S = 7 * 24 * 60 * 60;
const origenApi = new URL(API_URL).origin;

// La aplicación (HTML, JS, CSS, fuentes e íconos) se guarda entera al instalar.
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

// Lecturas del atlas: primero la red (datos al día, URLs de media vigentes y el 401 llega
// al cliente para renovar la sesión); sin conexión o si tarda más de 3 s, lo guardado.
// Lo que no esté en la lista blanca de `esLecturaCacheable` ni se intercepta.
registerRoute(
  ({ url, request }) => esLecturaCacheable(url, request.method, origenApi),
  new NetworkFirst({
    cacheName: CACHE_DATOS,
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: SIETE_DIAS_S,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// La nueva versión espera a que la persona pulse «Actualizar» en el aviso.
self.addEventListener('message', (evento) => {
  if (evento.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});
