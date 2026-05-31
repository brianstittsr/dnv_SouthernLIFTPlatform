// Demo email service - simulates sending emails without actual email service integration
// For development and testing purposes

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendWelcomeEmail(email: string, username: string, tempPassword: string, userId: string) {
  // In demo mode, we'll just log the email details instead of actually sending
  console.log('=== DEMO EMAIL SENT ===');
  console.log('To:', email);
  console.log('Subject: Welcome to KDM Consortium - Your Account is Ready');
  console.log('Username:', username);
  console.log('Temporary Password:', tempPassword);
  console.log('User ID:', userId);
  console.log('========================');

  // In production, this would use SendGrid, Resend, or another email service
  const emailContent = {
    to: email,
    subject: 'Welcome to KDM Consortium - Your Account is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to KDM Consortium</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account is ready for government contracting success</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Get Started with Your Demo Account</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">Your Login Details</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Username:</strong> <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">${username}</code></p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">${tempPassword}</code></p>
            <p style="margin: 10px 0; color: #666; font-size: 14px;">
              ⚠️ Your temporary password expires in 48 hours. Please change it after your first login.
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">Next Steps</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Login with your temporary password</li>
              <li style="margin-bottom: 10px;">Complete your business profile wizard</li>
              <li style="margin-bottom: 10px;">Add your NAICS codes and certifications</li>
              <li style="margin-bottom: 10px;">Start receiving AI-matched opportunities</li>
              <li style="margin-bottom: 10px;">Explore teaming partner recommendations</li>
              <li>Test the proposal generation workflow</li>
            </ol>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #28a745; margin-top: 0;">Demo Features</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 5px;">✅ Full platform access for 30 days</li>
              <li style="margin-bottom: 5px;">✅ AI-powered opportunity matching</li>
              <li style="margin-bottom: 5px;">✅ Teaming partner recommendations</li>
              <li style="margin-bottom: 5px;">✅ Simulated proposal generation</li>
              <li>✅ No actual charges or commitments</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?demo=true" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Login to Your Demo Account
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">Questions? Contact us at <a href="mailto:support@kdm-assoc.com" style="color: #667eea;">support@kdm-assoc.com</a></p>
          <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
            © 2026 KDM & Associates. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  // Store email in demo collection for testing
  try {
    const { db } = await import('./firebase-admin');
    await db.collection('demoEmails').add({
      ...emailContent,
      sentAt: new Date(),
      tempPassword,
      userId
    });
    console.log('Email stored in demo collection');
  } catch (error) {
    console.log('Could not store email (Firebase not available in demo mode)');
  }

  return emailContent;
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
