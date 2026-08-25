import { PrimaryButton } from "@/components/ui/PrimaryButton";

type RetestReminderBannerProps = {
  daysSinceLastSession: number;
  newSessionHref: string;
};

export function RetestReminderBanner({
  daysSinceLastSession,
  newSessionHref,
}: RetestReminderBannerProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-200">
      <p>
        Han pasado {daysSinceLastSession} días desde tu última prueba de
        fuerza. Te recomendamos repetirla para mantener tus recomendaciones
        actualizadas.
      </p>
      <PrimaryButton href={newSessionHref}>Repetir prueba de fuerza</PrimaryButton>
    </div>
  );
}
