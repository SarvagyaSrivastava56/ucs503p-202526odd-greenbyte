'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { firestore } from '@/firebase';
import { 
  collection, 
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus,
  Mail,
  Shield,
  Edit2,
  Trash2,
  Clock,
  UserCog,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

type TeamRole = 'owner' | 'admin' | 'editor' | 'check-in-only';

interface TeamMember {
  id: string;
  email: string;
  role: TeamRole;
  displayName?: string;
  avatarUrl?: string;
  invitedAt?: string;
  joinedAt?: string;
  status: 'pending' | 'active';
}

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

const roleColors = {
  owner: 'default',
  admin: 'default',
  editor: 'secondary',
  'check-in-only': 'outline',
} as const;

const roleDescriptions = {
  owner: 'Full access to all features',
  admin: 'Can manage events, team, and settings',
  editor: 'Can create and edit events',
  'check-in-only': 'Can only check-in attendees',
};

export default function TeamManagementPage() {
  const { user } = useFirebase();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('editor');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch team members
    const fetchTeamMembers = async () => {
      try {
        const membersRef = collection(firestore, 'societies', 'default', 'team');
        const membersSnapshot = await getDocs(membersRef);
        
        const members = membersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TeamMember[];
        
        setTeamMembers(members);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team members:', error);
        setLoading(false);
      }
    };

    // Fetch audit log
    const fetchAuditLog = async () => {
      try {
        const logRef = collection(firestore, 'societies', 'default', 'auditLog');
        const logSnapshot = await getDocs(query(logRef));
        
        const log = logSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as AuditLogEntry[];
        
        setAuditLog(log.slice(0, 10)); // Show latest 10 entries
      } catch (error) {
        console.error('Error fetching audit log:', error);
      }
    };

    fetchTeamMembers();
    fetchAuditLog();
  }, [user]);

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      const membersRef = collection(firestore, 'societies', 'default', 'team');
      
      const newMember = {
        email: inviteEmail,
        role: inviteRole,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        invitedBy: user?.id || 'unknown',
      };

      await addDoc(membersRef, newMember);

      // Log the action
      const logRef = collection(firestore, 'societies', 'default', 'auditLog');
      await addDoc(logRef, {
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown',
        action: 'INVITE_MEMBER',
        details: `Invited ${inviteEmail} as ${inviteRole}`,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: 'Invitation Sent',
        description: `Invitation sent to ${inviteEmail}`,
      });

      setInviteEmail('');
      setInviteRole('editor');
      setInviteDialogOpen(false);
      
      // Refresh team members
      const membersSnapshot = await getDocs(membersRef);
      setTeamMembers(membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TeamMember[]);
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamRole) => {
    try {
      const memberRef = doc(firestore, 'societies', 'default', 'team', memberId);
      await updateDoc(memberRef, { role: newRole });

      // Log the action
      const logRef = collection(firestore, 'societies', 'default', 'auditLog');
      await addDoc(logRef, {
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown',
        action: 'UPDATE_ROLE',
        details: `Changed role to ${newRole}`,
        timestamp: new Date().toISOString(),
      });

      setTeamMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));

      toast({
        title: 'Role Updated',
        description: 'Team member role has been updated',
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      await deleteDoc(doc(firestore, 'societies', 'default', 'team', memberToDelete.id));

      // Log the action
      const logRef = collection(firestore, 'societies', 'default', 'auditLog');
      await addDoc(logRef, {
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown',
        action: 'REMOVE_MEMBER',
        details: `Removed ${memberToDelete.email}`,
        timestamp: new Date().toISOString(),
      });

      setTeamMembers(prev => prev.filter(m => m.id !== memberToDelete.id));

      toast({
        title: 'Member Removed',
        description: 'Team member has been removed',
      });

      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Team & Collaboration</h1>
          <p className="text-muted-foreground">Manage your team members and permissions</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as TeamRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - {roleDescriptions.admin}</SelectItem>
                    <SelectItem value="editor">Editor - {roleDescriptions.editor}</SelectItem>
                    <SelectItem value="check-in-only">Check-in Only - {roleDescriptions['check-in-only']}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteMember}>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {teamMembers.filter(m => m.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting acceptance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Full access members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading team members...
                  </TableCell>
                </TableRow>
              ) : teamMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No team members yet. Invite someone to get started.
                  </TableCell>
                </TableRow>
              ) : (
                teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatarUrl} />
                          <AvatarFallback>
                            {member.email.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.displayName || member.email}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleUpdateRole(member.id, value as TeamRole)}
                        disabled={member.role === 'owner'}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="check-in-only">Check-in Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.joinedAt 
                        ? format(new Date(member.joinedAt), 'MMM d, yyyy')
                        : member.invitedAt
                          ? `Invited ${format(new Date(member.invitedAt), 'MMM d, yyyy')}`
                          : 'Unknown'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      {member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setMemberToDelete(member);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Audit Log
          </CardTitle>
          <CardDescription>Recent team activity and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLog.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No activity yet</p>
            ) : (
              auditLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserCog className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{entry.action.replace('_', ' ')}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.userName}: {entry.details}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToDelete?.email} from your team? They will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

