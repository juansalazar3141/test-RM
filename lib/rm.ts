import { getPorcentajeMasa } from "@/helpers/calculations";

export type RMResult = {
  epley: number;
  brzycki: number;
  lombardi: number;
  lander: number;
  oconnor: number;
  mayhew: number;
  wathen: number;
  baechle: number;
};

export type SexoRM = "masculino" | "femenino";

export type StrengthIndexLabel =
  | "Bajo"
  | "Regular"
  | "Buena"
  | "Muy buena"
  | "Excelente";

export type StrengthIndexResult = {
  total: number;
  label: StrengthIndexLabel;
};

type SessionExercise = {
  id: number;
  porcentajeMasaHombre: number;
  porcentajeMasaMujer: number;
};

type SessionReps = {
  ejercicioId: number;
  repeticiones: number;
};

type SessionRMResult = {
  ejercicioId: number;
  repeticiones: number;
  carga: number;
  valor: number;
} & RMResult;

type RepetitionValueTable = Record<number, readonly number[]>;

const ZERO_RM_RESULT: RMResult = {
  epley: 0,
  brzycki: 0,
  lombardi: 0,
  lander: 0,
  oconnor: 0,
  mayhew: 0,
  wathen: 0,
  baechle: 0,
};

const REPETITION_VALUES = [5, 7, 9, 11, 13, 15, 17] as const;

const MEN_REPETITION_LIMITS: RepetitionValueTable = {
  1: [2, 4, 7, 9, 14, 20, Infinity],
  2: [3, 6, 9, 12, 14, 19, Infinity],
  3: [3, 5, 8, 10, 15, 24, Infinity],
  4: [22, 27, 32, 36, 40, 44, Infinity],
  5: [0, 2, 6, 10, 15, 20, Infinity],
  6: [1, 3, 7, 10, 14, 19, Infinity],
};

const WOMEN_REPETITION_LIMITS: RepetitionValueTable = {
  1: [2, 5, 7, 11, 15, 20, Infinity],
  2: [1, 4, 7, 9, 12, 19, Infinity],
  3: [2, 5, 8, 10, 15, 24, Infinity],
  4: [14, 19, 24, 29, 33, 38, Infinity],
  5: [0, 1, 4, 9, 15, 20, Infinity],
  6: [0, 2, 4, 6, 9, 16, Infinity],
};

export function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toValidInputs(carga: number, reps: number) {
  if (!Number.isFinite(carga) || !Number.isFinite(reps)) {
    return null;
  }

  if (reps <= 0 || carga < 0) {
    return null;
  }

  return {
    carga,
    reps,
  };
}

function safeDivide(numerator: number, denominator: number) {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return 0;
  }

  return numerator / denominator;
}

function ensureValidNumber(value: number) {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return 0;
  }

  return value;
}

function normalizeSexo(sexo?: string): SexoRM {
  if (typeof sexo !== "string") {
    return "masculino";
  }

  const normalized = sexo.trim().toLowerCase();
  return normalized === "femenino" ? "femenino" : "masculino";
}

function getRepetitionLimits(sexo: SexoRM | string, ejercicioId: number) {
  const normalizedSexo = normalizeSexo(sexo);
  const table =
    normalizedSexo === "femenino"
      ? WOMEN_REPETITION_LIMITS
      : MEN_REPETITION_LIMITS;

  return table[ejercicioId] ?? null;
}

export function calculateRepetitionValue(
  repeticiones: number,
  ejercicioId: number,
  sexo: SexoRM | string = "masculino",
): number {
  if (!Number.isFinite(repeticiones)) {
    return 0;
  }

  const limits = getRepetitionLimits(sexo, ejercicioId);
  if (!limits) {
    return 0;
  }

  const reps = Math.abs(Math.floor(repeticiones));
  const valueIndex = limits.findIndex((limit) => reps <= limit);

  return valueIndex >= 0 ? REPETITION_VALUES[valueIndex] : 0;
}

export function getStrengthIndexClassification(
  total: number,
): StrengthIndexLabel {
  if (!Number.isFinite(total) || total <= 53) {
    return "Bajo";
  }

  if (total <= 65) return "Regular";
  if (total <= 77) return "Buena";
  if (total <= 89) return "Muy buena";
  return "Excelente";
}

export function calculateStrengthIndex(
  resultados: Array<{ ejercicioId: number; repeticiones: number }>,
  sexo: SexoRM | string = "masculino",
): StrengthIndexResult {
  const total = resultados.reduce(
    (sum, resultado) =>
      sum +
      calculateRepetitionValue(
        resultado.repeticiones,
        resultado.ejercicioId,
        sexo,
      ),
    0,
  );

  return {
    total,
    label: getStrengthIndexClassification(total),
  };
}

function calculateRMFemenino(carga: number, reps: number): RMResult {
  // Female formulas requested by product requirements.
  const epley = roundToTwo(ensureValidNumber(0.0333 * carga * reps + carga));
  const brzycki = roundToTwo(
    ensureValidNumber(safeDivide(carga, 1.0278 - 0.0278 * reps)),
  );
  const lombardi = roundToTwo(ensureValidNumber(reps ** 0.1 * carga));
  const lander = roundToTwo(
    ensureValidNumber(safeDivide(carga, 1.013 - 0.0267123 * reps)),
  );
  const oconnor = roundToTwo(ensureValidNumber(0.025 * reps * carga + carga));
  const mayhew = roundToTwo(
    ensureValidNumber(
      safeDivide(100 * carga, 52.2 + 41.9 * Math.exp(-0.055 * reps)),
    ),
  );
  const wathen = roundToTwo(
    ensureValidNumber(
      safeDivide(100 * carga, 48.8 + 53.8 * Math.exp(-0.075 * reps)),
    ),
  );
  const baechle = roundToTwo(ensureValidNumber(carga * (1 + 0.033 * reps)));

  return {
    epley,
    brzycki,
    lombardi,
    lander,
    oconnor,
    mayhew,
    wathen,
    baechle,
  };
}

