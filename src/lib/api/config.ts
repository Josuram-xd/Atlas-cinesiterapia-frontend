const raw = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/** URL base del backend, sin barra final. */
export const API_URL = raw.replace(/\/+$/, '');
