# 🧪 Інструкція для тестування Meeting Planner

## 📋 Перед тестуванням

### 1. Перевірка налаштувань

Переконайся, що у тебе є `.env` файл:

```bash
cd /Users/admin/Desktop/globe/timezio
cat .env
```

Має містити:
```
DATABASE_URL="file:./prisma/dev.db"
GOOGLE_CLIENT_ID="твій-client-id"
GOOGLE_CLIENT_SECRET="твій-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

### 2. Запуск бази даних

```bash
# Якщо база даних ще не створена
npx prisma migrate dev --name init

# Якщо є зміни в схемі
npx prisma migrate dev
```

### 3. Запуск сервера

```bash
npm run dev
```

Сервер запуститься на `http://localhost:3000`

---

## 🧪 Покрокове тестування

### Крок 1: Google OAuth (Авторизація)

1. **Відкрий браузер** і перейди на:
   ```
   http://localhost:3000/api/auth/google
   ```

2. **Увійди в Google** і дозволь доступ до Calendar Events

3. **Після редіректу** маєш опинитися на `/meeting-planner`

4. **Перевір cookie**:
   - Відкрий DevTools (F12)
   - Application → Cookies → `http://localhost:3000`
   - Має бути cookie `uid` (httpOnly)

✅ **Очікуваний результат:** Cookie `uid` встановлений, ти на сторінці `/meeting-planner`

---

### Крок 2: Створення Meeting Session (Instant Mode)

1. **На сторінці** `/meeting-planner` заповни форму:

   - **Title:** `Тестова зустріч`
   - **Description:** `Перевірка функціоналу`
   - **Duration:** `30` (хвилин)
   - **Range From:** `2026-01-15T10:00` (datetime-local, твій локальний час)
   - **Range To:** `2026-01-22T18:00`

2. **Натисни "Create Session"**

3. **Перевір результат:**
   - Має з'явитися секція з `Session ID`
   - Має відобразитися Title, Duration, Range

✅ **Очікуваний результат:** Session створено, відображається Session ID

---

### Крок 3: Додавання Participants

1. **Заповни форму учасника:**

   **Учасник 1 (Нью-Йорк):**
   - Name: `Alice`
   - Email: `alice@test.com`
   - Timezone: `America/New_York`
   - Lat: `40.7128`
   - Lng: `-74.0060`
   - City: `New York`
   - Country: `US`

2. **Натисни "Add Participant"**

3. **Повтори для учасника 2 (Берлін):**

   - Name: `Bob`
   - Email: `bob@test.com`
   - Timezone: `Europe/Berlin`
   - Lat: `52.5200`
   - Lng: `13.4050`
   - City: `Berlin`
   - Country: `DE`

4. **Перевір результат:**
   - У списку "Participants" мають з'явитися 2 учасники
   - На карті мають з'явитися маркери для обох учасників
   - Натисни "Center map to all participants" - карта має центруватися

✅ **Очікуваний результат:** 2 participants додано, маркери на карті

---

### Крок 4: Генерація Best Slots

1. **У секції "Generate Slots"** налаштуй параметри:

   - **Step Minutes:** `30` (крок для генерування слотів)
   - **Max Candidates:** `500` (максимум кандидатів)
   - **Top N:** `10` (скільки найкращих слотів показати)

2. **Натисни "Generate best slots"**

3. **Перевір результат:**
   - Має з'явитися список "Proposed Slots" (до 10 слотів)
   - Під кожним слотом має бути:
     - UTC час
     - **Breakdown** для кожного учасника:
       - Ім'я + timezone
       - Локальний час початку/кінця
       - **Bucket** (green/yellow/red) - якість слота
   - Слоти відсортовані за **Score** (вищі перші)
   - Нічні слоти (22:00-07:00) мають низькі score або red bucket

✅ **Очікуваний результат:** Список слотів зі скорингом та breakdown

---

### Крок 5: Instant Mode (Ручний вибір слота)

1. **Вибери будь-який слот** (найкраще з зеленим bucket)

2. **Натисни "Select"** на обраному слоті

3. **Перевір:**
   - У секції "Selected Slot" має з'явитися обраний слот

4. **Натисни "Confirm & Create Meet"**

5. **Перевір результат:**
   - Має з'явитися **Meet Link** та **Event ID**
   - Подія має з'явитися в твоєму **Google Calendar**
   - Meet Link має працювати (відкрий його в новій вкладці)

✅ **Очікуваний результат:** Google Meet event створено, Meet Link працює

---

### Крок 6: Booking Mode (Як Calendly)

1. **Після генерації слотів** натисни кнопку **"Booking"**

2. **Має з'явитися Booking Link**, наприклад:
   ```
   http://localhost:3000/book/abc123xyz
   ```

3. **Відкрий Booking Link** у **новій вкладці** (або інкогніто)

4. **Перевір публічну сторінку:**
   - Має відображатися Title та Description
   - Має бути список доступних слотів
   - Під кожним слотом:
     - UTC час
     - **Твій локальний час** (часовий пояс браузера)

5. **Вибери слот** (натисни на нього)

6. **Заповни форму резервації:**
   - Name: `Guest User`
   - Email: `guest@test.com`

7. **Натисни "Reserve Slot"**

8. **Перевір результат:**
   - Має з'явитися **Meet Link** та **Event ID**
   - Подія має з'явитися в твоєму **Google Calendar**
   - Meet Link має працювати

