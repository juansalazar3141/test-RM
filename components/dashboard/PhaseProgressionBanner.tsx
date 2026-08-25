import { FormSubmitButton } from "@/components/ui/FormSubmitButton";
import {
  avanzarAFuerzaAction,
  updateFaseEntrenamientoAction,
} from "@/actions/persona";
import type { TrainingFase } from "@/lib/training";

type PhaseProgressionBannerProps = {
  cc: string;
  faseEntrenamiento: TrainingFase | null;
  daysSinceFaseInicio: number | null;
};

export function PhaseProgressionBanner({
  cc,
  faseEntrenamiento,
  daysSinceFaseInicio,
}: PhaseProgressionBannerProps) {
  if (
    faseEntrenamiento === "resistencia" &&
    daysSinceFaseInicio !== null &&
    daysSinceFaseInicio >= 60
  ) {
    return (
      <div className="space-y-3 rounded-3xl border border-accent/30 bg-accent/5 p-4 text-sm text-text-primary dark:text-white">
        <p>
          Tu fase de resistencia (2 meses) ha terminado. Continúa con fuerza
          máxima para seguir progresando.
        </p>
        <form action={avanzarAFuerzaAction.bind(null, cc)}>
          <FormSubmitButton pendingLabel="Actualizando...">
            Continuar con fuerza máxima
          </FormSubmitButton>
        </form>
      </div>
    );
  }

  if (faseEntrenamiento === "fuerza") {
    return (
      <div className="space-y-3 rounded-3xl border border-accent/30 bg-accent/5 p-4 text-sm text-text-primary dark:text-white">
        <p>¿Quieres continuar con fuerza máxima o cambiar a hipertrofia?</p>
        <div className="flex flex-wrap gap-3">
          <form action={updateFaseEntrenamientoAction.bind(null, cc, "fuerza")}>
            <FormSubmitButton pendingLabel="Guardando...">
              Seguir con fuerza máxima
            </FormSubmitButton>
          </form>
          <form
            action={updateFaseEntrenamientoAction.bind(null, cc, "hipertrofia")}
          >
            <FormSubmitButton pendingLabel="Guardando...">
              Cambiar a hipertrofia
            </FormSubmitButton>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
