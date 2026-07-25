# SentinelAI - Intelligent Multimodal Emergency Response System

SentinelAI is an AI-powered emergency response platform that intelligently detects emergencies through multiple input modalities (Text, Speech, Computer Vision, and Manual SOS) and instantly notifies trusted emergency contacts with the user's live location.

> **Note**: SentinelAI is designed to demonstrate enterprise-grade full-stack software engineering, AI integration, REST API design, real-time location tracking, and clean architecture. It notifies trusted contacts designated by the user and does not automatically contact public emergency services.

---

## 🌟 Key Features

- **User Authentication**: Secure JWT-based registration, login, and protected routes.
- **Emergency Contact Management**: Full CRUD management of trusted contacts and relationships.
- **Manual SOS Trigger**: One-touch instant emergency alert with live GPS position capture.
- **AI Text Emergency Detection**: NLP-based text classification using DistilBERT.
- **AI Voice Emergency Detection**: Speech-to-text conversion via OpenAI Whisper fed into classification pipeline.
- **AI Image Emergency Detection**: Computer vision object detection using YOLOv8 for detecting weapons, accidents, fire, smoke, and incapacitated persons.
- **Live Location Tracking**: Interactive maps powered by Leaflet and OpenStreetMap.
- **Real-Time Push Notifications**: Instant alerting via `ntfy.sh` notification service.
- **Emergency Event History & Analytics**: Event timeline logging and interactive data visualization.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State & HTTP**: Axios, React Context API
- **Animations**: Framer Motion
- **Maps**: Leaflet, OpenStreetMap

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **ORM**: SQLAlchemy
- **Validation & Settings**: Pydantic v2
- **Security**: PyJWT, Passlib (bcrypt)

### Artificial Intelligence
- **Text**: DistilBERT
- **Voice**: OpenAI Whisper
- **Vision**: YOLOv8

### Notifications
- **Push Notification Service**: `ntfy.sh` (NtfyNotificationService)

---

## 📁 Repository Structure

```
SentinelAI/
├── frontend/             # React SPA (Vite + Tailwind CSS + Leaflet)
├── backend/              # FastAPI Application (Clean Architecture)
│   └── app/
│       ├── api/          # REST API endpoints (v1)
│       ├── core/         # Configuration & security settings
│       ├── database/     # DB Session & Base ORM model
│       ├── models/       # SQLAlchemy models
│       ├── schemas/      # Pydantic schemas
│       ├── repositories/ # DB access abstractions
│       ├── services/     # Business logic
│       ├── notifications/# NtfyNotificationService
│       ├── ai/           # ML model wrappers (DistilBERT, Whisper, YOLOv8)
│       ├── utils/        # Helper functions
│       └── main.py       # FastAPI application entry point
├── docs/                 # System documentation & diagrams
├── assets/               # Screenshots, mockups, media assets
├── README.md
├── LICENSE
└── .gitignore
```

---

## 🚀 Quick Start (Development Setup)

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Git

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend application will run on `http://localhost:5173`.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
