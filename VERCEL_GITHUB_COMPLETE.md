# 🚀 Полная инструкция: Vercel + GitHub + Автоматический Deploy

Это пошаговая инструкция как сделать приложение доступным по ссылке с автоматическим обновлением при каждом push.

---

## 📋 Что произойдет

```
Вы делаете изменения в коде
    ↓ (git push)
GitHub получает новый код
    ↓ (автоматически)
Vercel видит изменения
    ↓ (автоматически)
Vercel собирает приложение (npm run build)
    ↓ (~30 сек)
Развертывает на сервер
    ↓
Приложение обновилось в интернете!
```

**Никаких действий на Vercel не нужно — всё автоматическое!** ✨

---

## 🎯 Шаг за шагом

### Этап 1: GitHub (если ещё не сделали)

#### 1.1 Создать репо на GitHub

1. Перейти на https://github.com/new
2. Название: `romantik-booking` (или любое другое)
3. Описание: `Booking app for Romantik eco-resort`
4. Public (чтобы доступно всем)
5. Нажать **Create repository**

Скопировать URL репо (что-то типа):
```
https://github.com/YOUR_USERNAME/romantik-booking.git
```

#### 1.2 Загрузить код на GitHub

**Способ 1: Через Git (командная строка)**

```bash
# Перейти в папку проекта
cd "C:\Users\shato\OneDrive\Desktop\база-отдыха-романтик (1)"

# Инициализировать git (если не сделали)
git init

# Добавить все файлы
git add .

# Первый коммит
git commit -m "Initial commit: Romantik booking app"

# Добавить remote (замените на свой URL)
git remote add origin https://github.com/YOUR_USERNAME/romantik-booking.git

# Загрузить на GitHub
git branch -M main
git push -u origin main
```

**Способ 2: GitHub Desktop (графический)**

1. Скачать https://desktop.github.com
2. File → Clone repository → URL
3. Вставить URL своего репо
4. File → New repository → выбрать папку проекта
5. Publish repository

#### 1.3 Проверить что код загружен

Откройте https://github.com/YOUR_USERNAME/romantik-booking

Должны видеть все файлы проекта ✅

---

### Этап 2: Vercel (Deploy)

#### 2.1 Создать аккаунт Vercel

1. Перейти на https://vercel.com
2. Нажать **Sign Up**
3. **Continue with GitHub** (авторизоваться через GitHub)
4. Разрешить доступ к GitHub репо

#### 2.2 Импортировать проект

**Способ 1: Через Vercel Dashboard (проще)**

1. После входа → https://vercel.com/dashboard
2. Нажать **Add New Project**
3. Выбрать репо `romantik-booking`
4. Нажать **Import**
5. В конфигурации оставить по умолчанию
6. Нажать **Deploy**

Ждите 1-2 минуты... готово! 🎉

**Способ 2: Через Vercel CLI**

```bash
# Установить Vercel CLI (один раз)
npm install -g vercel

# Перейти в папку проекта
cd "C:\Users\shato\OneDrive\Desktop\база-отдыха-романтик (1)"

# Запустить deploy
vercel

# Ответить на вопросы:
# ? Set up and deploy? → Y
# ? Which scope? → Ваше имя
# ? Link to existing project? → N
# ? Project name? → romantik-booking
# ? Directory? → . (точка)
# ? Modify vercel.json? → N
# ? Production? → Y
```

#### 2.3 Получить URL приложения

После деплоя Vercel покажет URL:
```
✅ Production: https://romantik-booking.vercel.app
```

**Это ваша ссылка!** 🌐

---

### Этап 3: Автоматический Deploy (CI/CD)

Vercel **уже** настроен на автоматический deploy! Ничего дополнительно не нужно.

**Как это работает:**

1. GitHub и Vercel уже связаны (через OAuth при регистрации)
2. Когда вы делаете `git push` на main
3. GitHub уведомляет Vercel о новых изменениях
4. Vercel автоматически:
   - Забирает новый код
   - Запускает `npm run build`
   - Развертывает на сервер
   - Обновляет сайт

**Готово! Автоматизация включена!** ✨

---

## ✅ Проверить что работает

### Шаг 1: Открыть приложение

```
https://romantik-booking.vercel.app
```

Должны видеть каталог домиков ✅

### Шаг 2: Сделать изменение

Например, изменить текст в компоненте:

```bash
# Откройте файл
src/components/Header.tsx

# Найдите текст "Романтик" и измените на что-то другое
```

### Шаг 3: Загрузить на GitHub

```bash
# Добавить изменения
git add src/components/Header.tsx

# Коммит
git commit -m "Update header text"

# Push на GitHub
git push
```

### Шаг 4: Проверить автоматический deploy

1. Откройте https://vercel.com/dashboard
2. Выберите проект romantik-booking
3. Вкладка **Deployments** — должна появиться новая сборка
4. Ждите статус ✅ **Ready**
5. Откройте приложение — текст изменился! 🎉

---

## 🔄 Рабочий процесс (каждый день)

Так вы будете работать каждый раз:

