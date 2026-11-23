// API falsa para las pruebas E2E. No hay backend: este servidor reutiliza los datos de
// ejemplo del atlas (los mismos del modo `mock`) y simula la autenticación. Cuenta las
// peticiones por ruta en GET /__peticiones para comprobar qué atiende la caché.
import http from 'node:http';
import { createServer } from 'vite';

const PUERTO = Number(process.env.API_FALSA_PUERTO ?? 4010);
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
});
const { crearMockAtlasApi } = await vite.ssrLoadModule(
  '/src/features/atlas/api/mockAtlasApi.ts',
);
const atlas = crearMockAtlasApi();

const USUARIOS = {
  'ana@atlas.test': { id: 1, rolPerfil: 'ESTUDIANTE', rolSistema: 'USER' },
  'admin@atlas.test': { id: 2, rolPerfil: 'PROFESIONAL', rolSistema: 'ADMIN' },
};
const peticiones = {};

function sesion(correo) {
  return {
    accessToken: `acceso-${correo}`,
    refreshToken: `refresco-${correo}`,
    tokenType: 'Bearer',
    expiresIn: 900,
    usuario: { correo, ...USUARIOS[correo] },
  };
}

async function cuerpoJson(req) {
  const trozos = [];
  for await (const t of req) trozos.push(t);
  try {
    return JSON.parse(Buffer.concat(trozos).toString() || '{}');
  } catch {
    return {};
  }
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PUERTO}`);
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();

  const enviar = (estado, datos) => {
    res.writeHead(estado, { 'Content-Type': 'application/json' });
    res.end(datos === undefined ? undefined : JSON.stringify(datos));
  };
  const clave = `${req.method} ${url.pathname}`;
  peticiones[clave] = (peticiones[clave] ?? 0) + 1;
  const ruta = url.pathname.split('/').filter(Boolean);

  try {
    if (clave === 'GET /__peticiones') return enviar(200, peticiones);
    if (clave === 'POST /auth/login') {
      const { correo, password } = await cuerpoJson(req);
      if (!USUARIOS[correo] || password !== 'Atlas-1234') {
        return enviar(401, { code: 'CREDENCIALES_INVALIDAS', message: 'Credenciales' });
      }
      return enviar(200, sesion(correo));
    }
    if (clave === 'POST /auth/refresh') {
      const { refreshToken = '' } = await cuerpoJson(req);
      const correo = refreshToken.replace('refresco-', '');
      return USUARIOS[correo]
        ? enviar(200, sesion(correo))
        : enviar(401, { code: 'TOKEN_INVALIDO', message: 'Token' });
    }
    if (clave === 'POST /auth/logout' || clave === 'POST /auth/cierre-pendiente') {
      return enviar(204);
    }
    if (!req.headers.authorization && ruta[0] !== '__peticiones') {
      return enviar(401, { code: 'NO_AUTENTICADO', message: 'Sin sesión' });
    }
    if (req.method === 'POST' && ruta[2] === 'visitas') return enviar(204);
    if (req.method !== 'GET') return enviar(404, { code: 'NO_ENCONTRADO', message: '-' });
    if (ruta[0] === 'regiones' && ruta.length === 1) {
      return enviar(200, await atlas.listarRegiones());
    }
    if (ruta[0] === 'regiones' && ruta[2] === 'categorias') {
      return enviar(200, await atlas.listarCategorias(Number(ruta[1])));
    }
    if (ruta[0] === 'ejercicios' && ruta.length === 1) {
      return enviar(
        200,
        await atlas.listarEjercicios({
          regionId: Number(url.searchParams.get('region')),
          categoriaId: Number(url.searchParams.get('categoria')),
        }),
      );
    }
    if (ruta[0] === 'ejercicios' && ruta[1] === 'buscar') {
      return enviar(200, await atlas.buscarEjercicios(url.searchParams.get('q') ?? ''));
    }
    if (ruta[0] === 'ejercicios' && ruta.length === 2) {
      return enviar(200, await atlas.obtenerEjercicio(Number(ruta[1])));
    }
    return enviar(404, { code: 'NO_ENCONTRADO', message: 'Ruta desconocida' });
  } catch (error) {
    return enviar(error?.status ?? 500, error?.body ?? { message: String(error) });
  }
});

servidor.listen(PUERTO, () => console.log(`API falsa en http://localhost:${PUERTO}`));
process.on('SIGTERM', () => process.exit(0));
