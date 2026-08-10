import { supabase } from '@/integrations/supabase/client'
import type { PovertyStats, TrendData, KabupatenData, DesaData, DesaGeoData } from '@/types/poverty'

export const povertyService = {
  async getStats(): Promise<PovertyStats> {
    const { data, error } = await supabase
      .from('poverty_data')
      .select('*')
      .eq('year', new Date().getFullYear())
      .limit(10000)

    if (error) throw error

    const rows = data ?? []

    const totalKk = rows.reduce((sum: number, d: any) => sum + (d.total_kk ?? 0), 0)
    const totalMiskin = rows.reduce((sum: number, d: any) => sum + (d.total_poor ?? 0), 0)

    // Count desa with kk miskin ekstrem > 0 as kkEkstrem (fallback)
    const kkEkstrem = rows.reduce((cnt: number, d: any) => cnt + (d.jumlah_kk_miskin_ekstrem ? 1 : 0), 0)

    const totalDesa = rows.length
    const rasioEkstrem = totalDesa > 0 ? (kkEkstrem / totalDesa) * 100 : 0
    const persentaseMiskin = totalKk > 0 ? (totalMiskin / totalKk) * 100 : 0

    return {
      totalKk,
      kkEkstrem,
      rasioEkstrem,
      periode: String(new Date().getFullYear()),
      totalDesa,
      totalMiskin,
      persentaseMiskin,
      garisKemiskinan: 606951,
    }
  },

  async getTrendData(): Promise<TrendData[]> {
    const { data, error } = await supabase
      .from('poverty_data')
      .select('year, total_poor')
      .order('year', { ascending: true })

    if (error) throw error

    const trends: Record<number, number> = {}
    for (const row of data ?? []) {
      const y = row.year
      trends[y] = (trends[y] || 0) + (row.total_poor ?? 0)
    }

    return Object.entries(trends)
      .map(([year, value]) => ({ year: parseInt(year, 10), value }))
      .sort((a, b) => a.year - b.year)
  },

  async getKabupatenData(): Promise<KabupatenData[]> {
    // Aggregate by kabupaten_name if available
    const { data, error } = await supabase
      .from('poverty_data')
      .select('kabupaten_id, kabupaten_name, total_poor')
      .eq('year', new Date().getFullYear())
      .limit(10000)

    if (error) throw error

    const map: Record<string, number> = {}
    for (const row of data ?? []) {
      const name = row.kabupaten_name ?? 'Unknown'
      map[name] = (map[name] || 0) + (row.total_poor ?? 0)
    }

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  },

  async getDesaData(limit = 10): Promise<DesaData[]> {
    const { data, error } = await supabase
      .from('poverty_data')
      .select('desa_id, desa_name, total_poor, percentage')
      .eq('year', new Date().getFullYear())
      .order('percentage', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data ?? []).map((d: any) => ({
      name: d.desa_name ?? d.desa_id ?? 'Unknown',
      totalPoor: d.total_poor ?? 0,
      percentage: d.percentage ?? 0,
    }))
  },

  async getDesaGeoData(filters?: { year?: number; kabupatenId?: string }): Promise<DesaGeoData[]> {
    const year = filters?.year ?? new Date().getFullYear()

    let query: any = supabase
      .from('poverty_data')
      .select(`
        year,
        month,
        total_poor,
        percentage,
        desa_id,
        desa_name,
        latitude,
        longitude
      `)
      .eq('year', year)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (filters?.kabupatenId) {
      query = query.eq('kabupaten_id', filters.kabupatenId)
    }

    const { data, error } = await query.limit(10000)
    if (error) throw error

    return (data ?? []).map((item: any) => ({
      id: String(item.desa_id ?? item.id ?? ''),
      name: item.desa_name ?? 'Unknown',
      latitude: Number(item.latitude ?? 0),
      longitude: Number(item.longitude ?? 0),
      totalPoor: item.total_poor ?? 0,
      percentage: item.percentage ?? 0,
      year: item.year ?? year,
      month: item.month ?? 0,
    }))
  },
}
