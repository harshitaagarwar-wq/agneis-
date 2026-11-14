import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-[#E8E8E8]">
      <div className="w-full max-w-sm rounded-2xl border border-[#E8E8E8]/18 bg-[#141517] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.85)]">
        <h1 className="aegis-wordmark font-display text-3xl font-black tracking-tight">
          AEGIS
        </h1>
        <p className="mt-2 text-sm text-[#8A8D91]">
          Sign in with Google or GitHub to sync your workspace.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <Button type="submit" size="lg" className="w-full">
              Continue with Google
            </Button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="gunmetal" size="lg" className="w-full">
              Continue with GitHub
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
