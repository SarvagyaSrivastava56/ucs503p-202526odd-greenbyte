import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  Compass,
  CalendarCheck,
  User,
  Settings,
  Star,
} from 'lucide-react';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

export default function AppSidebar() {
  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="h-14 items-center justify-center gap-2">
        <Icons.Logo className="size-6 text-primary" />
        <h1 className="font-headline text-lg font-semibold tracking-tight text-primary">
          CampusConnect
        </h1>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Home" isActive>
            <Home />
            <span>Home</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Explore">
            <Compass />
            <span>Explore</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="My Events">
            <CalendarCheck />
            <span>My Events</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Favorites">
            <Star />
            <span>Favorites</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <Separator />
      <SidebarFooter className="p-2">
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Profile">
            <User />
            <span>Profile</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Settings">
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
