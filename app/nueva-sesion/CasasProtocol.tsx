"use client";

import { useMemo, useState } from "react";

type CasasStep = {
  name: string;
  percentage: number;
  rest: string;
  type: "base" | "intermedio" | "fuerte";
};

type Props = {
  formatWeight: (value: number) => string;
};

const CASAS_STEPS: CasasStep[] = [
  { name: "Fase especifica 40%", percentage: 0.4, rest: "Descanso 1 minuto", type: "base" },
  { name: "Fase especifica 60%", percentage: 0.6, rest: "Descanso 1 minuto", type: "base" },
  { name: "Preparacion articular 70%", percentage: 0.7, rest: "3 minutos de pausa", type: "base" },
  { name: "Preparacion articular 80%", percentage: 0.8, rest: "3 minutos de pausa", type: "base" },
  { name: "Preparacion neuromuscular 85%", percentage: 0.85, rest: "de 3 a 5 minutos", type: "base" },
  { name: "Preparacion neuromuscular 90%", percentage: 0.9, rest: "de 3 a 5 minutos", type: "base" },
  { name: "Maxima activacion 95%", percentage: 0.95, rest: "de 1 a 2 minutos", type: "base" },
  { name: "Busqueda RM 100%", percentage: 1, rest: "de 3 a 5 min", type: "base" },
  { name: "Repeticion 1 intermedia", percentage: 1.025, rest: "de 3 a 5 min", type: "intermedio" },
  { name: "Repeticion 2 intermedia", percentage: 1.050625, rest: "de 3 a 5 min", type: "intermedio" },
  { name: "Repeticion 3 intermedia", percentage: 1.076890625, rest: "de 3 a 5 min", type: "intermedio" },
  { name: "Repeticion 1 fuerte", percentage: 1.05, rest: "de 3 a 5 min", type: "fuerte" },
  { name: "Repeticion 2 fuerte", percentage: 1.1025, rest: "de 3 a 5 min", type: "fuerte" },
  { name: "Repeticion 3 fuerte", percentage: 1.157625, rest: "de 3 a 5 min", type: "fuerte" },
];

function toNumber(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function CasasProtocol({ formatWeight }: Props) {
  const [exerciseName, setExerciseName] = useState("");
  const [referenceRM, setReferenceRM] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [actualWeights, setActualWeights] = useState<string[]>(
    CASAS_STEPS.map(() => ""),
  );

  const reference = toNumber(referenceRM);
  const calculatedSteps = useMemo(
    () =>
      CASAS_STEPS.map((step, index) => ({
        ...step,
        step: index + 1,
        targetWeight: Math.round(reference * step.percentage),
        actualWeight: toNumber(actualWeights[index] ?? ""),
      })),
    [actualWeights, reference],
  );
  const finalRM = Math.max(
    ...calculatedSteps.map((step) => step.actualWeight || step.targetWeight),
    0,
  );
  const current = calculatedSteps[activeStep];
  const protocolData = {
    method: "casas",
    exerciseName,
    referenceRM: reference,
    finalRM,
    steps: calculatedSteps,
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="protocolData" value={JSON.stringify(protocolData)} />
      <input type="hidden" name="estimatedRM" value={reference} />
      <input type="hidden" name="finalRM" value={finalRM} />
      <input type="hidden" name="protocolExerciseName" value={exerciseName} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium text-text-primary dark:text-white">
            Ejercicio usado como base
          </span>
          <input
            name="protocolExerciseNameInput"
            type="text"
            value={exerciseName}
            onChange={(event) => setExerciseName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-bg-main px-4 py-3 text-text-primary outline-none transition focus:border-accent dark:border-white/10 dark:bg-bg-subtle dark:text-white"
            placeholder="Ej. Press banca"
            required
          />
        </label>
        <label>
          <span className="text-sm font-medium text-text-primary dark:text-white">
            RM de referencia
          </span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={referenceRM}
            onChange={(event) => setReferenceRM(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-bg-main px-4 py-3 text-text-primary outline-none transition focus:border-accent dark:border-white/10 dark:bg-bg-subtle dark:text-white"
            placeholder="Ej. 100"
            required
          />
        </label>
      </div>

      <article className="rounded-2xl border border-gray-200 bg-bg-main p-4 dark:border-white/10 dark:bg-bg-subtle">
        <header className="space-y-1">
          <p className="text-base font-semibold text-text-primary dark:text-white">
            Paso {current.step} de {calculatedSteps.length}: {current.name}
          </p>
          <p className="text-sm text-text-secondary">
            Peso sugerido: {formatWeight(current.targetWeight)} kg · {current.rest}
          </p>
        </header>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-text-primary dark:text-white">
            Peso usado
          </span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={actualWeights[activeStep] ?? ""}
            onChange={(event) =>
              setActualWeights((currentWeights) =>
                currentWeights.map((weight, index) =>
                  index === activeStep ? event.target.value : weight,
                ),
              )
            }
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-bg-soft px-4 py-3 text-text-primary outline-none transition focus:border-accent dark:border-white/10 dark:bg-bg-main dark:text-white"
            placeholder={`${formatWeight(current.targetWeight)} kg`}
          />
        </label>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
            disabled={activeStep === 0}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-bg-soft disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveStep((step) => Math.min(step + 1, CASAS_STEPS.length - 1))
            }
            disabled={activeStep === CASAS_STEPS.length - 1}
            className="rounded-2xl border border-transparent bg-text-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
          >
            Siguiente paso
          </button>
          <p className="text-sm text-text-secondary sm:ml-auto">
            RM final: {finalRM > 0 ? `${formatWeight(finalRM)} kg` : "pendiente"}
          </p>
        </div>
      </article>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-bg-main dark:border-white/10 dark:bg-bg-subtle">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
            <tr>
              <th className="px-4 py-3 font-medium">Paso</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">%</th>
              <th className="px-4 py-3 font-medium">Sugerido</th>
              <th className="px-4 py-3 font-medium">Usado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {calculatedSteps.map((step) => (
              <tr key={step.step}>
                <td className="px-4 py-3 text-text-primary dark:text-white">
                  {step.name}
                </td>
                <td className="px-4 py-3 text-text-secondary">{step.type}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {Math.round(step.percentage * 1000) / 10}%
                </td>
                <td className="px-4 py-3 text-text-primary dark:text-white">
                  {formatWeight(step.targetWeight)} kg
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {step.actualWeight > 0
                    ? `${formatWeight(step.actualWeight)} kg`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
