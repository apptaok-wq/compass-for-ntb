import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/app/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/rekomendasi-program")({
  head: () => ({
    meta: [
      { title: "Rekomendasi Program — NTB-PIS" },
      {
        name: "description",
        content: "Usulan intervensi program berbasis profil kerentanan wilayah di Nusa Tenggara Barat.",
      },
      { property: "og:title", content: "Rekomendasi Program — NTB-PIS" },
      {
        property: "og:description",
        content: "Modul penyusunan usulan intervensi berbasis data agregat wilayah.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Program"
      title="Rekomendasi Program"
      description="Modul ini akan menyusun usulan intervensi berdasarkan profil kerentanan wilayah, disertai catatan kesesuaian dengan kewenangan OPD."
      items={[
        "Pemetaan indikator dominan menjadi jenis intervensi",
        "Penyaringan usulan menurut kewenangan OPD pelaksana",
        "Ekspor daftar usulan sebagai bahan musyawarah perencanaan",
      ]}
    />
  ),
});
