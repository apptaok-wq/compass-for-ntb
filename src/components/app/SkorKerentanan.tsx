import { useMemo, useState } from "react";
import { useWilayahAgregat } from "@/components/app/WilayahOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const pf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

/** Indicator weights used to build the composite vulnerability score. */
type Weights = {
  ekstrem: number;
  desil1: number;
  kepadatanKk: number;
};

const DEFAULT_WEIGHTS: Weights = { ekstrem: 50, desil1: 35, kepadatanKk: 15 };

const INDICATOR_META: Array<{ key: keyof Weights; label: string; help: string }> = [
  {
    key: "ekstrem",
    label: "Rasio KK miskin ekstrem",
    help: "Proporsi kepala keluarga miskin ekstrem terhadap total KK.",
  },
  {
    key: "desil1",
    label: "Rasio KK desil 1",
    help: "Proporsi kepala keluarga pada desil kesejahteraan terendah.",
  },
  {
    key: "kepadatanKk",
    label: "Beban jumlah KK",
    help: "Skala absolut jumlah KK sebagai proksi beban intervensi.",
  },
];

function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!Number.isFinite(min) || max === min) return values.map(() => 0);
  return values.map((v) => ((v - min) / (max - min)) * 100);
}

function tier(score: number): { label: string; className: string } {
  if (score >= 70) return { label: "Sangat tinggi", className: "bg-destructive/15 text-destructive" };
  if (score >= 50) return { label: "Tinggi", className: "bg-warning/25 text-foreground" };
  if (score >= 30) return { label: "Sedang", className: "bg-accent/15 text-accent-strong" };
  return { label: "Rendah", className: "bg-muted text-muted-foreground" };
}

export function SkorKerentanan() {
  const { data, isLoading, isError, error } = useWilayahAgregat();
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);

  const totalWeight = weights.ekstrem + weights.desil1 + weights.kepadatanKk;

  const scored = useMemo(() => {
    const rows = (data ?? []).filter((r) => r.jenis !== "provinsi" && r.kkTotal > 0);
    if (rows.length === 0) return [];

    const ekstremRatio = normalize(rows.map((r) => (r.kkEkstrem / r.kkTotal) * 100));
    const desilRatio = normalize(rows.map((r) => (r.desil1 / r.kkTotal) * 100));
    const bebanKk = normalize(rows.map((r) => r.kkTotal));
    const denom = totalWeight || 1;

    return rows
      .map((r, i) => ({
        ...r,
        ekstremPct: (r.kkEkstrem / r.kkTotal) * 100,
        desilPct: (r.desil1 / r.kkTotal) * 100,
        score:
          (ekstremRatio[i]! * weights.ekstrem +
            desilRatio[i]! * weights.desil1 +
            bebanKk[i]! * weights.kepadatanKk) /
          denom,
      }))
      .sort((a, b) => b.score - a.score);
  }, [data, weights, totalWeight]);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Gagal memuat data: {(error as Error).message}
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Bobot indikator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-7">
          {INDICATOR_META.map((meta) => (
            <div key={meta.key} className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <label className="text-sm font-medium">{meta.label}</label>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {weights[meta.key]}
                </span>
              </div>
              <Slider
                value={[weights[meta.key]]}
                min={0}
                max={100}
                step={5}
                aria-label={`Bobot ${meta.label}`}
                onValueChange={([v]) => setWeights({ ...weights, [meta.key]: v ?? 0 })}
              />
              <p className="text-xs text-muted-foreground">{meta.help}</p>
            </div>
          ))}
          <p className="border-t border-border pt-4 text-xs text-muted-foreground">
            Total bobot {totalWeight}. Skor dinormalisasi 0–100 relatif antar wilayah, sehingga
            perbandingan hanya berlaku di dalam Provinsi NTB.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peringkat kerentanan wilayah</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {scored.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada data agregat kesejahteraan sehingga skor kerentanan belum dapat dihitung.
              Unggah data melalui menu Impor Data Agregat.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Wilayah</TableHead>
                  <TableHead className="text-right">Miskin ekstrem</TableHead>
                  <TableHead className="text-right">Desil 1</TableHead>
                  <TableHead className="text-right">Skor</TableHead>
                  <TableHead>Tingkat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scored.map((r, i) => {
                  const t = tier(r.score);
                  return (
                    <TableRow key={r.wilayahId}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{r.nama}</TableCell>
                      <TableCell className="text-right">{pf.format(r.ekstremPct)}%</TableCell>
                      <TableCell className="text-right">{pf.format(r.desilPct)}%</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {pf.format(r.score)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={t.className}>
                          {t.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
