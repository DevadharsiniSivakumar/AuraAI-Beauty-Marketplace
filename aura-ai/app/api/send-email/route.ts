import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { customerName, bookingId, salonName, serviceName, date, time, bookingStatus, userEmail } = await req.json();

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn("EMAIL_USER or EMAIL_PASS environment variables are not set. Skipping real email send.");
      return NextResponse.json({ success: false, message: "Credentials not configured" }, { status: 400 });
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass, // Gmail 16-character App Password
      },
    });

    // Email content in HTML matching the mockup
    const mailOptions = {
      from: `"Aura" <${emailUser}>`,
      to: userEmail || emailUser, // Send to customer email, or fallback to the sender
      subject: 'Your Aura Appointment is Confirmed ✨',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfaf8; padding: 40px 20px; color: #171127; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f3e8ff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(136, 19, 55, 0.03); text-align: left;">
            
            <!-- Header Logo -->
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 14px; font-weight: 300; letter-spacing: 0.15em; color: #716b8c; text-transform: uppercase;">A U R A</span>
              <div style="height: 1px; background-color: #e9d5ff; width: 60px; margin: 8px auto 0;"></div>
            </div>

            <!-- Greeting -->
            <div style="margin-bottom: 24px; text-align: left;">
              <h2 style="font-size: 18px; font-weight: 700; color: #171127; margin: 0 0 12px; font-family: Georgia, serif;">Appointment Confirmed</h2>
              <p style="font-size: 13px; color: #544e6f; line-height: 1.6; margin: 0 0 8px;">Hello ${customerName},</p>
              <p style="font-size: 13px; color: #544e6f; line-height: 1.6; margin: 0;">
                Thank you for choosing Aura. Your beauty appointment has been successfully scheduled. Here are the confirmation specifications for your reference:
              </p>
            </div>

            <!-- Specs Box -->
            <div style="background-color: #fdfaf8; border: 1px solid #f4f3f6; border-radius: 12px; padding: 16px; font-size: 13px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f4f3f6;">
                  <td style="padding: 8px 0; color: #9893af;">Booking ID</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; font-family: monospace;">${bookingId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f4f3f6;">
                  <td style="padding: 8px 0; color: #9893af;">Salon Destination</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${salonName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f4f3f6;">
                  <td style="padding: 8px 0; color: #9893af;">Selected Treatment</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${serviceName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f4f3f6;">
                  <td style="padding: 8px 0; color: #9893af;">Appointment Date</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${date}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f4f3f6;">
                  <td style="padding: 8px 0; color: #9893af;">Appointment Time</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #9893af; font-weight: bold;">Booking Status</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10b981;">Confirmed</td>
                </tr>
              </table>
            </div>

            <!-- Sign-off -->
            <div style="font-size: 13px; color: #544e6f; line-height: 1.6; text-align: left; border-top: 1px solid #f4f3f6; padding-top: 16px;">
              <p style="margin: 0 0 12px;">We look forward to helping you look and feel your best.</p>
              <p style="margin: 0;">Warmly,</p>
              <p style="margin: 0; font-weight: 700; color: #171127;">The Aura Team</p>
              <p style="margin: 0; font-size: 11px; color: #9893af;">Aura Technologies</p>
            </div>

          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
