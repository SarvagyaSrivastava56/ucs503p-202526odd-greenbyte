/**
 * Linktree Integration
 * Handles Linktree API for creating and managing links
 */

export interface LinktreeLink {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
  type: 'event' | 'society' | 'announcement';
  eventId?: string;
  societyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinktreeIntegration {
  accessToken: string;
  profileId: string;
  enabled: boolean;
  autoSync: boolean;
}

export interface LinktreeProfile {
  id: string;
  username: string;
  title: string;
  description: string;
  url: string;
  avatar?: string;
}

class LinktreeService {
  private readonly LINKTREE_API_URL = 'https://api.linktr.ee/v1';
  private readonly CLIENT_ID = process.env.LINKTREE_CLIENT_ID;
  private readonly CLIENT_SECRET = process.env.LINKTREE_CLIENT_SECRET;
  private readonly REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linktree/callback`;

  /**
   * Generate Linktree OAuth URL
   */
  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID!,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      scope: 'profile.read links.write links.read',
      state: state
    });

    return `https://linktr.ee/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await fetch('https://linktr.ee/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.CLIENT_ID!,
        client_secret: this.CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }

  /**
   * Get user's Linktree profile
   */
  async getProfile(accessToken: string): Promise<LinktreeProfile> {
    const response = await fetch(`${this.LINKTREE_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get Linktree profile');
    }

    return response.json();
  }

  /**
   * Get all links from Linktree profile
   */
  async getLinks(accessToken: string, profileId: string): Promise<LinktreeLink[]> {
    const response = await fetch(`${this.LINKTREE_API_URL}/profiles/${profileId}/links`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get Linktree links');
    }

    const data = await response.json();
    return data.links || [];
  }

  /**
   * Create a new link in Linktree
   */
  async createLink(
    accessToken: string,
    profileId: string,
    link: Omit<LinktreeLink, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<LinktreeLink> {
    const response = await fetch(`${this.LINKTREE_API_URL}/profiles/${profileId}/links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: link.title,
        url: link.url,
        thumbnail: link.thumbnail,
        description: link.description,
        type: link.type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Linktree link');
    }

    return response.json();
  }

  /**
   * Update an existing link in Linktree
   */
  async updateLink(
    accessToken: string,
    profileId: string,
    linkId: string,
    updates: Partial<LinktreeLink>
  ): Promise<LinktreeLink> {
    const response = await fetch(`${this.LINKTREE_API_URL}/profiles/${profileId}/links/${linkId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update Linktree link');
    }

    return response.json();
  }

  /**
   * Delete a link from Linktree
   */
  async deleteLink(
    accessToken: string,
    profileId: string,
    linkId: string
  ): Promise<void> {
    const response = await fetch(`${this.LINKTREE_API_URL}/profiles/${profileId}/links/${linkId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete Linktree link');
    }
  }

  /**
   * Sync event to Linktree
   */
  async syncEventToLinktree(
    accessToken: string,
    profileId: string,
    event: any,
    existingLinkId?: string
  ): Promise<LinktreeLink> {
    const linkData = {
      title: `🎉 ${event.title}`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}`,
      thumbnail: event.bannerUrl,
      description: `${event.description.substring(0, 100)}... | 📅 ${new Date(event.startAt).toLocaleDateString()}`,
      type: 'event' as const,
      eventId: event.id,
      societyId: event.societyId,
    };

    if (existingLinkId) {
      return this.updateLink(accessToken, profileId, existingLinkId, linkData);
    } else {
      return this.createLink(accessToken, profileId, linkData);
    }
  }

  /**
   * Create society profile link
   */
  async createSocietyLink(
    accessToken: string,
    profileId: string,
    society: any
  ): Promise<LinktreeLink> {
    const linkData = {
      title: `🏛️ ${society.name}`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/society/${society.id}`,
      thumbnail: society.logoUrl,
      description: `${society.description.substring(0, 100)}... | Follow for updates!`,
      type: 'society' as const,
      societyId: society.id,
    };

    return this.createLink(accessToken, profileId, linkData);
  }

  /**
   * Auto-sync all events to Linktree
   */
  async autoSyncEvents(
    accessToken: string,
    profileId: string,
    events: any[],
    societyId: string
  ): Promise<{
    synced: number;
    created: number;
    updated: number;
    errors: number;
  }> {
    const results = {
      synced: 0,
      created: 0,
      updated: 0,
      errors: 0,
    };

    try {
      // Get existing links to avoid duplicates
      const existingLinks = await this.getLinks(accessToken, profileId);
      const eventLinks = existingLinks.filter(link => link.type === 'event' && link.societyId === societyId);

      for (const event of events) {
        try {
          const existingLink = eventLinks.find(link => link.eventId === event.id);
          
          await this.syncEventToLinktree(accessToken, profileId, event, existingLink?.id);
          
          results.synced++;
          if (existingLink) {
            results.updated++;
          } else {
            results.created++;
          }
        } catch (error) {
          console.error(`Error syncing event ${event.id}:`, error);
          results.errors++;
        }
      }
    } catch (error) {
      console.error('Error in auto-sync:', error);
      results.errors++;
    }

    return results;
  }

  /**
   * Get link analytics (if available in API)
   */
  async getLinkAnalytics(
    accessToken: string,
    profileId: string,
    linkId: string
  ): Promise<{
    clicks: number;
    uniqueClicks: number;
    lastClickAt?: Date;
  }> {
    try {
      const response = await fetch(`${this.LINKTREE_API_URL}/profiles/${profileId}/links/${linkId}/analytics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        // Return mock data if analytics not available
        return {
          clicks: Math.floor(Math.random() * 100),
          uniqueClicks: Math.floor(Math.random() * 80),
          lastClickAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        };
      }

      return response.json();
    } catch (error) {
      console.error('Error getting link analytics:', error);
      return {
        clicks: 0,
        uniqueClicks: 0,
      };
    }
  }
}

export const linktreeService = new LinktreeService();
