import { safeAuth, signIn, signOut } from "@/auth";
import { CalculatorForm } from "@/components/calculator-form";
import { SavedBuildActions } from "@/components/saved-build-actions";
import { BUILD_RETENTION_DAYS, getBuildExpiryCutoff } from "@/lib/build-retention";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await safeAuth();
  const userEmail = session?.user?.email ?? null;
  const retentionCutoff = getBuildExpiryCutoff();

  await prisma.project.deleteMany({
    where: {
      createdAt: {
        lt: retentionCutoff,
      },
    },
  });

  const savedBuilds = userEmail
    ? await prisma.project.findMany({
        where: {
          user: {
            email: userEmail,
          },
          createdAt: {
            gte: retentionCutoff,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        select: {
          id: true,
          name: true,
          shareId: true,
          createdAt: true,
          isPublic: true,
        },
      })
    : [];

  return (
    <main className="container stack">
      <section className="hero">
        <h1>SolarCalc Engineering Console</h1>
        <p>
          Generate inverter sizing, battery bank configuration, panel stringing, BOM,
          and diagram payloads from a single set of system requirements.
        </p>
        <svg
          className="hero-banner"
          viewBox="0 0 1100 280"
          role="img"
          aria-label="Solar production and battery flow diagram"
        >
          <defs>
            <linearGradient id="heroSky" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#245236" />
              <stop offset="50%" stopColor="#3f7a4f" />
              <stop offset="100%" stopColor="#7db45f" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1100" height="280" rx="18" fill="url(#heroSky)" opacity="0.4" />
          <g transform="translate(56,42)">
            <circle cx="72" cy="72" r="48" fill="#f2c14e" />
            <g stroke="#f7e0a3" strokeWidth="4" strokeLinecap="round">
              <line x1="72" y1="0" x2="72" y2="20" />
              <line x1="72" y1="124" x2="72" y2="144" />
              <line x1="0" y1="72" x2="20" y2="72" />
              <line x1="124" y1="72" x2="144" y2="72" />
              <line x1="20" y1="20" x2="34" y2="34" />
              <line x1="110" y1="110" x2="124" y2="124" />
              <line x1="20" y1="124" x2="34" y2="110" />
              <line x1="110" y1="34" x2="124" y2="20" />
            </g>
          </g>
          <g transform="translate(238,76)">
            <rect x="0" y="0" width="280" height="150" rx="10" fill="#1c3f2b" stroke="#9ec79f" strokeWidth="2" />
            <line x1="0" y1="38" x2="280" y2="38" stroke="#9ec79f" strokeWidth="2" />
            <line x1="0" y1="76" x2="280" y2="76" stroke="#9ec79f" strokeWidth="2" />
            <line x1="0" y1="114" x2="280" y2="114" stroke="#9ec79f" strokeWidth="2" />
            <line x1="70" y1="0" x2="70" y2="150" stroke="#9ec79f" strokeWidth="2" />
            <line x1="140" y1="0" x2="140" y2="150" stroke="#9ec79f" strokeWidth="2" />
            <line x1="210" y1="0" x2="210" y2="150" stroke="#9ec79f" strokeWidth="2" />
          </g>
          <g transform="translate(600,78)">
            <rect x="0" y="0" width="162" height="72" rx="10" fill="#143b2f" stroke="#88b8a0" strokeWidth="2" />
            <rect x="0" y="88" width="162" height="72" rx="10" fill="#143b2f" stroke="#88b8a0" strokeWidth="2" />
            <text x="18" y="44" fill="#d6f4df" fontSize="16" fontWeight="700">Inverter</text>
            <text x="18" y="132" fill="#d6f4df" fontSize="16" fontWeight="700">Battery</text>
          </g>
          <g transform="translate(820,88)">
            <rect x="0" y="0" width="220" height="120" rx="12" fill="#163b32" stroke="#9ec79f" strokeWidth="2" />
            <text x="24" y="48" fill="#dff8e8" fontSize="18" fontWeight="700">Load Center</text>
            <text x="24" y="80" fill="#c4e8d4" fontSize="14">120/240V Output</text>
          </g>
          <g stroke="#dff8e8" strokeWidth="4" fill="none" strokeLinecap="round">
            <path d="M520 150 C560 150, 570 130, 600 116" />
            <path d="M681 150 L681 166" />
            <path d="M764 116 C790 116, 802 122, 820 130" />
          </g>
        </svg>
        <div className="auth-row">
          {session?.user ? (
            <>
              <p style={{ margin: 0 }}>Logged in as {session.user.email}</p>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit">Sign out</button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/" });
              }}
            >
              <button type="submit">Sign in with Google</button>
            </form>
          )}
        </div>
      </section>
      <CalculatorForm userEmail={userEmail} />

      {userEmail ? (
        <section className="panel stack">
          <h2 style={{ margin: 0 }}>My Saved Builds</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Saved builds auto-expire after {BUILD_RETENTION_DAYS} days.
          </p>
          {savedBuilds.length === 0 ? (
            <p style={{ margin: 0, color: "var(--muted)" }}>
              No saved builds yet. Generate a design, then click Save To My Account.
            </p>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {savedBuilds.map((build) => (
                <article className="metric" key={build.id}>
                  <h3>{build.name}</h3>
                  <p style={{ margin: "6px 0 0", fontSize: "0.95rem", fontWeight: 500 }}>
                    Saved: {new Date(build.createdAt).toLocaleString()}
                  </p>
                  <SavedBuildActions projectId={build.id} shareId={build.shareId} isPublic={build.isPublic} />
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}