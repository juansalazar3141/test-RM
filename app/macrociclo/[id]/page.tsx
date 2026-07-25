import { notFound, redirect } from "next/navigation";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { prisma } from "@/lib/prisma";
import { toISODate } from "@/lib/macrociclo";
import { obtenerMacrocicloPorId } from "@/services/macrociclo.service";
import { cerrarMacrocicloAction, eliminarMacrocicloAction } from "@/actions/macrociclo";

export default async function MacrocicloDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const id = Number(resolvedParams.id);
  const rawCC = resolvedSearchParams.cc;
  const cc = typeof rawCC === "string" ? rawCC.trim() : "";

  if (!cc || !Number.isInteger(id) || id <= 0) {
    redirect("/");
  }

  const persona = await prisma.persona.findUnique({
    where: { cc },
    select: { id: true, nombre: true, cc: true },
  });

  if (!persona) {
    redirect("/");
  }

  const macrociclo = await obtenerMacrocicloPorId(id);

  if (!macrociclo || macrociclo.personaId !== persona.id) {
    notFound();
  }

  const puedeEditar = macrociclo.estado === "borrador";
  const puedeCerrar = macrociclo.estado === "activo" || macrociclo.estado === "borrador";

  return (
    <main className="space-y-8 pb-10">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary dark:text-white">
          Macrociclo #{macrociclo.id}
        </h1>
        <p className="text-sm text-text-secondary">
          {persona.nombre} ·{" "}
          <span className="capitalize">{macrociclo.estado}</span>
        </p>
      </header>

      <section className="rounded-3xl border border-gray-200 bg-bg-soft p-4 sm:p-5 dark:border-white/10">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-text-secondary">Objetivo</p>
            <p className="font-medium capitalize text-text-primary dark:text-white">
              {macrociclo.objetivoTipo}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Rango</p>
            <p className="font-medium text-text-primary dark:text-white">
              {toISODate(macrociclo.fechaInicio)} - {toISODate(macrociclo.fechaFin)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Sesión RM</p>
            <p className="font-medium text-text-primary dark:text-white">
              {macrociclo.sesionRmId ? `#${macrociclo.sesionRmId}` : "Sin asignar"}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Total semanas</p>
            <p className="font-medium text-text-primary dark:text-white">
              {macrociclo.semanas.length}
            </p>
          </div>
        </div>
      </section>

      {macrociclo.semanas.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary dark:text-white">
            Semanas
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/8">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-white/8">
              <thead className="bg-bg-main">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Semana
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Fechas
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Microciclo
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Frecuencia
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Volumen
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Intensidad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-bg-soft dark:divide-white/8">
                {macrociclo.semanas.map((semana) => (
                  <tr key={semana.id}>
                    <td className="px-4 py-3 text-text-primary dark:text-white">
                      {semana.numeroSemana}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {toISODate(semana.fechaInicio)} - {toISODate(semana.fechaFin)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary capitalize">
                      {semana.tipoMicrociclo}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {semana.frecuencia}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {semana.volumen} kg
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {semana.intensidad}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {puedeEditar ? (
          <PrimaryButton
            href={`/macrociclo/${id}/editar?cc=${encodeURIComponent(cc)}`}
          >
            Editar macrociclo
          </PrimaryButton>
        ) : null}

        {puedeCerrar ? (
          <form action={cerrarMacrocicloAction}>
            <input type="hidden" name="cc" value={cc} />
            <input type="hidden" name="id" value={id} />
            <PrimaryButton
              type="submit"
              className="bg-bg-main text-text-secondary dark:bg-bg-main dark:text-text-secondary"
            >
              Cerrar macrociclo
            </PrimaryButton>
          </form>
        ) : null}

        <form action={eliminarMacrocicloAction}>
          <input type="hidden" name="cc" value={cc} />
          <input type="hidden" name="id" value={id} />
          <PrimaryButton
            type="submit"
            className="border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-200"
          >
            Eliminar macrociclo
          </PrimaryButton>
        </form>
      </div>
    </main>
  );
}
