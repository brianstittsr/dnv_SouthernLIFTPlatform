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
 * Priority: Resend > SendGrid > Microsoft Graph API > Azure SMTP
 */
function getEmailProvider(): EmailProvider {
  // Resend (preferred - most reliable for transactional emails)
  if (process.env.RESEND_API_KEY) {
    return 'resend';
  }
  // SendGrid
  else if (process.env.SENDGRID_API_KEY) {
    return 'sendgrid';
  }
  // Microsoft Graph API (Office 365)
  else if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
    return 'ms_graph';
  }
  // Azure SMTP (fallback - supports both OAuth and basic auth)
  // Note: For Office 365 accounts, use smtp.office365.com instead of smtp.azurecomm.net
  else if (process.env.AZURE_SMTP_HOST || process.env.AZURE_SMTP_USERNAME) {
    return 'azure_smtp';
  }
  throw new Error('No email service configured. Set RESEND_API_KEY, SENDGRID_API_KEY, AZURE_CLIENT_ID/AZURE_CLIENT_SECRET/AZURE_TENANT_ID for Microsoft Graph, or AZURE_SMTP_HOST/AZURE_SMTP_USERNAME for Azure SMTP');
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

    if (!smtpUsername || !smtpPassword) {
      return {
        success: false,
        error: 'SMTP credentials not configured. Set AZURE_SMTP_USERNAME and AZURE_SMTP_PASSWORD in .env.local',
      };
    }

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
      } as any);
    } else {
      // Fall back to basic auth
      console.log('Using basic authentication for SMTP');
      console.log(`SMTP Host: ${smtpHost}, Port: ${smtpPort}, Secure: ${smtpSecure}`);
      console.log(`Username: ${smtpUsername ? smtpUsername.substring(0, 5) + '...' : 'NOT SET'}`);
      
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUsername,
          pass: smtpPassword,
        },
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2',
        },
        connectionUrl: `smtp://${smtpUsername}:${smtpPassword}@${smtpHost}:${smtpPort}`,
      } as any);
    }

    // Verify connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError: any) {
      console.warn('SMTP verification warning:', verifyError.message);
      // Continue anyway - some SMTP servers don't support verify
    }

    const from = params.from || getDefaultFrom();
    
    // Prepare recipients
    const toRecipients = Array.isArray(params.to) ? params.to.join(', ') : params.to;
    const ccRecipients = params.cc ? params.cc.join(', ') : undefined;
    const bccRecipients = params.bcc ? params.bcc.join(', ') : undefined;

    console.log(`Sending email to: ${toRecipients}, from: ${from.email}`);

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

    console.log(`Email sent successfully. Message ID: ${info.messageId}`);

    // Close the connection
    try {
      await transporter.close();
    } catch (closeError) {
      console.warn('Warning closing SMTP connection:', closeError);
    }

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
 * Send email using Resend API
 */
