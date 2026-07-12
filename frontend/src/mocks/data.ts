/**
 * MOCK DATA — EcoSphere ESG Platform
 *
 * This file contains all static mock data used when the backend is not
 * reachable. The Axios interceptor in `src/api/client.ts` automatically
 * falls back to these when it detects a network error (ERR_NETWORK /
 * ERR_CONNECTION_REFUSED), so every UI page remains fully functional
 * during offline / local-development sessions.
 *
 * To disable mock fallback and always require the backend, set:
 *   VITE_DISABLE_MOCK_FALLBACK=true  in your .env file.
 */

// ── Shared IDs ────────────────────────────────────────────────────────
export const DEPT_IDS = {
  engineering:  "dept-001",
  operations:   "dept-002",
  marketing:    "dept-003",
  sustainability: "dept-004",
  hr:           "dept-005",
};

export const USER_IDS = {
  alice:   "user-001",
  bob:     "user-002",
  carol:   "user-003",
  david:   "user-004",
  eva:     "user-005",
  frank:   "user-006",
  grace:   "user-007",
  henry:   "user-008",
};

// ── Departments ───────────────────────────────────────────────────────
export const mockDepartments = [
  { id: DEPT_IDS.engineering,    name: "Engineering",    code: "ENG", head_user_id: USER_IDS.alice,  parent_id: null, employee_count: 24, status: "active", created_at: "2024-01-15T09:00:00Z" },
  { id: DEPT_IDS.operations,     name: "Operations",     code: "OPS", head_user_id: USER_IDS.bob,    parent_id: null, employee_count: 18, status: "active", created_at: "2024-01-15T09:00:00Z" },
  { id: DEPT_IDS.marketing,      name: "Marketing",      code: "MKT", head_user_id: USER_IDS.carol,  parent_id: null, employee_count: 12, status: "active", created_at: "2024-02-01T09:00:00Z" },
  { id: DEPT_IDS.sustainability,  name: "Sustainability", code: "SUS", head_user_id: USER_IDS.david,  parent_id: null, employee_count: 8,  status: "active", created_at: "2024-02-15T09:00:00Z" },
  { id: DEPT_IDS.hr,             name: "Human Resources", code: "HR", head_user_id: USER_IDS.eva,    parent_id: null, employee_count: 6,  status: "active", created_at: "2024-03-01T09:00:00Z" },
];

// ── Categories ────────────────────────────────────────────────────────
export const mockCategories = [
  { id: "cat-001", name: "Energy Reduction",    type: "challenge",    status: "active", created_at: "2024-01-20T09:00:00Z" },
  { id: "cat-002", name: "Waste Management",    type: "challenge",    status: "active", created_at: "2024-01-20T09:00:00Z" },
  { id: "cat-003", name: "Community Service",   type: "csr_activity", status: "active", created_at: "2024-01-20T09:00:00Z" },
  { id: "cat-004", name: "Environmental Clean", type: "csr_activity", status: "active", created_at: "2024-02-10T09:00:00Z" },
  { id: "cat-005", name: "Carbon Offsetting",   type: "challenge",    status: "active", created_at: "2024-03-01T09:00:00Z" },
];

// ── Dashboard / Org Overview ──────────────────────────────────────────
export const mockOrgOverview = {
  total_co2_ytd: 12840.5,
  active_challenges: 7,
  csr_participants: 43,
  open_compliance_issues: 3,
  org_esg_score: 72.4,
  challenge_status_breakdown: {
    active: 7,
    draft: 2,
    completed: 15,
    under_review: 3,
    archived: 4,
  },
};

export const mockEnvironmentalStats = {
  monthly_co2_trend: [
    { month: "2024-07-01T00:00:00", co2_equivalent: 1420.0 },
    { month: "2024-08-01T00:00:00", co2_equivalent: 1385.0 },
    { month: "2024-09-01T00:00:00", co2_equivalent: 1290.0 },
    { month: "2024-10-01T00:00:00", co2_equivalent: 1350.0 },
    { month: "2024-11-01T00:00:00", co2_equivalent: 1180.0 },
    { month: "2024-12-01T00:00:00", co2_equivalent: 1095.0 },
    { month: "2025-01-01T00:00:00", co2_equivalent: 980.0  },
    { month: "2025-02-01T00:00:00", co2_equivalent: 860.0  },
    { month: "2025-03-01T00:00:00", co2_equivalent: 920.0  },
    { month: "2025-04-01T00:00:00", co2_equivalent: 795.0  },
    { month: "2025-05-01T00:00:00", co2_equivalent: 740.0  },
    { month: "2025-06-01T00:00:00", co2_equivalent: 825.5  },
  ],
};

