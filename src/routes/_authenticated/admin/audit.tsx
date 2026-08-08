import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({
    meta: [
      { title: "Jejak Audit — NTB-PIS" },
      {
        name: "description",
        content: "Riwayat aktivitas pengguna dan perubahan data pada sistem NTB-PIS.",
      },
      { property: "og:title", content: "Jejak Audit — NTB-PIS" },
      {
        property: "og:description",
        content: "Catatan audit aktivitas administratif NTB-PIS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const query = useQuery({
    queryKey: ["audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("id, aksi, entitas, entitas_id, detail, created_at, actor_id")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Administrasi</p>
        <h1 className="display-md mt-2">Jejak Audit</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Menampilkan 200 catatan terakhir. Setiap perubahan akun dan data agregat dicatat untuk
          keperluan akuntabilitas.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catatan aktivitas</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {query.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : query.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {(query.error as Error).message}
            </p>
          ) : (query.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada catatan aktivitas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Entitas</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(query.data ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(row.created_at).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-medium">{row.aksi}</TableCell>
                    <TableCell>{row.entitas}</TableCell>
                    <TableCell className="max-w-md truncate text-xs text-muted-foreground">
                      {row.detail ? JSON.stringify(row.detail) : "—"}
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
