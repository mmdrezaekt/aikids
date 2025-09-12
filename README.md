# AI Kids App

یک اپلیکیشن موبایل React برای کودکان که با استفاده از هوش مصنوعی محتوا تولید می‌کند.

## ویژگی‌ها

- 📚 **تولید داستان**: داستان‌های کودکانه با طول‌های مختلف
- 💬 **چت با AI**: مکالمه تعاملی با هوش مصنوعی
- 🖼️ **تولید تصویر**: تصاویر کودکانه و جذاب
- 📋 **تاریخچه**: ذخیره و مدیریت محتویات تولید شده

## تکنولوژی‌ها

- React 18.2.0
- Firebase (Authentication, Firestore)
- OpenRouter AI API
- Novita AI API
- Netlify

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18+
- npm یا yarn

### نصب
```bash
npm install
```

### تنظیم Environment Variables
فایل `.env` را در ریشه پروژه ایجاد کنید:

```env
REACT_APP_OPENROUTER_API_KEY=your_openrouter_api_key_here
REACT_APP_NOVITA_API_KEY=your_novita_api_key_here
```

### اجرای محلی
```bash
npm start
```

### Build برای Production
```bash
npm run build
```

## دیپلوی روی Netlify

### روش 1: از طریق Git
1. پروژه را به GitHub push کنید
2. در Netlify، "New site from Git" را انتخاب کنید
3. Repository را انتخاب کنید
4. Environment variables را تنظیم کنید:
   - `REACT_APP_OPENROUTER_API_KEY`
   - `REACT_APP_NOVITA_API_KEY`
5. Deploy را کلیک کنید

### روش 2: از طریق Netlify CLI
```bash
# نصب Netlify CLI
npm install -g netlify-cli

# ورود به Netlify
netlify login

# دیپلوی
netlify deploy --prod --dir=build
```

### تنظیمات Environment Variables در Netlify
1. به Site settings > Environment variables بروید
2. متغیرهای زیر را اضافه کنید:
   - `REACT_APP_OPENROUTER_API_KEY`
   - `REACT_APP_NOVITA_API_KEY`

## ساختار پروژه

```
src/
├── components/          # کامپوننت‌های React
│   ├── Story.js        # تولید داستان
│   ├── Chat.js         # چت با AI
│   ├── Image.js        # تولید تصویر
│   ├── History.js      # تاریخچه محتویات
│   └── FirebaseAdmin.js # پنل مدیریت
├── contexts/           # Context API
│   └── UserContext.js  # مدیریت کاربر
├── firebase.js         # تنظیمات Firebase
└── firebaseUtils.js    # توابع Firebase
```

## امنیت

- API keys در environment variables ذخیره می‌شوند
- Content Security Policy تنظیم شده
- Firebase Security Rules فعال

## مجوز

MIT License
