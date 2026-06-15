import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext, lazy, Suspense, useCallback } from 'react'
import Layout from './components/Layout'
import { useAuth } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import PageLoader from './components/PageLoader'
import { useInactivityTimeout } from './hooks/useInactivityTimeout'
import AuthPage from "./pages/AuthPage"
import { AuthProvider } from "./contexts/AuthContext"
import { chapters, type Chapter } from './data/courseData'

// Lazy-loaded pages — only loaded when the user navigates to them
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ChapterPage = lazy(() => import('./pages/ChapterPage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const MathExercises = lazy(() => import('./pages/MathExercises'))
const ExerciseDetail = lazy(() => import('./pages/ExerciseDetail'))
const InspirationArchive = lazy(() => import('./pages/InspirationArchive'))
const PracticeGenerator = lazy(() => import('./pages/PracticeGenerator'))
const MasteryDashboard = lazy(() => import('./pages/MasteryDashboard'))
const DCChapterPage = lazy(() => import('./pages/DCChapterPage'))
const DCLessonPage = lazy(() => import('./pages/DCLessonPage'))
const DCCircuitLab = lazy(() => import('./pages/DCCircuitLab'))
const AITutor = lazy(() => import('./pages/AITutor'))
const Achievements = lazy(() => import('./pages/Achievements'))
const StudyTimer = lazy(() => import('./pages/StudyTimer'))
const ChatRoom = lazy(() => import('./pages/ChatRoom'))
const Chronos = lazy(() => import('./pages/Chronos'))
const VoiceAI = lazy(() => import('./pages/VoiceAI'))
const VisualLab = lazy(() => import('./pages/VisualLab'))
const EMChapterPage = lazy(() => import('./pages/EMChapterPage'))
const MathModulePage = lazy(() => import('./pages/MathModulePage'))
const GamesHub = lazy(() => import('./pages/GamesHub'))
const FunctionGarden = lazy(() => import('./pages/games/FunctionGarden'))
const CircuitFlow = lazy(() => import('./pages/games/CircuitFlow'))
const ComplexPlane = lazy(() => import('./pages/games/ComplexPlane'))
const CrosswordGame = lazy(() => import('./pages/games/Crossword'))
const MathChess = lazy(() => import('./pages/games/MathChess'))
const VectorFishing = lazy(() => import('./pages/games/VectorFishing'))
const ResistanceRacer = lazy(() => import('./pages/games/ResistanceRacer'))
const KirchhoffMaze = lazy(() => import('./pages/games/KirchhoffMaze'))
const LorenzFlight = lazy(() => import('./pages/games/LorenzFlight'))
const BalanceBeam = lazy(() => import('./pages/games/BalanceBeam'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const AdminActivity = lazy(() => import('./pages/AdminActivity'))
const NotFound = lazy(() => import('./pages/NotFound'))
const GamificationProfile = lazy(() => import('./pages/GamificationProfile'))

interface AppContextType {
  chapterList: Chapter[];
  setChapterList: React.Dispatch<React.SetStateAction<Chapter[]>>;
  commandOpen: boolean;
  setCommandOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType>({
  chapterList: chapters,
  setChapterList: () => {},
  commandOpen: false,
  setCommandOpen: () => {},
});

export const useApp = () => useContext(AppContext);

function App() {
  const [chapterList, setChapterList] = useState<Chapter[]>(chapters);
  const [commandOpen, setCommandOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Auto-logout after 30 minutes of inactivity
  const handleInactivityTimeout = useCallback(() => {
    logout();
  }, [logout]);
  useInactivityTimeout(handleInactivityTimeout, isAuthenticated);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCommandOpen(prev => !prev); }
      if (e.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#a3a3a3]">Loading ForceForm...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <AppContext.Provider value={{ chapterList, setChapterList, commandOpen, setCommandOpen }}>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chapter/:chapterId" element={<ChapterPage />} />
              <Route path="/chapter/:chapterId/section/:sectionId/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/exercises" element={<MathExercises />} />
              <Route path="/exercise/:exerciseId" element={<ExerciseDetail />} />
              <Route path="/inspiration" element={<InspirationArchive />} />
              <Route path="/practice" element={<PracticeGenerator />} />
              <Route path="/mastery" element={<MasteryDashboard />} />
              <Route path="/dc-circuit/:chapterId" element={<DCChapterPage />} />
              <Route path="/dc-circuit/:chapterId/section/:sectionId/lesson/:lessonId" element={<DCLessonPage />} />
              <Route path="/dc-lab" element={<DCCircuitLab />} />
              <Route path="/ai-tutor" element={<AITutor />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/study-timer" element={<StudyTimer />} />
              <Route path="/chat-room" element={<ChatRoom />} />
              <Route path="/chronos" element={<Chronos />} />
              <Route path="/voice-ai" element={<VoiceAI />} />
              <Route path="/visual-lab" element={<VisualLab />} />
              <Route path="/em" element={<EMChapterPage />} />
              <Route path="/math" element={<MathModulePage />} />
              <Route path="/games" element={<GamesHub />} />
              <Route path="/games/function-garden" element={<FunctionGarden />} />
              <Route path="/games/circuit-flow" element={<CircuitFlow />} />
              <Route path="/games/complex-plane" element={<ComplexPlane />} />
              <Route path="/games/crossword" element={<CrosswordGame />} />
              <Route path="/games/math-chess" element={<MathChess />} />
              <Route path="/games/vector-fishing" element={<VectorFishing />} />
              <Route path="/games/resistance-racer" element={<ResistanceRacer />} />
              <Route path="/games/kirchhoff-maze" element={<KirchhoffMaze />} />
              <Route path="/games/lorenz-flight" element={<LorenzFlight />} />
              <Route path="/games/balance-beam" element={<BalanceBeam />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/activity" element={<AdminActivity />} />
              <Route path="/profile" element={<GamificationProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </AppContext.Provider>
  );
}

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
