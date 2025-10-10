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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Integrations
          </CardTitle>
          <CardDescription>Connect external services and tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Google Calendar</p>
                <p className="text-sm text-muted-foreground">Auto-add events to calendar</p>
              </div>
            </div>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-muted-foreground">Share events via WhatsApp</p>
              </div>
            </div>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <LinkIcon className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">Linktree</p>
                <p className="text-sm text-muted-foreground">Add events to your Linktree</p>
              </div>
            </div>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

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

