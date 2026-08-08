import { createFileRoute } from "@tanstack/react-router";
import { WilayahOverview } from "@/components/app/WilayahOverview";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dasbor GIS — NTB-PIS" },
      {
        name: "description",
        content:
          "Ringkasan indikator kemiskinan agregat seluruh kabupaten/kota di Nusa Tenggara Barat.",
      },
      { property: "og:title", content: "Dasbor GIS — NTB-PIS" },
      {
        property: "og:description",
        content: "Ringkasan indikator kemiskinan agregat wilayah Nusa Tenggara Barat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Dasbor</p>
        <h1 className="display-md mt-2">Ringkasan wilayah Nusa Tenggara Barat</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Seluruh angka bersifat agregat pada tingkat wilayah administratif. NTB-PIS merupakan
          pelengkap DTSEN dan SEPAKAT, bukan penggantinya.
        </p>
      </header>
      <WilayahOverview />
    </div>
  );
}
