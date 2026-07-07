import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { items } = body;

    const invalidItems = {};
    let globalError = '';

    if (!items || !items.length) {
      return NextResponse.json({ success: true, invalidItems });
    }

    for (const item of items) {
      const { product_id, variant_id, quantity = 1 } = item;
      const key = `${product_id}-${variant_id || 'default'}`;

      const products = await query('SELECT * FROM products WHERE id = ?', [product_id]);
      if (!products.length) {
        invalidItems[key] = 'Sản phẩm không tồn tại';
        if (!globalError) globalError = 'Có sản phẩm không hợp lệ trong đơn hàng.';
        continue;
      }
      const product = products[0];
      if (product.status !== 'active') {
        invalidItems[key] = 'Sản phẩm đã ngừng bán';
        if (!globalError) globalError = 'Có sản phẩm đã ngừng bán trong đơn hàng.';
        continue;
      }

      let availableStock = product.stock;
      let variantName = product.unit;

      if (variant_id) {
        const variants = await query('SELECT * FROM product_variants WHERE id = ? AND product_id = ?', [variant_id, product_id]);
        if (!variants.length) {
          invalidItems[key] = 'Phân loại hàng không tồn tại';
          if (!globalError) globalError = 'Có sản phẩm có phân loại hàng không hợp lệ.';
          continue;
        }
        variantName = variants[0].name;
        availableStock = variants[0].stock;
      }

      if (availableStock < quantity) {
        invalidItems[key] = `Không đủ hàng (còn ${availableStock})`;
        if (!globalError) globalError = 'Có sản phẩm không đủ tồn kho.';
      }
    }

    const hasErrors = Object.keys(invalidItems).length > 0;

    return NextResponse.json({
      success: !hasErrors,
      error: globalError,
      invalidItems
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message, invalidItems: {} }, { status: 500 });
  }
}
