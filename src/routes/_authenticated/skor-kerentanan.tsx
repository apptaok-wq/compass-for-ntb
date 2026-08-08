import { createFileRoute } from "@tanstack/react-router";
import { SkorKerentanan } from "@/components/app/SkorKerentanan";

export const Route = createFileRoute("/_authenticated/skor-kerentanan")({
  head: () => ({
    meta: [
      { title: "Skor Kerentanan — NTB-PIS" },
      {
        name: "description",
        content:
          "Komposit terbobot tingkat kerentanan kemiskinan kabupaten/kota di Nusa Tenggara Barat.",
      },
      { property: "og:title", content: "Skor Kerentanan — NTB-PIS" },
      {
        property: "og:description",
        content: "Peringkat kerentanan wilayah berbasis bobot indikator yang dapat disesuaikan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SkorKerentananPage,
});

function SkorKerentananPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Analitik</p>
        <h1 className="display-md mt-2">Skor Kerentanan</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Skor komposit menggabungkan beberapa indikator agregat dengan bobot yang dapat
          disesuaikan. Hasil bersifat indikatif untuk penajaman prioritas, bukan penetapan
          penerima manfaat.
        </p>
      </header>
      <SkorKerentanan />
    </div>
  );
}
