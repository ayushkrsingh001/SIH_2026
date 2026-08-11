# 🛡️ RightsQuest - Empowering Children Through Legal Awareness (by Team JusticeBytes)

<div align="center">
  <img src="https://via.placeholder.com/800x200.png?text=RightsQuest+Banner+Placeholder" alt="RightsQuest Banner" />
</div>

<div align="center">
  <strong>Learn your rights, protect yourself, and become a Legal Hero through interactive AI-powered gameplay.</strong>
</div>
<br/>
<div align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.0.0-purple?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5.0.2-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-10.0.0-orange?style=for-the-badge&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
</div>

---

## 📑 Table of Contents
- [📖 Problem Statement](#-problem-statement)
- [💡 Proposed Solution](#-proposed-solution)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🏗️ System Architecture & Workflow](#-system-architecture--workflow)
- [🚀 Installation & Setup Instructions](#-installation--setup-instructions)
- [🎮 User Flows & Dashboards](#-user-flows--dashboards)
- [💡 Innovation & Uniqueness](#-innovation--uniqueness)
- [🔮 Future Scope](#-future-scope)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👥 Contributors](#-contributors)

---

## 📖 Problem Statement

Children and adolescents in India often lack foundational knowledge about their legal rights, personal safety boundaries, and the emergency mechanisms available to them. Traditional methods of teaching legal rights or safety (like textbooks or lectures) are often dry, complex, and fail to engage younger audiences. Without this critical knowledge, children remain vulnerable to cyberbullying, physical harassment, online scams, and abuse. 

**RightsQuest** solves this by gamifying legal and safety education. By turning complex Indian laws (like POCSO, IPC, IT Act) and constitutional rights into an engaging, interactive adventure, children learn how to navigate real-world dilemmas safely and responsibly.

## 💡 Proposed Solution

**RightsQuest** is an AI-powered educational web application designed for children aged 8-16. It features an interactive "Quest Map" where children progress through various themed islands (e.g., Cyber Guardian, Self Defence Academy). Each level presents them with dynamically generated scenarios, quizzes, and decision-making challenges based on real Indian laws.

The platform utilizes a **Dual-API AI Engine (Groq + OpenRouter)** to generate endless, personalized educational content tailored to the child's age and difficulty level. Parents have a dedicated dashboard to monitor their child's progress, view detailed AI-generated safety reports, and track their "AI Safety Twin" profile, ensuring peace of mind while the child learns.

---

## ✨ Key Features

1. **🗺️ Interactive Quest Map (World Map):** A visually stunning, gamified journey track with glassmorphic UI, dynamic progress rendering, and tactile nodes.
2. **🧠 Infinite AI Level Generation:** Uses advanced LLMs (Llama 3.1) to dynamically generate story-driven scenarios, multiple-choice questions, and true/false quizzes based on real Indian legal facts.
3. **⚡ Zero-Failure AI Dual-API Fallback:** An ultra-reliable backend architecture that attempts to fetch AI content from Groq, and seamlessly falls back to OpenRouter if rate limits or timeouts occur, ensuring 100% uptime.
4. **🎭 AI Safety Twin:** An underlying AI model that tracks a child's gameplay decisions to build a psychological and safety-awareness profile, highlighting strengths and vulnerabilities.
5. **📊 Multi-Role Dashboards:** 
   - **Child View:** Distraction-free, gamified learning interface.
   - **Parent View:** Comprehensive analytics, PDF report generation, and progress tracking.
   - **Admin View:** System oversight and management of localized help services.
6. **🤖 In-Game AI Mentor Widget:** A helpful companion that assists children when they get stuck on a difficult legal concept.
7. **🚨 Emergency "Need Help?" Module:** Quick access to verified Indian emergency contacts (1098 Childline, 1930 Cyber Crime, etc.) with localized support databases.
8. **📰 Automated News Fetching:** Integrated scripts to pull the latest relevant child-safety and legal news for the dashboard.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with custom utility classes for Glassmorphism and animations)
- **Animation:** Framer Motion
- **State Management:** Zustand
- **Routing:** React Router DOM v7
- **Data Visualization & Export:** Recharts (for analytics), html2canvas & jsPDF (for report generation)
- **Icons:** Material Symbols & Lucide React
- **Internationalization:** i18next

### Backend & Database
- **BaaS (Backend as a Service):** Firebase
- **Database:** Cloud Firestore (NoSQL)
- **Authentication:** Firebase Auth
- **Storage:** Firebase Cloud Storage

### AI & Third-Party APIs
- **Primary AI Engine:** Groq API (LLaMa-3.1-8b) via `groq-sdk`
- **Fallback AI Engine:** OpenRouter API (Meta Llama 3.1 8b Instruct)
- **News Integration:** NewsData API / GNews API 

---

## 🏗️ System Architecture & Workflow

The system is built on a modern serverless architecture ensuring scalability and low latency:

1. **Client Layer (React/Vite):** Handles all user interactions, animations, and state using Zustand. It strictly separates layouts based on user roles (`ChildLayout`, `ParentLayout`, `AdminLayout`).
2. **AI Service Layer:** Acts as the brain of the game. It intercepts requests for new levels, constructs highly detailed prompts with strict JSON output rules, and orchestrates the Dual-API fallback logic. 
3. **Data Layer (Firebase):** Handles all CRUD operations securely using Firebase rules. User progress, generated levels, and Safety Twin metrics are stored in Firestore documents.
4. **Execution Flow:**
   - Child clicks a locked node on the `WorldMap`.
   - The app calls the AI Service to generate a custom legal scenario.
   - The child plays through the `ScenarioPlayer`, making decisions.
   - Results are passed through the `aiLevelTransformer` to update the child's XP, Badges, and `SafetyTwinProfile`.
   - Parents view this aggregated data on their dashboard.

### 📂 Folder Structure
```text
📦 src
 ┣ 📂 animations      # Framer motion variants and reusable animations
 ┣ 📂 components      # Reusable UI components (Buttons, Cards, Modals, AIMentorWidget)
 ┣ 📂 constants       # Static configuration, API limits, and game metadata
 ┣ 📂 contexts        # React Context providers (AuthContext, ThemeContext)
 ┣ 📂 data            # Seed data and mock fallbacks
 ┣ 📂 firebase        # Firebase initialization, config, and Firestore helper functions
 ┣ 📂 layouts         # High-level wrappers (AdminLayout, ChildLayout, ParentLayout)
 ┣ 📂 pages           # Route-level components (WorldMap, ScenarioPlayer, Dashboards, Login)
 ┣ 📂 scripts         # Node scripts (e.g., fetchNews.ts)
 ┣ 📂 services        # Core business logic (groqService.ts, aiLevelTransformer.ts)
 ┣ 📂 types           # TypeScript interfaces and type definitions
 ┗ 📂 utils           # Helper functions (mapGenerator.ts, formatting)
```

---

## 🚀 Installation & Setup Instructions

### Prerequisites
- Node.js (v24+ recommended)
- A Firebase Project (with Firestore and Auth enabled)
- API Keys from [Groq](https://console.groq.com/) and [OpenRouter](https://openrouter.ai/)

### Steps to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayushkrsingh001/SIH_2026.git
   cd "SIH 2026"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # AI Configuration
   VITE_GROQ_API_KEY=your_groq_key
   VITE_OPENROUTER_API_KEY=your_openrouter_fallback_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## 🎮 User Flows & Dashboards

### 👦 Child Experience
The child's interface is built to be immersive and engaging. Upon logging in, they see the **Quest Map**. Selecting a node takes them into a scenario where they read a story, make decisions, and get instant AI feedback on their choices. Gamification elements like XP, badges, and streaks keep them motivated.

### 👨‍👩‍👦 Parent Dashboard
Parents can log in to a dedicated dashboard to monitor their child's activity. They get access to:
- **Safety Twin Profile**: Insights into the child's strengths and areas of vulnerability based on their in-game choices.
- **Detailed Analytics**: Graphs showing progress in different legal domains (e.g., Cyber Law, POCSO).
- **Downloadable Reports**: Generate PDF reports of the child's learning journey to discuss with them or educators.

### 🛡️ Admin Dashboard
System administrators can use the Admin panel to:
- Monitor system health and AI API usage.
- Update the localized emergency contacts database.
- Review flagged scenarios or user reports.

---

## 💡 Innovation & Uniqueness

1. **Procedural Educational Content:** Instead of hard-coding quizzes, the app uses an LLM to generate endless, highly specific legal dilemmas tailored to the child's exact age and previous performance. This ensures the game never gets repetitive.
2. **Dynamic UI Generation:** The `WorldMap.tsx` features a custom mathematical algorithm (`mapGenerator.ts`) to dynamically calculate bezier curves and SVG paths connecting procedural nodes, complete with animated gradients that adapt to the player's progress.
3. **Resilient AI Architecture:** The custom-built Dual-API fallback wrapper seamlessly routes traffic between Groq and OpenRouter within milliseconds upon failure, guaranteeing a **0% failure rate** for the end-user.

---

## 🔮 Future Scope

* **🌐 Multi-language Support:** Implementing localization (Hindi, regional languages) via AI translation prompts is a crucial next step for Indian accessibility.
* **📶 Offline Mode:** Caching generated levels locally for offline play using service workers and IndexedDB would greatly improve accessibility in low-bandwidth areas.
* **🗣️ Voice-to-Text Mentorship:** Upgrading the AI Mentor Widget to support voice input/output would make the platform more accessible to younger children who struggle with typing.
* **🚨 Hardware Integration:** Potential future scope includes integrating physical SOS buttons (IoT devices) that connect to the platform's Emergency Services module.

---

## 🤝 Contributing

We welcome contributions to RightsQuest! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is developed for SIH 2026. All rights reserved.

---

## 👥 Team JusticeBytes

* **Ayush Kumar Singh** - Lead Developer
* **[Team Member 2 Name]** - [Role]
* **[Team Member 3 Name]** - [Role]
* **[Team Member 4 Name]** - [Role]
* **[Team Member 5 Name]** - [Role]
* **[Team Member 6 Name]** - [Role]

> **Note:** If you are a team member, please add your name and role here!
