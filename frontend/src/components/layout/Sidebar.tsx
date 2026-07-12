import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "@/utils/clsx";
import { useUiStore } from "@/store/uiStore";
import {
  Globe,
  LayoutDashboard,
  Leaf,
  Users,
  Scale,
  Trophy,
  Settings,
} from "lucide-react";

const navSections = [
  {
    key: "environmental",
    label: "Environmental",
    icon: Leaf,
    items: [
      { to: "/environmental/carbon", label: "Carbon Tracking" },
      { to: "/environmental/emission-factors", label: "Emission Factors" },
      { to: "/environmental/goals", label: "Goals" },
    ],
  },
  {
    key: "social",
    label: "Social",
    icon: Users,
    items: [
      { to: "/social/csr-activities", label: "CSR Activities" },
      { to: "/social/participation", label: "Participation" },
    ],
  },
  {
    key: "governance",
    label: "Governance",
    icon: Scale,
    items: [
      { to: "/governance/policies", label: "Policies" },
      { to: "/governance/audits", label: "Audits" },
      { to: "/governance/compliance-issues", label: "Compliance Issues" },
    ],
  },
  {
    key: "gamification",
    label: "Gamification",
    icon: Trophy,
    items: [
      { to: "/gamification/challenges", label: "Challenges" },
      { to: "/gamification/leaderboard", label: "Leaderboard" },
      { to: "/gamification/badges", label: "Badges" },
      { to: "/gamification/rewards", label: "Rewards" },
    ],
  },
  {
    key: "other",
    label: "More",
    icon: Settings,
    items: [
      { to: "/reports", label: "Reports" },
      { to: "/ai-assistant", label: "ESG Assistant" },
      { to: "/settings", label: "Settings" },
    ],
  },
];

function findActiveSectionKey(pathname: string): string | null {
  const section = navSections.find((s) => s.items.some((item) => pathname.startsWith(item.to)));
  return section?.key ?? null;
}

export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);
  const location = useLocation();

  const [openKey, setOpenKey] = useState<string | null>(() => findActiveSectionKey(location.pathname));

  // Keep whichever section contains the current route expanded as you navigate.
  useEffect(() => {
    const active = findActiveSectionKey(location.pathname);
    if (active) setOpenKey(active);
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-950/40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "w-72 shrink-0 h-screen overflow-y-auto border-r border-neutral-200 bg-white flex flex-col",
          "fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-0 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-neutral-100">
          <Globe className="w-6 h-6 text-eco-green shrink-0" />
          <div>
            <p className="font-display font-bold text-lg leading-tight tracking-tight">EcoSphere</p>
            <p className="text-[11px] text-neutral-400 leading-tight">ESG Management</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium mb-2 transition-colors duration-150",
                isActive
                  ? "bg-eco-green/10 text-eco-green"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )
            }
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            Dashboard
          </NavLink>

          <div className="h-px bg-neutral-100 my-2" />

          <div className="flex flex-col gap-1">
            {navSections.map((section) => {
              const isOpen = openKey === section.key;
              const isSectionActive = section.items.some((item) => location.pathname.startsWith(item.to));
              const SectionIcon = section.icon;

              return (
                <div key={section.key}>
                  <button
                    type="button"
                    onClick={() => setOpenKey(isOpen ? null : section.key)}
                    className={clsx(
                      "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-150",
                      isSectionActive ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                    )}
                  >
                    <SectionIcon className="w-5 h-5 shrink-0 text-neutral-400" />
                    <span className="flex-1 text-left">{section.label}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={clsx("transition-transform duration-200 text-neutral-400", isOpen && "rotate-180")}
                    >
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 py-1 flex flex-col gap-0.5">
                          {section.items.map((item) => (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              className={({ isActive }) =>
                                clsx(
                                  "relative flex items-center gap-2 rounded-lg pl-4 pr-3 py-2 text-sm font-medium transition-colors duration-150",
                                  isActive
                                    ? "text-eco-green bg-eco-green/5"
                                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
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
