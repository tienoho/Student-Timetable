# Student Timetable

Ứng dụng web giúp học sinh quản lý thời khóa biểu, lịch học cá nhân và theo dõi kế hoạch học tập theo tuần/tháng.

## Tính năng chính

- 🔐 **Đăng ký / đăng nhập** bằng Supabase Authentication.
- 🗓️ **Xem lịch học theo Calendar hoặc Grid** (dễ nhìn trên cả desktop và mobile).
- ➕ **Thêm, sửa, xóa lịch cá nhân** bằng modal trực quan.
- ✋ **Kéo-thả / thay đổi thời lượng sự kiện** trong lịch.
- ⚡ **Realtime đồng bộ dữ liệu** từ Supabase.
- 🎨 **Gắn màu sắc, icon, ghi chú** cho từng lịch học.
- 🧒 **Tối ưu giao diện theo cấp lớp** (tiểu học và các cấp còn lại).

## Công nghệ sử dụng

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS, Lucide Icons, Sonner
- **Calendar:** react-big-calendar + date-fns
- **Backend (BaaS):** Supabase (Auth, Postgres, Realtime)

## Yêu cầu môi trường

- Node.js `>= 18`
- npm `>= 9`
- Một project Supabase đã tạo sẵn

## Cài đặt nhanh

1. Cài dependencies:

   ```bash
   npm install
   ```

2. Tạo file môi trường:

   ```bash
   cp .env.example .env
   ```

3. Cập nhật biến môi trường trong `.env`:

   ```env
   VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
   VITE_SUPABASE_ANON_KEY="<your-anon-key>"
   ```

4. Khởi tạo database trên Supabase:

   - Mở **Supabase Dashboard → SQL Editor**.
   - Chạy toàn bộ nội dung trong file `supabase-schema.sql`.

5. Chạy ứng dụng local:

   ```bash
   npm run dev
   ```

6. Mở trình duyệt tại:

   ```
   http://localhost:3000
   ```

## Scripts

- `npm run dev` – Chạy môi trường phát triển.
- `npm run build` – Build production.
- `npm run preview` – Preview bản build.
- `npm run lint` – Type-check bằng TypeScript (`tsc --noEmit`).
- `npm run clean` – Xóa thư mục build `dist`.

## Cấu trúc thư mục chính

```text
.
├── src/
│   ├── components/
│   │   ├── Auth.tsx
│   │   ├── CalendarView.tsx
│   │   └── TaskModal.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── supabase.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase-schema.sql
└── README.md
```

## Lưu ý khi triển khai

- Bảo đảm đã cấu hình đúng `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong môi trường deploy.
- Không commit key nhạy cảm vào repository.
- Nếu đăng ký mới nhưng chưa có profile, ứng dụng đã có cơ chế tự tạo profile mặc định.

---

Nếu bạn muốn, mình có thể viết thêm phần **“Hướng dẫn deploy lên Vercel/Netlify + Supabase”** ngay trong README.
