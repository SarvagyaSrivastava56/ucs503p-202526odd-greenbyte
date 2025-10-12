'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { firestore } from '@/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Ticket,
  DollarSign,
  TrendingUp,
  Users,
  Plus,
  Edit2,
  Trash2,
  Tag,
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

interface TicketTier {
  id: string;
  name: string;
  price: number;
  capacity: number;
  sold: number;
  description: string;
}

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  uses: number;
  maxUses: number;
  expiresAt?: string;
}

export default function MonetizationPage() {
  const { user } = useFirebase();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(firestore, 'events'));
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];
        
        const paidEvents = eventsData.filter(e => e.isPaid);
        setEvents(paidEvents);
        
        // Mock data for now
        setTicketTiers([
          { id: '1', name: 'Early Bird', price: 15, capacity: 50, sold: 35, description: 'Limited early bird pricing' },
          { id: '2', name: 'General', price: 25, capacity: 100, sold: 67, description: 'Standard admission' },
          { id: '3', name: 'VIP', price: 50, capacity: 20, sold: 12, description: 'VIP access with perks' },
        ]);
        
        setPromoCodes([
          { id: '1', code: 'STUDENT20', discount: 20, type: 'percentage', uses: 45, maxUses: 100, expiresAt: '2024-12-31' },
          { id: '2', code: 'EARLYBIRD', discount: 10, type: 'fixed', uses: 23, maxUses: 50, expiresAt: '2024-11-15' },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalRevenue = ticketTiers.reduce((acc, tier) => acc + (tier.price * tier.sold), 0);
  const totalSold = ticketTiers.reduce((acc, tier) => acc + tier.sold, 0);
  const totalCapacity = ticketTiers.reduce((acc, tier) => acc + tier.capacity, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Monetization</h1>
          <p className="text-muted-foreground">Manage ticket sales and revenue</p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From ticket sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Tickets Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSold}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {totalCapacity} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Ticket Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSold > 0 ? (totalRevenue / totalSold).toFixed(2) : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all tiers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Paid Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active paid events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Tiers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ticket Tiers</CardTitle>
            <CardDescription>Manage pricing and capacity for different ticket types</CardDescription>
          </div>
          <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Tier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Ticket Tier</DialogTitle>
                <DialogDescription>Add a new pricing tier for your event</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tier Name</Label>
                  <Input placeholder="e.g., Early Bird, VIP, General" />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" placeholder="25.00" />
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" placeholder="100" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="What's included in this tier?" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTierDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({ title: 'Tier Created', description: 'New ticket tier has been created' });
                  setTierDialogOpen(false);
                }}>
                  Create Tier
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketTiers.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tier.name}</p>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>${tier.price}</TableCell>
                  <TableCell>
                    <Badge variant={tier.sold >= tier.capacity ? 'default' : 'outline'}>
                      {tier.sold}/{tier.capacity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(tier.sold / tier.capacity) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${(tier.price * tier.sold).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Promo Codes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Promo Codes</CardTitle>
            <CardDescription>Manage discount codes and promotions</CardDescription>
          </div>
          <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Promo Code</DialogTitle>
                <DialogDescription>Add a discount code for your events</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input placeholder="STUDENT20" />
                </div>
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <select className="w-full border rounded-md p-2">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input type="number" placeholder="20" />
                </div>
                <div className="space-y-2">
                  <Label>Max Uses</Label>
                  <Input type="number" placeholder="100" />
                </div>
                <div className="space-y-2">
                  <Label>Expires At</Label>
                  <Input type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({ title: 'Promo Code Created', description: 'New promo code is now active' });
                  setPromoDialogOpen(false);
                }}>
                  Create Code
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {promo.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {promo.type === 'percentage' ? `${promo.discount}%` : `$${promo.discount}`}
                  </TableCell>
                  <TableCell>
                    {promo.uses}/{promo.maxUses}
                  </TableCell>
                  <TableCell>
                    <Badge variant={promo.uses >= promo.maxUses ? 'secondary' : 'default'}>
                      {promo.uses >= promo.maxUses ? 'Exhausted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {promo.expiresAt || 'No expiry'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Settlement Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Settlement Report
          </CardTitle>
          <CardDescription>Revenue breakdown and payouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Gross Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Platform Fees (3%)</p>
                <p className="text-xl font-bold">-${(totalRevenue * 0.03).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Refunds</p>
                <p className="text-xl font-bold">-$0.00</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
              <div>
                <p className="text-sm text-muted-foreground">Net Revenue</p>
                <p className="text-2xl font-bold">${(totalRevenue * 0.97).toFixed(2)}</p>
              </div>
              <Button>Request Payout</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

