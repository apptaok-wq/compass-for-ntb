import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const roleEnum = z.enum([
  "super_admin",
  "bappeda_provinsi",
  "dinas_sosial",
  "pemkab_kota",
  "kominfo",
  "opd_teknis",
  "akademisi",
  "mitra_pembangunan",
]);

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(72),
  namaLengkap: z.string().min(3).max(120),
  jabatan: z.string().max(120).optional().nullable(),
  instansi: z.string().max(160).optional().nullable(),
  role: roleEnum,
  wilayahScopeId: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  userId: z.string().uuid(),
  namaLengkap: z.string().min(3).max(120),
  jabatan: z.string().max(120).optional().nullable(),
  instansi: z.string().max(160).optional().nullable(),
  role: roleEnum,
  wilayahScopeId: z.string().uuid().nullable().optional(),
  isActive: z.boolean(),
});

async function assertSuperAdmin(supabase: {
  rpc: (fn: "is_super_admin") => Promise<{ data: boolean | null; error: unknown }>;
}) {
  const { data, error } = await supabase.rpc("is_super_admin");
  if (error || !data) throw new Error("Akses ditolak: hanya Super Admin yang berwenang.");
}

export const listUserAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: profiles, error }, { data: roles }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, nama_lengkap, jabatan, instansi, is_active, wilayah_scope_id")
        .order("nama_lengkap"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    if (error) throw new Error(error.message);

    const roleByUser = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

    return (profiles ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      namaLengkap: p.nama_lengkap,
      jabatan: p.jabatan,
      instansi: p.instansi,
      isActive: p.is_active,
      wilayahScopeId: p.wilayah_scope_id,
      role: roleByUser.get(p.id) ?? null,
    }));
  });

export const createUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      const raw = createError?.message ?? "";
      if (/already been registered|already exists|duplicate/i.test(raw)) {
        throw new Error(`Surel ${data.email} sudah terdaftar. Gunakan surel lain.`);
      }
      throw new Error(raw || "Gagal membuat akun pengguna.");
    }
    const userId = created.user.id;

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      email: data.email,
      nama_lengkap: data.namaLengkap,
      jabatan: data.jabatan ?? null,
      instansi: data.instansi ?? null,
      wilayah_scope_id: data.wilayahScopeId ?? null,
      is_active: true,
    });
    if (profileError) throw new Error(profileError.message);

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.role });
    if (roleError) throw new Error(roleError.message);

    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      actor_email: (context.claims as { email?: string } | null)?.email ?? null,
      aksi: "create_user",
      entitas: "profiles",
      entitas_id: userId,
      detail: { email: data.email, role: data.role },
    });

    return { ok: true, userId };
  });

export const updateUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        nama_lengkap: data.namaLengkap,
        jabatan: data.jabatan ?? null,
        instansi: data.instansi ?? null,
        wilayah_scope_id: data.wilayahScopeId ?? null,
        is_active: data.isActive,
      })
      .eq("id", data.userId);
    if (profileError) throw new Error(profileError.message);

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (roleError) throw new Error(roleError.message);

    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      actor_email: (context.claims as { email?: string } | null)?.email ?? null,
      aksi: "update_user",
      entitas: "profiles",
      entitas_id: data.userId,
      detail: { role: data.role, is_active: data.isActive },
    });

    return { ok: true };
  });
