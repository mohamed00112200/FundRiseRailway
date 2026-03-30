# 🚀 FundRise — Crowdfunding Platform

A modern and scalable crowdfunding platform built using **Vanilla JavaScript**, designed with a clean UI and structured architecture.

---

## 🌟 Overview

**FundRise** is a full-featured crowdfunding web application where users can create campaigns, support others, and track funding progress.

The platform supports **three roles**:

* 👤 Guest
* 🙋 User
* 🛠️ Admin

Each role has different permissions and dashboards.

---

## ✨ Features

### 👤 Guest

* Browse approved campaigns
* Search campaigns by title/description
* Filter campaigns by category

### 🙋 User

* Register & Login system
* Create and manage campaigns
* Edit own campaigns
* Upload campaign images (Base64)
* Support campaigns (mock payment flow)
* View personal pledge history

### 🛠️ Admin

* Manage users (ban / unban)
* Approve or reject campaigns
* Delete campaigns
* View all pledges
* Dashboard with sidebar navigation

---

## 🧠 Tech Stack

* **HTML5**
* **CSS3 (Modular & Responsive)**
* **Vanilla JavaScript (ES Modules)**
* **JSON Server (Mock REST API)**

---

## 📁 Project Structure

```
FundRise/
│
├── css/
├── js/
├── pages/
├── db.json
├── index.html
└── package.json
```

---

## ⚙️ Getting Started

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Run JSON Server

```bash
npm start

# npx json-server --watch db.json 

# npx json-server --watch db.json --port 3000

```

📍 API URL:

```
http://localhost:3000
```

### 3️⃣ Open the App

Open:

```
index.html
```

---

## 🔐 Demo Accounts

### 🛠️ Admin

```
Email: admin@fundrise.com
Password: admin123
```

### 🙋 User

```
Email: m@m.com
Password: 123
```

---

## 🔄 Core Functionalities

* Authentication & Authorization
* Role-based dashboards
* Campaign approval workflow
* CRUD operations using `fetch()`
* Pledge system with confirmation
* Image upload (Base64)
* Responsive UI design

---

## 📦 Git & GitHub

### Initialize Git

```bash
git init
git add .
git commit -m "Initial commit"
```

### Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/FundRise.git
git push -u origin main
```

---

## 💡 Suggested Improvements

* Integrate real payment gateway (Stripe)
* Add backend (Node.js / .NET)
* Add real authentication (JWT)
* Deploy on AWS / Vercel

---

## 👨‍💻 Author

**Mohamed Lotfy Mohamed Attia**

* Zagazig University
* Software Developer | JavaScript | .NET | AI Enthusiast

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🍴 Fork it
* 📢 Share it

---

🔥 *Fund the future, one idea at a time.*
