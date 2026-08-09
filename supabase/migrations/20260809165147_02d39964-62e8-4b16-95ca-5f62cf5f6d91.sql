CREATE TABLE public.skor_kerentanan (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wilayah_id uuid NOT NULL REFERENCES public.wilayah(id) ON DELETE CASCADE,
  periode text NOT NULL,
  skor double precision NOT NULL,
  komponen jsonb NOT NULL DEFAULT '{}'::jsonb,
  metode_versi text NOT NULL,
  dihitung_pada timestamp with time zone NOT NULL DEFAULT now(),
  dihitung_oleh uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (wilayah_id, periode, metode_versi)
);

CREATE INDEX skor_kerentanan_periode_idx ON public.skor_kerentanan (periode);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.skor_kerentanan TO authenticated;
GRANT ALL ON public.skor_kerentanan TO service_role;

ALTER TABLE public.skor_kerentanan ENABLE ROW LEVEL SECURITY;

CREATE POLICY skor_select_scoped ON public.skor_kerentanan
  FOR SELECT TO authenticated
  USING (public.can_read_wilayah(wilayah_id));

CREATE POLICY skor_admin_write ON public.skor_kerentanan
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE TRIGGER skor_kerentanan_updated_at
  BEFORE UPDATE ON public.skor_kerentanan
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();