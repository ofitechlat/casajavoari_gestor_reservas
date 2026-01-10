"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext";
import { HomeIcon, CalendarIcon, PlusCircleIcon, ListIcon, TicketIcon, StoreIcon, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation";
import { NavUser } from "../nav-user";
import Image from "next/image";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigationGroups = [
    {
      links: [
        { href: "/dashboard", label: "Inicio", icon: HomeIcon },
        { href: "/dashboard/calendar", label: "Calendario", icon: CalendarIcon },
        { href: "/dashboard/create-booking", label: "Nueva Solicitud", icon: PlusCircleIcon },
      ]
    },
    {
      title: "Gestión",
      links: [
        { href: "/dashboard/requests", label: "Solicitudes", icon: ListIcon },
        { href: "/dashboard/activities", label: "Actividades", icon: TicketIcon },
        { href: "/dashboard/ventures", label: "Emprendimientos", icon: StoreIcon },
      ]
    }
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-[50px]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="#">
                <LayoutDashboard className="!size-5" />
                {/* <Image src="/logo.jpg" alt="Logo" width={24} height={24} className="w-6 h-6" /> */}
                <span className="text-base font-semibold">Casa Javorai</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.title || groupIndex}>
            {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    isActive={pathname === link.href}
                    tooltip={link.label}
                    asChild
                  >
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavUser user={user} logout={logout} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