export const mockDepartmentScores = [
  { department_id: DEPT_IDS.engineering, environmental_score: 78, social_score: 65, governance_score: 82, total_score: 75, period_start: "2025-01-01", period_end: "2025-06-30" },
  { department_id: DEPT_IDS.operations,  environmental_score: 62, social_score: 70, governance_score: 68, total_score: 66, period_start: "2025-01-01", period_end: "2025-06-30" },
  { department_id: DEPT_IDS.marketing,   environmental_score: 55, social_score: 80, governance_score: 74, total_score: 69, period_start: "2025-01-01", period_end: "2025-06-30" },
  { department_id: DEPT_IDS.sustainability, environmental_score: 91, social_score: 88, governance_score: 85, total_score: 88, period_start: "2025-01-01", period_end: "2025-06-30" },
  { department_id: DEPT_IDS.hr,          environmental_score: 60, social_score: 74, governance_score: 79, total_score: 71, period_start: "2025-01-01", period_end: "2025-06-30" },
];

// ── Emission Factors ──────────────────────────────────────────────────
export const mockEmissionFactors = [
  { id: "ef-001", name: "Electricity (Grid)",    unit: "kWh",       co2_per_unit: 0.233, scope: "scope2", source_type: "purchase",       category: "Energy",     is_active: true,  created_at: "2024-01-10T09:00:00Z", updated_at: "2024-01-10T09:00:00Z" },
  { id: "ef-002", name: "Natural Gas",           unit: "m3",        co2_per_unit: 2.04,  scope: "scope1", source_type: "manufacturing",   category: "Fuel",       is_active: true,  created_at: "2024-01-10T09:00:00Z", updated_at: "2024-01-10T09:00:00Z" },
  { id: "ef-003", name: "Diesel (Fleet)",        unit: "litre",     co2_per_unit: 2.68,  scope: "scope1", source_type: "fleet",           category: "Transport",  is_active: true,  created_at: "2024-01-10T09:00:00Z", updated_at: "2024-01-10T09:00:00Z" },
  { id: "ef-004", name: "Business Travel (Air)", unit: "km",        co2_per_unit: 0.115, scope: "scope3", source_type: "expense",         category: "Transport",  is_active: true,  created_at: "2024-02-01T09:00:00Z", updated_at: "2024-02-01T09:00:00Z" },
  { id: "ef-005", name: "Petrol (Company Cars)", unit: "litre",     co2_per_unit: 2.31,  scope: "scope1", source_type: "fleet",           category: "Transport",  is_active: true,  created_at: "2024-02-01T09:00:00Z", updated_at: "2024-02-01T09:00:00Z" },
  { id: "ef-006", name: "Waste to Landfill",    unit: "tonne",     co2_per_unit: 467.0, scope: "scope3", source_type: "manufacturing",   category: "Waste",      is_active: false, created_at: "2024-03-01T09:00:00Z", updated_at: "2024-05-01T09:00:00Z" },
];

// ── Carbon Transactions ───────────────────────────────────────────────
export const mockCarbonTransactions = [
  { id: "ct-001", emission_factor_id: "ef-001", department_id: DEPT_IDS.engineering, quantity: 4200,  co2_equivalent: 978.6,  source_type: "purchase",     transaction_date: "2025-06-01", notes: "Data centre electricity usage",      is_deleted: false, created_at: "2025-06-02T09:00:00Z", updated_at: "2025-06-02T09:00:00Z" },
  { id: "ct-002", emission_factor_id: "ef-002", department_id: DEPT_IDS.operations,  quantity: 250,   co2_equivalent: 510.0,  source_type: "manufacturing",transaction_date: "2025-06-05", notes: "Boiler natural gas consumption",    is_deleted: false, created_at: "2025-06-06T09:00:00Z", updated_at: "2025-06-06T09:00:00Z" },
  { id: "ct-003", emission_factor_id: "ef-003", department_id: DEPT_IDS.operations,  quantity: 840,   co2_equivalent: 2251.2, source_type: "fleet",        transaction_date: "2025-06-10", notes: "Delivery fleet diesel Q2",          is_deleted: false, created_at: "2025-06-11T09:00:00Z", updated_at: "2025-06-11T09:00:00Z" },
  { id: "ct-004", emission_factor_id: "ef-004", department_id: DEPT_IDS.marketing,   quantity: 6200,  co2_equivalent: 713.0,  source_type: "expense",      transaction_date: "2025-05-22", notes: "Conference travel — London/Berlin", is_deleted: false, created_at: "2025-05-23T09:00:00Z", updated_at: "2025-05-23T09:00:00Z" },
  { id: "ct-005", emission_factor_id: "ef-001", department_id: DEPT_IDS.hr,          quantity: 1100,  co2_equivalent: 256.3,  source_type: "purchase",     transaction_date: "2025-05-31", notes: "Office electricity May",            is_deleted: false, created_at: "2025-06-01T09:00:00Z", updated_at: "2025-06-01T09:00:00Z" },
  { id: "ct-006", emission_factor_id: "ef-005", department_id: DEPT_IDS.engineering, quantity: 320,   co2_equivalent: 739.2,  source_type: "fleet",        transaction_date: "2025-04-15", notes: "Engineering team petrol — site visits", is_deleted: false, created_at: "2025-04-16T09:00:00Z", updated_at: "2025-04-16T09:00:00Z" },
];

