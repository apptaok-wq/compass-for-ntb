import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/performa")({
  head: () => ({
    meta: [
      { title: "Performa Aplikasi — NTB-PIS" },
      {
        name: "description",
        content: "Metrik pengalaman pengguna nyata (Core Web Vitals) aplikasi NTB-PIS.",
      },
      { property: "og:title", content: "Performa Aplikasi — NTB-PIS" },
      {
        property: "og:description",
        content: "Pemantauan Core Web Vitals aplikasi NTB-PIS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PerformaPage,
});

const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

function PerformaPage() {
  const query = useQuery({
    queryKey: ["web-vitals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("web_vitals")
        .select("metric_name, metric_value, rating, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = query.data ?? [];
  const byMetric = new Map<string, number[]>();
  for (const row of rows) {
    const list = byMetric.get(row.metric_name) ?? [];
    list.push(Number(row.metric_value));
    byMetric.set(row.metric_name, list);
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Administrasi</p>
        <h1 className="display-md mt-2">Performa Aplikasi</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Ringkasan persentil ke-75 metrik pengalaman pengguna dari 1.000 pengukuran terakhir.
        </p>
      </header>

      {query.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : query.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {(query.error as Error).message}
        </p>
      ) : byMetric.size === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Belum ada pengukuran</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Metrik akan muncul setelah pengguna mengakses aplikasi dan pengukuran terkirim.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...byMetric.entries()].map(([metrik, values]) => {
            const sorted = [...values].sort((a, b) => a - b);
            const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;
            return (
              <Card key={metrik}>
                <CardContent className="pt-6">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">{metrik}</p>
                  <p className="font-display mt-2 text-2xl font-semibold">{nf.format(p75)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    p75 dari {values.length} pengukuran
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
