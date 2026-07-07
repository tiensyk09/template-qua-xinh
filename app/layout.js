import './globals.css';
import { CartProvider } from '@/components/CartContext';
import LayoutWrapper from '@/components/LayoutWrapper';
import PluginRunner from '@/components/PluginRunner';
import TopLoader from '@/components/TopLoader';

export const metadata = {
  title: 'Quà Xinh - Phụ kiện & Quà tặng xinh xắn, ý nghĩa',
  description: 'Quà Xinh chuyên phụ kiện thời trang, móc khóa, văn phòng phẩm, đồ trang trí và quà tặng xinh xắn, ý nghĩa. Miễn phí vận chuyển đơn từ 299k, đổi trả trong 7 ngày, giao hàng toàn quốc.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-white text-gray-800 font-sans antialiased min-h-screen">
        <TopLoader color="#ef7d9c" />
        <CartProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <PluginRunner />
        </CartProvider>
      </body>
    </html>
  );
}

