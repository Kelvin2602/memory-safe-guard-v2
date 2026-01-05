import { useState, useEffect, useCallback, useMemo } from 'react';
import { dbManager, PasswordEntry } from '@/lib/db/db';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook để quản lý mật khẩu với IndexedDB
 * 
 * Cung cấp CRUD operations cho passwords với error handling và toast notifications
 * Sử dụng optimistic updates để cải thiện UX
 */

// Types cho hook operations
type PasswordInput = Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>;

interface UsePasswordsReturn {
  passwords: PasswordEntry[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    hasPasswords: boolean;
  };
  fetchPasswords: () => Promise<void>;
  searchPasswords: (query: string) => Promise<void>;
  addPassword: (entry: PasswordInput) => Promise<PasswordEntry>;
  updatePassword: (id: string, entry: PasswordInput) => Promise<PasswordEntry | null>;
  deletePassword: (id: string) => Promise<boolean>;
}

export function usePasswords(): UsePasswordsReturn {
  // State hooks - đảm bảo thứ tự nhất quán
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Toast hook
  const { toast } = useToast();

  /**
   * Helper function để xử lý lỗi một cách nhất quán
   */
  const handleError = useCallback((error: unknown, message: string) => {
    console.error('Password operation error:', error);
    setError(message);
    toast({
      title: 'Lỗi',
      description: message,
      variant: 'destructive',
    });
  }, [toast]);

  /**
   * Helper function để hiển thị thông báo thành công
   */
  const showSuccess = useCallback((message: string) => {
    toast({
      title: 'Thành công',
      description: message,
    });
  }, [toast]);

  /**
   * Lấy tất cả mật khẩu từ IndexedDB
   */
  const fetchPasswords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dbManager.getAllPasswords();
      setPasswords(data);
    } catch (err) {
      handleError(err, 'Không thể lấy danh sách mật khẩu');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  /**
   * Tìm kiếm mật khẩu theo service hoặc username
   */
  const searchPasswords = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = query.trim() 
        ? await dbManager.searchPasswords(query)
        : await dbManager.getAllPasswords();
      
      setPasswords(data);
    } catch (err) {
      handleError(err, 'Không thể tìm kiếm mật khẩu');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  /**
   * Thêm mật khẩu mới
   */
  const addPassword = useCallback(async (entry: PasswordInput): Promise<PasswordEntry> => {
    try {
      const newEntry = await dbManager.addPassword(entry);
      setPasswords((prev) => [newEntry, ...prev]);
      showSuccess('Mật khẩu mới đã được thêm thành công');
      return newEntry;
    } catch (err) {
      handleError(err, 'Không thể thêm mật khẩu mới');
      throw err;
    }
  }, [handleError, showSuccess]);

  /**
   * Cập nhật mật khẩu
   */
  const updatePassword = useCallback(async (id: string, entry: PasswordInput): Promise<PasswordEntry | null> => {
    try {
      const updatedEntry = await dbManager.updatePassword(id, entry);
      if (updatedEntry) {
        setPasswords((prev) =>
          prev.map((item) => (item.id === id ? updatedEntry : item))
        );
        showSuccess('Mật khẩu đã được cập nhật thành công');
        return updatedEntry;
      }
      return null;
    } catch (err) {
      handleError(err, 'Không thể cập nhật mật khẩu');
      throw err;
    }
  }, [handleError, showSuccess]);

  /**
   * Xóa mật khẩu
   */
  const deletePassword = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await dbManager.deletePassword(id);
      if (success) {
        setPasswords((prev) => prev.filter((entry) => entry.id !== id));
        showSuccess('Mật khẩu đã được xóa');
        return true;
      }
      return false;
    } catch (err) {
      handleError(err, 'Không thể xóa mật khẩu');
      throw err;
    }
  }, [handleError, showSuccess]);

  /**
   * Computed stats - sử dụng useMemo để tối ưu performance
   */
  const stats = useMemo(() => ({
    total: passwords.length,
    hasPasswords: passwords.length > 0,
  }), [passwords.length]);

  /**
   * Effect để lấy dữ liệu khi component mount
   * Chỉ chạy một lần
   */
  useEffect(() => {
    fetchPasswords();
  }, []); // Empty dependency array - chỉ chạy một lần

  return {
    passwords,
    loading,
    error,
    stats,
    fetchPasswords,
    searchPasswords,
    addPassword,
    updatePassword,
    deletePassword,
  };
}