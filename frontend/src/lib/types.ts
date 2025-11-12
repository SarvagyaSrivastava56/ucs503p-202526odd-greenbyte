export type UserRole = 'student' | 'society_admin' | 'super_admin';
export type TeamRole = 'owner' | 'admin' | 'editor' | 'check-in-only';

export type User = {
  id: string; // Corresponds to Firebase Auth UID
  uid?: string; // Firebase Auth UID (for compatibility)
  name: string;
  displayName?: string; // Firebase display name
  email: string;
  role: UserRole;
  interests?: string[];
  societyIds?: string[];
  points?: number;
  deviceTokens?: string[];
  avatarUrl: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Society = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  coverUrl?: string;
  bio?: string;
  admins: string[]; // array of user UIDs
  editors?: string[]; // array of user UIDs
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
  settings?: {
    allowedDomains?: string[];
    autoApproveMembers?: boolean;
    requireCheckIn?: boolean;
    sendWeeklyDigest?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type EventStatus = 'draft' | 'published' | 'archived';
export type Category = 'Music' | 'Tech' | 'Art' | 'Sports' | 'Workshop' | 'Social' | 'Conference' | 'Party' | 'Networking';

export type SponsorAd = {
  videoUrl: string;
  thumbnailUrl?: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  clickUrl?: string;
  autoCloseSeconds?: number;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  societyId: string;
  category: Category;
  venue: string;
  isOnline: boolean;
  link?: string;
  onlineLink?: string; // Add missing onlineLink property
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
  createdBy?: string; // User UID
  createdAt?: string;
  updatedAt?: string;
  // Integration properties
  googleCalendarEventId?: string;
  linktreeLinkId?: string;
  sponsorAd?: SponsorAd;
};

export type RsvpStatus = 'rsvped' | 'waitlisted' | 'cancelled';

export type Rsvp = {
  id: string; // Same as user UID
  userId: string;
  eventId: string;
  status: RsvpStatus;
  qrCodeUrl?: string;
  qrCodeData?: string;
  checkInAt?: string; // ISO 8601 format
  createdAt?: string;
  updatedAt?: string;
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

export type Announcement = {
  id: string;
  societyId: string;
  title: string;
  body: string;
  targets: string[];
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy?: string;
};

export type TicketTier = {
  id: string;
  eventId: string;
  name: string;
  price: number;
  capacity: number;
  sold: number;
  description: string;
};

export type PromoCode = {
  id: string;
  eventId?: string;
  societyId: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  uses: number;
  maxUses: number;
  expiresAt?: string;
  createdAt: string;
};

export type TeamMember = {
  id: string;
  societyId: string;
  email: string;
  role: TeamRole;
  displayName?: string;
  avatarUrl?: string;
  invitedAt?: string;
  joinedAt?: string;
  status: 'pending' | 'active';
  invitedBy?: string;
};

export type AutomationTrigger = 'rsvp_created' | 'check_in' | 'capacity_reached' | 'before_event' | 'after_event';
export type AutomationAction = 'send_email' | 'send_notification' | 'close_registration' | 'open_waitlist' | 'send_thank_you';

export type AutomationRule = {
  id: string;
  societyId: string;
  name: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  enabled: boolean;
  config?: {
    timeOffset?: number; // for before_event/after_event triggers (in minutes)
    emailTemplate?: string; // for send_email action
    subject?: string; // for send_email action
    body?: string; // for send_email action
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

export type AuditLogEntry = {
  id: string;
  societyId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
};

export type UserNotificationType =
  | 'event_published'
  | 'event_updated'
  | 'event_reminder'
  | 'sponsor_highlight'
  | 'automation';

export type UserNotification = {
  id: string;
  type: UserNotificationType;
  title: string;
  body: string;
  eventId?: string;
  url?: string;
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
};
