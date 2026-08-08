import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Atur Ulang Kata Sandi — NTB-PIS" },
      {
        name: "description",
        content: "Formulir pengaturan ulang kata sandi akun NTB Poverty Intelligence System.",
      },
      { property: "og:title", content: "Atur Ulang Kata Sandi — NTB-PIS" },
      {
        property: "og:description",
        content: "Tetapkan kata sandi baru untuk akun internal NTB-PIS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/reset-password" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 10) {
      setError("Kata sandi minimal 10 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/dashboard", replace: true }), 1200);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="display-md">Kata sandi baru</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {ready
            ? "Tetapkan kata sandi baru untuk akun Anda."
            : "Membuka tautan pemulihan… Pastikan Anda membuka tautan dari surel terbaru."}
        </p>

        {done ? (
          <p role="status" className="mt-8 text-sm text-accent-strong">
            Kata sandi berhasil diperbarui. Mengalihkan ke dasbor…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="password">Kata sandi baru</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Ulangi kata sandi</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !ready}>
              {loading ? "Menyimpan…" : "Simpan kata sandi"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
