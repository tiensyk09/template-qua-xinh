'use client';
import React from 'react';
import Link from 'next/link';

export default function DestinationsPage() {
  const destinations = [
    {
      id: 1,
      title: 'Bộ Sưu Tập Phụ Kiện Thời Trang',
      location: 'Móc khóa, kẹp tóc nơ, vòng tay charm',
      elevation: 'Hơn 200 mẫu xinh xắn',
      description: 'Bộ sưu tập phụ kiện thời trang được Quà Xinh tuyển chọn kỹ lưỡng với đủ sắc màu dễ thương. Từ móc khóa dây beaded, kẹp tóc nơ điệu đà đến vòng tay charm bạc tinh tế, mỗi món đều giúp bạn thêm nổi bật và ngọt ngào mỗi ngày.',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      badge: 'Bộ Sưu Tập Nổi Bật'
    },
    {
      id: 2,
      title: 'Góc Trang Trí & Đèn Ngủ Cute',
      location: 'Đèn ngủ, đồ trang trí, quà để bàn',
      elevation: 'Hơn 120 mẫu decor',
      description: 'Không gian sống thêm ấm áp với bộ sưu tập đồ trang trí và đèn ngủ gấu cute của Quà Xinh. Những món decor nhỏ xinh mang phong cách Hàn Quốc ngọt ngào, thích hợp để trang trí phòng ngủ, bàn học hay làm quà tặng đáng yêu.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      badge: 'Góc Decor Xinh Xắn'
    },
    {
      id: 3,
      title: 'Sổ Tay & Văn Phòng Phẩm Dễ Thương',
      location: 'Sổ tay, thiệp, văn phòng phẩm',
      elevation: 'Hơn 150 mẫu stationery',
      description: 'Bộ sưu tập sổ tay và văn phòng phẩm dễ thương giúp việc học tập, làm việc thêm phần cảm hứng. Từ sổ tay bìa pastel, thiệp handmade đến những món văn phòng phẩm nhỏ xinh, tất cả đều được chọn lọc để bạn thêm yêu góc làm việc của mình.',
      image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80',
      badge: 'Stationery Đáng Yêu'
    },
    {
      id: 4,
      title: 'Combo Quà Tặng & Gói Quà',
      location: 'Combo quà, gói quà, ly giữ nhiệt',
      elevation: 'Gói quà miễn phí',
      description: 'Combo quà tặng của Quà Xinh là lựa chọn hoàn hảo cho sinh nhật, kỷ niệm hay dịp đặc biệt. Mỗi combo được phối hợp tinh tế cùng dịch vụ gói quà miễn phí, kèm thiệp lời chúc, giúp bạn trao gửi yêu thương một cách trọn vẹn và ngọt ngào nhất.',
      image: 'https://images.unsplash.com/photo-1607344645866-009c320c00d8?auto=format&fit=crop&w=800&q=80',
      badge: 'Combo Quà Tặng'
    }
  ];

  return (
    <div style={{ backgroundColor: '#fef4f8', minHeight: '100vh', padding: '40px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#6b7280' }}>
          <Link href="/" style={{ color: '#374151', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <span style={{ color: '#b85c78', fontWeight: 600 }}>Bộ sưu tập quà tặng</span>
        </div>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#4a2a38', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Bộ Sưu Tập Quà Xinh
          </h1>
          <p style={{ color: '#4b5563', fontSize: '15px', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            Nơi hội tụ những bộ sưu tập phụ kiện và quà tặng xinh xắn nhất của Quà Xinh. Cùng khám phá các nhóm sản phẩm được tuyển chọn theo phong cách dễ thương, ngọt ngào để bạn dễ dàng chọn được món quà ưng ý nhất.
          </p>
        </div>

        {/* Destinations List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {destinations.map((dest, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={dest.id}
                style={{
                  display: 'flex',
                  flexDirection: isEven ? 'row' : 'row-reverse',
                  gap: '40px',
                  alignItems: 'center',
                  background: '#ffffff',
                  borderRadius: '24px',
                  padding: '32px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  flexWrap: 'wrap'
                }}
                className="dest-card"
              >
                {/* Image */}
                <div style={{ flex: '1 1 450px', height: '320px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={dest.image}
                    alt={dest.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', top: '16px', left: '16px', background: '#b85c78', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {dest.badge}
                  </span>
                </div>

                {/* Content */}
                <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#b85c78', fontWeight: 700 }}>
                      📍 {dest.location}
                    </span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#4a2a38', margin: 0 }}>
                      {dest.title}
                    </h2>
                    <span style={{ fontSize: '13px', color: '#d97706', fontWeight: 600 }}>
                      🎀 {dest.elevation}
                    </span>
                  </div>
                  <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: 1.65, margin: 0 }}>
                    {dest.description}
                  </p>
                  <div>
                    <Link
                      href="/products"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fceaf0',
                        color: '#b85c78',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#b85c78'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fceaf0'; e.currentTarget.style.color = '#b85c78'; }}
                    >
                      Xem bộ sưu tập này ➔
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div style={{
          marginTop: '60px',
          background: 'linear-gradient(135deg, #b85c78 0%, #4a2a38 100%)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: '0 10px 30px rgba(13, 104, 50, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '140px', opacity: 0.05, pointerEvents: 'none' }}>
            🎁
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px' }}>Bạn Cần Tư Vấn Chọn Quà?</h3>
          <p style={{ fontSize: '15px', color: '#fceaf0', maxWidth: '600px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Quà Xinh luôn sẵn sàng tư vấn tận tâm giúp bạn chọn được món quà ưng ý theo ngân sách và sở thích, kèm dịch vụ gói quà miễn phí và thiệp lời chúc dễ thương.
          </p>
          <a
            href="tel:0123456789"
            style={{
              display: 'inline-block',
              background: '#d97706',
              color: '#ffffff',
              padding: '14px 36px',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)'
            }}
          >
            Liên Hệ Tư Vấn: 0123 456 789
          </a>
        </div>

      </div>

      <style jsx global>{`
        @media (max-width: 992px) {
          .dest-card {
            flex-direction: column !important;
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
