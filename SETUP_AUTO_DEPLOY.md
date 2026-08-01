# ⚡ Автоматический Deploy за 5 минут

## 🎯 Что нужно сделать

### 1️⃣ Добавить vercel.json на GitHub

vercel.json **уже создан** локально. Загрузить его:

```bash
cd "C:\Users\shato\OneDrive\Desktop\база-отдыха-романтик (1)"

git add vercel.json
git commit -m "Add Vercel config for auto-deploy"
git push
```

### 2️⃣ Vercel автоматически пересоберет

Откройте https://vercel.com/dashboard

Должны видеть новый deploy. Ждите пока не будет **Ready** ✅ (1-2 минуты)

### 3️⃣ Готово!

Откройте ваше приложение:
```
https://romantik-booking.vercel.app
```

---

## 🔄 Теперь автоматизм работает!

Каждый раз когда вы делаете:

```bash
git push
```

Vercel **автоматически**:
1. Забирает новый код
2. Собирает приложение
3. Развертывает на сервер
4. Обновляет ваш сайт

**Больше ничего не нужно!** ✨

---

## 📝 Пример рабочего процесса

```bash
# 1. Отредактировать файл
# (например, src/components/Header.tsx)

# 2. Проверить локально
npm run dev

# 3. Загрузить на GitHub (автоматический deploy!)
git add .
git commit -m "Update header"
git push

# 4. Profit! Приложение обновилось на сервере 🎉
```

---

## 📖 Подробная инструкция

Читайте **VERCEL_GITHUB_COMPLETE.md** если нужны детали про:
- Переменные окружения
- Мониторинг deployments
- Troubleshooting
- GitHub branches и Pull Requests

---

**Готово! Приложение теперь live и автоматически обновляется!** 🚀
