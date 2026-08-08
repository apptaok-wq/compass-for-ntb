import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const bootstrapSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  namaLengkap: z.string().min(3).max(120),
  jabatan: z.string().max(120).optional(),
  instansi: z.string().max(160).optional(),
});

export const superAdminExists = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin");
  if (error) throw new Error(error.message);
  return { exists: (count ?? 0) > 0 };
});

export const bootstrapSuperAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bootstrapSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    if ((count ?? 0) > 0) {
      throw new Error("Super Admin sudah tersedia. Pendaftaran awal telah ditutup.");
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      throw new Error(createError?.message ?? "Gagal membuat akun Super Admin.");
    }

    const userId = created.user.id;

    const { data: provinsi } = await supabaseAdmin
      .from("wilayah")
      .select("id")
      .eq("kode_bps", "52")
      .maybeSingle();

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      email: data.email,
      nama_lengkap: data.namaLengkap,
      jabatan: data.jabatan ?? null,
      instansi: data.instansi ?? null,
      wilayah_scope_id: provinsi?.id ?? null,
      is_active: true,
    });
    if (profileError) throw new Error(profileError.message);

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "super_admin" });
    if (roleError) throw new Error(roleError.message);

    await supabaseAdmin.from("audit_log").insert({
      actor_id: userId,
      actor_email: data.email,
      aksi: "bootstrap_super_admin",
      entitas: "profiles",
      entitas_id: userId,
      detail: { keterangan: "Pendaftaran Super Admin awal" },
    });

    return { ok: true };
  });
