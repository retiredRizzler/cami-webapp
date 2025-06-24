// src/services/ServiceTypesService.js
import { supabase } from '@/lib/supabaseClient.js'

export class ServiceTypesService {

  /**
   * Get all service types for the current user
   */
  async getServiceTypes() {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching service types:', error)
      throw error
    }
  }

  /**
   * Create a new service type
   */
  async createServiceType(serviceTypeData, userId) {
    try {
      if (!userId) throw new Error('User ID is required')

      const dataToInsert = {
        ...serviceTypeData,
        user_id: userId
      }

      const { data, error } = await supabase
        .from('service_types')
        .insert([dataToInsert])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating service type:', error)
      throw error
    }
  }

  /**
   * Update an existing service type
   */
  async updateServiceType(id, serviceTypeData) {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .update(serviceTypeData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating service type:', error)
      throw error
    }
  }

  /**
   * Delete a service type
   */
  async deleteServiceType(id) {
    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting service type:', error)
      throw error
    }
  }

  /**
   * Validate service type data
   */
  validateServiceTypeData(data) {
    const errors = []

    if (!data.name || !data.name.trim()) {
      errors.push('Service name is required')
    }

    if (!data.category) {
      errors.push('Category is required')
    }

    if (!data.pricing_type) {
      errors.push('Pricing type is required')
    }

    if (!data.unit_price || data.unit_price <= 0) {
      errors.push('Valid unit price is required')
    }

    if (data.default_duration_hours !== undefined && data.default_duration_hours < 0) {
      errors.push('Duration must be 0 or greater')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