export function calculateEpley(carga: number, reps: number): number {
  const input = toValidInputs(carga, reps);
  if (!input) {
    return 0;
  }

  const result = input.carga * (1 + 0.0333 * input.reps);
  return roundToTwo(ensureValidNumber(result));
}

export function calculateBrzycki(carga: number, reps: number): number {
  const input = toValidInputs(carga, reps);
  if (!input) {
    return 0;
  }

  const denominator = 1.0278 - 0.0278 * input.reps;
  const result = safeDivide(input.carga, denominator);
  return roundToTwo(ensureValidNumber(result));
}

export function calculateLombardi(carga: number, reps: number): number {
  const input = toValidInputs(carga, reps);
  if (!input) {
    return 0;
  }

  const result = input.carga * input.reps ** 0.1;
  return roundToTwo(ensureValidNumber(result));
}

export function calculateLander(carga: number, reps: number): number {
  const input = toValidInputs(carga, reps);
  if (!input) {
    return 0;
  }

  const denominator = 1.013 - 0.0267123 * input.reps;
  const result = safeDivide(input.carga, denominator);
  return roundToTwo(ensureValidNumber(result));
}

export function calculateOconnor(carga: number, reps: number): number {
  const input = toValidInputs(carga, reps);
  if (!input) {
    return 0;
  }

  const result = input.carga * (1 + 0.025 * input.reps);
  return roundToTwo(ensureValidNumber(result));
}

export function calculateMayhew(carga: number, reps: number): number {
  const input = toValidInputs(carga, reps);
  if (!input) {
    return 0;
  }

  const denominator = 52.2 + 41.9 * Math.exp(-0.055 * input.reps);
  const result = safeDivide(100 * input.carga, denominator);
  return roundToTwo(ensureValidNumber(result));
}

export function calculateWathen(carga: number, reps: number): number {
  const input = toValidInputs(carga, reps);
  if (!input) {
    return 0;
  }

  const denominator = 48.8 + 53.8 * Math.exp(-0.075 * input.reps);
  const result = safeDivide(100 * input.carga, denominator);
  return roundToTwo(ensureValidNumber(result));
}

export function calculateBaechle(carga: number, reps: number): number {
  const input = toValidInputs(carga, reps);
  if (!input) {
    return 0;
  }

  const result = input.carga * (1 + 0.033 * input.reps);
  return roundToTwo(ensureValidNumber(result));
}

export function calculateRM(
  carga: number,
  reps: number,
  sexo: SexoRM | string = "masculino",
): RMResult {
  if (
    !Number.isFinite(carga) ||
    !Number.isFinite(reps) ||
    reps <= 0 ||
    carga < 0
  ) {
    return { ...ZERO_RM_RESULT };
  }

  const normalizedSexo = normalizeSexo(sexo);

  if (normalizedSexo === "femenino") {
    return calculateRMFemenino(carga, reps);
  }

  return {
    epley: calculateEpley(carga, reps),
    brzycki: calculateBrzycki(carga, reps),
    lombardi: calculateLombardi(carga, reps),
    lander: calculateLander(carga, reps),
    oconnor: calculateOconnor(carga, reps),
    mayhew: calculateMayhew(carga, reps),
    wathen: calculateWathen(carga, reps),
    baechle: calculateBaechle(carga, reps),
  };
}

export function calculateRMForSession(
  masaCorporal: number,
  ejercicios: SessionExercise[],
  reps: SessionReps[],
  sexo: SexoRM | string = "masculino",
): SessionRMResult[] {
  const safeMasaCorporal = Number.isFinite(masaCorporal) ? masaCorporal : 0;

  const repsMap = new Map<number, number>();
  for (const repItem of reps) {
    const repeticiones = Number.isFinite(repItem.repeticiones)
      ? Math.max(0, repItem.repeticiones)
      : 0;
    repsMap.set(repItem.ejercicioId, repeticiones);
  }

  return ejercicios.map((ejercicio) => {
    const repeticiones = repsMap.get(ejercicio.id) ?? 0;
    const cargaRaw = safeMasaCorporal * getPorcentajeMasa({ sexo }, ejercicio);
    const carga = roundToTwo(ensureValidNumber(cargaRaw));
    const rm = calculateRM(carga, repeticiones, sexo);

    return {
      ejercicioId: ejercicio.id,
      repeticiones,
      carga,
      valor: calculateRepetitionValue(repeticiones, ejercicio.id, sexo),
      ...rm,
    };
  });
}

// Backward-compatible aliases for existing imports.
export const epley = calculateEpley;
export const brzycki = calculateBrzycki;
export const lombardi = calculateLombardi;
export const lander = calculateLander;
export const oconnor = calculateOconnor;
export const mayhew = calculateMayhew;
export const wathen = calculateWathen;
export const baechle = calculateBaechle;
