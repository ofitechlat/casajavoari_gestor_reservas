"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { NavItem } from "./nav-item";
import { sidebarNavigation } from "@/const/sidebar-navigation";

export function NavMain() {
  return (
    <SidebarMenu>
      {sidebarNavigation.map((group, groupIndex) => (
        <SidebarGroup key={group.title || groupIndex} className="py-0">
          {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
          <SidebarMenu>
            {group.links.map((link) => (
              <NavItem
                key={link.href}
                className={link.className}
                href={link.href}
                label={link.label}
                title={link.title}
                icon={link.icon}
                button={link.action}
                // @ts-ignore
                children={link.children}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarMenu>
  )
}
