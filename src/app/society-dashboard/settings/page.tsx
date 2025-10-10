'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { firestore } from '@/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings as SettingsIcon,
  Upload,
  Link as LinkIcon,
  Globe,
  Mail,
  Calendar,
  Webhook,
  Save,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/context/app-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SocietyProfile {
  name: string;
  bio: string;
  logoUrl: string;
  coverUrl: string;
  socialLinks: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
  settings: {
    allowedDomains: string[];
    autoApproveMembers: boolean;
    requireCheckIn: boolean;
    sendWeeklyDigest: boolean;
  };
}

export default function SettingsPage() {
  const { user } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<SocietyProfile>({
    name: 'Music Society',
    bio: 'Campus music and concert organization promoting live performances and music appreciation.',
    logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=400&fit=crop',
    socialLinks: {
      website: 'https://musicsociety.example.com',
      instagram: '@musicsociety',
      twitter: '@musicsociety',
    },
    settings: {
      allowedDomains: ['thapar.edu', 'student.thapar.edu'],
      autoApproveMembers: false,
      requireCheckIn: true,
      sendWeeklyDigest: true,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const societyDoc = await getDoc(doc(firestore, 'societies', 'default'));
        if (societyDoc.exists()) {
          const data = societyDoc.data();
          setProfile(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Error fetching society profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const societyRef = doc(firestore, 'societies', 'default');
      await updateDoc(societyRef, {
        ...profile,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (type: 'logo' | 'cover') => {
    // This would trigger file upload in production
    toast({
      title: 'Upload',
      description: `${type === 'logo' ? 'Logo' : 'Cover'} upload would be triggered here`,
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your society profile and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Society Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Society Profile</CardTitle>
          <CardDescription>Basic information about your society</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Society Logo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.logoUrl} />
                <AvatarFallback>{profile.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={() => handleImageUpload('logo')}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Logo
              </Button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="space-y-2">
              <div className="w-full h-32 rounded-lg overflow-hidden border">
                <img 
                  src={profile.coverUrl} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button variant="outline" onClick={() => handleImageUpload('cover')}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Cover
              </Button>
            </div>
          </div>

          <Separator />

          {/* Society Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Society Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {profile.bio.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Social Links
          </CardTitle>
          <CardDescription>Connect your social media accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={profile.socialLinks.website || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, website: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">@</span>
              <Input
                id="instagram"
                placeholder="yoursociety"
                value={profile.socialLinks.instagram || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">@</span>
              <Input
                id="twitter"
                placeholder="yoursociety"
                value={profile.socialLinks.twitter || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              placeholder="facebook.com/yoursociety"
              value={profile.socialLinks.facebook || ''}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, facebook: e.target.value }
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="linkedin.com/company/yoursociety"
              value={profile.socialLinks.linkedin || ''}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>Manage who can join your society</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Allowed Email Domains</Label>
            <div className="space-y-2">
              {profile.settings.allowedDomains.map((domain, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={domain} readOnly />
                  <Button variant="outline" size="sm">Remove</Button>
                </div>
              ))}
              <Button variant="outline" size="sm">
                <LinkIcon className="mr-2 h-4 w-4" />
                Add Domain
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Only users with these email domains can become organizers
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-approve Members</Label>
              <p className="text-sm text-muted-foreground">
                Automatically approve new member requests
              </p>
            </div>
            <Switch
              checked={profile.settings.autoApproveMembers}
              onCheckedChange={(checked) => setProfile(prev => ({
                ...prev,
                settings: { ...prev.settings, autoApproveMembers: checked }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Event Settings</CardTitle>
          <CardDescription>Default settings for events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Require Check-in</Label>
              <p className="text-sm text-muted-foreground">
                Attendees must check-in at the venue
              </p>
            </div>
            <Switch
              checked={profile.settings.requireCheckIn}
              onCheckedChange={(checked) => setProfile(prev => ({
                ...prev,
                settings: { ...prev.settings, requireCheckIn: checked }
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Send weekly summary of event performance
              </p>
            </div>
            <Switch
              checked={profile.settings.sendWeeklyDigest}
              onCheckedChange={(checked) => setProfile(prev => ({
                ...prev,
                settings: { ...prev.settings, sendWeeklyDigest: checked }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <IntegrationsSection />

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>Receive real-time notifications for events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input placeholder="https://your-server.com/webhook" />
            <p className="text-xs text-muted-foreground">
              We'll send POST requests to this URL for new RSVPs, check-ins, and other events
            </p>
          </div>
          <Button variant="outline">
            <Webhook className="mr-2 h-4 w-4" />
            Add Webhook
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
            <div>
              <p className="font-medium">Delete Society</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this society and all associated data
              </p>
            </div>
            <Button variant="destructive">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Integrations Section Component
function IntegrationsSection() {
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState({
    googleCalendar: { connected: false, loading: false },
    whatsapp: { connected: false, loading: false },
    linktree: { connected: false, loading: false },
  });

  useEffect(() => {
    if (currentUser) {
      checkIntegrationStatus();
    }

    // Listen for OAuth popup messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'oauth_success') {
        if (event.data.integration === 'google-calendar') {
          setIntegrations(prev => ({ ...prev, googleCalendar: { connected: true, loading: false } }));
          toast({
            title: '🎉 Google Calendar Connected!',
            description: 'Your Google Calendar is now synced with Campus Event Hub. Events will automatically sync to your calendar.',
          });
        }
      } else if (event.data.type === 'oauth_error') {
        setIntegrations(prev => ({
          ...prev,
          googleCalendar: { connected: false, loading: false }
        }));
        toast({
          title: 'Connection Failed',
          description: `Failed to connect Google Calendar: ${event.data.error}`,
          variant: 'destructive',
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentUser, toast]);

  const checkIntegrationStatus = async () => {
    if (!currentUser) return;

    // Check Google Calendar
    try {
      const response = await fetch(`/api/integrations/google-calendar/connect?userId=${currentUser.uid}`);
      const data = await response.json();
      setIntegrations(prev => ({
        ...prev,
        googleCalendar: { connected: data.connected, loading: false }
      }));
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
    }

    // Check WhatsApp
    try {
      const response = await fetch(`/api/integrations/whatsapp/connect?userId=${currentUser.uid}`);
      const data = await response.json();
      setIntegrations(prev => ({
        ...prev,
        whatsapp: { connected: data.connected, loading: false }
      }));
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    }

    // Check Linktree
    try {
      const response = await fetch(`/api/integrations/linktree/connect?userId=${currentUser.uid}`);
      const data = await response.json();
      setIntegrations(prev => ({
        ...prev,
        linktree: { connected: data.connected, loading: false }
      }));
    } catch (error) {
      console.error('Error checking Linktree status:', error);
    }
  };

  const handleGoogleCalendarConnect = async () => {
    if (!currentUser) return;

    setIntegrations(prev => ({ ...prev, googleCalendar: { ...prev.googleCalendar, loading: true } }));

    try {
      // Generate real OAuth URL for Google Calendar
      const state = btoa(JSON.stringify({ userId: currentUser.uid }));
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/google/callback`)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`;

      // Open OAuth flow in new window
      const popup = window.open(
        authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Check if connection was successful
          setTimeout(() => {
            checkIntegrationStatus();
          }, 1000);
        }
      }, 1000);

      toast({
        title: 'Opening Google Calendar Authorization',
        description: 'Complete the authorization in the popup window to connect your Google Calendar',
      });
    } catch (error) {
      console.error('Google Calendar connection error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setIntegrations(prev => ({ ...prev, googleCalendar: { ...prev.googleCalendar, loading: false } }));
    }
  };

  const handleWhatsAppConnect = async () => {
    if (!currentUser) return;

    setIntegrations(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, loading: true } }));

    try {
      // For demo, we'll use a simple phone number input
      const phoneNumber = prompt('Enter your WhatsApp phone number (with country code):\n\nExample: +1234567890');
      if (!phoneNumber) {
        setIntegrations(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, loading: false } }));
        return;
      }

      const response = await fetch('/api/integrations/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIntegrations(prev => ({ ...prev, whatsapp: { connected: true, loading: false } }));
        toast({
          title: 'WhatsApp Connected',
          description: data.message,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('WhatsApp connection error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect WhatsApp',
        variant: 'destructive',
      });
      setIntegrations(prev => ({ ...prev, whatsapp: { connected: false, loading: false } }));
    }
  };

  const handleLinktreeConnect = async () => {
    if (!currentUser) return;

    setIntegrations(prev => ({ ...prev, linktree: { ...prev.linktree, loading: true } }));

    try {
      // For demo mode, simulate connection
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setIntegrations(prev => ({ ...prev, linktree: { connected: true, loading: false } }));
      
      toast({
        title: 'Linktree Connected!',
        description: 'Demo mode: Links will be created when you add real API keys',
      });
    } catch (error) {
      console.error('Linktree connection error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect Linktree',
        variant: 'destructive',
      });
    } finally {
      setIntegrations(prev => ({ ...prev, linktree: { ...prev.linktree, loading: false } }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Integrations
        </CardTitle>
        <CardDescription>Connect external services and tools</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Calendar */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">Google Calendar</p>
                {integrations.googleCalendar.connected && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Auto-add events to calendar</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleGoogleCalendarConnect}
            disabled={integrations.googleCalendar.loading}
          >
            {integrations.googleCalendar.loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {integrations.googleCalendar.connected ? 'Reconnect' : 'Connect'}
          </Button>
        </div>

        {/* WhatsApp */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="h-8 w-8 text-green-500" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">WhatsApp</p>
                {integrations.whatsapp.connected && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Share events via WhatsApp</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleWhatsAppConnect}
            disabled={integrations.whatsapp.loading}
          >
            {integrations.whatsapp.loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {integrations.whatsapp.connected ? 'Reconnect' : 'Connect'}
          </Button>
        </div>

        {/* Linktree */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <LinkIcon className="h-8 w-8 text-purple-500" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">Linktree</p>
                {integrations.linktree.connected && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Add events to your Linktree</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLinktreeConnect}
            disabled={integrations.linktree.loading}
          >
            {integrations.linktree.loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {integrations.linktree.connected ? 'Reconnect' : 'Connect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

