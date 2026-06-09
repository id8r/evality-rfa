/*
lib/navigation.ts | Shared application navigation metadata | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const primaryNavigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Candidates", href: "/candidates", icon: ShieldCheck },
  { label: "Clients", href: "/clients", icon: Building2 },
  { label: "Team", href: "/team", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

/* - - - - - - - - - - - - - - - - */
