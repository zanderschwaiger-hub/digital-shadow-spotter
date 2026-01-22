import { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  User,
  Radio,
  CheckSquare,
  Building2,
  FileText,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Identity Inventory', url: '/inventory', icon: User },
  { title: 'Signals', url: '/signals', icon: Radio },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare },
  { title: 'Broker Opt-outs', url: '/brokers', icon: Building2 },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
                <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">Freedom Engine</h1>
                <p className="text-xs text-sidebar-foreground/60">Footprint Maintenance</p>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.url}
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-4">
            <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
              <p className="text-xs text-sidebar-foreground/80 mb-1">Signed in as</p>
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email}
              </p>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="flex-1" />
            <p className="text-xs text-muted-foreground italic">
              "Emotional safety through technical discipline."
            </p>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}