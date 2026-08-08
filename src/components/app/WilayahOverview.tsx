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

const nf = new Intl.NumberFormat("id-ID");
const pf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

type Row = {
  wilayahId: string;
  nama: string;
  jenis: string;
  periode: string | null;
  penduduk: number;
  kkTotal: number;
  kkEkstrem: number;
  desil1: number;
};

export function useWilayahAgregat() {
  return useQuery<Row[]>({
    queryKey: ["wilayah-agregat"],
    queryFn: async () => {
      const { data: wilayah, error: wilayahError } = await supabase
        .from("wilayah")
        .select("id, nama, jenis, kode_bps")
        .order("kode_bps");

      if (wilayahError) throw wilayahError;

      const { data: agregat, error: agregatError } = await supabase
        .from("kesejahteraan_agregat")
        .select(
          "wilayah_id, periode, jumlah_penduduk, jumlah_kk_total, jumlah_kk_miskin_ekstrem, jumlah_kk_desil_1",
        )
        .order("periode", { ascending: false });
      if (agregatError) throw agregatError;

      const latest = new Map<string, (typeof agregat)[number]>();
      for (const row of agregat ?? []) {
        if (!latest.has(row.wilayah_id)) latest.set(row.wilayah_id, row);
      }

      return (wilayah ?? []).map((w) => {
        const a = latest.get(w.id);
        return {
          wilayahId: w.id,
          nama: w.nama,
          jenis: w.jenis as string,
          periode: a?.periode ?? null,
          penduduk: a?.jumlah_penduduk ?? 0,
          kkTotal: a?.jumlah_kk_total ?? 0,
          kkEkstrem: a?.jumlah_kk_miskin_ekstrem ?? 0,
          desil1: a?.jumlah_kk_desil_1 ?? 0,
        };
      });
    },
  });
}

export function WilayahOverview() {
  const { data, isLoading, isError, error } = useWilayahAgregat();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Gagal memuat data wilayah: {(error as Error).message}
      </p>
    );
  }

  const rows = data ?? [];
  const kabkota = rows.filter((r) => r.jenis !== "provinsi");
  const totalPenduduk = kabkota.reduce((s, r) => s + r.penduduk, 0);
  const totalKk = kabkota.reduce((s, r) => s + r.kkTotal, 0);
  const totalEkstrem = kabkota.reduce((s, r) => s + r.kkEkstrem, 0);
  const hasData = totalKk > 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Wilayah terdaftar" value={`${kabkota.length} kab/kota`} />
        <StatCard label="Jumlah penduduk" value={hasData ? nf.format(totalPenduduk) : "—"} />
        <StatCard label="Kepala keluarga" value={hasData ? nf.format(totalKk) : "—"} />
        <StatCard
          label="Rasio KK miskin ekstrem"
          value={hasData ? `${pf.format((totalEkstrem / totalKk) * 100)}%` : "—"}
        />
      </div>

      {!hasData && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Data agregat belum tersedia</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Wilayah administratif sudah dimuat, namun belum ada baris data kesejahteraan agregat.
            Super Admin dapat mengunggahnya melalui menu Impor Data Agregat.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rincian per kabupaten/kota</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wilayah</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-right">Penduduk</TableHead>
                <TableHead className="text-right">KK</TableHead>
                <TableHead className="text-right">KK miskin ekstrem</TableHead>
                <TableHead className="text-right">Desil 1</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kabkota.map((r) => (
                <TableRow key={r.wilayahId}>
                  <TableCell className="font-medium">{r.nama}</TableCell>
                  <TableCell className="text-muted-foreground">{r.periode ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {r.penduduk ? nf.format(r.penduduk) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.kkTotal ? nf.format(r.kkTotal) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.kkEkstrem ? nf.format(r.kkEkstrem) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.desil1 ? nf.format(r.desil1) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="font-display mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
