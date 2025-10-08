'use client';

import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/theme-provider';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="font-headline text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground mb-8">Manage your account and app settings.</p>
        
        <div className="space-y-8">
          <Card className="bg-background/60 dark:bg-card/60 backdrop-blur-xl border-border/20 shadow-lg">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-mode">Theme Mode</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/60 dark:bg-card/60 backdrop-blur-xl border-border/20 shadow-lg">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Receive emails about new events and updates.
                  </span>
                </Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                  <span>Push Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Get push notifications on your device.
                  </span>
                </Label>
                <Switch id="push-notifications" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/60 dark:bg-card/60 backdrop-blur-xl border-border/20 shadow-lg">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Log out from all devices</p>
                  <Button variant="outline">Log Out</Button>
               </div>
               <Separator />
               <div className="flex items-center justify-between">
                  <p className="text-sm text-destructive">Delete Account</p>
                  <Button variant="destructive">Delete</Button>
               </div>
               <p className="text-xs text-muted-foreground pt-2">
                Warning: Deleting your account is a permanent action and cannot be undone.
               </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