async function sendWithResend(params: EmailParams): Promise<EmailResponse> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      return {
        success: false,
        error: 'Resend API key not configured. Set RESEND_API_KEY in .env.local',
      };
    }

    const from = params.from || getDefaultFrom();
    const toRecipients = Array.isArray(params.to) ? params.to : [params.to];

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${from.name} <${from.email}>`,
        to: toRecipients,
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`Email sent successfully via Resend. Message ID: ${data.id}`);

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error: any) {
    console.error('Resend API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email via Resend',
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

  /**
   * Founders payment notification for administrators
   */
  foundersPaymentNotification: (params: { 
    customerName: string; 
    customerEmail: string; 
    amount: number; 
    sessionId: string; 
    paymentDate: string; 
    type: string; 
  }) => ({
    subject: `Founders Membership Payment Received - ${params.customerName}`,
    html: `
      <h1>Founders Membership Payment Received</h1>
      <p>A new Founders membership payment has been successfully processed:</p>
      <ul>
        <li><strong>Customer:</strong> ${params.customerName}</li>
        <li><strong>Email:</strong> ${params.customerEmail}</li>
        <li><strong>Amount:</strong> $${params.amount.toFixed(2)}</li>
        <li><strong>Type:</strong> ${params.type}</li>
        <li><strong>Date:</strong> ${params.paymentDate}</li>
        <li><strong>Session ID:</strong> ${params.sessionId}</li>
      </ul>
      <p>This member has joined the KDM Founders program with a one-time payment of $${params.amount.toFixed(2)}.</p>
      <p>Best regards,<br>KDM Consortium System</p>
    `,
    text: `Founders Membership Payment Received: ${params.customerName} (${params.customerEmail}) - $${params.amount.toFixed(2)} on ${params.paymentDate}. Session: ${params.sessionId}`,
  }),

  /**
   * Founders payment confirmation for customers
   */
  foundersPaymentConfirmation: (params: { 
    customerName: string; 
    amount: number; 
    paymentDate: string; 
    type: string; 
  }) => ({
    subject: 'Welcome to KDM Founders - Payment Confirmed',
    html: `
      <h1>Welcome to KDM Founders!</h1>
      <p>Dear ${params.customerName},</p>
      <p>Thank you for your payment and welcome to the KDM Founders program! Your smart business decision to join as a Founding member has been successfully processed.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Payment Details</h3>
        <ul>
          <li><strong>Membership Type:</strong> ${params.type}</li>
          <li><strong>Amount Paid:</strong> $${params.amount.toFixed(2)}</li>
          <li><strong>Payment Date:</strong> ${params.paymentDate}</li>
        </ul>
      </div>
      <p>Your one-time payment of $${params.amount.toFixed(2)} gives you Founding member status and allows us to focus on higher ground to capitalize on opportunities through September 30th.</p>
      <p>As a Founding member, you'll have access to exclusive benefits and opportunities within the KDM Consortium ecosystem.</p>
      <p>If you have any questions, please don't hesitate to reach out to our team.</p>
      <p>Best regards,<br>Keith Moore and the KDM Consortium Team</p>
    `,
    text: `Welcome to KDM Founders! Your payment of $${params.amount.toFixed(2)} for ${params.type} has been confirmed on ${params.paymentDate}. Thank you for your smart business decision to join as a Founding member.`,
  }),

  /**
   * CMMC training payment notification for administrators
   */
  cmmcTrainingPaymentNotification: (params: { 
    customerName: string; 
    customerEmail: string; 
    trainingLevel: string; 
    amount: number; 
    sessionId: string; 
    paymentDate: string; 
    companyInfo: string; 
  }) => ({
    subject: `CMMC Training Payment Received - ${params.customerName}`,
    html: `
      <h1>CMMC Training Payment Received</h1>
      <p>A new CMMC training payment has been successfully processed:</p>
      <ul>
        <li><strong>Customer:</strong> ${params.customerName}</li>
        <li><strong>Email:</strong> ${params.customerEmail}</li>
        <li><strong>Training Level:</strong> ${params.trainingLevel}</li>
        <li><strong>Amount:</strong> $${params.amount.toFixed(2)}</li>
        <li><strong>Company:</strong> ${params.companyInfo}</li>
        <li><strong>Date:</strong> ${params.paymentDate}</li>
        <li><strong>Session ID:</strong> ${params.sessionId}</li>
      </ul>
      <p>This participant has enrolled in the CMMC ${params.trainingLevel} training program.</p>
      <p>Best regards,<br>KDM Consortium System</p>
    `,
    text: `CMMC Training Payment Received: ${params.customerName} (${params.customerEmail}) - ${params.trainingLevel} - $${params.amount.toFixed(2)} on ${params.paymentDate}. Company: ${params.companyInfo}. Session: ${params.sessionId}`,
  }),

  /**
   * CMMC training confirmation for customers
   */
  cmmcTrainingConfirmation: (params: { 
    customerName: string; 
    trainingLevel: string; 
    amount: number; 
    paymentDate: string; 
    companyInfo: string; 
  }) => ({
    subject: 'CMMC Training Enrollment Confirmed',
    html: `
      <h1>CMMC Training Enrollment Confirmed!</h1>
      <p>Dear ${params.customerName},</p>
      <p>Thank you for your payment and welcome to the CMMC ${params.trainingLevel} training program! Your enrollment has been successfully processed.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Enrollment Details</h3>
        <ul>
          <li><strong>Training Level:</strong> ${params.trainingLevel} CMMC Cohort Training</li>
          <li><strong>Amount Paid:</strong> $${params.amount.toFixed(2)}</li>
          <li><strong>Payment Date:</strong> ${params.paymentDate}</li>
          <li><strong>Company:</strong> ${params.companyInfo}</li>
        </ul>
      </div>
      <p>Your payment of $${params.amount.toFixed(2)} secures your place in our comprehensive CMMC training program. You will receive separate communication with training schedule, materials, and access information.</p>
      <p>As a CMMC training participant, you'll gain valuable expertise in cybersecurity maturity model certification, positioning your organization for government contracting opportunities.</p>
      <p>If you have any questions about the training program, please don't hesitate to reach out to our team.</p>
      <p>Best regards,<br>Keith Moore and the KDM Consortium Team</p>
    `,
    text: `CMMC Training Enrollment Confirmed! Your payment of $${params.amount.toFixed(2)} for ${params.trainingLevel} CMMC training has been confirmed on ${params.paymentDate}. Company: ${params.companyInfo}. You will receive training schedule and access information shortly.`,
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
