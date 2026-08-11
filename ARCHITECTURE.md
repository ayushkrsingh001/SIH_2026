# RightsQuest Architecture Diagram

Here is a high-level system architecture diagram for **RightsQuest**. It visualizes the flow of data between the frontend application, the Firebase backend, and the AI/Third-party services.

```mermaid
flowchart TB
    %% Styling
    classDef frontend fill:#38bdf8,stroke:#0369a1,stroke-width:2px,color:#fff
    classDef firebase fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
    classDef ai fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    classDef user fill:#64748b,stroke:#334155,stroke-width:2px,color:#fff
    classDef external fill:#a855f7,stroke:#7e22ce,stroke-width:2px,color:#fff
    
    %% Actors
    Child(("👦 Child (Player)")):::user
    Parent(("👨‍👩‍👦 Parent")):::user
    Admin(("🛡️ Admin")):::user

    %% Frontend Layer
    subgraph ClientApp ["📱 Client Application (React 19 + Vite)"]
        direction TB
        UI["User Interface (Views, Dashboards, Map)"]:::frontend
        State["State Management (Zustand)"]:::frontend
        AIService["AI Service Layer (Dual-API Wrapper)"]:::frontend
        
        UI <--> State
        State <--> AIService
    end
    
    %% Backend Layer (Firebase)
    subgraph FirebaseBaaS ["🔥 Firebase (Backend & Database)"]
        direction TB
        Auth["Firebase Auth (User Login)"]:::firebase
        Firestore[("Cloud Firestore (Users, Progress, AI Twin)")]:::firebase
        Storage["Cloud Storage (PDF Reports, Assets)"]:::firebase
    end
    
    %% External APIs Layer
    subgraph External_APIs ["🤖 External APIs & AI Engines"]
        direction TB
        Groq["Groq API (Primary LLM)"]:::ai
        OpenRouter["OpenRouter (Fallback LLM)"]:::ai
        News["News API (GNews/NewsData)"]:::external
    end
    
    %% Connections (User to App)
    Child -->|"Interacts with Gameplay"| UI
    Parent -->|"Monitors Dashboard"| UI
    Admin -->|"System Oversight"| UI
    
    %% Connections (App to Firebase)
    UI <-->|"Authenticates"| Auth
    State <-->|"Reads/Writes Data"| Firestore
    State <-->|"Fetches Reports"| Storage
    
    %% Connections (App to AI/External APIs)
    AIService -->|"1. Generates Scenario/Quiz"| Groq
    Groq -.->|"2. Fail / Rate Limit"| AIService
    AIService -->|"3. Seamless Fallback"| OpenRouter
    
    State -->|"Fetches Safety News"| News
```

### Key Components Explained:

1. **Client Application:** Built with React 19 and Vite. The UI interacts with a centralized state managed by `Zustand`. All complex AI API calls are intercepted by the **AI Service Layer**.
2. **Firebase Backend:** Entirely serverless. It handles secure authentication (`Auth`), NoSQL data storage for user progress and AI Safety Twin profiles (`Firestore`), and binary/file storage (`Storage`).
3. **External APIs (The "Brain"):** The system relies heavily on the **Groq API** for ultra-fast LLaMa-3.1 generations. If Groq goes down or hits rate limits, the AI Service Layer instantly catches the error and reroutes the exact prompt to **OpenRouter** to ensure the child never experiences a "loading failed" screen. News APIs are called directly to populate dashboards with real-world context.
