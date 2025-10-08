import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CreateEventDialog } from './create-event-dialog';

export function CreateEventFab() {
  return (
    <TooltipProvider>
      <Tooltip>
        <CreateEventDialog>
            <TooltipTrigger asChild>
                <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg">
                    <Plus className="h-8 w-8" />
                    <span className="sr-only">Create Event</span>
                </Button>
            </TooltipTrigger>
        </CreateEventDialog>
        <TooltipContent side="left">
          <p>Create New Event</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
