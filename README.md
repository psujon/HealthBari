# হেলথ বাড়ি (HealthBari) - MySQL ফুলস্ট্যাক হেলথকেয়ার ই-কমার্স 🩺✨

**হেলথ বাড়ি (HealthBari)** এখন সম্পূর্ণ **MySQL ডাটাবেজ** আর্কিটেকচারে পরিচালিত।

---

## 🗄️ MySQL ডাটাবেজ কনফিগারেশন:

ডাটাবেজ কানেকশন সেটিংস `server/.env` ফাইলে দেওয়া আছে:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=healthbari
```

*(আপনি যদি **XAMPP / WAMP / cPanel phpMyAdmin / Live Server** ব্যবহার করেন, শুধু আপনার ইউজার ও পাসওয়ার্ড বসিয়ে দিলেই হবে।)*

---

## ⚡ এক ক্লিকে সম্পূর্ণ প্রজেক্ট রান করার নিয়ম:

টার্মিনালে শুধু নিচের কমান্ডটি দিন:
```bash
npm run dev
```
*(অথবা `npm start`)*

- **MySQL Database Auto-Setup:** সার্ভার চালু হওয়ার সাথে সাথেই স্বয়ংক্রিয়ভাবে `healthbari` ডাটাবেজ এবং টেবিলগুলো (`products`, `variants`, `orders`, `order_items`, `health_articles`) তৈরি হয়ে যাবে।
- **Backend API:** `http://localhost:5000`
- **Frontend UI:** `http://localhost:5173`

---

## 📦 ডাটাবেজ সীড (Seeding into MySQL):

ক্যাটালগ ও স্বাস্থ্য গাইড MySQL টেবিলে এন্ট্রি করতে রান করুন:
```bash
npm run seed
```

---

## 📄 কাস্টম phpMyAdmin ইমপোর্টের জন্য:
আপনার সুবিধার্থে একটি রেডিমেড SQL ফাইল [server/schema.sql](file:///f:/AAAA/HealthBari/server/schema.sql) রাখা হয়েছে।
