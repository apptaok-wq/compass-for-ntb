import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createUserAccount, listUserAccounts, updateUserAccount } from "@/lib/admin.functions";
import { ALL_ROLES, ROLE_LABELS, type AppRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/pengguna")({
  head: () => ({
    meta: [
      { title: "Manajemen Pengguna — NTB-PIS" },
      {
        name: "description",
        content: "Kelola akun, peran, dan cakupan wilayah pengguna internal NTB-PIS.",
      },
      { property: "og:title", content: "Manajemen Pengguna — NTB-PIS" },
      {
        property: "og:description",
        content: "Panel Super Admin untuk pengelolaan akun pengguna NTB-PIS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PenggunaPage,
});

const NO_SCOPE = "__nasional__";

function PenggunaPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listUserAccounts);
  const createFn = useServerFn(createUserAccount);
  const updateFn = useServerFn(updateUserAccount);

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: () => listFn() });

  const wilayahQuery = useQuery({
    queryKey: ["wilayah-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wilayah")
        .select("id, nama, jenis")
        .order("kode_bps");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    email: "",
    password: "",
    namaLengkap: "",
    jabatan: "",
    instansi: "",
    role: "bappeda_provinsi" as AppRole,
    wilayahScopeId: NO_SCOPE,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          email: form.email,
          password: form.password,
          namaLengkap: form.namaLengkap,
          jabatan: form.jabatan || null,
          instansi: form.instansi || null,
          role: form.role,
          wilayahScopeId: form.wilayahScopeId === NO_SCOPE ? null : form.wilayahScopeId,
        },
      }),
    onSuccess: () => {
      setForm({ ...form, email: "", password: "", namaLengkap: "", jabatan: "", instansi: "" });
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (user: {
      id: string;
      namaLengkap: string;
      jabatan: string | null;
      instansi: string | null;
      role: AppRole | null;
      wilayahScopeId: string | null;
      isActive: boolean;
    }) =>
      updateFn({
        data: {
          userId: user.id,
          namaLengkap: user.namaLengkap,
          jabatan: user.jabatan,
          instansi: user.instansi,
          role: user.role ?? "bappeda_provinsi",
          wilayahScopeId: user.wilayahScopeId,
          isActive: !user.isActive,
        },
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow">Administrasi</p>
        <h1 className="display-md mt-2">Manajemen Pengguna</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Akun dibuat oleh Super Admin. Pendaftaran mandiri dinonaktifkan untuk menjaga kendali
          akses terhadap data pemerintahan.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah akun</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5 sm:grid-cols-2"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
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
              <Label htmlFor="email">Surel</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata sandi awal</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={10}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
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
            <div className="space-y-2">
              <Label>Peran</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as AppRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Cakupan wilayah</Label>
              <Select
                value={form.wilayahScopeId}
                onValueChange={(v) => setForm({ ...form, wilayahScopeId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SCOPE}>Seluruh provinsi</SelectItem>
                  {(wilayahQuery.data ?? []).map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {createMutation.isError && (
              <p role="alert" className="text-sm text-destructive sm:col-span-2">
                {(createMutation.error as Error).message}
              </p>
            )}

            <div className="sm:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Menyimpan…" : "Buat akun"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar akun</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {usersQuery.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : usersQuery.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {(usersQuery.error as Error).message}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Surel</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(usersQuery.data ?? []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.namaLengkap}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.role ? ROLE_LABELS[u.role as AppRole] : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? "secondary" : "outline"}>
                        {u.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={toggleMutation.isPending}
                        onClick={() =>
                          toggleMutation.mutate({
                            id: u.id,
                            namaLengkap: u.namaLengkap,
                            jabatan: u.jabatan,
                            instansi: u.instansi,
                            role: (u.role as AppRole | null) ?? null,
                            wilayahScopeId: u.wilayahScopeId,
                            isActive: u.isActive,
                          })
                        }
                      >
                        {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
