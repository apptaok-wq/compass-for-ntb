// Types for poverty data domain
export interface PovertyData {
  id: string
  desa_id: string
  data_source_id: string
  year: number
  month?: number
  total_poor: number
  percentage: number
  poverty_line: number
  population: number
  created_at: string
  updated_at: string
}

export interface PovertyStats {
  totalPoor: number
  percentagePoor: number
  desaCount: number
  averagePovertyLine: number
  lastUpdated: string
}

export interface TrendData {
  year: number
  value: number
  month?: number
}

export interface KabupatenData {
  name: string
  value: number
  percentage: number
}

export interface DesaData {
  id: string
  name: string
  value: number
  percentage: number
  population: number
}

export interface DashboardData {
  stats: PovertyStats
  trendData: TrendData[]
  kabupatenData: KabupatenData[]
  topDesaData: DesaData[]
}
