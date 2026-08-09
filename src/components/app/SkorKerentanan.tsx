import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hitungDanSimpanSkor } from "@/lib/skor.functions";
import {
  BOBOT_DEFAULT,
  META_INDIKATOR,
  hitungSkor,
  isDataUji,
  normalisasiBobot,
  tingkatSkor,
  type BobotSkor,
  type HasilSkor,
} from "@/lib/skor";
import { WilayahSelect, labelWilayah, useWilayahList } from "@/components/app/WilayahSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

type SkorRow = HasilSkor & {
  nama: string;
  jenis: string;
  dihitungPada: string | null;
  tersimpan: boolean;
};

function useSkorData(parentId: string | null, periode: string | null) {
  return useQuery({
    queryKey: ["skor-kerentanan", parentId, periode],
    enabled: Boolean(parentId && periode),
    queryFn: async () => {
      const { data: anak, error: anakError } = await supabase
        .from("wilayah")
        .select("id, nama, jenis, kode_bps")
        .eq("parent_id", parentId!)
        .order("kode_bps");
      if (anakError) throw anakError;

      const ids = (anak ?? []).map((w) => w.id);
      if (ids.length === 0) return { rows: [] as SkorRow[], agregatKosong: true };

      const [{ data: skor, error: skorError }, { data: agregat, error: agregatError }] =
        await Promise.all([
          supabase
            .from("skor_kerentanan")
            .select("wilayah_id, periode, skor, komponen, metode_versi, dihitung_pada")
            .in("wilayah_id", ids)
            .eq("periode", periode!),
          supabase
            .from("kesejahteraan_agregat")
            .select(
              "wilayah_id, periode, sumber_data, jumlah_kk_total, jumlah_kk_miskin_ekstrem, jumlah_kk_desil_1, jumlah_kk_desil_2, jumlah_kk_desil_3",
            )
            .in("wilayah_id", ids)
            .eq("periode", periode!),
        ]);
      if (skorError) throw skorError;
      if (agregatError) throw agregatError;

      const agregatByWilayah = new Map((agregat ?? []).map((a) => [a.wilayah_id, a]));
      const skorByWilayah = new Map((skor ?? []).map((s) => [s.wilayah_id, s]));

      const rows: SkorRow[] = [];
      for (const w of anak ?? []) {
        const a = agregatByWilayah.get(w.id);
        if (!a) continue;
        const dihitung = hitungSkor({
          wilayahId: w.id,
          periode: a.periode,
          sumberData: a.sumber_data,
          jumlahKkTotal: a.jumlah_kk_total,
          jumlahKkMiskinEkstrem: a.jumlah_kk_miskin_ekstrem,
          jumlahKkDesil1: a.jumlah_kk_desil_1,
          jumlahKkDesil2: a.jumlah_kk_desil_2,
          jumlahKkDesil3: a.jumlah_kk_desil_3,
        });
        const tersimpan = skorByWilayah.get(w.id);
        const komponenTersimpan = (
          tersimpan?.komponen as { komponen?: HasilSkor["komponen"] } | null
        )?.komponen;

        rows.push({
          ...dihitung,
          ...(tersimpan
            ? {
                skor: tersimpan.skor,
                komponen: komponenTersimpan ?? dihitung.komponen,
                metodeVersi: tersimpan.metode_versi,
              }
            : {}),
          nama: w.nama,
          jenis: w.jenis as string,
          dihitungPada: tersimpan?.dihitung_pada ?? null,
          tersimpan: Boolean(tersimpan),
        });
      }

      rows.sort((a, b) => b.skor - a.skor);
      return { rows, agregatKosong: rows.length === 0 };
    },
  });
}

function usePeriodeList() {
  return useQuery<string[]>({
    queryKey: ["periode-agregat"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kesejahteraan_agregat")
        .select("periode")
        .order("periode", { ascending: false });
      if (error) throw error;
      return Array.from(new Set((data ?? []).map((r) => r.periode)));
    },
  });
}

