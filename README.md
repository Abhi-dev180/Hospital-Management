# 🏥 MedPark - Hospital Management System

> A modern, full-stack web application designed to streamline hospital operations, appointment scheduling, and feedback management. Built with React, Node.js, Express, and Supabase.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![Node](https://img.shields.io/badge/Node-22.12.0-339933)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Installation & Setup (Frontend)](#installation--setup-frontend)
- [Installation & Setup (Backend)](#installation--setup-backend)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Live Badges & Notifications](#live-badges--notifications)
- [Contributing](#contributing)
- [License](#license)

---

## 📌 Overview

**MedPark** is a comprehensive dashboard application built for Hospital Administrators and Super Admins. It provides real-time analytics, appointment tracking, feedback management, and calendar scheduling in a clean, modern interface.

This project was built with a focus on:
- **Responsive Design:** Works flawlessly on Desktop, Laptop, and Mobile devices.
- **Real-time Updates:** Polls backend APIs for instant badge notifications.
- **Role-Based Access Control (RBAC):** Distinct views for Admins vs Super Admins.

---

## ✨ Key Features

### 👨‍💼 Admin Dashboard
- **Overview:** Quick glance at hospital statistics.
- **Appointments:** Create, view, and track patient appointments.
- **Feedback Management:** View and manage patient feedback with call tracking status.
- **Calendar:** Visual grid view of daily appointments and events.
- **Hospital Timings:** Update operating hours and emergency availability.

### 🛡️ Super Admin Dashboard
- **Manage Hospitals & Admins:** Create and manage multiple hospital entities.
- **Demo & Registration Requests:** Approve or deny new registrations.
- **Live Notification Badges:** Red alerts for pending registrations, demos, contacts, and appointments.
- **System Analytics:** View global network statistics.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router DOM v6
- **State Management:** React Hooks (useState, useEffect, useMemo)

### Backend (Separate Repo)
- **Runtime:** Node.js (v22.12.0)
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Nodemailer (OAuth2 / Gmail API)

---

## 📂 Folder Structure (Frontend)

```bash
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and logos
│   ├── components/         # Reusable UI components (Navbar, Loader, Pagination)
│   ├── hooks/              # Custom React hooks (useAdminBadges, useSuperAdminBadges)
│   ├── pages/              # Main application pages
│   │   ├── admin/          # Admin specific pages
│   │   ├── superadmin/     # Super Admin specific pages
│   │   └── auth/           # Login/Registration pages
│   ├── config/             # API URL configurations
│   ├── App.jsx             # Main application wrapper
│   └── main.jsx            # Entry point
├── .env                    # Environment variables (NOT committed)
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation

---

💻 Installation & Setup (Frontend)
Clone the repository:

bash
git clone https://github.com/Abhi-dev180/Hospital-Management.git
cd Hospital-Management
Install dependencies:

bash
npm install
Start the development server:

bash
npm run dev
The app will be available at http://localhost:5173

🖥️ Installation & Setup (Backend)
Note: The backend is hosted in a separate repository: HMS_BACKEND

Clone the backend repository:

bash
git clone https://github.com/Abhi-dev180/HMS_BACKEND.git
cd HMS_BACKEND
Install dependencies:

bash
npm install
Configure Environment Variables:
Create a .env file in the root of the backend folder with the following variables:

env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_CLIENT_ID=your_google_client_id
EMAIL_CLIENT_SECRET=your_google_client_secret
EMAIL_REFRESH_TOKEN=your_google_refresh_token
Start the backend server:

bash
npm start
The API will be available at http://localhost:5000

🔐 Environment Variables
Create a .env file in the frontend root directory:

env
VITE_API_URL=http://localhost:5000
🚀 Usage
Logging In
Navigate to the login page (/login).

Use your admin or superadmin credentials.

Upon successful login, you will be redirected to your respective dashboard.

Managing Appointments & Feedback
Click on "Appointments" in the Admin Navbar to view all bookings.

Click on "Feedback" to monitor patient responses.

Use the "Add Feedback" button to manually create a feedback record. You can pre-fill data from existing appointments.

Using the Calendar
Navigate to the "Calendar" tab.

Use the arrows to change months or click "Today" to return to the current date.

Click on a specific date to view the scheduled events in the right-hand sidebar.

🔔 Live Badges & Notifications
This application features a real-time notification system for Admins and Super Admins:

For Admins:

Red badge on "Appointments" tab when a new appointment is booked.

Red badge on "Feedback" tab when new feedback is submitted (Status: Pending).

For Super Admins:

Red badges on "Demo Bookings", "Registrations", "Contacts", and "Appointments" tabs.

How it works: The frontend polls the backend /api/stats/overview endpoint every 15 seconds. When you navigate to a tab, the badge count automatically saves to localStorage and resets to 0 until new data arrives.

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

📬 Contact
Developer: Abhi-dev180
Project Link (Frontend): https://github.com/Abhi-dev180/Hospital-Management
Project Link (Backend): https://github.com/Abhi-dev180/HMS_BACKEND

text

### 📝 How to add this to your project:
1. Open your **Frontend** project in VS Code.
2. In the file explorer on the left, right-click and select **New File**.
3. Name the file **`README.md`** exactly.
4. Paste the entire block of code above into that file.
5. Press **`Ctrl + S`** to save.

### Next Step (Optional but recommended):
To make this README look beautiful on GitHub, you can **commit and push it**:
```bash
git add README.md
git commit -m "Add professional README file"
git push origin main
