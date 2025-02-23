# 📩 Message Scheduler API  

## 🚀 Overview  
The **Message Scheduler API** enables users to schedule messages for future delivery. It intelligently extracts recipient details, detects scheduling instructions, and ensures messages are sent at the correct time. If no scheduling details are found, the message is sent immediately.  

## ✨ Features  
✅ **Automated Message Scheduling** – Extracts recipient, date, and time from user input.  
✅ **Immediate Delivery** – If a message is not a schedule or reminder, it is sent right away.  
✅ **Time Zone Handling** – Automatically detects the system’s timezone for accurate scheduling.  
✅ **Default Recipient** – Assigns a default recipient (`default@recipient.com`) if none is provided.  
✅ **Reliable Delivery** – Uses `node-cron` and `nodemailer` for efficient message dispatch.  
✅ **Persistent Storage** – Saves scheduled messages in MongoDB for tracking and retrieval.  

---

## 🛠 Installation & Setup  

### 1️⃣ Clone the Repository  
```sh
git clone https://github.com/your-repo/message-scheduler.git
cd message-scheduler
```

### 2️⃣ Install Dependencies  
```sh
npm install
```

### 3️⃣ Configure Environment Variables  
Create a `.env` file and add the required credentials:  
```sh
GEMINI_API_KEY=your_google_gemini_api_key
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```
🔹 **Note:** Each user must generate their own Gemini API key.  

### 4️⃣ Start the Server  
```sh
npm run dev
```
🔹 The server will run on `http://localhost:4832`.  

---

## 📡 API Endpoints  

### 📌 Schedule a Message  
**POST** `/schedule`  

📤 **Request Body:**  
```json
{
  "message": "Send an update to user@example.com at 10 AM tomorrow."
}
```  
✅ **Response:**  
```json
{
  "message": "Your message ('Send an update') to ('user@example.com') has been scheduled for Monday, February 26, 2025, at 10:00 AM.",
  "status": "success"
}
```  

🔹 If the message is **not** a schedule or reminder, it is **sent immediately** instead.  

---

### 📌 Get Integration Details  
**GET** `/integration`  

🔹 Returns metadata about the scheduler’s integration capabilities.  

---

## 🔄 Message Processing Flow  
1️⃣ **Extracts recipient, message content, and scheduling details** using Gemini AI.  
2️⃣ **Schedules message** for the detected date and time.  
3️⃣ If no scheduling details are found, **sends the message immediately**.  
4️⃣ Uses `node-cron` to check and **send scheduled messages** every minute.  

---

## 🧪 Running Tests  
Run tests to verify message processing and scheduling logic:  
```sh
npm test
```

### ✅ Test Cases Covered  
✔ **Valid message scheduling** (email, time, and message detected)  
✔ **Assigning a default recipient** when none is found  
✔ **Handling invalid or empty messages**  
✔ **Ensuring time conversion accuracy**  
✔ **Immediate message delivery when no scheduling details exist**  

---

## 📌 Notes  
- Messages without a valid scheduling instruction **are sent immediately**.  
- Timezone handling is automatic, using the **system’s timezone**.  
- Failed deliveries are logged for troubleshooting.  

---

## 📜 License  
This project is licensed under the **MIT License**.  

🚀 **Happy Scheduling!** 🎯  
