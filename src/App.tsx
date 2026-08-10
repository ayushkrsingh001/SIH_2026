import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ChildProvider } from './contexts/ChildContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/RouteGuards';
import { ParentLayout } from './layouts/ParentLayout';
import { ChildLayout } from './layouts/ChildLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { MASCOT_URL } from './constants';

// Pages (lazy loaded for code splitting)
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddChild = lazy(() => import('./pages/AddChild'));
const WhosPlaying = lazy(() => import('./pages/WhosPlaying'));
const WorldMap = lazy(() => import('./pages/WorldMap'));
const ScenarioPlayer = lazy(() => import('./pages/ScenarioPlayer'));
const QuestComplete = lazy(() => import('./pages/QuestComplete'));
const ChildProgress = lazy(() => import('./pages/ChildProgress'));
const Store = lazy(() => import('./pages/Store'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const MultiplayerLobby = lazy(() => import('./pages/MultiplayerLobby'));
const GetHelp = lazy(() => import('./pages/GetHelp'));
const Community = lazy(() => import('./pages/Community'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AIHub = lazy(() => import('./pages/AIHub'));
const AILevelPlayer = lazy(() => import('./pages/AILevelPlayer'));
const AIQuestComplete = lazy(() => import('./pages/AIQuestComplete'));
const IncidentAssistant = lazy(() => import('./pages/IncidentAssistant'));
const DailyQuizPage = lazy(() => import('./pages/DailyQuizPage'));
const AISafetyTwinDashboard = lazy(() => import('./pages/Parent/AISafetyTwinDashboard'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ModuleManager = lazy(() => import('./pages/admin/ModuleManager'));
const ModerationQueue = lazy(() => import('./pages/admin/ModerationQueue'));
const SupportRequests = lazy(() => import('./pages/admin/SupportRequests'));
const FeedbackTable = lazy(() => import('./pages/admin/FeedbackTable'));
const HelpServicesManager = lazy(() => import('./pages/admin/HelpServicesManager'));
const NeedHelp = lazy(() => import('./pages/NeedHelp'));

const PageLoader = () => (
  <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse-glow pointer-events-none" />
    <div className="relative z-10 flex flex-col items-center gap-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <img src={MASCOT_URL} alt="Loading..." className="absolute inset-0 w-full h-full object-contain p-4 animate-pulse" />
      </div>
      <p className="font-headline text-title-lg text-primary animate-pulse tracking-wide">Preparing your adventure...</p>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Parent Routes */}
        <Route element={<ProtectedRoute><ParentLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/add-child" element={<AddChild />} />
          <Route path="/dashboard/edit-child/:childId" element={<AddChild />} />
          <Route path="/dashboard/safety-twin/:childId" element={<AISafetyTwinDashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/incident-assistant" element={<IncidentAssistant />} />
        </Route>

        {/* Who's Playing */}
        <Route path="/play" element={<ProtectedRoute><WhosPlaying /></ProtectedRoute>} />

        {/* Child Mode Routes */}
        <Route path="/play/:childId" element={<ProtectedRoute><ChildLayout /></ProtectedRoute>}>
          <Route path="daily-quiz" element={<DailyQuizPage />} />
          <Route path="incident-assistant" element={<IncidentAssistant />} />
          <Route path="map" element={<WorldMap />} />
          <Route path="progress" element={<ChildProgress />} />
          <Route path="get-help" element={<GetHelp />} />
          <Route path="need-help" element={<NeedHelp />} />
          <Route path="store" element={<Store />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="multiplayer" element={<MultiplayerLobby />} />
          <Route path="module/:moduleId" element={<ScenarioPlayer />} />
          <Route path="module/:moduleId/complete" element={<QuestComplete />} />
          <Route path="ai-hub" element={<AIHub />} />
          <Route path="ai-level/:aiLevelId" element={<AILevelPlayer />} />
          <Route path="ai-complete/:aiLevelId" element={<AIQuestComplete />} />
        </Route>

        {/* Community is now grouped under Parent Routes above */}

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="modules" element={<ModuleManager />} />
          <Route path="moderation" element={<ModerationQueue />} />
          <Route path="support-requests" element={<SupportRequests />} />
          <Route path="feedback" element={<FeedbackTable />} />
          <Route path="help-services" element={<HelpServicesManager />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ChildProvider>
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>

            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '9999px',
                  background: '#303030',
                  color: '#f2f0f0',
                  fontFamily: '"Be Vietnam Pro", sans-serif',
                  fontSize: '14px',
                  padding: '12px 20px',
                },
                success: {
                  iconTheme: { primary: '#2EC4B6', secondary: '#ffffff' },
                },
                error: {
                  iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' },
                },
              }}
            />
          </ChildProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
