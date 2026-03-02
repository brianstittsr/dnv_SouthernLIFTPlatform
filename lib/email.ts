/**
 * Email Service for KDM Consortium Platform
 * 
 * Supports SendGrid, Resend, and Azure SMTP email providers
 * Handles transactional emails, notifications, and marketing campaigns
 */

import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

type EmailProvider = 'sendgrid' | 'resend' | 'azure_smtp' | 'ms_graph';

interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: {
    email: string;
    name: string;
  };
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }[];
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Determine which email provider to use based on environment variables
 * Priority: Microsoft Graph API > SendGrid > Resend
 */
function getEmailProvider(): EmailProvider {
  // Microsoft Graph API (preferred for Office 365)
  if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
    return 'ms_graph';
  } else if (process.env.SENDGRID_API_KEY) {
    return 'sendgrid';
  } else if (process.env.RESEND_API_KEY) {
    return 'resend';
  }
  throw new Error('No email service configured. Set AZURE_CLIENT_ID/AZURE_CLIENT_SECRET/AZURE_TENANT_ID for Azure AD, SENDGRID_API_KEY, or RESEND_API_KEY');
}

/**
 * Get default from address based on provider
 */
function getDefaultFrom(): { email: string; name: string } {
  const provider = getEmailProvider();
  
  if (provider === 'ms_graph') {
    return {
      email: process.env.SMTP_FROM_EMAIL || 'admin@kdm-assoc.com',
      name: process.env.SMTP_FROM_NAME || 'KDM & Associates',
    };
  } else if (provider === 'sendgrid') {
    return {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@kdmassociates.com',
      name: process.env.SENDGRID_FROM_NAME || 'KDM Consortium',
    };
  } else {
    return {
      email: process.env.RESEND_FROM_EMAIL || 'noreply@kdmassociates.com',
      name: process.env.RESEND_FROM_NAME || 'KDM Consortium',
    };
  }
}

/**
 * Get Microsoft Graph API access token
 */
async function getGraphAccessToken(): Promise<string | null> {
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const tenantId = process.env.AZURE_TENANT_ID;
  
  if (!clientId || !clientSecret || !tenantId) {
    return null;
  }
  
  try {
    const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to get Microsoft Graph access token:', error);
    return null;
  }
}

/**
 * Send email using Microsoft Graph API
 */
async function sendWithMicrosoftGraph(params: EmailParams): Promise<EmailResponse> {
  try {
    const accessToken = await getGraphAccessToken();
    
    if (!accessToken) {
      return {
        success: false,
        error: 'Microsoft Graph credentials not configured. Set AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID.',
      };
    }

    const from = params.from || getDefaultFrom();
    const senderEmail = process.env.SMTP_FROM_EMAIL || from.email;
    
    // Build recipients
    const toRecipients = Array.isArray(params.to) 
      ? params.to.map(email => ({ emailAddress: { address: email } }))
      : [{ emailAddress: { address: params.to } }];
    
    const ccRecipients = params.cc?.map(email => ({ emailAddress: { address: email } }));
    const bccRecipients = params.bcc?.map(email => ({ emailAddress: { address: email } }));

    // Build email payload
    const emailPayload: any = {
      message: {
        subject: params.subject,
        body: {
          contentType: 'HTML',
          content: params.html,
        },
        from: {
          emailAddress: {
            address: senderEmail,
            name: from.name,
          },
        },
        toRecipients,
      },
      saveToSentItems: true,
    };

    if (ccRecipients?.length) {
      emailPayload.message.ccRecipients = ccRecipients;
    }
    if (bccRecipients?.length) {
      emailPayload.message.bccRecipients = bccRecipients;
    }
    if (params.replyTo) {
      emailPayload.message.replyTo = [{ emailAddress: { address: params.replyTo } }];
    }

    // Send via Microsoft Graph API
    const endpoint = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/sendMail`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Graph API error: ${response.status} - ${errorData}`);
    }

    return {
      success: true,
      messageId: `graph-${Date.now()}`,
    };
  } catch (error: any) {
    console.error('Microsoft Graph API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email via Microsoft Graph API',
    };
  }
}
async function getMicrosoftAccessToken(): Promise<string | null> {
  const clientId = process.env.SMTP_CLIENT_ID;
  const clientSecret = process.env.SMTP_CLIENT_SECRET;
  const tenantId = process.env.SMTP_TENANT_ID;
  
  if (!clientId || !clientSecret || !tenantId) {
    return null;
  }
  
  try {
    const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://outlook.office365.com/.default',
        grant_type: 'client_credentials',
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to get Microsoft access token:', error);
    return null;
  }
}

