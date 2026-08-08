import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/app/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/policy-brief")({
  head: () => ({
    meta: [
      { title: "Policy Brief — NTB-PIS" },
      {
        name: "description",
        content:
          "Ringkasan kebijakan siap terbit berbasis data agregat kemiskinan Nusa Tenggara Barat.",
      },
      { property: "og:title", content: "Policy Brief — NTB-PIS" },
      {
        property: "og:description",
        content: "Modul penyusunan ringkasan kebijakan berbasis bukti untuk pengambil keputusan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Publikasi"
      title="Policy Brief"
      description="Modul ini akan merangkai temuan analitik menjadi ringkasan kebijakan singkat yang dapat ditinjau bersama akademisi dan mitra pembangunan."
      items={[
        "Kerangka ringkasan: konteks, temuan, opsi kebijakan, rekomendasi",
        "Penyisipan grafik dan tabel dari modul Skor Kerentanan",
        "Ekspor berkas siap edar untuk rapat pimpinan daerah",
      ]}
    />
  ),
});
