'use client';
import React from 'react';

// Bộ icon mạng xã hội (inline SVG, không phụ thuộc file icons.js)
const ICONS = {
  facebook: (s) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.3-1.4 1.5-1.4h1.4V5.6c-.6-.1-1.4-.2-2.2-.2-2.2 0-3.6 1.3-3.6 3.7v2.1H8v2.8h2.6v7Z"/></svg>),
  zalo: (s) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6l-4 3v-3H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2.6 5.2v1.1h2l-2.2 3v.9h3.8v-1.1H9l2.2-3v-.9H7.6Zm5.1 0v4.9h1.2V8.2h-1.2Zm3.4 1.7c-.9 0-1.6.7-1.6 1.7s.7 1.7 1.6 1.7c.4 0 .7-.1.9-.4v.3h1.1V9.9h-1.1v.3c-.2-.3-.5-.3-.9-.3Zm.2 1c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7Z"/></svg>),
  x: (s) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3l-6.6 7.5L21.8 21h-6l-4.7-6.1L5.7 21H2.6l7-8L2.5 3h6.1l4.2 5.6L17.5 3Zm-1 16h1.7L7.6 4.7H5.8L16.5 19Z"/></svg>),
  telegram: (s) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L5.9 13.3l-4.7-1.5c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3Z"/></svg>),
  discord: (s) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M19.3 5.3A16 16 0 0 0 15.3 4l-.2.4a12 12 0 0 1 3.6 1.8 12.8 12.8 0 0 0-11-.5A15 15 0 0 1 8.9 4l-.2-.4a16 16 0 0 0-4 1.7C2 9 1.3 12.6 1.6 16.2A16 16 0 0 0 6.5 18.7l.5-.9c-.8-.3-1.5-.7-2.2-1.1l.5-.4a11.4 11.4 0 0 0 9.8 0l.5.4c-.7.4-1.4.8-2.2 1.1l.5.9a16 16 0 0 0 4.9-2.5c.4-4.1-.6-7.7-3-11.4ZM8.5 14c-.8 0-1.5-.7-1.5-1.7s.6-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Zm7 0c-.8 0-1.5-.7-1.5-1.7s.6-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Z"/></svg>),
  linkedin: (s) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 8.5v10h-3v-10h3ZM5 3.5A1.8 1.8 0 1 1 5 7a1.8 1.8 0 0 1 0-3.5ZM20.5 18.5h-3v-5c0-1.3-.5-2-1.5-2s-1.7.8-1.7 2v5h-3v-10h3v1.3c.5-.8 1.5-1.5 2.8-1.5 2 0 3.4 1.3 3.4 4v6.2Z"/></svg>),
  youtube: (s) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M21.4 8c-.2-1.2-.9-2.1-2.1-2.3C17.4 5.3 12 5.3 12 5.3s-5.4 0-7.3.4C3.5 5.9 2.8 6.8 2.6 8c-.3 1.9-.3 4-.3 4s0 2.1.3 4c.2 1.2.9 2.1 2.1 2.3 1.9.4 7.3.4 7.3.4s5.4 0 7.3-.4c1.2-.2 1.9-1.1 2.1-2.3.3-1.9.3-4 .3-4s0-2.1-.3-4ZM10.2 15V9l5 3-5 3Z"/></svg>),
  instagram: (s) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r="1" fill="currentColor" stroke="none"/></svg>),
  tiktok: (s) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M16.8 3c.3 1.9 1.5 3.3 3.5 3.6v3c-1.4 0-2.6-.4-3.6-1.1v6.2c0 3.5-2.4 5.8-5.6 5.8-3 0-5.4-2.2-5.4-5.2 0-3 2.3-5.2 5.4-5.2.3 0 .7 0 1 .1v3.1c-.3-.1-.6-.2-1-.2-1.4 0-2.4 1-2.4 2.3 0 1.3 1 2.2 2.4 2.2 1.6 0 2.6-1.1 2.6-3V3h3Z"/></svg>),
};

const LABELS = {
  facebook: 'Facebook', zalo: 'Zalo', x: 'X (Twitter)', telegram: 'Telegram',
  discord: 'Discord', linkedin: 'LinkedIn', youtube: 'YouTube', instagram: 'Instagram', tiktok: 'TikTok',
};

// Thứ tự hiển thị
const ORDER = ['facebook', 'zalo', 'x', 'telegram', 'discord', 'linkedin', 'youtube', 'instagram', 'tiktok'];

export function SocialIcon({ platform, size = 15 }) {
  const render = ICONS[platform];
  return render ? render(size) : null;
}

// settings object → [{ key, url, label }] chỉ gồm các mạng đã cấu hình
export function buildSocialLinks(settings = {}) {
  return ORDER
    .map((key) => ({ key, url: (settings[`social_${key}`] || '').trim(), label: LABELS[key] }))
    .filter((s) => s.url);
}
