import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { BOBOT_DEFAULT, METODE_VERSI, hitungSkor, normalisasiBobot } from "@/lib/skor";

const payloadSchema = z.object({
  periode: z.string().min(4).max(20),
  bobot: z
    .object({
      ekstrem: z.number().min(0).max(100),
      desil1: z.number().min(0).max(100),
      desil123: z.number().min(0).max(100),
    })
    .optional(),
});

async function assertSuperAdmin(supabase: {
  rpc: (fn: "is_super_admin") => Promise<{ data: boolean | null; error: unknown }>;
}) {
  const { data, error } = await supabase.rpc("is_super_admin");
  if (error || !data) throw new Error("Akses ditolak: hanya Super Admin yang berwenang.");
}

/**
 * Menghitung ulang skor kerentanan seluruh wilayah yang memiliki data agregat
 * pada satu periode, lalu menyimpannya ke tabel skor_kerentanan.
 */
export const hitungDanSimpanSkor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => payloadSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: agregat, error } = await supabaseAdmin
      .from("kesejahteraan_agregat")
      .select(
        "wilayah_id, periode, sumber_data, jumlah_kk_total, jumlah_kk_miskin_ekstrem, jumlah_kk_desil_1, jumlah_kk_desil_2, jumlah_kk_desil_3",
      )
      .eq("periode", data.periode);
    if (error) throw new Error(error.message);
    if (!agregat || agregat.length === 0) {
      throw new Error(`Tidak ada data agregat untuk periode ${data.periode}.`);
    }

    const bobot = normalisasiBobot(data.bobot ?? BOBOT_DEFAULT);

    const hasil = agregat.map((a) =>
      hitungSkor(
        {
          wilayahId: a.wilayah_id,
          periode: a.periode,
          sumberData: a.sumber_data,
          jumlahKkTotal: a.jumlah_kk_total,
          jumlahKkMiskinEkstrem: a.jumlah_kk_miskin_ekstrem,
          jumlahKkDesil1: a.jumlah_kk_desil_1,
          jumlahKkDesil2: a.jumlah_kk_desil_2,
          jumlahKkDesil3: a.jumlah_kk_desil_3,
        },
        bobot,
      ),
    );

    const rows = hasil.map((h) => ({
      wilayah_id: h.wilayahId,
      periode: h.periode,
      skor: h.skor,
      komponen: {
        sumber_data: h.sumberData,
        data_uji: h.dataUji,
        bobot,
        komponen: h.komponen,
      },
      metode_versi: METODE_VERSI,
      dihitung_pada: new Date().toISOString(),
      dihitung_oleh: context.userId,
    }));

    const { error: upsertError } = await supabaseAdmin
      .from("skor_kerentanan")
      .upsert(rows, { onConflict: "wilayah_id,periode,metode_versi" });
    if (upsertError) throw new Error(upsertError.message);

    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      actor_email: (context.claims as { email?: string } | null)?.email ?? null,
      aksi: "hitung_skor_kerentanan",
      entitas: "skor_kerentanan",
      detail: { periode: data.periode, jumlah_wilayah: rows.length, metode_versi: METODE_VERSI, bobot },
    });

    return { ok: true, jumlahWilayah: rows.length, metodeVersi: METODE_VERSI };
  });
