# AI Kids - اپ موبایل برای کودکان



## بخش‌های اپ

###  بخش داستان (Story)
- تولید داستان‌های جذاب برای کودکان
###  بخش چت (Chat)
- گفتگو با هوش مصنوعی
### بخش تصویر (Image)
- تولید تصاویر برای کودکان
### بخش تاریخچه (History)
- نمایش تمام تولیدات



## نحوه اجرا

1. نصب:
```bash
npm install
```

2. اجرای اپ:
```bash
npm start
```

3. ساخت نسخه:
```bash
npm run build
```

## ساختار پروژه

```
src/
├── components/
│   ├── Story.js          # کامپوننت داستان
│   ├── Story.css
│   ├── Chat.js           # کامپوننت چت
│   ├── Chat.css
│   ├── Image.js          # کامپوننت تصویر
│   ├── Image.css
│   ├── History.js        # کامپوننت تاریخچه
│   └── History.css
├── App.js                # کامپوننت اصلی
├── App.css
├── index.js              # نقطه ورود اپ
└── index.css             # استایل‌های عمومی
```

## تنظیم Environment Variables

برای استفاده از API ها، فایل `.env.local`:

```bash
# Novita API Key 
REACT_APP_NOVITA_API_KEY=your_novita_api_key_here

```

### نحوه دریافت API Key:
1. **Novita**: [novita.ai](https://novita.ai)


## تکنولوژی‌های استفاده شده

- React 18
- HTML5
- CSS3 (Flexbox, Grid, Animations)
- JavaScript ES6+
- Mobile-first Design
