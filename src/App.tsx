import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RiskProvider } from "@/hooks/useRiskContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { TierGate } from "@/components/layout/TierGate";

import ExposureCheckPage from "./pages/ExposureCheckPage";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
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
import PlaybooksPage from "./pages/PlaybooksPage";
import GovernanceConsolePage from "./pages/GovernanceConsolePage";
import PillarDirectoryPage from "./pages/PillarDirectoryPage";
import PillarDetailPage from "./pages/PillarDetailPage";
import DecisionQueuePage from "./pages/DecisionQueuePage";
import RiskDetailPage from "./pages/RiskDetailPage";
import GovernanceAuditPage from "./pages/GovernanceAuditPage";
import GovernanceCadencePage from "./pages/GovernanceCadencePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RiskProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/exposure-check" replace />} />
              <Route path="/exposure-check" element={<ExposureCheckPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/embed" element={<EmbedPage />} />

              <Route
                path="/onboarding-consent"
                element={
                  <ProtectedRoute>
                    <OnboardingConsentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <TierGate required={2}><InventoryPage /></TierGate>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/signals"
                element={
                  <ProtectedRoute>
                    <SignalsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/brokers"
                element={
                  <ProtectedRoute>
                    <TierGate required={2}><BrokersPage /></TierGate>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/governance"
                element={
                  <ProtectedRoute>
                    <GovernancePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/governance-file"
                element={
                  <ProtectedRoute>
                    <GovernanceFilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/assessment"
                element={
                  <ProtectedRoute>
                    <AssessmentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/exposures"
                element={
                  <ProtectedRoute>
                    <ExposuresPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/decisions"
                element={
                  <ProtectedRoute>
                    <TierGate required={3}><DecisionsPage /></TierGate>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/agent-log"
                element={
                  <ProtectedRoute>
                    <TierGate required={3}><AgentLogPage /></TierGate>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/playbooks"
                element={
                  <ProtectedRoute>
                    <PlaybooksPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/governance-console"
                element={
                  <ProtectedRoute>
                    <TierGate required={3}><GovernanceConsolePage /></TierGate>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pillar-directory"
                element={
                  <ProtectedRoute>
                    <PillarDirectoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pillar-detail/:pillarId"
                element={
                  <ProtectedRoute>
                    <PillarDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/decision-queue"
                element={
                  <ProtectedRoute>
                    <TierGate required={3}><DecisionQueuePage /></TierGate>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/risk-detail/:riskId"
                element={
                  <ProtectedRoute>
                    <RiskDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/governance-audit"
                element={
                  <ProtectedRoute>
                    <GovernanceAuditPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/governance-cadence"
                element={
                  <ProtectedRoute>
                    <GovernanceCadencePage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RiskProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
