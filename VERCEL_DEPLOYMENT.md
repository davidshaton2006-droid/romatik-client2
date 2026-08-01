# 🚀 Развертывание на Vercel

Vercel — самый быстрый способ развернуть приложение. Ваше приложение будет доступно через 2-3 минуты.

---

## 📋 Требования

- GitHub аккаунт (для связи репо)
- Vercel аккаунт (бесплатно)
- Исходный код на GitHub

---

## Шаг 1️⃣ — Загрузить на GitHub

### Если у вас нет GitHub репо:

```bash
cd "база-отдыха-романтик (1)"

# Инициализировать git (если не инициализирован)
git init

# Добавить все файлы
git add .

# Первый коммит
git commit -m "Initial commit: Романтик booking app"

# Если у вас уже есть репо
# git remote add origin https://github.com/YOUR_USERNAME/romantik-booking.git

# Загрузить на GitHub
git push -u origin main
```

### Или просто создать репо на GitHub

1. Перейти на https://github.com/new
2. Создать репо `romantik-booking`
3. Загрузить код через GitHub Desktop или Git

---

## Шаг 2️⃣ — Зарегистрироваться на Vercel

1. Перейти на https://vercel.com
2. Нажать **Sign Up**
3. Выбрать **Continue with GitHub**
4. Авторизовать Vercel в GitHub

---

## Шаг 3️⃣ — Импортировать проект

### Способ 1: Через Vercel Dashboard

1. После входа → нажать **Add New Project**
2. Выбрать репо `romantik-booking`
3. Нажать **Import**

### Способ 2: Через CLI (быстрее)

```bash
npm install -g vercel

# Перейти в папку проекта
cd "база-отдыха-романтик (1)"

# Запустить deploy
vercel

# Ответить на вопросы:
# ? Set up and deploy "база-отдыха-романтик (1)"? [Y/n] → Y
# ? Which scope do you want to deploy to? → Ваше имя
# ? Link to existing project? [y/N] → N
# ? What's your project's name? → romantik-booking
# ? In which directory is your code located? → . (точка)
# ? Want to modify vercel.json? [y/N] → N
```

Готово! Приложение развернуто! 🎉

---

## Шаг 4️⃣ — Настройка переменных окружения

### Добавить в Vercel:

1. Перейти в **Project Settings**
2. → **Environment Variables**
3. Добавить переменные:

```
VITE_FIREBASE_PROJECT_ID = nimble-cairn-ssx2c
VITE_FIREBASE_API_KEY = AIzaSyBAgqdJMxuAEFTPSSHvpUkIkVV0712X7vA
```

**Опционально для Yookassa:**
```
VITE_YOOKASSA_SHOP_ID = your_shop_id
VITE_YOOKASSA_API_KEY = your_api_key
```

---

## Шаг 5️⃣ — Проверить deploy

После добавления переменных Vercel автоматически пересоберёт приложение.

Ваше приложение доступно по адресу:
```
https://romantik-booking.vercel.app
```

(или любой другой URL если вы выбрали другое имя)

---

## ✅ Проверить что работает

Откройте в браузере:
```
https://romantik-booking.vercel.app
```

Должны видеть:
- ✅ Главная страница загрузилась
- ✅ Каталог домиков видна
- ✅ Форма бронирования открывается
- ✅ Счётчик доступности обновляется

---

## 🎯 Что дальше

### Автоматический deploy при push

Каждый раз когда вы делаете `git push` в main:
```bash
git add .
git commit -m "Update: описание изменений"
git push origin main
```

Vercel автоматически:
1. Забирает новый код
2. Собирает приложение
3. Развертывает за 30-60 сек
4. Обновляет в браузере

### Добавить custom домен

1. Перейти в **Project Settings**
2. → **Domains**
3. Добавить свой домен (например, romantik.ru)
4. Следовать инструкциям по DNS

---

## 🔐 Безопасность

### ✅ Уже защищено:

- HTTPS автоматически (SSL от Let's Encrypt)
- CDN для быстрости
- DDoS protection
- Automatic rollback при ошибках

### 📝 Переменные окружения

API ключи безопасно хранятся в Vercel, не попадают в код.

**НИКОГДА** не коммитьте `.env` файл!

---

## 📊 Мониторинг

### Vercel Dashboard показывает:

- 📊 Аналитика трафика
- ⚡ Performance метрики
- 🚀 Deploy история
- 📝 Логи ошибок
- 💬 Preview для Pull Requests

---

## 🆘 Troubleshooting

### Проблема: Deploy failed

**Решение:**
```bash
# Проверить есть ли ошибки локально
npm run build

# Если ошибки → исправить и push
git add .
git commit -m "Fix build error"
git push
```

### Проблема: Белая страница

**Решение:**
1. Открыть DevTools (F12)
2. Вкладка Console
3. Ищем красные ошибки
4. Проверить переменные окружения

### Проблема: Firebase не работает

**Решение:**
Это нормально — Firestore работает только с авторизованных источников.

Для production нужно:
1. Перейти в Firebase Console
2. Firestore Database → Rules
3. Развернуть firestore.rules файл

---

## 📈 Масштабирование

### Бесплатный план Vercel включает:

- ✅ Unlimited bandwidth
- ✅ Unlimited deployments
- ✅ SSL сертификат
- ✅ CDN по всему миру
- ✅ Analytics

**Достаточно для 10K+ посещений в день**

Если нужно больше → upgrade на Pro ($20/месяц)

---

## 🎉 Готово!

Ваше приложение теперь доступно в интернете! 🚀

**Ваш URL:**
```
https://romantik-booking.vercel.app
```

### Поделиться с командой:

Просто отправьте ссылку! Все могут открыть и смотреть в реальном времени.

---

## 📚 Дополнительно

### Хотите улучшить?

1. **Добавить свой домен**
   - Vercel → Project Settings → Domains

2. **Настроить CI/CD**
   - Vercel делает это автоматически

3. **Мониторить ошибки**
   - Добавить Sentry (см. FINAL_SUMMARY.md)

4. **Оптимизировать изображения**
   - Vercel автоматически оптимизирует

### Ссылки

- 📖 Документация Vercel: https://vercel.com/docs
- 🚀 Dashboard: https://vercel.com/dashboard
- 💬 Support: support@vercel.com

---

**Готово! Приложение в интернете!** ✨
