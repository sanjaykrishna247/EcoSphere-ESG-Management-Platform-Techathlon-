import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "@/utils/clsx";
import { useUiStore } from "@/store/uiStore";
import {
  LayoutDashboard,
  Leaf,
  Users,
  Scale,
  Trophy,
  Settings,
  BarChart2,
  ChevronDown,
} from "lucide-react";

const navSections = [
  {
    key: "environmental",
    label: "Environmental",
    icon: Leaf,
    items: [
      { to: "/environmental/carbon",           label: "Carbon Tracking" },
      { to: "/environmental/emission-factors",  label: "Emission Factors" },
      { to: "/environmental/product-profiles",  label: "Product ESG Profiles" },
      { to: "/environmental/goals",             label: "Goals" },
    ],
  },
  {
    key: "social",
    label: "Social",
    icon: Users,
    items: [
      { to: "/social/csr-activities", label: "CSR Activities" },
      { to: "/social/participation",   label: "Employee Participation" },
      { to: "/social/diversity",       label: "Diversity Dashboard" },
    ],
  },
  {
    key: "governance",
    label: "Governance",
    icon: Scale,
    items: [
      { to: "/governance/policies",                label: "Policies" },
      { to: "/governance/policy-acknowledgements", label: "Policy Acknowledgements" },
      { to: "/governance/audits",                  label: "Audits" },
      { to: "/governance/compliance-issues",       label: "Compliance Issues" },
    ],
  },
  {
    key: "gamification",
    label: "Gamification",
    icon: Trophy,
    items: [
      { to: "/gamification/challenges",            label: "Challenges" },
      { to: "/gamification/challenge-participation", label: "My Participations" },
      { to: "/gamification/badges",                label: "Badges" },
      { to: "/gamification/rewards",               label: "Rewards" },
      { to: "/gamification/leaderboard",           label: "Leaderboard" },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    icon: BarChart2,
    items: [
      { to: "/reports/environmental", label: "Environmental" },
      { to: "/reports/social",        label: "Social" },
      { to: "/reports/governance",    label: "Governance" },
      { to: "/reports/summary",       label: "ESG Summary" },
      { to: "/reports/custom",        label: "Custom Builder" },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    items: [
      { to: "/settings/departments",  label: "Departments" },
      { to: "/settings/categories",   label: "Categories" },
      { to: "/settings/esg-config",   label: "ESG Configuration" },
      { to: "/settings/notifications", label: "Notifications" },
    ],
  },
];

function findActiveSectionKey(pathname: string): string | null {
  if (pathname === "/" || pathname === "") return null;
  const section = navSections.find((s) =>
    s.items.some((item) => pathname.startsWith(item.to))
  );
  return section?.key ?? null;
}

export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);
  const location = useLocation();

  const [openKey, setOpenKey] = useState<string | null>(
    () => findActiveSectionKey(location.pathname)
  );

  useEffect(() => {
    const active = findActiveSectionKey(location.pathname);
    if (active) setOpenKey(active);
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-950/30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "w-60 shrink-0 h-screen border-r border-neutral-200 bg-white flex flex-col",
          "fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out",
          "lg:sticky lg:top-0 lg:z-0 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-14 px-4 border-b border-neutral-200 flex items-center shrink-0">
          <img
            src="/ecosphere-logo.svg"
            alt="EcoSphere"
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {/* Dashboard — top-level flat link */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium mb-1 transition-colors duration-100",
                isActive
                  ? "bg-brand-muted text-brand"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )
            }
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Dashboard
          </NavLink>

          <div className="h-px bg-neutral-100 mx-1 my-2" />

          {/* Sections */}
          <div className="flex flex-col gap-0.5">
            {navSections.map((section) => {
              const isOpen = openKey === section.key;
              const isSectionActive = section.items.some((item) =>
                location.pathname.startsWith(item.to)
              );
              const SectionIcon = section.icon;

              return (
                <div key={section.key}>
                  <button
                    type="button"
                    onClick={() => setOpenKey(isOpen ? null : section.key)}
                    className={clsx(
                      "w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-100",
                      isSectionActive
                        ? "text-neutral-900 font-semibold"
                        : "text-neutral-500 font-medium hover:text-neutral-800 hover:bg-neutral-50"
                    )}
                  >
                    <SectionIcon
                      className={clsx(
                        "w-4 h-4 shrink-0",
                        isSectionActive ? "text-neutral-700" : "text-neutral-400"
                      )}
                    />
                    <span className="flex-1 text-left">{section.label}</span>
                    <ChevronDown
                      className={clsx(
                        "w-3.5 h-3.5 text-neutral-400 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="ml-3 pl-3 border-l border-neutral-150 py-0.5 flex flex-col gap-0.5">
                          {section.items.map((item) => (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              className={({ isActive }) =>
                                clsx(
                                  "block rounded-md px-3 py-1.5 text-sm transition-colors duration-100",
                                  isActive
                                    ? "bg-brand-muted text-brand font-medium"
                                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 font-normal"
                                )
                              }
                            >
                              {item.label}
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
