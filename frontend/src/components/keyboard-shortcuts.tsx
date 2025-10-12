'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function KeyboardShortcuts() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // Check for modifier key (Cmd on Mac, Ctrl on Windows/Linux)
      const isMod = e.metaKey || e.ctrlKey;

      // Keyboard shortcuts
      switch (e.key.toLowerCase()) {
        case 'n':
          if (isMod) {
            e.preventDefault();
            // Navigate to create event
            router.push('/society-dashboard/events/new');
            toast({
              title: 'Shortcut',
              description: 'Opening new event form',
            });
          }
          break;
        
        case '/':
          e.preventDefault();
          // Focus search input (if exists)
          const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search"]');
          if (searchInput) {
            searchInput.focus();
            toast({
              title: 'Shortcut',
              description: 'Focusing search',
            });
          }
          break;
        
        case 'h':
          if (isMod && e.shiftKey) {
            e.preventDefault();
            // Show shortcuts help
            toast({
              title: 'Keyboard Shortcuts',
              description: `
                Cmd/Ctrl + N: New event
                /: Focus search
                Cmd/Ctrl + Shift + H: Show shortcuts
                Cmd/Ctrl + D: Dashboard
                Cmd/Ctrl + E: Events
                Cmd/Ctrl + A: Analytics
              `,
              duration: 8000,
            });
          }
          break;
        
        case 'd':
          if (isMod) {
            e.preventDefault();
            router.push('/society-dashboard');
          }
          break;
        
        case 'e':
          if (isMod) {
            e.preventDefault();
            router.push('/society-dashboard/events');
          }
          break;
        
        case 'a':
          if (isMod) {
            e.preventDefault();
            router.push('/society-dashboard/analytics');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [router, toast]);

  return null; // This component doesn't render anything
}

