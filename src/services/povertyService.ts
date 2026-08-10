import { supabase } from '@/integrations/supabase/client'
import type { PovertyStats, TrendData, KabupatenData, DesaData } from '@/types/poverty'

/**
 * Poverty Data Service
 * Handles all data fetching and aggregation for poverty statistics
 */
export const povertyService = {
  /**
   * Fetch aggregated poverty statistics
   */
  async getStats(): Promise<PovertyStats> {
    try {
      // Get the latest poverty data records
      const { data, error } = await supabase
        .from('poverty_data')
        .select('total_poor, percentage, poverty_line, population')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          totalPoor: 0,
          percentagePoor: 0,
          desaCount: 0,
          averagePovertyLine: 0,
          lastUpdated: new Date().toISOString(),
        }
      }

      // Calculate aggregated stats
      const totalPoor = data.reduce((sum, d) => sum + (d.total_poor || 0), 0)
      const avgPercentage =
        data.reduce((sum, d) => sum + (d.percentage || 0), 0) / data.length
      const avgPovertyLine =
        data.reduce((sum, d) => sum + (d.poverty_line || 0), 0) / data.length

      return {
        totalPoor,
        percentagePoor: parseFloat(avgPercentage.toFixed(2)),
        desaCount: data.length,
        averagePovertyLine: parseFloat(avgPovertyLine.toFixed(2)),
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Error fetching poverty stats:', error)
      return {
        totalPoor: 0,
        percentagePoor: 0,
        desaCount: 0,
        averagePovertyLine: 0,
        lastUpdated: new Date().toISOString(),
      }
    }
  },

  /**
   * Fetch trend data for charts (yearly aggregation)
   */
  async getTrendData(): Promise<TrendData[]> {
    try {
      const { data, error } = await supabase
        .from('poverty_data')
        .select('year, percentage')
        .order('year', { ascending: true })

      if (error) throw error

      if (!data || data.length === 0) {
        return []
      }

      // Group by year and calculate average
      const yearMap = new Map<number, number[]>()

      data.forEach((record) => {
        if (!yearMap.has(record.year)) {
          yearMap.set(record.year, [])
        }
        yearMap.get(record.year)!.push(record.percentage || 0)
      })

      const trendData: TrendData[] = Array.from(yearMap.entries()).map(
        ([year, percentages]) => ({
          year,
          value: parseFloat(
            (
              percentages.reduce((a, b) => a + b, 0) / percentages.length
            ).toFixed(2)
          ),
        })
      )

      return trendData
    } catch (error) {
      console.error('Error fetching trend data:', error)
      return []
    }
  },

  /**
   * Fetch kabupaten/kota comparison data
   */
  async getKabupatenData(): Promise<KabupatenData[]> {
    try {
      // Note: This assumes there's a kabupaten column or related table
      // Adjust query based on your actual schema
      const { data, error } = await supabase
        .from('poverty_data')
        .select('percentage')
        .order('percentage', { ascending: false })
        .limit(10)

      if (error) throw error

      if (!data || data.length === 0) {
        return []
      }

      // Generate sample kabupaten data (replace with actual data when schema is available)
      const kabupatenNames = [
        'Lombok Utara',
        'Lombok Tengah',
        'Lombok Timur',
        'Lombok Barat',
        'Kota Mataram',
        'Kota Bima',
      ]

      const kabupatenData: KabupatenData[] = kabupatenNames.map(
        (name, index) => ({
          name,
          value: Math.floor(Math.random() * 100000) + 10000,
          percentage: parseFloat((Math.random() * 30 + 5).toFixed(2)),
        })
      )

      return kabupatenData
    } catch (error) {
      console.error('Error fetching kabupaten data:', error)
      return []
    }
  },

  /**
   * Fetch top N desa by poverty percentage
   */
  async getDesaData(limit: number = 10): Promise<DesaData[]> {
    try {
      const { data, error } = await supabase
        .from('poverty_data')
        .select('id, percentage, population, total_poor')
        .order('percentage', { ascending: false })
        .limit(limit)

      if (error) throw error

      if (!data || data.length === 0) {
        return []
      }

      const desaData: DesaData[] = data.map((record, index) => ({
        id: record.id,
        name: `Desa ${index + 1}`, // Replace with actual desa names when schema is available
        value: record.total_poor || 0,
        percentage: parseFloat((record.percentage || 0).toFixed(2)),
        population: record.population || 0,
      }))

      return desaData
    } catch (error) {
      console.error('Error fetching desa data:', error)
      return []
    }
  },

  /**
   * Fetch all poverty data with optional filtering
   */
  async getPovertyData(filters?: {
    year?: number
    month?: number
    limit?: number
  }) {
    try {
      let query = supabase.from('poverty_data').select('*')

      if (filters?.year) {
        query = query.eq('year', filters.year)
      }

      if (filters?.month) {
        query = query.eq('month', filters.month)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 50)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching poverty data:', error)
      return []
    }
  },
}
