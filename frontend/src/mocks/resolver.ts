/**
 * Mock Resolver — EcoSphere ESG Platform
 *
 * Maps incoming API request URLs (method + path) to a mock response body.
 * Called by the Axios interceptor in `client.ts` when the backend is
 * unreachable (network error).
 *
 * Rules:
 * - GET  requests → return mock data immediately
 * - POST / PATCH  → echo back the request body with a generated id/timestamps
 * - DELETE        → return { success: true }
 *
 * Matching is done on the URL *path* (everything after /api/v1/).
 * Query params are intentionally ignored so the same mock is returned
 * regardless of filters — sufficient for UI development / demos.
 */

import {
  mockOrgOverview,
  mockEnvironmentalStats,
  mockDepartmentScores,
  mockDepartments,
  mockCategories,
  mockEmissionFactors,
  mockCarbonTransactions,
  mockEnvironmentalGoals,
  mockProductEsgProfiles,
  mockCsrActivities,
  mockEmployeeParticipations,
  mockChallenges,
  mockChallengeParticipations,
  mockPolicies,
  mockPolicyAcknowledgements,
  mockAudits,
  mockComplianceIssues,
  mockBadges,
  mockMyBadges,
  mockRewards,
  mockUserLeaderboard,
  mockDeptLeaderboard,
  mockDiversityMetrics,
  mockEsgConfig,
  mockEnvironmentalReport,
  mockSocialReport,
  mockGovernanceReport,
  mockEsgSummaryReport,
} from "./data";

// ── Helpers ────────────────────────────────────────────────────────────
function uuid() {
  return "mock-" + Math.random().toString(36).slice(2, 10);
}

function now() {
  return new Date().toISOString();
}

function paginated<T>(items: T[]) {
  return { items, total: items.length, page: 1, per_page: items.length, pages: 1 };
}

function ok(data: unknown) {
  return { data, message: "OK", status: "success" };
}

