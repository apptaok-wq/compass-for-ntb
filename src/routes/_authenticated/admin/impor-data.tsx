import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/app/ModulePlaceholder";

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
  component: () => (
    <ModulePlaceholder
      eyebrow="Administrasi"
      title="Impor Data Agregat"
      description="Modul ini akan menerima berkas CSV data agregat kesejahteraan per wilayah dan periode. Hanya data agregat yang diterima; berkas berisi data individu atau keluarga akan ditolak."
      items={[
        "Templat CSV: kode_bps, periode, jumlah_penduduk, jumlah_kk_total, jumlah_kk_miskin_ekstrem, jumlah_kk_desil_1..3, sumber_data",
        "Validasi kode wilayah dan pratinjau sebelum penyimpanan",
        "Pencatatan otomatis ke jejak audit setiap kali data dimuat",
      ]}
    />
  ),
});