export function SkorKerentanan() {
  const { data: currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.role === "super_admin";

  const wilayahQuery = useWilayahList();
  const periodeQuery = usePeriodeList();

  const [parentId, setParentId] = useState<string | null>(null);
  const [periode, setPeriode] = useState<string | null>(null);
  const [simulasi, setSimulasi] = useState(false);
  const [bobot, setBobot] = useState<BobotSkor>(BOBOT_DEFAULT);
  const [terpilih, setTerpilih] = useState<string | null>(null);

  const indukOptions = useMemo(() => {
    const all = wilayahQuery.data ?? [];
    const parentIds = new Set(all.map((w) => w.parentId).filter(Boolean) as string[]);
    return all.filter((w) => parentIds.has(w.id));
  }, [wilayahQuery.data]);

  useEffect(() => {
    if (!parentId && indukOptions.length > 0) {
      const kecamatan = indukOptions.find((w) => w.jenis === "kecamatan");
      setParentId((kecamatan ?? indukOptions[indukOptions.length - 1]!).id);
    }
  }, [indukOptions, parentId]);

  useEffect(() => {
    if (!periode && periodeQuery.data && periodeQuery.data.length > 0) {
      setPeriode(periodeQuery.data[0]!);
    }
  }, [periodeQuery.data, periode]);

  const skorQuery = useSkorData(parentId, periode);
  const queryClient = useQueryClient();
  const hitungFn = useServerFn(hitungDanSimpanSkor);

  const hitungMutation = useMutation({
    mutationFn: async () =>
      hitungFn({ data: { periode: periode!, ...(simulasi ? { bobot } : {}) } }),
    onSuccess: (res) => {
      toast.success(`Skor tersimpan untuk ${res.jumlahWilayah} wilayah (${res.metodeVersi}).`);
      void queryClient.invalidateQueries({ queryKey: ["skor-kerentanan"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bobotNormal = normalisasiBobot(bobot);

  const baris = useMemo(() => {
    const rows = skorQuery.data?.rows ?? [];
    if (!simulasi) return rows;
    return rows
      .map((r) => {
        const ulang = hitungSkor(
          {
            wilayahId: r.wilayahId,
            periode: r.periode,
            sumberData: r.sumberData,
            jumlahKkTotal: 0,
            jumlahKkMiskinEkstrem: 0,
            jumlahKkDesil1: 0,
            jumlahKkDesil2: 0,
            jumlahKkDesil3: 0,
          },
          bobot,
        );
        // Nilai indikator tidak berubah; hanya bobotnya yang disimulasikan.
        const komponen = r.komponen.map((k) => ({
          ...k,
          bobot: bobotNormal[k.key],
          kontribusi: k.nilai * bobotNormal[k.key],
        }));
        return {
          ...r,
          metodeVersi: ulang.metodeVersi,
          komponen,
          skor: komponen.reduce((s, k) => s + k.kontribusi, 0),
        };
      })
      .sort((a, b) => b.skor - a.skor);
  }, [skorQuery.data, simulasi, bobot, bobotNormal]);

  const detail = baris.find((r) => r.wilayahId === terpilih) ?? null;
  const adaDataUji = baris.some((r) => r.dataUji);
  const belumTersimpan = baris.some((r) => !r.tersimpan);

  if (wilayahQuery.isLoading || periodeQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (wilayahQuery.isError || periodeQuery.isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Gagal memuat daftar wilayah/periode:{" "}
        {((wilayahQuery.error ?? periodeQuery.error) as Error).message}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <WilayahSelect
            options={indukOptions}
            value={parentId}
            onChange={(id) => {
              setParentId(id);
              setTerpilih(null);
            }}
            label="Wilayah induk"
          />
          <label className="block space-y-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Periode
            </span>
            <Select
              {...(periode ? { value: periode } : {})}
              onValueChange={(v) => {
                setPeriode(v);
                setTerpilih(null);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {(periodeQuery.data ?? []).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="flex items-center gap-3 pb-2">
            <Switch
              id="mode-simulasi"
              checked={simulasi}
              onCheckedChange={(v) => setSimulasi(v)}
            />
            <label htmlFor="mode-simulasi" className="text-sm">
              Mode simulasi bobot
            </label>
          </div>
          {isSuperAdmin && (
            <Button
              type="button"
              variant="secondary"
              disabled={!periode || hitungMutation.isPending}
              onClick={() => hitungMutation.mutate()}
              className="mb-1"
            >
              {hitungMutation.isPending ? "Menghitung…" : "Hitung & simpan skor"}
            </Button>
          )}
        </CardContent>
      </Card>

      {adaDataUji && (
        <p className="rounded-md border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Sebagian atau seluruh baris berasal dari <strong>data uji</strong>, bukan data resmi.
          Angka pada halaman ini tidak boleh dipakai untuk penetapan penerima manfaat.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">Skor kerentanan per wilayah</CardTitle>
            {simulasi && <Badge variant="secondary">Simulasi — belum tersimpan</Badge>}
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {skorQuery.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : skorQuery.isError ? (
              <p role="alert" className="text-sm text-destructive">
                Gagal memuat skor: {(skorQuery.error as Error).message}
              </p>
            ) : baris.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada data agregat kesejahteraan untuk wilayah dan periode yang dipilih.
                Super Admin dapat mengunggahnya melalui menu Impor Data Agregat.
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
                  {baris.map((r, i) => {
                    const t = tingkatSkor(r.skor);
                    const ekstrem = r.komponen.find((k) => k.key === "ekstrem")?.nilai ?? 0;
                    const desil1 = r.komponen.find((k) => k.key === "desil1")?.nilai ?? 0;
                    return (
                      <TableRow
                        key={r.wilayahId}
                        tabIndex={0}
                        role="button"
                        aria-label={`Lihat rincian skor ${r.nama}`}
                        onClick={() => setTerpilih(r.wilayahId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setTerpilih(r.wilayahId);
                          }
                        }}
                        className={`cursor-pointer ${
                          terpilih === r.wilayahId ? "bg-muted/70" : ""
                        }`}
                      >
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{r.nama}</TableCell>
                        <TableCell className="text-right">{nf.format(ekstrem)}%</TableCell>
                        <TableCell className="text-right">{nf.format(desil1)}%</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {nf2.format(r.skor)}
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
            {belumTersimpan && baris.length > 0 && !simulasi && (
              <p className="mt-4 text-xs text-muted-foreground">
                Sebagian skor belum tersimpan di basis data dan ditampilkan dari perhitungan
                langsung dengan bobot default.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {detail ? `Rincian skor ${detail.nama}` : "Rincian komponen"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!detail ? (
                <p className="text-sm text-muted-foreground">
                  Pilih satu baris pada tabel untuk melihat kontribusi setiap komponen terhadap
                  skor total.
                </p>
              ) : (
                <>
                  {detail.komponen.map((k) => (
                    <div key={k.key} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-medium">{k.label}</span>
                        <span className="tabular-nums">{nf2.format(k.kontribusi)}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent/60"
                          style={{ width: `${Math.min(100, k.kontribusi * 2)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {nf.format(k.nilai)}% × bobot {nf.format(k.bobot * 100)}% ={" "}
                        {nf2.format(k.kontribusi)}. {k.penjelasan}
                      </p>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between border-t border-border pt-3 text-sm font-semibold">
                    <span>Skor total</span>
                    <span className="tabular-nums">{nf2.format(detail.skor)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sumber data: {detail.sumberData}. Metode {detail.metodeVersi}.{" "}
                    {detail.dihitungPada && !simulasi
                      ? `Dihitung ${new Date(detail.dihitungPada).toLocaleString("id-ID")}.`
                      : "Hasil perhitungan langsung, belum disimpan."}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {simulasi && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bobot simulasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {META_INDIKATOR.map((meta) => (
                  <div key={meta.key} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <label className="text-sm font-medium">{meta.label}</label>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {nf.format(bobotNormal[meta.key] * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[bobot[meta.key] * 100]}
                      min={0}
                      max={100}
                      step={5}
                      aria-label={`Bobot ${meta.label}`}
                      onValueChange={([v]) =>
                        setBobot({ ...bobot, [meta.key]: (v ?? 0) / 100 })
                      }
                    />
                  </div>
                ))}
                <p className="border-t border-border pt-4 text-xs text-muted-foreground">
                  Bobot dinormalisasi otomatis menjadi total 100%. Skor selalu sama dengan
                  jumlah kontribusi komponennya.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export { isDataUji, labelWilayah };
