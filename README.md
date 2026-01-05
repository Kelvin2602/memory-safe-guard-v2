# Memory Safe Guard 🔐

Ứng dụng quản lý mật khẩu hiện đại được xây dựng với React, TypeScript và IndexedDB. Lưu trữ và quản lý mật khẩu một cách an toàn ngay trong trình duyệt của bạn.

![Memory Safe Guard](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.1-purple)
![IndexedDB](https://img.shields.io/badge/IndexedDB-Local%20Storage-green)

## ✨ Tính năng chính

- 🏠 **Lưu trữ cục bộ**: Sử dụng IndexedDB để lưu trữ dữ liệu an toàn trong trình duyệt
- 🔒 **Quản lý mật khẩu**: Thêm, chỉnh sửa, xóa và tìm kiếm mật khẩu
- 🎨 **Giao diện hiện đại**: Thiết kế đẹp mắt với shadcn/ui và Tailwind CSS
- 🛡️ **Bảo mật**: Dữ liệu được lưu trữ cục bộ, không có máy chủ bên ngoài
- 🎲 **Tạo mật khẩu**: Tính năng tạo mật khẩu ngẫu nhiên mạnh
- 📋 **Sao chép nhanh**: Sao chép thông tin đăng nhập vào clipboard

## 🚀 Công nghệ sử dụng

### Core Technologies
- **React 18.3.1**: Frontend framework với hooks và functional components
- **TypeScript 5.5.3**: Static typing cho JavaScript
- **Vite 5.4.1**: Build tool và dev server hiện đại
- **Tailwind CSS 3.4.11**: Utility-first CSS framework
- **shadcn/ui**: Component library dựa trên Radix UI

### Key Libraries
- **@radix-ui/***: Headless UI components
- **lucide-react**: Icon library
- **react-hook-form**: Form handling với validation
- **zod**: Schema validation
- **sonner**: Toast notifications
- **date-fns**: Date manipulation

## 📦 Cài đặt

1. **Clone repository:**
```bash
git clone https://github.com/tungvu82nt/memory-safe-guard-v2.git
cd memory-safe-guard-v2
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Khởi chạy development server:**
```bash
npm run dev
```

4. **Mở trình duyệt tại:** `http://localhost:8080`

## 🛠️ Scripts có sẵn

```bash
# Development
npm run dev          # Khởi chạy dev server tại localhost:8080

# Production
npm run build        # Build cho production
npm run build:dev    # Build cho development mode
npm run preview      # Preview production build

# Code Quality
npm run lint         # Chạy ESLint để kiểm tra code

# Testing
npm run test         # Chạy tests
npm run test:ui      # Chạy tests với UI
npm run test:coverage # Chạy tests với coverage
```

## 📁 Cấu trúc dự án

```
src/
├── assets/              # Static resources (images, fonts)
│   └── password-hero.png
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── PasswordCard.tsx    # Password display component
│   ├── PasswordForm.tsx    # Add/edit password form
│   └── SearchBar.tsx       # Search functionality
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx      # Mobile detection hook
│   ├── use-passwords.ts    # Password management hook
│   └── use-toast.ts        # Toast notification hook
├── lib/                 # Utilities and libraries
│   ├── db/
│   │   └── db.ts           # IndexedDB management
│   └── utils.ts            # Common utility functions
├── pages/               # Page components
│   ├── Index.tsx           # Main application page
│   └── NotFound.tsx        # 404 error page
├── App.tsx              # Root application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## 🔒 Bảo mật

- **Lưu trữ cục bộ**: Tất cả dữ liệu được lưu trong IndexedDB của trình duyệt
- **Không có server**: Không có dữ liệu nào được gửi đến máy chủ bên ngoài
- **Mã hóa**: Dữ liệu được bảo vệ bởi sandbox của trình duyệt
- **Privacy-first**: Hoàn toàn offline và riêng tư

## 🎯 Mục tiêu thiết kế

- ✅ Đơn giản và dễ sử dụng
- ✅ Bảo mật thông tin người dùng
- ✅ Hiệu suất cao và phản hồi nhanh
- ✅ Giao diện trực quan và thân thiện
- ✅ Responsive design cho mọi thiết bị

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Component library tuyệt vời
- [Lucide](https://lucide.dev/) - Beautiful icon library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

---

**Memory Safe Guard** - Bảo vệ mật khẩu của bạn một cách an toàn và hiện đại! 🚀