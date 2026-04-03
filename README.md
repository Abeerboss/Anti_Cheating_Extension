# 🛡 Anti-Cheating Extension

A Chrome extension that monitors student activity during online exams and reports violations to the teacher in real time via Firebase Firestore.

---

## Features

- **Teacher Portal** — Login, manage students, view violation logs, export CSV reports
- **Student Portal** — Login, start exam, view your own violation history
- **Real-time monitoring** — All events are saved locally and pushed to Firebase instantly
- **Violation detection:**
  - Tab switching
  - Fullscreen exit
  - Copy / Cut / Paste attempts (keyboard and mouse)
  - Right-click
  - Page navigation / close attempts
  - DevTools (F12) blocked

---

## Project Structure

```
Anti_Cheating_Extension/
├── manifest.json       # Chrome Extension MV3 config
├── portal.html/js/css  # Role selector popup (Teacher / Student)
├── teacher.html/js/css # Teacher dashboard (full tab)
├── student.html/js/css # Student exam UI (popup)
├── auth.css            # Shared login & registration styles
├── shared.css          # Global shared styles
├── firebase.js         # Firestore REST API helpers
├── background.js       # Service worker — Firebase log relay
└── content.js          # Injected into all pages — event monitors
```

---

## Setup

### 1. Firebase

1. Create a project at [firebase.google.com](https://firebase.google.com)
2. Enable **Firestore Database**
3. Set Firestore rules to:
```
rules_version = '1';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
4. Copy your project credentials into `firebase.js` and `background.js`

### 2. Load the Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `Anti_Cheating_Extension` folder

---

## Usage

### Teacher
1. Click the extension icon → **Teacher**
2. Register or login
3. Add students from the dashboard
4. Monitor violations in real time

### Student
1. Click the extension icon → **Student**
2. Register or login with your Student ID
3. Enter the exam title → **Start Exam**
4. All activity is monitored until you click **End Exam**

---

## Tech Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript
- Firebase Firestore (REST API)
- HTML / CSS (JetBrains Mono + Syne fonts)

---

## Version

**v1.0** — Firebase backend, separate teacher/student portals, real-time violation logging
