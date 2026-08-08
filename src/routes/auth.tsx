import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NtbMark } from "@/components/NtbMark";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Masuk — NTB-PIS" },
      {
        name: "description",
        content:
          "Halaman masuk pengguna internal NTB Poverty Intelligence System untuk pemerintah daerah dan mitra resmi.",
      },
      { property: "og:title", content: "Masuk — NTB-PIS" },
      {
        property: "og:description",
        content: "Akses terbatas bagi pengguna internal NTB Poverty Intelligence System.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/dashboard", replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Surel atau kata sandi tidak sesuai."
          : signInError.message,
      );
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice("Tautan pengaturan ulang kata sandi telah dikirim ke surel Anda.");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <NtbMark className="h-9 w-9" />
          <span className="font-display text-lg font-semibold">NTB-PIS</span>
        </Link>
        <div className="max-w-md">
          <p className="eyebrow text-accent">Sistem Pendukung Keputusan</p>
          <h1 className="display-lg mt-4">
            Intelijen data untuk percepatan penghapusan kemiskinan ekstrem di Nusa Tenggara Barat
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-primary-foreground/80">
            Akses terbatas bagi pengguna internal. Seluruh data yang ditampilkan bersifat agregat
            pada tingkat wilayah dan tidak memuat data individu maupun keluarga.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          Pelengkap DTSEN dan SEPAKAT, bukan penggantinya.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <NtbMark className="h-8 w-8" />
            <span className="font-display text-base font-semibold">NTB-PIS</span>
          </Link>

          <h2 className="display-md">{mode === "login" ? "Masuk" : "Atur ulang kata sandi"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Gunakan surel dinas yang telah terdaftar oleh administrator."
              : "Masukkan surel terdaftar untuk menerima tautan pengaturan ulang."}
          </p>

          <form
            onSubmit={mode === "login" ? handleLogin : handleReset}
            className="mt-8 space-y-5"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email">Surel</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@ntbprov.go.id"
              />
            </div>

            {mode === "login" && (
              <div className="space-y-2">
                <Label htmlFor="password">Kata sandi</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="text-sm text-accent-strong">
                {notice}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Memproses…"
                : mode === "login"
                  ? "Masuk"
                  : "Kirim tautan pengaturan ulang"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "reset" : "login");
              setError(null);
              setNotice(null);
            }}
            className="mt-6 text-sm text-accent-strong underline-offset-4 hover:underline"
          >
            {mode === "login" ? "Lupa kata sandi?" : "Kembali ke halaman masuk"}
          </button>
        </div>
      </div>
    </main>
  );
}
