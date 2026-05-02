"use client";

import { useEffect, useMemo, useState } from "react";
import { startNuevaSesionTour, hasSeenTour } from "@/lib/onboarding";
import { getPorcentajeMasa } from "@/helpers/calculations";
import { FormSubmitButton } from "@/components/ui/FormSubmitButton";
import { Section } from "@/components/ui/Section";
import { Tooltip } from "@/components/ui/Tooltip";
import { createSesionAction } from "@/actions/sesion";

function formatWeight(value: number) {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

type Ejercicio = {
  id: number;
  nombre: string;
  porcentajeMasaHombre: number;
  porcentajeMasaMujer: number;
};

type Persona = {
  id: number;
  masaCorporal: number;
  sexo: string;
};

interface Props {
  cc: string;
  requestId: string;
  persona: Persona;
  ejercicios: Ejercicio[];
  error?: string;
}

export function NuevaSesionForm({
  cc,
  requestId,
  persona,
  ejercicios,
  error,
}: Props) {
  const [pesoActual, setPesoActual] = useState<number | "">(
    persona.masaCorporal,
  );
  const [hasExperience, setHasExperience] = useState<boolean | null>(null);

  const steps = useMemo(() => [], []);

  useEffect(() => {
    if (hasExperience !== null && hasExperience === true) {
      const key = "nueva-sesion-tour-seen";
      if (!hasSeenTour(key)) {
        startNuevaSesionTour().catch(() => {});
      }
    }
  }, [hasExperience]);

  function getCargaBase(ejercicio: Ejercicio) {
    const masa = typeof pesoActual === "number" ? pesoActual : 0;
    return masa * getPorcentajeMasa(persona, ejercicio);
  }

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-8">
      {/* onboarding is handled via driver.js through lib/onboarding */}

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {hasExperience === null ? (
        <section className="rounded-3xl border border-gray-200 bg-bg-soft p-6 text-center dark:border-white/6 dark:bg-bg-main">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-secondary dark:text-text-secondary">
            Primera pregunta
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-text-primary dark:text-white">
            ¿Has entrenado al menos 2 meses?
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary dark:text-text-secondary">
            Esto nos ayuda a ajustar la experiencia y la ayuda que verás.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setHasExperience(true)}
              className="rounded-2xl border border-transparent bg-text-primary px-4 py-4 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black dark:hover:opacity-80"
            >
              Sí, llevo más de 2 meses
            </button>
            <button
              type="button"
              onClick={() => setHasExperience(false)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm font-semibold text-text-primary transition hover:bg-bg-soft dark:border-white/10 dark:bg-bg-main dark:text-white dark:hover:bg-bg-soft"
            >
              No, soy principiante
            </button>
          </div>
        </section>
      ) : null}

      {hasExperience !== null ? (
        <form
          action={createSesionAction}
          className="space-y-8"
          onKeyDown={handleFormKeyDown}
        >
          <input type="hidden" name="cc" value={cc} />
          <input type="hidden" name="requestId" value={requestId} />

          <Section title="Datos de la sesión">
            <label className="flex flex-col gap-2 py-4">
              <span className="text-sm font-medium text-text-primary dark:text-white">
                Tu peso actual (kg)
              </span>
              <input
                type="number"
                name="peso"
                min="0"
                step="0.1"
                value={pesoActual}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPesoActual(isNaN(val) ? "" : val);
                }}
                className="session-weight-field rounded-2xl border border-gray-300 bg-white px-4 py-4 text-lg text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-white/10 dark:bg-bg-soft dark:text-white dark:focus:border-accent dark:focus:ring-accent/40"
                required
                placeholder="Ej. 78.5"
              />
            </label>
            {hasExperience === false ? (
              <div className="rounded-3xl border border-gray-200 bg-bg-soft px-4 py-3 text-sm text-text-secondary dark:border-white/10 dark:bg-bg-main dark:text-text-secondary">
                Elige un peso que puedas controlar durante 5–8 repeticiones con
                buena técnica. No necesitas levantar al límite.
              </div>
            ) : null}
          </Section>

          <Section title="Ejercicios">
            <p className="mb-4 text-sm text-text-secondary dark:text-text-secondary">
              Anota cuántas repeticiones hiciste en cada ejercicio. Escribe 0 si
              no realizaste ese ejercicio hoy.
            </p>
            <div className="divide-y divide-gray-200 dark:divide-white/6">
              {ejercicios.map((ejercicio) => (
                <label
                  key={ejercicio.id}
                  htmlFor={`repeticiones_${ejercicio.id}`}
                  className="flex flex-col gap-3 border-b border-transparent py-4 last:border-b-0 sm:flex-row sm:items-end sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-text-primary dark:text-white">
                      {ejercicio.nombre}
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
                        Peso recomendado según tu cuerpo:{" "}
                        {formatWeight(getCargaBase(ejercicio))} kg
                      </p>
                      <Tooltip text="Este peso está calculado a partir de tu masa corporal y el porcentaje sugerido para este ejercicio. Úsalo como punto de partida." />
                    </div>
                  </div>

                  <div className="session-reps-field flex items-center gap-3 text-right sm:text-left">
                    <input
                      id={`repeticiones_${ejercicio.id}`}
                      name={`repeticiones_${ejercicio.id}`}
                      type="number"
                      min="0"
                      step="1"
                      defaultValue="0"
                      inputMode="numeric"
                      className="w-24 rounded-2xl border border-gray-200 bg-bg-soft px-4 py-3 text-right text-3xl font-semibold text-text-primary outline-none transition focus:border-accent focus:bg-white dark:border-white/10 dark:bg-bg-soft dark:text-white dark:caret-white dark:focus:border-accent dark:focus:bg-bg-subtle"
                    />
                    <span className="text-sm uppercase tracking-[0.18em] text-text-tertiary">
                      repeticiones
                    </span>
                  </div>

                  <input
                    type="hidden"
                    name="ejercicioIds"
                    value={ejercicio.id}
                  />
                </label>
              ))}
            </div>
          </Section>

          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-bg-soft px-4 py-3 text-sm text-text-secondary dark:border-white/10 dark:bg-bg-main dark:text-text-secondary">
              <p className="font-semibold text-text-primary dark:text-white">
                Consejo rápido
              </p>
              <p>
                Al guardar, verás tu peso máximo que puedes levantar una vez
                (1RM) estimado para cada ejercicio de forma inmediata.
              </p>
            </div>
            <div className="session-save-button">
              <FormSubmitButton pendingLabel="Guardando sesión…">
                Guardar sesión
              </FormSubmitButton>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
