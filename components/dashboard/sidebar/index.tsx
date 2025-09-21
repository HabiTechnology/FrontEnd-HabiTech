"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context-simple-fixed"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import BracketsIcon from "@/components/icons/brackets"
import ProcessorIcon from "@/components/icons/proccesor"
import CuteRobotIcon from "@/components/icons/cute-robot"
import EmailIcon from "@/components/icons/email"
import GearIcon from "@/components/icons/gear"
import DotsVerticalIcon from "@/components/icons/dots-vertical"
import { Bullet } from "@/components/ui/bullet"
import LockIcon from "@/components/icons/lock"
import ShoppingCartIcon from "@/components/icons/shopping-cart"
import HomeIcon from "@/components/icons/home"
import DocumentIcon from "@/components/icons/document"
import BellIcon from "@/components/icons/bell"
import Image from "next/image"
import { useIsV0 } from "@/lib/v0-context"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Shield } from "lucide-react"
import UsersIcon from "@/components/icons/users"

// This is sample data for the sidebar
const navItems = [
  {
    title: "INICIO",
    url: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "RESIDENTES",
    url: "/residentes",
    icon: UsersIcon,
  },
  {
    title: "SOLICITUDES",
    url: "/solicitudes",
    icon: DocumentIcon,
  },
  {
    title: "TIENDA",
    url: "/tienda",
    icon: ShoppingCartIcon,
  },
  {
    title: "NOTIFICACIONES",
    url: "/notificaciones",
    icon: BellIcon,
  },
]

const data = {
  navMain: [
    {
      title: "Tools",
      items: navItems,
    },
  ],
  desktop: {
    title: "Desktop (Online)",
    status: "online",
  },
  user: {
    name: "KRIMSON",
    email: "krimson@joyco.studio",
    avatar: "/avatars/user_krimson.png",
  },
}

export function DashboardSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const isV0 = useIsV0()
  const [isDark, setIsDark] = React.useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error durante logout:", error)
    }
  }

  const isActiveRoute = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(url)
  }

  const { isAdmin } = useAuth();
  return (
    <Sidebar {...props} className={cn("sidebar-habitech py-sides", className)}>
      <SidebarHeader className="glass-habitech rounded-t-lg flex gap-3 flex-row rounded-b-none backdrop-blur-sm">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
          <img src="/favicon.ico" alt="HABITECH Logo" className="size-10 group-hover:scale-[1.7] origin-top-left transition-transform" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display">HABITECH</span>
          <span className="text-xs uppercase">Gestión Inteligente, Convivencia Inteligente</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-8 w-8 shrink-0 hover-habitech">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group, i) => (
          <SidebarGroup className={cn(i === 0 && "rounded-t-none")} key={group.title}>
            <SidebarGroupLabel>
              <Bullet className="mr-2" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="sidebar-item"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveRoute(item.url)}
                    >
                      <a href={item.url}>
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {/* Acceso solo para admins */}
                {isAdmin && (
                  <SidebarMenuItem className="sidebar-item">
                    <SidebarMenuButton asChild isActive={isActiveRoute("/admin")}> 
                      <a href="/admin">
                        <Shield className="size-5" />
                        <span>Admin/Usuarios</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>
            <Bullet className="mr-2" />
            User
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger className="flex gap-0.5 w-full group cursor-pointer">
                    <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-clip">
                      <Image
                        src={data.user.avatar || "/placeholder.svg"}
                        alt={data.user.name}
                        width={120}
                        height={120}
                      />
                    </div>
                    <div className="group/item pl-3 pr-1.5 pt-2 pb-1.5 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center rounded group-data-[state=open]:bg-sidebar-accent-active group-data-[state=open]:hover:bg-sidebar-accent-active group-data-[state=open]:text-sidebar-accent-foreground">
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate text-xl font-display">{data.user.name}</span>
                        <span className="truncate text-xs uppercase opacity-50 group-hover/item:opacity-100">
                          {data.user.email}
                        </span>
                      </div>
                      <DotsVerticalIcon className="ml-auto size-4" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" side="bottom" align="end" sideOffset={4}>
                    <div className="flex flex-col">
                      <button className="flex items-center px-4 py-2 text-sm hover:bg-accent">
                        <img src="/favicon.ico" alt="HABITECH Logo" className="mr-2 h-4 w-4" />
                        Account
                      </button>
                      <button className="flex items-center px-4 py-2 text-sm hover:bg-accent">
                        <GearIcon className="mr-2 h-4 w-4" />
                        Settings
                      </button>
                      <div className="border-t border-border" />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm hover:bg-destructive hover:text-destructive-foreground text-destructive"
                      >
                        <LockIcon className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
