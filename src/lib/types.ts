export type UserRole = 'student' | 'society_admin' | 'super_admin';

export type User = {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  email: string;
  role: UserRole;
  interests?: string[];
  societyIds?: string[];
  points?: number;
  deviceTokens?: string[];
  avatarUrl: string;
  password?: string;
};

export type Society = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  admins: string[]; // array of user UIDs
};

export type EventStatus = 'draft' | 'published' | 'archived';
export type Category = 'Music' | 'Tech' | 'Art' | 'Sports' | 'Workshop' | 'Social' | 'Conference' | 'Party' | 'Networking';

export type Event = {
  id: string;
  title: string;
  description: string;
  societyId: string;
  category: Category;
  venue: string;
  isOnline: boolean;
  link?: string;
  bannerUrl: string;
  imageHint?: string;
  startAt: string; // ISO 8601 format
  endAt: string; // ISO 8601 format
  capacity: number;
  isPaid: boolean;
  price?: number;
  status: EventStatus;
  tags?: string[];
  counters?: {
    rsvpCount: number;
    views: number;
    checkIns: number;
  };
  isTrending?: boolean; // UI-only property
};

export type RsvpStatus = 'rsvped' | 'waitlisted' | 'cancelled';

export type Rsvp = {
  id: string; // Same as user UID
  userId: string;
  eventId: string;
  status: RsvpStatus;
  qrCode?: string;
  checkInAt?: string; // ISO 8601 format
};

export type ChatMessage = {
  id: string;
  eventId: string;
  uid: string;
  text?: string;
  imageUrl?: string;
  createdAt: string; // ISO 8601 format
  reactions?: { [key: string]: number };
};
