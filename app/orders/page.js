import OrdersPageClient from '@/components/OrdersPageClient';

export const metadata = {
  title: 'Tài khoản & Lịch sử đơn hàng | Quà Xinh',
  description: 'Tra cứu thông tin vận chuyển, xem chi tiết lịch sử giao hàng và cập nhật địa chỉ, số điện thoại giao nhận quà tặng Quà Xinh.'
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
