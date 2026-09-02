# 🤖 MockAI — AI Mock Interview Platform

> **Practice interviews. Build confidence. Get better with every attempt.**

MockAI is a full-stack AI-powered mock interview platform that helps developers and job seekers practice realistic interviews with an AI interviewer.

It combines **AI-powered conversations, voice interaction, resume-based questions, interview monitoring, and performance analysis** into one platform.

---

## ✨ Features

### 🎤 AI-Powered Interviews

Practice realistic technical and behavioral interviews with an AI interviewer that dynamically interacts with your responses.

### 🗣️ Voice-Based Interaction

Answer interview questions naturally using your voice and simulate a real interview environment.

### 📄 Resume-Based Interviews

Upload your resume and practice personalized questions based on your:

* Skills
* Projects
* Experience
* Education
* Technologies

### 🧠 Adaptive Follow-Up Questions

The AI can continue the conversation with follow-up questions based on your previous answers.

### 📊 Interview Performance Analysis

Get insights into your interview performance, including:

* Communication
* Clarity
* Confidence
* Technical Knowledge
* Answer Structure
* Problem Solving

### 👀 Interview Monitoring

The platform can monitor the interview environment using features such as:

* Webcam monitoring
* Face detection
* Tab/fullscreen monitoring
* Interview warnings

### 🔐 Authentication

Secure authentication with:

* Email & Password
* Google OAuth
* Protected routes
* JWT-based authentication

### 📈 Interview Reports

Review your interview after completion and identify areas that need improvement.

### 🎯 Personalized Practice

Practice according to the role and interview type you are preparing for.

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Framer Motion
* React Router
* Lucide Icons

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Google OAuth

## AI & Interview Technology

* AI-generated interview questions
* AI response evaluation
* Voice interaction
* Resume analysis
* Adaptive interview flow

## Deployment

* Vercel — Frontend
* Render — Backend
* MongoDB Atlas / MongoDB

---

# 🏗️ Project Architecture

```text
MockAI
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── services
│   │   ├── context
│   │   └── App.jsx
│   │
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── middleware
│   │   ├── services
│   │   └── utils
│   │
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repository.git
```

```bash
cd your-repository
```

---

# 💻 Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Frontend will typically run on:

```text
http://localhost:5173
```

---

# ⚙️ Backend Setup

Open another terminal and navigate to:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

---

# 🔑 Environment Variables

Never commit your `.env` file to GitHub.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
FRONTEND_URL=your_frontend_url
```

Add this to `.gitignore`:

```gitignore
.env
.env.local
node_modules
dist
```

---

# 🔄 How MockAI Works

```text
               ┌─────────────────┐
               │     User        │
               └────────┬────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Select Interview  │
              │ Role / Difficulty │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Resume Analysis   │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │  AI Interviewer   │
              └────────┬─────────┘
                       │
              ┌────────▼─────────┐
              │ Voice / Answer    │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ AI Evaluation     │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Follow-up Question│
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Interview Report  │
              └──────────────────┘
```

---

# 🎥 Interview Experience

The platform is designed to simulate an actual interview rather than simply displaying a list of questions.

### Typical flow

```text
Start Interview
      ↓
AI asks question
      ↓
Candidate answers
      ↓
AI analyzes response
      ↓
AI asks follow-up
      ↓
Conversation continues
      ↓
Interview ends
      ↓
Performance report
```

---

# 📊 Performance Dashboard

After completing an interview, users can review their performance and identify areas for improvement.

Example evaluation areas:

```text
Communication     █████████████████░░░  86%
Confidence        ████████████████░░░░  81%
Clarity           ██████████████████░░  90%
Problem Solving   █████████████████░░░  87%
Technical Depth   ██████████████████░░  91%
```

---

# 🔐 Security

MockAI uses several security mechanisms to protect user accounts and application data.

* JWT authentication
* Password hashing
* Protected API routes
* Google OAuth
* Environment variables for secrets
* CORS configuration
* Authenticated frontend routes

---

# 📱 Responsive Design

MockAI is designed to work across:

* 💻 Desktop
* 🖥️ Large screens
* 📱 Mobile
* 📲 Tablet

The interview interface adapts to different screen sizes while keeping the core experience accessible.

---

# 🎨 UI & UX

The platform focuses on a modern SaaS-style interface with:

* Responsive layouts
* Dark / light appearance
* Smooth transitions
* Framer Motion animations
* Interactive interview interface
* Modern typography
* Clean dashboard components
* Product-focused landing page

---

# 🌐 Deployment

### Frontend

The React frontend can be deployed using:

```text
Vercel
```

### Backend

The Node.js backend can be deployed using:

```text
Render
```

### Database

MongoDB can be hosted using:

```text
MongoDB Atlas
```

Typical production architecture:

```text
             ┌──────────────┐
             │   Vercel     │
             │   Frontend   │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │    Render    │
             │   Backend    │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │   MongoDB    │
             │     Atlas    │
             └──────────────┘
```

---

# 🧪 Development

Run frontend:

```bash
cd frontend
npm run dev
```

Run backend:

```bash
cd backend
npm run dev
```

Build frontend:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# 🗂️ Core Modules

| Module            | Purpose                           |
| ----------------- | --------------------------------- |
| Authentication    | User registration and login       |
| Google OAuth      | Social authentication             |
| Interview Setup   | Configure interview               |
| Resume            | Upload and use resume information |
| AI Interviewer    | Conduct interview                 |
| Voice Interaction | Speech-based answers              |
| Proctoring        | Monitor interview environment     |
| Evaluation        | Analyze answers                   |
| Reports           | Display performance               |
| Dashboard         | Manage interview history          |

---

# 🔮 Future Improvements

Some possible improvements for future versions:

* Real-time AI voice conversations
* More specialized interview models
* Coding interview mode
* Live coding editor
* Company-specific interview preparation
* Interview history comparison
* Advanced analytics
* Personalized learning paths
* Multi-language interviews
* More realistic AI interviewer personalities

---

# 🤝 Contributing

Contributions are welcome.

```bash
git fork
git clone
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

Then open a Pull Request.

---

# 📜 License

This project is intended for learning, portfolio, and educational purposes.

---

# ⭐ Project

**MockAI — AI Mock Interview Platform**

Built to help candidates practice interviews, understand their weaknesses, and become more confident before the real interview.

> **Don't just prepare answers. Practice the interview.**

---

## 💡 Why MockAI?

Traditional interview preparation often looks like:

```text
Read questions → Memorize answers → Hope for the best
```

MockAI changes that into:

```text
Practice → Speak → Get feedback → Improve → Repeat
```

### 🚀 Practice smarter. Interview better.
