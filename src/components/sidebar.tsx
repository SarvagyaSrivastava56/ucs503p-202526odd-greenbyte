'use client';

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
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', icon: Home, label: 'Home', tooltip: 'Home' },
    { href: '/explore', icon: Compass, label: 'Explore', tooltip: 'Explore' },
    { href: '/my-events', icon: CalendarCheck, label: 'My Events', tooltip: 'My Events' },
    { href: '/favorites', icon: Star, label: 'Favorites', tooltip: 'Favorites' },
  ];

  const footerItems = [
    { href: '/profile', icon: User, label: 'Profile', tooltip: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings', tooltip: 'Settings' },
  ];

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="h-14 items-center justify-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Icons.Logo className="size-6 text-primary" />
          <h1 className="font-headline text-lg font-semibold tracking-tight text-primary">
            CampusConnect
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                tooltip={item.tooltip}
                isActive={pathname === item.href}
                asChild={false} 
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <Separator />
      <SidebarFooter className="p-2">
        {footerItems.map((item) => (
           <SidebarMenuItem key={item.href}>
             <Link href={item.href} passHref>
                <SidebarMenuButton
                  tooltip={item.tooltip}
                  isActive={pathname === item.href}
                  asChild={false}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
           </SidebarMenuItem>
        ))}
      </SidebarFooter>
    </Sidebar>
  );
}
