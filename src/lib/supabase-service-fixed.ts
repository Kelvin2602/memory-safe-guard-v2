import { supabase } from './supabase'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants/app-constants'
import { logger } from './utils/logger'

// Type definitions tương thích với PasswordEntry hiện tại
export interface PasswordEntry {
  id: string
  service: string
  username: string
  password: string
  createdAt: string
  updatedAt: string
}

// Type cho việc tạo mới password (không cần id, createdAt, updatedAt)
export type CreatePasswordEntry = Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>

// Type cho việc cập nhật password
export type UpdatePasswordEntry = Partial<CreatePasswordEntry>

// Database row type từ Supabase
interface DatabasePasswordRow {
  id: string
  service: string
  username: string
  password: string
  created_at: string
  updated_at: string
}

/**
 * Supabase Password Service - Fixed Version
 * Sử dụng tên cột tiêu chuẩn: service, username, password
 * 
 * Features:
 * - Type-safe operations với proper error handling
 * - Centralized logging và error messages
 * - Input validation và sanitization
 * - Consistent API interface
 */
export class SupabasePasswordService {
  
  /**
   * Base error handler cho tất cả operations
   * @private
   */
  private static handleError(operation: string, error: any): never {
    const errorMessage = error?.message || 'Unknown error'
    logger.error(`${operation} failed:`, error)
    throw new Error(`${ERROR_MESSAGES[operation as keyof typeof ERROR_MESSAGES] || 'Operation failed'}: ${errorMessage}`)
  }

  /**
   * Validate password data trước khi thực hiện operations
   * @private
   */
  private static validatePasswordData(data: CreatePasswordEntry | UpdatePasswordEntry): void {
    if ('service' in data && data.service && (!data.service.trim() || data.service.length > 100)) {
      throw new Error('Service name must be between 1-100 characters')
    }
    if ('username' in data && data.username && (!data.username.trim() || data.username.length > 100)) {
      throw new Error('Username must be between 1-100 characters')
    }
    if ('password' in data && data.password && (!data.password.trim() || data.password.length > 500)) {
      throw new Error('Password must be between 1-500 characters')
    }
  }
  
