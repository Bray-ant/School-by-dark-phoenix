import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import Layout from './components/Layout'
import { useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import ChapterPage from './pages/ChapterPage'
import LessonPage from './pages/LessonPage'
import Dashboard from './pages/Dashboard'
import MathExercises from './pages/MathExercises'
import ExerciseDetail from './pages/ExerciseDetail'
import InspirationArchive from './pages/InspirationArchive'
import PracticeGenerator from './pages/PracticeGenerator'
import MasteryDashboard from './pages/MasteryDashboard'
import DCChapterPage from './pages/DCChapterPage'
import DCLessonPage from './pages/DCLessonPage'
import DCCircuitLab from './pages/DCCircuitLab'
import AITutor from './pages/AITutor'
import Achievements from './pages/Achievements'
import StudyTimer from './pages/StudyTimer'
import ChatRoom from './pages/ChatRoom'
import Chronos from './pages/Chronos'
import VoiceAI from './pages/VoiceAI'
import VisualLab from './pages/VisualLab'
import EMChapterPage from './pages/EMChapterPage'
import MathModulePage from './pages/MathModulePage'
import GamesHub from './pages/GamesHub'
import FunctionGarden from './pages/games/FunctionGarden'
import CircuitFlow from './pages/games/CircuitFlow'
import ComplexPlane from './pages/games/ComplexPlane'
import CrosswordGame from './pages/games/Crossword'
import MathChess from './pages/games/MathChess'
import VectorFishing from './pages/games/VectorFishing'
import ResistanceRacer from './pages/games/ResistanceRacer'
import KirchhoffMaze from './pages/games/KirchhoffMaze'
import LorenzFlight from './pages/games/LorenzFlight'
import BalanceBeam from './pages/games/BalanceBeam'
import AuthPage from "./pages/AuthPage"
import AdminUsers from "./pages/AdminUsers"
import AdminActivity from "./pages/AdminActivity"
import NotFound from "./pages/NotFound"
import { AuthProvider } from "./contexts/AuthContext"
import { chapters, type Chapter } from './data/courseData'

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
  const { isAuthenticated, isLoading } = useAuth();

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
          <Route path="*" element={<NotFound />} />
        </Routes>
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
