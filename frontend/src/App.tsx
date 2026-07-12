import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
// import { ProtectedRoute } from "@/components/ProtectedRoute";
// import { LoginPage } from "@/pages/LoginPage";
// import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";

import { CarbonTrackingPage }      from "@/pages/environmental/CarbonTrackingPage";
import { EmissionFactorsPage }     from "@/pages/environmental/EmissionFactorsPage";
import { ProductEsgProfilesPage }  from "@/pages/environmental/ProductEsgProfilesPage";
import { GoalsPage }               from "@/pages/environmental/GoalsPage";

import { CsrActivitiesPage }  from "@/pages/social/CsrActivitiesPage";
import { ParticipationPage }  from "@/pages/social/ParticipationPage";
import { DiversityPage }      from "@/pages/social/DiversityPage";

import { PoliciesPage }                from "@/pages/governance/PoliciesPage";
import { PolicyAcknowledgementsPage }  from "@/pages/governance/PolicyAcknowledgementsPage";
import { AuditsPage }                  from "@/pages/governance/AuditsPage";
import { ComplianceIssuesPage }        from "@/pages/governance/ComplianceIssuesPage";

import { ChallengesPage }            from "@/pages/gamification/ChallengesPage";
import { ChallengeParticipationPage } from "@/pages/gamification/ChallengeParticipationPage";
import { LeaderboardPage }           from "@/pages/gamification/LeaderboardPage";
import { BadgesPage }                from "@/pages/gamification/BadgesPage";
import { RewardsPage }               from "@/pages/gamification/RewardsPage";

import { EnvironmentalReportPage } from "@/pages/reports/EnvironmentalReportPage";
import { SocialReportPage }        from "@/pages/reports/SocialReportPage";
import { GovernanceReportPage }    from "@/pages/reports/GovernanceReportPage";
import { EsgSummaryPage }          from "@/pages/reports/EsgSummaryPage";
import { CustomReportPage }        from "@/pages/reports/CustomReportPage";

import { AiAssistantPage } from "@/pages/ai-assistant/AiAssistantPage";

import { DepartmentsSettingsPage }   from "@/pages/settings/DepartmentsSettingsPage";
import { CategoriesSettingsPage }    from "@/pages/settings/CategoriesSettingsPage";
import { EsgConfigPage }             from "@/pages/settings/EsgConfigPage";
import { NotificationsSettingsPage } from "@/pages/settings/NotificationsSettingsPage";

export default function App() {
  return (
    <Routes>
      {/* <Route path="/login"    element={<LoginPage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}
      <Route
        element={
          // <ProtectedRoute>
            <AppLayout />
          // </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />

        {/* Environmental */}
        <Route path="/environmental/carbon"          element={<CarbonTrackingPage />} />
        <Route path="/environmental/emission-factors" element={<EmissionFactorsPage />} />
        <Route path="/environmental/product-profiles" element={<ProductEsgProfilesPage />} />
        <Route path="/environmental/goals"           element={<GoalsPage />} />

        {/* Social */}
        <Route path="/social/csr-activities" element={<CsrActivitiesPage />} />
        <Route path="/social/participation"  element={<ParticipationPage />} />
        <Route path="/social/diversity"      element={<DiversityPage />} />

        {/* Governance */}
        <Route path="/governance/policies"                element={<PoliciesPage />} />
        <Route path="/governance/policy-acknowledgements" element={<PolicyAcknowledgementsPage />} />
        <Route path="/governance/audits"                  element={<AuditsPage />} />
        <Route path="/governance/compliance-issues"       element={<ComplianceIssuesPage />} />

        {/* Gamification */}
        <Route path="/gamification/challenges"             element={<ChallengesPage />} />
        <Route path="/gamification/challenge-participation" element={<ChallengeParticipationPage />} />
        <Route path="/gamification/leaderboard"            element={<LeaderboardPage />} />
        <Route path="/gamification/badges"                 element={<BadgesPage />} />
        <Route path="/gamification/rewards"                element={<RewardsPage />} />

        {/* Reports – sub-pages */}
        <Route path="/reports" element={<Navigate to="/reports/environmental" replace />} />
        <Route path="/reports/environmental" element={<EnvironmentalReportPage />} />
        <Route path="/reports/social"        element={<SocialReportPage />} />
        <Route path="/reports/governance"    element={<GovernanceReportPage />} />
        <Route path="/reports/summary"       element={<EsgSummaryPage />} />
        <Route path="/reports/custom"        element={<CustomReportPage />} />

        {/* AI Assistant */}
        <Route path="/ai-assistant" element={<AiAssistantPage />} />

        {/* Settings – sub-pages */}
        <Route path="/settings" element={<Navigate to="/settings/esg-config" replace />} />
        <Route path="/settings/departments"   element={<DepartmentsSettingsPage />} />
        <Route path="/settings/categories"    element={<CategoriesSettingsPage />} />
        <Route path="/settings/esg-config"    element={<EsgConfigPage />} />
        <Route path="/settings/notifications" element={<NotificationsSettingsPage />} />
      </Route>
    </Routes>
  );
}
