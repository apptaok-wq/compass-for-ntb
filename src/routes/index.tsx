import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Database, Layers, Map, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { NtbMark } from "@/components/NtbMark";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NTB-PIS — Intelijen Data Kemiskinan Nusa Tenggara Barat" },
      {
        name: "description",
        content:
          "Platform intelijen data agregat untuk percepatan penghapusan kemiskinan ekstrem di Nusa Tenggara Barat. Pelengkap DTSEN dan SEPAKAT.",
      },
      { property: "og:title", content: "NTB-PIS — Intelijen Data Kemiskinan Nusa Tenggara Barat" },
      {
        property: "og:description",
        content:
          "Skor kerentanan wilayah, dasbor GIS, dan rekomendasi program berbasis data agregat resmi.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: Map,
    title: "Dasbor GIS wilayah",
    body: "Visualisasi indikator kemiskinan pada tingkat kabupaten/kota hingga desa, berbasis geometri administratif resmi.",
  },
  {
    icon: TrendingUp,
    title: "Skor kerentanan terbobot",
    body: "Komposit indikator dengan bobot yang dapat disesuaikan, sehingga prioritas wilayah dapat diuji dari berbagai sudut kebijakan.",
  },
  {
    icon: Layers,
    title: "Rekomendasi program",
    body: "Usulan intervensi yang dipetakan pada kewenangan OPD pelaksana, siap dibawa ke forum perencanaan daerah.",
  },
  {
    icon: ShieldCheck,
    title: "Tata kelola akses",
    body: "Peran berjenjang dengan cakupan wilayah, jejak audit lengkap, dan tanpa pendaftaran mandiri.",
  },
  {
    icon: Database,
    title: "Data agregat saja",
    body: "Sistem tidak menyimpan data individu maupun keluarga. Seluruh angka berada pada tingkat wilayah.",
  },
  {
    icon: Users,
    title: "Kolaborasi lintas pemangku",
    body: "Ruang kerja bersama bagi Bappeda, Dinas Sosial, pemerintah kabupaten/kota, akademisi, dan mitra pembangunan.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Pemuatan data agregat",
    body: "Administrator memuat data kesejahteraan agregat per wilayah dan periode beserta sumber datanya.",
  },
  {
    step: "02",
    title: "Analitik kerentanan",
    body: "Sistem menormalisasi indikator dan menyusun peringkat kerentanan antar wilayah di Provinsi NTB.",
  },
  {
    step: "03",
    title: "Perumusan kebijakan",
    body: "Temuan dirangkai menjadi rekomendasi program dan policy brief untuk pengambil keputusan.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 text-foreground">
            <NtbMark className="h-8 w-8" />
            <span className="font-display text-base font-semibold">NTB-PIS</span>
          </Link>
          <Button asChild size="sm">
            <Link to="/auth">Masuk</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div aria-hidden className="rule-grid absolute inset-0 opacity-[0.07]" />
          <div className="section-y relative mx-auto max-w-6xl px-6">
            <p className="eyebrow text-accent">Pemerintah Provinsi Nusa Tenggara Barat</p>
            <h1 className="display-xl mt-6 max-w-3xl">
              Intelijen data untuk percepatan penghapusan kemiskinan ekstrem di NTB
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/80">
              NTB-PIS menyatukan data agregat kesejahteraan, analitik kerentanan wilayah, dan
              perumusan rekomendasi program dalam satu ruang kerja terkendali bagi perangkat daerah
              dan mitra resmi.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/auth">
                  Masuk ke sistem
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <dl className="mt-16 grid gap-8 border-t border-primary-foreground/15 pt-10 sm:grid-cols-3">
              {[
                ["10", "Kabupaten dan kota terpantau"],
                ["8", "Peran pengguna berjenjang"],
                ["0", "Data individu yang disimpan"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl font-semibold">{value}</dt>
                  <dd className="mt-2 text-sm text-primary-foreground/70">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="section-y mx-auto max-w-6xl px-6">
          <p className="eyebrow">Kemampuan utama</p>
          <h2 className="display-lg mt-4 max-w-2xl">
            Satu sumber rujukan analitik untuk keputusan penanggulangan kemiskinan
          </h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <article key={title} className="bg-background p-8">
                <Icon aria-hidden className="h-5 w-5 text-accent-strong" />
                <h3 className="mt-5 text-base font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-surface">
          <div className="section-y mx-auto max-w-6xl px-6">
            <p className="eyebrow">Alur kerja</p>
            <h2 className="display-lg mt-4 max-w-2xl">Dari data agregat menuju kebijakan</h2>
            <ol className="mt-14 grid gap-10 md:grid-cols-3">
              {STEPS.map(({ step, title, body }) => (
                <li key={step}>
                  <span className="font-display text-sm font-semibold text-accent-strong">
                    {step}
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section-y mx-auto max-w-3xl px-6 text-center">
          <h2 className="display-lg">Akses terbatas bagi pengguna internal</h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Akun NTB-PIS diterbitkan oleh administrator sistem. Perangkat daerah, akademisi, dan
            mitra pembangunan yang memerlukan akses dapat mengajukan permohonan melalui Bappeda
            Provinsi NTB.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/auth">Masuk</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>NTB Poverty Intelligence System — Pemerintah Provinsi Nusa Tenggara Barat.</p>
          <p>Pelengkap DTSEN dan SEPAKAT, bukan penggantinya.</p>
        </div>
      </footer>
    </div>
  );
}