/**
 * Send email using Azure SMTP (Azure Communication Services or Microsoft 365 OAuth)
 */
async function sendWithAzureSMTP(params: EmailParams): Promise<EmailResponse> {
  try {
    const smtpHost = process.env.AZURE_SMTP_HOST || 'smtp.office365.com';
    const smtpPort = parseInt(process.env.AZURE_SMTP_PORT || '587', 10);
    const smtpUsername = process.env.AZURE_SMTP_USERNAME;
    const smtpPassword = process.env.AZURE_SMTP_PASSWORD;
    const smtpSecure = process.env.AZURE_SMTP_SECURE === 'true';

    // Try OAuth2 first
    const accessToken = await getMicrosoftAccessToken();
    
    let transporter: Transporter;
    
    if (accessToken && smtpUsername) {
      // Use OAuth2 authentication
      console.log('Using OAuth2 authentication for SMTP');
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          type: 'OAuth2',
          user: smtpUsername,
          accessToken: accessToken,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
      });
    } else if (smtpUsername && smtpPassword) {
      // Fall back to basic auth
      console.log('Using basic authentication for SMTP');
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUsername,
          pass: smtpPassword,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
      });
    } else {
      return {
        success: false,
        error: 'SMTP credentials not configured. Set SMTP_CLIENT_ID/SMTP_CLIENT_SECRET/SMTP_TENANT_ID for OAuth, or AZURE_SMTP_USERNAME/AZURE_SMTP_PASSWORD for basic auth.',
      };
    }

    // Verify connection
    await transporter.verify();

    const from = params.from || getDefaultFrom();
    
    // Prepare recipients
    const toRecipients = Array.isArray(params.to) ? params.to.join(', ') : params.to;
    const ccRecipients = params.cc ? params.cc.join(', ') : undefined;
    const bccRecipients = params.bcc ? params.bcc.join(', ') : undefined;

    // Send mail
    const info = await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to: toRecipients,
      cc: ccRecipients,
      bcc: bccRecipients,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
      attachments: params.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
    });

    // Close the connection
    await transporter.close();

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Azure SMTP error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email via Azure SMTP',
    };
  }
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(params: EmailParams): Promise<EmailResponse> {
  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const from = params.from || getDefaultFrom();
    const msg = {
      to: params.to,
      from: `${from.name} <${from.email}>`,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
      cc: params.cc,
      bcc: params.bcc,
      attachments: params.attachments,
    };

    const response = await sgMail.send(msg);
    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
    };
  } catch (error: any) {
    console.error('SendGrid error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send email using Resend
 */
async function sendWithResend(params: EmailParams): Promise<EmailResponse> {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const from = params.from || getDefaultFrom();
    const response = await resend.emails.send({
      from: `${from.name} <${from.email}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo,
      cc: params.cc,
      bcc: params.bcc,
      attachments: params.attachments,
    });

    return {
      success: true,
      messageId: response.id,
    };
  } catch (error: any) {
    console.error('Resend error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main email sending function
 */
export async function sendEmail(params: EmailParams): Promise<EmailResponse> {
  const provider = getEmailProvider();
  
  if (provider === 'ms_graph') {
    return sendWithMicrosoftGraph(params);
  } else if (provider === 'azure_smtp') {
    return sendWithAzureSMTP(params);
  } else if (provider === 'sendgrid') {
    return sendWithSendGrid(params);
  } else {
    return sendWithResend(params);
  }
}

/**
 * Email Templates
 */

export const emailTemplates = {
  /**
   * Welcome email for new members
   */
  welcome: (params: { name: string; loginUrl: string }) => ({
    subject: 'Welcome to KDM Consortium!',
    html: `
      <h1>Welcome to KDM Consortium, ${params.name}!</h1>
      <p>We're excited to have you as a member of our government contracting consortium.</p>
      <p>Your membership gives you access to:</p>
      <ul>
        <li>Curated opportunity intelligence</li>
        <li>Best-fit team assembly</li>
        <li>Proposal orchestration support</li>
        <li>Monthly buyer briefings</li>
        <li>Resource library</li>
      </ul>
      <p><a href="${params.loginUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Access Your Portal</a></p>
      <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Welcome to KDM Consortium, ${params.name}! We're excited to have you as a member. Access your portal at: ${params.loginUrl}`,
  }),

  /**
   * Payment confirmation
   */
  paymentConfirmation: (params: { name: string; amount: number; description: string; receiptUrl?: string }) => ({
    subject: 'Payment Confirmation - KDM Consortium',
    html: `
      <h1>Payment Received</h1>
      <p>Hi ${params.name},</p>
      <p>Thank you for your payment. Here are the details:</p>
      <ul>
        <li><strong>Amount:</strong> $${(params.amount / 100).toFixed(2)}</li>
        <li><strong>Description:</strong> ${params.description}</li>
      </ul>
      ${params.receiptUrl ? `<p><a href="${params.receiptUrl}">View Receipt</a></p>` : ''}
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Payment Received: $${(params.amount / 100).toFixed(2)} for ${params.description}`,
  }),

  /**
   * Event registration confirmation
   */
  eventRegistration: (params: { 
    name: string; 
    eventTitle: string; 
    eventDate: string; 
    eventLocation: string;
    ticketType: string;
    qrCodeUrl?: string;
  }) => ({
    subject: `Registration Confirmed: ${params.eventTitle}`,
    html: `
      <h1>Event Registration Confirmed</h1>
      <p>Hi ${params.name},</p>
      <p>You're registered for <strong>${params.eventTitle}</strong>!</p>
      <p><strong>Event Details:</strong></p>
      <ul>
        <li><strong>Date:</strong> ${params.eventDate}</li>
        <li><strong>Location:</strong> ${params.eventLocation}</li>
        <li><strong>Ticket Type:</strong> ${params.ticketType}</li>
      </ul>
      ${params.qrCodeUrl ? `<p><img src="${params.qrCodeUrl}" alt="QR Code" style="max-width: 200px;" /></p>` : ''}
      <p>We look forward to seeing you at the event!</p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `You're registered for ${params.eventTitle} on ${params.eventDate} at ${params.eventLocation}`,
  }),

  /**
   * Event reminder (24 hours before)
   */
  eventReminder: (params: { 
    name: string; 
    eventTitle: string; 
    eventDate: string; 
    eventLocation: string;
    joinUrl?: string;
  }) => ({
    subject: `Reminder: ${params.eventTitle} Tomorrow`,
    html: `
      <h1>Event Reminder</h1>
      <p>Hi ${params.name},</p>
      <p>This is a reminder that <strong>${params.eventTitle}</strong> is tomorrow!</p>
      <p><strong>Event Details:</strong></p>
      <ul>
        <li><strong>Date:</strong> ${params.eventDate}</li>
        <li><strong>Location:</strong> ${params.eventLocation}</li>
      </ul>
      ${params.joinUrl ? `<p><a href="${params.joinUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Join Event</a></p>` : ''}
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Reminder: ${params.eventTitle} is tomorrow at ${params.eventDate}. Location: ${params.eventLocation}`,
  }),

  /**
   * New pursuit brief notification
   */
  newPursuitBrief: (params: { 
    name: string; 
    pursuitTitle: string; 
    agency: string;
    dueDate: string;
    estimatedValue: number;
    pursuitUrl: string;
  }) => ({
    subject: `New Opportunity: ${params.pursuitTitle}`,
    html: `
      <h1>New Pursuit Brief Available</h1>
      <p>Hi ${params.name},</p>
      <p>A new opportunity has been published that matches your capabilities:</p>
      <p><strong>${params.pursuitTitle}</strong></p>
      <ul>
        <li><strong>Agency:</strong> ${params.agency}</li>
        <li><strong>Estimated Value:</strong> $${params.estimatedValue.toLocaleString()}</li>
        <li><strong>Due Date:</strong> ${params.dueDate}</li>
      </ul>
      <p><a href="${params.pursuitUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Opportunity</a></p>
      <p>Express your interest early to be considered for the team!</p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `New Opportunity: ${params.pursuitTitle} from ${params.agency}. Due: ${params.dueDate}. View at: ${params.pursuitUrl}`,
  }),

  /**
   * Proposal deadline reminder
   */
  proposalDeadline: (params: { 
    name: string; 
    pursuitTitle: string; 
    dueDate: string;
    daysRemaining: number;
    proposalUrl: string;
  }) => ({
    subject: `Reminder: ${params.pursuitTitle} Due in ${params.daysRemaining} Days`,
    html: `
      <h1>Proposal Deadline Approaching</h1>
      <p>Hi ${params.name},</p>
      <p>This is a reminder that the proposal for <strong>${params.pursuitTitle}</strong> is due in <strong>${params.daysRemaining} days</strong>.</p>
      <p><strong>Due Date:</strong> ${params.dueDate}</p>
      <p><a href="${params.proposalUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Access Proposal Workspace</a></p>
      <p>Please ensure all sections are complete and reviewed before the deadline.</p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Reminder: ${params.pursuitTitle} proposal due in ${params.daysRemaining} days on ${params.dueDate}. Access at: ${params.proposalUrl}`,
  }),

  /**
   * Buyer briefing invitation
   */
  buyerBriefing: (params: { 
    name: string; 
    briefingTitle: string; 
    date: string;
    time: string;
    buyerOrganization: string;
    registerUrl: string;
  }) => ({
    subject: `Invitation: ${params.briefingTitle}`,
    html: `
      <h1>Buyer Briefing Invitation</h1>
      <p>Hi ${params.name},</p>
      <p>You're invited to an exclusive buyer briefing:</p>
      <p><strong>${params.briefingTitle}</strong></p>
      <ul>
        <li><strong>Organization:</strong> ${params.buyerOrganization}</li>
        <li><strong>Date:</strong> ${params.date}</li>
        <li><strong>Time:</strong> ${params.time}</li>
      </ul>
      <p>This is a great opportunity to connect with decision-makers and learn about upcoming opportunities.</p>
      <p><a href="${params.registerUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Register Now</a></p>
      <p>Spaces are limited, so register early!</p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Buyer Briefing: ${params.briefingTitle} with ${params.buyerOrganization} on ${params.date} at ${params.time}. Register: ${params.registerUrl}`,
  }),

  /**
   * membership renewal reminder
   */
  membershipRenewal: (params: { 
    name: string; 
    renewalDate: string;
    amount: number;
    updatePaymentUrl: string;
  }) => ({
    subject: 'membership Renewal Reminder',
    html: `
      <h1>membership Renewal</h1>
      <p>Hi ${params.name},</p>
      <p>Your KDM Consortium membership will renew on <strong>${params.renewalDate}</strong>.</p>
      <p><strong>Renewal Amount:</strong> $${(params.amount / 100).toFixed(2)}</p>
      <p>Your payment method on file will be charged automatically. If you need to update your payment information, please click below:</p>
      <p><a href="${params.updatePaymentUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Update Payment Method</a></p>
      <p>Thank you for being a valued member of the KDM Consortium!</p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Your membership renews on ${params.renewalDate} for $${(params.amount / 100).toFixed(2)}. Update payment at: ${params.updatePaymentUrl}`,
  }),

  /**
   * Payment reminder for remaining balance
   */
  paymentReminder: (params: { 
    name: string; 
    entityName: string; 
    remainingBalance: number; 
    dueDate: string; 
    paymentUrl: string; 
  }) => ({
    subject: `Action Required: Payment Reminder for ${params.entityName}`,
    html: `
      <h1>Payment Reminder</h1>
      <p>Hi ${params.name},</p>
      <p>This is a reminder regarding your remaining balance for <strong>${params.entityName}</strong>.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Remaining Balance:</strong> $${params.remainingBalance.toFixed(2)}</p>
        <p style="margin: 10px 0 0 0;"><strong>Due Date:</strong> ${params.dueDate}</p>
      </div>
      <p>To ensure everything is ready for the upcoming event, please settle your remaining balance using the link below:</p>
      <p><a href="${params.paymentUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Make a Payment</a></p>
      <p>If you have already made this payment, please disregard this message.</p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Reminder: You have a remaining balance of $${params.remainingBalance.toFixed(2)} for ${params.entityName} due on ${params.dueDate}. Pay now at: ${params.paymentUrl}`,
  }),

  /**
   * Partner commission pending notification
   */
  partnerCommissionPending: (params: {
    partnerName: string;
    clientName: string;
    amount: string;
    contributionType: string;
    percentage: number;
    totalTransactionAmount: string;
    expectedPayoutDate: string;
    transactionId: string;
    dashboardUrl: string;
  }) => ({
    subject: 'Commission Pending - Client Payment Received',
    html: `
      <h1>Commission Pending</h1>
      <p>Hi ${params.partnerName},</p>
      <p>Great news! A payment has been received and you have a commission pending.</p>
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066cc;">
        <p style="margin: 0;"><strong>Client:</strong> ${params.clientName}</p>
        <p style="margin: 10px 0 0 0;"><strong>Your Commission:</strong> ${params.amount}</p>
        <p style="margin: 10px 0 0 0;"><strong>Contribution Type:</strong> ${params.contributionType} (${params.percentage}%)</p>
        <p style="margin: 10px 0 0 0;"><strong>Transaction Total:</strong> ${params.totalTransactionAmount}</p>
        <p style="margin: 10px 0 0 0;"><strong>Expected Payout:</strong> ${params.expectedPayoutDate}</p>
      </div>
      <p><a href="${params.dashboardUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Dashboard</a></p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Commission Pending: ${params.amount} from ${params.clientName}. Expected payout: ${params.expectedPayoutDate}. View at: ${params.dashboardUrl}`,
  }),

  /**
   * Partner commission approved notification
   */
  partnerCommissionApproved: (params: {
    partnerName: string;
    amount: string;
    contributionType: string;
    transactionId: string;
    paymentMethod: string;
    dashboardUrl: string;
  }) => ({
    subject: 'Commission Approved - Payment Processing',
    html: `
      <h1>Commission Approved</h1>
      <p>Hi ${params.partnerName},</p>
      <p>Your commission has been approved and is being processed.</p>
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
        <p style="margin: 0;"><strong>Amount:</strong> ${params.amount}</p>
        <p style="margin: 10px 0 0 0;"><strong>Contribution Type:</strong> ${params.contributionType}</p>
        <p style="margin: 10px 0 0 0;"><strong>Payment Method:</strong> ${params.paymentMethod}</p>
      </div>
      <p><a href="${params.dashboardUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Dashboard</a></p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Commission Approved: ${params.amount} via ${params.paymentMethod}. View at: ${params.dashboardUrl}`,
  }),

  /**
   * Partner commission paid notification
   */
  partnerCommissionPaid: (params: {
    partnerName: string;
    amount: string;
    contributionType: string;
    transactionId: string;
    paymentMethod: string;
    payoutId: string;
    dashboardUrl: string;
  }) => ({
    subject: 'Commission Paid - Payment Complete',
    html: `
      <h1>Commission Paid</h1>
      <p>Hi ${params.partnerName},</p>
      <p>Your commission has been paid successfully!</p>
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
        <p style="margin: 0;"><strong>Amount:</strong> ${params.amount}</p>
        <p style="margin: 10px 0 0 0;"><strong>Payment Method:</strong> ${params.paymentMethod}</p>
        <p style="margin: 10px 0 0 0;"><strong>Payout ID:</strong> ${params.payoutId}</p>
      </div>
      <p><a href="${params.dashboardUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Payment History</a></p>
      <p>Thank you for being a valued partner!</p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Commission Paid: ${params.amount} via ${params.paymentMethod}. Payout ID: ${params.payoutId}. View at: ${params.dashboardUrl}`,
  }),

  /**
   * Partner commission failed notification
   */
  partnerCommissionFailed: (params: {
    partnerName: string;
    amount: string;
    transactionId: string;
    supportEmail: string;
    dashboardUrl: string;
  }) => ({
    subject: 'Commission Payout Failed - Action Required',
    html: `
      <h1>Payout Failed</h1>
      <p>Hi ${params.partnerName},</p>
      <p>Unfortunately, we were unable to process your commission payout.</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <p style="margin: 0;"><strong>Amount:</strong> ${params.amount}</p>
        <p style="margin: 10px 0 0 0;"><strong>Transaction ID:</strong> ${params.transactionId}</p>
      </div>
      <p>Please verify your payment information in your dashboard and contact us if you need assistance.</p>
      <p><a href="${params.dashboardUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Update Payment Info</a></p>
      <p>For support, contact: <a href="mailto:${params.supportEmail}">${params.supportEmail}</a></p>
      <p>Best regards,<br>The KDM Consortium Team</p>
    `,
    text: `Payout Failed: ${params.amount}. Please update your payment info at: ${params.dashboardUrl}. Support: ${params.supportEmail}`,
  }),

  /**
   * Admin payout alert notification
   */
  adminPayoutAlert: (params: {
    partnerId: string;
    partnerName: string;
    amount: string;
    errorMessage: string;
    timestamp: string;
    dashboardUrl: string;
  }) => ({
    subject: `[ALERT] Payout Failed for ${params.partnerName}`,
    html: `
      <h1>Payout Alert</h1>
      <p>A partner payout has failed and requires attention.</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <p style="margin: 0;"><strong>Partner:</strong> ${params.partnerName} (${params.partnerId})</p>
        <p style="margin: 10px 0 0 0;"><strong>Amount:</strong> ${params.amount}</p>
        <p style="margin: 10px 0 0 0;"><strong>Error:</strong> ${params.errorMessage}</p>
        <p style="margin: 10px 0 0 0;"><strong>Time:</strong> ${params.timestamp}</p>
      </div>
      <p><a href="${params.dashboardUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Review in Dashboard</a></p>
    `,
    text: `Payout Failed: ${params.partnerName} - ${params.amount}. Error: ${params.errorMessage}. Review at: ${params.dashboardUrl}`,
  }),
};

/**
 * Send a templated email
 */
export async function sendTemplatedEmail<T extends keyof typeof emailTemplates>(
  template: T,
  to: string | string[],
  params: Parameters<typeof emailTemplates[T]>[0]
): Promise<EmailResponse> {
  const { subject, html, text } = emailTemplates[template](params as any);
  
  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}
