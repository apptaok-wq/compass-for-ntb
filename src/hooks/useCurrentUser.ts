import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/rbac";

export type CurrentUser = {
  id: string;
  email: string;
  namaLengkap: string;
  jabatan: string | null;
  instansi: string | null;
  isActive: boolean;
  role: AppRole | null;
  wilayahScopeId: string | null;
  wilayahScopeNama: string | null;
};

export function useCurrentUser() {
  return useQuery<CurrentUser | null>({
    queryKey: ["current-user"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) return null;

      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, nama_lengkap, jabatan, instansi, is_active, wilayah_scope_id")
          .eq("id", auth.user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", auth.user.id),
      ]);

      let wilayahScopeNama: string | null = null;
      if (profile?.wilayah_scope_id) {
        const { data: wilayah } = await supabase
          .from("wilayah")
          .select("nama")
          .eq("id", profile.wilayah_scope_id)
          .maybeSingle();
        wilayahScopeNama = wilayah?.nama ?? null;
      }

      return {
        id: auth.user.id,
        email: profile?.email ?? auth.user.email ?? "",
        namaLengkap: profile?.nama_lengkap ?? auth.user.email ?? "Pengguna",
        jabatan: profile?.jabatan ?? null,
        instansi: profile?.instansi ?? null,
        isActive: profile?.is_active ?? false,
        role: (roles?.[0]?.role as AppRole | undefined) ?? null,
        wilayahScopeId: profile?.wilayah_scope_id ?? null,
        wilayahScopeNama,
      };
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
}