// ── Environmental Goals ───────────────────────────────────────────────
export const mockEnvironmentalGoals = [
  { id: "goal-001", department_id: DEPT_IDS.engineering, title: "Reduce server energy by 20%", target_value: 20.0, current_value: 12.4, unit: "%", target_date: "2025-12-31", status: "active",    created_at: "2025-01-01T09:00:00Z", updated_at: "2025-06-15T09:00:00Z" },
  { id: "goal-002", department_id: DEPT_IDS.operations,  title: "Fleet emissions below 2,000 kg CO2/month", target_value: 2000, current_value: 2251.2, unit: "kg CO2", target_date: "2025-09-30", status: "active",    created_at: "2025-01-15T09:00:00Z", updated_at: "2025-06-10T09:00:00Z" },
  { id: "goal-003", department_id: DEPT_IDS.sustainability, title: "Zero waste to landfill", target_value: 0, current_value: 0.2, unit: "tonne",   target_date: "2025-06-30", status: "completed", created_at: "2024-07-01T09:00:00Z", updated_at: "2025-06-30T09:00:00Z" },
  { id: "goal-004", department_id: DEPT_IDS.marketing,   title: "Limit air travel to 5,000 km/quarter", target_value: 5000, current_value: 6200,   unit: "km",     target_date: "2025-09-30", status: "active",    created_at: "2025-04-01T09:00:00Z", updated_at: "2025-05-22T09:00:00Z" },
];

// ── Product ESG Profiles ──────────────────────────────────────────────
export const mockProductEsgProfiles = [
  { id: "prd-001", product_name: "EcoSphere SaaS Platform",   product_code: "ECO-SWR-001", emission_factor_id: null, recyclability_pct: null, sustainability_rating: "A", notes: "Cloud-hosted, 100% renewable data centres",    created_at: "2024-03-01T09:00:00Z", updated_at: "2024-06-01T09:00:00Z" },
  { id: "prd-002", product_name: "ESG Analytics Module",      product_code: "ECO-MOD-001", emission_factor_id: null, recyclability_pct: null, sustainability_rating: "A", notes: "Add-on module, no additional hardware",         created_at: "2024-04-01T09:00:00Z", updated_at: "2024-06-01T09:00:00Z" },
  { id: "prd-003", product_name: "On-Premise Server Bundle",  product_code: "ECO-HW-001",  emission_factor_id: "ef-001", recyclability_pct: 72.0, sustainability_rating: "B", notes: "Refurbished server hardware, ENERGY STAR rated", created_at: "2024-04-15T09:00:00Z", updated_at: "2024-06-01T09:00:00Z" },
  { id: "prd-004", product_name: "Legacy Data Migration Kit", product_code: "ECO-LGY-001", emission_factor_id: null, recyclability_pct: 45.0, sustainability_rating: "C", notes: "Includes physical media, partial recyclability",  created_at: "2024-05-01T09:00:00Z", updated_at: "2024-06-01T09:00:00Z" },
];

