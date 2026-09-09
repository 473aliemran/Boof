# BOOF — Telegram Mini App starter

یک بازی کلیکی ساده برای Telegram Mini App با:
- Coin
- Energy
- Upgrade قدرت کلیک
- درآمد خودکار
- Daily reward
- Referral link
- Leaderboard
- ذخیره اطلاعات در localStorage برای نسخه آزمایشی

## اجرا

```bash
npm install
npm run dev
```

برای تست داخل تلگرام، نسخه production را روی HTTPS منتشر کنید و URL آن را به BotFather به عنوان Mini App بدهید.

## نکته امنیتی
این نسخه برای prototype است و داده‌های بازی را در مرورگر نگه می‌دارد. برای نسخه واقعی باید بک‌اند و دیتابیس اضافه شود و `initData` تلگرام در سرور اعتبارسنجی شود.

## ساختار
- `index.html`
- `src/main.jsx`
- `src/style.css`
- `package.json`
