import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import NavigationBar from './components/NavigationBar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ExecutionPage from './pages/ExecutionPage.jsx';
import InstructionsPage from './pages/InstructionsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PlanningPage from './pages/PlanningPage.jsx';
import RankingPage from './pages/RankingPage.jsx';
import SetupPage from './pages/SetupPage.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationBar />
        <main className="page-shell">
          <Routes>
            <Route path="/" element={<InstructionsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/game/:gameId/planning" element={<PlanningPage />} />
              <Route path="/game/:gameId/execution" element={<ExecutionPage />} />
              <Route path="/ranking" element={<RankingPage />} />
            </Route>
            <Route path="/not-found" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
