"use client";

import { useEffect, useMemo, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type DashboardGuideProps = {
  cc: string;
  hasSessions: boolean;
};

export function DashboardGuide({ cc, hasSessions }: DashboardGuideProps) {
  const [runGuide, setRunGuide] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem("dashboard-joyride-seen");
    if (!seen) {
      setRunGuide(true);
    }
  }, []);

  const steps = useMemo<Step[]>(
    () => [
      {
        target: ".dashboard-new-session-btn",
        content: "Empieza registrando tu primera sesión para ver tu RM estimado.",
        placement: "bottom",
      },
      {
        target: ".dashboard-sessions-list",
        content: hasSessions
          ? "Aquí verás tus sesiones guardadas y tu progreso de fuerza."
          : "Registra hoy tu primera sesión y empieza a comparar resultados.",
        placement: "top",
      },
    ],
    [hasSessions],
  );

  const handleJoyrideCallback = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      window.localStorage.setItem("dashboard-joyride-seen", "1");
      setRunGuide(false);
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        continuous
        run={runGuide}
        showSkipButton
        showProgress
        styles={{
          options: {
            zIndex: 9999,
            arrowColor: "#f8fafc",
            backgroundColor: "#f8fafc",
            overlayColor: "rgba(15, 23, 42, 0.6)",
            primaryColor: "#22c55e",
          },
        }}
        callback={handleJoyrideCallback}
      />
      <div className="rounded-3xl border border-gray-200 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-bg-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-text-secondary dark:text-text-secondary">
              Siguiente paso
            </p>
            <p className="mt-2 text-lg font-semibold text-text-primary dark:text-white">
              Registra tu próxima sesión.
            </p>
            <p className="mt-1 text-sm leading-6 text-text-secondary dark:text-text-secondary">
              Lleva tu RM al siguiente nivel con resultados prácticos.
            </p>
          </div>
          <PrimaryButton
            href={`/nueva-sesion?cc=${encodeURIComponent(cc)}`}
            className="dashboard-new-session-btn max-w-[220px]"
          >
            + Nueva sesión
          </PrimaryButton>
        </div>
      </div>
    </>
  );
}
