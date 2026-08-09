import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const rowSchema = z.object({
  kodeBps: z.string().min(2).max(20),
  periode: z.string().min(4).max(20),
  sumberData: z.string().min(3).max(200),
  jumlahPenduduk: z.number().int().min(0),
  jumlahKkTotal: z.number().int().min(0),
  jumlahKkMiskinEkstrem: z.number().int().min(0),
  jumlahKkDesil1: z.number().int().min(0),
  jumlahKkDesil2: z.number().int().min(0),
  jumlahKkDesil3: z.number().int().min(0),
  catatan: z.string().max(500).optional().nullable(),
});

const payloadSchema = z.object({ rows: z.array(rowSchema).min(1).max(2000) });

export type ImporRow = z.infer<typeof rowSchema>;

async function assertSuperAdmin(supabase: {
  rpc: (fn: "is_super_admin") => Promise<{ data: boolean | null; error: unknown }>;
}) {
  const { data, error } = await supabase.rpc("is_super_admin");
  if (error || !data) throw new Error("Akses ditolak: hanya Super Admin yang berwenang.");
}

export const imporDataAgregat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => payloadSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const kodes = Array.from(new Set(data.rows.map((r) => r.kodeBps)));
    const { data: wilayah, error: wilayahError } = await supabaseAdmin
      .from("wilayah")
      .select("id, kode_bps, nama")
      .in("kode_bps", kodes);
    if (wilayahError) throw new Error(wilayahError.message);

    const byKode = new Map((wilayah ?? []).map((w) => [w.kode_bps, w]));
    const unknown = kodes.filter((k) => !byKode.has(k));
    if (unknown.length > 0) {
      throw new Error(`Kode wilayah tidak dikenal: ${unknown.slice(0, 10).join(", ")}`);
    }

    const prepared = data.rows.map((r) => ({
      wilayah_id: byKode.get(r.kodeBps)!.id,
      periode: r.periode,
      sumber_data: r.sumberData,
      jumlah_penduduk: r.jumlahPenduduk,
      jumlah_kk_total: r.jumlahKkTotal,
      jumlah_kk_miskin_ekstrem: r.jumlahKkMiskinEkstrem,
      jumlah_kk_desil_1: r.jumlahKkDesil1,
      jumlah_kk_desil_2: r.jumlahKkDesil2,
      jumlah_kk_desil_3: r.jumlahKkDesil3,
      catatan: r.catatan ?? null,
    }));

    // Ganti baris lama dengan kombinasi wilayah + periode + sumber data yang sama.
    for (const row of prepared) {
      const { error: delError } = await supabaseAdmin
        .from("kesejahteraan_agregat")
        .delete()
        .eq("wilayah_id", row.wilayah_id)
        .eq("periode", row.periode)
        .eq("sumber_data", row.sumber_data);
      if (delError) throw new Error(delError.message);
    }

    const { error: insertError } = await supabaseAdmin
      .from("kesejahteraan_agregat")
      .insert(prepared);
    if (insertError) throw new Error(insertError.message);

    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      actor_email: (context.claims as { email?: string } | null)?.email ?? null,
      aksi: "impor_data_agregat",
      entitas: "kesejahteraan_agregat",
      detail: {
        jumlah_baris: prepared.length,
        periode: Array.from(new Set(prepared.map((p) => p.periode))),
        sumber_data: Array.from(new Set(prepared.map((p) => p.sumber_data))),
      },
    });

    return {
      ok: true,
      jumlahBaris: prepared.length,
      wilayah: (wilayah ?? []).map((w) => w.nama),
    };
  });