// ── CSR Activities ────────────────────────────────────────────────────
export const mockCsrActivities = [
  { id: "csr-001", title: "Coastal Clean-up Day",     description: "Annual beach and coastal area clean-up event with local volunteers.", category_id: "cat-004", department_id: DEPT_IDS.sustainability, max_participants: 50, points_reward: 200, status: "active",    start_date: "2025-07-20", end_date: "2025-07-20", is_deleted: false, created_at: "2025-06-01T09:00:00Z", updated_at: "2025-06-01T09:00:00Z" },
  { id: "csr-002", title: "School STEM Workshop",      description: "Volunteer-led coding and sustainability workshops for local schools.", category_id: "cat-003", department_id: DEPT_IDS.engineering,    max_participants: 20, points_reward: 150, status: "upcoming",  start_date: "2025-08-10", end_date: "2025-08-10", is_deleted: false, created_at: "2025-06-10T09:00:00Z", updated_at: "2025-06-10T09:00:00Z" },
  { id: "csr-003", title: "Urban Tree Planting",       description: "Plant 200 native trees across the city in partnership with Green City Council.", category_id: "cat-004", department_id: DEPT_IDS.operations,     max_participants: 30, points_reward: 175, status: "upcoming",  start_date: "2025-09-05", end_date: "2025-09-05", is_deleted: false, created_at: "2025-07-01T09:00:00Z", updated_at: "2025-07-01T09:00:00Z" },
  { id: "csr-004", title: "Food Bank Volunteer Drive", description: "Sort and distribute donations at the regional food bank.", category_id: "cat-003", department_id: DEPT_IDS.hr,             max_participants: 15, points_reward: 120, status: "completed", start_date: "2025-05-03", end_date: "2025-05-03", is_deleted: false, created_at: "2025-04-01T09:00:00Z", updated_at: "2025-05-04T09:00:00Z" },
];

// ── Employee Participations (CSR) ─────────────────────────────────────
export const mockEmployeeParticipations = [
  { id: "ep-001", employee_id: USER_IDS.alice, activity_id: "csr-004", proof_url: "https://example.com/proof-alice.jpg", approval_status: "approved", points_earned: 120, completion_date: "2025-05-03", reviewed_by: USER_IDS.david, review_notes: "Great work!", created_at: "2025-05-03T12:00:00Z", updated_at: "2025-05-04T09:00:00Z" },
  { id: "ep-002", employee_id: USER_IDS.bob,   activity_id: "csr-004", proof_url: null,                                   approval_status: "approved", points_earned: 120, completion_date: "2025-05-03", reviewed_by: USER_IDS.david, review_notes: null,           created_at: "2025-05-03T12:00:00Z", updated_at: "2025-05-04T09:00:00Z" },
  { id: "ep-003", employee_id: USER_IDS.alice, activity_id: "csr-001", proof_url: null,                                   approval_status: "pending",  points_earned: 0,   completion_date: null,         reviewed_by: null,           review_notes: null,           created_at: "2025-07-01T09:00:00Z", updated_at: "2025-07-01T09:00:00Z" },
];

// ── Challenges ────────────────────────────────────────────────────────
export const mockChallenges = [
  { id: "chal-001", title: "Switch to Paperless for 30 Days",  category_id: "cat-002", description: "Go fully paperless in your daily work for one month. Track and submit daily.",          xp_reward: 500, difficulty: "medium", evidence_required: true,  deadline: "2025-08-31", status: "active",   created_by: USER_IDS.david, created_at: "2025-06-01T09:00:00Z", updated_at: "2025-06-01T09:00:00Z" },
  { id: "chal-002", title: "Reduce Personal Electricity by 15%", category_id: "cat-001", description: "Measure and reduce your home or office electricity consumption by 15% vs last month.", xp_reward: 750, difficulty: "hard",   evidence_required: true,  deadline: "2025-09-30", status: "active",   created_by: USER_IDS.david, created_at: "2025-06-15T09:00:00Z", updated_at: "2025-06-15T09:00:00Z" },
  { id: "chal-003", title: "Commute-Free Week",                 category_id: "cat-001", description: "Work from home or use public transport exclusively for one full week.",                  xp_reward: 300, difficulty: "easy",   evidence_required: false, deadline: "2025-07-31", status: "active",   created_by: USER_IDS.david, created_at: "2025-07-01T09:00:00Z", updated_at: "2025-07-01T09:00:00Z" },
  { id: "chal-004", title: "Plant a Tree Challenge",            category_id: "cat-005", description: "Plant and register at least one tree. Submit geo-tagged photo as proof.",               xp_reward: 400, difficulty: "easy",   evidence_required: true,  deadline: "2025-08-15", status: "active",   created_by: USER_IDS.david, created_at: "2025-07-05T09:00:00Z", updated_at: "2025-07-05T09:00:00Z" },
  { id: "chal-005", title: "Carbon Footprint Audit",            category_id: "cat-005", description: "Complete a full personal carbon footprint audit using an approved tool.",                xp_reward: 600, difficulty: "medium", evidence_required: true,  deadline: "2025-10-31", status: "draft",    created_by: USER_IDS.david, created_at: "2025-07-08T09:00:00Z", updated_at: "2025-07-08T09:00:00Z" },
  { id: "chal-006", title: "Zero Plastic Month",                category_id: "cat-002", description: "Eliminate single-use plastics from your workspace and routines for 30 days.",           xp_reward: 450, difficulty: "medium", evidence_required: false, deadline: "2025-12-31", status: "archived", created_by: USER_IDS.david, created_at: "2025-01-01T09:00:00Z", updated_at: "2025-04-01T09:00:00Z" },
];

