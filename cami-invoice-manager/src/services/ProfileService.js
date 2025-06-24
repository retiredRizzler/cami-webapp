// src/services/ProfileService.js
import { supabase } from '@/lib/supabaseClient.js'

export class ProfileService {

  /**
   * Get instructor profile for the current user
   */
  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('instructor_profile')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If no profile exists, return null (not an error)
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching instructor profile:', error)
      throw error
    }
  }

  /**
   * Create a new instructor profile
   */
  async createProfile(profileData) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Validate input data
      const validation = this.validateProfileData(profileData)
      if (!validation.isValid) {
        throw new Error(`Profile validation failed: ${validation.errors.join(', ')}`)
      }

      // Prepare data with user_id
      const dataToInsert = {
        ...this._prepareProfileData(profileData),
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('instructor_profile')
        .insert([dataToInsert])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating instructor profile:', error)
      throw error
    }
  }

  /**
   * Update existing instructor profile
   */
  async updateProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Validate input data
      const validation = this.validateProfileData(profileData)
      if (!validation.isValid) {
        throw new Error(`Profile validation failed: ${validation.errors.join(', ')}`)
      }

      const dataToUpdate = {
        ...this._prepareProfileData(profileData),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('instructor_profile')
        .update(dataToUpdate)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating instructor profile:', error)
      throw error
    }
  }

  /**
   * Create or update profile (upsert functionality)
   */
  async saveProfile(profileData) {
    try {
      const existingProfile = await this.getProfile()

      if (existingProfile) {
        return await this.updateProfile(profileData)
      } else {
        return await this.createProfile(profileData)
      }
    } catch (error) {
      console.error('Error saving instructor profile:', error)
      throw error
    }
  }

  /**
   * Delete instructor profile
   */
  async deleteProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('instructor_profile')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting instructor profile:', error)
      throw error
    }
  }

  /**
   * Check if profile is complete for invoice generation
   */
  async isProfileComplete() {
    try {
      const profile = await this.getProfile()
      if (!profile) return false

      // Required fields for invoice generation
      const requiredFields = [
        'business_name', 'first_name', 'last_name', 'email'
      ]

      return requiredFields.every(field =>
        profile[field] && profile[field].toString().trim() !== ''
      )
    } catch (error) {
      console.error('Error checking profile completeness:', error)
      return false
    }
  }

  /**
   * Get profile completion status with details
   */
  async getProfileCompletionStatus() {
    try {
      const profile = await this.getProfile()

      if (!profile) {
        return {
          isComplete: false,
          completionPercentage: 0,
          missingRequiredFields: ['All fields'],
          missingOptionalFields: [],
          hasProfile: false
        }
      }

      const requiredFields = [
        { key: 'business_name', label: 'Business Name' },
        { key: 'first_name', label: 'First Name' },
        { key: 'last_name', label: 'Last Name' },
        { key: 'email', label: 'Email' }
      ]

      const optionalFields = [
        { key: 'phone', label: 'Phone' },
        { key: 'address', label: 'Address' },
        { key: 'city', label: 'City' },
        { key: 'postal_code', label: 'Postal Code' },
        { key: 'country', label: 'Country' },
        { key: 'vat_number', label: 'VAT Number' },
        { key: 'license_number', label: 'License Number' },
        { key: 'iban', label: 'IBAN' },
        { key: 'bic', label: 'BIC' },
        { key: 'bank_name', label: 'Bank Name' }
      ]

      const missingRequired = requiredFields.filter(field =>
        !profile[field.key] || profile[field.key].toString().trim() === ''
      )

      const missingOptional = optionalFields.filter(field =>
        !profile[field.key] || profile[field.key].toString().trim() === ''
      )

      const totalFields = requiredFields.length + optionalFields.length
      const completedFields = totalFields - missingRequired.length - missingOptional.length
      const completionPercentage = Math.round((completedFields / totalFields) * 100)

      return {
        isComplete: missingRequired.length === 0,
        completionPercentage,
        missingRequiredFields: missingRequired.map(f => f.label),
        missingOptionalFields: missingOptional.map(f => f.label),
        hasProfile: true
      }
    } catch (error) {
      console.error('Error getting profile completion status:', error)
      return {
        isComplete: false,
        completionPercentage: 0,
        missingRequiredFields: ['Error loading profile'],
        missingOptionalFields: [],
        hasProfile: false
      }
    }
  }

  /**
   * Upload logo file (placeholder for future Supabase Storage integration)
   */
  async uploadLogo(file) {
    try {
      // TODO: Implement Supabase Storage upload
      // For now, return a placeholder URL
      console.warn('Logo upload not yet implemented')
      return {
        url: null,
        message: 'Logo upload will be available in a future update'
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      throw error
    }
  }

  /**
   * Validate profile data
   */
  validateProfileData(data) {
    const errors = []

    // Required fields validation
    if (!data.business_name || !data.business_name.trim()) {
      errors.push('Business name is required')
    }

    if (!data.first_name || !data.first_name.trim()) {
      errors.push('First name is required')
    }

    if (!data.last_name || !data.last_name.trim()) {
      errors.push('Last name is required')
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required')
    }

    // Optional field validations
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone format')
    }

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format')
    }

    if (data.iban && !this.isValidIBAN(data.iban)) {
      errors.push('Invalid IBAN format')
    }

    if (data.vat_number && !this.isValidBelgianVAT(data.vat_number)) {
      errors.push('Invalid Belgian VAT format (should be BE followed by 10 digits)')
    }

    if (data.default_tax_rate !== undefined) {
      const taxRate = parseFloat(data.default_tax_rate)
      if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        errors.push('Tax rate must be between 0 and 100')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Private method to prepare profile data for database insertion
   */
  _prepareProfileData(data) {
    const cleanedData = {}

    // List of all possible fields
    const fields = [
      'business_name', 'first_name', 'last_name', 'email', 'phone',
      'address', 'city', 'postal_code', 'country', 'vat_number', 'license_number',
      'iban', 'bic', 'bank_name', 'default_payment_terms', 'default_tax_rate', 'logo_url'
    ]

    fields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        const value = data[field]

        // Convert empty strings to null for optional fields, keep required fields as-is
        if (value === '' || value === undefined) {
          cleanedData[field] = ['business_name', 'first_name', 'last_name', 'email'].includes(field)
            ? value
            : null
        } else {
          cleanedData[field] = value
        }
      }
    })

    // Ensure default values for specific fields
    if (!cleanedData.country) {
      cleanedData.country = 'Belgium'
    }

    if (!cleanedData.default_tax_rate) {
      cleanedData.default_tax_rate = 21.00
    }

    if (!cleanedData.default_payment_terms) {
      cleanedData.default_payment_terms = 'Payment due within 30 days'
    }

    return cleanedData
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
   * Helper function to validate IBAN format (basic)
   */
  isValidIBAN(iban) {
    // Basic IBAN validation - should start with 2 letters and be 15-34 characters
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/
    return ibanRegex.test(iban.replace(/\s/g, '').toUpperCase())
  }

  /**
   * Helper function to validate Belgian VAT number
   */
  isValidBelgianVAT(vat) {
    // Belgian VAT format: BE + 10 digits
    const vatRegex = /^BE[0-9]{10}$/
    return vatRegex.test(vat.replace(/\s/g, '').toUpperCase())
  }

  /**
   * Get default profile data based on authenticated user
   */
  async getDefaultProfileData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const userData = user.user_metadata || {}

      return {
        business_name: 'Driving School Pro',
        first_name: userData.name?.split(' ')[0] || '',
        last_name: userData.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: 'Belgium',
        vat_number: '',
        license_number: '',
        iban: '',
        bic: '',
        bank_name: '',
        default_payment_terms: 'Payment due within 30 days',
        default_tax_rate: 21.00,
        logo_url: null
      }
    } catch (error) {
      console.error('Error getting default profile data:', error)
      throw error
    }
  }
}
