# AI Kids App

## مشکلات رایج و راه‌حل‌ها

### مشکل CORS در Firebase
اگر با خطای CORS مواجه شدید:

1. **Firebase Console:**
   - به Authentication > Settings بروید
   - در قسمت "Authorized domains" دامنه `aikidsapp.netlify.app` را اضافه کنید

2. **Clear Cache:**
   - مرورگر را refresh کنید
   - یا از incognito mode استفاده کنید

### مشکل API 404
اگر API ها کار نمی‌کنند:

1. **Netlify Functions:**
   - اپ حالا از Netlify Functions استفاده می‌کند
   - API calls از طریق `/.netlify/functions/` proxy می‌شوند

2. **Build جدید:**
   ```bash
   npm run build
   ```

3. **Deploy جدید:**
   - فایل‌های build و netlify/functions را به Netlify آپلود کنید

### تست محلی
```bash
npm start
```

### Build برای production
```bash
npm run build
```
