import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  bappeda_provinsi: "Bappeda Provinsi",
  dinas_sosial: "Dinas Sosial",
  pemkab_kota: "Pemerintah Kabupaten/Kota",
  kominfo: "Diskominfotik",
  opd_teknis: "OPD Teknis",
  akademisi: "Akademisi",
  mitra_pembangunan: "Mitra Pembangunan",
};

export const ALL_ROLES: AppRole[] = Object.keys(ROLE_LABELS) as AppRole[];

export type NavItem = {
  to: string;
  label: string;
  description: string;
  roles: AppRole[] | "all";
};

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dasbor GIS",
    description: "Peta tematik dan ringkasan indikator wilayah",
    roles: "all",
  },
  {
    to: "/skor-kerentanan",
    label: "Skor Kerentanan",
    description: "Komposit terbobot tingkat kerentanan wilayah",
    roles: "all",
  },
  {
    to: "/monitoring-evaluasi",
    label: "Monitoring & Evaluasi",
    description: "Pemantauan capaian program penanggulangan kemiskinan",
    roles: [
      "super_admin",
      "bappeda_provinsi",
      "dinas_sosial",
      "pemkab_kota",
      "opd_teknis",
      "kominfo",
    ],
  },
  {
    to: "/rekomendasi-program",
    label: "Rekomendasi Program",
    description: "Usulan intervensi berbasis profil wilayah",
    roles: ["super_admin", "bappeda_provinsi", "dinas_sosial", "pemkab_kota", "opd_teknis"],
  },
  {
    to: "/policy-brief",
    label: "Policy Brief",
    description: "Ringkasan kebijakan siap terbit",
    roles: ["super_admin", "bappeda_provinsi", "dinas_sosial", "akademisi", "mitra_pembangunan"],
  },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    to: "/admin/pengguna",
    label: "Manajemen Pengguna",
    description: "Kelola akun, peran, dan cakupan wilayah",
    roles: ["super_admin"],
  },
  {
    to: "/admin/impor-data",
    label: "Impor Data Agregat",
    description: "Unggah berkas CSV data agregat kesejahteraan",
    roles: ["super_admin"],
  },
  {
    to: "/admin/audit",
    label: "Jejak Audit",
    description: "Riwayat aktivitas pengguna sistem",
    roles: ["super_admin", "kominfo"],
  },
  {
    to: "/admin/performa",
    label: "Performa Aplikasi",
    description: "Metrik pengalaman pengguna nyata",
    roles: ["super_admin", "kominfo"],
  },
];

export function canAccess(item: NavItem, role: AppRole | null | undefined): boolean {
  if (!role) return false;
  if (item.roles === "all") return true;
  return item.roles.includes(role);
}

export function canAccessPath(path: string, role: AppRole | null | undefined): boolean {
  const item = [...NAV_ITEMS, ...ADMIN_NAV_ITEMS].find((i) => i.to === path);
  if (!item) return true;
  return canAccess(item, role);
}
