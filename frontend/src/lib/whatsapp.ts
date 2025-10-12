/**
 * WhatsApp Integration
 * Handles WhatsApp Web API for sharing events
 */

export interface WhatsAppIntegration {
  phoneNumber?: string;
  businessAccountId?: string;
  accessToken?: string;
  enabled: boolean;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  mediaUrl?: string;
}

class WhatsAppService {
  private readonly WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
  private readonly VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  private readonly ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  /**
   * Send text message via WhatsApp Business API
   */
  async sendTextMessage(
    phoneNumber: string,
    message: string,
    businessAccountId?: string
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      // For demo purposes, we'll simulate the API call
      // In production, you'd use the actual WhatsApp Business API
      
      if (!this.ACCESS_TOKEN || !businessAccountId) {
        throw new Error('WhatsApp not properly configured');
      }

      const response = await fetch(
        `${this.WHATSAPP_API_URL}/${businessAccountId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: {
              body: message
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }

      const data = await response.json();
      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      console.error('WhatsApp API Error:', error);
      return { success: false };
    }
  }

  /**
   * Send media message via WhatsApp Business API
   */
  async sendMediaMessage(
    phoneNumber: string,
    mediaUrl: string,
    caption: string,
    businessAccountId?: string
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (!this.ACCESS_TOKEN || !businessAccountId) {
        throw new Error('WhatsApp not properly configured');
      }

      const response = await fetch(
        `${this.WHATSAPP_API_URL}/${businessAccountId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'image',
            image: {
              link: mediaUrl,
              caption: caption
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp media message');
      }

      const data = await response.json();
      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      console.error('WhatsApp Media API Error:', error);
      return { success: false };
    }
  }

  /**
   * Generate WhatsApp share URL for web
   */
  generateWebShareUrl(phoneNumber: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }

  /**
   * Generate WhatsApp share URL for mobile
   */
  generateMobileShareUrl(phoneNumber: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
  }

  /**
   * Create event share message
   */
  createEventShareMessage(event: any): string {
    const location = event.isOnline ? `Online: ${event.link}` : `Venue: ${event.venue}`;
    const date = new Date(event.startAt).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `🎉 *${event.title}*

📅 ${date}
📍 ${location}

${event.description}

RSVP now: ${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}

#UniConnect #${event.category}`;
  }

  /**
   * Create bulk message for event announcement
   */
  createBulkAnnouncementMessage(event: any, recipients: string[]): { message: string; recipients: string[]; type: string } {
    const message = this.createEventShareMessage(event);
    
    return {
      message,
      recipients: recipients.map(phone => phone.replace(/\D/g, '')), // Remove non-digits
      type: 'bulk_announcement'
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(mode: string, token: string, challenge: string): boolean {
    return mode === 'subscribe' && token === this.VERIFY_TOKEN;
  }

  /**
   * Process incoming WhatsApp messages
   */
  processIncomingMessage(body: any): {
    phoneNumber: string;
    message: string;
    messageId: string;
    timestamp: number;
  } | null {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      
      if (!value?.messages) return null;

      const message = value.messages[0];
      const contact = value.contacts?.[0];

      return {
        phoneNumber: message.from,
        message: message.text?.body || '',
        messageId: message.id,
        timestamp: parseInt(message.timestamp)
      };
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      return null;
    }
  }
}

export const whatsappService = new WhatsAppService();
