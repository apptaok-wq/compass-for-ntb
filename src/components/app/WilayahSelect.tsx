import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type WilayahOption = {
  id: string;
  nama: string;
  jenis: string;
  kodeBps: string;
  parentId: string | null;
};

const JENIS_LABEL: Record<string, string> = {
  provinsi: "Provinsi",
  kabupaten: "Kabupaten",
  kota: "Kota",
  kecamatan: "Kecamatan",
  desa: "Desa",
};

export function labelWilayah(w: WilayahOption): string {
  return `${JENIS_LABEL[w.jenis] ?? w.jenis} ${w.nama}`;
}

export function useWilayahList() {
  return useQuery<WilayahOption[]>({
    queryKey: ["wilayah-list"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wilayah")
        .select("id, nama, jenis, kode_bps, parent_id")
        .order("kode_bps");
      if (error) throw error;
      return (data ?? []).map((w) => ({
        id: w.id,
        nama: w.nama,
        jenis: w.jenis as string,
        kodeBps: w.kode_bps,
        parentId: w.parent_id,
      }));
    },
  });
}

/** Pemilih wilayah yang dapat dipakai ulang lintas modul. */
export function WilayahSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Pilih wilayah",
  disabled,
}: {
  options: WilayahOption[];
  value: string | null;
  onChange: (id: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <Select
        {...(value ? { value } : {})}
        onValueChange={onChange}
        disabled={disabled ?? false}
      >

        <SelectTrigger className="w-full sm:w-72">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {labelWilayah(w)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
