# 🚀 Netlify Quick Fix - Các Bước Cụ Thể

## ✅ Xác Nhận: Code Hoạt động Tốt
- **Local Build**: ✅ Thành công
- **Local Preview**: ✅ Chạy tại http://localhost:4174/
- **GitHub**: ✅ Code đã được push

## 🎯 Vấn Đề: Chỉ Netlify Deployment

### Bước 1: Truy cập Netlify Dashboard
1. Mở: https://app.netlify.com/
2. Đăng nhập với tài khoản của bạn
3. Tìm site: `stellar-selkie-ea64b4`

### Bước 2: Kiểm tra Build Status
1. Click vào site `stellar-selkie-ea64b4`
2. Vào tab **Deploys**
3. Xem build log của deploy gần nhất
4. Tìm lỗi cụ thể (nếu có)

### Bước 3: Cấu hình Environment Variables
1. Vào **Site settings** → **Environment variables**
2. Thêm 2 biến sau:
```
VITE_SUPABASE_URL = https://spb-i1kdlonbpn687q42.supabase.opentrust.net
VITE_SUPABASE_ANON_KEY = eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InNwYi1pMWtkbG9uYnBuNjg3cTQyIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3Njc0NjU2OTYsImV4cCI6MjA4MzA0MTY5Nn0.sIXNkvXoM3z6tY2YtrwX597ph0n3OW3hJ_XHvlksjOs
```

### Bước 4: Kiểm tra Build Settings
1. Vào **Site settings** → **Build & deploy**
2. Đảm bảo:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18.x hoặc 20.x

### Bước 5: Manual Redeploy
1. Vào tab **Deploys**
2. Click **Trigger deploy** → **Deploy site**
3. Đợi build hoàn thành

### Bước 6: Alternative - Manual Upload
Nếu auto-deploy không hoạt động:
1. Chạy `npm run build` local
2. Vào Netlify Dashboard
3. Drag & drop folder `dist` vào **Deploys** tab

## 🔍 Troubleshooting

### Nếu Build Fail
- Kiểm tra Node version (cần 18.x+)
- Xem build log để tìm lỗi cụ thể
- Đảm bảo `package.json` có đúng scripts

### Nếu Build Success nhưng Site 404
- Kiểm tra publish directory = `dist`
- Verify file `dist/index.html` tồn tại
- Check routing configuration

### Nếu Supabase Không Hoạt động
- Verify environment variables đã set
- Test connection với Debug component
- Kiểm tra Supabase RLS policies

## 📞 Liên Hệ Support
Nếu vẫn gặp vấn đề:
1. Chụp screenshot build logs
2. Share link Netlify site
3. Gửi thông tin lỗi cụ thể

---
**Lưu ý**: Code đã test thành công local, vấn đề chỉ là deployment configuration.