import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { imporDataAgregat, type ImporRow } from "@/lib/impor.functions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/impor-data")({
  head: () => ({
    meta: [
      { title: "Impor Data Agregat — NTB-PIS" },
      {
        name: "description",
        content: "Unggah berkas data agregat kesejahteraan tingkat wilayah ke dalam NTB-PIS.",
      },
      { property: "og:title", content: "Impor Data Agregat — NTB-PIS" },
      {
        property: "og:description",
        content: "Panel Super Admin untuk pemuatan data agregat kesejahteraan wilayah.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ImporDataPage,
});

const HEADERS = [
  "kode_bps",
  "periode",
  "jumlah_penduduk",
  "jumlah_kk_total",
  "jumlah_kk_miskin_ekstrem",
  "jumlah_kk_desil_1",
  "jumlah_kk_desil_2",
  "jumlah_kk_desil_3",
  "sumber_data",
] as const;

const FORBIDDEN = ["nik", "nama_kk", "nama_individu", "alamat", "no_kk", "nomor_kk"];

const TEMPLATE = `${HEADERS.join(",")}\n5208010001,2025-S1,9800,2850,142,410,365,320,DATA UJI - bukan data resmi\n`;

type ParseResult = { rows: ImporRow[]; errors: string[] };

function parseCsv(text: string): ParseResult {
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return { rows: [], errors: ["Berkas kosong atau hanya berisi header."] };

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const forbidden = header.filter((h) => FORBIDDEN.includes(h));
  if (forbidden.length > 0) {
    return {
      rows: [],
      errors: [
        `Kolom data individu/keluarga terdeteksi (${forbidden.join(", ")}). Hanya data agregat yang diterima.`,
      ],
    };
  }
  const missing = HEADERS.filter((h) => !header.includes(h));
  if (missing.length > 0) {
    return { rows: [], errors: [`Kolom wajib tidak ditemukan: ${missing.join(", ")}`] };
  }

  const idx = (name: string) => header.indexOf(name);
  const num = (v: string | undefined, line: number, col: string) => {
    const n = Number((v ?? "").replace(/[^\d-]/g, ""));
    if (!Number.isFinite(n) || n < 0) {
      errors.push(`Baris ${line}: nilai ${col} tidak valid ("${v ?? ""}")`);
      return 0;
    }
    return Math.trunc(n);
  };

  const rows: ImporRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.trim());
    const kodeBps = cells[idx("kode_bps")] ?? "";
    const periode = cells[idx("periode")] ?? "";
    const sumberData = cells[idx("sumber_data")] ?? "";
    if (!kodeBps || !periode || !sumberData) {
      errors.push(`Baris ${i + 1}: kode_bps, periode, dan sumber_data wajib diisi.`);
      continue;
    }
    rows.push({
      kodeBps,
      periode,
      sumberData,
      jumlahPenduduk: num(cells[idx("jumlah_penduduk")], i + 1, "jumlah_penduduk"),
      jumlahKkTotal: num(cells[idx("jumlah_kk_total")], i + 1, "jumlah_kk_total"),
      jumlahKkMiskinEkstrem: num(
        cells[idx("jumlah_kk_miskin_ekstrem")],
        i + 1,
        "jumlah_kk_miskin_ekstrem",
      ),
      jumlahKkDesil1: num(cells[idx("jumlah_kk_desil_1")], i + 1, "jumlah_kk_desil_1"),
      jumlahKkDesil2: num(cells[idx("jumlah_kk_desil_2")], i + 1, "jumlah_kk_desil_2"),
      jumlahKkDesil3: num(cells[idx("jumlah_kk_desil_3")], i + 1, "jumlah_kk_desil_3"),
      catatan: null,
    });
  }
  return { rows, errors };
}

function ImporDataPage() {
  const { data: user, isLoading } = useCurrentUser();
  const isSuperAdmin = user?.role === "super_admin";
  const queryClient = useQueryClient();
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const importFn = useServerFn(imporDataAgregat);

  const mutation = useMutation({
    mutationFn: (rows: ImporRow[]) => importFn({ data: { rows } }),
    onSuccess: (res) => {
      toast.success(`${res.jumlahBaris} baris data agregat berhasil dimuat.`);
      setRaw("");
      setParsed(null);
      queryClient.invalidateQueries({ queryKey: ["wilayah-agregat"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat…</p>;

  if (!isSuperAdmin) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Akses terbatas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Hanya Super Admin yang dapat mengimpor data agregat kesejahteraan.
        </CardContent>
      </Card>
    );
  }

  async function onFile(file: File) {
    const text = await file.text();
    setRaw(text);
    setParsed(parseCsv(text));
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Administrasi</p>
        <h1 className="display-md mt-2">Impor Data Agregat</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Hanya data agregat tingkat wilayah yang diterima. Berkas yang memuat kolom data individu
          atau keluarga akan ditolak otomatis. Baris dengan kombinasi wilayah, periode, dan sumber
          data yang sama akan diperbarui.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Muat berkas CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept=".csv,text/csv"
              aria-label="Pilih berkas CSV data agregat"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
              }}
              className="text-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const url = URL.createObjectURL(new Blob([TEMPLATE], { type: "text/csv" }));
                const a = document.createElement("a");
                a.href = url;
                a.download = "templat-agregat-ntb-pis.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Unduh templat
            </Button>
          </div>
          <Textarea
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setParsed(null);
            }}
            rows={8}
            placeholder={TEMPLATE}
            aria-label="Isi CSV data agregat"
            className="font-mono text-xs"
          />
          <Button type="button" onClick={() => setParsed(parseCsv(raw))} disabled={!raw.trim()}>
            Validasi &amp; pratinjau
          </Button>
        </CardContent>
      </Card>

      {parsed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              2. Pratinjau ({parsed.rows.length} baris valid)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsed.errors.length > 0 && (
              <ul role="alert" className="space-y-1 text-sm text-destructive">
                {parsed.errors.slice(0, 10).map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
            {parsed.rows.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode BPS</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead className="text-right">Penduduk</TableHead>
                        <TableHead className="text-right">KK</TableHead>
                        <TableHead className="text-right">Miskin ekstrem</TableHead>
                        <TableHead>Sumber data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsed.rows.slice(0, 20).map((r, i) => (
                        <TableRow key={`${r.kodeBps}-${r.periode}-${i}`}>
                          <TableCell className="font-mono text-xs">{r.kodeBps}</TableCell>
                          <TableCell>{r.periode}</TableCell>
                          <TableCell className="text-right">{r.jumlahPenduduk}</TableCell>
                          <TableCell className="text-right">{r.jumlahKkTotal}</TableCell>
                          <TableCell className="text-right">{r.jumlahKkMiskinEkstrem}</TableCell>
                          <TableCell className="text-muted-foreground">{r.sumberData}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button
                  type="button"
                  onClick={() => mutation.mutate(parsed.rows)}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Menyimpan…" : `Simpan ${parsed.rows.length} baris`}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