// ── Challenge Participations ──────────────────────────────────────────
export const mockChallengeParticipations = [
  { id: "cp-001", challenge_id: "chal-001", employee_id: USER_IDS.alice, progress: 73,  proof_url: null,                                   approval_status: "pending",  xp_awarded: 0,   submitted_at: null,                  reviewed_by: null,           created_at: "2025-06-10T09:00:00Z", updated_at: "2025-07-10T09:00:00Z" },
  { id: "cp-002", challenge_id: "chal-003", employee_id: USER_IDS.alice, progress: 100, proof_url: null,                                   approval_status: "approved", xp_awarded: 300, submitted_at: "2025-07-07T12:00:00Z", reviewed_by: USER_IDS.david, created_at: "2025-07-01T09:00:00Z", updated_at: "2025-07-08T09:00:00Z" },
  { id: "cp-003", challenge_id: "chal-004", employee_id: USER_IDS.alice, progress: 50,  proof_url: "https://example.com/tree-photo.jpg",   approval_status: "pending",  xp_awarded: 0,   submitted_at: "2025-07-11T10:00:00Z", reviewed_by: null,           created_at: "2025-07-06T09:00:00Z", updated_at: "2025-07-11T10:00:00Z" },
];

// ── ESG Policies ──────────────────────────────────────────────────────
export const mockPolicies = [
  { id: "pol-001", title: "Carbon Neutrality Roadmap 2030",     content: "This policy outlines EcoSphere's commitment to achieve net-zero carbon emissions across all operations by 2030...\n\nScope 1, 2, and 3 emissions will be measured annually using the GHG Protocol framework. All departments are required to submit quarterly carbon reduction plans.", category: "environmental", version: "2.1", effective_date: "2024-01-01", expiry_date: null,           acknowledgement_required: true,  is_active: true,  is_deleted: false, created_at: "2024-01-01T09:00:00Z", updated_at: "2024-12-01T09:00:00Z" },
  { id: "pol-002", title: "Supplier Code of Conduct",            content: "All third-party suppliers must adhere to this code which covers: environmental standards, fair labour practices, anti-corruption compliance, and data security requirements. Non-compliance will result in contract review.", category: "governance",    version: "1.3", effective_date: "2024-03-01", expiry_date: null,           acknowledgement_required: true,  is_active: true,  is_deleted: false, created_at: "2024-03-01T09:00:00Z", updated_at: "2024-09-01T09:00:00Z" },
  { id: "pol-003", title: "Diversity, Equity & Inclusion Policy", content: "EcoSphere is committed to fostering an inclusive workplace. This policy establishes standards for equitable hiring, promotion practices, and zero tolerance for discrimination or harassment.", category: "social",        version: "1.0", effective_date: "2024-06-01", expiry_date: null,           acknowledgement_required: true,  is_active: true,  is_deleted: false, created_at: "2024-06-01T09:00:00Z", updated_at: "2024-06-01T09:00:00Z" },
  { id: "pol-004", title: "Electronic Waste Disposal Policy",    content: "All electronic equipment must be disposed of through certified e-waste recyclers. Employees must not discard electronics in general waste bins.", category: "environmental", version: "1.1", effective_date: "2024-04-01", expiry_date: "2026-04-01",  acknowledgement_required: false, is_active: true,  is_deleted: false, created_at: "2024-04-01T09:00:00Z", updated_at: "2024-04-01T09:00:00Z" },
  { id: "pol-005", title: "Remote Work Environmental Guidelines", content: "Employees working remotely are encouraged to use energy-efficient equipment, minimise home office energy consumption, and report significant energy usage through the EcoSphere platform.", category: "environmental", version: "1.0", effective_date: "2023-09-01", expiry_date: "2024-09-01",  acknowledgement_required: false, is_active: false, is_deleted: false, created_at: "2023-09-01T09:00:00Z", updated_at: "2024-09-01T09:00:00Z" },
];

