'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap,
  Clock,
  Bell,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { useAppContext } from '@/context/app-context';
import type { AutomationRule } from '@/lib/types';

interface EventTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultDuration: number;
  defaultCapacity: number;
}

const isSocietyAdminRole = (role?: string | null): boolean =>
  role === 'society_admin' || role === 'super_admin';

export default function AutomationPage() {
  const { toast } = useToast();
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);
  
  // Form state for creating new automation
  const [ruleName, setRuleName] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [templates] = useState<EventTemplate[]>([
    {
      id: '1',
      name: 'Tech Talk',
      category: 'Tech',
      description: 'Standard tech talk event with Q&A',
      defaultDuration: 90,
      defaultCapacity: 100,
    },
    {
      id: '2',
      name: 'Workshop',
      category: 'Workshop',
      description: 'Hands-on workshop format',
      defaultDuration: 180,
      defaultCapacity: 50,
    },
    {
      id: '3',
      name: 'Cultural Event',
      category: 'Music',
      description: 'Music and cultural performance',
      defaultDuration: 120,
      defaultCapacity: 200,
    },
  ]);

  const hasSocietyAccess = isSocietyAdminRole(currentUser?.role);
  const availableSocietyId = currentUser?.societyIds?.[0] || null;

  useEffect(() => {
    if (!hasSocietyAccess) {
      setSocietyId(null);
      setAutomations([]);
      setAccessDenied('You need a society admin account to manage automations.');
      return;
    }

    if (!availableSocietyId) {
      setSocietyId(null);
      setAutomations([]);
      setAccessDenied('No society is linked to your account yet. Ask a super admin to add you.');
      return;
    }

    setAccessDenied(null);
    setSocietyId(availableSocietyId);
  }, [hasSocietyAccess, availableSocietyId]);

  useEffect(() => {
    if (!societyId || !hasSocietyAccess) {
      return;
    }

    const unsub = onSnapshot(
      collection(firestore, 'societies', societyId, 'automations'),
      (snapshot) => {
        const rules: AutomationRule[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AutomationRule[];
        setAutomations(rules);
      },
      (error: any) => {
        console.warn('Automation snapshot error:', error);
        setAccessDenied('Unable to load automations. Check your permissions or try again later.');
        toast({
          title: 'Permissions Error',
          description:
            'We could not access automation rules. Ensure your account has society admin access or deploy the latest Firestore rules.',
          variant: 'destructive',
        });
        setAutomations([]);
      }
    );

    return () => unsub();
  }, [societyId, toast, hasSocietyAccess]);

  const toggleAutomation = async (id: string, currentEnabled: boolean) => {
    if (!societyId) return;

    try {
      const ruleRef = doc(firestore, 'societies', societyId, 'automations', id);
      await updateDoc(ruleRef, {
        enabled: !currentEnabled,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'Automation Updated',
        description: `Automation rule has been ${!currentEnabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update automation rule',
        variant: 'destructive',
      });
    }
  };

  const createAutomation = async () => {
    if (!societyId || !ruleName || !selectedTrigger || !selectedAction) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const newRule: Omit<AutomationRule, 'id'> = {
        societyId,
        name: ruleName,
        trigger: selectedTrigger as AutomationRule['trigger'],
        action: selectedAction as AutomationRule['action'],
        enabled: true,
        config: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser?.uid,
      };

      // Add email config if action is send_email or send_thank_you
      if (selectedAction === 'send_email' || selectedAction === 'send_thank_you') {
        newRule.config = {
          subject: emailSubject || (selectedAction === 'send_thank_you' ? 'Thank You for Registering' : 'Event Update'),
          body: emailBody || (selectedAction === 'send_thank_you' ? 'Thank you for registering for {{eventTitle}}!' : ''),
        };
      }

      const ruleRef = doc(collection(firestore, 'societies', societyId, 'automations'));
      await setDoc(ruleRef, newRule);

      // Reset form
      setRuleName('');
      setSelectedTrigger('');
      setSelectedAction('');
      setEmailSubject('');
      setEmailBody('');

      toast({
        title: 'Success',
        description: 'Automation rule created successfully',
      });
    } catch (error) {
      console.error('Error creating automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create automation rule',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAutomation = async (id: string, name: string) => {
    if (!societyId) return;

    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'societies', societyId, 'automations', id));
      toast({
        title: 'Success',
        description: 'Automation rule deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete automation rule',
        variant: 'destructive',
      });
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      'rsvp_created': 'New RSVP received',
      'check_in': 'Attendee checks in',
      'capacity_reached': 'Event reaches capacity',
      'before_event': 'Time before event',
      'after_event': 'Time after event',
    };
    return labels[trigger] || trigger;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'send_email': 'Send email',
      'send_notification': 'Send push notification',
      'close_registration': 'Close registration',
      'open_waitlist': 'Open waitlist',
      'send_thank_you': 'Send thank you email',
    };
    return labels[action] || action;
  };

  const canManageAutomations = hasSocietyAccess && !!societyId && !accessDenied;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Automation</h1>
          <p className="text-muted-foreground">Automate repetitive tasks and workflows</p>
        </div>
      </div>

      {accessDenied && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Limited Access
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {accessDenied}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.filter(a => a.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {automations.length} total rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Event Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~12 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Event Templates
          </CardTitle>
          <CardDescription>
            Pre-configured templates to quickly create events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {template.category}
                      </Badge>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{template.defaultDuration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span className="font-medium">{template.defaultCapacity} people</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm" variant="outline">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Rules
          </CardTitle>
          <CardDescription>
            Automatically perform actions based on triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {automations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No automation rules configured yet. Create one below!
            </p>
          ) : (
            automations.map((automation) => (
              <div 
                key={automation.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${automation.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                    {automation.enabled ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{automation.name}</h4>
                      <Badge variant={automation.enabled ? 'default' : 'secondary'}>
                        {automation.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Trigger: {getTriggerLabel(automation.trigger)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>Action: {getActionLabel(automation.action)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={automation.enabled}
                    onCheckedChange={() => toggleAutomation(automation.id, automation.enabled)}
                    disabled={!canManageAutomations}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAutomation(automation.id, automation.name)}
                    disabled={!canManageAutomations}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Custom Automation */}
      <Card>
        <CardHeader>
          <CardTitle>Create Custom Automation</CardTitle>
          <CardDescription>
            Build your own automation rule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rule Name</Label>
            <Input 
              placeholder="e.g., Send thank you email" 
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Trigger</Label>
            <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
              <SelectTrigger>
                <SelectValue placeholder="When should this run?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rsvp_created">New RSVP received</SelectItem>
                <SelectItem value="check_in">Attendee checks in</SelectItem>
                <SelectItem value="capacity_reached">Event reaches capacity</SelectItem>
                <SelectItem value="before_event">Time before event</SelectItem>
                <SelectItem value="after_event">Time after event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Action</Label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="What should happen?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_thank_you">Send thank you email</SelectItem>
                <SelectItem value="send_email">Send email</SelectItem>
                <SelectItem value="send_notification">Send push notification</SelectItem>
                <SelectItem value="close_registration">Close registration</SelectItem>
                <SelectItem value="open_waitlist">Open waitlist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(selectedAction === 'send_email' || selectedAction === 'send_thank_you') && (
            <>
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input 
                  placeholder="Enter email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea 
                  placeholder="Enter email body (use {{variableName}} for dynamic content)"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: {`{{userName}}, {{eventTitle}}, {{eventDate}}, {{eventVenue}}, {{societyName}}`}
                </p>
              </div>
            </>
          )}

          <Button 
            className="w-full" 
            onClick={createAutomation}
            disabled={loading || !canManageAutomations}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Create Automation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
            <p>Enable &quot;Send thank you email&quot; to automatically thank all registered participants</p>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
            <p>Set up capacity automation to prevent overbooking</p>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
            <p>Use email templates to maintain a consistent brand voice</p>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
            <p>Test automations on a small event first to verify they work as expected</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
