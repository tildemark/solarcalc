import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SystemDiagram } from "@/components/system-diagram";
import { getBuildExpiryCutoff } from "@/lib/build-retention";
import type { SolarCalculationResult } from "@/lib/calculator/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://solarcalc.sanchez.ph";

type SharedProjectPageProps = {
  params: Promise<{ shareId: string }>;
};

export async function generateMetadata({ params }: SharedProjectPageProps): Promise<Metadata> {
  const { shareId } = await params;
  const project = await prisma.project.findUnique({
    where: { shareId },
    select: {
      name: true,
      isPublic: true,
    },
  });

  if (!project || !project.isPublic) {
    return {
      title: "Shared Build Not Found",
      description: "This shared solar build is unavailable.",
    };
  }

  const pageUrl = `${APP_URL}/p/${shareId}`;
  const imageUrl = `${APP_URL}/p/${shareId}/opengraph-image`;

  return {
    title: project.name,
    description: "View and share this SolarCalc design build.",
    openGraph: {
      title: project.name,
      description: "View and share this SolarCalc design build.",
      url: pageUrl,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${project.name} shared SolarCalc build`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.name,
      description: "View and share this SolarCalc design build.",
      images: [imageUrl],
    },
  };
}

type TermDefinition = {
  term: string;
  definition: string;
};

function describeStringing(term: string): string | null {
  const match = term.match(/^(\d+)S(\d+)P$/i);
  if (!match) {
    return null;
  }

  const series = Number(match[1]);
  const parallel = Number(match[2]);
  return `${series} in series and ${parallel} in parallel. Series increases voltage; parallel increases current capacity.`;
}

function buildRequiredGlossary(result: SolarCalculationResult): TermDefinition[] {
  const entries = new Map<string, string>();

  const add = (term: string, definition: string) => {
    if (!entries.has(term)) {
      entries.set(term, definition);
    }
  };

  const panelStringing = result.configuration.panelStringing;
  const batteryConfiguration = result.configuration.batteryConfiguration;

  const panelStringingDefinition = describeStringing(panelStringing);
  const batteryStringingDefinition = describeStringing(batteryConfiguration);

  if (panelStringingDefinition) {
    add(panelStringing, `Solar panel stringing: ${panelStringingDefinition}`);
  }
  if (batteryStringingDefinition) {
    add(batteryConfiguration, `Battery bank configuration: ${batteryStringingDefinition}`);
  }

  add("MPPT", "Maximum Power Point Tracking: inverter control that keeps PV voltage/current at the panel power sweet spot.");
  add("DoD", "Depth of Discharge: the usable fraction of battery capacity in normal operation.");
  add("Voc", "Open-circuit voltage of a solar panel, used to check max series string voltage limits.");
  add("Vmp", "Voltage at maximum power of a panel, used for practical string design within MPPT range.");
  add("Isc", "Short-circuit current of a panel, used for parallel string current and breaker sizing checks.");
  add("NEC 125% rule", "Continuous currents are multiplied by 1.25 for protective device sizing margin.");

  return Array.from(entries.entries()).map(([term, definition]) => ({ term, definition }));
}

export default async function SharedProjectPage({ params }: SharedProjectPageProps) {
  const { shareId } = await params;
  const retentionCutoff = getBuildExpiryCutoff();
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

  if (!project || !project.isPublic || project.createdAt < retentionCutoff) {
    notFound();
  }

  const result = project.result as SolarCalculationResult;
  const requiredGlossary = buildRequiredGlossary(result);

  return (
    <main className="container stack">
      <section className="hero">
        <h1>{project.name}</h1>
        <p>
          Shared by {project.user.name || "SolarCalc User"} on {new Date(project.createdAt).toLocaleDateString()}.
        </p>
        <div className="action-row">
          <a className="button-ghost" href={`/api/export/${project.shareId}`}>
            Export Build JSON
          </a>
          <Link className="button-ghost" href="/">
            Open SolarCalc
          </Link>
        </div>
      </section>

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>System Results</h2>
        <div className="metrics">
          {(result.ogMetadata.stats ?? []).map((item, index) => (
            <article className="metric" key={`${item}-${index}`}>
              <h3>{index === 0 ? "Inverter" : index === 1 ? "Battery" : index === 2 ? "Solar Array" : "Stat"}</h3>
              <p>{item}</p>
            </article>
          ))}
          <article className="metric">
            <h3>Panel Stringing</h3>
            <p>{result.configuration.panelStringing}</p>
          </article>
          <article className="metric">
            <h3>Battery Config</h3>
            <p>{result.configuration.batteryConfiguration}</p>
          </article>
        </div>

        <h2 style={{ margin: 0 }}>Computation Summary</h2>
        <div className="metrics">
          <article className="metric">
            <h3>Inverter Required</h3>
            <p>{result.computations.inverter.finalRequiredW.toFixed(0)} W</p>
          </article>
          <article className="metric">
            <h3>Inverter Model</h3>
            <p>{result.computations.inverter.selectedModel}</p>
          </article>
          <article className="metric">
            <h3>Battery Target</h3>
            <p>{result.computations.battery.targetKwh.toFixed(1)} kWh</p>
          </article>
          <article className="metric">
            <h3>Array Target</h3>
            <p>{result.computations.solarArray.targetW.toFixed(0)} W</p>
          </article>
        </div>

        <h2 style={{ margin: 0 }}>Computation Formulas</h2>
        <pre>{JSON.stringify(result.computations, null, 2)}</pre>

        <h2 style={{ margin: 0 }}>Explanations</h2>
        <div className="stack" style={{ gap: 8 }}>
          <p style={{ margin: 0 }}>
            <strong>Inverter:</strong> {result.explanations.inverterLogic}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Stringing:</strong> {result.explanations.stringingLogic}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Battery:</strong> {result.explanations.batteryLogic}
          </p>
        </div>

        <details>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            Required Terms ({requiredGlossary.length})
          </summary>
          <div className="stack" style={{ gap: 10, marginTop: 10 }}>
            {requiredGlossary.map((item) => (
              <article className="metric" key={item.term}>
                <h3>{item.term}</h3>
                <p style={{ marginTop: 8, fontSize: "0.95rem", fontWeight: 500 }}>{item.definition}</p>
              </article>
            ))}
          </div>
        </details>

        <h2 style={{ margin: 0 }}>System Diagram</h2>
        <SystemDiagram data={result.reactFlowData} />
      </section>

      <section className="panel stack">
        <details>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Raw Result Payload (JSON)</summary>
          <pre style={{ marginTop: 10 }}>{JSON.stringify(result, null, 2)}</pre>
        </details>
      </section>
    </main>
  );
}