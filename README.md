# Quà Xinh — Template Phụ kiện & Quà tặng

Template thương mại điện tử tông **hồng pastel dễ thương** cho shop phụ kiện & quà tặng, xây trên Next.js (App Router) + Cloudflare Workers (OpenNext) / D1 / R2.

## Đặc điểm
- Trang chủ: top bar tiện ích, tìm kiếm, danh mục tròn, sản phẩm bán chạy, banner combo/ưu đãi, tin tức, đăng ký nhận tin.
- Danh mục: Phụ kiện thời trang, Móc khóa, Văn phòng phẩm, Đồ công nghệ, Trang trí, Quà tặng, Combo ưu đãi.
- Admin đầy đủ: sản phẩm, đơn hàng, bài viết, trình dựng trang, tệp/media, mã giảm giá, thành viên, cài đặt, sao lưu & khôi phục, API cho developer.
- Live edit: đăng nhập admin có thể sửa nội dung/logo/liên hệ trực tiếp trên trang chủ.
- Chuẩn SEO: sitemap.xml + robots.txt tự sinh.
- API REST cho developer + token (kiểu WordPress Application Password).

## Chạy local
```bash
npm install
npm run dev
```
Truy cập `/admin/login` — tài khoản mặc định: `admin` / mật khẩu thiết lập khi deploy.

## Cơ sở dữ liệu
- Production: Cloudflare D1 (SQLite).
- Local dev: MySQL (xem `lib/db.js`).
Seed dữ liệu mẫu tự chạy qua `/api/admin/init`.

Powered by AutoWeb CMS.
