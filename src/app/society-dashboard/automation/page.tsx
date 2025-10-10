'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap,
  Clock,
  Bell,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EventTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultDuration: number;
  defaultCapacity: number;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export default function AutomationPage() {
  const { toast } = useToast();
  
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

  const [automations, setAutomations] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-close RSVP when full',
      trigger: 'RSVP reaches capacity',
      action: 'Close registration automatically',
      enabled: true,
    },
    {
      id: '2',
      name: 'Auto-close RSVP before event',
      trigger: '1 hour before event start',
      action: 'Stop accepting new RSVPs',
      enabled: true,
    },
    {
      id: '3',
      name: '24-hour reminder',
      trigger: '24 hours before event',
      action: 'Send notification to all RSVPs',
      enabled: true,
    },
    {
      id: '4',
      name: '30-minute reminder',
      trigger: '30 minutes before event',
      action: 'Send final reminder notification',
      enabled: false,
    },
    {
      id: '5',
      name: 'Post-event feedback',
      trigger: '2 hours after event ends',
      action: 'Send feedback survey to attendees',
      enabled: false,
    },
  ]);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id ? { ...auto, enabled: !auto.enabled } : auto
    ));
    toast({
      title: 'Automation Updated',
      description: 'Automation rule has been updated',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Automation</h1>
          <p className="text-muted-foreground">Automate repetitive tasks and workflows</p>
        </div>
      </div>

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
          {automations.map((automation) => (
            <div 
              key={automation.id}
              className="flex items-start justify-between p-4 border rounded-lg"
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
                      <span>Trigger: {automation.trigger}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>Action: {automation.action}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Switch
                checked={automation.enabled}
                onCheckedChange={() => toggleAutomation(automation.id)}
              />
            </div>
          ))}
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
            <Input placeholder="e.g., Send thank you email" />
          </div>
          
          <div className="space-y-2">
            <Label>Trigger</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="When should this run?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rsvp">New RSVP received</SelectItem>
                <SelectItem value="checkin">Attendee checks in</SelectItem>
                <SelectItem value="capacity">Event reaches capacity</SelectItem>
                <SelectItem value="before">Time before event</SelectItem>
                <SelectItem value="after">Time after event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Action</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="What should happen?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Send email</SelectItem>
                <SelectItem value="notification">Send push notification</SelectItem>
                <SelectItem value="close">Close registration</SelectItem>
                <SelectItem value="open">Open waitlist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            Create Automation
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
            <p>Enable auto-close RSVP to prevent overbooking</p>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
            <p>Set up reminder notifications to improve attendance rates</p>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
            <p>Use templates to maintain consistency across events</p>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
            <p>Collect feedback automatically after events end</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

