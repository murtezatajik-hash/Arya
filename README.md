# آریا: دفتر حساب من

دفتر حساب شخصی برای ثبت درآمد و هزینه — بدون پرداخت. ساخته‌شده با Next.js (App Router)، TypeScript، Tailwind CSS، next-intl و Supabase Auth.

## اجرا

نیازمندی: Node.js 20.9 یا بالاتر.

1. نصب پکیج‌ها:

   ```bash
   npm install
   ```

2. ساخت فایل محیطی از روی نمونه:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   ```bash
   # macOS / Linux
   cp .env.example .env.local
   ```

3. در Supabase وارد پروژه شوید و از مسیر **Project Settings → API** این دو مقدار را در `.env.local` بگذارید:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. در Supabase از مسیر **Authentication → URL Configuration** این مقادیر را تنظیم کنید:

   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

   برای محیط واقعی، دامنهٔ production را هم به همین بخش اضافه کنید.

5. اجرای پروژه:

   ```bash
   npm run dev
   ```

   سپس [http://localhost:3000](http://localhost:3000) را باز کنید. به‌صورت پیش‌فرض به `/fa` هدایت می‌شوید.

   برای اجرای نسخهٔ production:

   ```bash
   npm run build
   npm start
   ```

   مقادیر `NEXT_PUBLIC_*` هنگام build در باندل کلاینت قرار می‌گیرند؛ بعد از تغییر `.env.local` دوباره build بگیرید.

> ورود و ثبت‌نام با ایمیل و رمز عبور از Supabase Auth استفاده می‌کند. برای تست محلی می‌توانید تأیید ایمیل (Confirm email) را در Supabase خاموش کنید یا اگر Supabase را به‌صورت محلی اجرا می‌کنید، ایمیل‌ها را از Inbucket ببینید.

## دستورها

| دستور | کار |
| --- | --- |
| `npm run dev` | اجرای محیط توسعه |
| `npm run build` | ساخت نسخهٔ production |
| `npm start` | اجرای نسخهٔ ساخته‌شده |
| `npm run lint` | بررسی ESLint |

## ساختار

```text
messages/                 ترجمه‌های fa و en (تمام متن‌های رابط کاربری)
src/
  app/
    [locale]/             صفحه‌های چندزبانه
      (auth)/             ورود، ثبت‌نام، فراموشی رمز، تعیین رمز جدید
      ledgers/            فهرست دفترها، مدیریت دفتر، دفتر سه‌بخشی و صفحهٔ هر شخص
      dashboard/          هدایت سازگاری به /ledgers
    auth/callback/        تبادل کد ایمیل تأیید/بازیابی با نشست Supabase
  components/             کامپوننت‌های رابط کاربری
  i18n/                   تنظیمات next-intl و مسیرهای زبان
  lib/
    auth/                 نگاشت خطاهای Supabase به کلیدهای ترجمه
    supabase/             کلاینت مرورگر، سرور و تازه‌سازی نشست
  proxy.ts                مسیریابی زبان + محافظت از مسیرهای خصوصی
```

## نکته‌ها

- زبان پیش‌فرض `fa` و جهت صفحه `rtl` است؛ زبان `en` با جهت `ltr` نمایش داده می‌شود.
- هیچ متن رابط کاربری داخل کد نیست؛ همه در `messages/fa.json` و `messages/en.json` قرار دارند.
- فونت فارسی Vazirmatn به‌صورت محلی از پکیج Fontsource بارگذاری می‌شود.
- مسیرهای `/ledgers` و `/ledgers/[id]` بدون ورود قابل مشاهده نیستند؛ `src/proxy.ts` نشست Supabase را تازه می‌کند و دسترسی را کنترل می‌کند. مسیر `/dashboard` برای سازگاری به `/ledgers` هدایت می‌شود.
- در Next.js 16 فایل `middleware` به `proxy` تغییر نام داده است؛ محافظت مسیرها در `src/proxy.ts` پیاده‌سازی شده است.
- مبلغ ثبت‌ها در دیتابیس همیشه عدد صحیح در کوچک‌ترین واحد ارز است (مثلاً ۱۲.۵۰ سامانی = ۱۲۵۰)؛ تبدیل و نمایش در `src/lib/money.ts` انجام می‌شود.
- تاریخ‌ها در دیتابیس میلادی و به شکل `YYYY-MM-DD` ذخیره می‌شوند. نمایش تاریخ در `src/lib/dates/display.ts` جدا شده است تا تقویم شمسی بعداً بدون تغییر داده‌ها اضافه شود.
- ماندهٔ هر شخص فقط با ثبت‌های همان شخص و جدا برای هر ارز محاسبه می‌شود؛ ارزهای مختلف هرگز با هم جمع نمی‌شوند.
- PWA در مرحلهٔ بعد اضافه می‌شود.