9. **Спробуй зарезервувати знову** (має бути помилка 409 "Already reserved")

✅ **Очікуваний результат:** Booking працює, Meet створено, повторна резервація заблокована

---

### Крок 7: Poll Mode (Як Doodle)

1. **У `/meeting-planner`** після генерації слотів натисни кнопку **"Poll"**

2. **Має з'явитися Poll Link**, наприклад:
   ```
   http://localhost:3000/poll/clx123...
   ```

3. **Відкрий Poll Link** у **новій вкладці**

4. **Перевір публічну сторінку:**
   - Має відображатися Title та Description
   - Має бути список слотів з кнопками **Yes / Maybe / No**
   - Під кожним слотом:
     - UTC час
     - Твій локальний час
     - Початкові підрахунки: `Yes (0) Maybe (0) No (0)`

5. **Заповни форму:**
   - Name: `Voter 1`
   - Email: `voter1@test.com`

6. **Проголосуй:**
   - Натисни **"Yes"** на 2-3 слотах
   - Натисни **"Maybe"** на інших
   - Натисни **"No"** на решті

7. **Натисни "Submit Vote"**

8. **Перевір результат:**
   - Має з'явитися повідомлення "Your votes have been submitted!"
   - Підрахунки мають оновитися, наприклад: `Yes (1) Maybe (1) No (1)`

9. **Відкрий Poll Link** у **ще одній вкладці** (інший браузер/інкогніто)

10. **Проголосуй іншим email:**
    - Name: `Voter 2`
    - Email: `voter2@test.com`
    - Проголосуй іншими значеннями

11. **Перевір результат:**
    - Підрахунки мають оновитися для обох вкладок
    - Наприклад: `Yes (2) Maybe (1) No (0)` (якщо обидва проголосували Yes)

12. **Повернись у `/meeting-planner`** і натисни **"Confirm Best Slot (from votes)"**

13. **Перевір результат:**
    - Має з'явитися **Meet Link** для слота з найбільшою кількістю "Yes"
    - Подія має з'явитися в **Google Calendar**

✅ **Очікуваний результат:** Poll працює, голоси враховуються, найкращий слот підтверджено

---

## 🐛 Перевірка помилок

### Якщо щось не працює:

1. **Перевір DevTools → Network:**
   - Відкрий DevTools (F12)
   - Вкладка Network
   - Спробуй виконати дію
   - Перевір HTTP статуси (має бути 200, не 401/400/500)

2. **Перевір DevTools → Console:**
   - JavaScript помилки
   - React помилки

3. **Перевір термінал** (де запущено `npm run dev`):
   - Серверні логи
   - Помилки бази даних

4. **Перевір cookie:**
   - Application → Cookies → `http://localhost:3000`
   - Має бути cookie `uid`

5. **Перевір базу даних:**
   ```bash
   npx prisma studio
   ```
   - Перевір таблиці `User` та `MeetingSession`

---

## 🔍 Типові проблеми та рішення

### Проблема: "Unauthorized" (401)
**Рішення:** Cookie `uid` не встановлений. Повтори Крок 1 (Google OAuth).

### Проблема: "Google not connected" (400)
**Рішення:** У користувача немає `refreshToken`. Повтори Google OAuth.

### Проблема: "Not found" (404)
**Рішення:** Session ID неправильний або сесія не належить тобі. Перевір `creatorId`.

### Проблема: Слоти не генеруються
**Рішення:** Переконайся, що додано хоча б одного participant з timezone та location.

### Проблема: Booking/Poll Link не працює
**Рішення:** 
- Переконайся, що спочатку згенеровано slots (`Generate best slots`)
- Перевір, чи правильний mode (booking або poll)

---

## 📝 Приклад curl тестування

### Створити сесію:
```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -H "Cookie: uid=ТВІЙ_UID" \
  -d '{
    "title": "Test Meeting",
    "description": "Testing",
    "durationMinutes": 30,
    "rangeFromISO": "2026-01-15T10:00:00Z",
    "rangeToISO": "2026-01-22T18:00:00Z"
  }'
```

### Додати participant:
```bash
curl -X POST http://localhost:3000/api/meetings/SESSION_ID/participants \
  -H "Content-Type: application/json" \
  -H "Cookie: uid=ТВІЙ_UID" \
  -d '{
    "name": "Alice",
    "email": "alice@test.com",
    "timezone": "America/New_York",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "city": "New York",
      "countryCode": "US"
    }
  }'
```

### Згенерувати slots:
```bash
curl -X POST http://localhost:3000/api/meetings/SESSION_ID/generate-slots \
  -H "Content-Type: application/json" \
  -H "Cookie: uid=ТВІЙ_UID" \
  -d '{
    "stepMinutes": 30,
    "maxCandidates": 500,
    "topN": 10
  }'
```

---

## ✅ Чеклист тестування

- [ ] Google OAuth працює, cookie встановлено
- [ ] Створення сесії працює
- [ ] Додавання participants працює
- [ ] Маркери на карті відображаються
- [ ] Генерація slots працює, scoring правильний
- [ ] Instant mode: вибір слота та створення Meet працює
- [ ] Booking mode: public link працює, резервація створює Meet
- [ ] Poll mode: голосування працює, підрахунки оновлюються
- [ ] Poll mode: "Confirm Best Slot" працює
- [ ] Google Calendar event створюється правильно
- [ ] Meet Link працює (відкривається в Google Meet)

---

**Успішного тестування! 🚀**