// ── Resolver ───────────────────────────────────────────────────────────
export function resolveMock(
  method: string,
  url: string,
  body?: unknown
): unknown {
  // Remove origin if present, remove /api/v1/ if present, remove query string, and strip leading slashes
  const fullPath = url
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/?api\/v1\//, "")
    .split("?")[0];
  const path = fullPath.replace(/^\/+/, "");
  const verb = method.toUpperCase();

  // ── Auth ──────────────────────────────────────────────────────────────
  if (path.startsWith("auth/")) return ok({ access_token: "mock-dev-token", refresh_token: "mock-refresh" });

  // ── Dashboard ─────────────────────────────────────────────────────────
  if (path === "dashboard/org-overview")  return ok(mockOrgOverview);
  if (path === "dashboard/environmental") return ok(mockEnvironmentalStats);
  if (path === "dashboard/social")        return ok({ total_csr_participants: 43, active_activities: 3 });
  if (path === "dashboard/governance")    return ok({ open_issues: 3, pending_audits: 1 });

  // ── Department scores ─────────────────────────────────────────────────
  if (path.startsWith("department-scores")) return ok(mockDepartmentScores);

  // ── Departments ───────────────────────────────────────────────────────
  if (path === "departments") {
    if (verb === "POST") {
      const d = body as Record<string, unknown>;
      return ok({ id: uuid(), ...d, employee_count: 0, status: "active", created_at: now() });
    }
    return ok(paginated(mockDepartments));
  }
  if (path.match(/^departments\/[^/]+$/)) {
    if (verb === "PATCH") return ok({ ...mockDepartments[0], ...(body as object) });
    if (verb === "DELETE") return ok(null);
    return ok(mockDepartments.find((d) => path.endsWith(d.id)) ?? mockDepartments[0]);
  }

  // ── Categories ────────────────────────────────────────────────────────
  if (path === "categories") {
    if (verb === "POST") {
      const c = body as Record<string, unknown>;
      return ok({ id: uuid(), ...c, status: "active", created_at: now() });
    }
    return ok(mockCategories);
  }
  if (path.match(/^categories\/[^/]+$/)) {
    if (verb === "PATCH") return ok({ ...mockCategories[0], ...(body as object) });
    if (verb === "DELETE") return ok(null);
  }

  // ── Emission Factors ──────────────────────────────────────────────────
  if (path === "emission-factors") {
    if (verb === "POST") {
      const ef = body as Record<string, unknown>;
      return ok({ id: uuid(), ...ef, is_active: true, created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockEmissionFactors));
  }
  if (path.match(/^emission-factors\/[^/]+$/)) {
    if (verb === "PATCH") return ok({ ...mockEmissionFactors[0], ...(body as object), updated_at: now() });
    if (verb === "DELETE") return ok(null);
  }

  // ── Carbon Transactions ───────────────────────────────────────────────
  if (path === "carbon-transactions") {
    if (verb === "POST") {
      const ct = body as Record<string, unknown>;
      return ok({ id: uuid(), ...ct, is_deleted: false, created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockCarbonTransactions));
  }
  if (path.match(/^carbon-transactions\/[^/]+$/)) {
    if (verb === "DELETE") return ok(null);
  }

  // ── Environmental Goals ───────────────────────────────────────────────
  if (path === "environmental-goals") {
    if (verb === "POST") {
      const g = body as Record<string, unknown>;
      return ok({ id: uuid(), ...g, current_value: 0, status: "active", created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockEnvironmentalGoals));
  }
  if (path.match(/^environmental-goals\/[^/]+$/)) {
    if (verb === "PATCH") return ok({ ...mockEnvironmentalGoals[0], ...(body as object), updated_at: now() });
    if (verb === "DELETE") return ok(null);
  }

  // ── Product ESG Profiles ──────────────────────────────────────────────
  if (path === "product-esg-profiles") {
    if (verb === "POST") {
      const p = body as Record<string, unknown>;
      return ok({ id: uuid(), ...p, created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockProductEsgProfiles));
  }
  if (path.match(/^product-esg-profiles\/[^/]+$/)) {
    if (verb === "PATCH") return ok({ ...mockProductEsgProfiles[0], ...(body as object), updated_at: now() });
  }

  // ── CSR Activities ────────────────────────────────────────────────────
  if (path === "csr-activities") {
    if (verb === "POST") {
      const a = body as Record<string, unknown>;
      return ok({ id: uuid(), ...a, is_deleted: false, created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockCsrActivities));
  }
  if (path.match(/^csr-activities\/[^/]+$/)) {
    if (verb === "PATCH") return ok({ ...mockCsrActivities[0], ...(body as object), updated_at: now() });
    if (verb === "DELETE") return ok(null);
  }

  // ── Employee Participations ───────────────────────────────────────────
  if (path === "employee-participations/mine") return ok(mockEmployeeParticipations);
  if (path === "employee-participations") {
    if (verb === "POST") {
      const ep = body as Record<string, unknown>;
      return ok({ id: uuid(), employee_id: "user-001", ...ep, approval_status: "pending", points_earned: 0, completion_date: null, reviewed_by: null, review_notes: null, created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockEmployeeParticipations));
  }
  if (path.match(/^employee-participations\/[^/]+\/(approve|reject)$/)) {
    return ok({ ...mockEmployeeParticipations[0], approval_status: path.endsWith("approve") ? "approved" : "rejected", updated_at: now() });
  }

  // ── Challenges ────────────────────────────────────────────────────────
  if (path === "challenges") {
    if (verb === "POST") {
      const ch = body as Record<string, unknown>;
      return ok({ id: uuid(), ...ch, created_by: "user-001", created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockChallenges));
  }
  if (path.match(/^challenges\/[^/]+$/)) {
    if (verb === "PATCH") return ok({ ...mockChallenges[0], ...(body as object), updated_at: now() });
    if (verb === "DELETE") return ok(null);
  }

  // ── Challenge Participation ────────────────────────────────────────────
  if (path === "challenge-participations/mine") return ok(mockChallengeParticipations);
  if (path === "challenge-participations") {
    if (verb === "POST") {
      const cp = body as Record<string, unknown>;
      return ok({ id: uuid(), employee_id: "user-001", ...cp, progress: 0, approval_status: "pending", xp_awarded: 0, submitted_at: null, reviewed_by: null, created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockChallengeParticipations));
  }
  if (path.match(/^challenge-participations\/[^/]+\/submit$/)) {
    return ok({ ...mockChallengeParticipations[0], approval_status: "pending", submitted_at: now(), updated_at: now() });
  }
  if (path.match(/^challenge-participations\/[^/]+\/(approve|reject)$/)) {
    return ok({ ...mockChallengeParticipations[0], approval_status: path.endsWith("approve") ? "approved" : "rejected", updated_at: now() });
  }

  // ── Policies ──────────────────────────────────────────────────────────
  if (path === "policies") {
    if (verb === "POST") {
      const p = body as Record<string, unknown>;
      return ok({ id: uuid(), ...p, version: "1.0", is_active: true, is_deleted: false, created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockPolicies));
  }
  if (path.match(/^policies\/[^/]+\/acknowledge$/)) {
    return ok({ id: uuid(), policy_id: path.split("/")[1], employee_id: "user-001", acknowledged_at: now(), ip_address: "127.0.0.1" });
  }
  // legacy path — some hooks may POST to /policy-acknowledgements/:policyId
  if (path.match(/^policy-acknowledgements\/[^/]+$/) && verb === "POST") {
    return ok({ id: uuid(), policy_id: path.split("/")[1], employee_id: "user-001", acknowledged_at: now(), ip_address: "127.0.0.1" });
  }
  if (path === "policy-acknowledgements/mine") return ok(mockPolicyAcknowledgements);


  // ── Audits ────────────────────────────────────────────────────────────
  if (path === "audits") {
    if (verb === "POST") {
      const a = body as Record<string, unknown>;
      return ok({ id: uuid(), ...a, completed_date: null, findings: null, is_deleted: false, created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockAudits));
  }
  if (path.match(/^audits\/[^/]+$/)) {
    if (verb === "PATCH") return ok({ ...mockAudits[0], ...(body as object), updated_at: now() });
    if (verb === "DELETE") return ok(null);
  }

  // ── Compliance Issues ─────────────────────────────────────────────────
  if (path === "compliance-issues") {
    if (verb === "POST") {
      const c = body as Record<string, unknown>;
      return ok({ id: uuid(), ...c, status: "open", is_deleted: false, created_at: now(), updated_at: now() });
    }
    return ok(paginated(mockComplianceIssues));
  }
  if (path.match(/^compliance-issues\/[^/]+$/)) {
    if (verb === "PATCH") return ok({ ...mockComplianceIssues[0], ...(body as object), updated_at: now() });
    if (verb === "DELETE") return ok(null);
  }

  // ── Badges ────────────────────────────────────────────────────────────
  if (path === "badges/mine") return ok(mockMyBadges);
  if (path === "badges") {
    if (verb === "POST") {
      const b = body as Record<string, unknown>;
      return ok({ id: uuid(), ...b, is_active: true, created_at: now(), updated_at: now() });
    }
    return ok(mockBadges);
  }

  // ── Rewards ───────────────────────────────────────────────────────────
  if (path === "rewards/redemptions/mine") return ok([]);
  if (path === "rewards") return ok(mockRewards);
  if (path.match(/^rewards\/[^/]+\/redeem$/)) {
    return ok({ id: uuid(), employee_id: "user-001", reward_id: path.split("/")[1], points_spent: 500, status: "pending", redeemed_at: now(), notes: null });
  }

  // ── Leaderboards ──────────────────────────────────────────────────────
  if (path === "leaderboards/departments") return ok(mockDeptLeaderboard);
  if (path === "leaderboards") return ok(mockUserLeaderboard);

  // ── Notifications ─────────────────────────────────────────────────────
  if (path === "notifications/unread-count") return ok(3);
  if (path === "notifications")              return ok(paginated([]));
  if (path.match(/^notifications\/[^/]+\/read$/)) return ok(null);

  // ── Reports ───────────────────────────────────────────────────────────
  if (path === "reports/environmental") return ok(mockEnvironmentalReport);
  if (path === "reports/social")        return ok(mockSocialReport);
  if (path === "reports/governance")    return ok(mockGovernanceReport);
  if (path === "reports/esg-summary")   return ok(mockEsgSummaryReport);
  if (path === "reports/custom") {
    const b = body as Record<string, string[]> | null;
    const modules = b?.modules ?? ["environmental"];
    const result: Record<string, unknown> = {};
    if (modules.includes("environmental")) result.environmental = mockEnvironmentalReport;
    if (modules.includes("social"))        result.social = mockSocialReport;
    if (modules.includes("governance"))    result.governance = mockGovernanceReport;
    return ok(result);
  }

  // ── Diversity ─────────────────────────────────────────────────────────
  if (path === "diversity-metrics") return ok(mockDiversityMetrics);

  // ── Settings / ESG Config ─────────────────────────────────────────────
  if (path === "settings/config" || path === "settings") {
    if (verb === "PATCH") return ok({ ...mockEsgConfig, ...(body as object), updated_at: now() });
    return ok(mockEsgConfig);
  }

  // ── AI Assistant ──────────────────────────────────────────────────────
  if (path === "ai-assistant/chat") {
    return ok({ reply: "This is a mock AI response. Connect the backend to get real ESG insights powered by your data." });
  }

  // ── Fallback ──────────────────────────────────────────────────────────
  console.warn(`[Mock] No mock found for ${verb} /${path} — returning empty data`);
  return ok(null);
}