// ── Policy Acknowledgements ───────────────────────────────────────────
export const mockPolicyAcknowledgements = [
  { id: "pa-001", policy_id: "pol-001", employee_id: USER_IDS.alice, acknowledged_at: "2024-01-10T10:30:00Z", ip_address: "192.168.1.1" },
  { id: "pa-002", policy_id: "pol-002", employee_id: USER_IDS.alice, acknowledged_at: "2024-03-05T11:00:00Z", ip_address: "192.168.1.1" },
  { id: "pa-003", policy_id: "pol-003", employee_id: USER_IDS.alice, acknowledged_at: "2024-06-03T09:15:00Z", ip_address: "192.168.1.1" },
];

// ── Audits ────────────────────────────────────────────────────────────
export const mockAudits = [
  { id: "aud-001", title: "Annual ESG Compliance Audit 2024",    audit_type: "external",   status: "completed",   auditor: "Deloitte ESG Advisory",    scheduled_date: "2024-12-01", completed_date: "2024-12-15", findings: "No major non-conformances found. Minor improvements recommended in Scope 3 tracking.",          is_deleted: false, created_at: "2024-10-01T09:00:00Z", updated_at: "2024-12-15T09:00:00Z" },
  { id: "aud-002", title: "Q2 Internal Carbon Data Review",      audit_type: "internal",   status: "completed",   auditor: "Internal Sustainability Team", scheduled_date: "2025-06-15", completed_date: "2025-06-20", findings: "Fleet emissions data for Q2 requires correction. Operations dept notified.",                     is_deleted: false, created_at: "2025-05-01T09:00:00Z", updated_at: "2025-06-20T09:00:00Z" },
  { id: "aud-003", title: "Regulatory GHG Protocol Audit",       audit_type: "regulatory", status: "in_progress", auditor: "National Environment Agency", scheduled_date: "2025-07-30", completed_date: null,          findings: null,                                                                                             is_deleted: false, created_at: "2025-06-01T09:00:00Z", updated_at: "2025-07-01T09:00:00Z" },
  { id: "aud-004", title: "Supplier ESG Verification",           audit_type: "external",   status: "scheduled",   auditor: "EY Climate Change Advisory",  scheduled_date: "2025-09-15", completed_date: null,          findings: null,                                                                                             is_deleted: false, created_at: "2025-07-01T09:00:00Z", updated_at: "2025-07-01T09:00:00Z" },
];

// ── Compliance Issues ─────────────────────────────────────────────────
export const mockComplianceIssues = [
  { id: "ci-001", title: "Scope 3 Emissions Underreported",         description: "Q1 2025 supply chain emissions data is missing for three key suppliers. Data must be collected and reported within 30 days.", severity: "high",     status: "in_progress", department_id: DEPT_IDS.sustainability, due_date: "2025-08-01", assigned_to: USER_IDS.david,  is_deleted: false, created_at: "2025-07-01T09:00:00Z", updated_at: "2025-07-05T09:00:00Z" },
  { id: "ci-002", title: "Fleet Vehicle Emissions Exceed Threshold",  description: "Operations fleet monthly CO2 output exceeded the 2,000 kg target set in goal GOAL-002 for June 2025.",                         severity: "medium",   status: "open",        department_id: DEPT_IDS.operations,     due_date: "2025-07-31", assigned_to: USER_IDS.bob,    is_deleted: false, created_at: "2025-06-15T09:00:00Z", updated_at: "2025-06-15T09:00:00Z" },
  { id: "ci-003", title: "E-Waste Bins Not Deployed to All Floors",   description: "Electronic waste collection bins missing from floors 3 and 4 of the main building. Policy POL-004 mandates organisation-wide coverage.", severity: "low",     status: "open",        department_id: DEPT_IDS.operations,     due_date: "2025-08-15", assigned_to: USER_IDS.eva,    is_deleted: false, created_at: "2025-07-08T09:00:00Z", updated_at: "2025-07-08T09:00:00Z" },
  { id: "ci-004", title: "Supplier Code of Conduct — Tier 2 Gap",    description: "Two Tier-2 suppliers have not yet signed the Supplier Code of Conduct (POL-002). Deadline for signatures was Q1 2025.",             severity: "critical", status: "overdue",     department_id: DEPT_IDS.sustainability, due_date: "2025-03-31", assigned_to: USER_IDS.carol,  is_deleted: false, created_at: "2025-01-15T09:00:00Z", updated_at: "2025-07-01T09:00:00Z" },
];

