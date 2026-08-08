REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_active_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_full_wilayah_read() FROM anon;
REVOKE EXECUTE ON FUNCTION public.wilayah_in_scope(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_read_wilayah(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated;