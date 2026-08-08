import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/app/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/monitoring-evaluasi")({
  head: () => ({
    meta: [
      { title: "Monitoring & Evaluasi — NTB-PIS" },
      {
        name: "description",
        content:
          "Pemantauan capaian program penanggulangan kemiskinan lintas OPD di Nusa Tenggara Barat.",
      },
      { property: "og:title", content: "Monitoring & Evaluasi — NTB-PIS" },
      {
        property: "og:description",
        content: "Modul pemantauan dan evaluasi program penanggulangan kemiskinan NTB.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Program"
      title="Monitoring & Evaluasi"
      description="Modul ini akan menampilkan capaian program penanggulangan kemiskinan per wilayah dan per OPD, termasuk realisasi anggaran serta tindak lanjut kunjungan lapangan."
      items={[
        "Tabel capaian indikator program per kabupaten/kota",
        "Rekap kunjungan lapangan dan tindak lanjut petugas",
        "Perbandingan target dan realisasi antar periode",
      ]}
    />
  ),
});
