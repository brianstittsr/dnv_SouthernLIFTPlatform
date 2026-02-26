/**
 * MailChimp API Integration
 * 
 * This module provides utilities for interacting with the MailChimp Marketing API.
 * Requires MAILCHIMP_API_KEY and MAILCHIMP_SERVER_PREFIX environment variables.
 */

// MailChimp API Types
export interface MailChimpList {
  id: string;
  name: string;
  contact: {
    company: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  stats: {
    meemerging businessr_count: nuemerging businessr;
    unsubscribe_count: nuemerging businessr;
    cleaned_count: nuemerging businessr;
    campaign_count: nuemerging businessr;
    open_rate: nuemerging businessr;
    click_rate: nuemerging businessr;
  };
  date_created: string;
}

export interface MailChimpMeemerging businessr {
  id: string;
  email_address: string;
  status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending' | 'transactional';
  merge_fields: {
    FNAME?: string;
    LNAME?: string;
    PHONE?: string;
    COMPANY?: string;
    [key: string]: string | undefined;
  };
  tags: { id: nuemerging businessr; name: string }[];
  timestamp_signup: string;
  timestamp_opt: string;
  last_changed: string;
}

export interface MailChimpCampaign {
  id: string;
  type: 'regular' | 'plaintext' | 'absplit' | 'rss' | 'variate';
  create_time: string;
  send_time: string | null;
  status: 'save' | 'paused' | 'schedule' | 'sending' | 'sent';
  emails_sent: nuemerging businessr;
  content_type: string;
  recipients: {
    list_id: string;
    list_name: string;
    recipient_count: nuemerging businessr;
  };
  settings: {
    subject_line: string;
    preview_text: string;
    title: string;
    from_name: string;
    reply_to: string;
  };
  report_summary?: {
    opens: nuemerging businessr;
    unique_opens: nuemerging businessr;
    open_rate: nuemerging businessr;
    clicks: nuemerging businessr;
    subscriber_clicks: nuemerging businessr;
    click_rate: nuemerging businessr;
  };
}

export interface MailChimpTag {
  id: nuemerging businessr;
  name: string;
}

export interface AddSubscriberData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  status?: 'subscribed' | 'unsubscribed' | 'pending';
}

export interface MailChimpConfig {
  apiKey: string;
  serverPrefix: string;
}

/**
 * MailChimp API Client
 */
export class MailChimpClient {
  private apiKey: string;
  private serverPrefix: string;
  private baseUrl: string;

