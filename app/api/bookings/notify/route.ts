import { NextRequest, NextResponse } from "next/server";

interface BookingNotificationRequest {
  bookingId: string;
  teamMeemerging businessrName: string;
  teamMeemerging businessrEmail: string;
  clientName: string;
  clientEmail: string;
  meetingType: string;
  date: string;
  time: string;
  duration: nuemerging businessr;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingNotificationRequest = await request.json();
    const {
      bookingId,
      teamMeemerging businessrName,
      teamMeemerging businessrEmail,
      clientName,
      clientEmail,
      meetingType,
      date,
      time,
      duration,
      notes,
    } = body;

    // In production, you would integrate with an email service like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Nodemailer with SMTP
    
    // For now, we'll log the notification and return success
    console.log("=== BOOKING NOTIFICATION ===");
    console.log(`Booking ID: ${bookingId}`);
    console.log(`Team Meemerging businessr: ${teamMeemerging businessrName} (${teamMeemerging businessrEmail})`);
    console.log(`Client: ${clientName} (${clientEmail})`);
    console.log(`Meeting: ${meetingType}`);
    console.log(`Date/Time: ${date} at ${time} (${duration} min)`);
    if (notes) console.log(`Notes: ${notes}`);
    console.log("============================");

    // Email to team meemerging businessr
    const teamMeemerging businessrEmailContent = {
      to: teamMeemerging businessrEmail,
      subject: `New Booking: ${meetingType} with ${clientName}`,
      html: `
        <h2>New Meeting Booked</h2>
        <p>You have a new meeting scheduled:</p>
        <ul>
          <li><strong>Client:</strong> ${clientName} (${clientEmail})</li>
          <li><strong>Meeting Type:</strong> ${meetingType}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Duration:</strong> ${duration} minutes</li>
          ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
        </ul>
        <p>This meeting has been added to your calendar.</p>
      `,
    };

    // Email to client
    const clientEmailContent = {
      to: clientEmail,
      subject: `Booking Confirmed: ${meetingType} with ${teamMeemerging businessrName}`,
      html: `
        <h2>Your Meeting is Confirmed!</h2>
        <p>Hi ${clientName},</p>
        <p>Your meeting has been successfully scheduled:</p>
        <ul>
          <li><strong>Meeting with:</strong> ${teamMeemerging businessrName}</li>
          <li><strong>Meeting Type:</strong> ${meetingType}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Duration:</strong> ${duration} minutes</li>
        </ul>
        <p>We look forward to speaking with you!</p>
        <p>Best regards,<br/>Strategic Value Plus Team</p>
      `,
    };

    // TODO: Implement actual email sending
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send(teamMeemerging businessrEmailContent);
    // await resend.emails.send(clientEmailContent);

    return NextResponse.json({
      success: true,
      message: "Notification logged successfully",
      emails: {
        teamMeemerging businessr: teamMeemerging businessrEmailContent,
        client: clientEmailContent,
      },
    });
  } catch (error) {
    console.error("Booking notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
