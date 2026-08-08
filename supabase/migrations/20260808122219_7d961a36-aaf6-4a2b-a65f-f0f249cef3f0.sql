CREATE TYPE public.app_role AS ENUM (
  'super_admin','bappeda_provinsi','dinas_sosial','pemkab_kota',
  'kominfo','opd_teknis','akademisi','mitra_pembangunan'
);

CREATE TYPE public.jenis_wilayah AS ENUM ('provinsi','kabupaten','kota','kecamatan','desa');

CREATE TABLE public.wilayah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_bps text NOT NULL UNIQUE,
  nama text NOT NULL,
  jenis public.jenis_wilayah NOT NULL,
  parent_id uuid REFERENCES public.wilayah(id) ON DELETE RESTRICT,
  geometry extensions.geometry(MultiPolygon, 4326),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX wilayah_parent_idx ON public.wilayah(parent_id);
CREATE INDEX wilayah_jenis_idx ON public.wilayah(jenis);

GRANT SELECT ON public.wilayah TO authenticated, anon;
GRANT ALL ON public.wilayah TO service_role;
ALTER TABLE public.wilayah ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  nama_lengkap text NOT NULL,
  jabatan text,
  instansi text,
  wilayah_scope_id uuid REFERENCES public.wilayah(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_active);
$$;

CREATE OR REPLACE FUNCTION public.has_full_wilayah_read()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin','bappeda_provinsi','dinas_sosial','kominfo','akademisi','mitra_pembangunan')
  );
$$;

CREATE OR REPLACE FUNCTION public.wilayah_in_scope(_wilayah_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH RECURSIVE anc AS (
    SELECT id, parent_id FROM public.wilayah WHERE id = _wilayah_id
    UNION ALL
    SELECT w.id, w.parent_id FROM public.wilayah w JOIN anc ON w.id = anc.parent_id
  )
  SELECT EXISTS (
    SELECT 1 FROM anc
    WHERE anc.id = (SELECT wilayah_scope_id FROM public.profiles WHERE id = auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.can_read_wilayah(_wilayah_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_active_user()
     AND (public.has_full_wilayah_read() OR public.wilayah_in_scope(_wilayah_id));
$$;

CREATE POLICY "wilayah_read_public" ON public.wilayah FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "wilayah_admin_write" ON public.wilayah FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_super_admin());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

CREATE TABLE public.kesejahteraan_agregat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wilayah_id uuid NOT NULL REFERENCES public.wilayah(id) ON DELETE CASCADE,
  periode text NOT NULL,
  sumber_data text NOT NULL,
  jumlah_kk_total integer NOT NULL DEFAULT 0,
  jumlah_kk_desil_1 integer NOT NULL DEFAULT 0,
  jumlah_kk_desil_2 integer NOT NULL DEFAULT 0,
  jumlah_kk_desil_3 integer NOT NULL DEFAULT 0,
  jumlah_kk_miskin_ekstrem integer NOT NULL DEFAULT 0,
  jumlah_penduduk integer NOT NULL DEFAULT 0,
  catatan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wilayah_id, periode, sumber_data)
);
CREATE INDEX kesejahteraan_wilayah_idx ON public.kesejahteraan_agregat(wilayah_id);
CREATE INDEX kesejahteraan_periode_idx ON public.kesejahteraan_agregat(periode);

GRANT SELECT ON public.kesejahteraan_agregat TO authenticated;
GRANT ALL ON public.kesejahteraan_agregat TO service_role;
ALTER TABLE public.kesejahteraan_agregat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agregat_select_scoped" ON public.kesejahteraan_agregat FOR SELECT TO authenticated
  USING (public.can_read_wilayah(wilayah_id));
CREATE POLICY "agregat_admin_write" ON public.kesejahteraan_agregat FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  aksi text NOT NULL,
  entitas text NOT NULL,
  entitas_id text,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_idx ON public.audit_log(created_at DESC);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_select_admin" ON public.audit_log FOR SELECT TO authenticated
  USING (public.is_super_admin() OR public.has_role(auth.uid(), 'kominfo'));
CREATE POLICY "audit_insert_self" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE TABLE public.kunjungan_lapangan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wilayah_id uuid NOT NULL REFERENCES public.wilayah(id) ON DELETE CASCADE,
  petugas_id uuid NOT NULL,
  tanggal_kunjungan date NOT NULL,
  tujuan text NOT NULL,
  temuan text,
  tindak_lanjut text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kunjungan_wilayah_idx ON public.kunjungan_lapangan(wilayah_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kunjungan_lapangan TO authenticated;
GRANT ALL ON public.kunjungan_lapangan TO service_role;
ALTER TABLE public.kunjungan_lapangan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kunjungan_select_scoped" ON public.kunjungan_lapangan FOR SELECT TO authenticated
  USING (public.can_read_wilayah(wilayah_id));
CREATE POLICY "kunjungan_insert_own" ON public.kunjungan_lapangan FOR INSERT TO authenticated
  WITH CHECK (petugas_id = auth.uid() AND public.can_read_wilayah(wilayah_id));
CREATE POLICY "kunjungan_update_own" ON public.kunjungan_lapangan FOR UPDATE TO authenticated
  USING (petugas_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (petugas_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "kunjungan_delete_own" ON public.kunjungan_lapangan FOR DELETE TO authenticated
  USING (petugas_id = auth.uid() OR public.is_super_admin());

CREATE TABLE public.web_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value double precision NOT NULL,
  rating text,
  path text NOT NULL,
  navigation_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX web_vitals_created_idx ON public.web_vitals(created_at DESC);
GRANT SELECT ON public.web_vitals TO authenticated;
GRANT ALL ON public.web_vitals TO service_role;
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vitals_select_admin" ON public.web_vitals FOR SELECT TO authenticated
  USING (public.is_super_admin() OR public.has_role(auth.uid(), 'kominfo'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER wilayah_updated_at BEFORE UPDATE ON public.wilayah FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER agregat_updated_at BEFORE UPDATE ON public.kesejahteraan_agregat FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER kunjungan_updated_at BEFORE UPDATE ON public.kunjungan_lapangan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.wilayah (kode_bps, nama, jenis, parent_id) VALUES ('52','Nusa Tenggara Barat','provinsi',NULL);

INSERT INTO public.wilayah (kode_bps, nama, jenis, parent_id)
SELECT v.kode, v.nama, v.jenis::public.jenis_wilayah, p.id
FROM (VALUES
  ('5201','Lombok Barat','kabupaten'),
  ('5202','Lombok Tengah','kabupaten'),
  ('5203','Lombok Timur','kabupaten'),
  ('5204','Sumbawa','kabupaten'),
  ('5205','Dompu','kabupaten'),
  ('5206','Bima','kabupaten'),
  ('5207','Sumbawa Barat','kabupaten'),
  ('5208','Lombok Utara','kabupaten'),
  ('5271','Kota Mataram','kota'),
  ('5272','Kota Bima','kota')
) AS v(kode, nama, jenis)
CROSS JOIN (SELECT id FROM public.wilayah WHERE kode_bps = '52') p;