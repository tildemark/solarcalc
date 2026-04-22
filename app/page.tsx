import { auth, signIn, signOut } from "@/auth";
import { CalculatorForm } from "@/components/calculator-form";

export default async function Home() {
  const session = await auth();

  return (
    <main className="container stack">
      <section className="hero">
        <h1>SolarCalc Engineering Console</h1>
        <p>
          Generate inverter sizing, battery bank configuration, panel stringing, BOM,
          and diagram payloads from a single set of system requirements.
        </p>
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
      <CalculatorForm userEmail={session?.user?.email ?? null} />
    </main>
  );
}