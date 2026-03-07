import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import OnboardingConsentPage from "./pages/OnboardingConsentPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import SignalsPage from "./pages/SignalsPage";
import TasksPage from "./pages/TasksPage";
import BrokersPage from "./pages/BrokersPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import GovernancePage from "./pages/GovernancePage";
import EmbedPage from "./pages/EmbedPage";
import GovernanceFilePage from "./pages/GovernanceFilePage";
import AssessmentPage from "./pages/AssessmentPage";
import ExposuresPage from "./pages/ExposuresPage";
import DecisionsPage from "./pages/DecisionsPage";
import AgentLogPage from "./pages/AgentLogPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/embed" element={<EmbedPage />} />
            <Route path="/onboarding-consent" element={
              <ProtectedRoute><OnboardingConsentPage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute><InventoryPage /></ProtectedRoute>
            } />
            <Route path="/signals" element={
              <ProtectedRoute><SignalsPage /></ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute><TasksPage /></ProtectedRoute>
            } />
            <Route path="/brokers" element={
              <ProtectedRoute><BrokersPage /></ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute><ReportsPage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><SettingsPage /></ProtectedRoute>
            } />
            <Route path="/governance" element={
              <ProtectedRoute><GovernancePage /></ProtectedRoute>
            } />
            <Route path="/governance-file" element={
              <ProtectedRoute><GovernanceFilePage /></ProtectedRoute>
            } />
            <Route path="/assessment" element={
              <ProtectedRoute><AssessmentPage /></ProtectedRoute>
            } />
            <Route path="/exposures" element={
              <ProtectedRoute><ExposuresPage /></ProtectedRoute>
            } />
            <Route path="/decisions" element={
              <ProtectedRoute><DecisionsPage /></ProtectedRoute>
            } />
            <Route path="/agent-log" element={
              <ProtectedRoute><AgentLogPage /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;