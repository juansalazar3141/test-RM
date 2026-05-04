"use client";

import { useState } from "react";

import { calculateInitialWeight, calculateKIES, generateSeries } from "@/lib/nacleiro";

type Props = {
  bodyWeight: number;
  formatWeight: (value: number) => string;
};

function toNumber(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function NacleiroTable({ bodyWeight, formatWeight }: Props) {
  const [exerciseName, setExerciseName] = useState("");
  const [estimatedRM, setEstimatedRM] = useState("");
  const [actualReps, setActualReps] = useState<string[]>(
    Array.from({ length: 8 }).map(() => ""),
  );

  const rm = toNumber(estimatedRM);
  const safeBodyWeight = Number.isFinite(bodyWeight) && bodyWeight > 0 ? bodyWeight : 0;
  const relativeStrength = safeBodyWeight > 0 ? rm / safeBodyWeight : 0;
  const initialWeight = rm > 0 && safeBodyWeight > 0 ? calculateInitialWeight(rm, safeBodyWeight) : 0;
  const kies = rm > 0 && initialWeight > 0 ? calculateKIES(rm, initialWeight, 8) : 0;
  const series =
    rm > 0 && safeBodyWeight > 0
      ? generateSeries(rm, safeBodyWeight, 8).map((serie, index) => ({
          ...serie,
          actualReps: toNumber(actualReps[index] ?? ""),
        }))
      : [];
  const finalRM = series.reduce((max, serie) => {
    return serie.actualReps > 0 ? Math.max(max, serie.peso) : max;
  }, 0);
  const protocolData = {
    method: "nacleiro",
    exerciseName,
    bodyWeight: safeBodyWeight,
    estimatedRM: rm,
    relativeStrength,
    initialWeight,
    kies,
    finalRM,
    series,
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="protocolData" value={JSON.stringify(protocolData)} />
      <input type="hidden" name="estimatedRM" value={rm} />
      <input type="hidden" name="finalRM" value={finalRM || rm} />
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
            placeholder="Ej. Sentadilla"
            required
          />
        </label>
        <label>
          <span className="text-sm font-medium text-text-primary dark:text-white">
            RM estimado
          </span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={estimatedRM}
            onChange={(event) => setEstimatedRM(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-bg-main px-4 py-3 text-text-primary outline-none transition focus:border-accent dark:border-white/10 dark:bg-bg-subtle dark:text-white"
            placeholder="Ej. 100"
            required
          />
        </label>
      </div>

      <div className="grid gap-3 rounded-2xl border border-gray-200 bg-bg-main p-4 sm:grid-cols-4 dark:border-white/10 dark:bg-bg-subtle">
        <Metric label="Fuerza relativa" value={relativeStrength ? relativeStrength.toFixed(2) : "-"} />
        <Metric label="Peso inicial" value={initialWeight ? `${formatWeight(initialWeight)} kg` : "-"} />
        <Metric label="KIES" value={kies ? `${formatWeight(kies)} kg` : "-"} />
        <Metric label="RM detectado" value={finalRM ? `${formatWeight(finalRM)} kg` : "pendiente"} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-bg-main dark:border-white/10 dark:bg-bg-subtle">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
            <tr>
              <th className="px-4 py-3 font-medium">Serie</th>
              <th className="px-4 py-3 font-medium">Peso</th>
              <th className="px-4 py-3 font-medium">Reps objetivo</th>
              <th className="px-4 py-3 font-medium">Reps reales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {series.map((serie, index) => (
              <tr key={serie.serie}>
                <td className="px-4 py-3 text-text-primary dark:text-white">
                  Serie {serie.serie}
                </td>
                <td className="px-4 py-3 text-text-primary dark:text-white">
                  {formatWeight(serie.peso)} kg
                </td>
                <td className="px-4 py-3 text-text-secondary">{serie.reps}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={actualReps[index] ?? ""}
                    onChange={(event) =>
                      setActualReps((current) =>
                        current.map((reps, repsIndex) =>
                          repsIndex === index ? event.target.value : reps,
                        ),
                      )
                    }
                    className="w-24 rounded-2xl border border-gray-200 bg-bg-soft px-3 py-2 text-right text-text-primary outline-none transition focus:border-accent dark:border-white/10 dark:bg-bg-main dark:text-white"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {series.length === 0 ? (
          <p className="px-4 py-4 text-sm text-text-secondary">
            Ingresa el RM estimado para generar las series.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-text-primary dark:text-white">
        {value}
      </p>
    </div>
  );
}
