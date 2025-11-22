import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import CampaignsManagement from "@/pages/admin/CampaignsManagement";
import UsersManagement from "@/pages/admin/UsersManagement";
import EventsManagement from "@/pages/admin/EventsManagement";
import Reports from "@/pages/admin/Reports";

import DonorDashboard from "@/pages/donor/DonorDashboard";
import DonorCampaigns from "@/pages/donor/DonorCampaigns";
import DonorDonations from "@/pages/donor/DonorDonations";

import VolunteerDashboard from "@/pages/volunteer/VolunteerDashboard";

import Profile from "@/pages/Profile";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "20rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="max-w-7xl mx-auto px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user?.role === 'ADMIN') {
    return <Redirect to="/admin" />;
  } else if (user?.role === 'DONOR') {
    return <Redirect to="/donor" />;
  } else if (user?.role === 'VOLUNTEER') {
    return <Redirect to="/volunteer" />;
  }

  return <Redirect to="/login" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/admin">
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/campaigns">
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout>
            <CampaignsManagement />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout>
            <UsersManagement />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/events">
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout>
            <EventsManagement />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/reports">
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout>
            <Reports />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/donor">
        <ProtectedRoute allowedRoles={['DONOR']}>
          <DashboardLayout>
            <DonorDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/donor/campaigns">
        <ProtectedRoute allowedRoles={['DONOR']}>
          <DashboardLayout>
            <DonorCampaigns />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/donor/donations">
        <ProtectedRoute allowedRoles={['DONOR']}>
          <DashboardLayout>
            <DonorDonations />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/donor/profile">
        <ProtectedRoute allowedRoles={['DONOR']}>
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/volunteer">
        <ProtectedRoute allowedRoles={['VOLUNTEER']}>
          <DashboardLayout>
            <VolunteerDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/volunteer/events">
        <ProtectedRoute allowedRoles={['VOLUNTEER']}>
          <DashboardLayout>
            <VolunteerDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/volunteer/profile">
        <ProtectedRoute allowedRoles={['VOLUNTEER']}>
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
