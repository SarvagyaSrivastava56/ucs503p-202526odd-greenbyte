/**
 * Demo Integration Services
 * Works without real API keys for presentation purposes
 */

export interface DemoIntegration {
  connected: boolean;
  demo: boolean;
  message: string;
}

export class DemoIntegrationService {
  /**
   * Simulate Google Calendar connection
   */
  async connectGoogleCalendar(userId: string): Promise<DemoIntegration> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      connected: true,
      demo: true,
      message: 'Google Calendar connected in demo mode! Events will be synced when you add real API keys.'
    };
  }

  /**
   * Simulate WhatsApp connection
   */
  async connectWhatsApp(userId: string, phoneNumber: string): Promise<DemoIntegration> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      connected: true,
      demo: true,
      message: `WhatsApp connected for ${phoneNumber} in demo mode! Share URLs will be generated.`
    };
  }

  /**
   * Simulate Linktree connection
   */
  async connectLinktree(userId: string): Promise<DemoIntegration> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      connected: true,
      demo: true,
      message: 'Linktree connected in demo mode! Links will be created when you add real API keys.'
    };
  }

  /**
   * Generate demo WhatsApp share URL
   */
  generateWhatsAppShareUrl(event: any): string {
    const message = `🎉 ${event.title}

📅 ${new Date(event.startAt).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

📍 ${event.isOnline ? `Online: ${event.link}` : `Venue: ${event.venue}`}

${event.description}

RSVP now: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/events/${event.id}

#UniConnect #${event.category}`;

    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  /**
   * Generate demo Google Calendar event
   */
  generateGoogleCalendarEvent(event: any): any {
    return {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startAt,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: event.endAt,
        timeZone: 'Asia/Kolkata',
      },
      location: event.isOnline ? event.link : event.venue,
      htmlLink: `https://calendar.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(event.title)}`
    };
  }

  /**
   * Generate demo Linktree link
   */
  generateLinktreeLink(event: any): any {
    return {
      id: `demo-${event.id}`,
      title: `🎉 ${event.title}`,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/events/${event.id}`,
      thumbnail: event.bannerUrl,
      description: `${event.description.substring(0, 100)}... | 📅 ${new Date(event.startAt).toLocaleDateString()}`,
      type: 'event',
      linkUrl: `https://linktr.ee/demo/event-${event.id}`
    };
  }

  /**
   * Get integration status
   */
  async getIntegrationStatus(userId: string, integration: string): Promise<DemoIntegration> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // For demo, always return as not connected initially
    return {
      connected: false,
      demo: true,
      message: 'Integration not connected'
    };
  }

  /**
   * Sync event to all connected integrations
   */
  async syncEventToAllIntegrations(userId: string, event: any): Promise<{
    googleCalendar?: any;
    whatsapp?: string;
    linktree?: any;
  }> {
    const results: any = {};

    // Simulate Google Calendar sync
    results.googleCalendar = this.generateGoogleCalendarEvent(event);
    
    // Simulate WhatsApp share URL
    results.whatsapp = this.generateWhatsAppShareUrl(event);
    
    // Simulate Linktree link
    results.linktree = this.generateLinktreeLink(event);

    return results;
  }
}

export const demoIntegrationService = new DemoIntegrationService();