// ── Badges ────────────────────────────────────────────────────────────
export const mockBadges = [
  { id: "bdg-001", name: "First Step",      description: "Complete your first sustainability challenge.",          icon: null, unlock_rule: { type: "challenge_count", value: 1   }, is_active: true, created_at: "2024-01-01T09:00:00Z", updated_at: "2024-01-01T09:00:00Z" },
  { id: "bdg-002", name: "Rising Star",     description: "Earn 500 XP through challenges and activities.",        icon: null, unlock_rule: { type: "xp_threshold",    value: 500 }, is_active: true, created_at: "2024-01-01T09:00:00Z", updated_at: "2024-01-01T09:00:00Z" },
  { id: "bdg-003", name: "Community Hero",  description: "Participate in 3 CSR activities.",                       icon: null, unlock_rule: { type: "csr_count",       value: 3   }, is_active: true, created_at: "2024-01-01T09:00:00Z", updated_at: "2024-01-01T09:00:00Z" },
  { id: "bdg-004", name: "Carbon Warrior",  description: "Earn 2,000 XP in sustainability challenges.",           icon: null, unlock_rule: { type: "xp_threshold",    value: 2000 }, is_active: true, created_at: "2024-02-01T09:00:00Z", updated_at: "2024-02-01T09:00:00Z" },
  { id: "bdg-005", name: "ESG Champion",    description: "Complete 10 challenges of any difficulty.",              icon: null, unlock_rule: { type: "challenge_count", value: 10  }, is_active: true, created_at: "2024-02-01T09:00:00Z", updated_at: "2024-02-01T09:00:00Z" },
  { id: "bdg-006", name: "Green Advocate",  description: "Participate in 5 CSR activities.",                       icon: null, unlock_rule: { type: "csr_count",       value: 5   }, is_active: true, created_at: "2024-03-01T09:00:00Z", updated_at: "2024-03-01T09:00:00Z" },
];

export const mockMyBadges = [
  { id: "mb-001", badge_id: "bdg-001", name: "First Step",  description: "Complete your first sustainability challenge.",   icon: null, awarded_at: "2025-06-10T09:00:00Z" },
  { id: "mb-002", badge_id: "bdg-002", name: "Rising Star", description: "Earn 500 XP through challenges and activities.", icon: null, awarded_at: "2025-07-08T09:00:00Z" },
];

// ── Rewards ───────────────────────────────────────────────────────────
export const mockRewards = [
  { id: "rwd-001", name: "Extra Day Off",           description: "Redeem for one additional paid day off, subject to manager approval.", points_required: 2000, stock: 5,   status: "active",       image_url: null, created_at: "2024-01-01T09:00:00Z", updated_at: "2024-01-01T09:00:00Z" },
  { id: "rwd-002", name: "Plant a Tree (Sponsored)", description: "EcoSphere sponsors the planting of a tree in your name through a certified partner.", points_required: 500, stock: 100, status: "active",   image_url: null, created_at: "2024-01-01T09:00:00Z", updated_at: "2024-01-01T09:00:00Z" },
  { id: "rwd-003", name: "EcoSphere Merch Pack",    description: "Branded water bottle, tote bag, and notebook made from sustainable materials.", points_required: 800, stock: 20,  status: "active",       image_url: null, created_at: "2024-02-01T09:00:00Z", updated_at: "2024-02-01T09:00:00Z" },
  { id: "rwd-004", name: "Carbon Offset Credit",    description: "1 tonne of CO2 offset on your behalf through a verified carbon offset project.", points_required: 1200, stock: 50, status: "active",    image_url: null, created_at: "2024-03-01T09:00:00Z", updated_at: "2024-03-01T09:00:00Z" },
  { id: "rwd-005", name: "Vintage ESG Report Print", description: "Limited edition printed ESG impact summary for your records.", points_required: 350, stock: 0, status: "out_of_stock", image_url: null, created_at: "2024-05-01T09:00:00Z", updated_at: "2024-06-01T09:00:00Z" },
];

