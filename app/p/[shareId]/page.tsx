import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SystemDiagram } from "@/components/system-diagram";
import type { SolarCalculationResult } from "@/lib/calculator/types";

type SharedProjectPageProps = {
  params: Promise<{ shareId: string }>;
};

export default async function SharedProjectPage({ params }: SharedProjectPageProps) {
  const { shareId } = await params;
  const project = await prisma.project.findUnique({
    where: { shareId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!project || !project.isPublic) {
    notFound();
  }

  const result = project.result as SolarCalculationResult;

  return (
    <main className="container stack">
      <section className="hero">
        <h1>{project.name}</h1>
        <p>
          Shared by {project.user.name || "SolarCalc User"} on {new Date(project.createdAt).toLocaleDateString()}.
        </p>
      </section>

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>System Diagram</h2>
        <SystemDiagram data={result.reactFlowData} />
      </section>

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>System Data</h2>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </section>
    </main>
  );
}