```bash
# 1. Сделать изменения в коде
# (редактировать файлы, добавлять компоненты, и т.д.)

# 2. Проверить локально
npm run dev
# Открыть http://localhost:5173 и тестировать

# 3. Добавить изменения
git add .

# 4. Коммит
git commit -m "Описание что изменили"

# 5. Push на GitHub
git push

# 6. Profit! 🎉
# Vercel автоматически обновляет приложение
```

**Всё это займет 2-3 минуты** от редактирования до live сайта!

---

## 🔐 Переменные окружения

### Если нужны переменные (для Firestore, Yookassa и т.д.):

#### На локальной машине

Создать файл `.env.local`:

```
VITE_FIREBASE_PROJECT_ID=nimble-cairn-ssx2c
VITE_FIREBASE_API_KEY=AIzaSyBAgqdJMxuAEFTPSSHvpUkIkVV0712X7vA
VITE_YOOKASSA_SHOP_ID=your_shop_id
VITE_YOOKASSA_API_KEY=your_api_key
```

#### На Vercel

1. Откройте https://vercel.com/dashboard
2. Выберите проект romantik-booking
3. **Settings** → **Environment Variables**
4. Добавьте переменные:

```
VITE_FIREBASE_PROJECT_ID = nimble-cairn-ssx2c
VITE_FIREBASE_API_KEY = AIzaSyBAgqdJMxuAEFTPSSHvpUkIkVV0712X7vA
```

✅ Vercel автоматически пересоберет приложение с новыми переменными

---

## 📊 Мониторинг развертываний

### На Vercel Dashboard можно видеть:

1. **Deployments** — история всех развертываний
2. **Analytics** — трафик и производительность
3. **Logs** — логи ошибок
4. **Settings** — настройки проекта

### Статусы deploy:

- 🟡 **Queued** — ждет очереди
- 🔵 **Building** — собирает приложение
- ⚪ **Ready** — готово и live
- 🔴 **Error** — ошибка при сборке

---

## 🆘 Troubleshooting

### Проблема: Deploy failed

**Решение:**

1. Откройте Vercel Dashboard
2. Найдите failed deploy
3. Нажмите на него
4. Смотрите **Build Logs** — там будет ошибка
5. Исправьте код локально
6. `git push` — Vercel пересоберет

### Проблема: Изменения не появились

**Решение:**

```bash
# Проверьте что вы сделали push
git log --oneline | head -5

# Если коммита нет:
git status  # смотрите какие файлы не добавлены

# Если коммит есть но не pushed:
git push
```

### Проблема: 404 при открытии

**Решение:**

1. Проверьте что в Vercel есть файл `vercel.json`
2. Если нет — добавьте его (см. ниже)

```bash
# Скопируйте содержимое vercel.json и создайте файл
# Затем git add, commit, push
```

### Проблема: Старая версия открывается

**Решение:**

1. Hard refresh браузера: `Ctrl+Shift+R` (или Cmd+Shift+R на Mac)
2. Или откройте в приватном окне
3. Проверьте что Vercel показывает Ready ✅

---

## 📝 Файлы которые нужны

Убедитесь что в проекте есть:

```
romantik-booking/
├── vercel.json          ✅ (я создал, нужно git push)
├── package.json         ✅ (есть)
├── src/                 ✅ (есть)
├── index.html           ✅ (есть)
├── vite.config.ts       ✅ (есть)
└── .gitignore           ✅ (есть)
```

**vercel.json должен содержать:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🎯 Итоговый checklist

- [x] GitHub репо создан
- [ ] Код загружен на GitHub (`git push`)
- [ ] Vercel аккаунт создан
- [ ] Проект импортирован в Vercel
- [ ] vercel.json добавлен и pushed
- [ ] Deploy успешен (Ready ✅)
- [ ] Приложение открывается по ссылке
- [ ] Переменные окружения добавлены (если нужны)
- [ ] Первое изменение протестировано (git push + автоматический deploy)

---

## 🎉 Готово!

Теперь ваше приложение:

✅ Доступно по ссылке: https://romantik-booking.vercel.app  
✅ Автоматически обновляется при `git push`  
✅ Работает 24/7 на серверах Vercel  
✅ Имеет HTTPS и CDN  
✅ Масштабируется автоматически  

**Просто делайте `git push` — остальное автоматическое!** 🚀

---

## 📚 Ссылки

- 📖 Vercel Docs: https://vercel.com/docs
- 💬 GitHub: https://github.com
- 🚀 Ваше приложение: https://romantik-booking.vercel.app
- 📊 Vercel Dashboard: https://vercel.com/dashboard

---

## 💡 Рекомендации

### Для команды

Поделитесь ссылкой с командой:
```
https://romantik-booking.vercel.app
```

Все могут видеть приложение в реальном времени!

### Для мониторинга

1. Подпишитесь на email уведомления Vercel
2. Смотрите Deploy logs если что-то сломалось
3. Проверяйте Analytics для трафика

### Для разработки

Используйте GitHub branches для features:

```bash
# Создать новый branch
git checkout -b feature/new-component

# Работать на branch
# ...

# Push branch
git push -u origin feature/new-component

# На GitHub создать Pull Request
# Vercel автоматически создаст preview
# После merge → автоматический deploy в production
```

---

**Вопросы? Проверьте логи Vercel или GitHub!** 🔍
