import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { reiniciarSesionParaPruebas } from '@/features/auth/sessionStore';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  reiniciarSesionParaPruebas();
});
