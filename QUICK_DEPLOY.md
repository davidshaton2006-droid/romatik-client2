# ⚡ Быстрый Deploy на Vercel (5 минут)

## Для нетерпеливых — 3 шага:

### 1️⃣ Залить на GitHub
```bash
cd "база-отдыха-романтик (1)"

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/romantik-booking.git
git push -u origin main
```

### 2️⃣ Deploy через Vercel CLI
```bash
npm install -g vercel
vercel

# Отвечайте Y на вопросы
```

**ИЛИ** через браузер:
1. https://vercel.com → Sign Up (GitHub)
2. Add New Project → Select romantik-booking
3. Import

### 3️⃣ Готово!
Ваше приложение на:
```
https://romantik-booking.vercel.app
```

---

## 🎯 Что дальше

Каждый push автоматически обновляет сайт:
```bash
git add .
git commit -m "Update"
git push
```

Готово! 🚀

---

## 📖 Подробно?

Читайте **VERCEL_DEPLOYMENT.md**
