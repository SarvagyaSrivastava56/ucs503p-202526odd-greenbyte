
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from '@/components/ui/switch';
import { type Category, type Event } from '@/lib/types';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { saveEvent } from '@/lib/events';
import { useAppContext } from '@/context/app-context';
import Image from 'next/image';

const categories: Category[] = [
  'Music',
  'Tech',
  'Art',
  'Sports',
  'Workshop',
  'Social',
  'Conference',
  'Party',
  'Networking'
];

const eventFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  bannerUrl: z.string().url('Please enter a valid image URL.').or(z.literal('')),
  category: z.enum(categories),
  startAt: z.date({ required_error: "A start date and time is required." }),
  endAt: z.date({ required_error: "An end date and time is required." }),
  venue: z.string().min(3, 'Venue is required.'),
  isOnline: z.boolean().default(false),
  link: z.string().url().optional().or(z.literal('')),
  capacity: z.coerce.number().int().min(0, 'Capacity must be a positive number.').default(0),
  isPaid: z.boolean().default(false),
  price: z.coerce.number().min(0).optional().default(0),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
}).refine(data => !data.bannerUrl || z.string().url().safeParse(data.bannerUrl).success, {
  message: 'Please enter a valid image URL.',
  path: ['bannerUrl'],
}).refine(data => data.endAt > data.startAt, {
  message: "End date must be after start date.",
  path: ["endAt"],
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export function CreateEventDialog({ children, eventToEdit }: { children: React.ReactNode, eventToEdit?: Event }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAppContext();

  const defaultValues: Partial<EventFormValues> = eventToEdit ? {
    ...eventToEdit,
    startAt: new Date(eventToEdit.startAt),
    endAt: new Date(eventToEdit.endAt),
  } : {
    title: '',
    description: '',
    bannerUrl: '',
    isOnline: false,
    isPaid: false,
    status: 'published',
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });
  
  const isPaid = form.watch('isPaid');
  const isOnline = form.watch('isOnline');
  const bannerUrl = form.watch('bannerUrl');

  useEffect(() => {
    if (eventToEdit) {
      form.reset({
        ...eventToEdit,
        startAt: new Date(eventToEdit.startAt),
        endAt: new Date(eventToEdit.endAt),
      });
    } else {
      form.reset(defaultValues);
    }
  }, [eventToEdit, form]);

  const onSubmit = async (data: EventFormValues) => {
    if (!currentUser || !currentUser.societyIds || currentUser.societyIds.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not associated with any society.' });
      return;
    }
    
    try {
      await saveEvent({ ...data, societyId: currentUser.societyIds[0] }, eventToEdit?.id);
      toast({
        title: `Event ${eventToEdit ? 'updated' : 'created'} successfully!`,
        description: `${data.title} has been saved.`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to save event:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">{eventToEdit ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {eventToEdit ? 'Update the details of your event.' : 'Fill out the details below to create a new event.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about your event..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bannerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {bannerUrl && z.string().url().safeParse(bannerUrl).success && (
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image src={bannerUrl} alt="Banner preview" fill style={{objectFit: 'cover'}} />
              </div>
            )}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Main Quad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP HH:mm")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0,0,0,0))
                            }
                            initialFocus
                          />
                           <div className="p-3 border-t border-border">
                              <Input type="time" onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(':');
                                  const newDate = new Date(field.value);
                                  newDate.setHours(parseInt(hours), parseInt(minutes));
                                  field.onChange(newDate);
                              }}
                              />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP HH:mm")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                             disabled={(date) =>
                              date < (form.getValues('startAt') || new Date())
                            }
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                              <Input type="time" onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(':');
                                  const newDate = new Date(field.value);
                                  newDate.setHours(parseInt(hours), parseInt(minutes));
                                  field.onChange(newDate);
                              }}
                              />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0 for unlimited" {...field} />
                      </FormControl>
                       <FormDescription>
                        Set to 0 for unlimited capacity.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                             <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            </div>
            
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="isOnline"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Online Event</FormLabel>
                            <FormDescription>
                            Is this event hosted online?
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                {isOnline && <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Event Link</FormLabel>
                        <FormControl>
                            <Input placeholder="https://your-event-link.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />}
            </div>

            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="isPaid"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Paid Event</FormLabel>
                            <FormDescription>
                            Does this event require payment?
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                {isPaid && <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />}
            </div>


            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Event'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
