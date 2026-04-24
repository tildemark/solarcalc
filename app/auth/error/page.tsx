import Link from "next/link";

type AuthErrorPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const knownErrors: Record<string, string> = {
  Configuration:
    "Auth provider settings are incomplete or invalid. Check Google client ID/secret and app callback URL settings.",
  AccessDenied: "The sign-in request was denied by the identity provider.",
  Verification: "Verification link/session could not be validated.",
  OAuthSignin: "Could not initiate OAuth flow with Google.",
  OAuthCallback: "Google callback failed. Verify redirect URI and app domain settings.",
  OAuthCreateAccount: "Account record could not be created in the database.",
  OAuthAccountNotLinked: "This email is already linked to a different sign-in method.",
  SessionRequired: "You must sign in to continue.",
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const errorCode = params.error ?? "Configuration";
  const errorMessage = knownErrors[errorCode] ?? "Authentication failed due to a server configuration issue.";

  return (
    <main className="container stack">
      <section className="hero">
        <h1>Sign-In Configuration Issue</h1>
        <p>{errorMessage}</p>
      </section>

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>How To Fix</h2>
        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
          <li>Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your local env file.</li>
          <li>Set AUTH_SECRET (or NEXTAUTH_SECRET) to a secure random string.</li>
          <li>
            In Google Cloud Console, add this exact redirect URI:
            <br />
            <strong>http://localhost:3000/api/auth/callback/google</strong>
          </li>
          <li>Ensure your database is reachable and Prisma auth tables are migrated.</li>
          <li>Restart the Next.js dev server after changing env values.</li>
        </ol>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Error code: <strong>{errorCode}</strong>
        </p>
        <Link href="/" className="button-ghost">
          Back To Home
        </Link>
      </section>
    </main>
  );
}
