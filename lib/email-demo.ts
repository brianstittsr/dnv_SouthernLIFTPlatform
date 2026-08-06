import { Resend } from 'resend';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const CC_EMAILS = ['bstitt@strategicvalueplus.com', 'kmoore@kdm-assoc.com'];
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@kdm-assoc.com';

function getResend(): Resend | null {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

export async function sendWelcomeEmail(email: string, username: string, tempPassword: string, userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const loginUrl = `${baseUrl}/sign-in`;

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #c9a227 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 26px;">Welcome to KDM Consortium</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account is ready for government contracting success</p>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #92400e; margin-top: 0;">Your Login Credentials</h3>
          <p style="margin: 6px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 6px 0;"><strong>Username:</strong> <code style="background: #fef3c7; padding: 2px 6px; border-radius: 4px;">${username}</code></p>
          <p style="margin: 6px 0;"><strong>Temporary Password:</strong> <code style="background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-size: 15px;">${tempPassword}</code></p>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #92400e;">
            ⚠️ This is a temporary password. You will be prompted to create a permanent password after your first login.
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e3a5f; margin-top: 0;">Next Steps</h3>
          <ol style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Log in with your temporary password</li>
            <li style="margin-bottom: 10px;">Complete your business profile</li>
            <li style="margin-bottom: 10px;">Add your NAICS codes and certifications</li>
            <li style="margin-bottom: 10px;">Start receiving AI-matched opportunities</li>
            <li style="margin-bottom: 10px;">Explore teaming partner recommendations</li>
            <li>Join our weekly Friday 3pm consortium meetings</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background: #c9a227; color: #1e3a5f; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
            Log In to Your Portal
          </a>
        </div>
      </div>

      <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="margin: 0; font-size: 14px;">Questions? Contact us at <a href="mailto:kmoore@kdm-assoc.com" style="color: #c9a227;">kmoore@kdm-assoc.com</a></p>
        <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.7;">© 2026 KDM &amp; Associates. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `Welcome to KDM Consortium!

Your Login Credentials:
  Email:              ${email}
  Username:           ${username}
  Temporary Password: ${tempPassword}

This is a temporary password — you will be prompted to create a permanent password on first login.

Log in here: ${loginUrl}

Next Steps:
1. Log in with your temporary password
2. Complete your business profile
3. Add your NAICS codes and certifications
4. Start receiving AI-matched opportunities
5. Join our weekly Friday 3pm consortium meetings

Questions? Contact kmoore@kdm-assoc.com

KDM Consortium | KDM & Associates`;

  const resend = getResend();
  if (resend) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        cc: CC_EMAILS,
        subject: 'Welcome to KDM Consortium — Your Account is Ready',
        html,
        text,
      });
      console.log('Welcome email sent via Resend to', email);
    } catch (error) {
      console.error('Resend failed to send welcome email:', error);
    }
  } else {
    console.warn('RESEND_API_KEY not set — logging welcome email instead of sending');
    console.log('=== WELCOME EMAIL (not sent) ===');
    console.log('To:', email, '| Username:', username, '| Temp Password:', tempPassword, '| User ID:', userId);
    console.log('================================');
  }

  return { to: email, subject: 'Welcome to KDM Consortium — Your Account is Ready', html, text };
}

/**
 * Send onboarding prep email to not-started users.
 * Lists the PDF documents they should prepare before starting onboarding.
 */
export async function sendOnboardingPrepEmail(params: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ to: string; subject: string; html: string; text: string }> {
  const { email, firstName, lastName } = params;
  const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.kdm-assoc.com';
  const onboardingUrl = `${baseUrl}/portal/consortium/onboarding`;
  const displayName = firstName ? `${firstName} ${lastName || ''}`.trim() : 'there';

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #c9a227 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Prepare for Your KDM Onboarding</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Get your documents ready to accelerate the process</p>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <p>Hi ${displayName},</p>
        <p>Your KDM Consortium membership is active and we're excited to get you onboarded! To make the process smooth and fast, please prepare the following documents <strong>in PDF format</strong> before you begin.</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #c9a227;">
          <h3 style="color: #1e3a5f; margin-top: 0;">Documents to Prepare (PDF Format)</h3>
          <ol style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;"><strong>SAM Registration</strong> — Your active SAM.gov registration confirmation</li>
            <li style="margin-bottom: 8px;"><strong>CAGE Code Documentation</strong> — Your CAGE code assignment letter</li>
            <li style="margin-bottom: 8px;"><strong>Capability Statement</strong> — Your one-page company capability statement</li>
            <li style="margin-bottom: 8px;"><strong>Past Performance References</strong> — 3-5 references from prior government or commercial contracts</li>
            <li style="margin-bottom: 8px;"><strong>Certifications</strong> — CMMC, ISO, 8(a), HUBZone, WOSB, SDVOSB, or other relevant certifications</li>
            <li style="margin-bottom: 8px;"><strong>Financial Statements</strong> — Most recent annual financial statements</li>
            <li style="margin-bottom: 8px;"><strong>Insurance Certificates</strong> — Current liability and workers' comp certificates</li>
          </ol>
        </div>

        <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>Tip:</strong> Having all documents ready before starting will significantly speed up your onboarding. The AI-powered platform will use these documents to match you with relevant SAM.gov RFI and RFP opportunities.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${onboardingUrl}" style="background: #c9a227; color: #1e3a5f; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
            Start Your Onboarding
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">Need help or have questions? Contact us at <a href="mailto:kmoore@kdm-assoc.com" style="color: #c9a227;">kmoore@kdm-assoc.com</a></p>
      </div>

      <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="margin: 0; font-size: 14px;">KDM &amp; Associates — Federal Procurement &amp; Industrial Readiness</p>
        <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.7;">© 2026 KDM &amp; Associates. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `Prepare for Your KDM Onboarding

Hi ${displayName},

Your KDM Consortium membership is active! Please prepare the following documents in PDF format before starting onboarding:

1. SAM Registration
2. CAGE Code Documentation
3. Capability Statement
4. Past Performance References (3-5)
5. Certifications (CMMC, ISO, 8(a), HUBZone, WOSB, SDVOSB)
6. Financial Statements
7. Insurance Certificates

Start your onboarding: ${onboardingUrl}

Questions? Contact kmoore@kdm-assoc.com

KDM & Associates`;

  const resend = getResend();
  if (resend) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        cc: CC_EMAILS,
        subject: 'Prepare for Your KDM Onboarding — Documents to Gather',
        html,
        text,
      });
      console.log('Onboarding prep email sent via Resend to', email);
    } catch (error) {
      console.error('Resend failed to send onboarding prep email:', error);
    }
  } else {
    console.warn('RESEND_API_KEY not set — logging onboarding prep email instead of sending');
    console.log('=== ONBOARDING PREP EMAIL (not sent) ===');
    console.log('To:', email);
    console.log('======================================');
  }

  return { to: email, subject: 'Prepare for Your KDM Onboarding — Documents to Gather', html, text };
}

export async function sendDemoNotification(email: string, subject: string, message: string) {
  console.log('=== DEMO NOTIFICATION ===');
  console.log('To:', email);
  console.log('Subject:', subject);
  console.log('Message:', message);
  console.log('========================');

  return {
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #667eea; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">KDM Consortium Demo</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>${subject}</h2>
          <p>${message}</p>
        </div>
      </div>
    `
  };
}