// ── Leaderboards ──────────────────────────────────────────────────────
export const mockUserLeaderboard = [
  { rank: 1, user_id: USER_IDS.grace,  full_name: "Grace Lee",     avatar_url: null, department_id: DEPT_IDS.sustainability, xp: 3200 },
  { rank: 2, user_id: USER_IDS.david,  full_name: "David Chen",    avatar_url: null, department_id: DEPT_IDS.sustainability, xp: 2850 },
  { rank: 3, user_id: USER_IDS.alice,  full_name: "Alice Johnson", avatar_url: null, department_id: DEPT_IDS.engineering,   xp: 2640 },
  { rank: 4, user_id: USER_IDS.henry,  full_name: "Henry Park",    avatar_url: null, department_id: DEPT_IDS.operations,    xp: 2100 },
  { rank: 5, user_id: USER_IDS.bob,    full_name: "Bob Smith",     avatar_url: null, department_id: DEPT_IDS.operations,    xp: 1850 },
  { rank: 6, user_id: USER_IDS.carol,  full_name: "Carol White",   avatar_url: null, department_id: DEPT_IDS.marketing,     xp: 1640 },
  { rank: 7, user_id: USER_IDS.eva,    full_name: "Eva Martinez",  avatar_url: null, department_id: DEPT_IDS.hr,            xp: 1380 },
  { rank: 8, user_id: USER_IDS.frank,  full_name: "Frank Brown",   avatar_url: null, department_id: DEPT_IDS.engineering,   xp: 1120 },
];

export const mockDeptLeaderboard = [
  { rank: 1, department_id: DEPT_IDS.sustainability, name: "Sustainability",  code: "SUS", score: 88.4 },
  { rank: 2, department_id: DEPT_IDS.engineering,   name: "Engineering",     code: "ENG", score: 75.2 },
  { rank: 3, department_id: DEPT_IDS.hr,            name: "Human Resources", code: "HR",  score: 71.3 },
  { rank: 4, department_id: DEPT_IDS.marketing,     name: "Marketing",       code: "MKT", score: 69.1 },
  { rank: 5, department_id: DEPT_IDS.operations,    name: "Operations",      code: "OPS", score: 66.0 },
];

// ── Diversity Metrics ─────────────────────────────────────────────────
export const mockDiversityMetrics = {
  total_users: 68,
  role_distribution: { admin: 2, manager: 5, employee: 61 },
  headcount_by_department: [
    { department: "Engineering",     headcount: 24 },
    { department: "Operations",      headcount: 18 },
    { department: "Marketing",       headcount: 12 },
    { department: "Sustainability",  headcount: 8  },
    { department: "Human Resources", headcount: 6  },
  ],
  csr_participations_by_department: [
    { department: "Sustainability",  participations: 28 },
    { department: "Engineering",     participations: 19 },
    { department: "Operations",      participations: 14 },
    { department: "Marketing",       participations: 9  },
    { department: "Human Resources", participations: 5  },
  ],
  departments_with_data: 5,
};

// ── ESG Configuration ─────────────────────────────────────────────────
export const mockEsgConfig = {
  id: "cfg-001",
  org_name: "EcoSphere Technologies",
  environmental_weight: 40,
  social_weight: 30,
  governance_weight: 30,
  auto_emission_calculation: true,
  evidence_requirement: true,
  badge_auto_award: true,
  notification_in_app: true,
  notification_email: false,
  updated_at: "2025-06-01T09:00:00Z",
};

// ── Report tables helper ──────────────────────────────────────────────
function makeReportTable(columns: string[], rows: (string | number | null)[][]): object {
  return { columns, rows, total_records: rows.length };
}

export const mockEnvironmentalReport = makeReportTable(
  ["Date", "Department", "Source", "Quantity", "CO2 (kg)"],
  mockCarbonTransactions.map((t) => [
    t.transaction_date,
    mockDepartments.find((d) => d.id === t.department_id)?.name ?? t.department_id,
    t.source_type,
    t.quantity,
    t.co2_equivalent,
  ])
);

export const mockSocialReport = makeReportTable(
  ["Activity", "Department", "Status", "Points Reward"],
  mockCsrActivities.map((a) => [
    a.title,
    mockDepartments.find((d) => d.id === a.department_id)?.name ?? a.department_id,
    a.status,
    a.points_reward,
  ])
);

export const mockGovernanceReport = makeReportTable(
  ["Issue", "Severity", "Status", "Due Date"],
  mockComplianceIssues.map((i) => [i.title, i.severity, i.status, i.due_date])
);

export const mockEsgSummaryReport = {
  environmental: mockEnvironmentalReport,
  social: mockSocialReport,
  governance: mockGovernanceReport,
};
