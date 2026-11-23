import { Button } from '@/components/Button';
import { SelectField, TextAreaField } from '@/components/Campos';
import { TextField } from '@/components/TextField';
import type { Categoria, Region } from '@/lib/api';
import {
  DOSIS_CLAVES,
  etiquetaCampo,
  MAX_AUTOR,
  MAX_AUTORES,
  MAX_DOSIS,
  MAX_NOMBRE,
  MAX_REVISORA,
  MAX_TEXTO,
  type CampoTexto,
  type FormFicha,
} from './fichaForm';

export interface PropsPaso {
  form: FormFicha;
  errores: Record<string, string>;
  onCambio: (cambios: Partial<FormFicha>) => void;
}

function Texto({
  campo,
  etiqueta,
  ayuda,
  filas,
  form,
  errores,
  onCambio,
}: PropsPaso & { campo: CampoTexto; etiqueta?: string; ayuda?: string; filas?: number }) {
  return (
    <TextAreaField
      label={etiqueta ?? etiquetaCampo(campo)}
      ayuda={ayuda}
      rows={filas ?? 4}
      maxLength={MAX_TEXTO}
      value={form[campo]}
      error={errores[campo]}
      onChange={(e) => onCambio({ [campo]: e.target.value })}
    />
  );
}

export function PasoGeneral({
  form,
  errores,
  onCambio,
  regiones,
  categorias,
}: PropsPaso & { regiones: Region[]; categorias: Categoria[] }) {
  const grupo = (vista: Region['vista']) =>
    regiones
      .filter((r) => r.vista === vista)
      .map((r) => (
        <option key={r.id} value={r.id}>
          {r.nombre}
        </option>
      ));
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <TextField
        label="Nombre del ejercicio"
        maxLength={MAX_NOMBRE}
        value={form.nombre}
        error={errores.nombre}
        onChange={(e) => onCambio({ nombre: e.target.value })}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          label="Región anatómica"
          value={form.regionId ?? ''}
          error={errores.regionId}
          onChange={(e) =>
            onCambio({ regionId: e.target.value ? Number(e.target.value) : null })
          }
        >
          <option value="">Elige una región</option>
          <optgroup label="Vista anterior">{grupo('ANTERIOR')}</optgroup>
          <optgroup label="Vista posterior">{grupo('POSTERIOR')}</optgroup>
        </SelectField>
        <SelectField
          label="Categoría terapéutica"
          value={form.categoriaId ?? ''}
          error={errores.categoriaId}
          onChange={(e) =>
            onCambio({ categoriaId: e.target.value ? Number(e.target.value) : null })
          }
        >
          <option value="">Elige una categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </SelectField>
      </div>
      <Texto
        campo="objetivoTerapeutico"
        ayuda="Qué se busca lograr con este ejercicio."
        form={form}
        errores={errores}
        onCambio={onCambio}
      />
      <Texto
        campo="estructurasIntervenidas"
        ayuda="Músculos, articulaciones y tejidos sobre los que actúa."
        form={form}
        errores={errores}
        onCambio={onCambio}
      />
    </div>
  );
}

export function PasoProtocolo(props: PropsPaso) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Texto campo="indicaciones" filas={5} {...props} />
      <Texto campo="precaucionesContraindicaciones" filas={5} {...props} />
    </div>
  );
}

export function PasoEjecucion(props: PropsPaso) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Texto campo="posicionPaciente" {...props} />
      <Texto campo="posicionFisioterapeuta" {...props} />
      <Texto
        campo="ejecucion"
        filas={6}
        ayuda="Separa los pasos con líneas en blanco o con saltos de línea."
        {...props}
      />
      <Texto campo="comandosVerbales" {...props} />
    </div>
  );
}

export function PasoDosificacion({ form, errores, onCambio }: PropsPaso) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <fieldset className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="font-display mb-3 text-xl font-semibold">Dosificación</legend>
        {DOSIS_CLAVES.map((k) => (
          <TextField
            key={k}
            label={etiquetaCampo(`dosificacion.${k}`)}
            maxLength={MAX_DOSIS}
            value={form.dosificacion[k]}
            error={errores[`dosificacion.${k}`]}
            ayuda={
              k === 'series' ? 'Texto libre: "3", "3x12", "hasta fatiga".' : undefined
            }
            onChange={(e) =>
              onCambio({ dosificacion: { ...form.dosificacion, [k]: e.target.value } })
            }
          />
        ))}
      </fieldset>
      <Texto
        campo="progresion"
        ayuda="Opcional."
        form={form}
        errores={errores}
        onCambio={onCambio}
      />
      <Texto
        campo="erroresComunes"
        ayuda="Opcional."
        form={form}
        errores={errores}
        onCambio={onCambio}
      />
    </div>
  );
}

export function PasoMetadatos({ form, errores, onCambio }: PropsPaso) {
  const autores = form.estudiantesCreadores;
  const cambiarAutor = (i: number, valor: string) =>
    onCambio({ estudiantesCreadores: autores.map((a, j) => (j === i ? valor : a)) });
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="font-display mb-1 text-xl font-semibold">
          Estudiantes creadores
        </legend>
        {autores.map((autor, i) => (
          <div key={i} className="flex items-end gap-3">
            <TextField
              className="flex-1"
              label={`Estudiante ${i + 1}`}
              maxLength={MAX_AUTOR}
              value={autor}
              onChange={(e) => cambiarAutor(i, e.target.value)}
            />
            {autores.length > 1 ? (
              <Button
                variante="secundario"
                aria-label={`Quitar al estudiante ${i + 1}`}
                onClick={() =>
                  onCambio({ estudiantesCreadores: autores.filter((_, j) => j !== i) })
                }
              >
                Quitar
              </Button>
            ) : null}
          </div>
        ))}
        {errores.estudiantesCreadores ? (
          <p className="text-error font-medium">{errores.estudiantesCreadores}</p>
        ) : null}
        <div>
          <Button
            variante="secundario"
            disabled={autores.length >= MAX_AUTORES}
            onClick={() => onCambio({ estudiantesCreadores: [...autores, ''] })}
          >
            Agregar estudiante
          </Button>
        </div>
      </fieldset>
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Cohorte"
          inputMode="numeric"
          placeholder="2025-1"
          ayuda="Año y periodo, por ejemplo 2025-1."
          maxLength={7}
          value={form.cohorte}
          error={errores.cohorte}
          onChange={(e) => onCambio({ cohorte: e.target.value })}
        />
        <TextField
          label="Profesora revisora"
          maxLength={MAX_REVISORA}
          value={form.profesoraRevisora}
          error={errores.profesoraRevisora}
          onChange={(e) => onCambio({ profesoraRevisora: e.target.value })}
        />
      </div>
    </div>
  );
}
