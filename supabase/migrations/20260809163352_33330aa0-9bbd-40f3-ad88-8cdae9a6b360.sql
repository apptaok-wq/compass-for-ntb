-- Seed kecamatan + desa uji untuk Kecamatan Tanjung, Lombok Utara (5208)
-- Geometri bersifat perkiraan/disederhanakan, bukan batas administratif resmi.

WITH kab AS (
  SELECT id FROM public.wilayah WHERE kode_bps = '5208'
)
INSERT INTO public.wilayah (kode_bps, nama, jenis, parent_id, geometry)
SELECT '5208010', 'Tanjung', 'kecamatan'::jenis_wilayah, kab.id,
  ST_Multi(ST_GeomFromText('POLYGON((116.070 -8.290, 116.280 -8.290, 116.280 -8.410, 116.070 -8.410, 116.070 -8.290))', 4326))
FROM kab
WHERE NOT EXISTS (SELECT 1 FROM public.wilayah w WHERE w.kode_bps = '5208010');

WITH kec AS (
  SELECT id FROM public.wilayah WHERE kode_bps = '5208010'
), desa(kode_bps, nama, x0, y0, x1, y1) AS (
  VALUES
    ('5208010001', 'Tanjung',        116.070, -8.290, 116.140, -8.350),
    ('5208010002', 'Jenggala',       116.140, -8.290, 116.210, -8.350),
    ('5208010003', 'Sokong',         116.210, -8.290, 116.280, -8.350),
    ('5208010004', 'Medana',         116.070, -8.350, 116.140, -8.410),
    ('5208010005', 'Sigar Penjalin', 116.140, -8.350, 116.210, -8.410),
    ('5208010006', 'Tegal Maja',     116.210, -8.350, 116.280, -8.380),
    ('5208010007', 'Teniga',         116.210, -8.380, 116.280, -8.410)
)
INSERT INTO public.wilayah (kode_bps, nama, jenis, parent_id, geometry)
SELECT d.kode_bps, d.nama, 'desa'::jenis_wilayah, kec.id,
  ST_Multi(ST_MakeEnvelope(d.x0, d.y0, d.x1, d.y1, 4326))
FROM desa d CROSS JOIN kec
WHERE NOT EXISTS (SELECT 1 FROM public.wilayah w WHERE w.kode_bps = d.kode_bps);

-- Poligon perkiraan untuk Kabupaten Lombok Utara agar peta punya konteks induk
UPDATE public.wilayah
SET geometry = ST_Multi(ST_GeomFromText('POLYGON((116.030 -8.200, 116.480 -8.200, 116.480 -8.520, 116.030 -8.520, 116.030 -8.200))', 4326))
WHERE kode_bps = '5208' AND geometry IS NULL;