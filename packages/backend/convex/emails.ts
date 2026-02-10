import { components, internal } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import QRCode from "qrcode";

const resend = new Resend(components.resend, {
  testMode: process.env.NODE_ENV !== "production",
});

/**
 * Send confirmation email with QR code after successful payment
 */
export const sendRegistrationConfirmationEmail = internalMutation({
  args: {
    registrationId: v.id("registrations"),
    qrCodeData: v.string(),
  },
  handler: async (ctx, args) => {
    // Get registration details
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }
    
    // Get related data
    const vehicle = await ctx.db.get(registration.vehicleId);
    const event = await ctx.db.get(registration.eventId);
    const user = await ctx.db.get(registration.userId);
    
    if (!((vehicle && event ) && user)) {
      throw new Error("Missing registration data");
    }
    
    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(args.qrCodeData, {
      width: 300,
      margin: 2,
    });
    
    // Format event date
    const eventDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    
    // Format price
    const price = (event.vendorPrice / 100).toFixed(2);
    
    // Create email HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Registration Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Registration Confirmed!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${user.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Your vehicle registration for <strong>${event.name}</strong> has been confirmed!</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Event Details</h2>
              <p style="margin: 8px 0;"><strong>Event:</strong> ${event.name}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${eventDate}</p>
              <p style="margin: 8px 0;"><strong>Location:</strong> ${event.location}</p>
              <p style="margin: 8px 0;"><strong>Address:</strong> ${event.address}</p>
              <p style="margin: 8px 0;"><strong>Vehicle:</strong> ${vehicle.year} ${vehicle.make} ${vehicle.model}</p>
              <p style="margin: 8px 0;"><strong>Registration Fee:</strong> $${price}</p>
            </div>
            
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #667eea;">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Your Check-in QR Code</h2>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                Please present this QR code at the event for check-in
              </p>
              <img src="${qrCodeImage}" alt="QR Code" style="max-width: 300px; width: 100%; height: auto; border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px; background: white; margin: 0 auto; display: block;" />
              <p style="color: #6b7280; font-size: 12px; margin-top: 15px; word-break: break-all;">
                Code: ${args.qrCodeData}
              </p>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Important:</strong> Please arrive at least 30 minutes before the event starts. 
                Have your QR code ready for check-in. If you have any questions, please contact us.
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">
              We look forward to seeing you at the event!
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Best regards,<br>
              The Gearboxe Market Team
            </p>
          </div>
        </body>
      </html>
    `;
    
    // Send email
    await resend.sendEmail(ctx, {
      from: process.env.RESEND_FROM_EMAIL || "noreply@gearboxe.com",
      to: user.email,
      subject: `Event Registration Confirmation - ${event.name}`,
      html,
    });
  },
});

/**
 * Resend confirmation email (for users who lost their email)
 */
export const resendConfirmationEmail = internalMutation({
  args: {
    registrationId: v.id("registrations"),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!(registration && registration.qrCodeData)) {
      throw new Error("Registration not found or QR code not generated");
    }
    
    if (registration.paymentStatus !== "completed") {
      throw new Error("Cannot resend email for unpaid registration");
    }
    
    await ctx.scheduler.runAfter(
      0,
      internal.emails.sendRegistrationConfirmationEmail,
      {
        registrationId: args.registrationId,
        qrCodeData: registration.qrCodeData,
      }
    );
  },
});
