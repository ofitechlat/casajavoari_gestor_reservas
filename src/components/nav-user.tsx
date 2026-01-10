"use client"

import { MoreVertical, LogOut, UserCircle, CreditCard, Bell, Settings, Users, ChessBishop, ChessQueen, ChessKing } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"

interface IconRole {
  [key: string]: React.ComponentType<{ className?: string }>
}

export function NavUser({
  user,
  logout,
}: {
  user: SupabaseUser | null
  logout: () => Promise<void>
}) {
  // Return null if no user
  if (!user) return null

  // Extract user data from Supabase user object
  const userName = user.user_metadata?.name || user.email?.split("@")[0] || "Usuario"
  const userEmail = user.email || ""
  const userRole = user.user_metadata?.role || "gestor"
  const userAvatar = user.user_metadata?.avatar || ""

  const iconRole = {
    "user": ChessBishop,
    "gestor": ChessQueen,
    "admin": ChessKing,
  }

  const IconRole: IconRole = iconRole[userRole]

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  const { isMobile } = useSidebar()
  const router = useRouter()
  const dropdownItems = [
    {
      label: "Usuarios",
      icon: Users,
      action: () => router.push("/users")
    },
    {
      label: "Configuración",
      icon: Settings,
      action: () => router.push("/settings")
    },
    {
      label: "Cerrar Sesión",
      icon: LogOut,
      action: logout
    },
  ]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground relative"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="rounded-lg">{getInitials(userName)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>

                <span className="text-muted-foreground truncate text-xs capitalize flex items-center gap-1">
                  {userRole}
                </span>
              </div>
              <MoreVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="rounded-lg">{getInitials(userName)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {userEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {dropdownItems.map((item) => (
                <DropdownMenuItem key={item.label} onClick={item.action}>
                  <item.icon />
                  {item.label}
                </DropdownMenuItem>
              ))}
              {/*               {user.role === "admin" && (
                <DropdownMenuItem>
                  <IconUsers />
                  Usuarios
                </DropdownMenuItem>
              )}
              {user.role === "gestor" && (
                <DropdownMenuItem>
                  <IconUsers />
                  Usuarios
                </DropdownMenuItem>
              )} */}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
