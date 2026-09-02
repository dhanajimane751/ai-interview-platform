# 🤖 MockAI — AI Mock Interview Platform

> Practice realistic interviews with an AI interviewer and improve after every session.

\

## ✨ Features

* 🤖 AI-generated technical mock interviews
* 📄 Resume-based interview questions
* 🧠 Dynamic follow-up questions
* 🎤 Voice-based interview interaction
* 📝 Speech-to-text transcription
* 🔊 AI interviewer text-to-speech
* 🎥 Webcam-based face detection
* 👀 Tab switch, focus loss and fullscreen monitoring
* 📊 AI-generated interview reports
* 📈 Interview history and performance tracking
* 🔐 Email/password authentication
* 🔵 Google OAuth login
* 🔑 Email verification and password reset
* 👤 Profile and avatar management
* ⚙️ Voice, theme and interview preferences
* 🌙 Light / Dark mode

## 🛠️ Tech Stack

### Frontend

* React 18
* Vite
* Tailwind CSS
* Framer Motion
* React Router
* Redux Toolkit
* Axios
* React Hook Form
* Recharts
* React Webcam
* Lucide React
* face-api.js

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Passport.js
* Google OAuth 2.0
* Groq SDK
* Multer
* pdf-parse
* Cloudinary
* Brevo
* Helmet
* Express Rate Limit

## 🎙️ Voice & AI

### AI Interview Generation

**Groq API** is used for generating interview questions, follow-up questions and interview reports.

### Speech Capture

The browser **Web Speech API (****`SpeechRecognition`**** / ****`webkitSpeechRecognition`****)** captures spoken answers and converts them into text.

### AI Interviewer Voice

The browser **Web Speech API (****`speechSynthesis`****)** generates the interviewer's spoken voice using voices available on the user's device.

### Audio Recording

The **MediaRecorder API** and `getUserMedia()` are used for microphone audio capture.

### Audio Transcription

Uploaded audio can be transcribed on the backend using:

`Groq Whisper — whisper-large-v3-turbo`

## 👁️ Face Detection & Proctoring

Face detection is implemented with:

**face-api.js + Tiny Face Detector**

The project includes the Tiny Face Detector model files:

```text
frontend/public/models/
├── tiny_face_detector_model-weights_manifest.json
└── tiny_face_detector_model-shard1
```

The system detects:

* No face
* Multiple faces
* Single visible face

It also records:

* Tab switches
* Window focus loss
* Fullscreen exits
* Camera errors
* Microphone errors
* Face-detection warnings

## 📄 Resume Processing

Users can upload a PDF resume.

The backend uses **pdf-parse** to extract resume text, which is then provided as context to the AI interview system.

## 📊 Interview Reports

After an interview, the platform generates an AI report containing scores and feedback for areas such as:

* Technical knowledge
* Communication
* Confidence
* Grammar
* Professionalism
* Problem solving
* Voice
* Eye contact
* Time management
* Proctoring

It also provides strengths, weaknesses, improvements and an overall interview rating.

## 🔐 Authentication

* JWT authentication
* HTTP-only cookies
* Google OAuth 2.0
* Email verification
* Password reset
* Protected routes
* Rate limiting

## 🏗️ Project Structure

```text
ai-interview-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── redux/
│   │   └── routes/
│   └── public/models/
│
├── backend/
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── middlewares/
│       └── config/
│
└── README.md
```

## 🚀 Run Locally

### Clone

```bash
git clone https://github.com/dhanajimane751/ai-interview-platform.git
cd ai-interview-platform
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Create the required environment variables for MongoDB, JWT, Groq, Google OAuth, Cloudinary, email services and frontend/backend URLs.

## 🌐 Live

**Live Demo:**
https://ai-interview-platform-dm.vercel.app/

**GitHub:**
https://github.com/dhanajimane751/ai-interview-platform

## 👨‍💻 Project

**MockAI — AI Mock Interview Platform**

Built with React, Node.js, MongoDB, Groq, face-api.js and modern web technologies.

> **Don't just prepare answers. Practice the interview.**
