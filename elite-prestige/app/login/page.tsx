import { signIn } from "@/auth";
import { AuthError } from "next-auth";

async function login(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/admin"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Identifiant ou mot de passe incorrect.");
    }
    throw error;
  }
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        action={login}
        className="w-full max-w-sm border border-white/10 bg-card p-10 flex flex-col gap-5"
      >
        <div className="text-center mb-2">
          <p className="font-jost text-xs tracking-[0.35em] uppercase text-gold">
            Elite Prestige
          </p>
          <p className="font-jost text-[0.65rem] tracking-[0.2em] uppercase text-gray1 mt-2">
            Accès collaborateur
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-jost text-[0.6rem] tracking-[0.18em] uppercase text-gray2">
            Identifiant
          </label>
          <input
            name="username"
            required
            autoFocus
            className="bg-bg border border-white/10 px-4 py-3 text-sm text-cream focus:border-gold transition"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-jost text-[0.6rem] tracking-[0.18em] uppercase text-gray2">
            Mot de passe
          </label>
          <input
            name="password"
            type="password"
            required
            className="bg-bg border border-white/10 px-4 py-3 text-sm text-cream focus:border-gold transition"
          />
        </div>

        <button
          type="submit"
          className="mt-2 bg-gold text-bg py-3 font-jost text-[0.65rem] tracking-[0.2em] uppercase hover:bg-goldlight transition"
        >
          Se connecter
        </button>
      </form>
    </main>
  );
}
