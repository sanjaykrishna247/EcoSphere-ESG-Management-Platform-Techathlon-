import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";

import { CarbonTrackingPage } from "@/pages/environmental/CarbonTrackingPage";
import { EmissionFactorsPage } from "@/pages/environmental/EmissionFactorsPage";
import { GoalsPage } from "@/pages/environmental/GoalsPage";

import { CsrActivitiesPage } from "@/pages/social/CsrActivitiesPage";
import { ParticipationPage } from "@/pages/social/ParticipationPage";

import { PoliciesPage } from "@/pages/governance/PoliciesPage";
import { AuditsPage } from "@/pages/governance/AuditsPage";
import { ComplianceIssuesPage } from "@/pages/governance/ComplianceIssuesPage";

import { ChallengesPage } from "@/pages/gamification/ChallengesPage";
import { LeaderboardPage } from "@/pages/gamification/LeaderboardPage";
import { BadgesPage } from "@/pages/gamification/BadgesPage";
import { RewardsPage } from "@/pages/gamification/RewardsPage";

import { ReportsPage } from "@/pages/reports/ReportsPage";
import { AiAssistantPage } from "@/pages/ai-assistant/AiAssistantPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />

        <Route path="/environmental/carbon" element={<CarbonTrackingPage />} />
        <Route path="/environmental/emission-factors" element={<EmissionFactorsPage />} />
        <Route path="/environmental/goals" element={<GoalsPage />} />

        <Route path="/social/csr-activities" element={<CsrActivitiesPage />} />
        <Route path="/social/participation" element={<ParticipationPage />} />

        <Route path="/governance/policies" element={<PoliciesPage />} />
        <Route path="/governance/audits" element={<AuditsPage />} />
        <Route path="/governance/compliance-issues" element={<ComplianceIssuesPage />} />

        <Route path="/gamification/challenges" element={<ChallengesPage />} />
        <Route path="/gamification/leaderboard" element={<LeaderboardPage />} />
        <Route path="/gamification/badges" element={<BadgesPage />} />
        <Route path="/gamification/rewards" element={<RewardsPage />} />

        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/ai-assistant" element={<AiAssistantPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
