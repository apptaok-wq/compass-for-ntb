/**
 * Model skor kerentanan wilayah — NTB-PIS
 *
 * Prinsip:
 * 1. TRANSPARAN. Skor adalah penjumlahan berbobot dari beberapa indikator
 *    agregat. Setiap indikator dinyatakan sebagai persentase absolut (0–100),
 *    bukan peringkat relatif, sehingga skor sebuah wilayah tidak berubah
 *    hanya karena wilayah lain ikut/tidak ikut dihitung.
 * 2. DAPAT DIJELASKAN. Fungsi `hitungSkor` selalu mengembalikan rincian
 *    kontribusi tiap indikator. Jumlah seluruh kontribusi = skor total
 *    (identitas matematis, bukan aproksimasi).
 * 3. DAPAT DISESUAIKAN. Bobot default di bawah bersifat kebijakan, bukan
 *    kebenaran statistik, dan dapat diubah lewat parameter `bobot`.
 *    Bobot dinormalisasi otomatis sehingga total selalu 1 (100%).
 * 4. AGREGAT SAJA. Masukan hanya berupa hitungan wilayah; tidak ada data
 *    individu (nama/NIK/alamat) yang boleh masuk ke model ini.
 *
 * Skor 0 = tidak ada indikasi kerentanan pada indikator terukur.
 * Skor 100 = seluruh KK di wilayah tersebut berada pada kondisi terburuk
 * di semua indikator. Nilai nyata di lapangan hampir selalu di bawah 50.
 */

export const METODE_VERSI = "v1.0.0-absolut";

export type BobotSkor = {
  /** Rasio KK miskin ekstrem terhadap total KK. */
  ekstrem: number;
  /** Rasio KK desil 1 (kelompok kesejahteraan terendah) terhadap total KK. */
  desil1: number;
  /** Rasio KK desil 1–3 (kelompok 30% terbawah) terhadap total KK. */
  desil123: number;
};

/**
 * Bobot default. Rasional:
 * - `ekstrem` (40%): kemiskinan ekstrem adalah target nasional dengan
 *   urgensi tertinggi, sehingga diberi bobot terbesar.
 * - `desil1` (35%): kelompok paling rentan jatuh ke kemiskinan ekstrem;
 *   indikator utama pencegahan.
 * - `desil123` (25%): cakupan 30% terbawah, menangkap kerentanan yang lebih
 *   luas namun kurang mendesak, sehingga bobotnya paling kecil.
 */
export const BOBOT_DEFAULT: BobotSkor = {
  ekstrem: 0.4,
  desil1: 0.35,
  desil123: 0.25,
};

export const META_INDIKATOR: Array<{
  key: keyof BobotSkor;
  label: string;
  penjelasan: string;
}> = [
  {
    key: "ekstrem",
    label: "Rasio KK miskin ekstrem",
    penjelasan: "Persentase kepala keluarga miskin ekstrem terhadap total KK wilayah.",
  },
  {
    key: "desil1",
    label: "Rasio KK desil 1",
    penjelasan: "Persentase kepala keluarga pada desil kesejahteraan terendah.",
  },
  {
    key: "desil123",
    label: "Rasio KK desil 1–3",
    penjelasan: "Persentase kepala keluarga pada 30% kelompok kesejahteraan terbawah.",
  },
];

export type AgregatWilayah = {
  wilayahId: string;
  periode: string;
  sumberData: string;
  jumlahKkTotal: number;
  jumlahKkMiskinEkstrem: number;
  jumlahKkDesil1: number;
  jumlahKkDesil2: number;
  jumlahKkDesil3: number;
};

export type KomponenSkor = {
  key: keyof BobotSkor;
  label: string;
  penjelasan: string;
  /** Nilai indikator dalam persen (0–100). */
  nilai: number;
  /** Bobot ternormalisasi (total seluruh komponen = 1). */
  bobot: number;
  /** nilai × bobot. Jumlah seluruh kontribusi = skor total. */
  kontribusi: number;
};

export type HasilSkor = {
  wilayahId: string;
  periode: string;
  sumberData: string;
  skor: number;
  komponen: KomponenSkor[];
  metodeVersi: string;
  dataUji: boolean;
};

/** Menandai baris yang berasal dari data uji, bukan data resmi. */
export function isDataUji(sumberData: string): boolean {
  return /data uji|uji verifikasi|dummy|contoh/i.test(sumberData);
}

function rasio(pembilang: number, penyebut: number): number {
  if (!penyebut || penyebut <= 0) return 0;
  return Math.min(100, Math.max(0, (pembilang / penyebut) * 100));
}

/** Bobot dinormalisasi agar totalnya 1; bobot negatif diabaikan. */
export function normalisasiBobot(bobot: BobotSkor): BobotSkor {
  const bersih: BobotSkor = {
    ekstrem: Math.max(0, bobot.ekstrem),
    desil1: Math.max(0, bobot.desil1),
    desil123: Math.max(0, bobot.desil123),
  };
  const total = bersih.ekstrem + bersih.desil1 + bersih.desil123;
  if (total <= 0) return { ...BOBOT_DEFAULT };
  return {
    ekstrem: bersih.ekstrem / total,
    desil1: bersih.desil1 / total,
    desil123: bersih.desil123 / total,
  };
}

/**
 * Menghitung skor kerentanan satu wilayah pada satu periode.
 * Deterministik: masukan sama selalu menghasilkan skor sama.
 */
export function hitungSkor(
  data: AgregatWilayah,
  bobot: BobotSkor = BOBOT_DEFAULT,
): HasilSkor {
  const w = normalisasiBobot(bobot);
  const nilai: Record<keyof BobotSkor, number> = {
    ekstrem: rasio(data.jumlahKkMiskinEkstrem, data.jumlahKkTotal),
    desil1: rasio(data.jumlahKkDesil1, data.jumlahKkTotal),
    desil123: rasio(
      data.jumlahKkDesil1 + data.jumlahKkDesil2 + data.jumlahKkDesil3,
      data.jumlahKkTotal,
    ),
  };

  const komponen: KomponenSkor[] = META_INDIKATOR.map((meta) => ({
    key: meta.key,
    label: meta.label,
    penjelasan: meta.penjelasan,
    nilai: nilai[meta.key],
    bobot: w[meta.key],
    kontribusi: nilai[meta.key] * w[meta.key],
  }));

  return {
    wilayahId: data.wilayahId,
    periode: data.periode,
    sumberData: data.sumberData,
    // Skor = jumlah kontribusi, sehingga breakdown selalu konsisten.
    skor: komponen.reduce((s, k) => s + k.kontribusi, 0),
    komponen,
    metodeVersi: METODE_VERSI,
    dataUji: isDataUji(data.sumberData),
  };
}

export function hitungSkorBanyak(
  rows: AgregatWilayah[],
  bobot: BobotSkor = BOBOT_DEFAULT,
): HasilSkor[] {
  return rows.map((r) => hitungSkor(r, bobot)).sort((a, b) => b.skor - a.skor);
}

/** Tingkat kerentanan deskriptif; gradasi netral, tanpa stigmatisasi wilayah. */
export function tingkatSkor(skor: number): { label: string; className: string } {
  if (skor >= 40) return { label: "Prioritas utama", className: "bg-accent/25 text-accent-strong" };
  if (skor >= 25) return { label: "Prioritas tinggi", className: "bg-accent/15 text-accent-strong" };
  if (skor >= 12) return { label: "Prioritas sedang", className: "bg-muted text-foreground" };
  return { label: "Prioritas rendah", className: "bg-muted text-muted-foreground" };
}
