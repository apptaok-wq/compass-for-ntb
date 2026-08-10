export interface PovertyStats {
  totalKk: number
  kkEkstrem: number
  rasioEkstrem: number
  periode: string
  totalDesa: number
  totalMiskin: number
  persentaseMiskin: number
  garisKemiskinan: number
}

export interface TrendData {
  year: number
  value: number
}

export interface KabupatenData {
  name: string
  value: number
}

export interface DesaData {
  name: string
  totalPoor: number
  percentage: number
}

export interface DesaGeoData {
  id: string
  name: string
  latitude: number
  longitude: number
  totalPoor: number
  percentage: number
  year: number
  month: number
}
