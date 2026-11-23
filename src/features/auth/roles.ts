import type { RolPerfil } from '@/lib/api';

export const ROLES_PERFIL: ReadonlyArray<{
  valor: RolPerfil;
  nombre: string;
  detalle: string;
}> = [
  {
    valor: 'ESTUDIANTE',
    nombre: 'Estudiante',
    detalle: 'Estudio fisioterapia o una carrera afín',
  },
  {
    valor: 'PROFESIONAL',
    nombre: 'Profesional',
    detalle: 'Ejerzo en el área de la salud',
  },
  { valor: 'PRACTICANTE', nombre: 'Practicante', detalle: 'Estoy en prácticas clínicas' },
  { valor: 'VISITANTE', nombre: 'Visitante', detalle: 'Solo quiero conocer el atlas' },
];
