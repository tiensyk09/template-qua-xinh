import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable image optimization for static export (use <img> tags directly)
  images: {
    unoptimized: true,
  },
  // Cố định root về đúng thư mục template (tránh Next suy luận nhầm lên thư mục cha
  // do có nhiều package-lock.json), tắt cảnh báo "inferred workspace root".
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
