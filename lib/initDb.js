import { query } from './db';
import { hashPassword } from './auth';

export async function initDatabase() {
  // Signups table
  await query(`
    CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Contact messages table (tin nhắn từ trang Liên hệ)
  await query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(100),
      email VARCHAR(255),
      subject VARCHAR(255),
      message TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'new',
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Settings table
  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      \`key\` VARCHAR(255) NOT NULL PRIMARY KEY,
      \`value\` TEXT
    )
  `);

  // Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      display_name TEXT,
      email TEXT,
      phone VARCHAR(100),
      address TEXT,
      role VARCHAR(50) NOT NULL DEFAULT 'member',
      tier VARCHAR(50) NOT NULL DEFAULT 'Free',
      active INTEGER NOT NULL DEFAULT 1,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  try {
    await query('ALTER TABLE users ADD COLUMN phone VARCHAR(100)');
  } catch (err) {}

  try {
    await query('ALTER TABLE users ADD COLUMN address TEXT');
  } catch (err) {}

  try {
    await query("ALTER TABLE users ADD COLUMN tier VARCHAR(50) NOT NULL DEFAULT 'Free'");
  } catch (err) {}

  // Alter products table columns if missing
  const productsColumns = [
    { name: 'original_price', type: 'REAL' },
    { name: 'images', type: 'TEXT' },
    { name: 'brand', type: 'VARCHAR(255)' },
    { name: 'origin', type: 'VARCHAR(255)' },
    { name: 'unit', type: "VARCHAR(100) DEFAULT 'Hộp'" },
    { name: 'sold_count', type: 'INTEGER DEFAULT 0' },
    { name: 'view_count', type: 'INTEGER DEFAULT 0' },
    { name: 'rating', type: 'REAL DEFAULT 0' },
    { name: 'is_featured', type: 'INTEGER DEFAULT 0' },
    { name: 'is_flash_sale', type: 'INTEGER DEFAULT 0' },
    { name: 'flash_sale_price', type: 'REAL' },
    { name: 'flash_sale_end', type: 'VARCHAR(100)' },
    { name: 'tags', type: 'TEXT' },
    { name: 'meta_title', type: 'TEXT' },
    { name: 'meta_description', type: 'TEXT' }
  ];

  for (const col of productsColumns) {
    try {
      await query(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`);
    } catch (err) {
      // Column might already exist
    }
  }

  // Posts/Changelog table
  await query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      image TEXT,
      author_id INTEGER,
      author_name TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      views INTEGER DEFAULT 0,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now')),
      updated_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Pages table
  await query(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      layout TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'published',
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now')),
      updated_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // API Keys table
  await query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      api_key VARCHAR(255) NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // File Categories table
  await query(`
    CREATE TABLE IF NOT EXISTS file_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Files table
  await query(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(500) NOT NULL,
      file_type VARCHAR(50),
      url LONGTEXT NOT NULL,
      file_size VARCHAR(50),
      folder VARCHAR(200) DEFAULT 'general',
      uploaded_at VARCHAR(100) NOT NULL DEFAULT (datetime('now')),
      uploaded_by INT,
      description TEXT,
      is_public INT DEFAULT 1,
      downloads INT DEFAULT 0,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Post Attachments table
  await query(`
    CREATE TABLE IF NOT EXISTS post_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INT,
      name VARCHAR(500) NOT NULL,
      original_name VARCHAR(500),
      file_type VARCHAR(100),
      file_size BIGINT DEFAULT 0,
      file_size_label VARCHAR(50),
      url LONGTEXT NOT NULL,
      uploaded_at VARCHAR(100) NOT NULL DEFAULT (datetime('now')),
      uploaded_by INT,
      downloads INT DEFAULT 0,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Download tokens tracking table
  await query(`
    CREATE TABLE IF NOT EXISTS download_tokens (
      token VARCHAR(200) PRIMARY KEY,
      use_count INT DEFAULT 0,
      expires_at BIGINT NOT NULL
    )
  `);

  // Installed Plugins table — lưu plugin đã cài và config trong DB của website
  await query(`
    CREATE TABLE IF NOT EXISTS installed_plugins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT DEFAULT '1.0.0',
      config TEXT DEFAULT '{}',
      active INTEGER NOT NULL DEFAULT 1,
      installed_at DATETIME DEFAULT (datetime('now'))
    )
  `);


  // ─── E-COMMERCE TABLES ───────────────────────────────────────

  // Shop Categories (danh mục sản phẩm)
  await query(`
    CREATE TABLE IF NOT EXISTS shop_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      parent_id INTEGER,
      icon VARCHAR(100),
      image TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at VARCHAR(100) DEFAULT (datetime('now'))
    )
  `);

  // Products (sản phẩm)
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      short_description TEXT,
      description TEXT,
      price REAL NOT NULL DEFAULT 0,
      original_price REAL,
      thumbnail TEXT,
      images TEXT,
      brand VARCHAR(255),
      origin VARCHAR(255),
      unit VARCHAR(100) DEFAULT 'Hộp',
      stock INTEGER DEFAULT 0,
      sold_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      is_featured INTEGER DEFAULT 0,
      is_flash_sale INTEGER DEFAULT 0,
      flash_sale_price REAL,
      flash_sale_end VARCHAR(100),
      tags TEXT,
      meta_title TEXT,
      meta_description TEXT,
      created_at VARCHAR(100) DEFAULT (datetime('now')),
      updated_at VARCHAR(100) DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES shop_categories(id) ON DELETE SET NULL
    )
  `);

  // Product Variants (biến thể sản phẩm: Hộp, Vỉ, Chai...)
  await query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at VARCHAR(100) DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Product Reviews (đánh giá)
  await query(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      order_id INTEGER,
      reviewer_name VARCHAR(255) NOT NULL,
      reviewer_id INTEGER,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT,
      is_verified INTEGER DEFAULT 0,
      created_at VARCHAR(100) DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Orders (đơn hàng)
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code VARCHAR(100) NOT NULL UNIQUE,
      user_id INTEGER,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(100) NOT NULL,
      customer_email VARCHAR(255),
      shipping_address TEXT NOT NULL,
      shipping_province VARCHAR(255),
      shipping_note TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      shipping_fee REAL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      coupon_code VARCHAR(100),
      payment_method VARCHAR(50) DEFAULT 'cod',
      payment_status VARCHAR(50) DEFAULT 'pending',
      status VARCHAR(50) DEFAULT 'pending',
      admin_note TEXT,
      created_at VARCHAR(100) DEFAULT (datetime('now')),
      updated_at VARCHAR(100) DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Coupons (mã giảm giá)
  await query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(100) NOT NULL UNIQUE,
      discount_type VARCHAR(50) NOT NULL DEFAULT 'percent',
      discount_value REAL NOT NULL,
      min_order REAL DEFAULT 0,
      max_discount REAL,
      usage_limit INTEGER,
      usage_count INTEGER DEFAULT 0,
      expires_at VARCHAR(100),
      is_active INTEGER DEFAULT 1,
      created_at VARCHAR(100) DEFAULT (datetime('now'))
    )
  `);

  // Alter tables to add SEO columns dynamically if they do not exist
  const addColumns = [
    { table: 'pages', column: 'meta_title', type: 'TEXT' },
    { table: 'pages', column: 'meta_description', type: 'TEXT' },
    { table: 'pages', column: 'meta_keywords', type: 'TEXT' },
    { table: 'posts', column: 'meta_title', type: 'TEXT' },
    { table: 'posts', column: 'meta_description', type: 'TEXT' },
    { table: 'posts', column: 'meta_keywords', type: 'TEXT' }
  ];

  for (const item of addColumns) {
    try {
      await query(`ALTER TABLE ${item.table} ADD COLUMN ${item.column} ${item.type}`);
      console.log(`Added column ${item.column} to table ${item.table}`);
    } catch (err) {
      // Column already exists or error
    }
  }

  console.log('✅ Database tables created and migrated');
}


export async function seedData(adminPassword, force = false) {
  const passwordToSeed = adminPassword || 'admin123';
  
  // Check if we should force override because the database was previously seeded with Command Code data or Long Chau
  let isCommandCode = false;
  try {
    const existingLogo = await query('SELECT `value` FROM settings WHERE `key` = ?', ['header_logo_text']);
    if (existingLogo.length > 0 && (existingLogo[0].value === 'Command Code' || existingLogo[0].value === 'FPT Long Châu')) {
      isCommandCode = true;
    }
  } catch (e) {
    // Table or settings might not exist yet
  }

  const shouldForce = force || isCommandCode;
  
  // Seed Settings
  const defaultSettings = [
    ['site_title', 'Quà Xinh - Phụ kiện & Quà tặng xinh xắn'],
    ['site_description', 'Quà Xinh chuyên phụ kiện thời trang, móc khóa, văn phòng phẩm, đồ trang trí và quà tặng xinh xắn, ý nghĩa. Miễn phí vận chuyển cho đơn từ 299k, đổi trả dễ dàng trong 7 ngày.'],
    ['site_keywords', 'quà tặng, phụ kiện thời trang, móc khóa, quà tặng sinh nhật, quà xinh, văn phòng phẩm, đồ trang trí, combo quà tặng'],
    ['header_logo_text', 'Quà Xinh'],
    ['header_logo_icon', '🎁'],
    ['header_links', JSON.stringify([
      { label: 'Trang chủ', href: '/' },
      { label: 'Sản phẩm', href: '/products' },
      { label: 'Bộ sưu tập', href: '/products' },
      { label: 'Quà tặng theo dịp', href: '/products' },
      { label: 'Tin tức', href: '/blog' },
      { label: 'Liên hệ', href: '/contact' }
    ])],
    ['footer_copyright', '© 2024 Quà Xinh. All rights reserved. Powered by AutoWeb CMS.'],
    // Liên hệ mạng xã hội (để trống = ẩn icon tương ứng)
    ['social_facebook', ''],
    ['social_zalo', ''],
    ['social_youtube', ''],
    ['social_tiktok', ''],
    ['social_instagram', ''],
    ['social_x', ''],
    ['social_telegram', ''],
    ['social_discord', ''],
    ['social_linkedin', ''],
    ['footer_columns', JSON.stringify([
      {
        title: 'Về chúng tôi',
        links: [
          { label: 'Giới thiệu về chúng tôi', href: '/about' },
          { label: 'Chính sách bảo mật', href: '#' },
          { label: 'Điều khoản sử dụng', href: '#' }
        ]
      },
      {
        title: 'Hỗ trợ khách hàng',
        links: [
          { label: 'Hướng dẫn mua hàng', href: '#' },
          { label: 'Chính sách đổi trả', href: '#' },
          { label: 'Chính sách vận chuyển', href: '#' }
        ]
      }
    ])]
  ];

  for (const [key, val] of defaultSettings) {
    try {
      if (shouldForce) {
        await query('INSERT OR REPLACE INTO settings (`key`, `value`) VALUES (?, ?)', [key, val]);
      } else {
        await query('INSERT OR IGNORE INTO settings (`key`, `value`) VALUES (?, ?)', [key, val]);
      }
    } catch (err) {
      console.error(`Failed to seed setting key ${key}:`, err);
    }
  }

  // Seed default admin and moderator users
  try {
    const adminExists = await query('SELECT id FROM users WHERE username = ?', ['admin']);
    const hashedAdminPw = await hashPassword(passwordToSeed);
    if (adminExists.length === 0) {
      await query(
        'INSERT INTO users (username, password, display_name, email, role, tier, active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        ['admin', hashedAdminPw, 'Administrator', 'admin@quatangxinh.vn', 'admin', 'Enterprise']
      );
      console.log('👑 Default admin user seeded');
    } else if (adminPassword) {
      await query('UPDATE users SET password = ? WHERE username = ?', [hashedAdminPw, 'admin']);
      console.log('👑 Admin user password updated to custom password');
    }

    const modExists = await query('SELECT id FROM users WHERE username = ?', ['moderator']);
    if (modExists.length === 0) {
      const hashedModPw = await hashPassword('mod123');
      await query(
        'INSERT INTO users (username, password, display_name, email, role, tier, active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        ['moderator', hashedModPw, 'Staff Moderator', 'mod@quatangxinh.vn', 'mod', 'Pro']
      );
      console.log('🛡️ Default moderator user seeded');
    }
  } catch (err) {
    console.error('Failed to seed default users:', err);
  }

  // Seed default dynamic pages
  try {
    const pageExists = await query('SELECT id FROM pages WHERE slug = ?', ['about']);
    if (pageExists.length === 0 || shouldForce) {
      const defaultLayout = [
        {
          id: 'b_about_hero',
          type: 'hero',
          visible: true,
          configs: {
            title: 'Gửi trọn yêu thương qua từng món quà',
            description: 'Quà Xinh mang đến hàng ngàn món phụ kiện và quà tặng xinh xắn, ý nghĩa cho bạn và những người thân yêu. Xinh xắn – Ý nghĩa – Giá tốt.',
            buttonText: 'Mua sắm ngay',
            buttonLink: '/products'
          }
        },
        {
          id: 'b_about_feat',
          type: 'features',
          visible: true,
          configs: {
            tag: 'GIÁ TRỊ CỐT LÕI',
            title: 'Món quà nhỏ, yêu thương lớn',
            description: 'Mỗi món quà tại Quà Xinh đều được chọn lọc kỹ lưỡng, gói ghém xinh xắn và gửi gắm thật nhiều yêu thương.',
            items: [
              { title: 'Xinh Xắn & Chất Lượng', desc: 'Sản phẩm dễ thương, chất lượng tốt, được kiểm tra kỹ trước khi giao.' },
              { title: 'Gói Quà Miễn Phí', desc: 'Gói quà xinh xắn kèm thiệp lời chúc theo yêu cầu, hoàn toàn miễn phí.' },
              { title: 'Giao Nhanh Toàn Quốc', desc: 'Miễn phí vận chuyển cho đơn từ 299k, đổi trả dễ dàng trong 7 ngày.' }
            ]
          }
        }
      ];
      if (pageExists.length > 0) {
        await query('DELETE FROM pages WHERE slug = ?', ['about']);
      }
      await query(
        'INSERT INTO pages (slug, title, description, layout, status) VALUES (?, ?, ?, ?, ?)',
        ['about', 'Giới thiệu về chúng tôi', 'Quà Xinh với sứ mệnh mang những món phụ kiện và quà tặng xinh xắn, ý nghĩa đến với mọi khách hàng.', JSON.stringify(defaultLayout), 'published']
      );
      console.log('📄 Default about page seeded');
    }
  } catch (err) {
    console.error('Failed to seed default pages:', err);
  }

  // Seed default file categories
  try {
    const existingFileCats = await query('SELECT COUNT(*) as cnt FROM file_categories');
    if (existingFileCats[0].cnt === 0) {
      const defaultFileCats = [
        { name: 'Chưa phân loại', slug: 'general' },
        { name: 'Ảnh minh họa', slug: 'images' },
        { name: 'Tài liệu hướng dẫn', slug: 'documents' },
        { name: 'Mã nguồn / Code', slug: 'code' },
        { name: 'Khác', slug: 'other' }
      ];
      for (const c of defaultFileCats) {
        await query('INSERT OR IGNORE INTO file_categories (name, slug) VALUES (?, ?)', [c.name, c.slug]);
      }
      console.log('📁 Default file categories seeded');
    }
  } catch (err) {
    console.error('Failed to seed default file categories:', err);
  }

  // Seed E-Commerce data (shop categories + sample products + coupon)
  try {
    const catCount = await query('SELECT COUNT(*) as cnt FROM shop_categories');
    if (catCount[0].cnt === 0 || shouldForce) {
      if (shouldForce) {
        await query('DELETE FROM shop_categories');
      }
      const defaultCats = [
        { name: 'Phụ kiện thời trang', slug: 'phu-kien-thoi-trang', icon: '🎀', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=400&q=80', sort_order: 1 },
        { name: 'Móc khóa', slug: 'moc-khoa', icon: '🔑', image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=400&q=80', sort_order: 2 },
        { name: 'Văn phòng phẩm', slug: 'van-phong-pham', icon: '📒', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80', sort_order: 3 },
        { name: 'Đồ công nghệ', slug: 'do-cong-nghe', icon: '📱', image: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=400&q=80', sort_order: 4 },
        { name: 'Trang trí', slug: 'trang-tri', icon: '🪴', image: 'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?auto=format&fit=crop&w=400&q=80', sort_order: 5 },
        { name: 'Quà tặng', slug: 'qua-tang', icon: '🎁', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80', sort_order: 6 },
        { name: 'Combo ưu đãi', slug: 'combo-uu-dai', icon: '🏷️', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=400&q=80', sort_order: 7 },
      ];
      for (const c of defaultCats) {
        await query(
          'INSERT OR IGNORE INTO shop_categories (name, slug, icon, image, sort_order) VALUES (?, ?, ?, ?, ?)',
          [c.name, c.slug, c.icon, c.image, c.sort_order]
        );
      }
      console.log('🛍️ Default shop categories seeded');
    }

    const prodCount = await query('SELECT COUNT(*) as cnt FROM products');
    if (prodCount[0].cnt === 0 || shouldForce) {
      if (shouldForce) {
        await query('DELETE FROM products');
        await query('DELETE FROM product_variants');
      }
      const catPKTT = await query("SELECT id FROM shop_categories WHERE slug = 'phu-kien-thoi-trang'");
      const catMocKhoa = await query("SELECT id FROM shop_categories WHERE slug = 'moc-khoa'");
      const catVPP = await query("SELECT id FROM shop_categories WHERE slug = 'van-phong-pham'");
      const catCongNghe = await query("SELECT id FROM shop_categories WHERE slug = 'do-cong-nghe'");
      const catTrangTri = await query("SELECT id FROM shop_categories WHERE slug = 'trang-tri'");
      const catQuaTang = await query("SELECT id FROM shop_categories WHERE slug = 'qua-tang'");
      const catCombo = await query("SELECT id FROM shop_categories WHERE slug = 'combo-uu-dai'");

      const catIdPKTT = catPKTT[0]?.id || null;
      const catIdMocKhoa = catMocKhoa[0]?.id || null;
      const catIdVPP = catVPP[0]?.id || null;
      const catIdCongNghe = catCongNghe[0]?.id || null;
      const catIdTrangTri = catTrangTri[0]?.id || null;
      const catIdQuaTang = catQuaTang[0]?.id || null;
      const catIdCombo = catCombo[0]?.id || null;

      const sampleProducts = [
        { category_id: catIdMocKhoa, name: 'Móc khóa dây beaded nhiều màu', slug: 'moc-khoa-day-beaded-nhieu-mau', short_description: 'Móc khóa dây hạt beaded handmade nhiều màu xinh xắn, trang trí túi xách, chìa khóa cực yêu.', price: 89000, original_price: 99000, thumbnail: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=600&q=80', brand: 'Quà Xinh', origin: 'Việt Nam', unit: 'Cái', stock: 300, is_featured: 1, is_flash_sale: 1, flash_sale_price: 89000 },
        { category_id: catIdTrangTri, name: 'Đèn ngủ gấu cute', slug: 'den-ngu-gau-cute', short_description: 'Đèn ngủ hình gấu silicon dễ thương, ánh sáng dịu nhẹ, đổi màu, quà tặng đáng yêu.', price: 149000, original_price: null, thumbnail: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=600&q=80', brand: 'Quà Xinh', origin: 'Việt Nam', unit: 'Cái', stock: 150, is_featured: 1 },
        { category_id: catIdPKTT, name: 'Set kẹp tóc nơ xinh xắn', slug: 'set-kep-toc-no-xinh-xan', short_description: 'Set kẹp tóc nơ vải mềm mại, phối màu pastel ngọt ngào, phụ kiện không thể thiếu cho các nàng.', price: 59000, original_price: null, thumbnail: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80', brand: 'Quà Xinh', origin: 'Việt Nam', unit: 'Set', stock: 400, is_featured: 1 },
        { category_id: catIdQuaTang, name: 'Ly giữ nhiệt Good Day 500ml', slug: 'ly-giu-nhiet-good-day-500ml', short_description: 'Ly giữ nhiệt inox 500ml kèm ống hút, giữ nóng lạnh nhiều giờ, thiết kế trẻ trung dễ thương.', price: 139000, original_price: null, thumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80', brand: 'Quà Xinh', origin: 'Việt Nam', unit: 'Cái', stock: 220, is_featured: 1 },
        { category_id: catIdPKTT, name: 'Vòng tay charm bạc xinh', slug: 'vong-tay-charm-bac-xinh', short_description: 'Vòng tay charm bạc mạ, đính hạt lấp lánh, sang trọng mà vẫn dễ thương, quà tặng ý nghĩa.', price: 109000, original_price: 129000, thumbnail: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80', brand: 'Quà Xinh', origin: 'Việt Nam', unit: 'Cái', stock: 180, is_featured: 1, is_flash_sale: 1, flash_sale_price: 109000 },
        { category_id: catIdVPP, name: 'Sổ tay bìa da mini dễ thương', slug: 'so-tay-bia-da-mini', short_description: 'Sổ tay bìa da PU mini, giấy kem mịn, kèm dây buộc xinh xắn, tiện mang theo ghi chú mỗi ngày.', price: 79000, original_price: 95000, thumbnail: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80', brand: 'Quà Xinh', origin: 'Việt Nam', unit: 'Cuốn', stock: 260, is_featured: 1 },
        { category_id: catIdCombo, name: 'Combo quà tặng sinh nhật xinh xắn', slug: 'combo-qua-tang-sinh-nhat', short_description: 'Combo quà sinh nhật gồm hộp quà, thiệp, phụ kiện dễ thương, gói sẵn tặng bạn bè & người thân.', price: 199000, original_price: 259000, thumbnail: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80', brand: 'Quà Xinh', origin: 'Việt Nam', unit: 'Combo', stock: 120, is_featured: 1, is_flash_sale: 1, flash_sale_price: 199000 }
      ];

      for (const p of sampleProducts) {
        try {
          await query(
            `INSERT OR IGNORE INTO products (category_id, name, slug, short_description, price, original_price, thumbnail, brand, origin, unit, stock, is_featured, is_flash_sale, flash_sale_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [p.category_id, p.name, p.slug, p.short_description, p.price, p.original_price || null, p.thumbnail || null, p.brand || null, p.origin || null, p.unit || 'Kg', p.stock || 0, p.is_featured || 0, p.is_flash_sale || 0, p.flash_sale_price || null]
          );
          // Add variants for each product
          const prod = await query('SELECT id FROM products WHERE slug = ?', [p.slug]);
          if (prod.length > 0) {
            const pid = prod[0].id;
            await query('INSERT INTO product_variants (product_id, name, price, stock) VALUES (?, ?, ?, ?)', [pid, p.unit || 'Kg', p.price, p.stock]);
          }
        } catch (e) { /* ignore duplicate */ }
      }
      console.log('🛒 Sample products seeded');
    }

    // Seed default blog posts
    const postCount = await query('SELECT COUNT(*) as cnt FROM posts');
    if (postCount[0].cnt === 0 || shouldForce) {
      if (shouldForce) {
        await query('DELETE FROM posts');
      }
      
      const defaultPosts = [
        {
          title: 'Gợi ý 10 món quà sinh nhật ý nghĩa cho bạn thân',
          slug: 'goi-y-qua-sinh-nhat-y-nghia',
          summary: 'Loay hoay chưa biết tặng gì cho hội bạn thân? Cùng Quà Xinh điểm qua 10 món quà sinh nhật vừa xinh vừa ý nghĩa.',
          content: 'Một món quà sinh nhật ý nghĩa không cần quá đắt tiền mà quan trọng ở sự tinh tế và phù hợp. Gợi ý từ Quà Xinh: 1) Vòng tay charm khắc tên; 2) Đèn ngủ mini để bàn; 3) Ly giữ nhiệt in hình dễ thương; 4) Sổ tay bìa da kèm bút; 5) Set phụ kiện tóc pastel; 6) Móc khóa handmade; 7) Hộp quà DIY tự làm; 8) Cây để bàn mini; 9) Combo mỹ phẩm mini; 10) Thiệp pop-up viết tay. Đừng quên gói quà thật xinh và kèm một tấm thiệp lời chúc chân thành nhé!',
          image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
          author_name: 'Quà Xinh'
        },
        {
          title: 'Hướng dẫn gói quà xinh xắn tại nhà cực đơn giản',
          slug: 'huong-dan-goi-qua-xinh-tai-nha',
          summary: 'Chỉ với giấy gói, ruy băng và vài phụ kiện nhỏ, bạn đã có thể tự gói một món quà thật xinh. Cùng xem hướng dẫn nhé!',
          content: 'Để gói quà đẹp tại nhà, bạn cần: giấy gói (nên chọn tông pastel), ruy băng, băng keo hai mặt và vài phụ kiện trang trí (hoa khô, thiệp mini). Các bước: 1) Đo và cắt giấy vừa với hộp quà; 2) Gấp mép giấy gọn gàng, cố định bằng keo hai mặt; 3) Thắt ruy băng tạo nơ ở giữa hoặc góc hộp; 4) Trang trí thêm hoa khô, sticker hoặc thẻ tên; 5) Đính kèm thiệp lời chúc. Mẹo nhỏ: phối 2 tông màu ruy băng và giấy gói cùng gam sẽ giúp món quà hài hòa và sang hơn.',
          image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
          author_name: 'Quà Xinh'
        },
        {
          title: 'Top phụ kiện thời trang hot trend năm nay',
          slug: 'top-phu-kien-thoi-trang-hot-trend',
          summary: 'Cập nhật những món phụ kiện thời trang đang được các nàng săn đón: kẹp tóc nơ, vòng charm, túi mini và nhiều hơn nữa.',
          content: 'Phụ kiện chính là điểm nhấn giúp outfit của bạn trở nên nổi bật. Những món hot trend năm nay: 1) Kẹp tóc nơ vải bản to tông pastel; 2) Vòng tay charm mix nhiều chi tiết; 3) Túi mini đeo chéo; 4) Dây đeo điện thoại beaded; 5) Kẹp càng cua họa tiết; 6) Hoa tai chuỗi ngọc trai nhỏ. Bí quyết phối phụ kiện: chọn 1-2 món làm điểm nhấn, đồng bộ tông màu với trang phục và ưu tiên chất liệu nhẹ nhàng, nữ tính. Ghé Quà Xinh để cập nhật những mẫu phụ kiện mới nhất nhé!',
          image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
          author_name: 'Quà Xinh'
        }
      ];

      for (const p of defaultPosts) {
        await query(
          `INSERT INTO posts (slug, title, summary, content, image, author_name, status) VALUES (?, ?, ?, ?, ?, ?, 'published')`,
          [p.slug, p.title, p.summary, p.content, p.image, p.author_name]
        );
      }
      console.log('📝 Sample posts seeded');
    }

    // Seed a sample coupon
    const couponExists = await query("SELECT id FROM coupons WHERE code = 'QUAXINH10'");
    if (couponExists.length === 0) {
      await query(
        "INSERT INTO coupons (code, discount_type, discount_value, min_order, max_discount, usage_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
        ['QUAXINH10', 'percent', 10, 299000, 100000, 100]
      );
      console.log('🎟️ Sample coupon QUAXINH10 seeded');
    }

  } catch (err) {
    console.error('Failed to seed E-Commerce data:', err);
  }

  console.log('✅ Seed data complete');
}
