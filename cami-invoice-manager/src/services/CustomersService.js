// src/services/CustomersService.js
import { supabase } from '@/lib/supabaseClient.js'

export class CustomersService {

  /**
   * Get all customers for the current user
   */
  async getCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          invoices:invoices(id, total_amount, status),
          lessons:lessons(id, status)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Add computed fields for display
      const customersWithStats = data.map(customer => ({
        ...customer,
        total_invoices: customer.invoices?.length || 0,
        total_billed: customer.invoices?.reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0) || 0,
        total_lessons: customer.lessons?.length || 0,
        completed_lessons: customer.lessons?.filter(lesson => lesson.status === 'completed').length || 0,
        display_name: customer.client_type === 'company'
          ? customer.company_name
          : `${customer.first_name} ${customer.last_name}`
      }))

      return customersWithStats
    } catch (error) {
      console.error('Error fetching customers:', error)
      throw error
    }
  }

  /**
   * Get a single customer by ID
   */
  async getCustomer(id) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          invoices:invoices(id, invoice_number, total_amount, status, invoice_date),
          lessons:lessons(id, scheduled_date, status, duration_hours)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching customer:', error)
      throw error
    }
  }

  /**
   * Create a new customer
   */
  async createCustomer(customerData) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Prepare data with user_id
      const dataToInsert = {
        ...customerData,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([dataToInsert])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(id, customerData) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(id) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting customer:', error)
      throw error
    }
  }

  /**
   * Validate customer data based on client type
   */
  validateCustomerData(data) {
    const errors = []

    // Common validations
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required')
    }

    if (!data.client_type) {
      errors.push('Client type is required')
    }

    // Type-specific validations
    if (data.client_type === 'individual') {
      if (!data.first_name?.trim()) errors.push('First name is required for individuals')
      if (!data.last_name?.trim()) errors.push('Last name is required for individuals')
    }

    if (data.client_type === 'company') {
      if (!data.company_name?.trim()) errors.push('Company name is required for companies')
    }

    // Phone validation if provided
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone format')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Helper function to validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    return emailRegex.test(email)
  }

  /**
   * Helper function to validate phone format
   */
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/
    return phoneRegex.test(phone)
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          client_type,
          invoices:invoices(total_amount, status),
          lessons:lessons(id, status)
        `)

      if (error) throw error

      const stats = {
        total_customers: data.length,
        individual_customers: data.filter(c => c.client_type === 'individual').length,
        company_customers: data.filter(c => c.client_type === 'company').length,
        total_revenue: data.reduce((sum, customer) => {
          return sum + customer.invoices.reduce((invSum, inv) => {
            return invSum + (inv.status === 'paid' ? parseFloat(inv.total_amount) || 0 : 0)
          }, 0)
        }, 0),
        total_lessons: data.reduce((sum, customer) => sum + customer.lessons.length, 0)
      }

      return stats
    } catch (error) {
      console.error('Error fetching customer stats:', error)
      throw error
    }
  }
}
