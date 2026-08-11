# RightsQuest 🛡️ - Empowering Children Through Legal Awareness

> **Tagline:** Learn your rights, protect yourself, and become a Legal Hero through interactive AI-powered gameplay.

## 📖 Problem Statement
Children and adolescents in India often lack foundational knowledge about their legal rights, personal safety boundaries, and the emergency mechanisms available to them. Traditional methods of teaching legal rights or safety (like textbooks or lectures) are often dry, complex, and fail to engage younger audiences. Without this critical knowledge, children remain vulnerable to cyberbullying, physical harassment, online scams, and abuse. 

**RightsQuest** solves this by gamifying legal and safety education. By turning complex Indian laws (like POCSO, IPC, IT Act) and constitutional rights into an engaging, interactive adventure, children learn how to navigate real-world dilemmas safely and responsibly.

## 💡 Proposed Solution
**RightsQuest** is an AI-powered educational web application designed for children aged 8-16. It features an interactive "Quest Map" where children progress through various themed islands (e.g., Cyber Guardian, Self Defence Academy). Each level presents them with dynamically generated scenarios, quizzes, and decision-making challenges based on real Indian laws.

The platform utilizes a Dual-API AI Engine (Groq + OpenRouter) to generate endless, personalized educational content tailored to the child's age and difficulty level. Parents have a dedicated dashboard to monitor their child's progress, view detailed AI-generated safety reports, and track their "AI Safety Twin" profile, ensuring peace of mind while the child learns.

---

## ✨ Key Features

* **Interactive Quest Map (World Map):** A visually stunning, gamified journey track with glassmorphic UI, dynamic progress rendering, and tactile nodes.
* **Infinite AI Level Generation:** Uses advanced LLMs (Llama 3.1) to dynamically generate story-driven scenarios, multiple-choice questions, and true/false quizzes based on real Indian legal facts.
* **Zero-Failure AI Dual-API Fallback:** An ultra-reliable backend architecture that attempts to fetch AI content from Groq, and seamlessly falls back to OpenRouter if rate limits or timeouts occur, ensuring 100% uptime.
* **AI Safety Twin:** An underlying AI model that tracks a child's gameplay decisions to build a psychological and safety-awareness profile, highlighting strengths and vulnerabilities.
* **Multi-Role Dashboards:** 
  * **Child View:** Distraction-free, gamified learning interface.
  * **Parent View:** Comprehensive analytics, PDF report generation, and progress tracking.
  * **Admin View:** System oversight and management of localized help services.
* **In-Game AI Mentor Widget:** A helpful companion that assists children when they get stuck on a difficult legal concept.
* **Emergency "Need Help?" Module:** Quick access to verified Indian emergency contacts (1098 Childline, 1930 Cyber Crime, etc.) with localized support databases.
* **Automated News Fetching:** Integrated scripts to pull the latest relevant child-safety and legal news for the dashboard.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React 19 + Vite (TypeScript)
* **Styling:** Tailwind CSS (with custom utility classes for Glassmorphism and animations)
* **Animation:** Framer Motion
* **State Management:** Zustand
* **Routing:** React Router DOM
* **Data Visualization & Export:** Recharts (for analytics), html2canvas & jsPDF (for report generation)
* **Icons:** Material Symbols & Lucide React

### Backend & Database
* **BaaS (Backend as a Service):** Firebase
* **Database:** Cloud Firestore (NoSQL)
* **Authentication:** Firebase Auth
* **Storage:** Firebase Cloud Storage

### AI & Third-Party APIs
* **Primary AI Engine:** Groq API (LLaMa-3.1-8b) - via `groq-sdk`
* **Fallback AI Engine:** OpenRouter API (Meta Llama 3.1 8b Instruct) - via direct REST Fetch
* **News Integration:** NewsData API / GNews API (configured via environment variables)

---

## 🏗️ System Architecture & Workflow

The system is built on a modern serverless architecture:

