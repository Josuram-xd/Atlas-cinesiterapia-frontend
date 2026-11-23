import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';

interface EstadoErrorProps {
  mensaje: string;
  onReintentar: () => void;
}

/** Aviso de error con la acción de volver a intentar; se anuncia a lectores de pantalla. */
export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="flex flex-col items-start gap-3">
      <Notice tipo="error">{mensaje}</Notice>
      <Button variante="secundario" onClick={onReintentar} className="min-h-12">
        Reintentar
      </Button>
    </div>
  );
}
