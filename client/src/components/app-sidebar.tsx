import {
  LayoutDashboard,
  Heart,
  Users,
  Calendar,
  FileText,
  LogOut,
  TrendingUp,
  DollarSign,
  UserCircle,
  Settings,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Campaigns", url: "/admin/campaigns", icon: Heart },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Events", url: "/admin/events", icon: Calendar },
  { title: "Reports", url: "/admin/reports", icon: FileText },
];

const donorMenuItems = [
  { title: "Dashboard", url: "/donor", icon: LayoutDashboard },
  { title: "Campaigns", url: "/donor/campaigns", icon: Heart },
  { title: "My Donations", url: "/donor/donations", icon: DollarSign },
  { title: "Profile", url: "/donor/profile", icon: UserCircle },
];

const volunteerMenuItems = [
  { title: "Dashboard", url: "/volunteer", icon: LayoutDashboard },
  { title: "My Events", url: "/volunteer/events", icon: Calendar },
  { title: "Profile", url: "/volunteer/profile", icon: UserCircle },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout, isAdmin, isDonor, isVolunteer } = useAuth();

  const menuItems = isAdmin
    ? adminMenuItems
    : isDonor
    ? donorMenuItems
    : isVolunteer
    ? volunteerMenuItems
    : [];

  const getRoleBadgeVariant = () => {
    if (isAdmin) return "default";
    if (isDonor) return "secondary";
    return "outline";
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">DCMS</h2>
            <p className="text-xs text-muted-foreground">Charity Management</p>
          </div>
        </div>
        {user && (
          <Badge variant={getRoleBadgeVariant()} className="mt-4 w-fit" data-testid="badge-user-role">
            {user.role}
          </Badge>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wide px-6 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={isActive ? "bg-sidebar-accent" : ""}
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <a href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-sidebar-border">
        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
