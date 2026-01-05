// Định nghĩa interface cho đối tượng mật khẩu
export interface PasswordEntry {
  id: string;
  service: string;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

// Lớp quản lý cơ sở dữ liệu sử dụng IndexedDB
export class DatabaseManager {
  private dbName = 'memorySafeGuardDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private static instance: DatabaseManager;

  private constructor() {
    // Khởi tạo cơ sở dữ liệu khi tạo instance
    this.initDatabase();
  }

  // Phương thức Singleton để lấy instance của DatabaseManager
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // Khởi tạo cơ sở dữ liệu
  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('Lỗi khi mở cơ sở dữ liệu:', event);
        reject(new Error('Không thể mở cơ sở dữ liệu'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Đã kết nối thành công đến cơ sở dữ liệu');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Tạo object store cho mật khẩu nếu chưa tồn tại
        if (!db.objectStoreNames.contains('passwords')) {
          const store = db.createObjectStore('passwords', { keyPath: 'id' });
          
          // Tạo các chỉ mục để tìm kiếm nhanh hơn
          store.createIndex('service', 'service', { unique: false });
          store.createIndex('username', 'username', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  // Đảm bảo cơ sở dữ liệu đã được khởi tạo
  private async ensureDbReady(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDatabase();
    }
    if (!this.db) {
      throw new Error('Cơ sở dữ liệu chưa được khởi tạo');
    }
    return this.db;
  }

  // Lấy tất cả mật khẩu
  public async getAllPasswords(): Promise<PasswordEntry[]> {
    const db = await this.ensureDbReady();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['passwords'], 'readonly');
      const store = transaction.objectStore('passwords');
      const index = store.index('updatedAt');
      const request = index.openCursor(null, 'prev'); // Sắp xếp theo updatedAt giảm dần
      
      const passwords: PasswordEntry[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          passwords.push(cursor.value);
          cursor.continue();
        } else {
          resolve(passwords);
        }
      };
      
      request.onerror = (event) => {
        reject(new Error('Lỗi khi lấy dữ liệu mật khẩu'));
      };
    });
  }

  // Tìm kiếm mật khẩu
  public async searchPasswords(query: string): Promise<PasswordEntry[]> {
    const allPasswords = await this.getAllPasswords();
    const lowerQuery = query.toLowerCase();
    
    return allPasswords.filter(entry => 
      entry.service.toLowerCase().includes(lowerQuery) || 
      entry.username.toLowerCase().includes(lowerQuery)
    );
  }

  // Thêm mật khẩu mới
  public async addPassword(entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PasswordEntry> {
    const db = await this.ensureDbReady();
    
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const id = Date.now().toString();
      
      const newEntry: PasswordEntry = {
        id,
        ...entry,
        createdAt: now,
        updatedAt: now
      };
      
      const transaction = db.transaction(['passwords'], 'readwrite');
      const store = transaction.objectStore('passwords');
      const request = store.add(newEntry);
      
      request.onsuccess = () => {
        resolve(newEntry);
      };
      
      request.onerror = (event) => {
        reject(new Error('Lỗi khi thêm mật khẩu mới'));
      };
    });
  }

  // Cập nhật mật khẩu
  public async updatePassword(id: string, entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PasswordEntry | null> {
    const db = await this.ensureDbReady();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['passwords'], 'readwrite');
      const store = transaction.objectStore('passwords');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existingEntry = getRequest.result as PasswordEntry | undefined;
        
        if (!existingEntry) {
          resolve(null);
          return;
        }
        
        const updatedEntry: PasswordEntry = {
          ...existingEntry,
          ...entry,
          updatedAt: new Date().toISOString()
        };
        
        const updateRequest = store.put(updatedEntry);
        
        updateRequest.onsuccess = () => {
          resolve(updatedEntry);
        };
        
        updateRequest.onerror = () => {
          reject(new Error('Lỗi khi cập nhật mật khẩu'));
        };
      };
      
      getRequest.onerror = () => {
        reject(new Error('Lỗi khi tìm mật khẩu để cập nhật'));
      };
    });
  }

  // Xóa mật khẩu
  public async deletePassword(id: string): Promise<boolean> {
    const db = await this.ensureDbReady();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['passwords'], 'readwrite');
      const store = transaction.objectStore('passwords');
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject(new Error('Lỗi khi xóa mật khẩu'));
      };
    });
  }
}

// Export instance mặc định
export const dbManager = DatabaseManager.getInstance();