1. **Client Layer (React/Vite):** Handles all user interactions, animations, and state using Zustand. It strictly separates layouts based on user roles (`ChildLayout`, `ParentLayout`, `AdminLayout`).
2. **AI Service Layer (`src/services/groqService.ts`):** Acts as the brain of the game. It intercepts requests for new levels, constructs highly detailed prompts with strict JSON output rules, and orchestrates the Dual-API fallback logic. 
3. **Data Layer (Firebase):** `src/firebase/firestore.ts` handles all CRUD operations. User progress, generated levels, and Safety Twin metrics are stored in Firestore documents.
4. **Data Flow:**
   * Child clicks a locked node on the `WorldMap`.
   * The app calls the AI Service to generate a custom legal scenario.
   * The child plays through the `ScenarioPlayer`, making decisions.
   * Results are passed through the `aiLevelTransformer` to update the child's XP, Badges, and `SafetyTwinProfile`.
   * Parents view this aggregated data on their dashboard.

### Folder Structure
```text
📦 src
 ┣ 📂 animations      # Framer motion variants and reusable animations
 ┣ 📂 components      # Reusable UI components (Buttons, Cards, Modals, AIMentorWidget)
 ┣ 📂 constants       # Static configuration, API limits, and game metadata
 ┣ 📂 contexts        # React Context providers (AuthContext, ThemeContext)
 ┣ 📂 data            # Seed data and mock fallbacks
 ┣ 📂 firebase        # Firebase initialization, config, and Firestore helper functions
 ┣ 📂 layouts         # High-level wrappers (AdminLayout.tsx, ChildLayout.tsx, ParentLayout.tsx)
 ┣ 📂 pages           # Route-level components (WorldMap, ScenarioPlayer, Dashboards, Login)
 ┣ 📂 scripts         # Node scripts (e.g., fetchNews.ts, seedHelpServices.ts)
 ┣ 📂 services        # Core business logic (groqService.ts, aiLevelTransformer.ts)
 ┣ 📂 types           # TypeScript interfaces and type definitions
 ┗ 📂 utils           # Helper functions (mapGenerator.ts for SVG path math, formatting)
```

---

## 🚀 Installation & Setup Instructions

### Prerequisites
* Node.js (v24+ recommended)
* A Firebase Project (with Firestore and Auth enabled)
* API Keys from Groq and OpenRouter

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

## 💡 Innovation & Uniqueness

1. **Procedural Educational Content:** Instead of hard-coding quizzes, the app uses an LLM to generate endless, highly specific legal dilemmas tailored to the child's exact age and previous performance. This ensures the game never gets repetitive.
2. **Dynamic UI Generation:** The `WorldMap.tsx` features a custom mathematical algorithm (`mapGenerator.ts`) to dynamically calculate bezier curves and SVG paths connecting procedural nodes, complete with animated gradients that adapt to the player's progress.
3. **Resilient AI Architecture:** The custom-built Dual-API fallback wrapper seamlessly routes traffic between Groq and OpenRouter within milliseconds upon failure, guaranteeing a 0% failure rate for the end-user.

---

## 🔮 Known Limitations / Future Scope

* **[NEEDS CLARIFICATION] Multi-language Support:** Currently, the AI prompt forces English. Implementing localization (Hindi, regional languages) via AI translation prompts is a crucial next step for Indian accessibility.
* **Offline Mode:** The game relies heavily on real-time LLM generation. Caching generated levels locally for offline play using service workers and IndexedDB would greatly improve accessibility in low-bandwidth areas.
* **Voice-to-Text Mentorship:** Upgrading the AI Mentor Widget to support voice input/output would make the platform more accessible to younger children who struggle with typing.
* **Hardware Integration:** Potential future scope includes integrating physical SOS buttons (IoT devices) that connect to the platform's Emergency Services module.

---

## 👥 Contributors/Team

* **[Team Member 1 Name]** - [Role]
* **[Team Member 2 Name]** - [Role]
* **[Team Member 3 Name]** - [Role]
* **[Team Member 4 Name]** - [Role]
* **[Team Member 5 Name]** - [Role]
* **[Team Member 6 Name]** - [Role]

*(Replace placeholders with actual team member details before final presentation).*
