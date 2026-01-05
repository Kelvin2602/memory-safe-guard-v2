# Hướng Dẫn Deploy Memory Safe Guard lên Netlify

## ✅ FIXED: Netlify Build Error
**Vấn đề**: Lỗi dependency conflict giữa date-fns@4.1.0 và react-day-picker@8.10.1
**Giải pháp**: Đã downgrade date-fns từ v4.1.0 xuống v3.6.0 ✅
**Status**: Code đã được push lên GitHub, Netlify đang rebuild tự động

## 🚨 Vấn đề hiện tại
Sau khi build thành công, dữ liệu không được lưu vào Supabase mà vẫn sử dụng localStorage. Sau khi F5 (refresh), dữ liệu vẫn hiện lại như cũ.

## 🔧 Nguyên nhân và Giải pháp

### 1. Environment Variables chưa được cấu hình trên Netlify

**Vấn đề**: File `.env.local` chỉ hoạt động ở local development, không được deploy lên Netlify.

**Giải pháp**:
1. Truy cập Netlify Dashboard: https://app.netlify.com/
2. Chọn site `stellar-selkie-ea64b4`
3. Vào **Site settings** → **Environment variables**
4. Thêm các biến sau:

```
VITE_SUPABASE_URL = https://spb-i1kdlonbpn687q42.supabase.opentrust.net
VITE_SUPABASE_ANON_KEY = eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InNwYi1pMWtkbG9uYnBuNjg3cTQyIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3Njc0NjU2OTYsImV4cCI6MjA4MzA0MTY5Nn0.sIXNkvXoM3z6tY2YtrwX597ph0n3OW3hJ_XHvlksjOs
```

5. **Redeploy** site sau khi thêm environment variables

### 2. Supabase RLS (Row Level Security) chưa được cấu hình

**Vấn đề**: Supabase có thể block các operations do RLS policies.

**Giải pháp**: Chạy SQL script sau trong Supabase SQL Editor:

```sql
-- Tắt RLS cho demo (hoặc cấu hình policies phù hợp)
ALTER TABLE passwords DISABLE ROW LEVEL SECURITY;

-- Hoặc tạo policy cho phép tất cả operations
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for demo" ON passwords
FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);
```

### 3. Kiểm tra kết nối với Debug Tool

**Cách sử dụng**:
1. Truy cập site Netlify của bạn
2. Click nút **Debug** ở header
3. Click **Chạy Debug Test**
4. Kiểm tra kết quả:
   - Environment Variables có được load không
   - Supabase connection có thành công không
   - Database operations có hoạt động không

## 📋 Checklist khắc phục

### ✅ Bước 1: Cấu hình Netlify
- [ ] Thêm `VITE_SUPABASE_URL` vào Environment Variables
- [ ] Thêm `VITE_SUPABASE_ANON_KEY` vào Environment Variables
- [ ] Redeploy site

### ✅ Bước 2: Cấu hình Supabase
- [ ] Chạy SQL script để tắt RLS hoặc tạo policies
- [ ] Kiểm tra bảng `passwords` có tồn tại không
- [ ] Kiểm tra API key có quyền truy cập không

### ✅ Bước 3: Test và Debug
- [ ] Sử dụng Debug Tool trên site
- [ ] Kiểm tra Console logs trong DevTools
- [ ] Test thêm/sửa/xóa mật khẩu
- [ ] Test refresh page (F5)

## 🔍 Debug Commands

### Kiểm tra Environment Variables trong Console
```javascript
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Test Supabase Connection
```javascript
import { supabase } from './src/lib/supabase';

// Test connection
supabase.from('passwords').select('count').then(console.log);

// Test insert
supabase.from('passwords').insert([{
  service: 'Test',
  username: 'test@example.com', 
  password: 'test123'
}]).then(console.log);
```

## 🚀 Deployment Steps

1. **Local Development**:
   ```bash
   npm run build
   npm run preview  # Test production build locally
   ```

2. **Netlify Deployment**:
   - Push code to GitHub
   - Netlify auto-deploy từ GitHub
   - Hoặc drag & drop folder `dist` vào Netlify

3. **Post-Deployment**:
   - Cấu hình Environment Variables
   - Test Debug Tool
   - Verify Supabase operations

## 🆘 Troubleshooting

### Lỗi "Missing environment variables"
- Kiểm tra Environment Variables trong Netlify Dashboard
- Đảm bảo tên biến chính xác: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Redeploy sau khi thêm biến

### Lỗi "Row Level Security"
- Chạy SQL script để tắt RLS
- Hoặc tạo policies phù hợp cho anon users

### Dữ liệu không persist sau refresh
- Kiểm tra Network tab trong DevTools
- Xem có request nào đến Supabase không
- Sử dụng Debug Tool để kiểm tra connection

## 📞 Support

Nếu vẫn gặp vấn đề, hãy:
1. Chụp screenshot Debug Tool results
2. Kiểm tra Console errors
3. Chia sẻ Network tab trong DevTools
4. Xác nhận Environment Variables đã được set

---
*Cập nhật: 05/01/2026*