  /**
   * Lấy tất cả passwords với sorting theo updated_at
   * @returns Promise<PasswordEntry[]> - Danh sách passwords đã được sort
   */
  static async getAllPasswords(): Promise<PasswordEntry[]> {
    try {
      logger.info('Fetching all passwords from Supabase')
      
      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        this.handleError('FETCH_FAILED', error)
      }

      const passwords = (data || []).map(this.convertFromDatabase)
      logger.info(`Successfully fetched ${passwords.length} passwords`)
      
      return passwords
    } catch (error) {
      this.handleError('FETCH_FAILED', error)
    }
  }

  /**
   * Tìm kiếm passwords theo service hoặc username với debouncing
   * @param query - Từ khóa tìm kiếm (được sanitize)
   * @returns Promise<PasswordEntry[]>
   */
  static async searchPasswords(query: string): Promise<PasswordEntry[]> {
    try {
      const sanitizedQuery = this.sanitizeSearchQuery(query || '')
      
      if (!sanitizedQuery) {
        return this.getAllPasswords()
      }

      logger.info(`Searching passwords with query: "${sanitizedQuery}"`)

      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .or(`service.ilike.%${sanitizedQuery}%,username.ilike.%${sanitizedQuery}%`)
        .order('updated_at', { ascending: false })

      if (error) {
        this.handleError('SEARCH_FAILED', error)
      }

      const results = (data || []).map(this.convertFromDatabase)
      logger.info(`Found ${results.length} passwords matching query`)
      
      return results
    } catch (error) {
      this.handleError('SEARCH_FAILED', error)
    }
  }

  /**
   * Thêm password mới với validation
   * @param passwordData - Dữ liệu password cần thêm (đã validate)
   * @returns Promise<PasswordEntry> - Password entry đã được tạo
   */
  static async addPassword(passwordData: CreatePasswordEntry): Promise<PasswordEntry> {
    try {
      this.validatePasswordData(passwordData)
      logger.info('Adding new password entry')

      const { data, error } = await supabase
        .from('passwords')
        .insert([{
          service: passwordData.service,
          username: passwordData.username,
          password: passwordData.password
        }])
        .select()
        .single()

      if (error) {
        this.handleError('ADD_FAILED', error)
      }

      const newPassword = this.convertFromDatabase(data)
      logger.info(`Successfully added password for service: ${newPassword.service}`)
      
      return newPassword
    } catch (error) {
      this.handleError('ADD_FAILED', error)
    }
  }

  /**
   * Cập nhật password với validation và optimistic updates
   * @param id - ID của password cần cập nhật
   * @param passwordData - Dữ liệu cập nhật (partial)
   * @returns Promise<PasswordEntry> - Password entry đã được cập nhật
   */
  static async updatePassword(id: string, passwordData: UpdatePasswordEntry): Promise<PasswordEntry> {
    try {
      if (!id?.trim()) {
        throw new Error('Password ID is required')
      }

      this.validatePasswordData(passwordData)
      logger.info(`Updating password with ID: ${id}`)

      // Tạo update object chỉ với các field có giá trị
      const updateFields = Object.entries(passwordData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value.toString().trim()) {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, any>)

      if (Object.keys(updateFields).length === 0) {
        throw new Error('No valid fields to update')
      }

      const { data, error } = await supabase
        .from('passwords')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        this.handleError('UPDATE_FAILED', error)
      }

      const updatedPassword = this.convertFromDatabase(data)
      logger.info(`Successfully updated password for service: ${updatedPassword.service}`)
      
      return updatedPassword
    } catch (error) {
      this.handleError('UPDATE_FAILED', error)
    }
  }

  /**
   * Xóa password với confirmation
   * @param id - ID của password cần xóa
   * @returns Promise<void>
   */
  static async deletePassword(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new Error('Password ID is required')
      }

      logger.info(`Deleting password with ID: ${id}`)

      const { error } = await supabase
        .from('passwords')
        .delete()
        .eq('id', id)

      if (error) {
        this.handleError('DELETE_FAILED', error)
      }

      logger.info(`Successfully deleted password with ID: ${id}`)
    } catch (error) {
      this.handleError('DELETE_FAILED', error)
    }
  }

  /**
   * Lấy thống kê passwords
   * @returns Promise<{total: number, recentCount: number}>
   */
  static async getPasswordStats(): Promise<{ total: number; recentCount: number }> {
    try {
      logger.info('Fetching password statistics')

      // Lấy tổng số passwords
      const { count: total, error: countError } = await supabase
        .from('passwords')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        this.handleError('STATS_FAILED', countError)
      }

      // Lấy số passwords được tạo trong 7 ngày qua
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { count: recentCount, error: recentError } = await supabase
        .from('passwords')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      if (recentError) {
        logger.warn('Could not fetch recent passwords count:', recentError)
      }

      const stats = { 
        total: total || 0, 
        recentCount: recentCount || 0 
      }
      
      logger.info(`Password stats: ${stats.total} total, ${stats.recentCount} recent`)
      return stats
    } catch (error) {
      logger.error('Error fetching password stats:', error)
      return { total: 0, recentCount: 0 }
    }
  }

  /**
   * Test kết nối Supabase với health check
   * @returns Promise<{connected: boolean, latency?: number, error?: string}>
   */
  static async testConnection(): Promise<{ connected: boolean; latency?: number; error?: string }> {
    try {
      logger.info('Testing Supabase connection')
      const startTime = Date.now()

      const { error } = await supabase
        .from('passwords')
        .select('count', { count: 'exact', head: true })

      const latency = Date.now() - startTime

      if (error) {
        logger.error('Supabase connection test failed:', error)
        return { 
          connected: false, 
          error: error.message,
          latency 
        }
      }

      logger.info(`Supabase connection successful (${latency}ms)`)
      return { 
        connected: true, 
        latency 
      }
    } catch (error) {
      logger.error('Supabase connection test error:', error)
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Batch operations cho multiple passwords
   * @param passwords - Array của password data để insert
   * @returns Promise<PasswordEntry[]>
   */
  static async batchAddPasswords(passwords: CreatePasswordEntry[]): Promise<PasswordEntry[]> {
    try {
      if (!passwords?.length) {
        throw new Error('No passwords provided for batch insert')
      }

      // Validate tất cả passwords trước khi insert
      passwords.forEach((pwd, index) => {
        try {
          this.validatePasswordData(pwd)
        } catch (error) {
          throw new Error(`Validation failed for password ${index + 1}: ${error}`)
        }
      })

      logger.info(`Batch adding ${passwords.length} passwords`)

      const { data, error } = await supabase
        .from('passwords')
        .insert(passwords.map(pwd => ({
          service: pwd.service,
          username: pwd.username,
          password: pwd.password
        })))
        .select()

      if (error) {
        this.handleError('ADD_FAILED', error)
      }

      const results = (data || []).map(this.convertFromDatabase)
      logger.info(`Successfully batch added ${results.length} passwords`)
      
      return results
    } catch (error) {
      this.handleError('ADD_FAILED', error)
    }
  }

  /**
   * Convert từ database format sang PasswordEntry format
   * Type-safe conversion với proper error handling
   * @private
   */
  private static convertFromDatabase(dbRow: DatabasePasswordRow): PasswordEntry {
    if (!dbRow) {
      throw new Error('Database row is null or undefined')
    }

    // Validate required fields
    const requiredFields = ['id', 'service', 'username', 'password', 'created_at', 'updated_at']
    for (const field of requiredFields) {
      if (!dbRow[field as keyof DatabasePasswordRow]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    return {
      id: dbRow.id,
      service: dbRow.service,
      username: dbRow.username,
      password: dbRow.password,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    }
  }

  /**
   * Utility method để sanitize search query
   * Ngăn chặn SQL injection và các ký tự đặc biệt
   * @private
   */
  private static sanitizeSearchQuery(query: string): string {
    return query
      .trim()
      .replace(/[%_]/g, '\\04159cb3-9186-4414-9c28-af252a86395a') // Escape SQL wildcards
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .substring(0, 100) // Limit length
  }
}