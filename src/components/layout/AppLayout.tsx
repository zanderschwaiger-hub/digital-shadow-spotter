import { ReactNode, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FELogo } from '@/components/FELogo';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  User,
  Radio,
  CheckSquare,
  Building2,
  FileText,
  Settings,
  LogOut,
  BookOpen,
  Menu,
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

// Bottom nav — 4 primary tabs (Home, Actions, My accounts, More)
const PRIMARY_TABS = [
  { title: 'Home', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Actions', url: '/tasks', icon: CheckSquare },
  { title: 'My accounts', url: '/inventory', icon: User },
];

const NAV_GROUPS = [
  {
    label: 'Your safety',
    items: [
      { title: 'Home', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Actions', url: '/tasks', icon: CheckSquare },
      { title: 'My accounts', url: '/inventory', icon: User },
      { title: 'Breach alerts', url: '/signals', icon: Radio },
      { title: 'Data brokers', url: '/brokers', icon: Building2 },
      { title: 'Reports', url: '/reports', icon: FileText },
    ],
  },
  {
    label: 'When things go wrong',
    items: [
      { title: 'Response playbooks', url: '/playbooks', icon: BookOpen },
    ],
  },
  {
    label: 'Account',
    items: [
      { title: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

export function AppLayout({ children }: AppLayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (isMobile) {
    return <MobileLayout
      user={user}
      location={location}
      moreOpen={moreOpen}
      setMoreOpen={setMoreOpen}
      onSignOut={handleSignOut}
      onNavigate={(url) => { navigate(url); setMoreOpen(false); }}
    >
      {children}
    </MobileLayout>;
  }

  // Desktop sidebar
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link to="/dashboard" className="flex items-center gap-3">
              <FELogo size="md" />
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">Freedom Engine</h1>
                <p className="text-xs text-sidebar-foreground/60">Digital safety</p>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            {NAV_GROUPS.map(group => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
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
            ))}
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
            <Link
              to="/governance-console"
              className="mt-2 block text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
            >
              Advanced →
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="flex-1" />
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

// ── Mobile Layout ──────────────────────────────────────────────

interface MobileLayoutProps {
  children: ReactNode;
  user: { email?: string } | null;
  location: { pathname: string };
  moreOpen: boolean;
  setMoreOpen: (v: boolean) => void;
  onSignOut: () => void;
  onNavigate: (url: string) => void;
}

function MobileLayout({ children, user, location, moreOpen, setMoreOpen, onSignOut, onNavigate }: MobileLayoutProps) {
  const isTabActive = (url: string) => location.pathname === url;

  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
        <div className="flex items-center gap-3 px-4 h-12 w-full">
          <FELogo size="sm" className="shrink-0" />
          <span className="text-sm font-semibold truncate">Freedom Engine</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-nav">
        <div className="px-4 py-4">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-bottom">
        <div className="flex items-stretch justify-around" style={{ height: 'var(--bottom-nav-height)' }}>
          {PRIMARY_TABS.map(tab => {
            const active = isTabActive(tab.url);
            return (
              <button
                key={tab.url}
                onClick={() => onNavigate(tab.url)}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 touch-target transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.title}</span>
              </button>
            );
          })}

          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-1 flex-col items-center justify-center gap-0.5 touch-target text-muted-foreground transition-colors">
                <Menu className="h-5 w-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl safe-bottom max-h-[80dvh] overflow-y-auto">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="py-2 space-y-4">
                {NAV_GROUPS.map(group => (
                  <div key={group.label}>
                    <p className="px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map(item => {
                        const active = isTabActive(item.url);
                        return (
                          <button
                            key={item.url}
                            onClick={() => onNavigate(item.url)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 touch-target text-left transition-colors ${
                              active
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground active:bg-muted'
                            }`}
                          >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="text-sm font-medium">{item.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="border-t pt-2">
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={onSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 touch-target text-left text-destructive active:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>

                  <button
                    onClick={() => onNavigate('/governance-console')}
                    className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Advanced →
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}