// Demo email templates for different scenarios
export const demoEmailTemplates = {
  opportunityMatch: (email: string, opportunities: any[]) => ({
    to: email,
    subject: 'New Government Opportunities Matched to Your Profile',
    html: `
      <h2>New Opportunities Found</h2>
      <p>We found ${opportunities.length} opportunities matching your NAICS codes:</p>
      <ul>
        ${opportunities.map(opp => `<li><strong>${opp.title}</strong> - ${opp.agency}</li>`).join('')}
      </ul>
      <p>Login to your dashboard to view and respond to these opportunities.</p>
    `
  }),

  teamingRecommendation: (email: string, partners: any[]) => ({
    to: email,
    subject: 'Teaming Partners Recommended for Your Opportunities',
    html: `
      <h2>Teaming Partners Found</h2>
      <p>We found ${partners.length} potential teaming partners for your selected opportunities:</p>
      <ul>
        ${partners.map(partner => `<li><strong>${partner.companyName}</strong> - ${partner.sharedCapabilities.length} shared capabilities</li>`).join('')}
      </ul>
      <p>Review their profiles and select partners for your proposal team.</p>
    `
  }),

  proposalReady: (email: string, proposalTitle: string) => ({
    to: email,
    subject: `Your Proposal "${proposalTitle}" is Ready`,
    html: `
      <h2>Proposal Generated Successfully</h2>
      <p>Your professional proposal has been generated and is ready for download.</p>
      <p><strong>Title:</strong> ${proposalTitle}</p>
      <p>Login to your dashboard to download the proposal and submit it.</p>
    `
  })
};
