"use client";

import { useMemo } from "react";

type SexoInput = "hombre" | "mujer" | "masculino" | "femenino";

type ICCRow = {
  min: number;
  max: number | null;
  label: string;
  color: "verde" | "amarillo" | "rojo";
};

const ICC_TABLE_DATA: Record<"hombre" | "mujer", ICCRow[]> = {
  hombre: [
    { min: 0, max: 0.89, label: "Bajo riesgo", color: "verde" },
    { min: 0.9, max: 0.99, label: "Riesgo moderado", color: "amarillo" },
    { min: 1.0, max: null, label: "Alto riesgo", color: "rojo" },
  ],
  mujer: [
    { min: 0, max: 0.79, label: "Bajo riesgo", color: "verde" },
    { min: 0.8, max: 0.84, label: "Riesgo moderado", color: "amarillo" },
    { min: 0.85, max: null, label: "Alto riesgo", color: "rojo" },
  ],
};

// Colores para modo claro
const COLOR_CLASSES_LIGHT = {
  verde: {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-800",
    badge: "bg-green-100 text-green-800",
  },
  amarillo: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-800",
    badge: "bg-yellow-100 text-yellow-800",
  },
  rojo: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
    badge: "bg-red-100 text-red-800",
  },
};

// Colores para modo oscuro
const COLOR_CLASSES_DARK = {
  verde: {
    bg: "bg-green-900/30",
    border: "border-green-500/50",
    text: "text-green-400",
    badge: "bg-green-900/50 text-green-300",
  },
  amarillo: {
    bg: "bg-yellow-900/30",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
    badge: "bg-yellow-900/50 text-yellow-300",
  },
  rojo: {
    bg: "bg-red-900/30",
    border: "border-red-500/50",
    text: "text-red-400",
    badge: "bg-red-900/50 text-red-300",
  },
};

type ICCTableProps = {
  sexo?: SexoInput | null;
  icc?: number | null;
};

function getHighlightedIndex(icc: number | null | undefined, sexo: SexoInput): number {
  if (icc === null || icc === undefined || !Number.isFinite(icc)) {
    return -1;
  }

  const normalized = sexo.toLowerCase().trim();
  const key = (normalized === "hombre" || normalized === "masculino" || normalized === "m") 
    ? "hombre" 
    : "mujer";
  
  const rows = ICC_TABLE_DATA[key];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.max === null) {
      if (icc >= row.min) return i;
    } else if (icc >= row.min && icc <= row.max) {
      return i;
    }
  }

  return -1;
}

function formatRange(min: number, max: number | null): string {
  if (max === null) {
    return `≥ ${min.toFixed(2)}`;
  }
  if (min === 0) {
    return `< ${max.toFixed(2)}`;
  }
  return `${min.toFixed(2)} – ${max.toFixed(2)}`;
}

export function ICCTable({ sexo, icc }: ICCTableProps) {
  const normalizedSexo = useMemo(() => {
    if (!sexo) return null;
    const normalized = sexo.toLowerCase().trim();
    if (normalized === "hombre" || normalized === "masculino" || normalized === "m") {
      return "hombre";
    }
    if (normalized === "mujer" || normalized === "femenino" || normalized === "f") {
      return "mujer";
    }
    return null;
  }, [sexo]);

  const highlightedIndex = useMemo(() => {
    if (!normalizedSexo) return -1;
    return getHighlightedIndex(icc, normalizedSexo);
  }, [icc, normalizedSexo]);

  if (!normalizedSexo) {
    return (
      <div className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Selecciona tu sexo para ver la clasificación OMS del ICC.
        </p>
      </div>
    );
  }

  const rows = ICC_TABLE_DATA[normalizedSexo];

  return (
    <div className="w-full">
      {/* Encabezado responsive */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
          Clasificación OMS - Índice Cintura-Cadera
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Según tu sexo:{" "}
          <span className="font-medium capitalize text-gray-700 dark:text-gray-200">
            {normalizedSexo}
          </span>
        </p>
      </div>

      {/* Contenedor de tabla con scroll horizontal para móviles */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
        <table className="w-full min-w-[320px] sm:min-w-0 text-sm sm:text-base">
          <thead className="bg-gray-100 dark:bg-white/5">
            <tr>
              <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Rango ICC
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Clasificación
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 text-center font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Riesgo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {rows.map((row, index) => {
              const isHighlighted = index === highlightedIndex;
              const colorsLight = COLOR_CLASSES_LIGHT[row.color];
              const colorsDark = COLOR_CLASSES_DARK[row.color];

              return (
                <tr
                  key={index}
                  className={`transition-colors ${
                    isHighlighted
                      ? `dark:${colorsDark.bg} ${colorsLight.bg}`
                      : "bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <td
                    className={`px-3 py-2 sm:px-4 sm:py-3 font-mono text-xs sm:text-sm ${
                      isHighlighted
                        ? `${colorsLight.text} dark:${colorsDark.text}`
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {formatRange(row.min, row.max)}
                  </td>
                  <td className={`px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm ${
                    isHighlighted
                      ? `${colorsLight.text} dark:${colorsDark.text}`
                      : "text-gray-700 dark:text-gray-300"
                  }`}>
                    <span className="block sm:inline">{row.label}</span>
                    {isHighlighted && icc !== null && icc !== undefined && (
                      <span className="ml-1 sm:ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (tu valor: {icc.toFixed(2)})
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        isHighlighted
                          ? `${colorsLight.badge} dark:${colorsDark.badge}`
                          : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
                      }`}
                    >
                      {row.color === "verde"
                        ? "🟢"
                        : row.color === "amarillo"
                        ? "🟡"
                        : "🔴"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {icc !== null && icc !== undefined && highlightedIndex >= 0 && (
        <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          * La fila resaltada corresponde a tu ICC actual ({icc.toFixed(2)})
        </p>
      )}
    </div>
  );
}