import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { bootstrapSuperAdmin, superAdminExists } from "@/lib/setup.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Pendaftaran Awal Super Admin — NTB-PIS" },
      {
        name: "description",
        content:
          "Pendaftaran akun Super Admin pertama NTB Poverty Intelligence System. Ditutup otomatis setelah akun pertama dibuat.",
      },
      { property: "og:title", content: "Pendaftaran Awal Super Admin — NTB-PIS" },
      {
        property: "og:description",
        content: "Langkah inisialisasi sekali pakai untuk administrator sistem NTB-PIS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/setup" }],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const checkExists = useServerFn(superAdminExists);
  const bootstrap = useServerFn(bootstrapSuperAdmin);

  const existsQuery = useQuery({
    queryKey: ["super-admin-exists"],
    queryFn: () => checkExists(),
  });

  const [form, setForm] = useState({
    email: "",
    password: "",
    namaLengkap: "",
    jabatan: "",
    instansi: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      bootstrap({
        data: {
          email: form.email,
          password: form.password,
          namaLengkap: form.namaLengkap,
          jabatan: form.jabatan || undefined,
          instansi: form.instansi || undefined,
        },
      }),
    onSuccess: () => navigate({ to: "/auth" }),
  });

  if (existsQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-muted-foreground">Memeriksa status inisialisasi…</p>
      </main>
    );
  }

  if (existsQuery.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p role="alert" className="text-sm text-destructive">
            Gagal memeriksa status inisialisasi.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => existsQuery.refetch()}>
            Coba lagi
          </Button>
        </div>
      </main>
    );
  }

  if (existsQuery.data?.exists) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="display-md">Inisialisasi telah selesai</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Akun Super Admin sudah tersedia. Halaman pendaftaran awal ini telah ditutup. Silakan
            hubungi administrator untuk memperoleh akun.
          </p>
          <Button asChild className="mt-6">
            <Link to="/auth">Ke halaman masuk</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="eyebrow">Inisialisasi sistem</p>
        <h1 className="display-md mt-3">Buat akun Super Admin</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Formulir ini hanya dapat digunakan satu kali dan akan tertutup otomatis setelah akun
          Super Admin pertama dibuat.
        </p>

        <form
          className="mt-8 space-y-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="nama">Nama lengkap</Label>
            <Input
              id="nama"
              required
              value={form.namaLengkap}
              onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Surel dinas</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata sandi (minimal 10 karakter)</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={10}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input
                id="jabatan"
                value={form.jabatan}
                onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instansi">Instansi</Label>
              <Input
                id="instansi"
                value={form.instansi}
                onChange={(e) => setForm({ ...form, instansi: e.target.value })}
              />
            </div>
          </div>

          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {(mutation.error as Error).message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Membuat akun…" : "Buat akun Super Admin"}
          </Button>
        </form>
      </div>
    </main>
  );
}
