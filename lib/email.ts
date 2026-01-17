/**
 * Email Service for KDM Consortium Platform
 * 
 * Supports both SendGrid and Resend email providers
 * Handles transactional emails, notifications, and marketing campaigns
 */

type EmailProvider = 'sendgrid' | 'resend';

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
 */
function getEmailProvider(): EmailProvider {
  if (process.env.SENDGRID_API_KEY) {
    return 'sendgrid';
  } else if (process.env.RESEND_API_KEY) {
    return 'resend';
  }
  throw new Error('No email service configured. Set either SENDGRID_API_KEY or RESEND_API_KEY');
}

/**
 * Get default from address based on provider
 */
function getDefaultFrom(): { email: string; name: string } {
  const provider = getEmailProvider();
  
  if (provider === 'sendgrid') {
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
  
  if (provider === 'sendgrid') {
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
   * Membership renewal reminder
   */
  membershipRenewal: (params: { 
    name: string; 
    renewalDate: string;
    amount: number;
    updatePaymentUrl: string;
  }) => ({
    subject: 'Membership Renewal Reminder',
    html: `
      <h1>Membership Renewal</h1>
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
