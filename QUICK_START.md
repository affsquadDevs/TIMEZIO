# ⚡ Швидкий старт для тестування

## 🚀 Запуск (1 команда)

```bash
cd /Users/admin/Desktop/globe/timezio && npm run dev
```

Відкрий: **http://localhost:3000/meeting-planner**

---

## 📝 Швидкий чеклист (5 хвилин)

### 1️⃣ Google OAuth
```
http://localhost:3000/api/auth/google
```
→ Увійди, дозволь доступ → редірект на `/meeting-planner`

### 2️⃣ Створи сесію
- Title: `Тест`
- Duration: `30`
- Range From: `2026-01-15T10:00`
- Range To: `2026-01-22T18:00`
→ Натисни **"Create Session"**

### 3️⃣ Додай participant
- Name: `Alice`
- Email: `alice@test.com`
- Timezone: `America/New_York`
- Lat: `40.7128`
- Lng: `-74.0060`
- City: `New York`
→ Натисни **"Add Participant"**

### 4️⃣ Згенеруй slots
→ Натисни **"Generate best slots"**
→ Має з'явитися список слотів зі скорингом

### 5️⃣ Тест Instant Mode
- Натисни **"Select"** на будь-якому слоті
- Натисни **"Confirm & Create Meet"**
→ Має з'явитися **Meet Link**

### 6️⃣ Тест Booking Mode
- Натисни **"Booking"**
- Скопіюй Booking Link
- Відкрий у новій вкладці
- Вибери слот, заповни форму
- Натисни **"Reserve Slot"**
→ Має з'явитися **Meet Link**

### 7️⃣ Тест Poll Mode
- Натисни **"Poll"**
- Скопіюй Poll Link
- Відкрий у новій вкладці
- Заповни форму, проголосуй Yes/Maybe/No
- Натисни **"Submit Vote"**
→ Підрахунки мають оновитися
- Повернись у `/meeting-planner`, натисни **"Confirm Best Slot"**
→ Має з'явитися **Meet Link** для найкращого слота

---

## 🔍 Перевірка помилок

**DevTools (F12):**
- **Network** → перевір HTTP статуси (200 ✅, 401/400/500 ❌)
- **Console** → JavaScript помилки
- **Application → Cookies** → має бути cookie `uid`

**Термінал:**
- Серверні логи при помилках
- Prisma помилки

**База даних:**
```bash
npx prisma studio
```
→ Перевір таблиці `User` та `MeetingSession`

---

## ⚠️ Типові помилки

| Помилка | Рішення |
|---------|---------|
| `Unauthorized (401)` | Повтори Google OAuth |
| `Google not connected` | У user немає `refreshToken`, повтор OAuth |
| `Not found (404)` | Session ID неправильний або не твій |
| Слоти не генеруються | Додай participant з timezone та location |
| Booking/Poll не працює | Спочатку згенеруй slots |

---

## 📚 Детальна інструкція

Дивись **`TESTING.md`** для повної покрокової інструкції з прикладами.

---

**Готово до тестування! 🎉**