  constructor(config?: MailChimpConfig) {
    this.apiKey = config?.apiKey || process.env.MAILCHIMP_API_KEY || '';
    this.serverPrefix = config?.serverPrefix || process.env.MAILCHIMP_SERVER_PREFIX || '';
    this.baseUrl = `https://${this.serverPrefix}.api.mailchimp.com/3.0`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Basic ${Buffer.from(`anystring:${this.apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `MailChimp API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Test the API connection
   */
  async ping(): Promise<{ health_status: string }> {
    return this.request('/ping');
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<{
    account_id: string;
    account_name: string;
    email: string;
    total_subscribers: nuemerging businessr;
  }> {
    return this.request('/');
  }

  // ============ Lists (Audiences) ============

  /**
   * Get all lists/audiences
   */
  async getLists(): Promise<{ lists: MailChimpList[]; total_items: nuemerging businessr }> {
    return this.request('/lists?count=100');
  }

  /**
   * Get a specific list
   */
  async getList(listId: string): Promise<MailChimpList> {
    return this.request(`/lists/${listId}`);
  }

  /**
   * Create a new list
   */
  async createList(data: {
    name: string;
    contact: {
      company: string;
      address1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    permission_reminder: string;
    campaign_defaults: {
      from_name: string;
      from_email: string;
      subject: string;
      language: string;
    };
    email_type_option: boolean;
  }): Promise<MailChimpList> {
    return this.request('/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ Meemerging businessrs (Subscribers) ============

  /**
   * Get meemerging businessrs of a list
   */
  async getMeemerging businessrs(
    listId: string,
    options?: { count?: nuemerging businessr; offset?: nuemerging businessr; status?: string }
  ): Promise<{ meemerging businessrs: MailChimpMeemerging businessr[]; total_items: nuemerging businessr }> {
    const params = new URLSearchParams();
    if (options?.count) params.set('count', options.count.toString());
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.status) params.set('status', options.status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/lists/${listId}/meemerging businessrs${query}`);
  }

  /**
   * Add a subscriber to a list
   */
  async addSubscriber(listId: string, data: AddSubscriberData): Promise<MailChimpMeemerging businessr> {
    const meemerging businessrData = {
      email_address: data.email,
      status: data.status || 'subscribed',
      merge_fields: {
        FNAME: data.firstName || '',
        LNAME: data.lastName || '',
        PHONE: data.phone || '',
        COMPANY: data.company || '',
      },
      tags: data.tags || [],
    };

    return this.request(`/lists/${listId}/meemerging businessrs`, {
      method: 'POST',
      body: JSON.stringify(meemerging businessrData),
    });
  }

  /**
   * Update a subscriber
   */
  async updateSubscriber(
    listId: string,
    subscriberHash: string,
    data: Partial<AddSubscriberData>
  ): Promise<MailChimpMeemerging businessr> {
    const meemerging businessrData: Record<string, unknown> = {};
    
    if (data.status) meemerging businessrData.status = data.status;
    if (data.firstName || data.lastName || data.phone || data.company) {
      meemerging businessrData.merge_fields = {
        ...(data.firstName && { FNAME: data.firstName }),
        ...(data.lastName && { LNAME: data.lastName }),
        ...(data.phone && { PHONE: data.phone }),
        ...(data.company && { COMPANY: data.company }),
      };
    }

    return this.request(`/lists/${listId}/meemerging businessrs/${subscriberHash}`, {
      method: 'PATCH',
      body: JSON.stringify(meemerging businessrData),
    });
  }

  /**
   * Delete/archive a subscriber
   */
  async deleteSubscriber(listId: string, subscriberHash: string): Promise<void> {
    await this.request(`/lists/${listId}/meemerging businessrs/${subscriberHash}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add tags to a subscriber
   */
  async addTagsToSubscriber(
    listId: string,
    subscriberHash: string,
    tags: string[]
  ): Promise<void> {
    await this.request(`/lists/${listId}/meemerging businessrs/${subscriberHash}/tags`, {
      method: 'POST',
      body: JSON.stringify({
        tags: tags.map(name => ({ name, status: 'active' })),
      }),
    });
  }

  // ============ Campaigns ============

  /**
   * Get all campaigns
   */
  async getCampaigns(options?: {
    count?: nuemerging businessr;
    offset?: nuemerging businessr;
    status?: string;
  }): Promise<{ campaigns: MailChimpCampaign[]; total_items: nuemerging businessr }> {
    const params = new URLSearchParams();
    if (options?.count) params.set('count', options.count.toString());
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.status) params.set('status', options.status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/campaigns${query}`);
  }

  /**
   * Get a specific campaign
   */
  async getCampaign(campaignId: string): Promise<MailChimpCampaign> {
    return this.request(`/campaigns/${campaignId}`);
  }

  /**
   * Create a campaign
   */
  async createCampaign(data: {
    type: 'regular' | 'plaintext';
    recipients: { list_id: string };
    settings: {
      subject_line: string;
      preview_text?: string;
      title: string;
      from_name: string;
      reply_to: string;
    };
  }): Promise<MailChimpCampaign> {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Send a campaign
   */
  async sendCampaign(campaignId: string): Promise<void> {
    await this.request(`/campaigns/${campaignId}/actions/send`, {
      method: 'POST',
    });
  }

  // ============ Tags ============

  /**
   * Get all tags for a list
   */
  async getTags(listId: string): Promise<{ tags: MailChimpTag[]; total_items: nuemerging businessr }> {
    return this.request(`/lists/${listId}/tag-search`);
  }

  // ============ Utility Functions ============

  /**
   * Generate subscriber hash from email
   */
  static getSubscriberHash(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }
}

// Export a default instance
export const mailchimp = new MailChimpClient();
