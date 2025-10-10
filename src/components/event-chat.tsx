'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { useFirebase } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/storage';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  uid: string;
  text?: string;
  imageUrl?: string;
  createdAt: any;
  userName?: string;
  userAvatar?: string;
}

interface EventChatProps {
  eventId: string;
}

export function EventChat({ eventId }: EventChatProps) {
  const { user } = useFirebase();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!eventId) return;

    // Subscribe to chat messages
    const chatRef = collection(firestore, 'events', eventId, 'chat');
    const q = query(chatRef, orderBy('createdAt', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      
      setMessages(msgs);
      
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [eventId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Sign In Required',
        description: 'Please sign in to send messages.',
      });
      return;
    }

    if (!newMessage.trim() && !imageFile) {
      return;
    }

    setLoading(true);

    try {
      let imageUrl: string | undefined;

      // Upload image if selected
      if (imageFile) {
        const imagePath = `events/${eventId}/chat/${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, imagePath);
      }

      // Send message
      const chatRef = collection(firestore, 'events', eventId, 'chat');
      await addDoc(chatRef, {
        uid: user.uid,
        text: newMessage.trim() || null,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
        userName: user.displayName || user.email,
        userAvatar: user.photoURL || '',
      });

      // Reset form
      setNewMessage('');
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send',
        description: error.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Image must be less than 5MB.',
        });
        return;
      }
      setImageFile(file);
    }
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Sign in to join the conversation</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </p>
          )}
          {messages.map((msg) => {
            const isOwnMessage = msg.uid === user.uid;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.userAvatar} />
                  <AvatarFallback>{msg.userName?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{msg.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {msg.createdAt && format(msg.createdAt.toDate(), 'h:mm a')}
                    </span>
                  </div>
                  {msg.text && (
                    <div
                      className={`inline-block px-3 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Chat image"
                      className="mt-2 rounded-lg max-w-xs"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="border-t p-4">
        {imageFile && (
          <div className="mb-2 text-sm text-muted-foreground">
            Image selected: {imageFile.name}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setImageFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Remove
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || (!newMessage.trim() && !imageFile)}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

